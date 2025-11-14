# GramSense API Contract

This file defines the API endpoints exposed by the backend (`apps/backend-api`).  
All endpoints, payloads, request/response formats, and validation rules will be documented here.

---

## 1. Authentication (TODO)
- `/auth/login`
- `/auth/refresh`
- `/auth/logout`

---

## 2. Field Data Submission API (Initial Draft)
### POST `/reports/submit`
Request:
```json
{
  "crop": "",
  "issue": "",
  "severity": "",
  "location": "",
  "timestamp": "",
  "confidence": ""
}
```
## 3. Dashboard Data APIs (TODO)

- `/dashboard/summary`

- `/dashboard/map`

- `/dashboard/timeseries`

## 4. Admin APIs (TODO)

- `/admin/users`

- `/admin/roles`

- `/admin/logs`

## 5. Error Codes (TODO)

400 Bad Request

401 Unauthorized

500 Server Error

More details will be added during implementation.
---