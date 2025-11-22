# Configuração do Supabase Client

## Arquivo Disponível

### `client.ts`
Cliente Supabase para uso em **Client Components** (componentes com `'use client'`).

```typescript
import { createClient } from '@/lib/supabase'

export default function MyComponent() {
  const supabase = createClient()

  // Use o cliente aqui
  const { data } = await supabase.from('tasks').select('*')
}
```

## Arquivo Desabilitado

### `server.ts.disabled`
Este arquivo contém a implementação do cliente Supabase para Server Components usando `next/headers`.

**Por que está desabilitado?**
- O Next.js apresenta erros de compilação ao importar `next/headers` em certos contextos
- Como estamos usando apenas Client Components nas páginas de demonstração, não precisamos dele agora
- O arquivo foi renomeado para `.disabled` para evitar erros de build

**Quando usar Server Components?**
Para usar Server Components com Supabase no futuro:
1. Remova o `.disabled` do arquivo `server.ts`
2. Importe no barrel export: `export { createServerSupabaseClient } from './server'`
3. Use em Server Components (sem `'use client'`):

```typescript
// app/exemplo/page.tsx (Server Component - SEM 'use client')
import { createServerSupabaseClient } from '@/lib/supabase'

export default async function ExemploPage() {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase.from('tasks').select('*')

  return <div>{/* ... */}</div>
}
```

## Diferenças entre Client e Server

| Aspecto | Client Component | Server Component |
|---------|------------------|------------------|
| Diretiva | `'use client'` no topo | Sem diretiva |
| Execução | Navegador + SSR | Apenas servidor |
| Hooks React | ✅ useState, useEffect | ❌ Não pode usar |
| Interatividade | ✅ Eventos onClick, etc | ❌ Sem eventos |
| Cliente Supabase | `createClient()` | `createServerSupabaseClient()` |
| Cookies | Gerenciado pelo browser | Requer next/headers |

## Recomendação Atual

Por enquanto, use **Client Components** com `createClient()` para:
- Autenticação
- CRUD de dados
- Realtime subscriptions
- Qualquer interação do usuário

Todas as páginas de demonstração já estão configuradas desta forma e funcionam perfeitamente!
