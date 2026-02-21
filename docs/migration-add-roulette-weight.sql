-- Adicionar coluna peso
ALTER TABLE roulette_items
ADD COLUMN IF NOT EXISTS peso INTEGER DEFAULT 1 NOT NULL;

-- Adicionar comentário
COMMENT ON COLUMN roulette_items.peso IS 'Peso da tarefa na roleta (influencia na probabilidade de seleção)';

-- Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_roulette_items_peso ON roulette_items(peso);
