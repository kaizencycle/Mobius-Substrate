# API Specification: City-State GDP Endpoint

**Version:** 1.0.0  
**Date:** December 3, 2025  
**Status:** Draft  
**System:** Mobius HIVE

---

## Overview

This document specifies the `//api/citystate/gdp` endpoint for calculating City-State digital GDP in the Mobius HIVE system.

The endpoint implements the canonical Yellow Paper formula:

```
GDP_state = V_KS + V_MIC_inflows

Where:
  V_KS = N_tx × avg_KS_per_tx × KS_price
  V_MIC_inflows = (MIC_grants + MIC_staking + MIC_other) × MIC_price
```

---

## Endpoint

### POST `//api/citystate/gdp`

Calculates the digital GDP for a City-State based on provided economic parameters.

---

## Request

### Headers

```
Content-Type: application/json
Accept: application/json
Authorization: Bearer <token>  (optional, for authenticated access)
```

### Body Schema

See: [`schemas/citystate-gdp-request.json`](../schemas/citystate-gdp-request.json)

**Required Fields:**

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `citystate_name` | string | City-State name or ID | `"Aurora"` |
| `mic_price_usd` | number | Current MIC price (USD) | `120000` |
| `ks_price_usd` | number | Current KS price (USD) | `100` |
| `n_tx` | integer | Number of KS transactions | `5000000` |
| `avg_ks_per_tx` | number | Average KS per transaction | `0.2` |
| `mic_grants_per_year` | number | MIC grants allocated | `200` |
| `mic_staking_per_year` | number | MIC staking rewards | `50` |

**Optional Fields:**

| Field | Type | Description | Default |
|-------|------|-------------|---------|
| `mic_other_per_year` | number | Other MIC inflows | `0` |
| `period` | string | Time period | `"annual"` |
| `epoch` | integer | Epoch number | - |

### Example Request

```json
{
  "citystate_name": "Aurora",
  "mic_price_usd": 120000,
  "ks_price_usd": 100,
  "n_tx": 5000000,
  "avg_ks_per_tx": 0.2,
  "mic_grants_per_year": 200,
  "mic_staking_per_year": 50,
  "mic_other_per_year": 0,
  "period": "annual",
  "epoch": 27
}
```

---

## Response

### Success (200 OK)

#### Body Schema

See: [`schemas/citystate-gdp-response.json`](../schemas/citystate-gdp-response.json)

**Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `citystate_name` | string | City-State name |
| `v_ks_usd` | number | KS transaction value (USD) |
| `v_mic_inflows_usd` | number | MIC inflow value (USD) |
| `gdp_state_usd` | number | Total GDP (USD) |
| `ks_share_percent` | number | KS percentage of GDP |
| `mic_share_percent` | number | MIC percentage of GDP |
| `economy_type` | string | Economy classification |
| `timestamp` | string (ISO 8601) | Calculation timestamp |
| `calculation_metadata` | object | Additional metadata |

#### Example Response

```json
{
  "citystate_name": "Aurora",
  "v_ks_usd": 100000000.0,
  "v_mic_inflows_usd": 30000000.0,
  "gdp_state_usd": 130000000.0,
  "ks_share_percent": 76.92,
  "mic_share_percent": 23.08,
  "economy_type": "participation-heavy",
  "timestamp": "2025-12-03T13:00:00Z",
  "calculation_metadata": {
    "period": "annual",
    "epoch": 27,
    "formula_version": "1.0.0"
  }
}
```

### Error Responses

#### 400 Bad Request

**Cause:** Missing required fields or invalid input

```json
{
  "error": "Missing required field: mic_price_usd",
  "status": 400,
  "timestamp": "2025-12-03T13:00:00Z"
}
```

#### 401 Unauthorized

**Cause:** Missing or invalid authentication token

```json
{
  "error": "Authentication required",
  "status": 401,
  "timestamp": "2025-12-03T13:00:00Z"
}
```

#### 500 Internal Server Error

**Cause:** Server-side processing error

```json
{
  "error": "Invalid request payload or internal error",
  "status": 500,
  "timestamp": "2025-12-03T13:00:00Z"
}
```

---

## Implementation Notes

### Economy Type Classification

The `economy_type` field is determined by the GDP composition:

```typescript
if (ks_share_percent > 60) {
  economy_type = "participation-heavy"
} else if (mic_share_percent > 60) {
  economy_type = "infrastructure-heavy"
} else {
  economy_type = "balanced"
}
```

### Calculation Formula

**Step 1: Calculate KS Component**

```
V_KS = n_tx × avg_ks_per_tx × ks_price_usd
```

**Step 2: Calculate MIC Component**

```
total_mic_inflows = mic_grants_per_year + mic_staking_per_year + mic_other_per_year
V_MIC_inflows = total_mic_inflows × mic_price_usd
```

**Step 3: Calculate Total GDP**

```
GDP_state = V_KS + V_MIC_inflows
```

**Step 4: Calculate Shares**

```
ks_share_percent = (V_KS / GDP_state) × 100
mic_share_percent = (V_MIC_inflows / GDP_state) × 100
```

---

## Next.js Implementation Example

### Route Handler: `app//api/citystate/gdp/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';

type CityStateGDPRequest = {
  citystate_name: string;
  mic_price_usd: number;
  ks_price_usd: number;
  n_tx: number;
  avg_ks_per_tx: number;
  mic_grants_per_year: number;
  mic_staking_per_year: number;
  mic_other_per_year?: number;
};

type CityStateGDPResponse = {
  citystate_name: string;
  v_ks_usd: number;
  v_mic_inflows_usd: number;
  gdp_state_usd: number;
  ks_share_percent: number;
  mic_share_percent: number;
  economy_type: string;
  timestamp: string;
};

function calculateGDP(payload: CityStateGDPRequest): CityStateGDPResponse {
  const {
    citystate_name,
    mic_price_usd,
    ks_price_usd,
    n_tx,
    avg_ks_per_tx,
    mic_grants_per_year,
    mic_staking_per_year,
    mic_other_per_year = 0,
  } = payload;

  const v_ks_usd = n_tx * avg_ks_per_tx * ks_price_usd;

  const total_mic_inflows =
    mic_grants_per_year + mic_staking_per_year + mic_other_per_year;
  const v_mic_inflows_usd = total_mic_inflows * mic_price_usd;

  const gdp_state_usd = v_ks_usd + v_mic_inflows_usd;

  const ks_share_percent = gdp_state_usd === 0 ? 0 : (v_ks_usd / gdp_state_usd) * 100;
  const mic_share_percent = gdp_state_usd === 0 ? 0 : (v_mic_inflows_usd / gdp_state_usd) * 100;

  let economy_type = "balanced";
  if (ks_share_percent > 60) economy_type = "participation-heavy";
  else if (mic_share_percent > 60) economy_type = "infrastructure-heavy";

  return {
    citystate_name,
    v_ks_usd,
    v_mic_inflows_usd,
    gdp_state_usd,
    ks_share_percent,
    mic_share_percent,
    economy_type,
    timestamp: new Date().toISOString(),
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<CityStateGDPRequest>;

    const requiredFields: (keyof CityStateGDPRequest)[] = [
      'citystate_name',
      'mic_price_usd',
      'ks_price_usd',
      'n_tx',
      'avg_ks_per_tx',
      'mic_grants_per_year',
      'mic_staking_per_year',
    ];

    for (const field of requiredFields) {
      if (body[field] === undefined || body[field] === null) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    const payload: CityStateGDPRequest = {
      citystate_name: String(body.citystate_name),
      mic_price_usd: Number(body.mic_price_usd),
      ks_price_usd: Number(body.ks_price_usd),
      n_tx: Number(body.n_tx),
      avg_ks_per_tx: Number(body.avg_ks_per_tx),
      mic_grants_per_year: Number(body.mic_grants_per_year),
      mic_staking_per_year: Number(body.mic_staking_per_year),
      mic_other_per_year:
        body.mic_other_per_year !== undefined
          ? Number(body.mic_other_per_year)
          : 0,
    };

    const result = calculateGDP(payload);
    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error('Error in //api/citystate/gdp:', err);
    return NextResponse.json(
      { error: 'Invalid request payload or internal error' },
      { status: 500 }
    );
  }
}
```

---

## Rate Limiting

**Recommended limits:**

- **Authenticated users:** 100 requests/minute
- **Unauthenticated users:** 10 requests/minute

---

## Caching Strategy

**Recommended caching:**

- Cache results for 5 minutes per unique input combination
- Invalidate cache when MIC/KS prices update significantly (>1% change)

---

## Security Considerations

1. **Input Validation**
   - Validate all numeric inputs are positive
   - Sanitize string inputs
   - Enforce reasonable bounds (e.g., `n_tx < 1e12`)

2. **Authentication**
   - Optional for public reads
   - Required for bulk operations
   - Rate limit by IP or user

3. **Data Privacy**
   - Do not expose sensitive City-State internals
   - Log requests for audit trail

---

## Testing

### Unit Test Example

```typescript
describe('//api/citystate/gdp', () => {
  it('should calculate GDP correctly for Aurora example', async () => {
    const request = {
      citystate_name: "Aurora",
      mic_price_usd: 120000,
      ks_price_usd: 100,
      n_tx: 5000000,
      avg_ks_per_tx: 0.2,
      mic_grants_per_year: 200,
      mic_staking_per_year: 50,
    };

    const response = await fetch('//api/citystate/gdp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.gdp_state_usd).toBeCloseTo(130000000);
    expect(data.v_ks_usd).toBeCloseTo(100000000);
    expect(data.v_mic_inflows_usd).toBeCloseTo(30000000);
    expect(data.economy_type).toBe("participation-heavy");
  });

  it('should return 400 for missing required fields', async () => {
    const request = {
      citystate_name: "Aurora",
      // Missing other required fields
    };

    const response = await fetch('//api/citystate/gdp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    expect(response.status).toBe(400);
  });
});
```

---

## Change Log

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-12-03 | Initial specification |

---

## References

- [Mobius Yellow Paper (Math Edition)](../whitepaper/Mobius-Yellow-Paper-Math-Edition.md)
- [Chapter 7: Economics of Mobius](../whitepaper/Chapter-07-Economics-of-Mobius.md)
- [JSON Schema: GDP Request](../schemas/citystate-gdp-request.json)
- [JSON Schema: GDP Response](../schemas/citystate-gdp-response.json)

---

**End of API Specification**

*"We heal as we walk." — Mobius Systems*
