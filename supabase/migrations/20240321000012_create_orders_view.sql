-- Drop the view if it exists
DROP VIEW IF EXISTS public.orders_with_items;

-- Create view for orders with items
CREATE VIEW public.orders_with_items AS
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

-- Grant permissions on the view
GRANT SELECT ON public.orders_with_items TO anon, authenticated, service_role; 