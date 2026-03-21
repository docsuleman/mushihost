# MushiHost Integration — MyQBank

## Overview

MyQBank uses MushiHost for credit pack purchases. Users click "Buy Credits" on the Pricing page, get redirected to MushiHost for payment via Stripe, and credits are automatically added to their account after payment.

## Already Done

The MyQBank integration is **already implemented**:

- `src/Helpers/MushiHostOP.js` — API helper (createPaymentLink, redirectToPayment, getMyQBankProducts)
- `src/components/HomeComponents/Pricing.jsx` — Updated to use MushiHost payment buttons

## Setup Steps

### 1. Environment Variable

Add to your `.env` file:

```env
VITE_MUSHI_API_KEY=<your-myqbank-api-key>
```

This key must match the `MUSHI_API_KEY_MYQBANK` secret set on the Supabase Edge Functions.

### 2. Products (Already Seeded)

These products exist in the `mushi_products` table with `site = 'myqbank'`:

| Name | Type | Price | Grants |
|------|------|-------|--------|
| 10 Credits | credit_pack | $15.00 | `{"credits": 10}` |
| 20 Credits | credit_pack | $25.00 | `{"credits": 20}` |
| 100 Credits | credit_pack | $50.00 | `{"credits": 100}` |
| 250 Credits | credit_pack | $100.00 | `{"credits": 250}` |
| 500 AI Credits | one_time | $5.00 | `{"ai_credits": 500}` |

### 3. How the Payment Flow Works

```
User clicks "Buy 100 Credits" on Pricing page
        ↓
Pricing.jsx calls redirectToPayment(productId)
        ↓
MushiHostOP.js calls edge function: mushi-create-payment-link
  Body: { product_id, source_site: "myqbank", source_user_id, source_user_email }
  Header: X-Mushi-Api-Key: <VITE_MUSHI_API_KEY>
        ↓
Edge function returns: { url: "https://payment.mushihost.com/pay/<token>" }
        ↓
User redirected to MushiHost payment page
        ↓
User enters card details (Stripe Elements)
        ↓
Payment processed → Stripe webhook fires
        ↓
Fulfillment: INSERT into Credits table
  → credits added to user's MyQBank account
        ↓
User redirected back to MyQBank (return_url from context)
```

### 4. Fulfillment (Automatic)

After successful payment, the `mushi-stripe-webhook` edge function automatically:

1. Looks up the product's `grants` field (e.g. `{"credits": 100}`)
2. Finds the MyQBank user via `mushi_customers.supabase_user_id`
3. Inserts a row into the `Credits` table:
   ```sql
   INSERT INTO "Credits" ("userId", "Credit", "reason", "createdAt")
   VALUES (<user_id>, 100, 'MushiHost purchase: 100 Credits', now())
   ```
4. For AI credits (`ai_credits` in grants), inserts into `ai_credits` table instead

### 5. API Reference

#### Create Payment Link

```
POST https://db.myqbanks.com/functions/v1/mushi-create-payment-link

Headers:
  Authorization: Bearer <supabase-anon-key>
  X-Mushi-Api-Key: <MUSHI_API_KEY_MYQBANK>
  Content-Type: application/json

Body:
{
  "product_id": "<uuid from mushi_products>",
  "source_site": "myqbank",
  "source_user_id": "<auth.users.id>",
  "source_user_email": "user@example.com",
  "context": {
    "return_url": "https://myqbanks.com"
  }
}

Response:
{
  "url": "https://payment.mushihost.com/pay/<token>",
  "token": "<64-char hex>",
  "expires_at": "2026-03-22T12:00:00Z",
  "amount_usd": 50.00,
  "product_name": "100 Credits"
}
```

#### Get Products

Since MyQBank shares the same Supabase instance, you can query products directly:

```js
const { data } = await supabase
  .from('mushi_products')
  .select('*')
  .eq('site', 'myqbank')
  .eq('is_active', true)
  .order('sort_order');
```

### 6. Files Modified in MyQBank

| File | Changes |
|------|---------|
| `src/Helpers/MushiHostOP.js` | New file — createPaymentLink, redirectToPayment, getMyQBankProducts |
| `src/components/HomeComponents/Pricing.jsx` | Replaced WhatsApp links with MushiHost payment buttons. Added loading/error states. Fetches product IDs from mushi_products on mount. |
