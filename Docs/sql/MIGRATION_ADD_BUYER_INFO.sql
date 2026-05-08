-- SQL MIGRATION: ADD BUYER INFO COLUMNS
-- Execute este script no console do Supabase para atualizar a tabela de tickets

ALTER TABLE tickets 
ADD COLUMN IF NOT EXISTS comprador_nome TEXT,
ADD COLUMN IF NOT EXISTS comprador_cpf TEXT,
ADD COLUMN IF NOT EXISTS comprador_telefone TEXT;

-- Comentários para documentação (opcional)
COMMENT ON COLUMN tickets.comprador_nome IS 'Nome completo do comprador do bilhete';
COMMENT ON COLUMN tickets.comprador_cpf IS 'CPF do comprador para fins de identificação e premiação';
COMMENT ON COLUMN tickets.comprador_telefone IS 'Telefone de contato do comprador';
