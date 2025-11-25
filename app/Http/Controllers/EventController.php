<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\Event;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EventController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Event::with(['device.client']);

        // Sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        
        // Validate sort_by field
        $allowedSortFields = [
            'created_at',
            'event_datetime',
            'name',
            'employee_no_string',
            'event_type',
            'current_verify_mode',
            'ip_address',
        ];
        
        if (!in_array($sortBy, $allowedSortFields)) {
            $sortBy = 'created_at';
        }
        
        // Validate sort_order
        $sortOrder = strtolower($sortOrder) === 'asc' ? 'asc' : 'desc';
        
        $query->orderBy($sortBy, $sortOrder);

        // Filter by client
        if ($request->filled('client_id')) {
            $query->whereHas('device', function ($q) use ($request) {
                $q->where('client_id', $request->client_id);
            });
        }

        // Filter by device
        if ($request->filled('device_id')) {
            $query->where('device_id', $request->device_id);
        }

        // Filter by employee
        if ($request->filled('employee_no_string')) {
            $query->where('employee_no_string', $request->employee_no_string);
        }

        // Filter by name
        if ($request->filled('name')) {
            $query->where('name', 'like', '%' . $request->name . '%');
        }

        // Filter by date range (event_datetime is stored as ISO 8601 string)
        if ($request->filled('date_from')) {
            $query->where('event_datetime', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            // Add time to end of day for inclusive comparison
            $dateTo = $request->date_to . 'T23:59:59';
            $query->where('event_datetime', '<=', $dateTo);
        }

        // Filter by event type
        if ($request->filled('event_type')) {
            $query->where('event_type', $request->event_type);
        }

        // Filter by major event type
        if ($request->filled('major_event_type')) {
            $query->where('major_event_type', $request->major_event_type);
        }

        // Filter by sub event type
        if ($request->filled('sub_event_type')) {
            $query->where('sub_event_type', $request->sub_event_type);
        }

        // Filter by verification mode
        if ($request->filled('verify_mode')) {
            $query->where('current_verify_mode', $request->verify_mode);
        }

        // Paginate results
        $perPage = $request->get('per_page', 50);
        $events = $query->paginate($perPage)->withQueryString();

        // Get filter options for dropdowns
        $clients = Client::with('devices')->orderBy('name')->get();
        $devices = \App\Models\Device::with('client')->orderBy('name')->get();
        $eventTypes = Event::distinct()->whereNotNull('event_type')->pluck('event_type');
        $verifyModes = Event::distinct()->whereNotNull('current_verify_mode')->pluck('current_verify_mode');

        return Inertia::render('events/index', [
            'events' => $events,
            'clients' => $clients,
            'devices' => $devices,
            'eventTypes' => $eventTypes,
            'verifyModes' => $verifyModes,
            'filters' => $request->only([
                'client_id',
                'device_id',
                'employee_no_string',
                'name',
                'date_from',
                'date_to',
                'event_type',
                'major_event_type',
                'sub_event_type',
                'verify_mode',
                'per_page',
                'sort_by',
                'sort_order',
            ]),
        ]);
    }
}

