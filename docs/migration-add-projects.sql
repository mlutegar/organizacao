-- Criar tabela de projetos
-- Execute este script no Supabase SQL Editor

-- Criar tabela projects
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  color VARCHAR(7), -- Cor em formato hexadecimal (#RRGGBB)
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Adicionar coluna project_id à tabela tasks
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id) ON DELETE SET NULL;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);

-- Adicionar comentários para documentação
COMMENT ON TABLE projects IS 'Tabela de projetos para organizar tarefas';
COMMENT ON COLUMN projects.name IS 'Nome do projeto';
COMMENT ON COLUMN projects.description IS 'Descrição do projeto';
COMMENT ON COLUMN projects.color IS 'Cor do projeto em formato hexadecimal';
COMMENT ON COLUMN tasks.project_id IS 'ID do projeto ao qual a tarefa pertence';

-- Habilitar RLS (Row Level Security)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Criar política para que usuários só possam ver seus próprios projetos
CREATE POLICY "Users can view their own projects"
  ON projects FOR SELECT
  USING (auth.uid() = user_id);

-- Criar política para que usuários possam criar seus próprios projetos
CREATE POLICY "Users can create their own projects"
  ON projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Criar política para que usuários possam atualizar seus próprios projetos
CREATE POLICY "Users can update their own projects"
  ON projects FOR UPDATE
  USING (auth.uid() = user_id);

-- Criar política para que usuários possam deletar seus próprios projetos
CREATE POLICY "Users can delete their own projects"
  ON projects FOR DELETE
  USING (auth.uid() = user_id);
