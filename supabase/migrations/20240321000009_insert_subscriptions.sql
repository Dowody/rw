-- Create subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    name text NOT NULL,
    description text NULL,
    price numeric NOT NULL,
    duration_days integer NOT NULL,
    max_withdrawals_per_day integer NULL,
    max_case_collection boolean NULL DEFAULT false,
    advanced_filtering boolean NULL DEFAULT false,
    risk_management boolean NULL DEFAULT false,
    is_active boolean NULL DEFAULT true,
    created_at timestamp with time zone NULL DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT subscriptions_pkey PRIMARY KEY (id)
) TABLESPACE pg_default;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON public.subscriptions;

-- Create trigger for updating updated_at
CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert subscription data
INSERT INTO public.subscriptions (
    name, 
    description, 
    price, 
    duration_days, 
    max_withdrawals_per_day,
    max_case_collection,
    advanced_filtering,
    risk_management
) VALUES
    ('24-Hour Free Trial', 
    'Try our service for 24 hours with limited features',
    0.00, 
    2, 
    200,
    false,
    false,
    false
    ),
    ('1 Month Licence', 
    'Full access to all basic features for one month',
    0.01, 
    30, 
    NULL,
    true,
    true,
    true
    ),
    ('6 Months Licence', 
    'Full access to all features including advanced options for six months',
    269.99, 
    180, 
    NULL,
    true,
    true,
    true
    ),
    ('12 Months Licence', 
    'Complete access to all premium features for a full year',
    539.99, 
    365, 
    NULL,
    true,
    true,
    true
    );

-- Enable RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for all users"
ON public.subscriptions
FOR SELECT
USING (true);

CREATE POLICY "Enable insert for authenticated users"
ON public.subscriptions
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users"
ON public.subscriptions
FOR UPDATE
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users"
ON public.subscriptions
FOR DELETE
USING (auth.role() = 'authenticated');

-- Grant necessary permissions
GRANT ALL ON public.subscriptions TO anon, authenticated, service_role; 