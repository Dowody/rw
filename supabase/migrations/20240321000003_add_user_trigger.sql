-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    auth_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE,
    username TEXT UNIQUE,
    referred_by VARCHAR,
    referral_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'active',
    subscription_end_date TIMESTAMPTZ,
    total_referral_earnings NUMERIC(10, 2) DEFAULT 0.00,
    last_login TIMESTAMPTZ
);

-- Add missing columns to users table
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS referred_by VARCHAR,
ADD COLUMN IF NOT EXISTS referral_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_referral_earnings NUMERIC(10, 2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_users_auth_id ON users(auth_id);
CREATE INDEX IF NOT EXISTS idx_users_referred_by ON public.users(referred_by);

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_referral_stats ON public.users;

-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS handle_new_user();
DROP FUNCTION IF EXISTS update_referral_stats();

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
        FROM public.users
        WHERE id IN (
            SELECT user_id 
            FROM public.referral_codes 
            WHERE code = NEW.referred_by 
            AND is_active = true
        );

        -- If we found the referrer
        IF FOUND THEN
            -- Update referrer's stats
            UPDATE public.users
            SET 
                referral_count = referral_count + 1,
                total_referral_earnings = total_referral_earnings + 7.00, -- 7 days subscription reward
                subscription_end_date = CASE
                    -- If no subscription, start a new one with 7 days
                    WHEN subscription_end_date IS NULL THEN NOW() + INTERVAL '7 days'
                    -- If subscription expired, start a new one with 7 days
                    WHEN subscription_end_date < NOW() THEN NOW() + INTERVAL '7 days'
                    -- If active subscription, add 7 days to current end date
                    ELSE subscription_end_date + INTERVAL '7 days'
                END,
                status = CASE
                    -- If subscription was expired, set to active
                    WHEN subscription_end_date < NOW() THEN 'active'
                    -- Otherwise keep current status
                    ELSE status
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
    referrer_record RECORD;
BEGIN
    -- Check if username is provided
    IF NEW.raw_user_meta_data->>'username' IS NULL THEN
        RAISE EXCEPTION 'Username is required';
    END IF;

    -- Check if username already exists
    SELECT EXISTS (
        SELECT 1 FROM public.users 
        WHERE username = NEW.raw_user_meta_data->>'username'
    ) INTO username_exists;

    IF username_exists THEN
        RAISE EXCEPTION 'Username already taken';
    END IF;

    -- Check if user already exists
    SELECT * INTO existing_user
    FROM public.users
    WHERE auth_id = NEW.id;

    -- If user doesn't exist, create new record
    IF NOT FOUND THEN
        -- Get referrer's record if there's a referral code
        IF NEW.raw_user_meta_data->>'referred_by' IS NOT NULL THEN
            -- Look up the referrer using the referral code
            SELECT u.* INTO referrer_record
            FROM public.users u
            JOIN public.referral_codes rc ON rc.user_id = u.id
            WHERE rc.code = NEW.raw_user_meta_data->>'referred_by'
            AND rc.is_active = true;
        END IF;

        -- Insert new user
        INSERT INTO public.users (
            auth_id,
            email,
            username,
            created_at,
            last_login,
            status,
            referred_by
        ) VALUES (
            NEW.id, -- auth_id from auth.users
            NEW.email,
            NEW.raw_user_meta_data->>'username',
            NOW(), -- created_at
            NOW(), -- last_login
            'active', -- status
            NEW.raw_user_meta_data->>'referred_by' -- referred_by from metadata
        ) RETURNING id INTO existing_user.id;

        -- Create referral record if there's a referrer
        IF referrer_record.id IS NOT NULL THEN
            INSERT INTO public.referrals (
                referrer_id,
                referred_id,
                status,
                reward_amount
            ) VALUES (
                referrer_record.id,
                existing_user.id,
                'signed_up',
                '7 days' -- 7 days subscription reward
            );
        END IF;
    ELSE
        -- Update existing user's last login
        UPDATE public.users
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

CREATE TRIGGER update_referral_stats
    AFTER INSERT ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_referral_stats();

-- Create RLS policies for users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own data" ON public.users;
DROP POLICY IF EXISTS "Users can update own data" ON public.users;
DROP POLICY IF EXISTS "Public can check username availability" ON public.users;
DROP POLICY IF EXISTS "Service role can manage all users" ON public.users;

-- Allow users to read their own data
CREATE POLICY "Users can read own data" ON public.users
    FOR SELECT
    USING (auth.uid() = auth_id);

-- Allow users to update their own data
CREATE POLICY "Users can update own data" ON public.users
    FOR UPDATE
    USING (auth.uid() = auth_id);

-- Allow public to check username availability
CREATE POLICY "Public can check username availability" ON public.users
    FOR SELECT
    USING (true);

-- Allow service role to manage all users
CREATE POLICY "Service role can manage all users" ON public.users
    FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role'); 