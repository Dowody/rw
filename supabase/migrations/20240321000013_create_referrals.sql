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
    CONSTRAINT referrals_referrer_id_fkey FOREIGN KEY (referrer_id)
        REFERENCES public.users (id) ON DELETE CASCADE,
    CONSTRAINT referrals_referred_id_fkey FOREIGN KEY (referred_id)
        REFERENCES public.users (id) ON DELETE CASCADE,
    CONSTRAINT referrals_status_check CHECK (status IN ('pending', 'completed', 'expired')),
    CONSTRAINT unique_referral UNIQUE (referrer_id, referred_id)
) TABLESPACE pg_default;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id 
ON public.referrals USING btree (referrer_id) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_referrals_referred_id 
ON public.referrals USING btree (referred_id) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_referrals_status 
ON public.referrals USING btree (status) TABLESPACE pg_default;

-- Create referral_codes table
CREATE TABLE IF NOT EXISTS public.referral_codes (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    code text NOT NULL,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT referral_codes_pkey PRIMARY KEY (id),
    CONSTRAINT referral_codes_user_id_fkey FOREIGN KEY (user_id)
        REFERENCES public.users (id) ON DELETE CASCADE,
    CONSTRAINT unique_referral_code UNIQUE (code)
) TABLESPACE pg_default;

-- Create indexes for referral_codes
CREATE INDEX IF NOT EXISTS idx_referral_codes_user_id 
ON public.referral_codes USING btree (user_id) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_referral_codes_code 
ON public.referral_codes USING btree (code) TABLESPACE pg_default;

-- Create referral_rewards table
CREATE TABLE IF NOT EXISTS public.referral_rewards (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    referral_id uuid NOT NULL,
    amount numeric(10, 2) NOT NULL,
    status text NOT NULL DEFAULT 'pending'::text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    paid_at timestamp with time zone,
    CONSTRAINT referral_rewards_pkey PRIMARY KEY (id),
    CONSTRAINT referral_rewards_referral_id_fkey FOREIGN KEY (referral_id)
        REFERENCES public.referrals (id) ON DELETE CASCADE,
    CONSTRAINT referral_rewards_status_check CHECK (status IN ('pending', 'paid', 'cancelled'))
) TABLESPACE pg_default;

-- Create indexes for referral_rewards
CREATE INDEX IF NOT EXISTS idx_referral_rewards_referral_id 
ON public.referral_rewards USING btree (referral_id) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_referral_rewards_status 
ON public.referral_rewards USING btree (status) TABLESPACE pg_default;

-- Enable Row Level Security
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_rewards ENABLE ROW LEVEL SECURITY;

-- Create policies for referrals table
CREATE POLICY "Users can view their own referrals"
ON public.referrals
FOR SELECT
USING (
    auth.uid() IN (
        SELECT auth_id FROM users WHERE id = referrer_id
        UNION
        SELECT auth_id FROM users WHERE id = referred_id
    )
);

CREATE POLICY "Users can create referrals"
ON public.referrals
FOR INSERT
WITH CHECK (
    auth.uid() IN (SELECT auth_id FROM users WHERE id = referrer_id)
);

-- Create policies for referral_codes table
CREATE POLICY "Users can view their own referral codes"
ON public.referral_codes
FOR SELECT
USING (
    auth.uid() IN (SELECT auth_id FROM users WHERE id = user_id)
);

CREATE POLICY "Users can create their own referral codes"
ON public.referral_codes
FOR INSERT
WITH CHECK (
    auth.uid() IN (SELECT auth_id FROM users WHERE id = user_id)
);

-- Create policies for referral_rewards table
CREATE POLICY "Users can view their own referral rewards"
ON public.referral_rewards
FOR SELECT
USING (
    auth.uid() IN (
        SELECT auth_id FROM users 
        WHERE id IN (
            SELECT referrer_id FROM referrals WHERE id = referral_id
        )
    )
);

-- Grant necessary permissions
GRANT ALL ON public.referrals TO anon, authenticated, service_role;
GRANT ALL ON public.referral_codes TO anon, authenticated, service_role;
GRANT ALL ON public.referral_rewards TO anon, authenticated, service_role;

-- Create function to generate unique referral code
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
    code text;
    exists boolean;
BEGIN
    LOOP
        -- Generate a random 8-character code
        code := upper(substring(md5(random()::text) from 1 for 8));
        
        -- Check if code exists
        SELECT EXISTS(SELECT 1 FROM referral_codes WHERE code = code) INTO exists;
        
        EXIT WHEN NOT exists;
    END LOOP;
    
    RETURN code;
END;
$$;

-- Create function to handle referral completion
CREATE OR REPLACE FUNCTION handle_referral_completion()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    -- Update referral status
    UPDATE referrals
    SET status = 'completed',
        completed_at = now(),
        updated_at = now()
    WHERE id = NEW.id
    AND NEW.status = 'completed'
    AND OLD.status = 'pending';

    -- Create referral reward
    INSERT INTO referral_rewards (referral_id, amount, status)
    VALUES (NEW.id, NEW.reward_amount, 'pending');

    -- Update referrer's total_purchases and total_spent
    UPDATE users
    SET total_purchases = total_purchases + 1,
        total_spent = total_spent + NEW.reward_amount
    WHERE id = NEW.referrer_id;

    RETURN NEW;
END;
$$;

-- Create trigger for referral completion
CREATE TRIGGER on_referral_completion
    AFTER UPDATE ON referrals
    FOR EACH ROW
    EXECUTE FUNCTION handle_referral_completion(); 