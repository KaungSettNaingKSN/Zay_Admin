import React, { useContext, useEffect, useState, useRef, useCallback } from 'react'
import { Mycontext } from '../../App'
import CircularProgress from '@mui/material/CircularProgress'
import { MdZoomOutMap, MdOutlineShoppingBag, MdFilterList, MdClose, MdSearch, MdAdminPanelSettings } from 'react-icons/md'
import { IoCloseSharp } from 'react-icons/io5'
import { FiArrowUp, FiArrowDown } from 'react-icons/fi'
import { fetchData, putData } from '../../utils/api'

// ── Design tokens — identical to ProductDetails ───────────────────────────────
const C = {
  bg:      '#0f1117',
  surface: '#161a23',
  card:    '#1f2430',
  border:  'rgba(255,255,255,0.08)',
  red:     '#f51111',
  redGlow: 'rgba(245,17,17,0.22)',
  redSoft: 'rgba(245,17,17,0.12)',
  text:    '#f5f6fa',
  muted:   '#a1a1aa',
  subtle:  '#6b7280',
}

const STATUSES = ['all', 'pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']

// ── Status styles map ─────────────────────────────────────────────────────────
const STATUS_STYLES = {
  pending:    { bg:'rgba(234,179,8,0.12)',   color:'#facc15', border:'rgba(234,179,8,0.25)'   },
  paid:       { bg:'rgba(16,185,129,0.12)',  color:'#34d399', border:'rgba(16,185,129,0.25)'  },
  processing: { bg:'rgba(59,130,246,0.12)',  color:'#60a5fa', border:'rgba(59,130,246,0.25)'  },
  shipped:    { bg:'rgba(99,102,241,0.12)',  color:'#818cf8', border:'rgba(99,102,241,0.25)'  },
  delivered:  { bg:'rgba(34,197,94,0.12)',   color:'#22c55e', border:'rgba(34,197,94,0.25)'   },
  cancelled:  { bg:'rgba(245,17,17,0.12)',   color:'#f87171', border:'rgba(245,17,17,0.25)'   },
  refunded:   { bg:'rgba(107,114,128,0.12)', color:'#9ca3af', border:'rgba(107,114,128,0.25)' },
}

const StatusBadge = ({ status }) => {
  const s = STATUS_STYLES[status?.toLowerCase()] || { bg:C.card, color:C.muted, border:C.border }
  return (
    <span className='text-[11px] font-[700] px-2.5 py-[3px] rounded-full capitalize tracking-wide'
      style={{ background:s.bg, color:s.color, border:`1px solid ${s.border}` }}>
      {status || 'Unknown'}
    </span>
  )
}

// ── InfoCell — same as ProductDetails ─────────────────────────────────────────
const InfoCell = ({ label, value, accent }) => (
  <div className='rounded-xl p-3 border' style={{ background:C.surface, borderColor:C.border }}>
    <span className='text-[10px] font-[600] uppercase tracking-wider block' style={{ color:C.muted }}>{label}</span>
    <p className='text-[13px] font-[700] mt-0.5 truncate' style={{ color:accent||C.text }}>{value}</p>
  </div>
)

const SectionLabel = ({ children }) => (
  <p className='text-[10px] font-[700] uppercase tracking-widest mb-3' style={{ color:C.muted }}>{children}</p>
)

// ── Order modal ───────────────────────────────────────────────────────────────
const OrderModal = ({ order, onClose, onStatusChange }) => {
  const [status, setStatus] = useState(order.payment_status || 'pending')
  const [saving, setSaving] = useState(false)
  const addr  = order.delivery_address || {}
  const items = order.items            || []
  const user  = order.userId           || {}
  const isCod = order.paymentId        === 'COD'

  const handleSave = async () => {
    setSaving(true)
    try {
      await putData(`/api/order/admin/${order._id}/status`, { payment_status: status })
      onStatusChange(order._id, status); onClose()
    } catch (e) { console.error(e) }
    finally { setSaving(false) }
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4'
      style={{ background:'rgba(0,0,0,0.8)', backdropFilter:'blur(10px)' }}
      onClick={onClose}>
      <div className='w-full max-w-[700px] max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl border'
        style={{ background:C.surface, borderColor:C.border }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className='flex items-center justify-between px-6 py-5 border-b'
          style={{ borderColor:C.border, background:`linear-gradient(to right, ${C.redSoft}, transparent)` }}>
          <div className='flex items-center gap-3'>
            <div className='w-[40px] h-[40px] rounded-xl flex items-center justify-center flex-shrink-0'
              style={{ background:C.redSoft }}>
              <MdOutlineShoppingBag size={20} style={{ color:C.red }} />
            </div>
            <div>
              <h3 className='text-[15px] font-[800] tracking-tight' style={{ color:C.text }}>Order Details</h3>
              <p className='text-[11px] font-mono mt-0.5' style={{ color:C.muted }}>
                #{order.orderId?.slice(0,8).toUpperCase()||'—'}
              </p>
            </div>
          </div>
          <button onClick={onClose}
            className='w-[34px] h-[34px] rounded-xl flex items-center justify-center transition-colors'
            style={{ background:'rgba(255,255,255,0.05)', color:C.subtle }}
            onMouseEnter={e => e.currentTarget.style.color = C.text}
            onMouseLeave={e => e.currentTarget.style.color = C.subtle}>
            <IoCloseSharp size={16} />
          </button>
        </div>

        <div className='p-6 flex flex-col gap-5'>

          {/* Customer — InfoCell grid */}
          <div>
            <SectionLabel>Customer</SectionLabel>
            <div className='grid grid-cols-2 gap-2'>
              <InfoCell label='Name'    value={user.name ||'—'} />
              <InfoCell label='Email'   value={user.email||'—'} />
              <InfoCell label='Date'    value={new Date(order.createdAt).toLocaleDateString('en-US',{year:'numeric',month:'short',day:'numeric'})} />
              <InfoCell label='User ID' value={String(user._id||'—').slice(0,16)+'…'} />
            </div>
          </div>

          {/* Items */}
          <div>
            <SectionLabel>Items ({items.length})</SectionLabel>
            <div className='flex flex-col gap-2'>
              {items.map((item, i) => {
                const d   = item.product_details || {}
                const img = d.image?.[0] || item.productId?.images?.[0] || null
                return (
                  <div key={i} className='flex items-center gap-3 rounded-xl p-3 border'
                    style={{ background:C.card, borderColor:C.border }}>
                    <div className='w-[48px] h-[48px] rounded-xl overflow-hidden flex-shrink-0'
                      style={{ background:'rgba(255,255,255,0.06)' }}>
                      {img && <img src={img} className='w-full h-full object-cover' alt='' />}
                    </div>
                    <div className='flex-1 min-w-0'>
                      <p className='text-[13px] font-[600] truncate' style={{ color:C.text }}>{d.name||'Product'}</p>
                      <div className='flex gap-1 flex-wrap mt-1'>
                        {[d.size,d.productRam,d.productWeight,d.productColor].filter(Boolean).map((tag,t) => (
                          <span key={t} className='text-[10px] font-[600] px-1.5 py-[1px] rounded-full border'
                            style={{ background:C.surface, color:C.muted, borderColor:C.border }}>{tag}</span>
                        ))}
                      </div>
                    </div>
                    <div className='text-right flex-shrink-0'>
                      <p className='text-[11px]' style={{ color:C.subtle }}>×{item.quantity}</p>
                      <p className='text-[13px] font-[800]' style={{ color:C.red }}>${Number(item.sub_total??0).toFixed(2)}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Address + Payment */}
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <div>
              <SectionLabel>Delivery Address</SectionLabel>
              <div className='rounded-2xl border p-4' style={{ background:C.card, borderColor:C.border }}>
                <p className='text-[10px] font-[700] uppercase tracking-wider mb-2' style={{ color:C.muted }}>{addr.address_name||'Home'}</p>
                <p className='text-[13px]' style={{ color:C.text }}>{addr.address_line||'—'}</p>
                <p className='text-[12px] mt-0.5' style={{ color:C.muted }}>{[addr.city,addr.state].filter(Boolean).join(', ')}</p>
                <p className='text-[12px]' style={{ color:C.muted }}>{addr.country}{addr.pincode?` — ${addr.pincode}`:''}</p>
                {addr.mobile && <p className='text-[11px] mt-2' style={{ color:C.subtle }}>📞 {addr.mobile}</p>}
              </div>
            </div>
            <div>
              <SectionLabel>Payment</SectionLabel>
              <div className='rounded-2xl border p-4' style={{ background:C.card, borderColor:C.border }}>
                <div className='flex justify-between items-center mb-3'>
                  <span className='text-[12px]' style={{ color:C.muted }}>Method</span>
                  <span className='text-[11px] font-[700] px-2.5 py-[3px] rounded-full'
                    style={isCod
                      ? { background:'rgba(245,158,11,0.12)', color:'#fbbf24', border:'1px solid rgba(245,158,11,0.25)' }
                      : { background:'rgba(59,130,246,0.12)',  color:'#60a5fa', border:'1px solid rgba(59,130,246,0.25)'  }}>
                    {isCod ? 'Cash on Delivery' : 'Card'}
                  </span>
                </div>
                <div className='flex justify-between mb-2'>
                  <span className='text-[12px]' style={{ color:C.muted }}>Subtotal</span>
                  <span className='text-[13px] font-[600]' style={{ color:C.text }}>${Number(order.sub_total_amount??0).toFixed(2)}</span>
                </div>
                <div className='flex justify-between pt-2 border-t' style={{ borderColor:C.border }}>
                  <span className='text-[12px] font-[700]' style={{ color:C.muted }}>Total</span>
                  <span className='text-[16px] font-[900]' style={{ color:C.red }}>${Number(order.total_amount??0).toFixed(2)}</span>
                </div>
                {!isCod && order.paymentId && (
                  <p className='text-[10px] mt-2 break-all font-mono' style={{ color:C.subtle }}>{order.paymentId}</p>
                )}
              </div>
            </div>
          </div>

          {/* Status update */}
          <div>
            <SectionLabel>Update Status</SectionLabel>
            <div className='flex gap-3'>
              <select value={status} onChange={e => setStatus(e.target.value)}
                className='flex-1 h-[44px] px-4 rounded-xl text-[13px] font-[500] capitalize outline-none cursor-pointer'
                style={{ background:C.card, border:`1px solid ${C.border}`, color:C.text }}>
                {STATUSES.filter(s => s !== 'all').map(s => (
                  <option key={s} value={s} style={{ background:C.surface }}>{s}</option>
                ))}
              </select>
              <button onClick={handleSave}
                disabled={saving || status === order.payment_status}
                className='h-[44px] px-6 rounded-xl text-[13px] font-[800] text-white flex items-center gap-2
                  disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 active:scale-[0.97]'
                style={{
                  background: saving || status === order.payment_status ? '#374151' : `linear-gradient(135deg,#ff4444,${C.red})`,
                  boxShadow:  saving || status === order.payment_status ? 'none' : `0 4px 14px ${C.redGlow}`,
                }}>
                {saving ? <CircularProgress size={15} color='inherit' /> : 'Save'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
const AdminOrders = () => {
  const context = useContext(Mycontext)

  const [orders,        setOrders]        = useState([])
  const [loading,       setLoading]       = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [page,          setPage]          = useState(1)
  const [totalPages,    setTotalPages]    = useState(1)
  const [total,         setTotal]         = useState(0)

  const [search,       setSearch]       = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFrom,     setDateFrom]     = useState('')
  const [dateTo,       setDateTo]       = useState('')
  const [sortBy,       setSortBy]       = useState('createdAt')
  const [sortOrder,    setSortOrder]    = useState('desc')

  const searchRef     = useRef('');    const statusRef    = useRef('all')
  const dateFromRef   = useRef('');    const dateToRef    = useRef('')
  const sortByRef     = useRef('createdAt'); const sortOrderRef = useRef('desc')
  const debounceTimer = useRef(null)
  const LIMIT = 15

  useEffect(() => { searchRef.current    = search      }, [search])
  useEffect(() => { statusRef.current    = statusFilter }, [statusFilter])
  useEffect(() => { dateFromRef.current  = dateFrom    }, [dateFrom])
  useEffect(() => { dateToRef.current    = dateTo      }, [dateTo])
  useEffect(() => { sortByRef.current    = sortBy      }, [sortBy])
  useEffect(() => { sortOrderRef.current = sortOrder   }, [sortOrder])

  const buildQuery = (p, s, status, from, to, sb, so) => {
    const params = new URLSearchParams()
    params.set('page', p); params.set('limit', LIMIT)
    if (s)                          params.set('search',         s)
    if (status && status !== 'all') params.set('payment_status', status)
    if (from)                       params.set('date_from',      from)
    if (to)                         params.set('date_to',        to)
    if (sb)                         params.set('sort_by',        sb)
    if (so)                         params.set('sort_order',     so)
    return params.toString()
  }

  const load = useCallback(async (p, s, status, from, to, sb, so) => {
    setLoading(true)
    try {
      const res = await fetchData(`/api/order/admin/all?${buildQuery(p, s, status, from, to, sb, so)}`)
      setOrders(Array.isArray(res?.data?.data) ? res.data.data : [])
      setTotalPages(res?.data?.totalPages ?? 1)
      setTotal(res?.data?.total ?? 0)
    } catch { context?.openAlertBox?.('error', 'Failed to load orders') }
    finally { setLoading(false) }
  }, []) // eslint-disable-line

  useEffect(() => { load(1, '', 'all', '', '', 'createdAt', 'desc') }, []) // eslint-disable-line

  const handleSearchChange = value => {
    setSearch(value); searchRef.current = value
    clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => {
      setPage(1)
      load(1, value, statusRef.current, dateFromRef.current, dateToRef.current, sortByRef.current, sortOrderRef.current)
    }, 400)
  }

  const applyFilters = useCallback((newPage = 1, overrides = {}) => {
    const s      = 'search'       in overrides ? overrides.search       : searchRef.current
    const status = 'statusFilter' in overrides ? overrides.statusFilter : statusRef.current
    const from   = 'dateFrom'     in overrides ? overrides.dateFrom     : dateFromRef.current
    const to     = 'dateTo'       in overrides ? overrides.dateTo       : dateToRef.current
    const sb     = 'sortBy'       in overrides ? overrides.sortBy       : sortByRef.current
    const so     = 'sortOrder'    in overrides ? overrides.sortOrder    : sortOrderRef.current
    setPage(newPage); load(newPage, s, status, from, to, sb, so)
  }, [load])

  const clearFilters = () => {
    setSearch('');          searchRef.current    = ''
    setStatusFilter('all'); statusRef.current    = 'all'
    setDateFrom('');        dateFromRef.current  = ''
    setDateTo('');          dateToRef.current    = ''
    setSortBy('createdAt'); sortByRef.current    = 'createdAt'
    setSortOrder('desc');   sortOrderRef.current = 'desc'
    setPage(1); load(1, '', 'all', '', '', 'createdAt', 'desc')
  }

  const hasActiveFilters = search || statusFilter !== 'all' || dateFrom || dateTo

  const toggleSort = field => {
    const newOrder = sortByRef.current === field && sortOrderRef.current === 'desc' ? 'asc' : 'desc'
    setSortBy(field); setSortOrder(newOrder)
    sortByRef.current = field; sortOrderRef.current = newOrder
    setPage(1); load(1, searchRef.current, statusRef.current, dateFromRef.current, dateToRef.current, field, newOrder)
  }

  const handleStatusChange = (orderId, newStatus) => {
    setOrders(prev => prev.map(o => o._id === orderId ? { ...o, payment_status: newStatus } : o))
    setSelectedOrder(prev => prev && prev._id === orderId ? { ...prev, payment_status: newStatus } : prev)
  }

  const fmt = d => d ? new Date(d).toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' }) : '—'

  const SortIcon = ({ field }) => {
    if (sortBy !== field) return <span className='ml-1' style={{ color:C.subtle, fontSize:10 }}>↕</span>
    return sortOrder === 'desc'
      ? <FiArrowDown size={10} className='inline ml-1' style={{ color:C.red }} />
      : <FiArrowUp   size={10} className='inline ml-1' style={{ color:C.red }} />
  }

  const iStyle = { background:C.card, border:`1px solid ${C.border}`, color:C.text }
  const iCls   = 'h-[38px] px-3 rounded-xl text-[13px] outline-none transition-all duration-200 placeholder-[#6b7280]'

  const filterChips = [
    search         && { label:`Search: "${search}"`,  bg:'rgba(245,17,17,0.1)',   color:'#f87171', border:'rgba(245,17,17,0.25)',   clear:() => handleSearchChange('') },
    statusFilter !== 'all' && { label:`Status: ${statusFilter}`, bg:'rgba(59,130,246,0.1)', color:'#60a5fa', border:'rgba(59,130,246,0.25)', clear:() => { setStatusFilter('all'); statusRef.current='all'; applyFilters(1,{statusFilter:'all'}) } },
    dateFrom       && { label:`From: ${dateFrom}`, bg:'rgba(245,158,11,0.1)', color:'#fbbf24', border:'rgba(245,158,11,0.25)', clear:() => { setDateFrom(''); dateFromRef.current=''; applyFilters(1,{dateFrom:''}) } },
    dateTo         && { label:`To: ${dateTo}`,     bg:'rgba(245,158,11,0.1)', color:'#fbbf24', border:'rgba(245,158,11,0.25)', clear:() => { setDateTo('');   dateToRef.current='';   applyFilters(1,{dateTo:''})   } },
  ].filter(Boolean)

  return (
    <>
      <div className='min-h-screen p-5' style={{ background:C.bg }}>

        {/* Ambient glow — same as ProductDetails */}
        <div className='fixed pointer-events-none' style={{
          width:'500px', height:'500px', borderRadius:'50%',
          background:`radial-gradient(circle, ${C.redGlow} 0%, transparent 70%)`,
          top:'-150px', right:'-100px', opacity:0.18, zIndex:0,
        }} />

        <div className='relative z-10'>
          <div className='rounded-3xl overflow-hidden border shadow-2xl' style={{ background:C.surface, borderColor:C.border }}>

            {/* ── Header ── */}
            <div className='flex items-center justify-between px-6 py-5 border-b'
              style={{ borderColor:C.border, background:`linear-gradient(to right, ${C.redSoft}, transparent)` }}>
              <div className='flex items-center gap-3'>
                <div className='w-[44px] h-[44px] rounded-2xl flex items-center justify-center flex-shrink-0'
                  style={{ background:C.redSoft }}>
                  <MdOutlineShoppingBag size={22} style={{ color:C.red }} />
                </div>
                <div>
                  <h2 className='text-[18px] font-[900] tracking-tight' style={{ color:C.text }}>Orders</h2>
                  {!loading && <p className='text-[11px] mt-0.5' style={{ color:C.muted }}>{total} total orders</p>}
                </div>
              </div>
              <div className='flex items-center gap-1.5 text-[11px]' style={{ color:C.subtle }}>
                <MdAdminPanelSettings size={13} />
                <span className='hidden sm:inline'>All actions logged</span>
              </div>
            </div>

            {/* ── Filter bar ── */}
            <div className='px-5 py-4 border-b flex flex-wrap gap-3 items-end'
              style={{ borderColor:C.border, background:'rgba(255,255,255,0.015)' }}>

              <div className='flex flex-col gap-1.5 flex-1 min-w-[180px]'>
                <label className='text-[10px] font-[700] uppercase tracking-widest' style={{ color:C.muted }}>Search</label>
                <div className='relative'>
                  <MdSearch size={15} className='absolute left-3 top-1/2 -translate-y-1/2' style={{ color:C.subtle }} />
                  <input type='text' value={search} onChange={e => handleSearchChange(e.target.value)}
                    placeholder='Order ID, name or email…' className={`${iCls} w-full pl-9 pr-8`} style={iStyle} />
                  {search && (
                    <button onClick={() => handleSearchChange('')}
                      className='absolute right-2.5 top-1/2 -translate-y-1/2 transition-colors'
                      style={{ color:C.subtle }}
                      onMouseEnter={e => e.currentTarget.style.color = C.text}
                      onMouseLeave={e => e.currentTarget.style.color = C.subtle}>
                      <MdClose size={13} />
                    </button>
                  )}
                </div>
              </div>

              <div className='flex flex-col gap-1.5'>
                <label className='text-[10px] font-[700] uppercase tracking-widest' style={{ color:C.muted }}>Status</label>
                <select value={statusFilter}
                  onChange={e => { const v=e.target.value; setStatusFilter(v); statusRef.current=v; applyFilters(1,{statusFilter:v}) }}
                  className={`${iCls} w-[150px] cursor-pointer capitalize`} style={iStyle}>
                  {STATUSES.map(s => <option key={s} value={s} style={{ background:C.surface }}>{s==='all'?'All Statuses':s}</option>)}
                </select>
              </div>

              {[
                { label:'From Date', val:dateFrom, max:dateTo||undefined,   cb:v => { setDateFrom(v); dateFromRef.current=v } },
                { label:'To Date',   val:dateTo,   min:dateFrom||undefined,  cb:v => { setDateTo(v);   dateToRef.current=v   } },
              ].map(f => (
                <div key={f.label} className='flex flex-col gap-1.5'>
                  <label className='text-[10px] font-[700] uppercase tracking-widest' style={{ color:C.muted }}>{f.label}</label>
                  <input type='date' value={f.val} min={f.min} max={f.max}
                    onChange={e => f.cb(e.target.value)}
                    className={`${iCls} w-[148px] cursor-pointer`} style={iStyle} />
                </div>
              ))}

              <div className='flex gap-2 items-end'>
                <button onClick={() => applyFilters(1)}
                  className='h-[38px] px-4 rounded-xl text-[13px] font-[700] text-white flex items-center gap-1.5 transition-all duration-200 active:scale-[0.97]'
                  style={{ background:`linear-gradient(135deg,#ff4444,${C.red})`, boxShadow:`0 4px 14px ${C.redGlow}` }}>
                  <MdFilterList size={15} /> Apply
                </button>
                {hasActiveFilters && (
                  <button onClick={clearFilters}
                    className='h-[38px] px-3 rounded-xl text-[13px] flex items-center gap-1 transition-colors'
                    style={{ background:'rgba(255,255,255,0.05)', border:`1px solid ${C.border}`, color:C.muted }}
                    onMouseEnter={e => e.currentTarget.style.color = C.text}
                    onMouseLeave={e => e.currentTarget.style.color = C.muted}>
                    <MdClose size={13} /> Clear
                  </button>
                )}
              </div>
            </div>

            {/* Filter chips */}
            {filterChips.length > 0 && (
              <div className='px-5 py-2.5 flex gap-2 flex-wrap border-b' style={{ borderColor:C.border }}>
                {filterChips.map((chip, i) => (
                  <span key={i} className='flex items-center gap-1.5 text-[11px] font-[600] px-2.5 py-1 rounded-full capitalize'
                    style={{ background:chip.bg, color:chip.color, border:`1px solid ${chip.border}` }}>
                    {chip.label}
                    <MdClose size={11} className='cursor-pointer' onClick={chip.clear} />
                  </span>
                ))}
              </div>
            )}

            {/* ── Table ── */}
            <div className='overflow-x-auto'>
              <table className='w-full text-left text-[13px]'>
                <thead>
                  <tr style={{ background:'rgba(255,255,255,0.025)', borderBottom:`1px solid ${C.border}` }}>
                    <th className='px-4 py-3 w-[44px]' />
                    {[
                      {label:'Order ID'},{label:'Customer'},{label:'Phone'},{label:'Address'},{label:'Items'},
                      {label:'Total',sort:'total_amount'},{label:'Date',sort:'createdAt'},
                      {label:'Method'},{label:'Status'},
                    ].map(col => (
                      <th key={col.label}
                        className={`px-4 py-3 text-[10px] font-[700] uppercase tracking-widest whitespace-nowrap transition-colors ${col.sort?'cursor-pointer select-none':''}`}
                        style={{ color:C.muted }}
                        onClick={col.sort ? () => toggleSort(col.sort) : undefined}
                        onMouseEnter={col.sort ? e => e.currentTarget.style.color = C.red   : undefined}
                        onMouseLeave={col.sort ? e => e.currentTarget.style.color = C.muted : undefined}>
                        {col.label}{col.sort && <SortIcon field={col.sort} />}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    [...Array(6)].map((_,i) => (
                      <tr key={i} style={{ borderBottom:`1px solid ${C.border}` }}>
                        {[...Array(10)].map((_,j) => (
                          <td key={j} className='px-4 py-3.5'>
                            <div className='h-[10px] rounded-full animate-pulse'
                              style={{ background:'rgba(255,255,255,0.06)', width:`${45+Math.random()*35}%` }} />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : orders.length === 0 ? (
                    <tr>
                      <td colSpan={10} className='text-center py-16'>
                        <div className='w-[56px] h-[56px] rounded-2xl flex items-center justify-center mx-auto mb-3'
                          style={{ background:C.card }}>
                          <MdOutlineShoppingBag size={28} style={{ color:C.subtle }} />
                        </div>
                        <p className='text-[13px]' style={{ color:C.muted }}>No orders found</p>
                        {hasActiveFilters && (
                          <button onClick={clearFilters} className='mt-2 text-[12px] font-[700] hover:underline'
                            style={{ color:C.red }}>Clear filters</button>
                        )}
                      </td>
                    </tr>
                  ) : orders.map((order, i) => {
                    const addr  = order.delivery_address || {}
                    const user  = order.userId           || {}
                    const items = order.items            || []
                    const isCod = order.paymentId        === 'COD'
                    const imgs  = items.slice(0,3).map(it => it.product_details?.image?.[0] || it.productId?.images?.[0] || null)

                    return (
                      <tr key={order._id||i} className='transition-colors'
                        style={{ borderBottom:`1px solid ${C.border}` }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>

                        <td className='px-3 py-2.5'>
                          <button onClick={() => setSelectedOrder(order)}
                            className='w-[34px] h-[34px] rounded-xl flex items-center justify-center transition-all duration-200'
                            style={{ background:'rgba(255,255,255,0.04)', color:C.subtle }}
                            onMouseEnter={e => { e.currentTarget.style.color=C.red; e.currentTarget.style.background=C.redSoft }}
                            onMouseLeave={e => { e.currentTarget.style.color=C.subtle; e.currentTarget.style.background='rgba(255,255,255,0.04)' }}>
                            <MdZoomOutMap size={15} />
                          </button>
                        </td>

                        <td className='px-4 py-2.5'>
                          <span className='font-mono text-[11px] font-[600]' style={{ color:C.muted }}>
                            #{order.orderId?.slice(0,8).toUpperCase()||'—'}
                          </span>
                        </td>

                        <td className='px-4 py-2.5 whitespace-nowrap'>
                          <p className='font-[600] text-[13px]' style={{ color:C.text }}>{user.name||'—'}</p>
                          <p className='text-[11px]' style={{ color:C.subtle }}>{user.email||''}</p>
                        </td>

                        <td className='px-4 py-2.5 whitespace-nowrap text-[12px]' style={{ color:C.subtle }}>
                          {addr.mobile||'—'}
                        </td>

                        <td className='px-4 py-2.5 text-[12px] max-w-[140px] truncate' style={{ color:C.subtle }}>
                          {addr.address_line ? `${addr.address_line}, ${addr.city||''}` : '—'}
                        </td>

                        <td className='px-4 py-2.5'>
                          <div className='flex items-center gap-2'>
                            <div className='flex -space-x-1.5'>
                              {imgs.map((img,idx) => (
                                <div key={idx} className='w-[24px] h-[24px] rounded-full overflow-hidden flex-shrink-0'
                                  style={{ background:'rgba(255,255,255,0.08)', border:`2px solid ${C.surface}` }}>
                                  {img && <img src={img} className='w-full h-full object-cover' alt='' />}
                                </div>
                              ))}
                            </div>
                            <span className='text-[12px]' style={{ color:C.subtle }}>{items.length}</span>
                          </div>
                        </td>

                        <td className='px-4 py-2.5 font-[800] whitespace-nowrap' style={{ color:C.text }}>
                          ${Number(order.total_amount??0).toFixed(2)}
                        </td>

                        <td className='px-4 py-2.5 text-[12px] whitespace-nowrap' style={{ color:C.subtle }}>
                          {fmt(order.createdAt)}
                        </td>

                        <td className='px-4 py-2.5'>
                          <span className='text-[11px] font-[700] px-2 py-[2px] rounded-full'
                            style={isCod
                              ? { background:'rgba(245,158,11,0.12)', color:'#fbbf24', border:'1px solid rgba(245,158,11,0.25)' }
                              : { background:'rgba(59,130,246,0.12)',  color:'#60a5fa', border:'1px solid rgba(59,130,246,0.25)'  }}>
                            {isCod ? 'COD' : 'Card'}
                          </span>
                        </td>

                        <td className='px-4 py-2.5'>
                          <StatusBadge status={order.payment_status} />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* ── Pagination ── */}
            {totalPages > 1 && (
              <div className='flex items-center justify-between px-6 py-4 border-t' style={{ borderColor:C.border }}>
                <p className='text-[12px]' style={{ color:C.subtle }}>
                  Page <span className='font-[600]' style={{ color:C.text }}>{page}</span>
                  {' '}of{' '}
                  <span className='font-[600]' style={{ color:C.text }}>{totalPages}</span>
                  <span className='ml-1'>· {total} orders</span>
                </p>
                <div className='flex gap-2'>
                  {[
                    { label:'← Prev', disabled:page<=1,         action:() => { const p=page-1; setPage(p); load(p,searchRef.current,statusRef.current,dateFromRef.current,dateToRef.current,sortByRef.current,sortOrderRef.current) } },
                    { label:'Next →', disabled:page>=totalPages, action:() => { const p=page+1; setPage(p); load(p,searchRef.current,statusRef.current,dateFromRef.current,dateToRef.current,sortByRef.current,sortOrderRef.current) } },
                  ].map(btn => (
                    <button key={btn.label} disabled={btn.disabled} onClick={btn.action}
                      className='px-4 py-1.5 rounded-xl text-[12px] font-[700] transition-all disabled:opacity-30 disabled:cursor-not-allowed'
                      style={{ background:'rgba(255,255,255,0.05)', border:`1px solid ${C.border}`, color:C.muted }}
                      onMouseEnter={e => { if(!btn.disabled) e.currentTarget.style.color=C.text }}
                      onMouseLeave={e => { e.currentTarget.style.color=C.muted }}>
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {selectedOrder && (
        <OrderModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </>
  )
}

export default AdminOrders