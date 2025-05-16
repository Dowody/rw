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
    subscription_end_date TIMESTAMPTZ,
    total_referral_earnings NUMERIC(10, 2) DEFAULT 0.00,
    last_login TIMESTAMPTZ,
    rewards_days integer DEFAULT 0
);

-- Add missing columns to users table
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS referral_code VARCHAR UNIQUE,
ADD COLUMN IF NOT EXISTS referred_by VARCHAR,
ADD COLUMN IF NOT EXISTS referral_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_referral_earnings NUMERIC(10, 2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS rewards_days integer DEFAULT 0;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_users_auth_id ON users(auth_id);
CREATE INDEX IF NOT EXISTS idx_users_referred_by ON public.users(referred_by);
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON public.users(referral_code);

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_referral_stats ON public.users;
DROP TRIGGER IF EXISTS create_referral_record ON public.users;
DROP TRIGGER IF EXISTS on_referral_completion ON public.referrals;
DROP TRIGGER IF EXISTS set_referral_code ON public.users;

-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS handle_new_user();
DROP FUNCTION IF EXISTS update_referral_stats();
DROP FUNCTION IF EXISTS create_referral_record();
DROP FUNCTION IF EXISTS handle_referral_completion();
DROP FUNCTION IF EXISTS generate_referral_code();

-- Create function to generate unique referral code
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

-- Create trigger to automatically generate referral code
CREATE TRIGGER set_referral_code
    BEFORE INSERT ON users
    FOR EACH ROW
    WHEN (NEW.referral_code IS NULL)
    EXECUTE FUNCTION generate_referral_code();

-- Create referrals table
CREATE TABLE IF NOT EXISTS public.referrals (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    referrer_id uuid NOT NULL,
    referred_id uuid NOT NULL,
    status text NOT NULL DEFAULT 'pending'::text,
    reward_amount numeric(10, 2) NOT NULL DEFAULT 0.00,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    completed_at timestamp with time zone,
    CONSTRAINT referrals_pkey PRIMARY KEY (id),
    CONSTRAINT unique_referral UNIQUE (referrer_id, referred_id),
    CONSTRAINT referrals_referred_id_fkey FOREIGN KEY (referred_id)
        REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT referrals_referrer_id_fkey FOREIGN KEY (referrer_id)
        REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT referrals_status_check CHECK (
        status = ANY (ARRAY['pending'::text, 'completed'::text, 'expired'::text])
    )
) TABLESPACE pg_default;

-- Create indexes for referrals table
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id 
ON public.referrals USING btree (referrer_id) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_referrals_referred_id 
ON public.referrals USING btree (referred_id) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_referrals_status 
ON public.referrals USING btree (status) TABLESPACE pg_default;

-- Create function to handle referral completion
CREATE OR REPLACE FUNCTION handle_referral_completion()
RETURNS TRIGGER AS $$
BEGIN
    -- Only proceed if status is being changed to 'completed'
    IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
        -- Create a referral reward record
        INSERT INTO referral_rewards (
            referral_id,
            referrer_id,
            reward_amount,
            status,
            created_at
        ) VALUES (
            NEW.id,
            NEW.referrer_id,
            NEW.reward_amount,
            'pending',
            NOW()
        );

        -- Update the referrer's rewards_days
        UPDATE users 
        SET rewards_days = COALESCE(rewards_days, 0) + 7
        WHERE id = NEW.referrer_id;

        -- Log the update for debugging
        RAISE NOTICE 'Updated rewards_days for user %: added 7 days', NEW.referrer_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for referral completion
CREATE TRIGGER on_referral_completion
    AFTER UPDATE ON referrals
    FOR EACH ROW
    EXECUTE FUNCTION handle_referral_completion();

-- Create function to create referral record
CREATE OR REPLACE FUNCTION create_referral_record()
RETURNS TRIGGER AS $$
DECLARE
    referrer_id UUID;
BEGIN
    -- Only proceed if the new user has a referrer
    IF NEW.referred_by IS NOT NULL THEN
        -- Get the referrer's ID
        SELECT id INTO referrer_id
        FROM users
        WHERE referral_code = NEW.referred_by;
        
        IF referrer_id IS NOT NULL THEN
            -- Create referral record with reward amount
            INSERT INTO referrals (referrer_id, referred_id, status, reward_amount)
            VALUES (referrer_id, NEW.id, 'pending', 7);
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to create referral record
CREATE TRIGGER create_referral_record
    AFTER INSERT ON users
    FOR EACH ROW
    EXECUTE FUNCTION create_referral_record();

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own data" ON public.users;
DROP POLICY IF EXISTS "Users can update own data" ON public.users;
DROP POLICY IF EXISTS "Public can check username availability" ON public.users;
DROP POLICY IF EXISTS "Service role can manage all users" ON public.users;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.users;
DROP POLICY IF EXISTS "Enable insert for service role" ON public.users;
DROP POLICY IF EXISTS "Enable insert for auth trigger" ON public.users;
DROP POLICY IF EXISTS "Enable insert for signup" ON public.users;
DROP POLICY IF EXISTS "Enable read for authenticated users" ON public.users;
DROP POLICY IF EXISTS "Enable insert for anon" ON public.users;
DROP POLICY IF EXISTS "Enable insert for referral trigger" ON public.referrals;

-- Allow users to read their own data
CREATE POLICY "Users can read own data" ON public.users
    FOR SELECT
    USING (auth.uid() = auth_id);

-- Allow authenticated users to read their own data
CREATE POLICY "Enable read for authenticated users" ON public.users
    FOR SELECT
    USING (auth.role() = 'authenticated');

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

-- Allow insert for service role
CREATE POLICY "Enable insert for service role" ON public.users
    FOR INSERT
    WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Allow insert for anon users
CREATE POLICY "Enable insert for anon" ON public.users
    FOR INSERT
    WITH CHECK (auth.role() = 'anon');

-- Allow insert for signup
CREATE POLICY "Enable insert for signup" ON public.users
    FOR INSERT
    WITH CHECK (true);

-- Allow trigger to create referral records
CREATE POLICY "Enable insert for referral trigger" ON public.referrals
    FOR INSERT
    WITH CHECK (true);

-- Drop existing policies for referral_rewards
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.referral_rewards;
DROP POLICY IF EXISTS "Enable read for authenticated users" ON public.referral_rewards;

-- Enable RLS on referral_rewards table
ALTER TABLE public.referral_rewards ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert referral rewards
CREATE POLICY "Enable insert for authenticated users" ON public.referral_rewards
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to read referral rewards
CREATE POLICY "Enable read for authenticated users" ON public.referral_rewards
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres;

-- Grant necessary permissions to anon
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON public.users TO anon;
GRANT INSERT ON public.users TO anon;
GRANT INSERT ON public.referrals TO anon;

-- Grant necessary permissions to authenticated
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON public.users TO authenticated;
GRANT INSERT ON public.users TO authenticated;
GRANT INSERT ON public.referrals TO authenticated;

-- Grant all permissions to postgres role
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres; 

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_user_status_update ON users;

-- Create function to handle user status update
CREATE OR REPLACE FUNCTION handle_user_status_update()
RETURNS TRIGGER AS $$
BEGIN
    -- If user status is being changed to 'active'
    IF NEW.status = 'active' AND (OLD.status IS NULL OR OLD.status != 'active') THEN
        -- Update the referral status to 'completed' if it exists
        UPDATE referrals
        SET status = 'completed',
            completed_at = NOW(),
            updated_at = NOW()
        WHERE referred_id = NEW.id
        AND status = 'pending';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for user status update
CREATE TRIGGER on_user_status_update
    AFTER UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION handle_user_status_update();

-- Drop existing foreign key constraint and index for referral_id
ALTER TABLE public.referral_rewards 
DROP CONSTRAINT IF EXISTS referral_rewards_referral_id_fkey;

DROP INDEX IF EXISTS idx_referral_rewards_referral_id;

-- Add referrer_id column
ALTER TABLE public.referral_rewards
ADD COLUMN referrer_id uuid;

-- Add foreign key constraint for referrer_id
ALTER TABLE public.referral_rewards
ADD CONSTRAINT referral_rewards_referrer_id_fkey 
FOREIGN KEY (referrer_id) 
REFERENCES users(id) 
ON DELETE CASCADE;

-- Create index for referrer_id
CREATE INDEX idx_referral_rewards_referrer_id 
ON public.referral_rewards USING btree (referrer_id) 
TABLESPACE pg_default;

-- Drop referral_id column
ALTER TABLE public.referral_rewards
DROP COLUMN referral_id; 