-- Criar tabela de itens da roleta
-- Execute este script no Supabase SQL Editor

CREATE TABLE IF NOT EXISTS roulette_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  color VARCHAR(7), -- Cor em formato hexadecimal (#RRGGBB) - opcional
  is_hidden BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_roulette_items_user_id ON roulette_items(user_id);
CREATE INDEX IF NOT EXISTS idx_roulette_items_is_hidden ON roulette_items(is_hidden);

-- Adicionar comentários para documentação
COMMENT ON TABLE roulette_items IS 'Tabela de itens para a roleta (Wheel of Fortune)';
COMMENT ON COLUMN roulette_items.title IS 'Título/texto do item na roleta';
COMMENT ON COLUMN roulette_items.color IS 'Cor do segmento na roleta (opcional)';
COMMENT ON COLUMN roulette_items.is_hidden IS 'Indica se o item está oculto';

-- Habilitar RLS (Row Level Security)
ALTER TABLE roulette_items ENABLE ROW LEVEL SECURITY;

-- Criar políticas de segurança
CREATE POLICY "Users can view their own roulette items"
  ON roulette_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own roulette items"
  ON roulette_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own roulette items"
  ON roulette_items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own roulette items"
  ON roulette_items FOR DELETE
  USING (auth.uid() = user_id);
