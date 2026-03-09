import React from 'react'
import {
  ResponsiveContainer, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Checkbox from '@mui/material/Checkbox'
import Skeleton from '@mui/material/Skeleton'
import Rating from '@mui/material/Rating'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import 'react-lazy-load-image-component/src/effects/blur.css'
import { FaPlusCircle } from 'react-icons/fa'
import { MdZoomOutMap, MdDeleteSweep, MdTrendingUp, MdShoppingCart, MdPeople, MdPendingActions } from 'react-icons/md'
import { AiTwotoneEdit } from 'react-icons/ai'
import { LuView } from 'react-icons/lu'
import { IoCloseSharp } from 'react-icons/io5'
import { Link } from 'react-router-dom'
import { Mycontext } from '../../App'
import SearchBox from '../../components/SearchBox'
import { fetchData, deleteData } from '../../utils/api'

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

// ── Shared card wrapper ────────────────────────────────────────────────────────
const Card = ({ children, className = '' }) => (
  <div
    className={`rounded-2xl border ${className}`}
    style={{ background: C.card, borderColor: C.border }}
  >
    {children}
  </div>
)

// ── Section title ──────────────────────────────────────────────────────────────
const SectionTitle = ({ children, sub }) => (
  <div className='mb-1'>
    <h2 style={{ color: C.text }} className='text-[17px] font-[700] tracking-tight'>{children}</h2>
    {sub && <p style={{ color: C.muted }} className='text-[12px] mt-0.5'>{sub}</p>}
  </div>
)

// ── Status pill ────────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    pending:    { bg: 'rgba(251,191,36,0.12)', color: '#fbbf24' },
    paid:       { bg: 'rgba(34,197,94,0.12)',  color: '#22c55e' },
    processing: { bg: 'rgba(59,130,246,0.12)', color: '#60a5fa' },
    shipped:    { bg: 'rgba(99,102,241,0.12)', color: '#818cf8' },
    delivered:  { bg: 'rgba(34,197,94,0.12)',  color: '#4ade80' },
    cancelled:  { bg: 'rgba(245,17,17,0.12)',  color: '#f87171' },
    refunded:   { bg: 'rgba(107,114,128,0.12)',color: '#9ca3af' },
  }
  const s = map[status?.toLowerCase()] || { bg: 'rgba(107,114,128,0.12)', color: '#9ca3af' }
  return (
    <span className='text-[11px] font-[700] px-2.5 py-[3px] rounded-full capitalize'
      style={{ background: s.bg, color: s.color }}>
      {status || 'Unknown'}
    </span>
  )
}

// ── Summary card ──────────────────────────────────────────────────────────────
const SummaryCard = ({ label, value, icon: Icon, accent, loading }) => (
  <div className='flex-1 min-w-[150px] rounded-2xl p-4 border relative overflow-hidden'
    style={{ background: C.card, borderColor: C.border }}>
    {/* Glow blob */}
    <div className='absolute -top-4 -right-4 w-20 h-20 rounded-full blur-2xl opacity-30 pointer-events-none'
      style={{ background: accent }} />
    <div className='flex items-start justify-between mb-3'>
      <div className='w-9 h-9 rounded-xl flex items-center justify-center'
        style={{ background: `${accent}22` }}>
        <Icon size={18} style={{ color: accent }} />
      </div>
    </div>
    <p className='text-[11px] font-[600] uppercase tracking-widest mb-1' style={{ color: C.muted }}>{label}</p>
    {loading
      ? <Skeleton width={80} height={26} sx={{ bgcolor: '#ffffff10' }} />
      : <p className='text-[24px] font-[800] tracking-tight' style={{ color: C.text }}>{value}</p>
    }
  </div>
)

// ── Custom chart tooltip ──────────────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className='rounded-xl border px-4 py-3 text-[12px] shadow-2xl'
      style={{ background: C.card, borderColor: C.border }}>
      <p className='font-[700] mb-2' style={{ color: C.text }}>{label}</p>
      {payload.map((p, i) => (
        <div key={i} className='flex items-center gap-2 mb-1'>
          <span className='w-2 h-2 rounded-full flex-shrink-0' style={{ background: p.color }} />
          <span style={{ color: C.muted }}>{p.name === 'TotalSales' ? 'Sales' : 'Users'}:</span>
          <span className='font-[700]' style={{ color: p.color }}>
            {p.name === 'TotalSales' ? `$${p.value.toLocaleString()}` : p.value}
          </span>
        </div>
      ))}
    </div>
  )
}

// ── Column defs ───────────────────────────────────────────────────────────────
const COLS = ['Product', 'Category', 'Sub Cat', 'Price', 'Sales', 'Stock', 'Rating', 'Actions']

// ─────────────────────────────────────────────────────────────────────────────
const Dashboard = () => {
  const context = React.useContext(Mycontext)

  const [focused, setFocused] = React.useState(false);
  const [category,     setCategory]     = React.useState('')
  const [categoryName, setCategoryName] = React.useState('')
  const [page,         setPage]         = React.useState(0)
  const [searchQuery,  setSearchQuery]  = React.useState('')
  const [rowsPerPage,  setRowsPerPage]  = React.useState(10)
  const [totalCount,   setTotalCount]   = React.useState(0)
  const [loading,      setLoading]      = React.useState(false)
  const [selectedIds,  setSelectedIds]  = React.useState([])

  const [recentOrders,       setRecentOrders]       = React.useState([])
  const [ordersLoading,      setOrdersLoading]      = React.useState(false)
  const [selectedOrderModal, setSelectedOrderModal] = React.useState(null)

  const currentYear = new Date().getFullYear()
  const yearOptions = [currentYear, currentYear - 1, currentYear - 2]
  const [chartYear,    setChartYear]    = React.useState(currentYear)
  const [chartData,    setChartData]    = React.useState([])
  const [chartLoading, setChartLoading] = React.useState(false)
  const [summary,      setSummary]      = React.useState(null)

  const allIds      = (context.products || []).map(p => p._id)
  const allSelected = allIds.length > 0 && allIds.every(id => selectedIds.includes(id))
  const someSel     = selectedIds.length > 0 && !allSelected

  const loadAnalytics = React.useCallback(async (year) => {
    setChartLoading(true)
    try {
      const res = await fetchData(`/api/user/analytics?year=${year}`)
      if (res?.data?.data) { setChartData(res.data.data.chartData); setSummary(res.data.data.summary) }
    } catch (e) { context.openAlertBox('error', e?.message || 'Failed to load analytics') }
    finally { setChartLoading(false) }
  }, [])

  const loadProducts = async (pg, perPage, catName = '', query = '') => {
    setLoading(true)
    try {
      let url = query
        ? `/api/product/search?q=${encodeURIComponent(query)}&page=${pg+1}&perPage=${perPage}`
        : catName
          ? `/api/product/byCategoryName?catName=${encodeURIComponent(catName)}&page=${pg+1}&perPage=${perPage}`
          : `/api/product/?page=${pg+1}&perPage=${perPage}`
      const res = await fetchData(url)
      context.setProducts(res.data?.product || [])
      setTotalCount(res.data?.totalPages * perPage || 0)
    } catch (e) { context.openAlertBox('error', e?.message || 'Failed') }
    finally { setLoading(false) }
  }

  const loadRecentOrders = async () => {
    setOrdersLoading(true)
    try {
      const res = await fetchData('/api/order/admin/all?page=1&limit=8&sort_by=createdAt&sort_order=desc')
      setRecentOrders(Array.isArray(res?.data?.data) ? res.data.data : [])
    } catch (e) { context.openAlertBox('error', e?.message || 'Failed to load orders') }
    finally { setOrdersLoading(false) }
  }

  React.useEffect(() => {
    context.reloadCategories?.()
    loadRecentOrders()
    loadAnalytics(currentYear)
  }, [])

  React.useEffect(() => { loadProducts(page, rowsPerPage, categoryName, searchQuery) }, [page, rowsPerPage])

  const handleSearch      = (q) => { setSearchQuery(q); setPage(0); setSelectedIds([]); if (q) { setCategory(''); setCategoryName('') } loadProducts(0, rowsPerPage, q ? '' : categoryName, q) }
  const handleYearChange  = (e) => { const yr = Number(e.target.value); setChartYear(yr); loadAnalytics(yr) }
  const handleCatChange   = (e) => { const val = e.target.value; setCategory(val); setPage(0); setSelectedIds([]); setSearchQuery(''); const name = (context.categories||[]).find(c=>c._id===val)?.name||''; setCategoryName(name); loadProducts(0, rowsPerPage, name, '') }
  const handleDelete      = async (id) => { try { await deleteData(`/api/product/${id}`); context.openAlertBox('success','Deleted'); setSelectedIds(p=>p.filter(i=>i!==id)); loadProducts(page,rowsPerPage,categoryName) } catch(e){ context.openAlertBox('error',e?.message) } }
  const handleDeleteSel   = async () => { if (!selectedIds.length) return; try { await deleteData('/api/product/deleteMultiple',{ids:selectedIds}); context.openAlertBox('success',`${selectedIds.length} deleted`); setSelectedIds([]); loadProducts(page,rowsPerPage,categoryName) } catch(e){ context.openAlertBox('error',e?.message) } }

  const fmt = (d) => d ? new Date(d).toLocaleDateString('en-US',{year:'numeric',month:'short',day:'numeric'}) : '—'
  const fmtCur = (n) => new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(n??0)

  // skeleton bg for dark theme
  const skelSx = { bgcolor: '#ffffff08', borderRadius: 1 }

  return (
    <div className='flex flex-col gap-5 pb-8' style={{ background: C.bg, minHeight: '100vh' }}>

      {/* ── Welcome banner ── */}
      <div className='mx-4 !mt-4 rounded-2xl border overflow-hidden relative'
        style={{ background: 'linear-gradient(135deg,#16161f 0%,#1a0808 100%)', borderColor: C.border }}>
        {/* Grid texture */}
        <div className='absolute inset-0 opacity-[0.04] pointer-events-none'
          style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '32px 32px' }} />
        {/* Red glow orb */}
        <div className='absolute right-0 top-0 w-80 h-80 rounded-full blur-[80px] opacity-20 pointer-events-none'
          style={{ background: C.red, transform: 'translate(30%,-30%)' }} />
        <div className='relative flex items-center justify-between p-6 gap-6'>
          <div>
            <p className='text-[12px] font-[600] uppercase tracking-widest mb-1' style={{ color: C.red }}>Admin Dashboard</p>
            <h1 className='text-[28px] font-[900] tracking-tight leading-none mb-1' style={{ color: C.text }}>
              Welcome back 👋
            </h1>
            <h2 className='text-[24px] font-[900] tracking-tight' style={{ color: C.red }}>
              {context.userData?.name || 'Admin'}
            </h2>
            <p className='text-[13px] mt-2 mb-4' style={{ color: C.muted }}>
              Here's what's happening in your store today.
            </p>
            <button
              onClick={() => context.handleOpenFullScreenPanel('Add Product')}
              className='flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-[700] text-white transition-all active:scale-95'
              style={{ background: 'linear-gradient(135deg,#ff4444,#f51111)', boxShadow: '0 4px 14px rgba(245,17,17,0.4)' }}
            >
              <FaPlusCircle size={14} /> Add Product
            </button>
          </div>
          <img className='w-[180px] opacity-90 hidden sm:block'
            src='https://ecommerce-admin-view.netlify.app/shop-illustration.webp' alt='' />
        </div>
      </div>

      {/* ── Summary cards ── */}
      <div className='mx-4 flex gap-3 flex-wrap'>
        <SummaryCard label='Revenue'       value={fmtCur(summary?.totalRevenue)}              icon={MdTrendingUp}      accent='#3b82f6' loading={chartLoading} />
        <SummaryCard label='Orders'        value={(summary?.totalOrders??0).toLocaleString()}  icon={MdShoppingCart}    accent='#22c55e' loading={chartLoading} />
        <SummaryCard label='Users'         value={(summary?.totalUsers??0).toLocaleString()}   icon={MdPeople}          accent='#a855f7' loading={chartLoading} />
        <SummaryCard label='Pending'       value={(summary?.pendingOrders??0).toLocaleString()}icon={MdPendingActions}  accent='#f59e0b' loading={chartLoading} />
      </div>

      {/* ── Products table ── */}
      <Card className='mx-4'>
        <div className='flex items-center justify-between p-5 pb-0'>
          <SectionTitle>Products</SectionTitle>
          <div className='flex items-center gap-2'>
            {selectedIds.length > 0 && (
              <button onClick={handleDeleteSel}
                className='flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-[700] transition-all'
                style={{ background: 'rgba(245,17,17,0.12)', color: '#f87171' }}>
                <MdDeleteSweep size={15} /> Delete ({selectedIds.length})
              </button>
            )}
            <button onClick={() => context.handleOpenFullScreenPanel('Add Product')}
              className='flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-[700] text-white transition-all active:scale-95'
              style={{ background: 'linear-gradient(135deg,#ff4444,#f51111)' }}>
              <FaPlusCircle size={12} /> Add Product
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className='flex items-center gap-4 px-5 py-3'>
          
        </div>
        <div className='flex items-center gap-4 px-5 py-3'>
          <label className='text-[11px] font-[600] uppercase tracking-wider' style={{ color: C.muted }}>Category</label>
          <Select size='small' value={category} onChange={handleCatChange} displayEmpty disabled={!(context.categories||[]).length || !!searchQuery}
            sx={{
              background: C.surface, color: C.text, borderRadius:'12px', fontSize:'13px',
              '& .MuiOutlinedInput-notchedOutline': { borderColor: C.border },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: C.red },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: C.red },
              '& .MuiSvgIcon-root': { color: C.muted },
            }}>
            <MenuItem value=''><em style={{ color: C.muted }}>All Categories</em></MenuItem>
            {(context.categories || []).map(cat => <MenuItem key={cat._id} value={cat._id}>{cat.name}</MenuItem>)}
          </Select>
          <div className='ml-auto'><SearchBox onSearch={handleSearch} /></div>
        </div>

        {/* Table */}
        <div className='overflow-x-auto'>
          <table className='w-full text-[13px]'>
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                <th className='px-4 py-3 text-left w-10'>
                  <Checkbox checked={allSelected} indeterminate={someSel}
                    onChange={e => setSelectedIds(e.target.checked ? allIds : [])} size='small'
                    sx={{ color: C.muted, '&.Mui-checked': { color: C.red }, '&.MuiCheckbox-indeterminate': { color: C.red }, p: 0 }} />
                </th>
                {COLS.map(col => (
                  <th key={col} className='px-4 py-3 text-left text-[11px] font-[700] uppercase tracking-wider whitespace-nowrap'
                    style={{ color: C.muted }}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                    <td className='px-4 py-3'><Skeleton variant='rectangular' width={16} height={16} sx={skelSx} /></td>
                    <td className='px-4 py-3'>
                      <div className='flex items-center gap-3'>
                        <Skeleton variant='rectangular' width={52} height={52} sx={{ ...skelSx, borderRadius: '10px' }} />
                        <div><Skeleton width={120} height={14} sx={skelSx} /><Skeleton width={80} height={12} sx={skelSx} /></div>
                      </div>
                    </td>
                    {[...Array(7)].map((_, j) => <td key={j} className='px-4 py-3'><Skeleton width={60} height={13} sx={skelSx} /></td>)}
                  </tr>
                ))
              ) : (context.products||[]).length === 0 ? (
                <tr>
                  <td colSpan={9} className='text-center py-12 text-[13px]' style={{ color: C.muted }}>
                    No products found
                  </td>
                </tr>
              ) : (context.products||[]).map(product => (
                <tr key={product._id}
                  className='transition-colors'
                  style={{ borderBottom: `1px solid ${C.border}` }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td className='px-4 py-3'>
                    <Checkbox size='small' checked={selectedIds.includes(product._id)}
                      onChange={() => setSelectedIds(p => p.includes(product._id) ? p.filter(i=>i!==product._id) : [...p,product._id])}
                      sx={{ color: C.muted, '&.Mui-checked': { color: C.red }, p: 0 }} />
                  </td>
                  {/* Product */}
                  <td className='px-4 py-3'>
                    <div className='flex items-center gap-3 min-w-[220px]'>
                      <div className='w-[52px] h-[52px] rounded-xl overflow-hidden flex-shrink-0'
                        style={{ background: 'rgba(255,255,255,0.05)' }}>
                        {product.images?.[0]
                          ? <LazyLoadImage src={product.images[0]} effect='blur' alt={product.name} className='w-full h-full object-cover' />
                          : <span className='w-full h-full flex items-center justify-center text-[10px]' style={{ color: C.muted }}>No img</span>
                        }
                      </div>
                      <div>
                        <p className='font-[600] leading-tight line-clamp-2 text-[12px]' style={{ color: C.text }}>{product.name}</p>
                        <p className='text-[11px] mt-0.5' style={{ color: C.muted }}>{product.brand}</p>
                      </div>
                    </div>
                  </td>
                  <td className='px-4 py-3 text-[12px] whitespace-nowrap' style={{ color: C.subtle }}>{product.catName || '—'}</td>
                  <td className='px-4 py-3 text-[12px] whitespace-nowrap' style={{ color: C.subtle }}>{product.subCatName || '—'}</td>
                  <td className='px-4 py-3'>
                    <div className='flex flex-col gap-0.5'>
                      {product.oldPrice > product.price && (
                        <span className='line-through text-[11px]' style={{ color: C.muted }}>${product.oldPrice}</span>
                      )}
                      <span className='text-[13px] font-[700]' style={{ color: C.red }}>${product.price}</span>
                    </div>
                  </td>
                  <td className='px-4 py-3 text-[12px]' style={{ color: C.subtle }}>{product.sale??0}</td>
                  <td className='px-4 py-3 text-[12px]' style={{ color: C.subtle }}>{product.countInStock}</td>
                  <td className='px-4 py-3'>
                    <Rating value={product.rating||0} size='small' readOnly
                      sx={{ '& .MuiRating-iconFilled': { color: '#f59e0b' }, '& .MuiRating-iconEmpty': { color: '#374151' } }} />
                  </td>
                  <td className='px-4 py-3'>
                    <div className='flex items-center gap-1'>
                      {[
                        { icon: AiTwotoneEdit, action: () => context.handleOpenFullScreenPanel('Edit Product', product), color: '#60a5fa' },
                        { icon: MdDeleteSweep, action: () => handleDelete(product._id), color: '#f87171' },
                      ].map(({ icon: Icon, action, color }, idx) => (
                        <button key={idx} onClick={action}
                          className='w-[32px] h-[32px] rounded-lg flex items-center justify-center transition-all'
                          style={{ color, background: 'transparent' }}
                          onMouseEnter={e => e.currentTarget.style.background = `${color}18`}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <Icon size={16} />
                        </button>
                      ))}
                      <Link to={`/product/${product._id}`} state={{ product }}>
                        <button className='w-[32px] h-[32px] rounded-lg flex items-center justify-center transition-all'
                          style={{ color: '#a78bfa' }}
                          onMouseEnter={e => e.currentTarget.style.background = '#a78bfa18'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          <LuView size={16} />
                        </button>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className='flex items-center justify-between px-5 py-3 border-t' style={{ borderColor: C.border }}>
          <span className='text-[12px]' style={{ color: C.muted }}>
            Showing {Math.min(page*rowsPerPage+1, totalCount)}–{Math.min((page+1)*rowsPerPage, totalCount)} of {totalCount}
          </span>
          <div className='flex items-center gap-2'>
            <button disabled={page===0} onClick={() => setPage(p=>p-1)}
              className='w-8 h-8 rounded-lg flex items-center justify-center text-[13px] font-[700] transition-all disabled:opacity-30'
              style={{ background: C.surface, color: C.text, border: `1px solid ${C.border}` }}>‹</button>
            <button disabled={(page+1)*rowsPerPage>=totalCount} onClick={() => setPage(p=>p+1)}
              className='w-8 h-8 rounded-lg flex items-center justify-center text-[13px] font-[700] transition-all disabled:opacity-30'
              style={{ background: C.surface, color: C.text, border: `1px solid ${C.border}` }}>›</button>
          </div>
        </div>
      </Card>

      {/* ── Recent Orders ── */}
      <Card className='mx-4'>
        <div className='flex items-center justify-between p-5 pb-3'>
          <SectionTitle sub='Latest 8 orders'>Recent Orders</SectionTitle>
          <Link to='/orders' className='text-[12px] font-[700] transition-colors hover:opacity-80' style={{ color: C.red }}>
            View all →
          </Link>
        </div>
        <div className='overflow-x-auto'>
          <table className='w-full text-[13px]'>
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                {['', 'Order ID', 'Customer', 'Phone', 'Address', 'Date', 'Total', 'Method', 'Status'].map((h, i) => (
                  <th key={i} className='px-4 py-2.5 text-left text-[11px] font-[700] uppercase tracking-wider whitespace-nowrap'
                    style={{ color: C.muted }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ordersLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                    {[...Array(9)].map((_, j) => <td key={j} className='px-4 py-3'><Skeleton width='80%' height={13} sx={skelSx} /></td>)}
                  </tr>
                ))
              ) : recentOrders.length === 0 ? (
                <tr><td colSpan={9} className='text-center py-10 text-[13px]' style={{ color: C.muted }}>No recent orders</td></tr>
              ) : recentOrders.map((order, i) => {
                const addr = order.delivery_address || {}
                const user = order.userId || {}
                const isCod = order.paymentId === 'COD'
                return (
                  <tr key={order._id||i} className='transition-colors'
                    style={{ borderBottom: `1px solid ${C.border}` }}
                    onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.02)'}
                    onMouseLeave={e => e.currentTarget.style.background='transparent'}
                  >
                    <td className='px-3 py-2'>
                      <button onClick={() => setSelectedOrderModal(order)}
                        className='w-[30px] h-[30px] rounded-lg flex items-center justify-center transition-all'
                        style={{ color: C.muted }}
                        onMouseEnter={e => { e.currentTarget.style.background=C.redSoft; e.currentTarget.style.color=C.red }}
                        onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color=C.muted }}>
                        <MdZoomOutMap size={14} />
                      </button>
                    </td>
                    <td className='px-4 py-3'>
                      <span className='font-mono text-[11px] font-[700]' style={{ color: C.subtle }}>
                        #{order.orderId?.slice(0,8).toUpperCase()||'—'}
                      </span>
                    </td>
                    <td className='px-4 py-3 whitespace-nowrap'>
                      <p className='font-[600] text-[12px]' style={{ color: C.text }}>{user.name||'—'}</p>
                      <p className='text-[11px]' style={{ color: C.muted }}>{user.email||''}</p>
                    </td>
                    <td className='px-4 py-3 whitespace-nowrap text-[12px]' style={{ color: C.subtle }}>{addr.mobile||'—'}</td>
                    <td className='px-4 py-3 text-[12px] max-w-[140px] truncate' style={{ color: C.subtle }}>
                      {addr.address_line ? `${addr.address_line}, ${addr.city||''}` : '—'}
                    </td>
                    <td className='px-4 py-3 whitespace-nowrap text-[12px]' style={{ color: C.subtle }}>{fmt(order.createdAt)}</td>
                    <td className='px-4 py-3 whitespace-nowrap font-[700] text-[13px]' style={{ color: C.text }}>
                      ${Number(order.total_amount??0).toFixed(2)}
                    </td>
                    <td className='px-4 py-3'>
                      <span className='text-[11px] font-[700] px-2 py-[2px] rounded-full'
                        style={{ background: isCod ? 'rgba(245,158,11,0.12)' : 'rgba(59,130,246,0.12)', color: isCod ? '#f59e0b' : '#60a5fa' }}>
                        {isCod ? 'COD' : 'Card'}
                      </span>
                    </td>
                    <td className='px-4 py-3'><StatusBadge status={order.payment_status} /></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── Analytics chart ── */}
      <Card className='mx-4'>
        <div className='flex items-center justify-between p-5 pb-0'>
          <SectionTitle sub={`Monthly breakdown · ${chartYear}`}>Sales & Users</SectionTitle>
          <Select value={chartYear} onChange={handleYearChange} size='small'
            sx={{
              minWidth: 90, fontSize: 12, height: 32,
              '& .MuiOutlinedInput-notchedOutline': { borderColor: C.border },
              '& .MuiSelect-select': { color: C.text, background: C.surface, py: '4px' },
              '& .MuiSvgIcon-root': { color: C.muted },
              background: C.surface, borderRadius: '10px',
            }}>
            {yearOptions.map(y => <MenuItem key={y} value={y} sx={{ fontSize: 12 }}>{y}</MenuItem>)}
          </Select>
        </div>
        <div className='p-5' style={{ height: 300 }}>
          {chartLoading ? (
            <div className='w-full h-full flex items-center justify-center'>
              <div className='w-8 h-8 border-2 border-t-transparent rounded-full animate-spin' style={{ borderColor: `${C.red} transparent transparent transparent` }} />
            </div>
          ) : (
            <ResponsiveContainer width='100%' height='100%'>
              <AreaChart data={chartData} margin={{ top: 5, right: 50, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id='dSalesGrad' x1='0' y1='0' x2='0' y2='1'>
                    <stop offset='5%' stopColor='#3b82f6' stopOpacity={0.2} />
                    <stop offset='95%' stopColor='#3b82f6' stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id='dUsersGrad' x1='0' y1='0' x2='0' y2='1'>
                    <stop offset='5%' stopColor='#22c55e' stopOpacity={0.2} />
                    <stop offset='95%' stopColor='#22c55e' stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray='3 3' stroke='rgba(255,255,255,0.05)' />
                <XAxis dataKey='name' tick={{ fontSize: 11, fill: C.muted }} axisLine={false} tickLine={false} />
                <YAxis yAxisId='sales' orientation='left' width={52} tick={{ fontSize: 11, fill: '#3b82f6' }} axisLine={false} tickLine={false}
                  tickFormatter={v => v>=1000 ? `$${(v/1000).toFixed(0)}k` : `$${v}`} />
                <YAxis yAxisId='users' orientation='right' width={36} tick={{ fontSize: 11, fill: '#22c55e' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
                  formatter={v => <span style={{ color: C.muted, fontWeight: 600 }}>{v === 'TotalSales' ? 'Total Sales ($)' : 'New Users'}</span>} />
                <Area yAxisId='sales' type='monotone' dataKey='TotalSales' stroke='#3b82f6' strokeWidth={2.5} fill='url(#dSalesGrad)' dot={false} activeDot={{ r: 5, fill: '#3b82f6', strokeWidth: 0 }} />
                <Area yAxisId='users' type='monotone' dataKey='TotalUsers' stroke='#22c55e' strokeWidth={2.5} fill='url(#dUsersGrad)' dot={false} activeDot={{ r: 5, fill: '#22c55e', strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>

      {/* ── Order detail modal ── */}
      {selectedOrderModal && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4'
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
          onClick={() => setSelectedOrderModal(null)}>
          <div className='w-full max-w-[480px] max-h-[85vh] overflow-y-auto rounded-2xl border'
            style={{ background: C.card, borderColor: C.border }}
            onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className='flex items-center justify-between p-5 border-b' style={{ borderColor: C.border }}>
              <div>
                <h3 className='text-[15px] font-[700]' style={{ color: C.text }}>Order Details</h3>
                <p className='text-[12px] font-mono mt-0.5' style={{ color: C.muted }}>
                  #{selectedOrderModal.orderId?.slice(0,8).toUpperCase()}
                </p>
              </div>
              <button onClick={() => setSelectedOrderModal(null)}
                className='w-8 h-8 rounded-full flex items-center justify-center transition-all'
                style={{ background: C.surface, color: C.muted, border: `1px solid ${C.border}` }}
                onMouseEnter={e => { e.currentTarget.style.background=C.redSoft; e.currentTarget.style.color=C.red }}
                onMouseLeave={e => { e.currentTarget.style.background=C.surface; e.currentTarget.style.color=C.muted }}>
                <IoCloseSharp size={16} />
              </button>
            </div>
            {/* Body */}
            <div className='p-5 flex flex-col gap-4'>
              <div className='grid grid-cols-2 gap-2 rounded-xl p-3 text-[13px]' style={{ background: C.surface }}>
                {[
                  ['Name',   selectedOrderModal.userId?.name || '—'],
                  ['Email',  selectedOrderModal.userId?.email || '—'],
                  ['Date',   fmt(selectedOrderModal.createdAt)],
                  ['Method', selectedOrderModal.paymentId==='COD' ? 'Cash on Delivery' : 'Card'],
                ].map(([k,v]) => (
                  <div key={k}><span style={{ color: C.muted }}>{k}: </span><span style={{ color: C.text }}>{v}</span></div>
                ))}
              </div>
              <div>
                <p className='text-[11px] font-[700] uppercase tracking-widest mb-2' style={{ color: C.muted }}>
                  Items ({(selectedOrderModal.items||[]).length})
                </p>
                {(selectedOrderModal.items||[]).map((item, i) => {
                  const d = item.product_details||{}
                  const img = d.image?.[0]||item.productId?.images?.[0]||null
                  return (
                    <div key={i} className='flex items-center gap-3 rounded-xl p-2.5 mb-1.5' style={{ background: C.surface }}>
                      <div className='w-10 h-10 rounded-lg overflow-hidden flex-shrink-0' style={{ background: C.border }}>
                        {img && <img src={img} className='w-full h-full object-cover' alt='' />}
                      </div>
                      <div className='flex-1 min-w-0'>
                        <p className='font-[600] text-[12px] truncate' style={{ color: C.text }}>{d.name||'Product'}</p>
                      </div>
                      <div className='text-right flex-shrink-0'>
                        <p className='text-[11px]' style={{ color: C.muted }}>×{item.quantity}</p>
                        <p className='font-[700] text-[13px]' style={{ color: C.red }}>${Number(item.sub_total??0).toFixed(2)}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className='flex justify-between pt-3 border-t' style={{ borderColor: C.border }}>
                <span className='font-[600]' style={{ color: C.muted }}>Total</span>
                <span className='font-[800] text-[16px]' style={{ color: C.red }}>${Number(selectedOrderModal.total_amount??0).toFixed(2)}</span>
              </div>
              <div className='flex items-center justify-between'>
                <span className='font-[600]' style={{ color: C.muted }}>Status</span>
                <StatusBadge status={selectedOrderModal.payment_status} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard