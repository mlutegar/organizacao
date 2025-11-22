# Tarefa Foco - Instruções de Instalação

## Funcionalidade Implementada

Foi implementado um sistema de "Tarefa Foco" que permite ao usuário marcar até 5 tarefas como foco do dia.

### Características:

1. Botão "Foco" em cada tarefa
2. Validação de máximo 5 tarefas foco por dia
3. Seção destacada mostrando as tarefas foco do dia
4. Indicador visual de tarefas marcadas como foco
5. Controle de data para garantir que tarefas foco sejam específicas do dia

## Passos para Ativar a Funcionalidade

### 1. Executar a Migração do Banco de Dados

Acesse o painel do Supabase e execute o seguinte SQL no SQL Editor:

```sql
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
```

Ou execute o arquivo SQL diretamente:
- Arquivo: `docs/migration-add-focus-fields.sql`

### 2. Verificar as Mudanças no Código

Os seguintes arquivos foram modificados:

#### 2.1. Schema de Tipos (`packages/shared/src/types/database.ts`)
- Adicionados campos `is_focus` e `focus_date` na tabela `tasks`

#### 2.2. Interface de Tarefas (`packages/web/src/app/tasks/page.tsx`)
- Adicionada função `toggleFocus()` com validação de limite de 5 tarefas
- Adicionado botão "Foco" em cada tarefa
- Criada seção destacada para mostrar tarefas foco do dia

#### 2.3. Estilos CSS (`packages/web/src/app/tasks/tasks.module.css`)
- Estilos para botões de foco (normal e ativo)
- Estilos para a seção de tarefas foco destacada

### 3. Testar a Funcionalidade

1. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   # ou
   yarn dev
   ```

2. Acesse a página de tarefas

3. Teste as seguintes funcionalidades:
   - Marcar uma tarefa como foco (botão "☆ Foco")
   - Verificar se a tarefa aparece na seção destacada no topo
   - Tentar marcar mais de 5 tarefas como foco (deve mostrar alerta)
   - Desmarcar uma tarefa foco (botão "⭐ Foco")
   - Marcar tarefa como concluída diretamente da seção de foco

## Como Usar

1. Na lista de tarefas, clique no botão "☆ Foco" para marcar uma tarefa como foco do dia
2. A tarefa será exibida na seção destacada no topo da página
3. Você pode ter no máximo 5 tarefas foco por dia
4. Para remover uma tarefa do foco, clique no botão "⭐ Foco" novamente
5. As tarefas foco são específicas do dia - tarefas marcadas como foco em dias diferentes não serão exibidas

## Notas Técnicas

- As tarefas foco são filtradas por data (`focus_date`)
- A validação do limite de 5 tarefas é feita no cliente antes de enviar ao banco
- A seção de tarefas foco só aparece quando há pelo menos 1 tarefa marcada como foco para o dia atual
- O campo `is_focus` é booleano e indica se a tarefa está marcada como foco
- O campo `focus_date` armazena a data em que a tarefa foi marcada como foco
