-- Remover coluna type se ela existir (da migração anterior)
ALTER TABLE roulette_items DROP COLUMN IF EXISTS type;

-- Adicionar colunas pode_rua e pode_trabalho
ALTER TABLE roulette_items
ADD COLUMN IF NOT EXISTS pode_rua BOOLEAN DEFAULT true NOT NULL;

ALTER TABLE roulette_items
ADD COLUMN IF NOT EXISTS pode_trabalho BOOLEAN DEFAULT true NOT NULL;

-- Adicionar comentários
COMMENT ON COLUMN roulette_items.pode_rua IS 'Indica se a tarefa pode ser feita na rua';
COMMENT ON COLUMN roulette_items.pode_trabalho IS 'Indica se a tarefa pode ser feita no trabalho';

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_roulette_items_pode_rua ON roulette_items(pode_rua);
CREATE INDEX IF NOT EXISTS idx_roulette_items_pode_trabalho ON roulette_items(pode_trabalho);
