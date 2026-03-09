import React from 'react'
import { FaUsers } from 'react-icons/fa'
import { LuBaggageClaim } from 'react-icons/lu'
import { HiMiniSquare3Stack3D } from 'react-icons/hi2'
import { MdCategory } from 'react-icons/md'
import { MdTrendingUp } from 'react-icons/md'

const BOXES = [
  { label: 'Users',      value: '1,024',  icon: FaUsers,                accent: '#a855f7' },
  { label: 'Orders',     value: '25,300', icon: LuBaggageClaim,         accent: '#22c55e' },
  { label: 'Products',   value: '512',    icon: HiMiniSquare3Stack3D,   accent: '#3b82f6' },
  { label: 'Categories', value: '8,764',  icon: MdCategory,             accent: '#f51111' },
]

const DashboardBoxes = () => (
  <div className='grid grid-cols-2 sm:grid-cols-4 gap-3'>
    {BOXES.map(({ label, value, icon: Icon, accent }) => (
      <div key={label} className='rounded-2xl p-4 border relative overflow-hidden'
        style={{ background: '#16161f', borderColor: 'rgba(255,255,255,0.07)' }}>
        {/* Glow */}
        <div className='absolute -top-4 -right-4 w-20 h-20 rounded-full blur-2xl opacity-25 pointer-events-none'
          style={{ background: accent }} />
        {/* Icon */}
        <div className='w-9 h-9 rounded-xl flex items-center justify-center mb-3'
          style={{ background: `${accent}20` }}>
          <Icon size={18} style={{ color: accent }} />
        </div>
        {/* Trend */}
        <div className='flex items-center gap-1 mb-1'>
          <MdTrendingUp size={12} style={{ color: accent }} />
          <span className='text-[10px] font-[600]' style={{ color: accent }}>+12%</span>
        </div>
        <p className='text-[23px] font-[800] tracking-tight leading-none' style={{ color: '#f0f0f5' }}>{value}</p>
        <p className='text-[11px] font-[600] uppercase tracking-widest mt-1' style={{ color: '#6b7280' }}>{label}</p>
      </div>
    ))}
  </div>
)

export default DashboardBoxes