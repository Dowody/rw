-- Add referral system fields to users table
ALTER TABLE users
ADD COLUMN referral_code VARCHAR UNIQUE,
ADD COLUMN referred_by VARCHAR,
ADD COLUMN referral_count INTEGER DEFAULT 0;

-- Create index for faster lookups
CREATE INDEX idx_users_referral_code ON users(referral_code);
CREATE INDEX idx_users_referred_by ON users(referred_by);

-- Create function to generate unique referral code
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TRIGGER AS $$
DECLARE
    new_code VARCHAR;
    code_exists BOOLEAN;
BEGIN
    -- Generate a random 8-character code
    new_code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT), 1, 8));
    
    -- Check if code exists
    SELECT EXISTS(SELECT 1 FROM users WHERE referral_code = new_code) INTO code_exists;
    
    -- If code exists, generate a new one
    WHILE code_exists LOOP
        new_code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT), 1, 8));
        SELECT EXISTS(SELECT 1 FROM users WHERE referral_code = new_code) INTO code_exists;
    END LOOP;
    
    -- Set the new referral code
    NEW.referral_code := new_code;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically generate referral code
CREATE TRIGGER set_referral_code
    BEFORE INSERT ON users
    FOR EACH ROW
    WHEN (NEW.referral_code IS NULL)
    EXECUTE FUNCTION generate_referral_code();

-- Create function to update referral count and extend subscription
CREATE OR REPLACE FUNCTION update_referral_stats()
RETURNS TRIGGER AS $$
DECLARE
    current_end_date TIMESTAMP;
BEGIN
    -- Update referral count and extend subscription for the referrer
    IF NEW.referred_by IS NOT NULL THEN
        -- Get current subscription end date
        SELECT subscription_end_date INTO current_end_date
        FROM users
        WHERE referral_code = NEW.referred_by;

        -- Update user's referral count and extend subscription by 7 days
        UPDATE users
        SET 
            referral_count = referral_count + 1,
            subscription_end_date = CASE
                -- If no current subscription, set to 7 days from now
                WHEN current_end_date IS NULL THEN NOW() + INTERVAL '7 days'
                -- If current subscription is expired, set to 7 days from now
                WHEN current_end_date < NOW() THEN NOW() + INTERVAL '7 days'
                -- If active subscription, add 7 days to current end date
                ELSE current_end_date + INTERVAL '7 days'
            END
        WHERE referral_code = NEW.referred_by;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update referral stats
CREATE TRIGGER update_referral_stats
    AFTER INSERT ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_referral_stats(); 