-- Drop existing tables if they exist
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;

-- Create orders table with updated schema
CREATE TABLE public.orders (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NULL,
    amount numeric(10, 2) NOT NULL,
    total_amount numeric(10, 2) NULL DEFAULT NULL,
    status text NULL DEFAULT 'pending'::text,
    created_at timestamp with time zone NULL DEFAULT now(),
    transaction_date timestamp with time zone NULL DEFAULT now(),
    subscription_id uuid NULL,
    expiration_date timestamp with time zone NULL,
    updated_at timestamp with time zone NULL DEFAULT now(),
    CONSTRAINT orders_pkey PRIMARY KEY (id),
    CONSTRAINT orders_subscription_id_fkey FOREIGN KEY (subscription_id) 
        REFERENCES subscriptions(id) ON DELETE SET NULL,
    CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) 
        REFERENCES users(id) ON DELETE CASCADE
) TABLESPACE pg_default;

-- Create order_items table
CREATE TABLE public.order_items (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    order_id uuid NOT NULL,
    subscription_id uuid NOT NULL,
    quantity integer NOT NULL DEFAULT 1,
    price numeric(10, 2) NOT NULL,
    created_at timestamp with time zone NULL DEFAULT now(),
    updated_at timestamp with time zone NULL DEFAULT now(),
    CONSTRAINT order_items_pkey PRIMARY KEY (id),
    CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) 
        REFERENCES orders(id) ON DELETE CASCADE,
    CONSTRAINT order_items_subscription_id_fkey FOREIGN KEY (subscription_id) 
        REFERENCES subscriptions(id) ON DELETE RESTRICT
) TABLESPACE pg_default;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_orders_user_id 
ON public.orders USING btree (user_id) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_orders_subscription_id 
ON public.orders USING btree (subscription_id) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_orders_transaction_date 
ON public.orders USING btree (transaction_date) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_order_items_order_id 
ON public.order_items USING btree (order_id) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_order_items_subscription_id 
ON public.order_items USING btree (subscription_id) TABLESPACE pg_default;

-- Create trigger to set total_amount equal to amount
CREATE OR REPLACE FUNCTION set_total_amount()
RETURNS TRIGGER AS $$
BEGIN
    NEW.total_amount = NEW.amount;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_total_amount_trigger
    BEFORE INSERT ON orders
    FOR EACH ROW
    EXECUTE FUNCTION set_total_amount();

-- Create view for orders with items
CREATE OR REPLACE VIEW orders_with_items AS
SELECT 
    o.*,
    COALESCE(
        json_agg(
            json_build_object(
                'id', oi.id,
                'subscription_id', oi.subscription_id,
                'quantity', oi.quantity,
                'price', oi.price,
                'created_at', oi.created_at,
                'updated_at', oi.updated_at
            )
        ) FILTER (WHERE oi.id IS NOT NULL),
        '[]'::json
    ) as items
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id;

-- Enable Row Level Security
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.orders;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.orders;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.orders;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.orders;
DROP POLICY IF EXISTS "Enable all access for service role" ON public.orders;

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.order_items;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.order_items;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.order_items;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.order_items;
DROP POLICY IF EXISTS "Enable all access for service role" ON public.order_items;

-- Create policies for orders
CREATE POLICY "Enable read access for authenticated users"
ON public.orders
FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users"
ON public.orders
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users"
ON public.orders
FOR UPDATE
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users"
ON public.orders
FOR DELETE
USING (auth.role() = 'authenticated');

-- Create policies for order_items
CREATE POLICY "Enable read access for authenticated users"
ON public.order_items
FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users"
ON public.order_items
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users"
ON public.order_items
FOR UPDATE
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users"
ON public.order_items
FOR DELETE
USING (auth.role() = 'authenticated');

-- Create policy for service role on orders
CREATE POLICY "Enable all access for service role"
ON public.orders
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Create policy for service role on order_items
CREATE POLICY "Enable all access for service role"
ON public.order_items
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Grant necessary permissions
GRANT ALL ON public.orders TO anon, authenticated, service_role;
GRANT ALL ON public.order_items TO anon, authenticated, service_role;
GRANT SELECT ON public.orders_with_items TO anon, authenticated, service_role; 