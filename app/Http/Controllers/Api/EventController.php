<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Jobs\SendWebhookJob;
use App\Models\Device;
use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;

class EventController extends Controller
{
    public function store(Request $request)
    {
        $currentTimeDate = now()->format('Y-m-d H:i:s');
        $body = $request->all();

        // Parse the event_log JSON string or use the body directly
        $eventLog = null;
        if (isset($body['event_log'])) {
            // If event_log is a string, decode it
            if (is_string($body['event_log'])) {
                $eventLog = json_decode($body['event_log'], true);
            } 
            // If event_log is already an array, use it directly
            elseif (is_array($body['event_log'])) {
                $eventLog = $body['event_log'];
            }
        } 
        // If no event_log field, check if the body itself is the event data
        elseif (isset($body['deviceID']) || isset($body['AccessControllerEvent'])) {
            $eventLog = $body;
        }

        // Validate required fields
        if (!$this->isValidEvent($eventLog)) {
            return response()->json([
                'message' => 'Event skipped - invalid or missing required fields',
            ]);
        }

        try {
            // Find device by matching MAC address from event
            $macAddress = $eventLog['macAddress'] ?? null;
            
            if (!$macAddress || $this->isInvalidValue($macAddress)) {
                Log::warning("Event skipped - no MAC address in event", [
                    'event_data' => $eventLog,
                    'time' => $currentTimeDate,
                ]);
                return response()->json([
                    'message' => 'Event skipped - MAC address is required',
                ]);
            }

            // Normalize MAC address (remove colons, dashes, spaces, dots, convert to lowercase)
            $normalizeMac = function($mac) {
                return strtolower(str_replace([':', '-', ' ', '.'], '', $mac));
            };
            
            $normalizedMac = $normalizeMac($macAddress);

            // Find device by matching normalized MAC address
            // Use database-agnostic approach: normalize both stored and incoming MAC addresses
            $connection = \Illuminate\Support\Facades\DB::connection()->getDriverName();
            
            if ($connection === 'sqlite') {
                // SQLite: Use replace() function
                $device = Device::whereRaw(
                    "lower(replace(replace(replace(replace(mac_address, ':', ''), '-', ''), ' ', ''), '.', '')) = ?",
                    [$normalizedMac]
                )->first();
            } else {
                // MySQL/PostgreSQL: Use REPLACE() function
                $device = Device::whereRaw(
                    "LOWER(REPLACE(REPLACE(REPLACE(REPLACE(mac_address, ':', ''), '-', ''), ' ', ''), '.', '')) = ?",
                    [$normalizedMac]
                )->first();
            }

            // Skip event if no matching device is found
            if (!$device) {
                Log::info("Event skipped - no matching device found", [
                    'macAddress' => $macAddress,
                    'normalizedMac' => $normalizedMac,
                    'time' => $currentTimeDate,
                ]);
                return response()->json([
                    'message' => 'Event skipped - no matching device found',
                    'macAddress' => $macAddress,
                ]);
            }

        // Extract and prepare event data
        $accessControllerEvent = $eventLog['AccessControllerEvent'] ?? [];
        $eventData = $this->extractEventData($eventLog, $accessControllerEvent, $device->id);

            // Create event record
            $event = Event::create($eventData);

            // Log the stored event
            Log::info("Valid event stored:\n" . json_encode([
                'time' => $currentTimeDate,
                'event_id' => $event->id,
                'macAddress' => $macAddress,
                'device_id' => $device?->id,
                'employeeNoString' => $accessControllerEvent['employeeNoString'] ?? null,
                'name' => $accessControllerEvent['name'] ?? null,
            ], JSON_PRETTY_PRINT));

            // Send webhook to client if webhook URL is configured (fire-and-forget)
            $client = $device->client;
            if ($client && $client->webhook_url) {
                // Dispatch webhook job asynchronously - fire and forget
                // Send the original payload received from the device, not the stored data
                SendWebhookJob::dispatch(
                    $client->webhook_url,
                    $eventLog // Send the original payload as received from device
                )->onConnection('sync'); // Use sync connection for immediate dispatch (or 'database' for queued)
            }

            return response()->json([
                'message' => 'Valid event received and stored',
                'event_id' => $event->id,
            ]);
        } catch (\Exception $e) {
            Log::error('Error storing event', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'event_data' => $eventLog,
            ]);

            return response()->json([
                'message' => 'Error storing event',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Check if event has all required valid fields
     */
    private function isValidEvent(?array $eventLog): bool
    {
        if (!is_array($eventLog)) {
            return false;
        }

        // Validate MAC address (required for device identification)
        $macAddress = $eventLog['macAddress'] ?? null;
        if ($this->isInvalidValue($macAddress)) {
            return false;
        }

        // Validate AccessControllerEvent
        $accessControllerEvent = $eventLog['AccessControllerEvent'] ?? null;
        if (!is_array($accessControllerEvent)) {
            return false;
        }

        // Validate employeeNoString
        $employeeNoString = $accessControllerEvent['employeeNoString'] ?? null;
        if ($this->isInvalidValue($employeeNoString)) {
            return false;
        }

        // Validate name
        $name = $accessControllerEvent['name'] ?? null;
        if ($this->isInvalidValue($name)) {
            return false;
        }

        return true;
    }

    /**
     * Check if a value is invalid, null, undefined, or empty
     */
    private function isInvalidValue($value): bool
    {
        if ($value === null) {
            return true;
        }

        if (is_string($value)) {
            $normalized = strtolower(trim($value));
            return in_array($normalized, ['invalid', 'undefined', 'null', '']) || empty($normalized);
        }

        return empty($value);
    }

    /**
     * Extract and map event data to database fields
     */
    private function extractEventData(array $eventLog, array $accessControllerEvent, ?int $deviceId): array
    {
        $deviceID = $eventLog['deviceID'] ?? null;
        $macAddress = $eventLog['macAddress'] ?? null;

        // Store the original datetime string from device as-is
        $eventDateTime = $eventLog['dateTime'] ?? null;

        return [
            'device_id' => $deviceId,
            'device_id_from_event' => $deviceID,
            'employee_no_string' => $accessControllerEvent['employeeNoString'] ?? null,
            'name' => $accessControllerEvent['name'] ?? null,
            'event_datetime' => $eventDateTime,
            'received_at' => now(),
            'event_type' => $eventLog['eventType'] ?? null,
            'event_state' => $eventLog['eventState'] ?? null,
            'major_event_type' => $accessControllerEvent['majorEventType'] ?? null,
            'sub_event_type' => $accessControllerEvent['subEventType'] ?? null,
            'event_description' => $eventLog['eventDescription'] ?? null,
            'ip_address' => $eventLog['ipAddress'] ?? null,
            'mac_address' => $eventLog['macAddress'] ?? null,
            'channel_id' => $eventLog['channelID'] ?? null,
            'device_name' => $accessControllerEvent['deviceName'] ?? null,
            'port_no' => $eventLog['portNo'] ?? null,
            'protocol' => $eventLog['protocol'] ?? null,
            'verify_no' => $accessControllerEvent['verifyNo'] ?? null,
            'serial_no' => $accessControllerEvent['serialNo'] ?? null,
            'front_serial_no' => $accessControllerEvent['frontSerialNo'] ?? null,
            'user_type' => $accessControllerEvent['userType'] ?? null,
            'current_verify_mode' => $accessControllerEvent['currentVerifyMode'] ?? null,
            'card_reader_kind' => $accessControllerEvent['cardReaderKind'] ?? null,
            'card_reader_no' => $accessControllerEvent['cardReaderNo'] ?? null,
            'door_no' => $accessControllerEvent['doorNo'] ?? null,
            'attendance_status' => $accessControllerEvent['attendanceStatus'] ?? null,
            'status_value' => $accessControllerEvent['statusValue'] ?? null,
            'mask' => $accessControllerEvent['mask'] ?? null,
            'pure_pwd_verify_enable' => $accessControllerEvent['purePwdVerifyEnable'] ?? null,
            'face_rect' => $accessControllerEvent['FaceRect'] ?? null,
            'raw_event_data' => $eventLog,
        ];
    }
}
