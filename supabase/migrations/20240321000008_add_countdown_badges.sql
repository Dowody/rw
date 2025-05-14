-- Create countdown badges table
CREATE TABLE public.countdown_badges (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    start_date timestamp with time zone NULL DEFAULT CURRENT_TIMESTAMP,
    expiration_date timestamp with time zone NULL,
    created_at timestamp with time zone NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT countdown_badges_pkey PRIMARY KEY (id)
) TABLESPACE pg_default;

-- Create index on expiration_date
CREATE INDEX IF NOT EXISTS idx_countdown_badges_expiration_date 
ON public.countdown_badges 
USING btree (expiration_date) 
TABLESPACE pg_default;

-- Create trigger for updating updated_at
CREATE TRIGGER update_countdown_badges_updated_at 
    BEFORE UPDATE ON countdown_badges 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE public.countdown_badges ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for authenticated users"
ON public.countdown_badges
FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users"
ON public.countdown_badges
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users"
ON public.countdown_badges
FOR UPDATE
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users"
ON public.countdown_badges
FOR DELETE
USING (auth.role() = 'authenticated');

-- Grant necessary permissions
GRANT ALL ON public.countdown_badges TO anon, authenticated, service_role; 