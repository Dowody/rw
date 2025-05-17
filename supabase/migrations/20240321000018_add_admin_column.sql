-- Add is_admin column to users table
ALTER TABLE public.users
ADD COLUMN is_admin BOOLEAN NOT NULL DEFAULT FALSE;

-- Create index for faster admin queries
CREATE INDEX IF NOT EXISTS idx_users_is_admin 
ON public.users USING btree (is_admin) TABLESPACE pg_default;

-- Add comment to the column
COMMENT ON COLUMN public.users.is_admin IS 'Indicates whether the user has admin privileges';

-- Update RLS policies to allow admins to access admin routes
CREATE POLICY "Admins can access admin routes"
ON public.users
FOR SELECT
USING (
    auth.uid() = auth_id AND is_admin = true
); 