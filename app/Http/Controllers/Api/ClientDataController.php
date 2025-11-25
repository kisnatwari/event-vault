<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ClientDataController extends Controller
{
    /**
     * Get events for the authenticated client with advanced filtering.
     */
    public function getEvents(Request $request): JsonResponse
    {
        $clientId = $request->get('authenticated_client_id');

        if (!$clientId) {
            return response()->json([
                'error' => 'Unauthorized',
                'message' => 'Client not authenticated',
            ], 401);
        }

        // Get device IDs for this client
        $deviceIds = \App\Models\Device::where('client_id', $clientId)->pluck('id');

        if ($deviceIds->isEmpty()) {
            return response()->json([
                'data' => [],
                'meta' => [
                    'current_page' => 1,
                    'per_page' => (int) $request->get('per_page', 50),
                    'total' => 0,
                    'last_page' => 1,
                    'from' => null,
                    'to' => null,
                ],
                'links' => [
                    'first' => null,
                    'last' => null,
                    'prev' => null,
                    'next' => null,
                ],
            ]);
        }

        // Build query - only events for this client's devices
        $query = Event::with(['device', 'device.client'])
            ->whereIn('device_id', $deviceIds);

        // Advanced filtering
        $this->applyEventFilters($query, $request);

        // Sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $allowedSortFields = [
            'created_at', 'event_datetime', 'name', 'employee_no_string',
            'event_type', 'current_verify_mode', 'ip_address', 'device_id',
        ];
        
        if (in_array($sortBy, $allowedSortFields)) {
            $query->orderBy($sortBy, $sortOrder);
        } else {
            $query->orderBy('created_at', 'desc');
        }

        // Pagination
        $perPage = min((int) ($request->get('per_page', 50)), 200); // Max 200 per page
        $events = $query->paginate($perPage);

        return response()->json([
            'data' => $events->items(),
            'meta' => [
                'current_page' => $events->currentPage(),
                'per_page' => $events->perPage(),
                'total' => $events->total(),
                'last_page' => $events->lastPage(),
                'from' => $events->firstItem(),
                'to' => $events->lastItem(),
            ],
            'links' => [
                'first' => $events->url(1),
                'last' => $events->url($events->lastPage()),
                'prev' => $events->previousPageUrl(),
                'next' => $events->nextPageUrl(),
            ],
        ]);
    }

    /**
     * Get daily attendance (unique entries per day) for the authenticated client.
     * Returns the first entry per employee per day.
     */
    public function getDailyAttendance(Request $request): JsonResponse
    {
        $clientId = $request->get('authenticated_client_id');

        if (!$clientId) {
            return response()->json([
                'error' => 'Unauthorized',
                'message' => 'Client not authenticated',
            ], 401);
        }

        // Get device IDs for this client
        $deviceIds = \App\Models\Device::where('client_id', $clientId)->pluck('id');

        if ($deviceIds->isEmpty()) {
            return response()->json([
                'data' => [],
                'meta' => [
                    'current_page' => 1,
                    'per_page' => (int) $request->get('per_page', 50),
                    'total' => 0,
                    'last_page' => 1,
                    'from' => null,
                    'to' => null,
                ],
                'links' => [
                    'first' => null,
                    'last' => null,
                    'prev' => null,
                    'next' => null,
                ],
            ]);
        }

        // Build base query for filtering
        $baseQuery = Event::whereIn('device_id', $deviceIds);

        // Apply filters to base query
        $this->applyEventFilters($baseQuery, $request);

        // Get date range for attendance
        // Start date: beginning of the day (00:00:00)
        // End date: end of the day (23:59:59)
        $dateFrom = $request->get('date_from', now()->subDays(30)->format('Y-m-d'));
        $dateTo = $request->get('date_to', now()->format('Y-m-d'));

        // Extract date from event_datetime (ISO 8601 format: 2025-11-23T16:31:03+05:45)
        // We'll use a database-agnostic approach to get the first entry per employee per day
        $connection = DB::connection()->getDriverName();
        
        if ($connection === 'sqlite') {
            // SQLite: Extract first 10 characters (YYYY-MM-DD) before 'T'
            $dateExpression = "substr(event_datetime, 1, 10)";
        } else {
            // MySQL: Use SUBSTRING_INDEX
            $dateExpression = "SUBSTRING_INDEX(event_datetime, 'T', 1)";
        }
        
        $subquery = DB::table('events')
            ->select([
                'employee_no_string',
                DB::raw("{$dateExpression} as attendance_date"),
                DB::raw('MIN(id) as first_event_id'),
            ])
            ->whereIn('device_id', $deviceIds)
            ->whereNotNull('employee_no_string')
            ->whereNotNull('event_datetime')
            // Start date: >= beginning of date_from (00:00:00)
            ->whereRaw("{$dateExpression} >= ?", [$dateFrom])
            // End date: <= end of date_to (23:59:59)
            ->whereRaw("{$dateExpression} <= ?", [$dateTo])
            ->groupBy('employee_no_string', DB::raw($dateExpression));

        // Apply additional filters to subquery if needed
        if ($request->has('device_id')) {
            $subquery->where('device_id', $request->device_id);
        }

        if ($request->has('employee_no_string')) {
            $subquery->where('employee_no_string', $request->employee_no_string);
        }

        if ($request->has('name')) {
            $subquery->where('name', 'like', '%' . $request->name . '%');
        }

        // Get the first event IDs
        $firstEventIds = $subquery->pluck('first_event_id');

        if ($firstEventIds->isEmpty()) {
            return response()->json([
                'data' => [],
                'meta' => [
                    'current_page' => 1,
                    'per_page' => (int) $request->get('per_page', 50),
                    'total' => 0,
                    'last_page' => 1,
                    'from' => null,
                    'to' => null,
                ],
                'links' => [
                    'first' => null,
                    'last' => null,
                    'prev' => null,
                    'next' => null,
                ],
            ]);
        }

        // Get the actual events
        $query = Event::with(['device', 'device.client'])
            ->whereIn('id', $firstEventIds);

        // Sorting
        $sortBy = $request->get('sort_by', 'event_datetime');
        $sortOrder = $request->get('sort_order', 'desc');
        $allowedSortFields = [
            'event_datetime', 'created_at', 'name', 'employee_no_string',
            'event_type', 'device_id',
        ];
        
        if (in_array($sortBy, $allowedSortFields)) {
            $query->orderBy($sortBy, $sortOrder);
        } else {
            $query->orderBy('event_datetime', 'desc');
        }

        // Pagination
        $perPage = min((int) ($request->get('per_page', 50)), 200);
        $events = $query->paginate($perPage);

        // Add attendance_date to each event
        $events->getCollection()->transform(function ($event) {
            if ($event->event_datetime) {
                $dateMatch = preg_match('/^(\d{4}-\d{2}-\d{2})T/', $event->event_datetime, $matches);
                if ($dateMatch) {
                    $event->attendance_date = $matches[1];
                }
            }
            return $event;
        });

        return response()->json([
            'data' => $events->items(),
            'meta' => [
                'current_page' => $events->currentPage(),
                'per_page' => $events->perPage(),
                'total' => $events->total(),
                'last_page' => $events->lastPage(),
                'from' => $events->firstItem(),
                'to' => $events->lastItem(),
            ],
            'links' => [
                'first' => $events->url(1),
                'last' => $events->url($events->lastPage()),
                'prev' => $events->previousPageUrl(),
                'next' => $events->nextPageUrl(),
            ],
        ]);
    }

    /**
     * Apply advanced filters to the query.
     */
    protected function applyEventFilters($query, Request $request): void
    {
        // Device filter
        if ($request->has('device_id')) {
            $deviceId = $request->device_id;
            if (is_array($deviceId)) {
                $query->whereIn('device_id', $deviceId);
            } else {
                $query->where('device_id', $deviceId);
            }
        }

        // Employee filter
        if ($request->has('employee_no_string')) {
            $employeeNo = $request->employee_no_string;
            if (is_array($employeeNo)) {
                $query->whereIn('employee_no_string', $employeeNo);
            } else {
                $query->where('employee_no_string', $employeeNo);
            }
        }

        // Name filter (partial match)
        if ($request->has('name')) {
            $query->where('name', 'like', '%' . $request->name . '%');
        }

        // Event type filter
        if ($request->has('event_type')) {
            $eventType = $request->event_type;
            if (is_array($eventType)) {
                $query->whereIn('event_type', $eventType);
            } else {
                $query->where('event_type', $eventType);
            }
        }

        // Major event type filter
        if ($request->has('major_event_type')) {
            $query->where('major_event_type', $request->major_event_type);
        }

        // Sub event type filter
        if ($request->has('sub_event_type')) {
            $query->where('sub_event_type', $request->sub_event_type);
        }

        // Verify mode filter
        if ($request->has('verify_mode')) {
            $verifyMode = $request->verify_mode;
            if (is_array($verifyMode)) {
                $query->whereIn('current_verify_mode', $verifyMode);
            } else {
                $query->where('current_verify_mode', $verifyMode);
            }
        }

        // Date range filters
        // Since event_datetime is stored as ISO 8601 string (e.g., 2025-11-23T16:31:03+05:45)
        // We extract the date part (YYYY-MM-DD) and compare it
        // Start date: beginning of the day (00:00:00) - includes all events from that date
        // End date: end of the day (23:59:59) - includes all events until that date
        $connection = DB::connection()->getDriverName();
        
        if ($request->has('date_from')) {
            // Start date: >= beginning of date_from (00:00:00)
            $dateFrom = $request->date_from;
            if ($connection === 'sqlite') {
                $query->whereRaw("substr(event_datetime, 1, 10) >= ?", [$dateFrom]);
            } else {
                $query->whereRaw("SUBSTRING(event_datetime, 1, 10) >= ?", [$dateFrom]);
            }
        }

        if ($request->has('date_to')) {
            // End date: <= end of date_to (23:59:59)
            $dateTo = $request->date_to;
            if ($connection === 'sqlite') {
                $query->whereRaw("substr(event_datetime, 1, 10) <= ?", [$dateTo]);
            } else {
                $query->whereRaw("SUBSTRING(event_datetime, 1, 10) <= ?", [$dateTo]);
            }
        }

        // IP address filter
        if ($request->has('ip_address')) {
            $query->where('ip_address', 'like', '%' . $request->ip_address . '%');
        }

        // User type filter
        if ($request->has('user_type')) {
            $query->where('user_type', $request->user_type);
        }

        // Attendance status filter
        if ($request->has('attendance_status')) {
            $query->where('attendance_status', $request->attendance_status);
        }
    }

    /**
     * Get devices for the authenticated client.
     */
    public function getDevices(Request $request): JsonResponse
    {
        $clientId = $request->get('authenticated_client_id');

        if (!$clientId) {
            return response()->json([
                'error' => 'Unauthorized',
                'message' => 'Client not authenticated',
            ], 401);
        }

        $devices = \App\Models\Device::where('client_id', $clientId)
            ->withCount('events')
            ->orderBy('name')
            ->get();

        return response()->json([
            'data' => $devices,
        ]);
    }

    /**
     * Get event statistics for the authenticated client.
     */
    public function getStatistics(Request $request): JsonResponse
    {
        $clientId = $request->get('authenticated_client_id');

        if (!$clientId) {
            return response()->json([
                'error' => 'Unauthorized',
                'message' => 'Client not authenticated',
            ], 401);
        }

        $deviceIds = \App\Models\Device::where('client_id', $clientId)->pluck('id');

        $totalEvents = Event::whereIn('device_id', $deviceIds)->count();
        $todayEvents = Event::whereIn('device_id', $deviceIds)
            ->whereDate('created_at', today())
            ->count();
        $totalDevices = \App\Models\Device::where('client_id', $clientId)->count();

        return response()->json([
            'data' => [
                'total_events' => $totalEvents,
                'today_events' => $todayEvents,
                'total_devices' => $totalDevices,
            ],
        ]);
    }

    /**
     * Get today's check-in statistics for the authenticated client.
     * Returns: total check-ins, unique check-ins, last 10 check-ins, last 10 unique check-ins
     */
    public function getTodayStats(Request $request): JsonResponse
    {
        $clientId = $request->get('authenticated_client_id');

        if (!$clientId) {
            return response()->json([
                'error' => 'Unauthorized',
                'message' => 'Client not authenticated',
            ], 401);
        }

        // Get device IDs for this client
        $deviceIds = \App\Models\Device::where('client_id', $clientId)->pluck('id');

        if ($deviceIds->isEmpty()) {
            return response()->json([
                'data' => [
                    'total_checkins_today' => 0,
                    'total_unique_checkins_today' => 0,
                    'last_10_checkins_today' => [],
                    'last_10_unique_checkins_today' => [],
                ],
            ]);
        }

        // Get today's date in YYYY-MM-DD format
        $today = now()->format('Y-m-d');

        // Database-agnostic date extraction
        $connection = DB::connection()->getDriverName();
        
        if ($connection === 'sqlite') {
            $dateExpression = "substr(event_datetime, 1, 10)";
        } else {
            $dateExpression = "SUBSTRING(event_datetime, 1, 10)";
        }

        // Base query for today's events
        $todayQuery = Event::whereIn('device_id', $deviceIds)
            ->whereRaw("{$dateExpression} = ?", [$today])
            ->orderBy('event_datetime', 'desc');

        // 1. Total check-ins today
        $totalCheckinsToday = (clone $todayQuery)->count();

        // 2. Total unique check-ins today (unique by employee_no_string)
        $uniqueCheckinsToday = (clone $todayQuery)
            ->select('employee_no_string')
            ->distinct()
            ->count('employee_no_string');

        // 3. Last 10 check-ins today
        $last10Checkins = (clone $todayQuery)
            ->with('device')
            ->limit(10)
            ->get()
            ->map(function ($event) {
                return [
                    'id' => $event->id,
                    'employee_no_string' => $event->employee_no_string,
                    'name' => $event->name,
                    'event_datetime' => $event->event_datetime,
                    'formatted_date' => $event->formatted_date,
                    'formatted_time' => $event->formatted_time,
                    'time_ago' => $event->time_ago,
                    'device_name' => $event->device->name ?? null,
                    'event_type' => $event->event_type,
                ];
            });

        // 4. Last 10 unique check-ins today (first check-in per employee today)
        // Get the first event (earliest event_datetime, then earliest id) for each employee today
        // Using a simpler approach: get all employees, then get their first event
        $employeeList = Event::whereIn('device_id', $deviceIds)
            ->whereRaw("{$dateExpression} = ?", [$today])
            ->whereNotNull('employee_no_string')
            ->distinct()
            ->pluck('employee_no_string');

        // For each employee, get their first check-in today (earliest event_datetime, then earliest id)
        $uniqueCheckins = [];
        foreach ($employeeList as $employeeNo) {
            $firstEvent = Event::whereIn('device_id', $deviceIds)
                ->where('employee_no_string', $employeeNo)
                ->whereRaw("{$dateExpression} = ?", [$today])
                ->orderBy('event_datetime', 'asc')
                ->orderBy('id', 'asc')
                ->first();
            
            if ($firstEvent) {
                $uniqueCheckins[] = $firstEvent;
            }
        }

        // Sort by event_datetime desc and take last 10
        usort($uniqueCheckins, function ($a, $b) {
            return strcmp($b->event_datetime, $a->event_datetime);
        });

        $last10UniqueCheckins = collect(array_slice($uniqueCheckins, 0, 10))
            ->map(function ($event) {
                return [
                    'id' => $event->id,
                    'employee_no_string' => $event->employee_no_string,
                    'name' => $event->name,
                    'event_datetime' => $event->event_datetime,
                    'formatted_date' => $event->formatted_date,
                    'formatted_time' => $event->formatted_time,
                    'time_ago' => $event->time_ago,
                    'device_name' => $event->device->name ?? null,
                    'event_type' => $event->event_type,
                ];
            });

        return response()->json([
            'data' => [
                'total_checkins_today' => $totalCheckinsToday,
                'total_unique_checkins_today' => $uniqueCheckinsToday,
                'last_10_checkins_today' => $last10Checkins,
                'last_10_unique_checkins_today' => $last10UniqueCheckins,
                'date' => $today,
            ],
        ]);
    }
}
