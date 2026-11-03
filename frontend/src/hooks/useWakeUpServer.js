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
      // /health/ trả về JSON nhỏ, không chạm DB → rẻ nhất cho edge của Render
      try {
        await api.get('/health/', { timeout: 5000 })
        if (!cancelled) setIsReady(true)
        return
      } catch {
        // Server chưa thức — bắt đầu wake up
      }

      if (cancelled) return
      setIsWakingUp(true)

      // Thử lại tối đa 8 lần, mỗi 15 giây (tổng 120 giây).
      // Giãn nhịp so với 10s cũ: Render free tier đặt Cloudflare challenge + HTTP 429
      // khi cùng một host bị poll quá dày, nên ping nhiều là tự khoá API của chính mình.
      for (let i = 0; i < 8; i++) {
        if (cancelled) return
        await new Promise(r => setTimeout(r, 15000))
        try {
          await api.get('/health/', { timeout: 20000 })
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
