-- Create subscriptions table
CREATE TABLE public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL,
    duration_days INTEGER NOT NULL,
    max_withdrawals_per_day INTEGER,
    max_case_collection BOOLEAN DEFAULT FALSE,
    advanced_filtering BOOLEAN DEFAULT FALSE,
    risk_management BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Add subscription fields to users table
ALTER TABLE public.users
ADD COLUMN current_subscription_id UUID REFERENCES public.subscriptions(id),
ADD COLUMN subscription_start_date TIMESTAMPTZ,
ADD COLUMN subscription_end_date TIMESTAMPTZ,
ADD COLUMN total_purchases INTEGER DEFAULT 0,
ADD COLUMN total_spent NUMERIC(10,2) DEFAULT 0.00;

-- Create helper functions for JWT claims
CREATE OR REPLACE FUNCTION uid()
RETURNS uuid AS $$
SELECT 
coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''), 
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
)::uuid;
$$ LANGUAGE sql;

CREATE OR REPLACE FUNCTION role()
RETURNS text AS $$
SELECT 
coalesce(
    nullif(current_setting('request.jwt.claim.role', true), ''), 
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role')
)::text;
$$ LANGUAGE sql;

CREATE OR REPLACE FUNCTION email()
RETURNS text AS $$
SELECT 
coalesce(
    nullif(current_setting('request.jwt.claim.email', true), ''), 
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'email')
)::text;
$$ LANGUAGE sql;

-- Create subscription management functions
CREATE OR REPLACE FUNCTION handle_subscription_purchase(
    p_user_id uuid, 
    p_subscription_id uuid, 
    p_transaction_date timestamptz
)
RETURNS json AS $$
DECLARE
    v_current_subscription record;
    v_new_subscription record;
    v_start_date timestamptz;
    v_end_date timestamptz;
    v_result json;
BEGIN
    -- Get current subscription details
    SELECT 
        u.current_subscription_id,
        u.subscription_start_date,
        u.subscription_end_date
    INTO v_current_subscription
    FROM public.users u
    WHERE u.id = p_user_id;

    -- Get new subscription details
    SELECT 
        id,
        duration_days,
        price
    INTO v_new_subscription
    FROM public.subscriptions
    WHERE id = p_subscription_id;

    -- Determine start and end dates based on rules
    IF v_current_subscription.current_subscription_id IS NULL THEN
        -- No active subscription, start from today
        v_start_date := p_transaction_date;
        v_end_date := p_transaction_date + (v_new_subscription.duration_days * interval '1 day');
    ELSE
        -- Check if current subscription is still active
        IF v_current_subscription.subscription_end_date > NOW() THEN
            -- Current subscription is active, apply rules
            IF EXISTS (
                SELECT 1 
                FROM public.subscriptions 
                WHERE id = v_current_subscription.current_subscription_id 
                AND duration_days >= v_new_subscription.duration_days
            ) THEN
                -- New subscription is shorter or equal, extend current
                v_start_date := v_current_subscription.subscription_start_date;
                v_end_date := v_current_subscription.subscription_end_date + 
                    (v_new_subscription.duration_days * interval '1 day');
            ELSE
                -- New subscription is longer, replace current
                v_start_date := p_transaction_date;
                v_end_date := p_transaction_date + 
                    (v_new_subscription.duration_days * interval '1 day');
            END IF;
        ELSE
            -- Current subscription is expired, start new one
            v_start_date := p_transaction_date;
            v_end_date := p_transaction_date + 
                (v_new_subscription.duration_days * interval '1 day');
        END IF;
    END IF;

    -- Update user's subscription
    UPDATE public.users
    SET 
        current_subscription_id = p_subscription_id,
        subscription_start_date = v_start_date,
        subscription_end_date = v_end_date,
        total_purchases = total_purchases + 1,
        total_spent = total_spent + v_new_subscription.price
    WHERE id = p_user_id;

    -- Return result
    v_result := json_build_object(
        'start_date', v_start_date,
        'end_date', v_end_date,
        'subscription_id', p_subscription_id
    );

    RETURN v_result;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION validate_subscription_purchase(
    p_user_id uuid, 
    p_subscription_id uuid
)
RETURNS boolean AS $$
DECLARE
    v_current_subscription record;
    v_new_subscription record;
BEGIN
    -- Get current subscription details
    SELECT 
        u.current_subscription_id,
        u.subscription_end_date
    INTO v_current_subscription
    FROM public.users u
    WHERE u.id = p_user_id;

    -- Get new subscription details
    SELECT 
        id,
        duration_days
    INTO v_new_subscription
    FROM public.subscriptions
    WHERE id = p_subscription_id;

    -- Check if user already has an active subscription
    IF v_current_subscription.current_subscription_id IS NOT NULL 
       AND v_current_subscription.subscription_end_date > NOW() THEN
        -- Check if new subscription is longer
        IF EXISTS (
            SELECT 1 
            FROM public.subscriptions 
            WHERE id = v_current_subscription.current_subscription_id 
            AND duration_days >= v_new_subscription.duration_days
        ) THEN
            RETURN true; -- Can extend current subscription
        ELSE
            RETURN true; -- Can replace with longer subscription
        END IF;
    END IF;

    RETURN true; -- No active subscription, can purchase
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION check_subscription_status(user_id uuid)
RETURNS text AS $$
DECLARE
    subscription_end_date timestamptz;
BEGIN
    SELECT u.subscription_end_date INTO subscription_end_date
    FROM public.users u
    WHERE u.id = user_id;

    IF subscription_end_date IS NULL THEN
        RETURN 'inactive';
    ELSIF subscription_end_date > NOW() THEN
        RETURN 'active';
    ELSE
        RETURN 'expired';
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_subscription_details(user_id uuid)
RETURNS TABLE(
    subscription_id uuid, 
    subscription_name text, 
    start_date timestamptz, 
    end_date timestamptz, 
    status text, 
    days_remaining integer
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id,
        s.name,
        u.subscription_start_date,
        u.subscription_end_date,
        CASE 
            WHEN u.subscription_end_date IS NULL THEN 'inactive'
            WHEN u.subscription_end_date > NOW() THEN 'active'
            ELSE 'expired'
        END AS status,
        CASE 
            WHEN u.subscription_end_date IS NULL THEN 0
            WHEN u.subscription_end_date > NOW() THEN 
                EXTRACT(day FROM (u.subscription_end_date - NOW()))
            ELSE 0
        END AS days_remaining
    FROM public.users u
    LEFT JOIN public.subscriptions s ON s.id = u.current_subscription_id
    WHERE u.id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS on subscriptions
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for subscriptions
CREATE POLICY "Public can view active subscriptions" ON public.subscriptions
    FOR SELECT USING (is_active = true);

CREATE POLICY "Service role can manage subscriptions" ON public.subscriptions
    FOR ALL USING (role() = 'service_role');

-- Update users table RLS policies
DROP POLICY IF EXISTS "Users can create own account" ON public.users;
DROP POLICY IF EXISTS "Users can read own data" ON public.users;
DROP POLICY IF EXISTS "Users can update own data" ON public.users;
DROP POLICY IF EXISTS "Users can delete own account" ON public.users;
DROP POLICY IF EXISTS "Public can check username availability" ON public.users;
DROP POLICY IF EXISTS "Service role can manage all users" ON public.users;

-- Create new policies for users table
CREATE POLICY "Users can create own account" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = auth_id);

CREATE POLICY "Users can read own data" ON public.users
    FOR SELECT USING (auth.uid() = auth_id);

CREATE POLICY "Users can update own data" ON public.users
    FOR UPDATE USING (auth.uid() = auth_id);

CREATE POLICY "Users can delete own account" ON public.users
    FOR DELETE USING (auth.uid() = auth_id);

CREATE POLICY "Public can check username availability" ON public.users
    FOR SELECT USING (true);

CREATE POLICY "Service role can manage all users" ON public.users
    FOR ALL USING (role() = 'service_role');

-- Create policy for auth.users trigger
CREATE POLICY "Auth users can create user record" ON public.users
    FOR INSERT WITH CHECK (true); 