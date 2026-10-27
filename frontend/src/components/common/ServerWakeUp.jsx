import { useWakeUpServer } from '../../hooks/useWakeUpServer'

/**
 * Hiển thị banner nhỏ ở bottom khi backend đang wake up.
 * Đặt trong Layout để hiện trên mọi trang.
 */
export default function ServerWakeUp() {
  const { isWakingUp } = useWakeUpServer()

  if (!isWakingUp) return null

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
      <div className="flex items-center gap-3 bg-gray-900 text-white text-sm
                      px-5 py-3 rounded-full shadow-2xl">
        {/* Spinner */}
        <svg className="animate-spin w-4 h-4 text-primary-400 flex-shrink-0"
             viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10"
                  stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
        <span>
          Server đang khởi động, vui lòng chờ ~30 giây...
        </span>
      </div>
    </div>
  )
}
