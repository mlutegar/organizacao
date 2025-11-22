-- Adicionar campos para tarefa foco
-- Execute este script no Supabase SQL Editor

-- Adicionar coluna is_focus (booleano, padrão false)
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS is_focus BOOLEAN DEFAULT false NOT NULL;

-- Adicionar coluna focus_date (data, pode ser null)
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS focus_date DATE;

-- Comentários para documentação
COMMENT ON COLUMN tasks.is_focus IS 'Indica se a tarefa é uma tarefa foco';
COMMENT ON COLUMN tasks.focus_date IS 'Data em que a tarefa foi definida como foco';
