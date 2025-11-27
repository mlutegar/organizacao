'use client'

import { useState, useEffect, useRef } from 'react'
import styles from './Timer.module.css'

export default function Timer() {
  const [selectedMinutes, setSelectedMinutes] = useState(5)
  const [timeLeft, setTimeLeft] = useState(0) // em segundos
  const [isRunning, setIsRunning] = useState(false)
  const [showNotification, setShowNotification] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false)
            setShowNotification(true)
            // Auto-hide notification after 5 seconds
            setTimeout(() => setShowNotification(false), 5000)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, timeLeft])

  const handleStart = () => {
    if (timeLeft === 0) {
      setTimeLeft(selectedMinutes * 60)
    }
    setIsRunning(true)
    setShowNotification(false)
  }

  const handlePause = () => {
    setIsRunning(false)
  }

  const handleReset = () => {
    setIsRunning(false)
    setTimeLeft(0)
    setShowNotification(false)
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getProgress = (): number => {
    if (selectedMinutes === 0) return 0
    return ((selectedMinutes * 60 - timeLeft) / (selectedMinutes * 60)) * 100
  }

  return (
    <div className={styles.timerContainer}>
      {showNotification && (
        <div className={styles.notification}>
          ⏰ Tempo esgotado!
        </div>
      )}

      <h3 className={styles.timerTitle}>Timer</h3>

      <div className={styles.timerDisplay}>
        <div className={styles.timeText}>
          {timeLeft > 0 ? formatTime(timeLeft) : formatTime(selectedMinutes * 60)}
        </div>
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{ width: `${getProgress()}%` }}
          />
        </div>
      </div>

      <div className={styles.minuteSelector}>
        <label htmlFor="minutes">Duração (minutos)</label>
        <select
          id="minutes"
          value={selectedMinutes}
          onChange={(e) => {
            const newValue = Number(e.target.value)
            setSelectedMinutes(newValue)
            if (timeLeft === 0) {
              setTimeLeft(newValue * 60)
            }
          }}
          disabled={isRunning}
          className={styles.select}
        >
          {Array.from({ length: 15 }, (_, i) => i + 1).map((num) => (
            <option key={num} value={num}>
              {num} {num === 1 ? 'minuto' : 'minutos'}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.controls}>
        {!isRunning ? (
          <button onClick={handleStart} className={styles.startButton}>
            ▶ Iniciar
          </button>
        ) : (
          <button onClick={handlePause} className={styles.pauseButton}>
            ⏸ Pausar
          </button>
        )}
        <button onClick={handleReset} className={styles.resetButton}>
          ⏹ Resetar
        </button>
      </div>
    </div>
  )
}
