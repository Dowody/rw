-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    auth_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE,
    username TEXT UNIQUE,
    referral_code VARCHAR UNIQUE,
    referred_by VARCHAR,
    referral_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'active',
    subscription_end_date TIMESTAMPTZ
);

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_users_auth_id ON users(auth_id);
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code);
CREATE INDEX IF NOT EXISTS idx_users_referred_by ON users(referred_by);

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS set_referral_code ON users;
DROP TRIGGER IF EXISTS update_referral_stats ON users;

-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS handle_new_user();
DROP FUNCTION IF EXISTS generate_referral_code();
DROP FUNCTION IF EXISTS update_referral_stats();

-- Function to generate referral code
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

    NEW.referral_code := new_code;
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE LOG 'Error in generate_referral_code: %', SQLERRM;
        RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update referral stats
CREATE OR REPLACE FUNCTION update_referral_stats()
RETURNS TRIGGER AS $$
DECLARE
    referrer_record RECORD;
BEGIN
    -- If the new user was referred by someone
    IF NEW.referred_by IS NOT NULL THEN
        -- Get the referrer's record
        SELECT * INTO referrer_record
        FROM users
        WHERE referral_code = NEW.referred_by;

        -- If we found the referrer
        IF FOUND THEN
            -- Update referrer's stats
            UPDATE users
            SET 
                referral_count = referral_count + 1,
                total_referral_earnings = total_referral_earnings + 7.00, -- $7 per referral
                subscription_end_date = CASE
                    WHEN subscription_end_date IS NULL THEN NOW() + INTERVAL '7 days'
                    WHEN subscription_end_date < NOW() THEN NOW() + INTERVAL '7 days'
                    ELSE subscription_end_date + INTERVAL '7 days'
                END
            WHERE id = referrer_record.id;
        END IF;
    END IF;

    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE LOG 'Error in update_referral_stats: %', SQLERRM;
        RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    existing_user RECORD;
    username_exists BOOLEAN;
BEGIN
    -- Check if username is provided
    IF NEW.raw_user_meta_data->>'username' IS NULL THEN
        RAISE EXCEPTION 'Username is required';
    END IF;

    -- Check if username already exists
    SELECT EXISTS (
        SELECT 1 FROM users 
        WHERE username = NEW.raw_user_meta_data->>'username'
    ) INTO username_exists;

    IF username_exists THEN
        RAISE EXCEPTION 'Username already taken';
    END IF;

    -- Check if user already exists
    SELECT * INTO existing_user
    FROM users
    WHERE auth_id = NEW.id;

    -- If user doesn't exist, create new record
    IF NOT FOUND THEN
        INSERT INTO users (
            auth_id,
            email,
            username,
            avatar_url,
            current_subscription_id,
            subscription_start_date,
            subscription_end_date,
            total_purchases,
            total_spent,
            created_at,
            last_login,
            status,
            total_referral_earnings,
            referred_by
        ) VALUES (
            NEW.id, -- auth_id from auth.users
            NEW.email,
            NEW.raw_user_meta_data->>'username',
            NULL, -- avatar_url
            NULL, -- current_subscription_id
            NULL, -- subscription_start_date
            NULL, -- subscription_end_date
            0, -- total_purchases
            0.00, -- total_spent
            NOW(), -- created_at
            NOW(), -- last_login
            'active', -- status
            0.00, -- total_referral_earnings
            NEW.raw_user_meta_data->>'referred_by' -- referred_by from metadata
        );
    ELSE
        -- Update existing user's last login
        UPDATE users
        SET last_login = NOW()
        WHERE auth_id = NEW.id;
    END IF;

    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE LOG 'Error in handle_new_user: %', SQLERRM;
        RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

CREATE TRIGGER set_referral_code
    BEFORE INSERT ON users
    FOR EACH ROW
    WHEN (NEW.referral_code IS NULL)
    EXECUTE FUNCTION generate_referral_code();

CREATE TRIGGER update_referral_stats
    AFTER INSERT ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_referral_stats();

-- Create RLS policies for users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own data
CREATE POLICY "Users can read own data" ON users
    FOR SELECT
    USING (auth.uid() = auth_id);

-- Allow users to update their own data
CREATE POLICY "Users can update own data" ON users
    FOR UPDATE
    USING (auth.uid() = auth_id);

-- Allow public to check username availability
CREATE POLICY "Public can check username availability" ON users
    FOR SELECT
    USING (true);

-- Allow service role to manage all users
CREATE POLICY "Service role can manage all users" ON users
    FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role'); 