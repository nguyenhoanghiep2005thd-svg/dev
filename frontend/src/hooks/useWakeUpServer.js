/**
 * useWakeUpServer — Tự động ping backend khi app khởi động
 * Render free tier ngủ sau 15 phút → hook này đánh thức ngay khi user vào web
 */
import { useEffect, useState } from 'react'
import api from '../services/api'

export function useWakeUpServer() {
  const [isWakingUp, setIsWakingUp] = useState(false)
  const [isReady,    setIsReady]    = useState(false)

  useEffect(() => {
    let cancelled = false

    const ping = async () => {
      // Thử get products — endpoint public, không cần auth
      try {
        await api.get('/products/', { timeout: 5000 })
        if (!cancelled) setIsReady(true)
        return
      } catch {
        // Server chưa thức — bắt đầu wake up
      }

      if (cancelled) return
      setIsWakingUp(true)

      // Thử lại tối đa 6 lần, mỗi 10 giây (tổng 60 giây)
      for (let i = 0; i < 6; i++) {
        if (cancelled) return
        await new Promise(r => setTimeout(r, 10000))
        try {
          await api.get('/products/', { timeout: 15000 })
          if (!cancelled) {
            setIsWakingUp(false)
            setIsReady(true)
          }
          return
        } catch {
          // Tiếp tục chờ
        }
      }

      // Sau 60s vẫn không thức — coi như ready (cho dùng demo mode)
      if (!cancelled) {
        setIsWakingUp(false)
        setIsReady(true)
      }
    }

    ping()
    return () => { cancelled = true }
  }, [])

  return { isWakingUp, isReady }
}
