import { createBrowserClient } from '@supabase/ssr'

/**
 * Cria um cliente Supabase para uso em Client Components
 *
 * Este cliente funciona tanto no navegador quanto no servidor (SSR),
 * mas é otimizado para uso em componentes marcados com 'use client'
 *
 * @returns Cliente Supabase configurado
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
