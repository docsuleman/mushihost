-- Auto-renewal with 15% discount support
-- Adds auto_renew flag to payment links and discount tracking to payments/subscriptions

ALTER TABLE mushi_payment_links ADD COLUMN IF NOT EXISTS auto_renew BOOLEAN DEFAULT FALSE;
ALTER TABLE mushi_subscriptions ADD COLUMN IF NOT EXISTS discount_percent DECIMAL(5,2) DEFAULT 0;
ALTER TABLE mushi_subscriptions ADD COLUMN IF NOT EXISTS auto_renew BOOLEAN DEFAULT FALSE;
ALTER TABLE mushi_payments ADD COLUMN IF NOT EXISTS discount_percent DECIMAL(5,2) DEFAULT 0;
ALTER TABLE mushi_payments ADD COLUMN IF NOT EXISTS original_amount_usd DECIMAL(10,2);

-- Store recurring Stripe Price ID on products for subscription creation
ALTER TABLE mushi_products ADD COLUMN IF NOT EXISTS stripe_price_id TEXT;
