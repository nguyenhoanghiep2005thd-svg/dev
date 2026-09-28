import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

export default function SectionHeader({ title, subtitle, viewAllTo, accentColor = 'bg-primary-600' }) {
  return (
    <div className="flex items-end justify-between mb-6">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className={`w-1 h-6 ${accentColor} rounded-full`} />
          <h2 className="section-title">{title}</h2>
        </div>
        {subtitle && <p className="text-gray-500 text-sm ml-4">{subtitle}</p>}
      </div>
      {viewAllTo && (
        <Link
          to={viewAllTo}
          className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors group"
        >
          Xem tất cả
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      )}
    </div>
  )
}
