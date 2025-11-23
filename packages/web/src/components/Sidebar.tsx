'use client'

import { ReactNode } from 'react'
import styles from './Sidebar.module.css'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
}

export default function Sidebar({ isOpen, onClose, children }: SidebarProps) {
  return (
    <>
      {/* Sidebar */}
      <div className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
        <div className={styles.header}>
          <h2>Menu</h2>
          <button onClick={onClose} className={styles.closeButton}>
            ×
          </button>
        </div>
        <div className={styles.content}>
          {children}
        </div>
      </div>
    </>
  )
}
