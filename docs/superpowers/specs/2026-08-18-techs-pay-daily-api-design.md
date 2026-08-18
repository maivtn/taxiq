# Techs & Pay Daily API Specification

> **Superseded:** Tài liệu này đã được thay thế bởi [Techs & Pay — Theo Ngày](../../business/techs-pay-daily.md). Không dùng file này làm source of truth cho implementation mới.

- **Date:** 2026-08-18
- **Status:** Superseded
- **Scope:** One read-only API for the POS **Techs & pay** table
- **API version:** `v1`

## 1. Goal

Provide one `GET` endpoint that returns every row needed by the **Techs & pay** table for one salon business date.

After the Tech identity column, each technician row contains these columns in order:

1. Turns
2. Hours
3. Service
4. Commission
5. Tip
6. Comm %
7. Tech takes

The backend owns all aggregation and commission calculation. The client only selects a date, calls the endpoint, formats the returned values, and renders the table.

## 2. Endpoint

```http
GET /api/v1/locations/{locationId}/tech-pay/daily?businessDate=YYYY-MM-DD
```

### 2.1 Headers

```http
Authorization: Bearer <access-token>
Accept: application/json
X-Request-ID: <client-generated-uuid>  # optional
```

### 2.2 Path parameter

| Parameter | Type | Required | Rule |
| --- | --- | --- | --- |
| `locationId` | string | Yes | ID of the salon/location. The authenticated account must have access to this location. |

### 2.3 Query parameter

| Parameter | Type | Required | Rule |
| --- | --- | --- | --- |
| `businessDate` | string (`YYYY-MM-DD`) | No | Date used for every returned column. If omitted, use the current date in the location timezone. Future dates are rejected. |

Examples:

```http
GET /api/v1/locations/loc_01J6XQ9R4A/tech-pay/daily
GET /api/v1/locations/loc_01J6XQ9R4A/tech-pay/daily?businessDate=2026-08-18
```

## 3. Successful Response

### 3.1 HTTP status

```http
200 OK
Content-Type: application/json
Cache-Control: private, no-store
```

### 3.2 Response example

```json
{
  "data": {
    "locationId": "loc_01J6XQ9R4A",
    "businessDate": "2026-08-18",
    "timezone": "America/Chicago",
    "currency": "USD",
    "isToday": true,
    "hasActivity": true,
    "asOf": "2026-08-18T14:35:21-05:00",
    "technicians": [
      {
        "technicianId": "tech_01J6XR2W7M",
        "displayName": "Tina Nguyen",
        "avatarUrl": null,
        "statusOnDate": "active",
        "sortOrder": 1,
        "turns": {
          "count": 4
        },
        "hours": {
          "workedMinutes": 465,
          "onShift": true
        },
        "service": {
          "amountCents": 42000
        },
        "commission": {
          "amountCents": 25200,
          "calculationStatus": "live_estimate"
        },
        "tip": {
          "amountCents": 5400
        },
        "commissionRateBps": 6000,
        "techTakesCents": 30600
      },
      {
        "technicianId": "tech_01J6XR7Y3K",
        "displayName": "Kim Nguyen",
        "avatarUrl": "https://cdn.example.com/avatars/tech_01J6XR7Y3K.jpg",
        "statusOnDate": "active",
        "sortOrder": 2,
        "turns": {
          "count": 0
        },
        "hours": {
          "workedMinutes": 0,
          "onShift": false
        },
        "service": {
          "amountCents": 0
        },
        "commission": {
          "amountCents": 0,
          "calculationStatus": "live_estimate"
        },
        "tip": {
          "amountCents": 0
        },
        "commissionRateBps": 5500,
        "techTakesCents": 0
      }
    ]
  },
  "meta": {
    "requestId": "req_01K2Y9SN6H5X",
    "schemaVersion": "1.0"
  }
}
```

## 4. Response Schema

### 4.1 Top-level data

| Field | Type | Nullable | Description |
| --- | --- | --- | --- |
| `locationId` | string | No | Location requested by the client. |
| `businessDate` | string (`YYYY-MM-DD`) | No | Resolved date applied to every metric in the response. |
| `timezone` | IANA timezone string | No | Location timezone used to determine the current business date and live time-clock boundary. |
| `currency` | string | No | ISO 4217 currency. V1 returns `USD`. |
| `isToday` | boolean | No | `true` when `businessDate` is today in the location timezone. |
| `hasActivity` | boolean | No | `true` if any returned technician has a non-zero turn, worked time, service, commission, tip, or Tech takes value. |
| `asOf` | RFC 3339 datetime | No | Consistent server snapshot time used for live calculations. |
| `technicians` | array | No | Technician rows. Returns `[]` only when no technician belonged to the location on the selected date. |

### 4.2 Technician identity

| Field | Type | Nullable | Description |
| --- | --- | --- | --- |
| `technicianId` | string | No | Stable technician ID. |
| `displayName` | string | No | Display name shown in the Tech column. |
| `avatarUrl` | HTTPS URL | Yes | Technician avatar. The UI may render initials when null. |
| `statusOnDate` | enum | No | `active` or `inactive`, evaluated on `businessDate`. |
| `sortOrder` | integer | No | Location roster order. Use `displayName` as the secondary sort key. |

### 4.3 Turns column

| Field | Type | Nullable | Description |
| --- | --- | --- | --- |
| `turns.count` | integer | No | Net posted turn credits for the technician on `businessDate`. Minimum value is `0`. |

### 4.4 Hours column

| Field | Type | Nullable | Description |
| --- | --- | --- | --- |
| `hours.workedMinutes` | integer | No | Total minutes worked inside the selected business-date boundary. Minimum value is `0`. The UI formats this as hours, for example `465` minutes as `7.8h`. |
| `hours.onShift` | boolean | No | Whether the technician has an open clock session at `asOf`. Always `false` for a historical date. |

### 4.5 Service column

| Field | Type | Nullable | Description |
| --- | --- | --- | --- |
| `service.amountCents` | integer | No | Net eligible service sales assigned to the technician for `businessDate`. Taxes, tips, gift-card loads, and ineligible retail sales are excluded. |

### 4.6 Commission column

| Field | Type | Nullable | Description |
| --- | --- | --- | --- |
| `commission.amountCents` | integer | No | Calculated commission for the selected date. |
| `commission.calculationStatus` | enum | No | `live_estimate` or `finalized_snapshot`. |

### 4.7 Tip column

| Field | Type | Nullable | Description |
| --- | --- | --- | --- |
| `tip.amountCents` | integer | No | Net confirmed tips assigned to the technician for `businessDate`. |

### 4.8 Comm % column

| Field | Type | Nullable | Description |
| --- | --- | --- | --- |
| `commissionRateBps` | integer | No | Effective commission rate in basis points. `6000` means `60.00%`. Range: `0` to `10000`. |

### 4.9 Tech takes column

| Field | Type | Nullable | Description |
| --- | --- | --- | --- |
| `techTakesCents` | integer | No | Daily operational amount calculated as `commission.amountCents + tip.amountCents`. Weekly guarantees, deductions, bonuses, tax withholding, and payouts are not included. |

All money values are integer cents. The API must not return floating-point currency values.

## 5. Date and Timezone Rules

1. Resolve the location and its IANA timezone before evaluating `businessDate`.
2. If `businessDate` is omitted, use the current calendar date in the location timezone, not the server timezone and not the user's device timezone.
3. Apply the same resolved `businessDate` to turns, hours, service, commission, tip, commission rate, and Tech takes.
4. Reject an invalid date such as `2026-02-30` instead of normalizing it.
5. Reject a date later than the current date in the location timezone.
6. Historical events keep the `business_date` assigned when they were posted. A later location-timezone change must not move historical events to another date.
7. A clock session crossing midnight contributes only the minutes that intersect the selected business date.
8. For an open clock session on the current date, calculate minutes through `asOf`.

## 6. Aggregation and Calculation Rules

### 6.1 Technician population

Return a technician when either condition is true:

- the technician's location membership was active for any portion of `businessDate`; or
- the technician has turn, time-clock, service, commission, or tip activity posted for that location and date.

This rule keeps a deactivated technician visible in historical data. A technician with no activity is still returned with zero values when their location membership was active on the selected date.

### 6.2 Turns

Count posted turn-credit events assigned to the technician and selected business date.

- A reversed turn subtracts its original credit.
- Cancelled or unfulfilled assignments do not count.
- The result returned to the client cannot be negative.
- Moving a turn between technicians must reverse the original entry and post a new entry so the audit trail remains intact.

### 6.3 Hours

1. Read all valid clock sessions that overlap the selected business-date interval.
2. Clip every session to the location's local-day start and end.
3. Sum durations in seconds, then round once to the nearest whole minute.
4. Exclude deleted or rejected clock sessions.
5. Include approved manual corrections.
6. Use `asOf` as the temporary end time for an open session on the current date.

Return the total as `hours.workedMinutes`. The frontend converts minutes to the display value for the Hours column.

### 6.4 Service

`service.amountCents` includes paid or settled service line items assigned to the technician for the selected business date:

- apply line and order discounts before commission;
- exclude taxes and tips;
- exclude gift-card loads and non-service items unless the pay rule explicitly marks a retail category commissionable;
- subtract settled refunds and void reversals posted against that business date;
- do not include unpaid, cancelled, or draft tickets.

The response floors a negative daily net service result at `0`; signed reversals remain available in the underlying ledger and audit history.

### 6.5 Commission

For a live date:

```text
commission.amountCents = roundHalfUp(
  service.amountCents × commissionRateBps ÷ 10000
)
```

The rate must be the effective-dated technician pay rate for `businessDate`. Changing the current rate must not change a historical finalized result.

For a finalized date, return the stored commission snapshot and set:

```json
{ "calculationStatus": "finalized_snapshot" }
```

For today or a date that has not been finalized, calculate from the latest eligible ledger data and set:

```json
{ "calculationStatus": "live_estimate" }
```

The daily commission is an operational estimate. It is not a finalized payroll payout and does not apply weekly guarantees, tax withholding, deductions, bonuses, or payout status.

### 6.6 Tip

Include:

- confirmed card, cash, QR, POS, and manually recorded tips;
- tip adjustments posted to the selected business date;
- tip allocations explicitly assigned to the technician.

Exclude:

- pending, disputed, voided, or rejected tips;
- service charges that are not classified as voluntary tips;
- tips assigned to another location or business date.

When a paid ticket has a tip but no explicit technician allocation, allocate the tip proportionally across eligible net service line amounts. Use the largest-remainder method so allocated cents add up exactly to the ticket tip.

`tip.amountCents` is the sum of allocations and signed adjustments. The public response floors a negative net result at `0`; the underlying negative adjustment remains in the audit ledger.

### 6.7 Comm %

`commissionRateBps` is the effective-dated technician commission rate for `businessDate`.

- Store and return the rate as integer basis points.
- `6000` represents `60.00%`.
- Valid values range from `0` through `10000`.
- A historical finalized row returns the rate snapshot used to calculate its stored commission.

### 6.8 Tech takes

Calculate the daily operational amount as:

```text
techTakesCents = commission.amountCents + tip.amountCents
```

`techTakesCents` does not apply weekly guarantees, deductions, bonuses, tax withholding, or payout transactions.

## 7. Source-of-Truth Mapping

| Response group | Authoritative source |
| --- | --- |
| Technician identity | Technician roster plus effective-dated location membership |
| Turns | Append-only turn-credit ledger |
| Hours | Clock-session ledger plus approved corrections |
| Service | Paid service-line ledger plus discounts, refunds, and void reversals |
| Commission | Calculated from Service and Comm %, or read from a finalized payroll snapshot |
| Tip | Tip ledger and technician tip-allocation ledger |
| Comm % | Effective-dated technician pay settings or finalized rate snapshot |
| Tech takes | Derived as Commission plus Tip |

The service must read these sources from one consistent database snapshot. The response must not mix totals calculated at different server times.

## 8. Authorization and Data Isolation

The endpoint requires the permission scope:

```text
tech_pay.read_all
```

Recommended V1 mapping:

| Role | Access |
| --- | --- |
| Owner | Allowed |
| Manager with pay-view permission | Allowed |
| Accountant with pay-view permission | Allowed |
| Front desk | Denied |
| Technician | Denied; a future self-only endpoint is outside this scope |

Security requirements:

- Validate location membership from the authenticated session.
- Never trust a merchant or tenant ID supplied only by the client.
- Return `404` rather than exposing whether a location in another tenant exists.
- Do not return phone, email, login PIN, tax ID, payout account, or other unnecessary technician PII.
- Log successful and denied access to all-technician pay data with actor, location, date, request ID, and timestamp.

## 9. Empty-State Behavior

No activity is not an error.

When technicians belong to the location but every requested column is zero:

```json
{
  "data": {
    "businessDate": "2026-08-10",
    "hasActivity": false,
    "technicians": [
      {
        "technicianId": "tech_01J6XR2W7M",
        "displayName": "Tina Nguyen",
        "turns": { "count": 0 },
        "hours": {
          "workedMinutes": 0,
          "onShift": false
        },
        "service": {
          "amountCents": 0
        },
        "commission": {
          "amountCents": 0,
          "calculationStatus": "live_estimate"
        },
        "tip": { "amountCents": 0 },
        "commissionRateBps": 6000,
        "techTakesCents": 0
      }
    ]
  }
}
```

The production response still includes all required top-level, identity, and `meta` fields defined in Section 4. The shortened example above illustrates only the zero-value behavior.

When no technician belonged to the location on the date, return `200` with:

```json
{
  "data": {
    "hasActivity": false,
    "technicians": []
  }
}
```

## 10. Error Contract

Errors use `application/problem+json`.

```json
{
  "type": "https://api.nexora.example/problems/invalid-business-date",
  "title": "Invalid business date",
  "status": 400,
  "code": "INVALID_BUSINESS_DATE",
  "detail": "businessDate must be a real date in YYYY-MM-DD format.",
  "requestId": "req_01K2Y9SN6H5X",
  "errors": [
    {
      "field": "businessDate",
      "reason": "invalid_format"
    }
  ]
}
```

| HTTP status | Code | When |
| --- | --- | --- |
| `400` | `INVALID_BUSINESS_DATE` | Date is malformed or does not exist. |
| `400` | `FUTURE_BUSINESS_DATE` | Date is later than today in the location timezone. |
| `401` | `UNAUTHENTICATED` | Access token is missing, invalid, or expired. |
| `403` | `TECH_PAY_ACCESS_DENIED` | Actor lacks `tech_pay.read_all`. |
| `404` | `LOCATION_NOT_FOUND` | Location does not exist or is outside the actor's tenant. |
| `429` | `RATE_LIMITED` | Request limit exceeded. Return `Retry-After`. |
| `500` | `INTERNAL_ERROR` | Unexpected server failure. Do not expose sensitive internals. |
| `503` | `TECH_PAY_SOURCE_UNAVAILABLE` | An authoritative ledger required for a consistent result is unavailable. |

Do not return a partial `200` when a required metric source fails. This endpoint promises one consistent daily snapshot.

## 11. OpenAPI 3.1 Contract

```yaml
openapi: 3.1.0
info:
  title: Nexora POS Techs & Pay API
  version: 1.0.0
paths:
  /api/v1/locations/{locationId}/tech-pay/daily:
    get:
      operationId: getDailyTechPay
      summary: Get Techs & pay data for one business date
      security:
        - bearerAuth: []
      parameters:
        - name: locationId
          in: path
          required: true
          schema:
            type: string
            minLength: 1
        - name: businessDate
          in: query
          required: false
          description: Defaults to today in the location timezone.
          schema:
            type: string
            format: date
      responses:
        "200":
          description: Daily technician metrics
          headers:
            Cache-Control:
              schema:
                type: string
              description: Always `private, no-store`.
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/DailyTechPayResponse"
        "400":
          $ref: "#/components/responses/ProblemResponse"
        "401":
          $ref: "#/components/responses/ProblemResponse"
        "403":
          $ref: "#/components/responses/ProblemResponse"
        "404":
          $ref: "#/components/responses/ProblemResponse"
        "429":
          $ref: "#/components/responses/ProblemResponse"
        "500":
          $ref: "#/components/responses/ProblemResponse"
        "503":
          $ref: "#/components/responses/ProblemResponse"
components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
  responses:
    ProblemResponse:
      description: API problem response
      content:
        application/problem+json:
          schema:
            $ref: "#/components/schemas/Problem"
  schemas:
    DailyTechPayResponse:
      type: object
      additionalProperties: false
      required: [data, meta]
      properties:
        data:
          $ref: "#/components/schemas/DailyTechPayData"
        meta:
          $ref: "#/components/schemas/ResponseMeta"
    DailyTechPayData:
      type: object
      additionalProperties: false
      required:
        - locationId
        - businessDate
        - timezone
        - currency
        - isToday
        - hasActivity
        - asOf
        - technicians
      properties:
        locationId:
          type: string
        businessDate:
          type: string
          format: date
        timezone:
          type: string
          minLength: 1
        currency:
          type: string
          const: USD
        isToday:
          type: boolean
        hasActivity:
          type: boolean
        asOf:
          type: string
          format: date-time
        technicians:
          type: array
          items:
            $ref: "#/components/schemas/DailyTechPayRow"
    DailyTechPayRow:
      type: object
      additionalProperties: false
      required:
        - technicianId
        - displayName
        - avatarUrl
        - statusOnDate
        - sortOrder
        - turns
        - hours
        - service
        - commission
        - tip
        - commissionRateBps
        - techTakesCents
      properties:
        technicianId:
          type: string
        displayName:
          type: string
          minLength: 1
        avatarUrl:
          type: [string, "null"]
          format: uri
        statusOnDate:
          type: string
          enum: [active, inactive]
        sortOrder:
          type: integer
          minimum: 0
        turns:
          $ref: "#/components/schemas/TurnsMetric"
        hours:
          $ref: "#/components/schemas/HoursMetric"
        service:
          $ref: "#/components/schemas/MoneyMetric"
        commission:
          $ref: "#/components/schemas/CommissionMetric"
        tip:
          $ref: "#/components/schemas/MoneyMetric"
        commissionRateBps:
          type: integer
          minimum: 0
          maximum: 10000
        techTakesCents:
          type: integer
          minimum: 0
    TurnsMetric:
      type: object
      additionalProperties: false
      required: [count]
      properties:
        count:
          type: integer
          minimum: 0
    HoursMetric:
      type: object
      additionalProperties: false
      required: [workedMinutes, onShift]
      properties:
        workedMinutes:
          type: integer
          minimum: 0
        onShift:
          type: boolean
    MoneyMetric:
      type: object
      additionalProperties: false
      required: [amountCents]
      properties:
        amountCents:
          type: integer
          minimum: 0
    CommissionMetric:
      type: object
      additionalProperties: false
      required: [amountCents, calculationStatus]
      properties:
        amountCents:
          type: integer
          minimum: 0
        calculationStatus:
          type: string
          enum: [live_estimate, finalized_snapshot]
    ResponseMeta:
      type: object
      additionalProperties: false
      required: [requestId, schemaVersion]
      properties:
        requestId:
          type: string
        schemaVersion:
          type: string
          const: "1.0"
    Problem:
      type: object
      additionalProperties: true
      required: [type, title, status, code, detail, requestId]
      properties:
        type:
          type: string
          format: uri
        title:
          type: string
        status:
          type: integer
        code:
          type: string
        detail:
          type: string
        requestId:
          type: string
        errors:
          type: array
          items:
            type: object
            additionalProperties: false
            required: [field, reason]
            properties:
              field:
                type: string
              reason:
                type: string
```

## 12. Performance and Observability

- Target response time: p95 at or below `500 ms` for a location with up to `250` technicians.
- Avoid N+1 queries. Aggregate ledgers by technician in the database or an equivalent server-side query layer.
- Use one consistent read snapshot for every metric.
- Emit metrics for request count, latency, response technician count, source failures, and authorization denials.
- Trace each source aggregation using `requestId` without logging tip amounts, commission amounts, or technician PII in ordinary application logs.
- The client may refresh today's data every `30–60` seconds. Historical data does not require polling.

## 13. Acceptance Criteria

1. One `GET` returns the columns Tech, Turns, Hours, Service, Commission, Tip, Comm %, and Tech takes for the selected location and date.
2. Omitting `businessDate` returns today according to the location timezone.
3. The selected date is applied identically to all seven value columns.
4. Future and invalid dates return the documented `400` errors.
5. Technicians active on the date appear even when every metric is zero.
6. Deactivated technicians remain visible on historical dates when they had membership or activity on that date.
7. An open current-day clock session is calculated through the response `asOf` timestamp.
8. A clock session crossing midnight is clipped correctly to the selected date.
9. Confirmed tips and signed adjustments aggregate correctly; pending, disputed, voided, rejected, and non-tip service charges are excluded.
10. Turn reversals and reassignment events produce the correct non-negative turn count.
11. Commission uses eligible net service sales and the effective-dated rate.
12. Finalized historical commission uses the stored snapshot and does not change when the current commission rate changes.
13. Tech takes equals Commission plus Tip for every row.
14. All monetary values are integer cents and commission percentage is represented in basis points.
15. A date with no activity returns `200`, zero metrics, and `hasActivity: false`.
16. Unauthorized users cannot infer the existence of another tenant's location or view all-technician pay data.
17. A required source failure returns `503` rather than a partial or internally inconsistent `200` response.

## 14. Out of Scope

- Creating, editing, activating, or deactivating technicians
- Updating commission rates or other pay settings
- Weekly guarantees and pay-model calculations
- Bonuses, deductions, tax withholding, gross pay, and net pay
- Sending payouts or changing payout status
- Payroll finalization and Tax IQ synchronization
- Date ranges, weekly summaries, exports, pagination, and table/card view preferences
- Technician self-service access to their own pay data
