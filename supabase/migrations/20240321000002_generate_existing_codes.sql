-- Function to generate a single referral code
CREATE OR REPLACE FUNCTION generate_single_referral_code()
RETURNS VARCHAR AS $$
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
    
    RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- Update existing users with referral codes
DO $$
DECLARE
    user_record RECORD;
BEGIN
    FOR user_record IN SELECT id FROM users WHERE referral_code IS NULL LOOP
        UPDATE users 
        SET referral_code = generate_single_referral_code()
        WHERE id = user_record.id;
    END LOOP;
END $$;

-- Drop the temporary function
DROP FUNCTION generate_single_referral_code(); 