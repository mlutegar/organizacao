-- Adicionar coluna due_date à tabela tasks
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS due_date DATE;

-- Adicionar comentário para documentação
COMMENT ON COLUMN tasks.due_date IS 'Data de vencimento da tarefa';
