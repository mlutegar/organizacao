'use client'

import styles from './RouletteButton.module.css'

interface RouletteButtonProps {
  onOpen: () => void
  itemCount: number
}

export default function RouletteButton({ onOpen, itemCount }: RouletteButtonProps) {
  return (
    <button
      onClick={onOpen}
      className={styles.rouletteButton}
      title={`Abrir Roleta (${itemCount} itens)`}
    >
      <span className={styles.rouletteIcon}>🎰</span>
      <span>Roleta</span>
      {itemCount > 0 && (
        <span className={styles.itemCount}>{itemCount}</span>
      )}
    </button>
  )
}
