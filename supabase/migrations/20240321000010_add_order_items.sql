-- Add subscription_id and expiration_date to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS subscription_id uuid NULL,
ADD COLUMN IF NOT EXISTS expiration_date timestamp with time zone NULL,
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone NULL DEFAULT now();

-- Add foreign key for subscription_id
ALTER TABLE public.orders
ADD CONSTRAINT orders_subscription_id_fkey 
FOREIGN KEY (subscription_id) 
REFERENCES subscriptions(id) 
ON DELETE SET NULL;

-- Create order_items table
CREATE TABLE IF NOT EXISTS public.order_items (
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
CREATE INDEX IF NOT EXISTS idx_order_items_order_id 
ON public.order_items USING btree (order_id) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_order_items_subscription_id 
ON public.order_items USING btree (subscription_id) TABLESPACE pg_default;

-- Create trigger for updating updated_at
CREATE TRIGGER update_order_items_updated_at
    BEFORE UPDATE ON order_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Create policies for order_items
CREATE POLICY "Enable read access for authenticated users"
ON public.order_items
FOR SELECT
USING (
    auth.role() = 'authenticated' AND 
    EXISTS (
        SELECT 1 FROM orders 
        WHERE orders.id = order_items.order_id 
        AND orders.user_id = auth.uid()
    )
);

CREATE POLICY "Enable insert for authenticated users"
ON public.order_items
FOR INSERT
WITH CHECK (
    auth.role() = 'authenticated' AND 
    EXISTS (
        SELECT 1 FROM orders 
        WHERE orders.id = order_items.order_id 
        AND orders.user_id = auth.uid()
    )
);

CREATE POLICY "Enable update for authenticated users"
ON public.order_items
FOR UPDATE
USING (
    auth.role() = 'authenticated' AND 
    EXISTS (
        SELECT 1 FROM orders 
        WHERE orders.id = order_items.order_id 
        AND orders.user_id = auth.uid()
    )
)
WITH CHECK (
    auth.role() = 'authenticated' AND 
    EXISTS (
        SELECT 1 FROM orders 
        WHERE orders.id = order_items.order_id 
        AND orders.user_id = auth.uid()
    )
);

CREATE POLICY "Enable delete for authenticated users"
ON public.order_items
FOR DELETE
USING (
    auth.role() = 'authenticated' AND 
    EXISTS (
        SELECT 1 FROM orders 
        WHERE orders.id = order_items.order_id 
        AND orders.user_id = auth.uid()
    )
);

-- Grant necessary permissions
GRANT ALL ON public.order_items TO anon, authenticated, service_role; 