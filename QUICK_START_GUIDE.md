# Quick Start Guide - EventVault API

## Get Your API Token

Contact your administrator to receive your API token.

## Base URL

```
https://your-domain.com/api/v1
```

## Authentication

Include your token in every request:

```http
Authorization: Bearer YOUR_API_TOKEN
```

## Quick Examples

### Get Events

```bash
curl -X GET "https://your-domain.com/api/v1/events?date_from=2025-11-01&date_to=2025-11-30" \
  -H "Authorization: Bearer YOUR_API_TOKEN"
```

### Get Daily Attendance

```bash
curl -X GET "https://your-domain.com/api/v1/daily-attendance?date_from=2025-11-01&date_to=2025-11-30" \
  -H "Authorization: Bearer YOUR_API_TOKEN"
```

### Get Devices

```bash
curl -X GET "https://your-domain.com/api/v1/devices" \
  -H "Authorization: Bearer YOUR_API_TOKEN"
```

### Get Statistics

```bash
curl -X GET "https://your-domain.com/api/v1/statistics" \
  -H "Authorization: Bearer YOUR_API_TOKEN"
```

## Common Filters

| Filter | Example | Description |
|--------|---------|-------------|
| `date_from` | `2025-11-01` | Start date (YYYY-MM-DD) |
| `date_to` | `2025-11-30` | End date (YYYY-MM-DD) |
| `device_id` | `5` | Filter by device |
| `employee_no_string` | `1` | Filter by employee |
| `name` | `John` | Search by name |
| `per_page` | `50` | Results per page (max 200) |
| `page` | `1` | Page number |

## Response Format

```json
{
  "data": [...],
  "meta": {
    "current_page": 1,
    "per_page": 50,
    "total": 100,
    "last_page": 2
  },
  "links": {
    "next": "...",
    "prev": null
  }
}
```

## Error Codes

- `401` - Invalid or missing token
- `404` - Resource not found
- `422` - Validation error
- `429` - Rate limit exceeded

## Need Help?

See `CLIENT_API_DOCUMENTATION.md` for complete documentation.

