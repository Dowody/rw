-- Add transaction_hash column to orders table
ALTER TABLE orders
ADD COLUMN transaction_hash TEXT;

-- Add comment to the column
COMMENT ON COLUMN orders.transaction_hash IS 'The blockchain transaction hash for crypto payments';

-- Create an index for faster lookups
CREATE INDEX idx_orders_transaction_hash ON orders(transaction_hash); 