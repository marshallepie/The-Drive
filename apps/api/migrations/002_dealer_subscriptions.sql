-- Migration 002: Dealer Subscriptions
-- Tracks annual £600 dealer subscription with per-sale £100 rebate

CREATE TYPE subscription_status AS ENUM (
  'PENDING_PAYMENT',
  'ACTIVE',
  'LAPSED',
  'CANCELLED'
);

CREATE TABLE dealer_subscriptions (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id                   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status                      subscription_status NOT NULL DEFAULT 'PENDING_PAYMENT',
  subscription_year_start     TIMESTAMP WITH TIME ZONE,
  subscription_year_end       TIMESTAMP WITH TIME ZONE,
  amount_paid                 DECIMAL(10,2) NOT NULL DEFAULT 600.00,
  currency                    VARCHAR(3) NOT NULL DEFAULT 'GBP',
  stripe_checkout_session_id  VARCHAR(255),
  stripe_payment_intent_id    VARCHAR(255),
  rebate_earned               DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  qualifying_sales            INTEGER NOT NULL DEFAULT 0,
  created_at                  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at                  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- One subscription record per dealer
CREATE UNIQUE INDEX idx_dealer_subscriptions_dealer
  ON dealer_subscriptions(dealer_id);

CREATE INDEX idx_dealer_subscriptions_status
  ON dealer_subscriptions(status);

CREATE INDEX idx_dealer_subscriptions_stripe
  ON dealer_subscriptions(stripe_checkout_session_id)
  WHERE stripe_checkout_session_id IS NOT NULL;

CREATE TRIGGER update_dealer_subscriptions_updated_at
  BEFORE UPDATE ON dealer_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
