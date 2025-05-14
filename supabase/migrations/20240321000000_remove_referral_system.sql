-- Drop triggers first
DROP TRIGGER IF EXISTS update_referral_stats ON users;
DROP TRIGGER IF EXISTS set_referral_code ON users;

-- Drop functions
DROP FUNCTION IF EXISTS update_referral_stats();
DROP FUNCTION IF EXISTS generate_referral_code();

-- Drop indexes
DROP INDEX IF EXISTS idx_users_referral_code;
DROP INDEX IF EXISTS idx_users_referred_by;

-- Remove columns from users table
ALTER TABLE users
DROP COLUMN IF EXISTS referral_code,
DROP COLUMN IF EXISTS referred_by,
DROP COLUMN IF EXISTS referral_count; 