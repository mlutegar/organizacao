import Link from 'next/link'

export default function Home() {
  return (
    <main className="container">
      <h1>Bem-vindo ao Organização Web</h1>
      <p>Aplicação Next.js com TypeScript e Supabase em um monorepo.</p>

      <div className="features">
        <div className="feature">
          <h2>Next.js 14</h2>
          <p>Framework React com App Router</p>
        </div>
        <div className="feature">
          <h2>TypeScript</h2>
          <p>Type safety em todo o código</p>
        </div>
        <div className="feature">
          <h2>Supabase</h2>
          <p>Backend as a Service configurado</p>
        </div>
      </div>

      <div className="demo-section">
        <h2>Páginas de Demonstração</h2>
        <p>Teste a integração com o Supabase:</p>
        <div className="demo-links">
          <Link href="/auth" className="demo-link">
            <span className="demo-icon">🔐</span>
            <div>
              <h3>Autenticação</h3>
              <p>Teste login e registro de usuários</p>
            </div>
          </Link>
          <Link href="/tasks" className="demo-link">
            <span className="demo-icon">✓</span>
            <div>
              <h3>Gerenciar Tarefas</h3>
              <p>CRUD completo de tarefas com Supabase</p>
            </div>
          </Link>
        </div>
      </div>
    </main>
  )
}
