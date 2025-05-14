-- Add referral system fields to users table
ALTER TABLE users
ADD COLUMN referral_code VARCHAR UNIQUE,
ADD COLUMN referred_by VARCHAR,
ADD COLUMN referral_count INTEGER DEFAULT 0;

-- Create index for faster lookups
CREATE INDEX idx_users_referral_code ON users(referral_code);
CREATE INDEX idx_users_referred_by ON users(referred_by);

-- Function to generate a unique referral code
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TRIGGER AS $$
DECLARE
    new_code VARCHAR;
    is_unique BOOLEAN;
BEGIN
    -- Keep trying until we find a unique code
    LOOP
        -- Generate a random 8-character alphanumeric code
        new_code := upper(
            substr(
                encode(gen_random_bytes(6), 'base64'),
                1, 8
            )
        );
        
        -- Replace any non-alphanumeric characters with random letters
        new_code := regexp_replace(new_code, '[^A-Z0-9]', 
            chr(65 + floor(random() * 26)::integer)::text, 'g');
        
        -- Check if the code is unique
        SELECT NOT EXISTS (
            SELECT 1 FROM users WHERE referral_code = new_code
        ) INTO is_unique;
        
        -- If the code is unique, we can use it
        IF is_unique THEN
            EXIT;
        END IF;
    END LOOP;
    
    -- Set the new referral code
    NEW.referral_code := new_code;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically generate referral code for new users
CREATE TRIGGER set_referral_code
    BEFORE INSERT ON users
    FOR EACH ROW
    WHEN (NEW.referral_code IS NULL)
    EXECUTE FUNCTION generate_referral_code();

-- Function to update referral stats when a new user is added
CREATE OR REPLACE FUNCTION update_referral_stats()
RETURNS TRIGGER AS $$
DECLARE
    referrer_id UUID;
    current_end_date TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Only proceed if the new user has a referrer
    IF NEW.referred_by IS NOT NULL THEN
        -- Get the referrer's ID
        SELECT id INTO referrer_id
        FROM users
        WHERE referral_code = NEW.referred_by;
        
        IF referrer_id IS NOT NULL THEN
            -- Get the referrer's current subscription end date
            SELECT subscription_end_date INTO current_end_date
            FROM users
            WHERE id = referrer_id;
            
            -- Update referrer's stats
            UPDATE users
            SET 
                referral_count = referral_count + 1,
                subscription_end_date = CASE
                    -- If no current subscription or expired, set to 7 days from now
                    WHEN current_end_date IS NULL OR current_end_date < NOW() THEN
                        NOW() + INTERVAL '7 days'
                    -- If active subscription, add 7 days to current end date
                    ELSE
                        current_end_date + INTERVAL '7 days'
                END
            WHERE id = referrer_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update referral stats after a new user is added
CREATE TRIGGER update_referral_stats
    AFTER INSERT ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_referral_stats(); 