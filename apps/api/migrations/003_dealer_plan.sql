-- Migration 003: Add plan column to dealer_subscriptions
ALTER TABLE dealer_subscriptions
  ADD COLUMN IF NOT EXISTS plan VARCHAR(10) NOT NULL DEFAULT 'annual';
