## 📋 Visão Geral do Projeto

Aplicação de gerenciamento de tarefas com sistema de priorização dinâmica, modos de uso contextuais (rua/desktop) e técnicas de concentração gamificadas.

---

## 🎯 Funcionalidades Core

### 1. Gestão Básica de Tarefas
- Criar, editar e deletar tarefas
- Sistema de subtarefas (hierarquia ilimitada)
- Organização por projetos
- Tags e categorias personalizadas
- Data de vencimento e lembretes
- Descrições e notas detalhadas

### 2. Sistema de Priorização Multi-Nível
**Diário:**
- Seleção de até 3 tarefas prioritárias do dia
- Visualização automática das tarefas da semana durante seleção

**Semanal:**
- Definição de 5-7 tarefas prioritárias da semana
- Visualização do contexto mensal durante seleção

**Mensal:**
- Estabelecimento de objetivos mensais (5-10 tarefas)
- Dashboard com visão panorâmica

### 3. Modo Rua vs Modo Desktop

**Modo Rua (Mobile-First):**
- Interface simplificada e touch-optimized
- Visualização rápida de próximas tarefas
- Timer de concentração com notificações
- Modo offline completo
- Gestos para marcar como concluído
- Widget de acesso rápido

**Modo Desktop:**
- Visão completa de projetos e hierarquias
- Drag-and-drop para reorganizar
- Atalhos de teclado
- Painel lateral com estatísticas
- Múltiplas janelas/views simultâneas
- Integração com calendário externo

### 4. Sistema de Ciclos de Trabalho (Pomodoro Adaptativo)

**Padrão de Execução:**
```
Rodada 1:
- 15 min: Tarefa #1 (mais importante)
- 15 min: Tarefa #2 (segunda mais importante)
- 30 min: Tarefa #1

Rodada 2:
- 15 min: Tarefa #3
- 30 min: Tarefa #2
- 45 min: Tarefa #1

Rodada 3:
- 15 min: Tarefa #4 (se existir)
- 30 min: Tarefa #3
- 45 min: Tarefa #2
- 60 min: Tarefa #1

E assim sucessivamente...
```

**Características:**
- Timer integrado com notificações sonoras/visuais
- Histórico de ciclos completados
- Estatísticas de produtividade por tarefa
- Pausas configuráveis entre ciclos
- Opção de pular ou estender ciclos

### 5. Sistema de Concentração (Focus Mode)

**Módulo TikTok + Música:**
- Alternância estruturada para encontrar música ideal
- Progressão: 5→10→15→20 (incremento de 5)

**Fluxo:**
1. Assistir 5 TikToks
2. Escutar 5 músicas (30s-1min cada)
3. Se gostar de alguma música → iniciar ciclo de trabalho
4. Se não gostar → repetir com 10 de cada
5. Continuar progressão até encontrar música

**Integrações Possíveis:**
- Spotify API (buscar músicas por mood)
- YouTube API (playlists de concentração)
- Timer visual mostrando quantos restam
- Histórico de músicas que funcionaram

---

## 🏗️ Arquitetura Técnica

### Stack Tecnológico Recomendado

**Frontend:**
- React Native (app mobile iOS/Android)
- Next.js ou React (versão web/desktop)
- TypeScript
- TailwindCSS ou Styled Components
- Zustand ou Redux para gerenciamento de estado
- React Query para cache e sincronização

**Backend:**
- Node.js + Express ou Fastify
- PostgreSQL (dados estruturados)
- Redis (cache e sessões)
- Prisma ORM

**Alternativa Backend Simplificada:**
- Firebase (Firestore + Authentication + Cloud Functions)
- Supabase (PostgreSQL gerenciado + Auth + Realtime)

**Outros Serviços:**
- Expo (para React Native)
- Electron (versão desktop nativa - opcional)
- PWA capabilities para web
- Socket.io (sincronização real-time entre dispositivos)

### Banco de Dados - Estrutura Principal

```
Users
- id
- email
- name
- settings (JSON)
- created_at

Projects
- id
- user_id
- name
- color
- icon
- created_at

Tasks
- id
- user_id
- project_id
- parent_task_id (para subtarefas)
- title
- description
- priority_level (dia/semana/mês/nenhum)
- priority_order
- due_date
- completed
- completed_at
- created_at

WorkCycles
- id
- user_id
- task_id
- duration_minutes
- started_at
- completed_at
- interrupted (boolean)

FocusSessions
- id
- user_id
- tiktok_count
- music_count
- selected_music (JSON)
- successful (boolean)
- created_at

Statistics
- id
- user_id
- date
- total_work_minutes
- cycles_completed
- tasks_completed
- streak_days
```

---
