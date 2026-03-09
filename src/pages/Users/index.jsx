import React from 'react'
import Skeleton  from '@mui/material/Skeleton'
import Tooltip   from '@mui/material/Tooltip'
import Checkbox  from '@mui/material/Checkbox'
import {
  MdDeleteSweep, MdSearch, MdClose,
  MdPeople, MdAdminPanelSettings, MdPerson,
} from 'react-icons/md'
import { CiMail }                 from 'react-icons/ci'
import { IoPhonePortraitOutline } from 'react-icons/io5'
import { SlCalender }             from 'react-icons/sl'
import { Mycontext }              from '../../App'
import { fetchData, deleteData, putData } from '../../utils/api'

// ── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  bg:       '#0f1117',   // main background (not pure black)
  surface:  '#161a23',   // sidebar / panels
  card:     '#1f2430',   // cards / containers

  border:   'rgba(255,255,255,0.08)',

  red:      '#f51111',
  redGlow:  'rgba(245,17,17,0.22)',
  redSoft:  'rgba(245,17,17,0.12)',

  text:     '#f5f6fa',   // brighter text
  muted:    '#a1a1aa',   // secondary text
  subtle:   '#6b7280',   // helper text
}

// ── Status pill ───────────────────────────────────────────────────────────────
const StatusPill = ({ status }) => {
  const active = status === 'Active'
  return (
    <span className='inline-flex items-center gap-1.5 text-[11px] font-[700] px-2.5 py-[3px] rounded-full'
      style={{
        background: active ? 'rgba(34,197,94,0.12)' : 'rgba(245,17,17,0.1)',
        color:      active ? '#22c55e'               : '#f87171',
      }}>
      <span className='w-1.5 h-1.5 rounded-full flex-shrink-0'
        style={{ background: active ? '#22c55e' : '#f87171' }} />
      {status || 'Unknown'}
    </span>
  )
}

// ── Role toggle ───────────────────────────────────────────────────────────────
const RoleToggle = ({ role, userId, currentAdminId, onToggle, loading }) => {
  const isAdmin    = role === 'Admin'
  const isSelf     = userId === currentAdminId
  const isChanging = loading === userId

  return (
    <Tooltip
      title={isSelf ? 'Cannot change your own role' : `Click to make ${isAdmin ? 'User' : 'Admin'}`}
      arrow
    >
      <span>
        <button
          disabled={isSelf || isChanging}
          onClick={() => onToggle(userId, isAdmin ? 'User' : 'Admin')}
          className='inline-flex items-center gap-1.5 text-[11px] font-[700] px-2.5 py-[4px] rounded-full border transition-all select-none'
          style={{
            background:  isAdmin ? 'rgba(168,85,247,0.12)'  : 'rgba(99,102,241,0.08)',
            color:       isAdmin ? '#c084fc'                 : C.subtle,
            borderColor: isAdmin ? 'rgba(168,85,247,0.25)'  : C.border,
            cursor:      isSelf || isChanging ? 'not-allowed' : 'pointer',
            opacity:     isSelf ? 0.4 : 1,
          }}
          onMouseEnter={e => { if (!isSelf && !isChanging) e.currentTarget.style.transform = 'scale(1.06)' }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}
        >
          {isChanging
            ? <span className='w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin' />
            : isAdmin ? <MdAdminPanelSettings size={12} /> : <MdPerson size={12} />
          }
          {isAdmin ? 'Admin' : 'User'}
        </button>
      </span>
    </Tooltip>
  )
}

// ── Summary card ──────────────────────────────────────────────────────────────
const StatCard = ({ label, value, accent, icon: Icon }) => (
  <div className='flex-1 min-w-[120px] rounded-2xl p-4 border relative overflow-hidden'
    style={{ background: C.card, borderColor: C.border }}>
    {/* glow blob */}
    <div className='absolute -top-4 -right-4 w-20 h-20 rounded-full blur-2xl opacity-20 pointer-events-none'
      style={{ background: accent }} />
    <div className='w-9 h-9 rounded-xl flex items-center justify-center mb-3'
      style={{ background: `${accent}20` }}>
      <Icon size={17} style={{ color: accent }} />
    </div>
    <p className='text-[24px] font-[900] tracking-tight leading-none' style={{ color: C.text }}>{value}</p>
    <p className='text-[11px] font-[600] uppercase tracking-widest mt-1' style={{ color: C.muted }}>{label}</p>
  </div>
)

// ─────────────────────────────────────────────────────────────────────────────
const Users = () => {
  const context = React.useContext(Mycontext)

  const [users,       setUsers]       = React.useState([])
  const [loading,     setLoading]     = React.useState(false)
  const [roleLoading, setRoleLoading] = React.useState(null)
  const [page,        setPage]        = React.useState(0)
  const [rowsPerPage, setRowsPerPage] = React.useState(10)
  const [totalCount,  setTotalCount]  = React.useState(0)
  const [search,      setSearch]      = React.useState('')
  const [selectedIds, setSelectedIds] = React.useState([])
  const [focused,     setFocused]     = React.useState(false)
  const debounceRef = React.useRef(null)

  const allIds      = users.map(u => u._id)
  const allSelected = allIds.length > 0 && allIds.every(id => selectedIds.includes(id))
  const someSel     = selectedIds.length > 0 && !allSelected

  const adminCount  = users.filter(u => u.role === 'Admin').length
  const activeCount = users.filter(u => u.status === 'Active').length
  const totalPages  = Math.ceil(totalCount / rowsPerPage)
  const skelSx      = { bgcolor: 'rgba(255,255,255,0.06)', borderRadius: 1 }

  // ── Load — UNCHANGED ─────────────────────────────────────────────────────
  const loadUsers = React.useCallback(async (pg, perPage, query = '') => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: pg + 1, limit: perPage })
      if (query) params.set('search', query)
      const res = await fetchData(`/api/user/admin/all?${params.toString()}`)
      setUsers(Array.isArray(res?.data?.data?.users) ? res.data.data.users : [])
      setTotalCount(res?.data?.data?.total ?? 0)
    } catch (e) {
      context?.openAlertBox?.('error', e?.message || 'Failed to load users')
    } finally { setLoading(false) }
  }, [])

  React.useEffect(() => { loadUsers(page, rowsPerPage, search) }, [page, rowsPerPage])

  const handleSearch = (value) => {
    setSearch(value)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => { setPage(0); loadUsers(0, rowsPerPage, value) }, 400)
  }

  const handleSelectAll = e => setSelectedIds(e.target.checked ? allIds : [])
  const handleSelectOne = id =>
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])

  const handleDelete = async (id) => {
    try {
      await deleteData(`/api/user/admin/${id}`)
      context?.openAlertBox?.('success', 'User deleted')
      setSelectedIds(prev => prev.filter(i => i !== id))
      loadUsers(page, rowsPerPage, search)
    } catch (e) { context?.openAlertBox?.('error', e?.message || 'Delete failed') }
  }

  const handleDeleteSelected = async () => {
    if (!selectedIds.length) return
    try {
      await deleteData('/api/user/admin/deleteMultiple', { ids: selectedIds })
      context?.openAlertBox?.('success', `${selectedIds.length} user(s) deleted`)
      setSelectedIds([])
      loadUsers(page, rowsPerPage, search)
    } catch (e) { context?.openAlertBox?.('error', e?.message || 'Bulk delete failed') }
  }

  const handleRoleToggle = async (userId, newRole) => {
    setRoleLoading(userId)
    try {
      await putData(`/api/user/admin/${userId}/role`, { role: newRole })
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: newRole } : u))
      context?.openAlertBox?.('success', `Role changed to ${newRole}`)
    } catch (e) { context?.openAlertBox?.('error', e?.message || 'Failed to update role') }
    finally { setRoleLoading(null) }
  }

  const fmt = d => d
    ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    : '—'

  return (
    <div className='flex flex-col gap-5 pb-8 relative' style={{ minHeight: '100vh', background: C.bg }}>

      {/* ── Background glow ── */}
      <div className='fixed pointer-events-none'
        style={{
          width: '600px', height: '600px', borderRadius: '50%',
          background: `radial-gradient(circle, ${C.redGlow} 0%, transparent 65%)`,
          top: '-200px', right: '-150px', opacity: 0.25, zIndex: 0,
        }} />

      {/* ── Page header ── */}
      <div className='relative z-10 flex items-start justify-between gap-4 flex-wrap'>
        <div>
          <h2 className='text-[22px] font-[900] tracking-tight flex items-center gap-2.5'
            style={{ color: C.text }}>
            <span className='w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0'
              style={{ background: C.redSoft }}>
              <MdPeople size={19} style={{ color: C.red }} />
            </span>
            Users
          </h2>
          <p className='text-[13px] mt-1 ml-[46px]' style={{ color: C.muted }}>
            {loading ? 'Loading…' : `${totalCount.toLocaleString()} total registered users`}
          </p>
        </div>

        {/* Controls */}
        <div className='flex items-center gap-2 flex-wrap'>
          {selectedIds.length > 0 && (
            <button onClick={handleDeleteSelected}
              className='flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-[700] transition-all active:scale-95'
              style={{
                background:  'rgba(245,17,17,0.1)',
                color:       '#f87171',
                border:      '1px solid rgba(245,17,17,0.2)',
              }}>
              <MdDeleteSweep size={16} />
              Delete ({selectedIds.length})
            </button>
          )}

          {/* Search */}
          <div className='relative flex items-center'>
            <MdSearch size={15}
              className='absolute left-3 pointer-events-none z-10 transition-colors'
              style={{ color: focused ? C.red : C.muted }} />
            <input
              type='text' value={search}
              onChange={e => handleSearch(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder='Search name or email…'
              className='h-[40px] pl-9 pr-8 rounded-xl text-[13px] outline-none transition-all'
              style={{
                width:       '240px',
                background:  C.surface,
                border:      `1px solid ${focused ? C.red : C.border}`,
                color:       C.text,
                boxShadow:   focused ? `0 0 0 3px ${C.redSoft}` : 'none',
              }}
            />
            {search && (
              <button onClick={() => handleSearch('')}
                className='absolute right-2.5 w-5 h-5 rounded-full flex items-center justify-center transition-all'
                style={{ color: C.muted, background: 'rgba(255,255,255,0.06)' }}
                onMouseEnter={e => { e.currentTarget.style.background = C.redSoft; e.currentTarget.style.color = C.red }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = C.muted }}>
                <MdClose size={11} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className='relative z-10 flex gap-3 flex-wrap'>
        <StatCard label='Total Users' value={totalCount.toLocaleString()} accent='#3b82f6' icon={MdPeople} />
        <StatCard label='Admins'      value={adminCount}                   accent='#a855f7' icon={MdAdminPanelSettings} />
        <StatCard label='Active'      value={activeCount}                  accent='#22c55e' icon={MdPerson} />
      </div>

      {/* ── Table card ── */}
      <div className='relative z-10 rounded-2xl border overflow-hidden'
        style={{ background: C.card, borderColor: C.border }}>

        <div className='overflow-x-auto'>
          <table className='w-full text-[13px]' style={{ minWidth: '680px' }}>

            {/* Head */}
            <thead>
              <tr style={{ background: C.surface, borderBottom: `1px solid ${C.border}` }}>
                <th className='px-4 py-3 w-10'>
                  <Checkbox
                    checked={allSelected} indeterminate={someSel}
                    onChange={handleSelectAll} size='small'
                    sx={{
                      color: C.muted, p: 0,
                      '&.Mui-checked':           { color: C.red },
                      '&.MuiCheckbox-indeterminate': { color: C.red },
                    }}
                  />
                </th>
                {['User', 'Phone', 'Joined', 'Role', 'Status', ''].map((col, i) => (
                  <th key={i}
                    className='px-4 py-3 text-left text-[11px] font-[700] uppercase tracking-wider whitespace-nowrap'
                    style={{ color: C.muted }}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>

            {/* Body */}
            <tbody>
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                    <td className='px-4 py-3'>
                      <Skeleton variant='rectangular' width={16} height={16} sx={skelSx} />
                    </td>
                    <td className='px-4 py-3'>
                      <div className='flex items-center gap-3'>
                        <Skeleton variant='circular' width={40} height={40} sx={skelSx} />
                        <div className='flex flex-col gap-1.5'>
                          <Skeleton width={120} height={13} sx={skelSx} />
                          <Skeleton width={80}  height={11} sx={skelSx} />
                        </div>
                      </div>
                    </td>
                    {[...Array(5)].map((_, j) => (
                      <td key={j} className='px-4 py-3'>
                        <Skeleton width={70} height={13} sx={skelSx} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className='py-16 text-center'>
                    <div className='flex flex-col items-center gap-3'>
                      <div className='w-14 h-14 rounded-2xl flex items-center justify-center'
                        style={{ background: C.redSoft }}>
                        <MdPeople size={26} style={{ color: C.red }} />
                      </div>
                      <p className='text-[14px] font-[600]' style={{ color: C.text }}>
                        {search ? `No results for "${search}"` : 'No users found'}
                      </p>
                      <p className='text-[12px]' style={{ color: C.muted }}>
                        {search ? 'Try a different search term' : 'Users will appear here once registered'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : users.map(user => (
                <tr key={user._id}
                  style={{ borderBottom: `1px solid ${C.border}` }}
                  onMouseEnter={e => e.currentTarget.style.background = C.hover}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  {/* Checkbox */}
                  <td className='px-4 py-3'>
                    <Checkbox size='small' checked={selectedIds.includes(user._id)}
                      onChange={() => handleSelectOne(user._id)}
                      sx={{ color: C.muted, '&.Mui-checked': { color: C.red }, p: 0 }} />
                  </td>

                  {/* User */}
                  <td className='px-4 py-3'>
                    <div className='flex items-center gap-3' style={{ minWidth: '200px' }}>
                      {/* Avatar */}
                      <div className='w-[40px] h-[40px] rounded-full overflow-hidden flex-shrink-0 border'
                        style={{ borderColor: 'rgba(245,17,17,0.2)', background: C.surface }}>
                        {user.avatar
                          ? <img src={user.avatar} alt={user.name} className='w-full h-full object-cover' />
                          : <div className='w-full h-full flex items-center justify-center font-[800] text-[15px]'
                              style={{ background: C.redSoft, color: C.red }}>
                              {user.name?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                        }
                      </div>
                      <div className='flex-1 min-w-0'>
                        <p className='font-[700] text-[13px] truncate' style={{ color: C.text }}>
                          {user.name || '—'}
                        </p>
                        <span className='flex items-center gap-1 text-[11px] truncate' style={{ color: C.muted }}>
                          <CiMail size={12} />{user.email || '—'}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Phone */}
                  <td className='px-4 py-3 whitespace-nowrap'>
                    <span className='flex items-center gap-1.5 text-[12px]' style={{ color: C.subtle }}>
                      <IoPhonePortraitOutline size={13} style={{ color: C.muted }} />
                      {user.mobile || '—'}
                    </span>
                  </td>

                  {/* Joined */}
                  <td className='px-4 py-3 whitespace-nowrap'>
                    <span className='flex items-center gap-1.5 text-[12px]' style={{ color: C.subtle }}>
                      <SlCalender size={12} style={{ color: C.muted }} />
                      {fmt(user.createdAt)}
                    </span>
                  </td>

                  {/* Role */}
                  <td className='px-4 py-3'>
                    <RoleToggle
                      role={user.role} userId={user._id}
                      currentAdminId={context?.userData?._id}
                      onToggle={handleRoleToggle} loading={roleLoading}
                    />
                  </td>

                  {/* Status */}
                  <td className='px-4 py-3'><StatusPill status={user.status} /></td>

                  {/* Delete */}
                  <td className='px-4 py-3'>
                    <button onClick={() => handleDelete(user._id)}
                      className='w-9 h-9 rounded-xl flex items-center justify-center transition-all'
                      style={{ color: '#f87171', background: 'transparent' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(248,113,113,0.12)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      title='Delete user'>
                      <MdDeleteSweep size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ── */}
        <div className='flex items-center justify-between px-5 py-3 border-t flex-wrap gap-3'
          style={{ borderColor: C.border, background: C.surface }}>

          {/* Rows per page */}
          <div className='flex items-center gap-2'>
            <span className='text-[11px] font-[600] uppercase tracking-wider' style={{ color: C.muted }}>
              Rows
            </span>
            {[10, 25, 50].map(n => (
              <button key={n}
                onClick={() => { setRowsPerPage(n); setPage(0); setSelectedIds([]) }}
                className='w-8 h-7 rounded-lg text-[12px] font-[700] transition-all'
                style={{
                  background:  rowsPerPage === n ? C.red    : C.card,
                  color:       rowsPerPage === n ? '#fff'   : C.muted,
                  border:      `1px solid ${rowsPerPage === n ? C.red : C.border}`,
                }}>
                {n}
              </button>
            ))}
          </div>

          {/* Page controls */}
          <div className='flex items-center gap-1.5'>
            <span className='text-[12px] mr-1' style={{ color: C.muted }}>
              {totalCount === 0 ? '0' : page * rowsPerPage + 1}–{Math.min((page + 1) * rowsPerPage, totalCount)} of {totalCount}
            </span>

            {/* Prev */}
            <button disabled={page === 0}
              onClick={() => { setPage(p => p - 1); setSelectedIds([]) }}
              className='w-8 h-8 rounded-lg flex items-center justify-center text-[14px] font-[700] transition-all disabled:opacity-30'
              style={{ background: C.card, color: C.text, border: `1px solid ${C.border}` }}>
              ‹
            </button>

            {/* Page numbers */}
            {[...Array(Math.min(totalPages, 5))].map((_, i) => {
              const start = Math.max(0, Math.min(page - 2, totalPages - 5))
              const pg    = start + i
              return (
                <button key={pg}
                  onClick={() => { setPage(pg); setSelectedIds([]) }}
                  className='w-8 h-8 rounded-lg flex items-center justify-center text-[12px] font-[700] transition-all'
                  style={{
                    background:  page === pg ? C.red   : C.card,
                    color:       page === pg ? '#fff'  : C.subtle,
                    border:      `1px solid ${page === pg ? C.red : C.border}`,
                    boxShadow:   page === pg ? `0 2px 8px ${C.redGlow}` : 'none',
                  }}>
                  {pg + 1}
                </button>
              )
            })}

            {/* Next */}
            <button disabled={page >= totalPages - 1}
              onClick={() => { setPage(p => p + 1); setSelectedIds([]) }}
              className='w-8 h-8 rounded-lg flex items-center justify-center text-[14px] font-[700] transition-all disabled:opacity-30'
              style={{ background: C.card, color: C.text, border: `1px solid ${C.border}` }}>
              ›
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Users