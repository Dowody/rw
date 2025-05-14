-- Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS set_referral_code_created_at ON public.referral_codes;
DROP FUNCTION IF EXISTS public.set_referral_code_created_at();
DROP FUNCTION IF EXISTS public.generate_referral_code();
DROP FUNCTION IF EXISTS public.handle_referral_code_generation(uuid);

-- Create a function to generate unique referral codes
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    chars text := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    new_code text := '';
    i integer;
    code_exists boolean;
BEGIN
    -- Generate a random 8-character code
    FOR i IN 1..8 LOOP
        new_code := new_code || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;

    -- Check if code already exists
    SELECT EXISTS (
        SELECT 1 FROM public.referral_codes WHERE code = new_code
    ) INTO code_exists;

    -- If code exists, generate a new one recursively
    IF code_exists THEN
        RETURN generate_referral_code();
    END IF;

    RETURN new_code;
END;
$$;

-- Create a function to handle code generation and deletion
CREATE OR REPLACE FUNCTION public.handle_referral_code_generation(p_user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    new_code text;
BEGIN
    -- Delete all existing codes for this user
    DELETE FROM public.referral_codes
    WHERE user_id = p_user_id;

    -- Generate new code
    SELECT public.generate_referral_code() INTO new_code;

    -- Insert new code
    INSERT INTO public.referral_codes (user_id, code, is_active)
    VALUES (p_user_id, new_code, true);

    RETURN new_code;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.generate_referral_code() TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_referral_code_generation(uuid) TO authenticated;

-- Create a trigger to automatically set created_at
CREATE OR REPLACE FUNCTION public.set_referral_code_created_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    NEW.created_at = NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER set_referral_code_created_at
    BEFORE INSERT ON public.referral_codes
    FOR EACH ROW
    EXECUTE FUNCTION public.set_referral_code_created_at();

-- Add function to PostgREST schema cache
COMMENT ON FUNCTION public.handle_referral_code_generation(uuid) IS 'Generate a new referral code and delete old ones';
ALTER FUNCTION public.handle_referral_code_generation(uuid) SET search_path = public; 