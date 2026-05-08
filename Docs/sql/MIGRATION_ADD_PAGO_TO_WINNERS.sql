-- Adicionar coluna pago na tabela de winners
ALTER TABLE winners ADD COLUMN IF NOT EXISTS pago boolean DEFAULT false;

-- Adicionar índice para performance em filtros de pagamento
CREATE INDEX IF NOT EXISTS idx_winners_pago ON winners(pago);
