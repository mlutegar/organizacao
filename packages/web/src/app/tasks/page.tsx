'use client'

import { createClient } from '@/lib/supabase'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { Database } from '@organizacao/shared'
import styles from './tasks.module.css'
import Sidebar from '@/components/Sidebar'

type Task = Database['public']['Tables']['tasks']['Row']
type Project = Database['public']['Tables']['projects']['Row']
type ViewMode = 'all' | 'today' | 'by-project' | 'inbox' | 'completed'

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskDescription, setNewTaskDescription] = useState('')
  const [newTaskDueDate, setNewTaskDueDate] = useState('')
  const [newTaskProjectId, setNewTaskProjectId] = useState('')
  const [creating, setCreating] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editDueDate, setEditDueDate] = useState('')
  const [editProjectId, setEditProjectId] = useState('')
  const [updating, setUpdating] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showCreateProjectForm, setShowCreateProjectForm] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectDescription, setNewProjectDescription] = useState('')
  const [newProjectColor, setNewProjectColor] = useState('#6366f1')
  const [creatingProject, setCreatingProject] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('all')
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
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
        project_id: newTaskProjectId || null,
        user_id: user.id,
      })

    if (error) {
      alert('Erro ao criar tarefa: ' + error.message)
    } else {
      setNewTaskTitle('')
      setNewTaskDescription('')
      setNewTaskDueDate('')
      setNewTaskProjectId('')
      setShowCreateForm(false)
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
    setEditProjectId(task.project_id || '')
  }

  function closeEditModal() {
    setEditingTask(null)
    setEditTitle('')
    setEditDescription('')
    setEditDueDate('')
    setEditProjectId('')
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
        project_id: editProjectId || null,
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

  async function createProject(e: React.FormEvent) {
    e.preventDefault()

    if (!newProjectName.trim()) return

    setCreatingProject(true)

    const { error } = await supabase
      .from('projects')
      .insert({
        name: newProjectName,
        description: newProjectDescription || null,
        color: newProjectColor,
        user_id: user.id,
      })

    if (error) {
      alert('Erro ao criar projeto: ' + error.message)
    } else {
      setNewProjectName('')
      setNewProjectDescription('')
      setNewProjectColor('#6366f1')
      setShowCreateProjectForm(false)
      loadProjects()
    }

    setCreatingProject(false)
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
  const focusTasks = tasks.filter(task => task.is_focus && task.focus_date === today)

  // Função para filtrar tarefas baseado no modo de visualização
  function getFilteredTasks(): Task[] {
    switch (viewMode) {
      case 'all':
        return tasks.filter(task => !task.completed)
      case 'today':
        return tasks.filter(task => task.due_date === today && !task.completed)
      case 'inbox':
        return tasks.filter(task => !task.project_id && !task.completed)
      case 'by-project':
        // Se um projeto específico foi selecionado, mostrar apenas as tarefas dele
        if (selectedProjectId) {
          return tasks.filter(task => task.project_id === selectedProjectId && !task.completed)
        }
        // Caso contrário, mostrar todas as tarefas não concluídas
        return tasks.filter(task => !task.completed)
      case 'completed':
        return tasks.filter(task => task.completed)
      default:
        return tasks.filter(task => !task.completed)
    }
  }

  // Função para agrupar tarefas por projeto (quando viewMode === 'by-project')
  function getTasksByProject(): { [key: string]: Task[] } {
    const grouped: { [key: string]: Task[] } = {}

    tasks.forEach(task => {
      const projectId = task.project_id || 'no-project'
      if (!grouped[projectId]) {
        grouped[projectId] = []
      }
      grouped[projectId].push(task)
    })

    return grouped
  }

  const filteredTasks = getFilteredTasks()
  const tasksByProject = viewMode === 'by-project' ? getTasksByProject() : {}

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Minhas Tarefas</h1>
          <p className={styles.subtitle}>
            Logado como: <strong>{user?.email}</strong>
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

      {focusTasks.length > 0 && (
        <div className={styles.focusSection}>
          <h2 className={styles.focusSectionTitle}>
            ⭐ Tarefas Foco de Hoje ({focusTasks.length}/5)
          </h2>
          <div className={styles.focusTasksList}>
            {focusTasks.map((task) => (
              <div
                key={task.id}
                className={`${styles.focusTaskItem} ${task.completed ? styles.focusTaskCompleted : ''}`}
              >
                <div className={styles.focusTaskContent}>
                  <h4>{task.title}</h4>
                  {task.description && <p>{task.description}</p>}
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
                <div className={styles.focusTaskActions}>
                  <button
                    onClick={() => toggleTask(task.id, task.completed)}
                    className={styles.focusTaskToggle}
                  >
                    {task.completed ? '✓' : '○'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={styles.content}>
        <div className={styles.tasksSection}>
          <h2>
            {viewMode === 'all' && `Lista de Tarefas (${filteredTasks.length})`}
            {viewMode === 'today' && `Tarefas que Finalizam Hoje (${filteredTasks.length})`}
            {viewMode === 'inbox' && `Inbox - Tarefas sem Projeto (${filteredTasks.length})`}
            {viewMode === 'by-project' && selectedProjectId && (() => {
              const project = projects.find(p => p.id === selectedProjectId)
              return project ? `${project.name} (${filteredTasks.length})` : 'Projeto'
            })()}
            {viewMode === 'by-project' && !selectedProjectId && 'Tarefas por Projeto'}
            {viewMode === 'completed' && `Tarefas Concluídas (${filteredTasks.length})`}
          </h2>

          {tasks.length === 0 ? (
            <div className={styles.emptyState}>
              <p>Nenhuma tarefa criada ainda.</p>
              <p>Crie sua primeira tarefa acima!</p>
            </div>
          ) : viewMode === 'by-project' && !selectedProjectId ? (
            <div className={styles.projectGroups}>
              {Object.keys(tasksByProject).map((projectId) => {
                const projectTasks = tasksByProject[projectId]
                const isInbox = projectId === 'no-project'
                const project = projects.find(p => p.id === projectId)

                return (
                  <div key={projectId} className={styles.projectGroup}>
                    <h3 className={styles.projectGroupTitle}>
                      {isInbox ? (
                        'Inbox - Sem Projeto'
                      ) : (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span
                            style={{
                              width: '12px',
                              height: '12px',
                              borderRadius: '50%',
                              backgroundColor: project?.color || '#6366f1',
                              display: 'inline-block'
                            }}
                          />
                          {project?.name || 'Projeto Desconhecido'}
                        </span>
                      )}
                      <span className={styles.projectGroupCount}>({projectTasks.length})</span>
                    </h3>
                    <div className={styles.tasksList}>
                      {projectTasks.map((task) => (
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
                                toggleFocus(task.id, task.is_focus)
                              }}
                              className={task.is_focus ? styles.focusButtonActive : styles.focusButton}
                              title={task.is_focus ? 'Remover do foco' : 'Marcar como foco do dia'}
                            >
                              {task.is_focus ? '⭐ Foco' : '☆ Foco'}
                            </button>
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
                  </div>
                )
              })}
            </div>
          ) : (
            <div className={styles.tasksList}>
              {filteredTasks.length === 0 ? (
                <div className={styles.emptyState}>
                  <p>Nenhuma tarefa encontrada para este filtro.</p>
                </div>
              ) : (
                filteredTasks.map((task) => (
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
                      {task.project_id && getProjectName(task.project_id) && (
                        <div className={styles.taskProject}>
                          <span
                            className={styles.projectBadge}
                            style={{
                              backgroundColor: getProjectColor(task.project_id) || '#6366f1',
                              color: '#fff'
                            }}
                          >
                            {getProjectName(task.project_id)}
                          </span>
                        </div>
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
                          toggleFocus(task.id, task.is_focus)
                        }}
                        className={task.is_focus ? styles.focusButtonActive : styles.focusButton}
                        title={task.is_focus ? 'Remover do foco' : 'Marcar como foco do dia'}
                      >
                        {task.is_focus ? '⭐ Foco' : '☆ Foco'}
                      </button>
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
                ))
              )}
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

              <div className={styles.inputGroup}>
                <label htmlFor="edit-project">Projeto (opcional)</label>
                <select
                  id="edit-project"
                  value={editProjectId}
                  onChange={(e) => setEditProjectId(e.target.value)}
                  disabled={updating}
                >
                  <option value="">Nenhum projeto</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
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

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)}>
        <div className={styles.sidebarContent}>
          {!showCreateForm && !showCreateProjectForm ? (
            <>
              <div className={styles.menuActions}>
                <button
                  onClick={() => {
                    setShowCreateForm(true)
                  }}
                  className={styles.menuActionButton}
                >
                  <span className={styles.menuActionIcon}>+</span>
                  <span>Adicionar Tarefa</span>
                </button>
              </div>

              <div className={styles.sidebarNavigation}>
                <button
                  className={`${styles.sidebarNavItem} ${viewMode === 'inbox' ? styles.sidebarNavItemActive : ''}`}
                  onClick={() => setViewMode('inbox')}
                >
                  📥 Inbox ({tasks.filter(t => !t.project_id && !t.completed).length})
                </button>
                <button
                  className={styles.sidebarNavItem}
                  onClick={() => router.push('/today')}
                >
                  ⭐ Tarefas do Dia ({focusTasks.length})
                </button>
                <button
                  className={`${styles.sidebarNavItem} ${viewMode === 'all' ? styles.sidebarNavItemActive : ''}`}
                  onClick={() => setViewMode('all')}
                >
                  📋 Todas as Tarefas ({tasks.filter(t => !t.completed).length})
                </button>
                <button
                  className={`${styles.sidebarNavItem} ${viewMode === 'today' ? styles.sidebarNavItemActive : ''}`}
                  onClick={() => setViewMode('today')}
                >
                  📅 Finalizam Hoje ({tasks.filter(t => t.due_date === today && !t.completed).length})
                </button>
                <button
                  className={`${styles.sidebarNavItem} ${viewMode === 'completed' ? styles.sidebarNavItemActive : ''}`}
                  onClick={() => setViewMode('completed')}
                >
                  ✅ Concluídas ({tasks.filter(t => t.completed).length})
                </button>
              </div>

              <div className={styles.sidebarDivider} />

              <div className={styles.projectsSection}>
                <div className={styles.projectsHeader}>
                  <span>Projetos</span>
                  <button
                    onClick={() => setShowCreateProjectForm(true)}
                    className={styles.addProjectButton}
                    title="Adicionar projeto"
                  >
                    +
                  </button>
                </div>
                <div className={styles.projectsList}>
                  {projects.map((project) => (
                    <button
                      key={project.id}
                      className={`${styles.projectItem} ${viewMode === 'by-project' && selectedProjectId === project.id ? styles.projectItemActive : ''}`}
                      onClick={() => {
                        setViewMode('by-project')
                        setSelectedProjectId(project.id)
                      }}
                    >
                      <span
                        className={styles.projectDot}
                        style={{ backgroundColor: project.color || undefined }}
                      />
                      <span>{project.name}</span>
                    </button>
                  ))}
                  {projects.length === 0 && (
                    <div className={styles.emptyProjects}>
                      Nenhum projeto criado
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : showCreateForm ? (
            <div>
              <div className={styles.formHeader}>
                <h2>Criar Nova Tarefa</h2>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className={styles.backButton}
                >
                  ← Voltar
                </button>
              </div>
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

                <div className={styles.inputGroup}>
                  <label htmlFor="project">Projeto (opcional)</label>
                  <select
                    id="project"
                    value={newTaskProjectId}
                    onChange={(e) => setNewTaskProjectId(e.target.value)}
                    disabled={creating}
                  >
                    <option value="">Nenhum projeto</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
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
          ) : (
            <div>
              <div className={styles.formHeader}>
                <h2>Criar Novo Projeto</h2>
                <button
                  onClick={() => setShowCreateProjectForm(false)}
                  className={styles.backButton}
                >
                  ← Voltar
                </button>
              </div>
              <form onSubmit={createProject} className={styles.form}>
                <div className={styles.inputGroup}>
                  <label htmlFor="projectName">Nome do Projeto*</label>
                  <input
                    id="projectName"
                    type="text"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    placeholder="Ex: Projeto Pessoal"
                    required
                    disabled={creatingProject}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="projectDescription">Descrição (opcional)</label>
                  <textarea
                    id="projectDescription"
                    value={newProjectDescription}
                    onChange={(e) => setNewProjectDescription(e.target.value)}
                    placeholder="Detalhes sobre o projeto..."
                    rows={3}
                    disabled={creatingProject}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="projectColor">Cor do Projeto</label>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <input
                      id="projectColor"
                      type="color"
                      value={newProjectColor}
                      onChange={(e) => setNewProjectColor(e.target.value)}
                      disabled={creatingProject}
                      style={{ width: '60px', height: '40px', cursor: 'pointer', border: '2px solid #e0e0e0', borderRadius: '8px' }}
                    />
                    <span style={{ fontSize: '14px', color: '#666' }}>
                      {newProjectColor}
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  className={styles.createButton}
                  disabled={creatingProject || !newProjectName.trim()}
                >
                  {creatingProject ? 'Criando...' : 'Criar Projeto'}
                </button>
              </form>
            </div>
          )}
        </div>
      </Sidebar>
    </div>
  )
}
