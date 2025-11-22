'use client'

import { createClient } from '@/lib/supabase'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { Database } from '@organizacao/shared'
import styles from './tasks.module.css'

type Task = Database['public']['Tables']['tasks']['Row']

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskDescription, setNewTaskDescription] = useState('')
  const [newTaskDueDate, setNewTaskDueDate] = useState('')
  const [creating, setCreating] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editDueDate, setEditDueDate] = useState('')
  const [updating, setUpdating] = useState(false)
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

  async function createTask(e: React.FormEvent) {
    e.preventDefault()

    if (!newTaskTitle.trim()) return

    setCreating(true)

    const { error } = await supabase
      .from('tasks')
      .insert({
        title: newTaskTitle,
        description: newTaskDescription || null,
        due_date: newTaskDueDate || null,
        user_id: user.id,
      })

    if (error) {
      alert('Erro ao criar tarefa: ' + error.message)
    } else {
      setNewTaskTitle('')
      setNewTaskDescription('')
      setNewTaskDueDate('')
      loadTasks()
    }

    setCreating(false)
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

  async function deleteTask(taskId: string) {
    if (!confirm('Tem certeza que deseja excluir esta tarefa?')) return

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId)

    if (error) {
      alert('Erro ao excluir tarefa: ' + error.message)
    } else {
      loadTasks()
    }
  }

  function openEditModal(task: Task) {
    setEditingTask(task)
    setEditTitle(task.title)
    setEditDescription(task.description || '')
    setEditDueDate(task.due_date || '')
  }

  function closeEditModal() {
    setEditingTask(null)
    setEditTitle('')
    setEditDescription('')
    setEditDueDate('')
  }

  async function updateTask(e: React.FormEvent) {
    e.preventDefault()

    if (!editingTask || !editTitle.trim()) return

    setUpdating(true)

    const { error } = await supabase
      .from('tasks')
      .update({
        title: editTitle,
        description: editDescription || null,
        due_date: editDueDate || null,
      })
      .eq('id', editingTask.id)

    if (error) {
      alert('Erro ao atualizar tarefa: ' + error.message)
    } else {
      closeEditModal()
      loadTasks()
    }

    setUpdating(false)
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/auth')
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Carregando...</div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Minhas Tarefas</h1>
          <p className={styles.subtitle}>
            Logado como: <strong>{user?.email}</strong>
          </p>
        </div>
        <button onClick={handleSignOut} className={styles.signOutButton}>
          Sair
        </button>
      </div>

      <div className={styles.content}>
        <div className={styles.createCard}>
          <h2>Criar Nova Tarefa</h2>
          <form onSubmit={createTask} className={styles.form}>
            <div className={styles.inputGroup}>
              <label htmlFor="title">Título*</label>
              <input
                id="title"
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Ex: Estudar React"
                required
                disabled={creating}
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="description">Descrição (opcional)</label>
              <textarea
                id="description"
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
                placeholder="Detalhes sobre a tarefa..."
                rows={3}
                disabled={creating}
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="dueDate">Data de Vencimento (opcional)</label>
              <input
                id="dueDate"
                type="date"
                value={newTaskDueDate}
                onChange={(e) => setNewTaskDueDate(e.target.value)}
                disabled={creating}
              />
            </div>

            <button
              type="submit"
              className={styles.createButton}
              disabled={creating || !newTaskTitle.trim()}
            >
              {creating ? 'Criando...' : 'Criar Tarefa'}
            </button>
          </form>
        </div>

        <div className={styles.tasksSection}>
          <h2>Lista de Tarefas ({tasks.length})</h2>

          {tasks.length === 0 ? (
            <div className={styles.emptyState}>
              <p>Nenhuma tarefa criada ainda.</p>
              <p>Crie sua primeira tarefa acima!</p>
            </div>
          ) : (
            <div className={styles.tasksList}>
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className={`${styles.taskCard} ${task.completed ? styles.completed : ''}`}
                >
                  <div
                    className={styles.taskContent}
                    onClick={() => openEditModal(task)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className={styles.taskHeader}>
                      <h3>{task.title}</h3>
                      <span className={styles.taskStatus}>
                        {task.completed ? '✓ Concluída' : '○ Pendente'}
                      </span>
                    </div>
                    {task.description && (
                      <p className={styles.taskDescription}>{task.description}</p>
                    )}
                    <div className={styles.taskMeta}>
                      <small>
                        Criada em: {new Date(task.created_at).toLocaleDateString('pt-BR')}
                      </small>
                      {task.due_date && (
                        <small className={
                          new Date(task.due_date) < new Date() && !task.completed
                            ? styles.overdue
                            : styles.dueDate
                        }>
                          Vence em: {new Date(task.due_date).toLocaleDateString('pt-BR')}
                        </small>
                      )}
                    </div>
                  </div>
                  <div className={styles.taskActions}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleTask(task.id, task.completed)
                      }}
                      className={styles.toggleButton}
                    >
                      {task.completed ? 'Reabrir' : 'Concluir'}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteTask(task.id)
                      }}
                      className={styles.deleteButton}
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {editingTask && (
        <div className={styles.modalOverlay} onClick={closeEditModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Editar Tarefa</h2>
              <button onClick={closeEditModal} className={styles.closeButton}>
                ×
              </button>
            </div>

            <form onSubmit={updateTask} className={styles.form}>
              <div className={styles.inputGroup}>
                <label htmlFor="edit-title">Título*</label>
                <input
                  id="edit-title"
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Ex: Estudar React"
                  required
                  disabled={updating}
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="edit-description">Descrição (opcional)</label>
                <textarea
                  id="edit-description"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Detalhes sobre a tarefa..."
                  rows={3}
                  disabled={updating}
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="edit-dueDate">Data de Vencimento (opcional)</label>
                <input
                  id="edit-dueDate"
                  type="date"
                  value={editDueDate}
                  onChange={(e) => setEditDueDate(e.target.value)}
                  disabled={updating}
                />
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  onClick={closeEditModal}
                  className={styles.cancelButton}
                  disabled={updating}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={styles.saveButton}
                  disabled={updating || !editTitle.trim()}
                >
                  {updating ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
