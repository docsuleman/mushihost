# MushiHost Integration — FreemedTube

## Overview

FreemedTube uses MushiHost for membership subscriptions (Bronze, Silver, Gold). Users click "Subscribe" on the membership page, get redirected to MushiHost for payment, and their membership is automatically activated via an internal API call.

## Products (Already Seeded)

These products exist in the `mushi_products` table with `site = 'freemedtube'`:

| Name | Type | Price | Interval | Grants |
|------|------|-------|----------|--------|
| Bronze | subscription | $15.00 | month | `{"tier": "bronze"}` |
| Silver | subscription | $50.00 | 6_months | `{"tier": "silver", "mqb_credits": 10}` |
| Gold | subscription | $100.00 | year | `{"tier": "gold", "mqb_credits": 20}` |

> Silver and Gold also grant MyQBank credits as a cross-platform bonus.

## Setup Steps

### 1. Create API Helper

Create a new file `resources/js/helpers/mushihost.js` (or wherever your JS helpers live):

```js
const MUSHI_API_KEY = process.env.MIX_MUSHI_API_KEY || '';
const SUPABASE_URL = 'https://db.myqbanks.com';
const SUPABASE_ANON_KEY = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTczNTE1NzQ2MCwiZXhwIjo0ODkwODMxMDYwLCJyb2xlIjoiYW5vbiJ9.ZkGjj3uKA7_m0J4SN0BszuOnG0Sqfz-DIIwFRTvYWKc';

/**
 * Create a MushiHost payment link for a FreemedTube user.
 *
 * @param {string} productId - UUID from mushi_products table
 * @param {number} userId - FreemedTube user ID (integer)
 * @param {string} userEmail - User's email
 * @param {object} context - Optional context (e.g. return_url)
 * @returns {{ url: string, token: string, expires_at: string }}
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
      source_site: 'freemedtube',
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
 * Fetch FreemedTube products from MushiHost.
 */
export async function getProducts() {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/mushi_products?site=eq.freemedtube&is_active=eq.true&order=sort_order`,
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

Add to your `.env` file:

```env
MIX_MUSHI_API_KEY=<your-freemedtube-api-key>
```

This must match the `MUSHI_API_KEY_FREEMEDTUBE` secret on the Supabase Edge Functions.

### 3. Wire Up the Membership Page

On your membership/pricing page, fetch products on load and add click handlers:

```jsx
// Example React component
const [products, setProducts] = useState([]);

useEffect(() => {
  getProducts().then(setProducts);
}, []);

// On button click:
const handleSubscribe = (product) => {
  redirectToPayment(product.id, currentUser.id, currentUser.email);
};
```

### 4. Internal Fulfillment Endpoint (REQUIRED)

After payment, MushiHost will call your backend to activate the membership. You need to create this endpoint:

```
POST https://api.freemedtube.net/api/v1/internal/activate-membership

Headers:
  X-Mushi-Secret: <FREEMEDTUBE_INTERNAL_SECRET>
  Content-Type: application/json

Body:
{
  "email": "user@example.com",
  "freemedtube_user_id": 12345,
  "tier": "gold",
  "period_start": "2026-03-21T00:00:00Z",
  "period_end": "2027-03-21T00:00:00Z",
  "grants": { "tier": "gold", "mqb_credits": 20 }
}

Expected Response:
{ "success": true }
```

#### PHP Implementation Example

```php
// routes/api.php
Route::post('/v1/internal/activate-membership', [MembershipController::class, 'activateFromMushi'])
    ->middleware('verify.mushi.secret');

// app/Http/Middleware/VerifyMushiSecret.php
public function handle($request, Closure $next) {
    $secret = config('services.mushihost.internal_secret');
    if ($request->header('X-Mushi-Secret') !== $secret) {
        return response()->json(['error' => 'Unauthorized'], 403);
    }
    return $next($request);
}

// app/Http/Controllers/MembershipController.php
public function activateFromMushi(Request $request) {
    $data = $request->validate([
        'email' => 'required|email',
        'freemedtube_user_id' => 'required|integer',
        'tier' => 'required|string',
        'period_start' => 'required|date',
        'period_end' => 'required|date',
    ]);

    $user = User::find($data['freemedtube_user_id']);
    if (!$user) {
        return response()->json(['error' => 'User not found'], 404);
    }

    $user->update([
        'membership_tier' => $data['tier'],
        'membership_expires_at' => $data['period_end'],
    ]);

    return response()->json(['success' => true]);
}
```

Add to `.env`:

```env
MUSHI_INTERNAL_SECRET=<shared-secret-with-mushihost>
```

### 5. Payment Flow

```
User clicks "Subscribe Gold" on FreemedTube
        ↓
Frontend calls createPaymentLink(productId, userId, email)
        ↓
Edge function returns: { url: "https://mushihost.com/pay/<token>" }
        ↓
User redirected to MushiHost → enters card details
        ↓
Stripe processes payment → webhook fires
        ↓
Fulfillment:
  1. POST api.freemedtube.net/api/v1/internal/activate-membership
     → activates Gold membership for user
  2. If grants include mqb_credits:
     → adds 20 credits to MyQBank Credits table
        ↓
User redirected back to FreemedTube
```

### 6. Subscription Renewal

For recurring subscriptions (Bronze = monthly, Silver = 6 months, Gold = yearly):

- Stripe automatically charges the card on renewal
- Webhook fires → membership re-activated via the same internal endpoint
- A renewal reminder email is sent 24 hours before via MushiHost

### 7. Manage Subscription

Users can manage their subscription from the MushiHost dashboard:
- Cancel at period end
- Update payment method
- View payment history

Link to: `https://mushihost.com/dashboard`
