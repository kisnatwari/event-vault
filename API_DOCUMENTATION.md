# EventVault API Documentation

## Overview

This API allows client backends to securely access their event data. All API requests require authentication using an API token.

## Base URL

```
https://your-domain.com/api/v1
```

## Authentication

All API requests must include an API token in one of the following ways:

1. **Bearer Token** (Recommended):
   ```
   Authorization: Bearer YOUR_API_TOKEN
   ```

2. **Custom Header**:
   ```
   X-API-Token: YOUR_API_TOKEN
   ```

3. **Query Parameter** (Less secure, not recommended):
   ```
   ?api_token=YOUR_API_TOKEN
   ```

## Endpoints

### Get Events

Retrieve paginated events for the authenticated client with advanced filtering options.

**Endpoint:** `GET /api/v1/events`

**Query Parameters:**

**Basic Filters:**
- `device_id` (optional): Filter by device ID (can be array: `device_id[]=1&device_id[]=2`)
- `employee_no_string` (optional): Filter by employee ID (can be array: `employee_no_string[]=1&employee_no_string[]=2`)
- `name` (optional): Search by name (partial match)
- `event_type` (optional): Filter by event type (can be array: `event_type[]=AccessControlEvent`)
- `date_from` (optional): Filter events from this date (YYYY-MM-DD)
- `date_to` (optional): Filter events until this date (YYYY-MM-DD)

**Advanced Filters:**
- `major_event_type` (optional): Filter by major event type (integer)
- `sub_event_type` (optional): Filter by sub event type (integer)
- `verify_mode` (optional): Filter by verify mode (can be array: `verify_mode[]=face`)
- `ip_address` (optional): Filter by IP address (partial match)
- `user_type` (optional): Filter by user type
- `attendance_status` (optional): Filter by attendance status

**Sorting & Pagination:**
- `sort_by` (optional): Sort field - `created_at`, `event_datetime`, `name`, `employee_no_string`, `event_type`, `current_verify_mode`, `ip_address`, `device_id` (default: `created_at`)
- `sort_order` (optional): Sort order - `asc` or `desc` (default: `desc`)
- `per_page` (optional): Number of results per page (default: 50, max: 200)
- `page` (optional): Page number (default: 1)

**Example Request:**
```bash
curl -X GET "https://your-domain.com/api/v1/events?per_page=25&page=1" \
  -H "Authorization: Bearer YOUR_API_TOKEN"
```

**Example Response:**
```json
{
  "data": [
    {
      "id": 1,
      "device_id": 5,
      "employee_no_string": "1",
      "name": "John Doe",
      "event_datetime": "2025-11-23T16:31:03+05:45",
      "event_type": "AccessControlEvent",
      "formatted_date": "Nov 23, 2025",
      "formatted_time": "4:31:03 PM",
      "time_ago": "2 hours ago",
      "device": {
        "id": 5,
        "name": "Device-001",
        "client_id": 1
      }
    }
  ],
  "meta": {
    "current_page": 1,
    "per_page": 25,
    "total": 150,
    "last_page": 6,
    "from": 1,
    "to": 25
  },
  "links": {
    "first": "https://your-domain.com/api/v1/events?page=1",
    "last": "https://your-domain.com/api/v1/events?page=6",
    "prev": null,
    "next": "https://your-domain.com/api/v1/events?page=2"
  }
}
```

### Get Devices

Retrieve all devices for the authenticated client.

**Endpoint:** `GET /api/v1/devices`

**Example Request:**
```bash
curl -X GET "https://your-domain.com/api/v1/devices" \
  -H "Authorization: Bearer YOUR_API_TOKEN"
```

**Example Response:**
```json
{
  "data": [
    {
      "id": 5,
      "name": "Device-001",
      "client_id": 1,
      "events_count": 150
    }
  ]
}
```

### Get Daily Attendance

Retrieve unique entries per day (first entry per employee per day) - perfect for attendance tracking.

**Endpoint:** `GET /api/v1/daily-attendance`

**Query Parameters:**

**Basic Filters:**
- `device_id` (optional): Filter by device ID
- `employee_no_string` (optional): Filter by employee ID
- `name` (optional): Search by name (partial match)
- `date_from` (optional): Filter attendance from this date (YYYY-MM-DD, default: 30 days ago)
- `date_to` (optional): Filter attendance until this date (YYYY-MM-DD, default: today)

**Sorting & Pagination:**
- `sort_by` (optional): Sort field - `event_datetime`, `created_at`, `name`, `employee_no_string`, `event_type`, `device_id` (default: `event_datetime`)
- `sort_order` (optional): Sort order - `asc` or `desc` (default: `desc`)
- `per_page` (optional): Number of results per page (default: 50, max: 200)
- `page` (optional): Page number (default: 1)

**Example Request:**
```bash
curl -X GET "https://your-domain.com/api/v1/daily-attendance?date_from=2025-11-01&date_to=2025-11-30&per_page=100" \
  -H "Authorization: Bearer YOUR_API_TOKEN"
```

**Example Response:**
```json
{
  "data": [
    {
      "id": 123,
      "device_id": 5,
      "employee_no_string": "1",
      "name": "John Doe",
      "event_datetime": "2025-11-23T08:15:30+05:45",
      "attendance_date": "2025-11-23",
      "event_type": "AccessControlEvent",
      "formatted_date": "Nov 23, 2025",
      "formatted_time": "8:15:30 AM",
      "time_ago": "2 hours ago",
      "device": {
        "id": 5,
        "name": "Device-001",
        "client_id": 1
      }
    }
  ],
  "meta": {
    "current_page": 1,
    "per_page": 100,
    "total": 450,
    "last_page": 5,
    "from": 1,
    "to": 100
  },
  "links": {
    "first": "https://your-domain.com/api/v1/daily-attendance?page=1",
    "last": "https://your-domain.com/api/v1/daily-attendance?page=5",
    "prev": null,
    "next": "https://your-domain.com/api/v1/daily-attendance?page=2"
  }
}
```

**Note:** This endpoint returns the **first entry** per employee per day, making it perfect for attendance tracking. Each employee will have only one record per day (their first check-in).

### Get Statistics

Get event statistics for the authenticated client.

**Endpoint:** `GET /api/v1/statistics`

**Example Request:**
```bash
curl -X GET "https://your-domain.com/api/v1/statistics" \
  -H "Authorization: Bearer YOUR_API_TOKEN"
```

**Example Response:**
```json
{
  "data": {
    "total_events": 1500,
    "today_events": 45,
    "total_devices": 3
  }
}
```

## Error Responses

### 401 Unauthorized

```json
{
  "error": "Unauthorized",
  "message": "API token is required"
}
```

or

```json
{
  "error": "Unauthorized",
  "message": "Invalid or expired API token"
}
```

### 404 Not Found

```json
{
  "error": "Not Found",
  "message": "Resource not found"
}
```

## Security Notes

1. **Token Storage**: Store API tokens securely. Never commit them to version control.
2. **HTTPS Only**: Always use HTTPS in production.
3. **Token Rotation**: Regularly rotate API tokens for security.
4. **Scope**: Each token is scoped to a specific client. Clients can only access their own data.
5. **Rate Limiting**: Consider implementing rate limiting on your backend when calling the API.

## Data Isolation

Each API token is associated with a specific client. When you authenticate with a token, you can only access:
- Events from devices belonging to your client
- Devices belonging to your client
- Statistics for your client

Attempts to access other clients' data will return empty results or errors.

