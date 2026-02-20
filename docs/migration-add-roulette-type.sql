-- Adicionar coluna type aos itens da roleta
-- Execute este script no Supabase SQL Editor

-- Adicionar coluna type (enum: geral, fora_rua, fora_trabalho)
ALTER TABLE roulette_items
ADD COLUMN IF NOT EXISTS type VARCHAR(20) DEFAULT 'geral' NOT NULL;

-- Adicionar comentário
COMMENT ON COLUMN roulette_items.type IS 'Tipo do item: geral, fora_rua, ou fora_trabalho';

-- Adicionar check constraint para validar valores
ALTER TABLE roulette_items
ADD CONSTRAINT roulette_items_type_check
CHECK (type IN ('geral', 'fora_rua', 'fora_trabalho'));

-- Criar índice para melhor performance em filtros por tipo
CREATE INDEX IF NOT EXISTS idx_roulette_items_type ON roulette_items(type);
