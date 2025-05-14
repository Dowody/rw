-- Create users table
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'active'
);

-- Create orders table
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    amount NUMERIC(10,2) NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create basic indexes
CREATE INDEX idx_users_auth_id ON public.users(auth_id);
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_orders_user_id ON public.orders(user_id);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Users table policies
-- Allow users to create their own account
CREATE POLICY "Users can create own account" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = auth_id);

-- Allow users to read their own data
CREATE POLICY "Users can read own data" ON public.users
    FOR SELECT USING (auth.uid() = auth_id);

-- Allow users to update their own data
CREATE POLICY "Users can update own data" ON public.users
    FOR UPDATE USING (auth.uid() = auth_id);

-- Allow users to delete their own account
CREATE POLICY "Users can delete own account" ON public.users
    FOR DELETE USING (auth.uid() = auth_id);

-- Allow public to check username availability
CREATE POLICY "Public can check username availability" ON public.users
    FOR SELECT USING (true);

-- Allow service role to manage all users
CREATE POLICY "Service role can manage all users" ON public.users
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Orders table policies
-- Allow users to read their own orders
CREATE POLICY "Users can read own orders" ON public.orders
    FOR SELECT USING (auth.uid() = (SELECT auth_id FROM public.users WHERE id = user_id));

-- Allow users to create their own orders
CREATE POLICY "Users can create own orders" ON public.orders
    FOR INSERT WITH CHECK (auth.uid() = (SELECT auth_id FROM public.users WHERE id = user_id));

-- Allow users to update their own orders
CREATE POLICY "Users can update own orders" ON public.orders
    FOR UPDATE USING (auth.uid() = (SELECT auth_id FROM public.users WHERE id = user_id));

-- Allow users to delete their own orders
CREATE POLICY "Users can delete own orders" ON public.orders
    FOR DELETE USING (auth.uid() = (SELECT auth_id FROM public.users WHERE id = user_id));

-- Allow service role to manage all orders
CREATE POLICY "Service role can manage all orders" ON public.orders
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role'); 