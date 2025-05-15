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
    old_code text;
BEGIN
    -- Get the old referral code
    SELECT referral_code INTO old_code
    FROM users
    WHERE id = p_user_id;

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

    -- Update the referral_code in users table
    UPDATE users
    SET referral_code = new_code
    WHERE id = p_user_id;

    -- Update referred_by in users table for all users who were referred with the old code
    IF old_code IS NOT NULL THEN
        UPDATE users
        SET referred_by = new_code
        WHERE referred_by = old_code;
    END IF;

    RETURN new_code;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.handle_referral_code_generation(uuid) TO authenticated;

-- Add function to PostgREST schema cache
COMMENT ON FUNCTION public.handle_referral_code_generation(uuid) IS 'Generate a new referral code and update all references'; 