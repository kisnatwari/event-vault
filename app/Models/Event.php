<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Event extends Model
{
    use HasFactory;

    protected $fillable = [
        'device_id',
        'device_id_from_event',
        'employee_no_string',
        'name',
        'event_datetime',
        'received_at',
        'event_type',
        'event_state',
        'major_event_type',
        'sub_event_type',
        'event_description',
        'ip_address',
        'mac_address',
        'channel_id',
        'device_name',
        'port_no',
        'protocol',
        'verify_no',
        'serial_no',
        'front_serial_no',
        'user_type',
        'current_verify_mode',
        'card_reader_kind',
        'card_reader_no',
        'door_no',
        'attendance_status',
        'status_value',
        'mask',
        'pure_pwd_verify_enable',
        'face_rect',
        'raw_event_data',
    ];

    protected $casts = [
        'received_at' => 'datetime',
        'pure_pwd_verify_enable' => 'boolean',
        'face_rect' => 'array',
        'raw_event_data' => 'array',
    ];

    protected $appends = [
        'formatted_date',
        'formatted_time',
        'time_ago',
    ];

    /**
     * Get formatted date from event_datetime
     */
    public function getFormattedDateAttribute(): ?string
    {
        if (!$this->event_datetime) {
            return null;
        }

        // Parse ISO 8601 string: 2025-11-23T16:31:03+05:45
        $match = preg_match('/^(\d{4})-(\d{2})-(\d{2})T/', $this->event_datetime, $matches);
        if ($match) {
            $year = $matches[1];
            $month = (int) $matches[2];
            $day = $matches[3];
            
            $monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            
            return sprintf('%s %s, %s', $monthNames[$month - 1], $day, $year);
        }

        return null;
    }

    /**
     * Get formatted time from event_datetime (12-hour format with AM/PM)
     */
    public function getFormattedTimeAttribute(): ?string
    {
        if (!$this->event_datetime) {
            return null;
        }

        // Parse ISO 8601 string: 2025-11-23T16:31:03+05:45
        $match = preg_match('/T(\d{2}):(\d{2}):(\d{2})/', $this->event_datetime, $matches);
        if ($match) {
            $hour = (int) $matches[1];
            $minute = $matches[2];
            $second = $matches[3];
            $period = $hour >= 12 ? 'PM' : 'AM';
            $hour12 = $hour % 12;
            if ($hour12 === 0) {
                $hour12 = 12;
            }

            return sprintf('%d:%s:%s %s', $hour12, $minute, $second, $period);
        }

        return null;
    }

    /**
     * Get human-readable time difference (diffForHumans)
     */
    public function getTimeAgoAttribute(): ?string
    {
        if (!$this->event_datetime) {
            return null;
        }

        try {
            $dateTime = \Carbon\Carbon::parse($this->event_datetime);
            return $dateTime->diffForHumans();
        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * Get the device that this event belongs to.
     */
    public function device(): BelongsTo
    {
        return $this->belongsTo(Device::class);
    }

    /**
     * Scope to filter events by device.
     */
    public function scopeForDevice($query, $deviceId)
    {
        return $query->where('device_id', $deviceId);
    }

    /**
     * Scope to filter events by employee.
     */
    public function scopeForEmployee($query, $employeeNoString)
    {
        return $query->where('employee_no_string', $employeeNoString);
    }

    /**
     * Scope to filter events by date range.
     */
    public function scopeDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('event_datetime', [$startDate, $endDate]);
    }
}

