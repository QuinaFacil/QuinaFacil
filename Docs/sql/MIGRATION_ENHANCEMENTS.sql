-- ==========================================
-- MIGRATION: ENHANCEMENTS (CPF, ADDRESS, BANNER, LINK SALES)
-- ==========================================

-- 1. Updates to PROFILES (Registration)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS cpf TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS address TEXT;

-- 2. Updates to CONCURSOS (Media and Info)
ALTER TABLE concursos ADD COLUMN IF NOT EXISTS banner_url TEXT;
ALTER TABLE concursos ADD COLUMN IF NOT EXISTS description TEXT;

-- 3. Updates to TICKETS (Link Sales Flow)
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS is_validated BOOLEAN DEFAULT TRUE;

-- Update status constraint to include 'placeholder' for non-validated tickets
ALTER TABLE tickets DROP CONSTRAINT IF EXISTS tickets_status_check;
ALTER TABLE tickets ADD CONSTRAINT tickets_status_check CHECK (status IN ('processing','printed','confirmed','error','placeholder'));

-- Index for pending validation performance
CREATE INDEX IF NOT EXISTS idx_tickets_validation ON tickets(vendedor_id, is_validated) WHERE is_validated = false;
