'use client'

import { createClient } from '@/lib/supabase'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { Database } from '@organizacao/shared'
import styles from './today.module.css'
import Sidebar from '@/components/Sidebar'

type Task = Database['public']['Tables']['tasks']['Row']
type Project = Database['public']['Tables']['projects']['Row']

export default function TodayPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkUser()
  }, [])

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/auth')
      return
    }

    setUser(user)
    loadTasks()
    loadProjects()

    // Setup realtime subscription
    const channel = supabase
      .channel('tasks-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          loadTasks()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  async function loadTasks() {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao carregar tarefas:', error)
    } else {
      setTasks(data || [])
    }
    setLoading(false)
  }

  async function loadProjects() {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      console.error('Erro ao carregar projetos:', error)
    } else {
      setProjects(data || [])
    }
  }

  async function toggleTask(taskId: string, currentStatus: boolean) {
    const { error } = await supabase
      .from('tasks')
      .update({ completed: !currentStatus })
      .eq('id', taskId)

    if (error) {
      alert('Erro ao atualizar tarefa: ' + error.message)
    } else {
      loadTasks()
    }
  }

  async function toggleFocus(taskId: string, currentFocusStatus: boolean) {
    // Se está tentando marcar como foco
    if (!currentFocusStatus) {
      // Verificar quantas tarefas foco já existem para hoje
      const today = new Date().toISOString().split('T')[0]
      const { data: focusTasks, error: countError } = await supabase
        .from('tasks')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_focus', true)
        .eq('focus_date', today)

      if (countError) {
        alert('Erro ao verificar tarefas foco: ' + countError.message)
        return
      }

      if (focusTasks && focusTasks.length >= 5) {
        alert('Você já tem 5 tarefas foco para hoje. Remova uma tarefa foco antes de adicionar outra.')
        return
      }

      // Marcar como foco com a data de hoje
      const { error } = await supabase
        .from('tasks')
        .update({ is_focus: true, focus_date: today })
        .eq('id', taskId)

      if (error) {
        alert('Erro ao marcar tarefa como foco: ' + error.message)
      } else {
        loadTasks()
      }
    } else {
      // Remover do foco
      const { error } = await supabase
        .from('tasks')
        .update({ is_focus: false, focus_date: null })
        .eq('id', taskId)

      if (error) {
        alert('Erro ao remover tarefa do foco: ' + error.message)
      } else {
        loadTasks()
      }
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/auth')
  }

  function getProjectName(projectId: string | null): string | null {
    if (!projectId) return null
    const project = projects.find(p => p.id === projectId)
    return project ? project.name : null
  }

  function getProjectColor(projectId: string | null): string | null {
    if (!projectId) return null
    const project = projects.find(p => p.id === projectId)
    return project?.color || null
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Carregando...</div>
      </div>
    )
  }

  // Filtrar tarefas foco de hoje
  const today = new Date().toISOString().split('T')[0]
  const focusTasks = tasks.filter(task => task.is_focus && task.focus_date === today && !task.completed)
  const focusTasksCompleted = tasks.filter(task => task.is_focus && task.focus_date === today && task.completed)

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>⭐ Tarefas do Dia</h1>
          <p className={styles.subtitle}>
            Foque nas tarefas mais importantes de hoje
          </p>
        </div>
        <div className={styles.headerActions}>
          <button onClick={() => setIsSidebarOpen(true)} className={styles.menuButton}>
            ☰ Menu
          </button>
          <button onClick={handleSignOut} className={styles.signOutButton}>
            Sair
          </button>
        </div>
      </div>

      <div className={styles.content}>
        {/* Seção de Tarefas Foco Pendentes */}
        <div className={styles.focusSection}>
          <div className={styles.focusSectionHeader}>
            <h2 className={styles.focusSectionTitle}>
              Tarefas Foco ({focusTasks.length}/5)
            </h2>
            <p className={styles.focusSectionSubtitle}>
              {focusTasks.length === 0
                ? 'Selecione até 5 tarefas para focar hoje'
                : `Você tem ${5 - focusTasks.length} ${5 - focusTasks.length === 1 ? 'vaga' : 'vagas'} disponível${5 - focusTasks.length === 1 ? '' : 'is'}`
              }
            </p>
          </div>

          {focusTasks.length === 0 ? (
            <div className={styles.emptyState}>
              <p className={styles.emptyStateIcon}>🎯</p>
              <p className={styles.emptyStateTitle}>Nenhuma tarefa foco selecionada</p>
              <p className={styles.emptyStateText}>
                Vá para a página de Tarefas e marque até 5 tarefas com estrela para focar hoje.
              </p>
              <button
                onClick={() => router.push('/tasks')}
                className={styles.goToTasksButton}
              >
                Ir para Tarefas
              </button>
            </div>
          ) : (
            <div className={styles.focusTasksList}>
              {focusTasks.map((task) => (
                <div
                  key={task.id}
                  className={styles.focusTaskCard}
                >
                  <div className={styles.focusTaskContent}>
                    <div className={styles.focusTaskHeader}>
                      <h3>{task.title}</h3>
                      {task.project_id && getProjectName(task.project_id) && (
                        <span
                          className={styles.projectBadge}
                          style={{
                            backgroundColor: getProjectColor(task.project_id) || '#6366f1',
                            color: '#fff'
                          }}
                        >
                          {getProjectName(task.project_id)}
                        </span>
                      )}
                    </div>
                    {task.description && (
                      <p className={styles.taskDescription}>{task.description}</p>
                    )}
                    {task.due_date && (
                      <div className={styles.taskMeta}>
                        <small className={
                          new Date(task.due_date) < new Date() && !task.completed
                            ? styles.overdue
                            : styles.dueDate
                        }>
                          Vence em: {new Date(task.due_date).toLocaleDateString('pt-BR')}
                        </small>
                      </div>
                    )}
                  </div>
                  <div className={styles.focusTaskActions}>
                    <button
                      onClick={() => toggleFocus(task.id, task.is_focus)}
                      className={styles.removeFocusButton}
                      title="Remover do foco"
                    >
                      Remover Foco
                    </button>
                    <button
                      onClick={() => toggleTask(task.id, task.completed)}
                      className={styles.completeButton}
                    >
                      ✓ Concluir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Seção de Tarefas Concluídas */}
        {focusTasksCompleted.length > 0 && (
          <div className={styles.completedSection}>
            <h2 className={styles.completedSectionTitle}>
              ✅ Concluídas Hoje ({focusTasksCompleted.length})
            </h2>
            <div className={styles.completedTasksList}>
              {focusTasksCompleted.map((task) => (
                <div
                  key={task.id}
                  className={styles.completedTaskCard}
                >
                  <div className={styles.completedTaskContent}>
                    <h4>{task.title}</h4>
                    {task.project_id && getProjectName(task.project_id) && (
                      <span
                        className={styles.projectBadge}
                        style={{
                          backgroundColor: getProjectColor(task.project_id) || '#6366f1',
                          color: '#fff',
                          fontSize: '0.75rem',
                          marginTop: '0.25rem'
                        }}
                      >
                        {getProjectName(task.project_id)}
                      </span>
                    )}
                  </div>
                  <div className={styles.completedTaskActions}>
                    <button
                      onClick={() => toggleTask(task.id, task.completed)}
                      className={styles.reopenButton}
                    >
                      ↩ Reabrir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)}>
        <div className={styles.sidebarContent}>
          <div className={styles.sidebarNavigation}>
            <button
              className={styles.sidebarNavItem}
              onClick={() => router.push('/tasks')}
            >
              📋 Todas as Tarefas
            </button>
            <button
              className={`${styles.sidebarNavItem} ${styles.sidebarNavItemActive}`}
            >
              ⭐ Tarefas do Dia
            </button>
          </div>
        </div>
      </Sidebar>
    </div>
  )
}
