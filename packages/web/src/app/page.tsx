export default function Home() {
  return (
    <main className="container">
      <h1>Bem-vindo ao Organização Web</h1>
      <p>Aplicação Next.js com TypeScript em um monorepo.</p>
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
          <h2>Monorepo</h2>
          <p>Yarn Workspaces para gerenciamento</p>
        </div>
      </div>
    </main>
  )
}
