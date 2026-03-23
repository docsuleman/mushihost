# MushiHost Integration — MyMedBooks

## Overview

MyMedBooks uses MushiHost for tier-based subscriptions (Silver, Golden, Platinum). Users click "Subscribe" on the pricing page, get redirected to MushiHost for payment, and their subscription tier is automatically activated via an internal API call.

## Products (Already Seeded)

These products exist in the `mushi_products` table with `site = 'mymedbooks'`:

| Name | Type | Price | Interval | Grants |
|------|------|-------|----------|--------|
| Silver | subscription | $9.99 | month | `{"tier": "silver", "level": 1}` |
| Golden | subscription | $19.99 | month | `{"tier": "golden", "level": 2}` |
| Platinum | subscription | $29.99 | month | `{"tier": "platinum", "level": 3}` |

## Setup Steps

### 1. Create API Helper

Create `src/helpers/mushihost.js` (or equivalent):

```js
const MUSHI_API_KEY = import.meta.env.VITE_MUSHI_API_KEY || '';
const SUPABASE_URL = 'https://db.myqbanks.com';
const SUPABASE_ANON_KEY = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTczNTE1NzQ2MCwiZXhwIjo0ODkwODMxMDYwLCJyb2xlIjoiYW5vbiJ9.ZkGjj3uKA7_m0J4SN0BszuOnG0Sqfz-DIIwFRTvYWKc';

/**
 * Create a MushiHost payment link.
 *
 * @param {string} productId - UUID from mushi_products table
 * @param {string} userId - MyMedBooks user ID (UUID)
 * @param {string} userEmail - User's email
 * @param {object} context - Optional context (e.g. return_url)
 */
export async function createPaymentLink(productId, userId, userEmail, context = {}) {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/mushi-create-payment-link`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'X-Mushi-Api-Key': MUSHI_API_KEY,
    },
    body: JSON.stringify({
      product_id: productId,
      source_site: 'mymedbooks',
      source_user_id: userId,
      source_user_email: userEmail,
      context: {
        ...context,
        return_url: window.location.origin,
      },
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to create payment link');
  }
  return res.json();
}

/**
 * Redirect user to MushiHost payment page.
 */
export async function redirectToPayment(productId, userId, userEmail, context = {}) {
  const link = await createPaymentLink(productId, userId, userEmail, context);
  window.location.href = link.url;
}

/**
 * Fetch MyMedBooks products from MushiHost.
 */
export async function getProducts() {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/mushi_products?site=eq.mymedbooks&is_active=eq.true&order=sort_order`,
    {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
    }
  );
  return res.json();
}
```

### 2. Environment Variable

Add to your `.env`:

```env
VITE_MUSHI_API_KEY=<your-mymedbooks-api-key>
```

This must match the `MUSHI_API_KEY_MYMEDBOOKS` secret on the Supabase Edge Functions.

### 3. Internal Fulfillment Endpoint (REQUIRED)

After payment, MushiHost will call your backend to activate the subscription. Create this FastAPI endpoint:

```
POST https://api.mymedbooks.com/api/internal/activate-subscription

Headers:
  X-Mushi-Secret: <MYMEDBOOKS_INTERNAL_SECRET>
  Content-Type: application/json

Body:
{
  "email": "user@example.com",
  "mymedbooks_user_id": "<uuid>",
  "tier": "platinum",
  "level": 3,
  "period_start": "2026-03-21T00:00:00Z",
  "period_end": "2026-04-21T00:00:00Z",
  "grants": { "tier": "platinum", "level": 3 }
}

Expected Response:
{ "success": true }
```

#### FastAPI Implementation Example

```python
# app/routers/internal.py
from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel
from datetime import datetime

router = APIRouter(prefix="/api/internal")

class ActivateSubscriptionRequest(BaseModel):
    email: str
    mymedbooks_user_id: str
    tier: str
    level: int
    period_start: datetime
    period_end: datetime
    grants: dict = {}

@router.post("/activate-subscription")
async def activate_subscription(
    body: ActivateSubscriptionRequest,
    x_mushi_secret: str = Header(...),
):
    if x_mushi_secret != settings.MUSHI_INTERNAL_SECRET:
        raise HTTPException(status_code=403, detail="Unauthorized")

    user = await get_user_by_id(body.mymedbooks_user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    await update_user_subscription(
        user_id=body.mymedbooks_user_id,
        tier=body.tier,
        level=body.level,
        expires_at=body.period_end,
    )

    return {"success": True}
```

Add to `.env`:

```env
MUSHI_INTERNAL_SECRET=<shared-secret-with-mushihost>
```

### 4. Payment Flow

```
User clicks "Subscribe Platinum" on MyMedBooks
        ↓
Frontend calls redirectToPayment(productId, userId, email)
        ↓
Edge function returns: { url: "https://mushihost.com/pay/<token>" }
        ↓
User redirected to MushiHost → enters card details
        ↓
Stripe processes payment → webhook fires
        ↓
Fulfillment:
  POST api.mymedbooks.com/api/internal/activate-subscription
  → activates Platinum tier for user
        ↓
User redirected back to MyMedBooks
```

### 5. Subscription Renewal

All MyMedBooks subscriptions are monthly. On renewal:
- Stripe auto-charges → webhook → internal endpoint called again
- Renewal reminder email sent 24 hours before

### 6. Manage Subscription

Link users to: `https://mushihost.com/dashboard`
