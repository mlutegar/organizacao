'use client'

import { createClient } from '@/lib/supabase'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from './auth.module.css'

export default function AuthPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [isSignUp, setIsSignUp] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        })

        if (error) throw error

        setMessage({
          type: 'success',
          text: 'Conta criada com sucesso! Verifique seu email para confirmar.',
        })
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) throw error

        setMessage({
          type: 'success',
          text: 'Login realizado com sucesso!',
        })

        // Redireciona para a página de tarefas
        setTimeout(() => router.push('/tasks'), 1000)
      }
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Erro ao autenticar',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>
          {isSignUp ? 'Criar Conta' : 'Login'}
        </h1>

        <form onSubmit={handleAuth} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              disabled={loading}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password">Senha</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              disabled={loading}
            />
          </div>

          {message && (
            <div className={`${styles.message} ${styles[message.type]}`}>
              {message.text}
            </div>
          )}

          <button
            type="submit"
            className={styles.button}
            disabled={loading}
          >
            {loading ? 'Carregando...' : isSignUp ? 'Criar Conta' : 'Entrar'}
          </button>
        </form>

        <button
          type="button"
          className={styles.switchButton}
          onClick={() => {
            setIsSignUp(!isSignUp)
            setMessage(null)
          }}
          disabled={loading}
        >
          {isSignUp
            ? 'Já tem uma conta? Faça login'
            : 'Não tem conta? Crie uma'}
        </button>

        <div className={styles.info}>
          <p><strong>Teste de Conexão Supabase</strong></p>
          <p>Use esta página para testar a autenticação com o Supabase.</p>
        </div>
      </div>
    </div>
  )
}
