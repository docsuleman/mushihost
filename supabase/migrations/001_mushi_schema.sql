-- ============================================================
-- MushiHost Payment Gateway Schema
-- All tables use `mushi_` prefix to coexist in shared Supabase
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. mushi_customers — Unified cross-platform customer profile
-- ============================================================
CREATE TABLE mushi_customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  supabase_user_id UUID UNIQUE,         -- links to MyQBank auth.users
  freemedtube_user_id INTEGER UNIQUE,    -- links to FreemedTube users
  mymedbooks_user_id UUID UNIQUE,        -- links to MyMedBooks users
  stripe_customer_id TEXT UNIQUE,
  paypal_payer_id TEXT UNIQUE,
  default_payment_method_id UUID,        -- FK added after mushi_payment_methods
  -- Auto-load settings
  auto_load_enabled BOOLEAN DEFAULT FALSE,
  auto_load_mode TEXT DEFAULT 'notify' CHECK (auto_load_mode IN ('automatic', 'notify')),
  auto_load_max_monthly DECIMAL(10, 2) DEFAULT 100.00,
  auto_load_threshold INTEGER DEFAULT 5,
  auto_load_pack TEXT,
  auto_loaded_this_month DECIMAL(10, 2) DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_mushi_customers_email ON mushi_customers (email);

-- ============================================================
-- 2. mushi_payment_methods — Saved cards / PayPal
-- ============================================================
CREATE TABLE mushi_payment_methods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES mushi_customers(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('stripe', 'paypal')),
  external_id TEXT,
  type TEXT NOT NULL CHECK (type IN ('card', 'paypal')),
  card_brand TEXT,
  card_last4 TEXT,
  card_exp_month INTEGER,
  card_exp_year INTEGER,
  paypal_email TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_mushi_payment_methods_customer ON mushi_payment_methods (customer_id);

-- Add FK for default_payment_method_id
ALTER TABLE mushi_customers
  ADD CONSTRAINT fk_default_payment_method
  FOREIGN KEY (default_payment_method_id)
  REFERENCES mushi_payment_methods(id)
  ON DELETE SET NULL;

-- ============================================================
-- 3. mushi_products — What can be purchased
-- ============================================================
CREATE TABLE mushi_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site TEXT NOT NULL CHECK (site IN ('myqbank', 'freemedtube', 'mymedbooks')),
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('subscription', 'one_time', 'credit_pack')),
  price_usd DECIMAL(10, 2) NOT NULL,
  interval TEXT CHECK (interval IN ('month', '6_months', 'year')),
  interval_count INTEGER DEFAULT 1,
  grants JSONB,                          -- e.g. {"credits": 100} or {"tier": "gold", "mqb_credits": 20}
  stripe_price_id TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_mushi_products_site ON mushi_products (site, is_active);

-- ============================================================
-- 4. mushi_payment_links — Token-based payment URLs
-- ============================================================
CREATE TABLE mushi_payment_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  token TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES mushi_customers(id),
  product_id UUID NOT NULL REFERENCES mushi_products(id),
  source_site TEXT NOT NULL,
  source_user_id TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired')),
  amount_usd DECIMAL(10, 2) NOT NULL,
  context JSONB,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_mushi_payment_links_token ON mushi_payment_links (token);
CREATE INDEX idx_mushi_payment_links_status ON mushi_payment_links (status, expires_at);

-- ============================================================
-- 5. mushi_subscriptions — Recurring subscriptions
-- ============================================================
CREATE TABLE mushi_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES mushi_customers(id),
  product_id UUID NOT NULL REFERENCES mushi_products(id),
  payment_method_id UUID REFERENCES mushi_payment_methods(id),
  stripe_subscription_id TEXT UNIQUE,
  paypal_subscription_id TEXT UNIQUE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'past_due', 'paused', 'cancelled', 'expired')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  auto_renew BOOLEAN DEFAULT TRUE,
  granted JSONB,                         -- snapshot of product.grants at creation
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_mushi_subscriptions_customer ON mushi_subscriptions (customer_id, status);
CREATE INDEX idx_mushi_subscriptions_stripe ON mushi_subscriptions (stripe_subscription_id);

-- ============================================================
-- 6. mushi_payments — Every payment transaction
-- ============================================================
CREATE TABLE mushi_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES mushi_customers(id),
  subscription_id UUID REFERENCES mushi_subscriptions(id),
  payment_link_id UUID REFERENCES mushi_payment_links(id),
  payment_method_id UUID REFERENCES mushi_payment_methods(id),
  amount_usd DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'usd',
  provider TEXT NOT NULL CHECK (provider IN ('stripe', 'paypal')),
  provider_payment_id TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'succeeded', 'failed', 'refunded')),
  product_id UUID REFERENCES mushi_products(id),
  description TEXT,
  failure_reason TEXT,
  fulfilled BOOLEAN DEFAULT FALSE,
  fulfilled_at TIMESTAMPTZ,
  fulfillment_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_mushi_payments_customer ON mushi_payments (customer_id);
CREATE INDEX idx_mushi_payments_provider ON mushi_payments (provider_payment_id);
CREATE INDEX idx_mushi_payments_link ON mushi_payments (payment_link_id);

-- ============================================================
-- 7. mushi_invoices — Invoice records
-- ============================================================
CREATE TABLE mushi_invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_id UUID REFERENCES mushi_payments(id),
  customer_id UUID NOT NULL REFERENCES mushi_customers(id),
  invoice_number TEXT UNIQUE NOT NULL,
  amount_usd DECIMAL(10, 2) NOT NULL,
  tax_usd DECIMAL(10, 2) DEFAULT 0.00,
  total_usd DECIMAL(10, 2) NOT NULL,
  line_items JSONB,
  pdf_url TEXT,
  status TEXT DEFAULT 'finalized' CHECK (status IN ('draft', 'finalized', 'void')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_mushi_invoices_customer ON mushi_invoices (customer_id);

-- ============================================================
-- 8. mushi_webhook_events — Idempotent webhook log
-- ============================================================
CREATE TABLE mushi_webhook_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider TEXT NOT NULL,
  event_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  processed BOOLEAN DEFAULT FALSE,
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (provider, event_id)
);

-- ============================================================
-- 9. mushi_reminders — Scheduled notifications
-- ============================================================
CREATE TABLE mushi_reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES mushi_customers(id),
  subscription_id UUID REFERENCES mushi_subscriptions(id),
  type TEXT NOT NULL CHECK (type IN ('renewal_reminder', 'payment_failed', 'credit_low')),
  scheduled_for TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_mushi_reminders_scheduled ON mushi_reminders (scheduled_for, sent_at);

-- ============================================================
-- 10. mushi_auto_load_log — Auto-charge event log
-- ============================================================
CREATE TABLE mushi_auto_load_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES mushi_customers(id),
  payment_id UUID REFERENCES mushi_payments(id),
  credits_before INTEGER,
  credits_after INTEGER,
  amount_charged DECIMAL(10, 2),
  status TEXT CHECK (status IN ('succeeded', 'failed')),
  failure_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_mushi_auto_load_customer ON mushi_auto_load_log (customer_id);

-- ============================================================
-- Helper: auto-update updated_at timestamp
-- ============================================================
CREATE OR REPLACE FUNCTION mushi_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_mushi_customers_updated
  BEFORE UPDATE ON mushi_customers
  FOR EACH ROW EXECUTE FUNCTION mushi_update_timestamp();

CREATE TRIGGER trg_mushi_subscriptions_updated
  BEFORE UPDATE ON mushi_subscriptions
  FOR EACH ROW EXECUTE FUNCTION mushi_update_timestamp();

-- ============================================================
-- Helper: generate next invoice number
-- ============================================================
CREATE OR REPLACE FUNCTION mushi_next_invoice_number()
RETURNS TEXT AS $$
DECLARE
  curr_year TEXT;
  next_seq INTEGER;
  result TEXT;
BEGIN
  curr_year := TO_CHAR(NOW(), 'YYYY');
  SELECT COALESCE(MAX(
    CAST(SPLIT_PART(invoice_number, '-', 3) AS INTEGER)
  ), 0) + 1
  INTO next_seq
  FROM mushi_invoices
  WHERE invoice_number LIKE 'MH-' || curr_year || '-%';

  result := 'MH-' || curr_year || '-' || LPAD(next_seq::TEXT, 4, '0');
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- SEED: Products
-- ============================================================

-- MyQBank Credit Packs
INSERT INTO mushi_products (site, name, description, type, price_usd, interval, grants, sort_order) VALUES
  ('myqbank', '10 Credits',     'Get 10 exam practice credits',       'credit_pack', 15.00,  NULL, '{"credits": 10}',    1),
  ('myqbank', '20 Credits',     'Get 20 exam practice credits',       'credit_pack', 25.00,  NULL, '{"credits": 20}',    2),
  ('myqbank', '100 Credits',    'Get 100 exam practice credits',      'credit_pack', 50.00,  NULL, '{"credits": 100}',   3),
  ('myqbank', '250 Credits',    'Get 250 exam practice credits',      'credit_pack', 100.00, NULL, '{"credits": 250}',   4),
  ('myqbank', '500 AI Credits', 'AI-powered question explanations',   'one_time',    5.00,   NULL, '{"ai_credits": 500}', 5);

-- FreemedTube Memberships
INSERT INTO mushi_products (site, name, description, type, price_usd, interval, grants, sort_order) VALUES
  ('freemedtube', 'Bronze', 'Monthly access to premium videos',                        'subscription', 15.00,  'month',    '{"tier": "bronze"}',                          1),
  ('freemedtube', 'Silver', '6-month access + 10 MyQBank credits',                     'subscription', 50.00,  '6_months', '{"tier": "silver", "mqb_credits": 10}',       2),
  ('freemedtube', 'Gold',   'Annual access + 20 MyQBank credits',                      'subscription', 100.00, 'year',     '{"tier": "gold", "mqb_credits": 20}',         3);

-- MyMedBooks Tiers
INSERT INTO mushi_products (site, name, description, type, price_usd, interval, grants, sort_order) VALUES
  ('mymedbooks', 'Silver',   'Basic access to medical textbooks',   'subscription', 9.99,  'month', '{"tier": "silver", "level": 1}',   1),
  ('mymedbooks', 'Golden',   'Extended library access',             'subscription', 19.99, 'month', '{"tier": "golden", "level": 2}',   2),
  ('mymedbooks', 'Platinum', 'Full library + priority support',     'subscription', 29.99, 'month', '{"tier": "platinum", "level": 3}', 3);

-- ============================================================
-- pg_cron jobs (run these manually in Supabase SQL editor)
-- ============================================================
-- SELECT cron.schedule('mushi_expire_links',     '0 * * * *',     $$UPDATE mushi_payment_links SET status = 'expired' WHERE status = 'pending' AND expires_at < NOW()$$);
-- SELECT cron.schedule('mushi_reset_auto_load',  '0 0 1 * *',     $$UPDATE mushi_customers SET auto_loaded_this_month = 0 WHERE auto_load_enabled = TRUE$$);
-- SELECT cron.schedule('mushi_send_reminders',   '0 10 * * *',    $$SELECT net.http_post(url := 'https://db.myqbanks.com/functions/v1/mushi-send-reminders', headers := '{"Authorization": "Bearer <service_role_key>"}')$$);
-- SELECT cron.schedule('mushi_auto_load_check',  '0 */4 * * *',   $$SELECT net.http_post(url := 'https://db.myqbanks.com/functions/v1/mushi-auto-load', headers := '{"Authorization": "Bearer <service_role_key>"}')$$);
