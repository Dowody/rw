-- Drop existing triggers that depend on referral_rewards
DROP TRIGGER IF EXISTS on_referral_completion ON public.referrals;

-- Drop existing functions that depend on referral_rewards
DROP FUNCTION IF EXISTS handle_referral_completion();
DROP FUNCTION IF EXISTS update_referral_status();

-- Create function to handle referral completion without subscription orders dependency
CREATE OR REPLACE FUNCTION handle_referral_completion()
RETURNS TRIGGER AS $$
BEGIN
    -- Only proceed if status is being changed to 'completed'
    IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
        -- Update the referrer's rewards_days
        UPDATE users 
        SET rewards_days = COALESCE(rewards_days, 0) + 7
        WHERE id = NEW.referrer_id;

        -- Log the update for debugging
        RAISE NOTICE 'Updated rewards_days for user %', NEW.referrer_id;
    END IF;

    -- Always return NEW to ensure the status update is saved
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create function to update referral status
CREATE OR REPLACE FUNCTION update_referral_status(p_referral_id uuid)
RETURNS void AS $$
BEGIN
    UPDATE referrals
    SET 
        status = 'completed',
        completed_at = NOW(),
        updated_at = NOW()
    WHERE id = p_referral_id;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for referral completion
CREATE TRIGGER on_referral_completion
    AFTER UPDATE ON referrals
    FOR EACH ROW
    WHEN (NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed'))
    EXECUTE FUNCTION handle_referral_completion();

-- Create referral_rewards table
CREATE TABLE IF NOT EXISTS public.referral_rewards (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    referrer_id uuid NOT NULL,
    amount numeric(10, 2) NOT NULL DEFAULT 0.00,
    status text NOT NULL DEFAULT 'pending'::text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    paid_at timestamp with time zone,
    CONSTRAINT referral_rewards_pkey PRIMARY KEY (id),
    CONSTRAINT referral_rewards_status_check CHECK (
        status = ANY (ARRAY['pending'::text, 'paid'::text, 'expired'::text])
    ),
    CONSTRAINT referral_rewards_referrer_id_fkey FOREIGN KEY (referrer_id)
        REFERENCES users (id) ON DELETE CASCADE
) TABLESPACE pg_default;

-- Create indexes for referral_rewards table if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_referral_rewards_referrer_id') THEN
        CREATE INDEX idx_referral_rewards_referrer_id 
        ON public.referral_rewards USING btree (referrer_id) 
        TABLESPACE pg_default;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_referral_rewards_status') THEN
        CREATE INDEX idx_referral_rewards_status 
        ON public.referral_rewards USING btree (status) 
        TABLESPACE pg_default;
    END IF;
END $$;

-- Grant necessary permissions
GRANT ALL ON public.referral_rewards TO authenticated;
GRANT ALL ON public.referral_rewards TO service_role; 