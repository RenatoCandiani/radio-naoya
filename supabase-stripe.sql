-- ============================================================
-- MIGRAÇÃO: Campos do Stripe na tabela radios
-- Cole no SQL Editor do Supabase e execute.
-- ============================================================

ALTER TABLE radios ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE radios ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
