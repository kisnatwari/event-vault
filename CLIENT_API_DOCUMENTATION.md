# EventVault - Client API Documentation

**Version:** 1.0  
**Last Updated:** November 2025  
**Base URL:** `https://your-domain.com/api/v1`

---

## Table of Contents

1. [Introduction](#introduction)
2. [Authentication](#authentication)
3. [Getting Started](#getting-started)
4. [API Endpoints](#api-endpoints)
   - [Get Events](#get-events)
   - [Get Daily Attendance](#get-daily-attendance)
   - [Get Devices](#get-devices)
   - [Get Statistics](#get-statistics)
5. [Request & Response Formats](#request--response-formats)
6. [Error Handling](#error-handling)
7. [Code Examples](#code-examples)
8. [Best Practices](#best-practices)
9. [Rate Limiting](#rate-limiting)
10. [Troubleshooting](#troubleshooting)

---

## Introduction

The EventVault API provides secure access to your event data, device information, and attendance records. This RESTful API allows you to integrate event data from HikVision face recognition devices into your own applications and systems.

### Key Features

- **Secure Authentication**: Token-based authentication ensures only authorized access
- **Data Isolation**: Each client can only access their own data
- **Advanced Filtering**: Powerful filtering options for precise data retrieval
- **Pagination**: Efficient handling of large datasets
- **Daily Attendance**: Built-in attendance tracking with unique entries per day
- **Real-time Statistics**: Get insights into your event data

---

## Authentication

All API requests require authentication using an API token. Your API token is unique to your account and provides access only to your data.

### Obtaining Your API Token

1. Contact your administrator to generate an API token for your account
2. The token will be provided to you **once** - store it securely
3. If you lose your token, contact your administrator to generate a new one

### Using Your API Token

You can authenticate in three ways (Bearer Token is recommended):

#### 1. Bearer Token (Recommended)

```http
Authorization: Bearer YOUR_API_TOKEN_HERE
```

#### 2. Custom Header

```http
X-API-Token: YOUR_API_TOKEN_HERE
```

#### 3. Query Parameter (Less Secure)

```
?api_token=YOUR_API_TOKEN_HERE
```

### Security Best Practices

- ✅ **Always use HTTPS** in production
- ✅ **Store tokens securely** - never commit to version control
- ✅ **Use Bearer Token** method when possible
- ✅ **Rotate tokens regularly** for enhanced security
- ❌ **Never share tokens** publicly or in client-side code
- ❌ **Don't log tokens** in application logs

---

## Getting Started

### Step 1: Get Your API Token

Contact your administrator to receive your API token.

### Step 2: Make Your First Request

Test your connection with a simple request:

```bash
curl -X GET "https://your-domain.com/api/v1/devices" \
  -H "Authorization: Bearer YOUR_API_TOKEN"
```

### Step 3: Verify Response

You should receive a JSON response with your devices. If you get an authentication error, verify your token is correct.

---

## API Endpoints

### Base URL

All endpoints are prefixed with `/api/v1`:

```
https://your-domain.com/api/v1
```

### Common Response Structure

All successful responses follow this structure:

```json
{
  "data": [...],
  "meta": {
    "current_page": 1,
    "per_page": 50,
    "total": 100,
    "last_page": 2,
    "from": 1,
    "to": 50
  },
  "links": {
    "first": "https://your-domain.com/api/v1/endpoint?page=1",
    "last": "https://your-domain.com/api/v1/endpoint?page=2",
    "prev": null,
    "next": "https://your-domain.com/api/v1/endpoint?page=2"
  }
}
```

---

## Get Events

Retrieve paginated events with advanced filtering options.

### Endpoint

```
GET /api/v1/events
```

### Query Parameters

#### Basic Filters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `device_id` | integer/array | Filter by device ID(s) | `device_id=5` or `device_id[]=5&device_id[]=6` |
| `employee_no_string` | string/array | Filter by employee ID(s) | `employee_no_string=1` |
| `name` | string | Search by name (partial match) | `name=John` |
| `event_type` | string/array | Filter by event type | `event_type=AccessControlEvent` |
| `date_from` | date | Filter from date (YYYY-MM-DD) | `date_from=2025-11-01` |
| `date_to` | date | Filter to date (YYYY-MM-DD) | `date_to=2025-11-30` |

#### Advanced Filters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `major_event_type` | integer | Filter by major event type | `major_event_type=5` |
| `sub_event_type` | integer | Filter by sub event type | `sub_event_type=75` |
| `verify_mode` | string/array | Filter by verify mode | `verify_mode=face` |
| `ip_address` | string | Filter by IP address (partial) | `ip_address=192.168` |
| `user_type` | string | Filter by user type | `user_type=normal` |
| `attendance_status` | string | Filter by attendance status | `attendance_status=1` |

#### Sorting & Pagination

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `sort_by` | string | Sort field: `created_at`, `event_datetime`, `name`, `employee_no_string`, `event_type`, `current_verify_mode`, `ip_address`, `device_id` | `created_at` |
| `sort_order` | string | Sort order: `asc` or `desc` | `desc` |
| `per_page` | integer | Results per page (max 200) | `50` |
| `page` | integer | Page number | `1` |

### Example Request

```bash
curl -X GET "https://your-domain.com/api/v1/events?date_from=2025-11-01&date_to=2025-11-30&per_page=25&sort_by=event_datetime&sort_order=desc" \
  -H "Authorization: Bearer YOUR_API_TOKEN"
```

### Example Response

```json
{
  "data": [
    {
      "id": 123,
      "device_id": 5,
      "employee_no_string": "1",
      "name": "John Doe",
      "event_datetime": "2025-11-23T16:31:03+05:45",
      "event_type": "AccessControlEvent",
      "formatted_date": "Nov 23, 2025",
      "formatted_time": "4:31:03 PM",
      "time_ago": "2 hours ago",
      "current_verify_mode": "face",
      "ip_address": "192.168.1.100",
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

### Use Cases

- Retrieve all events for a specific date range
- Filter events by employee or device
- Get events for attendance tracking
- Monitor device activity
- Generate reports

---

## Get Daily Attendance

Retrieve unique entries per day (first entry per employee per day) - perfect for attendance tracking.

### Endpoint

```
GET /api/v1/daily-attendance
```

### Query Parameters

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `device_id` | integer | Filter by device ID | - |
| `employee_no_string` | string | Filter by employee ID | - |
| `name` | string | Search by name (partial match) | - |
| `date_from` | date | Filter from date (YYYY-MM-DD) | 30 days ago |
| `date_to` | date | Filter to date (YYYY-MM-DD) | Today |
| `sort_by` | string | Sort field: `event_datetime`, `created_at`, `name`, `employee_no_string`, `event_type`, `device_id` | `event_datetime` |
| `sort_order` | string | Sort order: `asc` or `desc` | `desc` |
| `per_page` | integer | Results per page (max 200) | `50` |
| `page` | integer | Page number | `1` |

### Important Notes

- Returns **only the first entry** per employee per day
- Each employee will have **one record per day** (their first check-in)
- Perfect for attendance/check-in tracking
- Includes `attendance_date` field in response

### Example Request

```bash
curl -X GET "https://your-domain.com/api/v1/daily-attendance?date_from=2025-11-01&date_to=2025-11-30&per_page=100" \
  -H "Authorization: Bearer YOUR_API_TOKEN"
```

### Example Response

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

### Use Cases

- Daily attendance reports
- Check-in/check-out tracking
- Employee presence monitoring
- Monthly attendance summaries

---

## Get Devices

Retrieve all devices associated with your account.

### Endpoint

```
GET /api/v1/devices
```

### Example Request

```bash
curl -X GET "https://your-domain.com/api/v1/devices" \
  -H "Authorization: Bearer YOUR_API_TOKEN"
```

### Example Response

```json
{
  "data": [
    {
      "id": 5,
      "name": "Device-001",
      "client_id": 1,
      "events_count": 150
    },
    {
      "id": 6,
      "name": "Device-002",
      "client_id": 1,
      "events_count": 89
    }
  ]
}
```

### Use Cases

- List all available devices
- Get device statistics
- Device management interfaces

---

## Get Statistics

Get event statistics for your account.

### Endpoint

```
GET /api/v1/statistics
```

### Example Request

```bash
curl -X GET "https://your-domain.com/api/v1/statistics" \
  -H "Authorization: Bearer YOUR_API_TOKEN"
```

### Example Response

```json
{
  "data": {
    "total_events": 1500,
    "today_events": 45,
    "total_devices": 3
  }
}
```

### Use Cases

- Dashboard statistics
- Quick overview of account activity
- Monitoring and analytics

---

## Request & Response Formats

### Content Type

All requests should use:
```
Content-Type: application/json
```

All responses are returned as:
```
Content-Type: application/json
```

### Date Formats

- **Input**: `YYYY-MM-DD` (e.g., `2025-11-23`)
- **Output**: ISO 8601 format (e.g., `2025-11-23T16:31:03+05:45`)

### Pagination

Pagination is handled via query parameters:
- `page`: Page number (starts at 1)
- `per_page`: Items per page (default: 50, max: 200)

Use the `links` object in responses to navigate:
- `first`: First page URL
- `last`: Last page URL
- `prev`: Previous page URL (null if on first page)
- `next`: Next page URL (null if on last page)

---

## Error Handling

### Error Response Format

All errors follow this structure:

```json
{
  "error": "Error Type",
  "message": "Human-readable error message"
}
```

### HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 401 | Unauthorized | Invalid or missing API token |
| 404 | Not Found | Resource not found |
| 422 | Unprocessable Entity | Validation error |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

### Common Errors

#### 401 Unauthorized

**Missing Token:**
```json
{
  "error": "Unauthorized",
  "message": "API token is required"
}
```

**Invalid Token:**
```json
{
  "error": "Unauthorized",
  "message": "Invalid or expired API token"
}
```

**Solution:** Verify your API token is correct and not expired.

#### 404 Not Found

```json
{
  "error": "Not Found",
  "message": "Resource not found"
}
```

**Solution:** Check that the endpoint URL and resource ID are correct.

#### 422 Unprocessable Entity

```json
{
  "error": "Validation Error",
  "message": "The given data was invalid.",
  "errors": {
    "date_from": ["The date from must be a valid date."]
  }
}
```

**Solution:** Review the validation errors and correct your request parameters.

---

## Code Examples

### cURL

#### Get Events

```bash
curl -X GET "https://your-domain.com/api/v1/events?date_from=2025-11-01&date_to=2025-11-30" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json"
```

#### Get Daily Attendance

```bash
curl -X GET "https://your-domain.com/api/v1/daily-attendance?date_from=2025-11-01&date_to=2025-11-30" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json"
```

### PHP

```php
<?php

class EventVaultAPI {
    private $baseUrl = 'https://your-domain.com/api/v1';
    private $token;
    
    public function __construct($token) {
        $this->token = $token;
    }
    
    private function makeRequest($endpoint, $params = []) {
        $url = $this->baseUrl . $endpoint;
        if (!empty($params)) {
            $url .= '?' . http_build_query($params);
        }
        
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Authorization: Bearer ' . $this->token,
            'Content-Type: application/json',
        ]);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode !== 200) {
            throw new Exception('API request failed: ' . $response);
        }
        
        return json_decode($response, true);
    }
    
    public function getEvents($filters = []) {
        return $this->makeRequest('/events', $filters);
    }
    
    public function getDailyAttendance($filters = []) {
        return $this->makeRequest('/daily-attendance', $filters);
    }
    
    public function getDevices() {
        return $this->makeRequest('/devices');
    }
    
    public function getStatistics() {
        return $this->makeRequest('/statistics');
    }
}

// Usage
$api = new EventVaultAPI('YOUR_API_TOKEN');

// Get events for November 2025
$events = $api->getEvents([
    'date_from' => '2025-11-01',
    'date_to' => '2025-11-30',
    'per_page' => 50,
]);

// Get daily attendance
$attendance = $api->getDailyAttendance([
    'date_from' => '2025-11-01',
    'date_to' => '2025-11-30',
]);

// Get all devices
$devices = $api->getDevices();

// Get statistics
$stats = $api->getStatistics();
```

### Python

```python
import requests
from typing import Dict, Optional, List

class EventVaultAPI:
    def __init__(self, token: str, base_url: str = 'https://your-domain.com/api/v1'):
        self.token = token
        self.base_url = base_url
        self.headers = {
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        }
    
    def _make_request(self, endpoint: str, params: Optional[Dict] = None) -> Dict:
        url = f"{self.base_url}{endpoint}"
        response = requests.get(url, headers=self.headers, params=params)
        response.raise_for_status()
        return response.json()
    
    def get_events(self, **filters) -> Dict:
        """Get events with optional filters"""
        return self._make_request('/events', params=filters)
    
    def get_daily_attendance(self, **filters) -> Dict:
        """Get daily attendance (unique entries per day)"""
        return self._make_request('/daily-attendance', params=filters)
    
    def get_devices(self) -> Dict:
        """Get all devices"""
        return self._make_request('/devices')
    
    def get_statistics(self) -> Dict:
        """Get statistics"""
        return self._make_request('/statistics')

# Usage
api = EventVaultAPI('YOUR_API_TOKEN')

# Get events for November 2025
events = api.get_events(
    date_from='2025-11-01',
    date_to='2025-11-30',
    per_page=50
)

# Get daily attendance
attendance = api.get_daily_attendance(
    date_from='2025-11-01',
    date_to='2025-11-30'
)

# Get all devices
devices = api.get_devices()

# Get statistics
stats = api.get_statistics()
```

### JavaScript/Node.js

```javascript
class HikVisionAPI {
    constructor(token, baseUrl = 'https://your-domain.com/api/v1') {
        this.token = token;
        this.baseUrl = baseUrl;
    }
    
    async makeRequest(endpoint, params = {}) {
        const url = new URL(`${this.baseUrl}${endpoint}`);
        Object.keys(params).forEach(key => {
            if (Array.isArray(params[key])) {
                params[key].forEach(val => url.searchParams.append(`${key}[]`, val));
            } else if (params[key] !== null && params[key] !== undefined) {
                url.searchParams.append(key, params[key]);
            }
        });
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${this.token}`,
                'Content-Type': 'application/json',
            },
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'API request failed');
        }
        
        return response.json();
    }
    
    async getEvents(filters = {}) {
        return this.makeRequest('/events', filters);
    }
    
    async getDailyAttendance(filters = {}) {
        return this.makeRequest('/daily-attendance', filters);
    }
    
    async getDevices() {
        return this.makeRequest('/devices');
    }
    
    async getStatistics() {
        return this.makeRequest('/statistics');
    }
}

// Usage
const api = new EventVaultAPI('YOUR_API_TOKEN');

// Get events for November 2025
const events = await api.getEvents({
    date_from: '2025-11-01',
    date_to: '2025-11-30',
    per_page: 50,
});

// Get daily attendance
const attendance = await api.getDailyAttendance({
    date_from: '2025-11-01',
    date_to: '2025-11-30',
});

// Get all devices
const devices = await api.getDevices();

// Get statistics
const stats = await api.getStatistics();
```

---

## Best Practices

### 1. Error Handling

Always implement proper error handling:

```php
try {
    $events = $api->getEvents(['date_from' => '2025-11-01']);
} catch (Exception $e) {
    // Log error
    error_log('API Error: ' . $e->getMessage());
    // Handle gracefully
}
```

### 2. Pagination

Always handle pagination for large datasets:

```php
$page = 1;
$allEvents = [];

do {
    $response = $api->getEvents([
        'date_from' => '2025-11-01',
        'date_to' => '2025-11-30',
        'page' => $page,
        'per_page' => 100,
    ]);
    
    $allEvents = array_merge($allEvents, $response['data']);
    $page++;
} while ($response['links']['next'] !== null);
```

### 3. Rate Limiting

Implement rate limiting to avoid overwhelming the API:

```php
// Wait between requests
usleep(100000); // 100ms delay
```

### 4. Caching

Cache responses when appropriate to reduce API calls:

```php
$cacheKey = 'events_' . md5(serialize($filters));
$events = cache()->remember($cacheKey, 300, function() use ($api, $filters) {
    return $api->getEvents($filters);
});
```

### 5. Token Security

- Store tokens in environment variables
- Never commit tokens to version control
- Rotate tokens regularly
- Use HTTPS only

```php
// .env file
API_TOKEN=your_token_here

// In code
$token = env('API_TOKEN');
```

---

## Rate Limiting

To ensure fair usage and system stability, rate limiting may be applied. If you exceed the rate limit, you'll receive a `429 Too Many Requests` response.

### Recommendations

- Implement exponential backoff for retries
- Cache responses when possible
- Batch requests when appropriate
- Monitor your request frequency

---

## Troubleshooting

### Issue: 401 Unauthorized

**Possible Causes:**
- Token is missing or incorrect
- Token has expired
- Token has been revoked

**Solutions:**
1. Verify your token is correct
2. Check token expiration date
3. Contact administrator for a new token

### Issue: Empty Results

**Possible Causes:**
- No data exists for the specified filters
- Date range is incorrect
- Device/employee filters are too restrictive

**Solutions:**
1. Verify date ranges are correct
2. Try broader filters
3. Check that devices/employees exist

### Issue: Slow Responses

**Possible Causes:**
- Large date ranges
- Too many results per page
- Network issues

**Solutions:**
1. Use smaller date ranges
2. Reduce `per_page` parameter
3. Implement pagination
4. Check network connectivity

### Issue: Date Format Errors

**Solution:** Always use `YYYY-MM-DD` format (e.g., `2025-11-23`)

---

## Support

For technical support or questions:

- **Email:** support@your-domain.com
- **Documentation:** https://your-domain.com/docs
- **Status Page:** https://status.your-domain.com

---

## Changelog

### Version 1.0 (November 2025)
- Initial API release
- Events endpoint with advanced filtering
- Daily attendance endpoint
- Devices and statistics endpoints
- Token-based authentication

---

**Document Version:** 1.0  
**Last Updated:** November 2025

