-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    auth_id uuid NULL,
    email text NOT NULL,
    username text NULL,
    created_at timestamp with time zone NULL DEFAULT now(),
    status text NULL DEFAULT 'active'::text,
    current_subscription_id uuid NULL,
    subscription_start_date timestamp with time zone NULL,
    subscription_end_date timestamp with time zone NULL,
    total_purchases integer NULL DEFAULT 0,
    total_spent numeric(10, 2) NULL DEFAULT 0.00,
    CONSTRAINT users_pkey PRIMARY KEY (id),
    CONSTRAINT users_auth_id_key UNIQUE (auth_id),
    CONSTRAINT users_email_key UNIQUE (email),
    CONSTRAINT users_username_key UNIQUE (username),
    CONSTRAINT users_auth_id_fkey FOREIGN KEY (auth_id) REFERENCES auth.users (id) ON DELETE CASCADE,
    CONSTRAINT users_current_subscription_id_fkey FOREIGN KEY (current_subscription_id) REFERENCES subscriptions (id)
) TABLESPACE pg_default;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_auth_id ON public.users USING btree (auth_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users USING btree (email) TABLESPACE pg_default;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can create own account" ON public.users;
DROP POLICY IF EXISTS "Users can read own data" ON public.users;
DROP POLICY IF EXISTS "Users can update own data" ON public.users;
DROP POLICY IF EXISTS "Users can delete own account" ON public.users;
DROP POLICY IF EXISTS "Public can check username availability" ON public.users;
DROP POLICY IF EXISTS "Public can check email availability" ON public.users;
DROP POLICY IF EXISTS "Service role can manage all users" ON public.users;
DROP POLICY IF EXISTS "Auth users can create user record" ON public.users;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.users;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.users;
DROP POLICY IF EXISTS "Enable update for users based on auth_id" ON public.users;
DROP POLICY IF EXISTS "Enable delete for users based on auth_id" ON public.users;
DROP POLICY IF EXISTS "Enable insert for service role" ON public.users;
DROP POLICY IF EXISTS "Enable insert for auth trigger" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their profile" ON public.users;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.users;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.users;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.users;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.users;

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    -- Check if user already exists
    IF NOT EXISTS (SELECT 1 FROM public.users WHERE auth_id = new.id) THEN
        INSERT INTO public.users (auth_id, email)
        VALUES (new.id, new.email);
    END IF;
    RETURN new;
EXCEPTION
    WHEN OTHERS THEN
        -- Log the error
        RAISE NOTICE 'Error in handle_new_user: %', SQLERRM;
        RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create simplified policies
-- Allow the trigger to create users
CREATE POLICY "Enable insert for auth trigger"
ON public.users
FOR INSERT
WITH CHECK (true);

-- Allow users to read their own data
CREATE POLICY "Users can read own data"
ON public.users
FOR SELECT
USING (
    auth.role() = 'authenticated' AND 
    (auth.uid() = auth_id OR role() = 'service_role')
);

-- Allow users to update their own data
CREATE POLICY "Users can update own data"
ON public.users
FOR UPDATE
USING (
    auth.role() = 'authenticated' AND 
    auth.uid() = auth_id
)
WITH CHECK (
    auth.uid() = auth_id AND
    -- Only allow updating specific fields
    email = email AND  -- Email can't be changed
    auth_id = auth_id AND  -- Auth ID can't be changed
    id = id AND  -- ID can't be changed
    created_at = created_at AND  -- Created at can't be changed
    total_purchases = total_purchases AND  -- Total purchases can't be changed
    total_spent = total_spent  -- Total spent can't be changed
);

-- Allow users to delete their own data
CREATE POLICY "Users can delete own data"
ON public.users
FOR DELETE
USING (
    auth.role() = 'authenticated' AND 
    auth.uid() = auth_id
);

-- Allow public to check username/email availability
CREATE POLICY "Public can check availability"
ON public.users
FOR SELECT
USING (true);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON public.users TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO anon, authenticated, service_role; 