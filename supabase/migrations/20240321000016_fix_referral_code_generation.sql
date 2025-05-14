-- Drop existing function if it exists
DROP FUNCTION IF EXISTS public.handle_referral_code_generation(uuid);

-- Create a function to handle code generation and deletion
CREATE OR REPLACE FUNCTION public.handle_referral_code_generation(p_user_id uuid)
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
    -- Delete all existing codes for this user
    DELETE FROM public.referral_codes
    WHERE user_id = p_user_id;

    -- Generate a new unique code
    LOOP
        -- Generate a random 8-character code
        new_code := '';
        FOR i IN 1..8 LOOP
            new_code := new_code || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
        END LOOP;

        -- Check if code already exists
        SELECT EXISTS (
            SELECT 1 FROM public.referral_codes WHERE code = new_code
        ) INTO code_exists;

        EXIT WHEN NOT code_exists;
    END LOOP;

    -- Insert new code
    INSERT INTO public.referral_codes (user_id, code, is_active)
    VALUES (p_user_id, new_code, true);

    RETURN new_code;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.handle_referral_code_generation(uuid) TO authenticated;

-- Add function to PostgREST schema cache
COMMENT ON FUNCTION public.handle_referral_code_generation(uuid) IS 'Generate a new referral code and delete old ones';
ALTER FUNCTION public.handle_referral_code_generation(uuid) SET search_path = public; 