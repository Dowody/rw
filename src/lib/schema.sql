-- Drop existing table if it exists
DROP TABLE IF EXISTS public.bot_configurations;

-- Create bot_configurations table
CREATE TABLE public.bot_configurations (
    id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
    user_id uuid NOT NULL,
    bot_type text NOT NULL DEFAULT 'skin'::text,
    min_price numeric(10, 2) NULL,
    max_price numeric(10, 2) NULL,
    max_percentage numeric(5, 2) NULL,
    min_sticker_price numeric(10, 2) NULL,
    session_token text NULL,
    bg_color text NULL,
    blacklist text[] NULL,
    status text NULL DEFAULT 'inactive'::text,
    bot_status text NULL DEFAULT 'stop'::text,
    timer_end timestamp with time zone NULL,
    created_at timestamp with time zone NULL DEFAULT now(),
    updated_at timestamp with time zone NULL DEFAULT now(),
    CONSTRAINT bot_configurations_pkey PRIMARY KEY (id),
    CONSTRAINT bot_configurations_user_id_fkey FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT bot_configurations_bot_type_check CHECK (
        bot_type = ANY (ARRAY['skin'::text, 'sticker'::text])
    ),
    CONSTRAINT bot_configurations_bot_status_check CHECK (
        bot_status = ANY (ARRAY['start'::text, 'stop'::text])
    ),
    CONSTRAINT bot_configurations_status_check CHECK (
        status = ANY (
            ARRAY['active'::text, 'inactive'::text, 'paused'::text]
        )
    )
) TABLESPACE pg_default;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_bot_config_user_id 
    ON public.bot_configurations USING btree (user_id) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_bot_config_bot_type 
    ON public.bot_configurations USING btree (bot_type) TABLESPACE pg_default;

-- Create trigger for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_bot_config_updated_at
    BEFORE UPDATE ON bot_configurations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 