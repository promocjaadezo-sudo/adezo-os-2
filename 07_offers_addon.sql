-- Migration: ADD ON fields for Offers Table based on BUILD 005 requirements
-- Adds offer_number, margin and sent_at to the public.offers table if they don't already exist.

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'offers' 
        AND column_name = 'offer_number'
    ) THEN
        ALTER TABLE public.offers ADD COLUMN offer_number text;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'offers' 
        AND column_name = 'margin'
    ) THEN
        ALTER TABLE public.offers ADD COLUMN margin numeric(14,2) default 0;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'offers' 
        AND column_name = 'sent_at'
    ) THEN
        ALTER TABLE public.offers ADD COLUMN sent_at timestamptz;
    END IF;
END $$;
