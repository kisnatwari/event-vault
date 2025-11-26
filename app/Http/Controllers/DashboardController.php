<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\Device;
use App\Models\Event;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        // Overall statistics
        $totalEvents = Event::count();
        $totalClients = Client::count();
        $totalDevices = Device::count();
        
        // Today's statistics
        $today = Carbon::today();
        $todayEvents = Event::whereDate('created_at', $today)->count();
        $todayUniqueCheckIns = Event::whereDate('created_at', $today)
            ->whereNotNull('employee_no_string')
            ->select('employee_no_string')
            ->distinct()
            ->count();
        
        // Last 7 days events count
        $last7Days = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::today()->subDays($i);
            $count = Event::whereDate('created_at', $date)->count();
            $last7Days[] = [
                'date' => $date->format('M d'),
                'day' => $date->format('D'),
                'count' => $count,
            ];
        }
        
        // Last 30 days events count (for monthly chart)
        $last30Days = [];
        for ($i = 29; $i >= 0; $i--) {
            $date = Carbon::today()->subDays($i);
            $count = Event::whereDate('created_at', $date)->count();
            $last30Days[] = [
                'date' => $date->format('M d'),
                'count' => $count,
            ];
        }
        
        // Events by client (top 5)
        $eventsByClient = Client::withCount('devices')
            ->with(['devices' => function ($query) {
                $query->withCount('events');
            }])
            ->get()
            ->map(function ($client) {
                $totalEvents = $client->devices->sum('events_count');
                return [
                    'id' => $client->id,
                    'name' => $client->name,
                    'device_count' => $client->devices_count,
                    'event_count' => $totalEvents,
                ];
            })
            ->sortByDesc('event_count')
            ->take(5)
            ->values();
        
        // Events by device (top 5)
        $eventsByDevice = Device::with('client')
            ->withCount('events')
            ->orderBy('events_count', 'desc')
            ->take(5)
            ->get()
            ->map(function ($device) {
                return [
                    'id' => $device->id,
                    'name' => $device->name,
                    'mac_address' => $device->mac_address,
                    'client_name' => $device->client->name ?? 'Unknown',
                    'event_count' => $device->events_count,
                ];
            });
        
        // Recent events (last 10)
        $recentEvents = Event::with(['device.client'])
            ->orderBy('created_at', 'desc')
            ->take(10)
            ->get()
            ->map(function ($event) {
                return [
                    'id' => $event->id,
                    'name' => $event->name,
                    'employee_no_string' => $event->employee_no_string,
                    'event_datetime' => $event->event_datetime,
                    'formatted_date' => $event->formatted_date,
                    'formatted_time' => $event->formatted_time,
                    'time_ago' => $event->time_ago,
                    'device_name' => $event->device->name ?? 'Unknown',
                    'client_name' => $event->device->client->name ?? 'Unknown',
                    'event_type' => $event->event_type,
                ];
            });
        
        // Events by hour (last 24 hours)
        $eventsByHour = [];
        for ($i = 23; $i >= 0; $i--) {
            $hour = Carbon::now()->subHours($i);
            $count = Event::whereBetween('created_at', [
                $hour->copy()->startOfHour(),
                $hour->copy()->endOfHour(),
            ])->count();
            $eventsByHour[] = [
                'hour' => $hour->format('H:00'),
                'label' => $hour->format('g A'),
                'count' => $count,
            ];
        }
        
        // Events by day of week (last 7 days)
        $eventsByDayOfWeek = [];
        $dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::today()->subDays($i);
            $count = Event::whereDate('created_at', $date)->count();
            $eventsByDayOfWeek[] = [
                'day' => $dayNames[$date->dayOfWeek],
                'short' => $date->format('D'),
                'count' => $count,
            ];
        }
        
        // Growth metrics (this week vs last week)
        $thisWeekStart = Carbon::now()->startOfWeek();
        $thisWeekEnd = Carbon::now()->endOfWeek();
        $lastWeekStart = Carbon::now()->subWeek()->startOfWeek();
        $lastWeekEnd = Carbon::now()->subWeek()->endOfWeek();
        
        $thisWeekEvents = Event::whereBetween('created_at', [$thisWeekStart, $thisWeekEnd])->count();
        $lastWeekEvents = Event::whereBetween('created_at', [$lastWeekStart, $lastWeekEnd])->count();
        
        $weekGrowth = $lastWeekEvents > 0 
            ? round((($thisWeekEvents - $lastWeekEvents) / $lastWeekEvents) * 100, 1)
            : ($thisWeekEvents > 0 ? 100 : 0);
        
        // This month vs last month
        $thisMonthStart = Carbon::now()->startOfMonth();
        $thisMonthEnd = Carbon::now()->endOfMonth();
        $lastMonthStart = Carbon::now()->subMonth()->startOfMonth();
        $lastMonthEnd = Carbon::now()->subMonth()->endOfMonth();
        
        $thisMonthEvents = Event::whereBetween('created_at', [$thisMonthStart, $thisMonthEnd])->count();
        $lastMonthEvents = Event::whereBetween('created_at', [$lastMonthStart, $lastMonthEnd])->count();
        
        $monthGrowth = $lastMonthEvents > 0 
            ? round((($thisMonthEvents - $lastMonthEvents) / $lastMonthEvents) * 100, 1)
            : ($thisMonthEvents > 0 ? 100 : 0);
        
        return Inertia::render('dashboard', [
            'stats' => [
                'totalEvents' => $totalEvents,
                'totalClients' => $totalClients,
                'totalDevices' => $totalDevices,
                'todayEvents' => $todayEvents,
                'todayUniqueCheckIns' => $todayUniqueCheckIns,
                'weekGrowth' => $weekGrowth,
                'monthGrowth' => $monthGrowth,
            ],
            'charts' => [
                'last7Days' => $last7Days,
                'last30Days' => $last30Days,
                'eventsByHour' => $eventsByHour,
                'eventsByDayOfWeek' => $eventsByDayOfWeek,
            ],
            'topClients' => $eventsByClient,
            'topDevices' => $eventsByDevice,
            'recentEvents' => $recentEvents,
        ]);
    }
}
