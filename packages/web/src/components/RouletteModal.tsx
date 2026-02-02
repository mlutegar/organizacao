'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import type { Database } from '@organizacao/shared'
import styles from './RouletteModal.module.css'

type RouletteItem = Database['public']['Tables']['roulette_items']['Row']

interface RouletteModalProps {
  isOpen: boolean
  onClose: () => void
  user_id: string
}

export default function RouletteModal({ isOpen, onClose, user_id }: RouletteModalProps) {
  const supabase = createClient()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [items, setItems] = useState<RouletteItem[]>([])
  const [visibleItems, setVisibleItems] = useState<RouletteItem[]>([])
  const [showHidden, setShowHidden] = useState(false)
  const [isSpinning, setIsSpinning] = useState(false)
  const [selectedItem, setSelectedItem] = useState<RouletteItem | null>(null)
  const [newItemTitle, setNewItemTitle] = useState('')
  const [rotation, setRotation] = useState(0)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)

  // Color palette for wheel segments
  const colorPalette = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
    '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'
  ]

  // Load items from database
  useEffect(() => {
    if (isOpen && user_id) {
      loadItems()
    }
  }, [isOpen, user_id])

  // Filter items based on visibility toggle
  useEffect(() => {
    if (showHidden) {
      setVisibleItems(items)
    } else {
      setVisibleItems(items.filter(item => !item.is_hidden))
    }
  }, [items, showHidden])

  // Draw wheel on canvas
  useEffect(() => {
    if (canvasRef.current && visibleItems.length > 0) {
      drawWheel()
    }
  }, [visibleItems, rotation, selectedItem])

  async function loadItems() {
    setLoading(true)
    const { data, error } = await supabase
      .from('roulette_items')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error loading roulette items:', error)
    } else {
      setItems(data || [])
    }
    setLoading(false)
  }

  async function createItem(e: React.FormEvent) {
    e.preventDefault()
    if (!newItemTitle.trim()) return

    setCreating(true)

    // Assign color cyclically from palette
    const colorIndex = items.length % colorPalette.length

    const { error } = await supabase
      .from('roulette_items')
      .insert({
        title: newItemTitle,
        color: colorPalette[colorIndex],
        user_id,
      })

    if (error) {
      alert('Erro ao criar item: ' + error.message)
    } else {
      setNewItemTitle('')
      loadItems()
    }

    setCreating(false)
  }

  async function deleteItem(itemId: string) {
    if (!confirm('Tem certeza que deseja excluir este item?')) return

    const { error } = await supabase
      .from('roulette_items')
      .delete()
      .eq('id', itemId)

    if (error) {
      alert('Erro ao excluir item: ' + error.message)
    } else {
      loadItems()
    }
  }

  async function toggleHideItem(itemId: string, currentState: boolean) {
    const { error } = await supabase
      .from('roulette_items')
      .update({ is_hidden: !currentState })
      .eq('id', itemId)

    if (error) {
      alert('Erro ao atualizar item: ' + error.message)
    } else {
      loadItems()
    }
  }

  async function resetAllHidden() {
    if (!confirm('Tem certeza que deseja mostrar todos os itens ocultos?')) return

    const { error } = await supabase
      .from('roulette_items')
      .update({ is_hidden: false })
      .eq('user_id', user_id)
      .eq('is_hidden', true)

    if (error) {
      alert('Erro ao resetar itens: ' + error.message)
    } else {
      loadItems()
    }
  }

  function drawWheel() {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = Math.min(centerX, centerY) - 20
    const numSegments = visibleItems.length
    const segmentAngle = (2 * Math.PI) / numSegments

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw each segment
    visibleItems.forEach((item, index) => {
      const startAngle = rotation + index * segmentAngle
      const endAngle = startAngle + segmentAngle

      // Draw segment
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.arc(centerX, centerY, radius, startAngle, endAngle)
      ctx.closePath()

      // Fill with color
      ctx.fillStyle = item.color || colorPalette[index % colorPalette.length]
      ctx.fill()

      // Draw border
      ctx.strokeStyle = '#fff'
      ctx.lineWidth = 2
      ctx.stroke()

      // Draw text
      ctx.save()
      ctx.translate(centerX, centerY)
      ctx.rotate(startAngle + segmentAngle / 2)
      ctx.textAlign = 'right'
      ctx.fillStyle = '#fff'
      ctx.font = 'bold 14px Arial'
      ctx.shadowColor = 'rgba(0,0,0,0.5)'
      ctx.shadowBlur = 4
      ctx.fillText(item.title, radius - 20, 5)
      ctx.restore()
    })

    // Draw center circle
    ctx.beginPath()
    ctx.arc(centerX, centerY, 30, 0, 2 * Math.PI)
    ctx.fillStyle = '#fff'
    ctx.fill()
    ctx.strokeStyle = '#333'
    ctx.lineWidth = 3
    ctx.stroke()

    // Draw pointer
    ctx.beginPath()
    ctx.moveTo(centerX + radius + 10, centerY)
    ctx.lineTo(centerX + radius - 20, centerY - 15)
    ctx.lineTo(centerX + radius - 20, centerY + 15)
    ctx.closePath()
    ctx.fillStyle = '#FF6B6B'
    ctx.fill()
    ctx.strokeStyle = '#333'
    ctx.lineWidth = 2
    ctx.stroke()
  }

  function spin() {
    if (isSpinning || visibleItems.length === 0) return

    setIsSpinning(true)
    setSelectedItem(null)

    // Random number of full rotations (5-10) + random segment
    const numSegments = visibleItems.length
    const segmentAngle = 360 / numSegments
    const randomSegment = Math.floor(Math.random() * numSegments)
    const extraRotations = 360 * (5 + Math.floor(Math.random() * 5))
    const targetAngle = extraRotations + (numSegments - randomSegment - 1) * segmentAngle

    const startRotation = rotation % 360
    const totalRotation = startRotation + targetAngle
    const duration = 5000 // 5 seconds
    const startTime = performance.now()

    function animate(currentTime: number) {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Easing function (ease-out cubic)
      const easeOut = 1 - Math.pow(1 - progress, 3)

      const currentRotation = startRotation + (targetAngle * easeOut)
      setRotation(currentRotation)

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        // Spinning complete
        setIsSpinning(false)
        const finalAngle = currentRotation % 360
        const segmentIndex = Math.floor(((360 - finalAngle) % 360) / segmentAngle)
        setSelectedItem(visibleItems[segmentIndex])
      }
    }

    requestAnimationFrame(animate)
  }

  if (!isOpen) return null

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>🎰 Roleta</h2>
          <button onClick={onClose} className={styles.closeButton}>
            ×
          </button>
        </div>

        <div className={styles.modalBody}>
          {/* Wheel Section */}
          {visibleItems.length > 0 && (
            <div className={styles.wheelSection}>
              <canvas
                ref={canvasRef}
                width={400}
                height={400}
                className={styles.wheelCanvas}
              />
              <button
                onClick={spin}
                disabled={isSpinning}
                className={styles.spinButton}
              >
                {isSpinning ? '🎡 Girando...' : '🎲 Girar!'}
              </button>

              {selectedItem && (
                <div className={styles.resultBanner}>
                  <h3>🎉 Selecionado: {selectedItem.title}</h3>
                  <div className={styles.resultActions}>
                    <button
                      onClick={() => toggleHideItem(selectedItem.id, selectedItem.is_hidden)}
                      className={styles.hideButton}
                    >
                      {selectedItem.is_hidden ? '👁️ Mostrar' : '🙈 Ocultar'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {loading && <div className={styles.loading}>Carregando...</div>}

          {!loading && visibleItems.length === 0 && (
            <div className={styles.emptyState}>
              <p>Nenhum item na roleta.</p>
              <p>Adicione itens abaixo para começar!</p>
            </div>
          )}

          {/* Items Management Section */}
          <div className={styles.itemsSection}>
            <div className={styles.sectionHeader}>
              <h3>Itens ({items.length})</h3>
              <div className={styles.sectionActions}>
                {items.some(item => item.is_hidden) && (
                  <button
                    onClick={resetAllHidden}
                    className={styles.resetButton}
                  >
                    🔄 Resetar Ocultos
                  </button>
                )}
                <button
                  onClick={() => setShowHidden(!showHidden)}
                  className={styles.toggleVisibilityButton}
                >
                  {showHidden ? '👁️ Esconder Ocultos' : '👁️ Mostrar Tudo'}
                </button>
              </div>
            </div>

            {/* Add New Item Form */}
            <form onSubmit={createItem} className={styles.addItemForm}>
              <input
                type="text"
                value={newItemTitle}
                onChange={(e) => setNewItemTitle(e.target.value)}
                placeholder="Novo item..."
                disabled={creating}
                className={styles.itemInput}
              />
              <button
                type="submit"
                disabled={creating || !newItemTitle.trim()}
                className={styles.addButton}
              >
                {creating ? 'Adicionando...' : '+ Adicionar'}
              </button>
            </form>

            {/* Items List */}
            <div className={styles.itemsList}>
              {(showHidden ? items : items.filter(item => !item.is_hidden)).map((item) => (
                <div
                  key={item.id}
                  className={`${styles.itemCard} ${item.is_hidden ? styles.hidden : ''}`}
                >
                  <span
                    className={styles.itemColor}
                    style={{ backgroundColor: item.color || undefined }}
                  />
                  <span className={styles.itemTitle}>{item.title}</span>
                  {item.is_hidden && <span className={styles.hiddenBadge}>Oculto</span>}
                  <div className={styles.itemActions}>
                    <button
                      onClick={() => toggleHideItem(item.id, item.is_hidden)}
                      className={styles.visibilityButton}
                      title={item.is_hidden ? 'Mostrar' : 'Ocultar'}
                    >
                      {item.is_hidden ? '👁️' : '🙈'}
                    </button>
                    <button
                      onClick={() => deleteItem(item.id)}
                      className={styles.deleteButton}
                      title="Excluir"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
