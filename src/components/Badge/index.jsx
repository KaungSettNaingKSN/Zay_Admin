import React from 'react'

// Status → color map using dark theme tokens
const STATUS_MAP = {
  processing: { bg: 'rgba(251,191,36,0.12)',  color: '#fbbf24' },
  completed:  { bg: 'rgba(34,197,94,0.12)',   color: '#4ade80' },
  cancelled:  { bg: 'rgba(245,17,17,0.12)',   color: '#f87171' },
  pending:    { bg: 'rgba(251,191,36,0.12)',  color: '#fbbf24' },
  paid:       { bg: 'rgba(34,197,94,0.12)',   color: '#22c55e' },
  shipped:    { bg: 'rgba(99,102,241,0.12)',  color: '#818cf8' },
  delivered:  { bg: 'rgba(34,197,94,0.12)',   color: '#4ade80' },
  refunded:   { bg: 'rgba(107,114,128,0.12)', color: '#9ca3af' },
  active:     { bg: 'rgba(34,197,94,0.12)',   color: '#4ade80' },
  inactive:   { bg: 'rgba(107,114,128,0.12)', color: '#9ca3af' },
}

const Badge = ({ status }) => {
  const key = status?.toLowerCase()
  const { bg, color } = STATUS_MAP[key] || { bg: 'rgba(107,114,128,0.12)', color: '#9ca3af' }
  return (
    <span className='inline-flex items-center gap-1 py-[3px] px-2.5 rounded-full text-[11px] font-[700] capitalize'
      style={{ background: bg, color }}>
      <span className='w-1.5 h-1.5 rounded-full flex-shrink-0' style={{ background: color }} />
      {status}
    </span>
  )
}

export default Badge