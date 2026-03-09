import React from 'react'
import CircularProgress from '@mui/material/CircularProgress'
import { FaPlusCircle } from 'react-icons/fa'
import { AiTwotoneEdit } from 'react-icons/ai'
import { MdDeleteSweep } from 'react-icons/md'
import { Mycontext } from '../../App'
import { fetchData, deleteData } from '../../utils/api'

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

const HomeBanner = () => {
  const context                       = React.useContext(Mycontext)
  const [sliders,    setSliders]      = React.useState([])
  const [loading,    setLoading]      = React.useState(true)
  const [deletingId, setDeletingId]   = React.useState(null)
  const [page,       setPage]         = React.useState(0)
  const rowsPerPage                   = 10

  const fetchSliders = async () => {
    try {
      setLoading(true)
      const res = await fetchData('/api/homeSlider/')
      setSliders(res.data?.homeSlider || [])
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  React.useEffect(() => { fetchSliders() }, [])
  React.useEffect(() => {
    if (!context.isOpenFullScreenPanel?.open) fetchSliders()
  }, [context.isOpenFullScreenPanel?.open])

  const handleDelete = async (id) => {
    try {
      setDeletingId(id)
      await deleteData(`/api/homeSlider/${id}`)
      setSliders(prev => prev.filter(s => s._id !== id))
      context.openAlertBox('success', 'Banner deleted')
    } catch (e) {
      context.openAlertBox('error', e.message || 'Delete failed')
    } finally { setDeletingId(null) }
  }

  const totalPages = Math.ceil(sliders.length / rowsPerPage)
  const visible    = sliders.slice(page * rowsPerPage, (page + 1) * rowsPerPage)

  return (
    <div className='flex flex-col gap-5 pb-8' style={{ minHeight: '100vh', background: C.bg }}>

      {/* ── Header ── */}
      <div className='flex items-center justify-between gap-3 flex-wrap'>
        <div>
          <h2 className='text-[20px] font-[800] tracking-tight' style={{ color: C.text }}>Home Banners</h2>
          <p className='text-[13px] mt-0.5' style={{ color: C.muted }}>{sliders.length} banner{sliders.length !== 1 ? 's' : ''} total</p>
        </div>
        <button
          onClick={() => context.handleOpenFullScreenPanel('Add Banner')}
          className='flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-[700] text-white transition-all active:scale-95'
          style={{ background: 'linear-gradient(135deg,#ff4444,#f51111)', boxShadow: '0 4px 14px rgba(245,17,17,0.35)' }}
        >
          <FaPlusCircle size={14} /> Add Banner
        </button>
      </div>

      {/* ── Table card ── */}
      <div className='rounded-2xl border overflow-hidden' style={{ background: C.card, borderColor: C.border }}>

        {/* Table header */}
        <div className='grid grid-cols-[1fr_120px] border-b px-5 py-3'
          style={{ borderColor: C.border, background: C.surface }}>
          <span className='text-[11px] font-[700] uppercase tracking-wider' style={{ color: C.muted }}>Image Preview</span>
          <span className='text-[11px] font-[700] uppercase tracking-wider' style={{ color: C.muted }}>Actions</span>
        </div>

        {/* Body */}
        {loading ? (
          <div className='flex items-center justify-center py-16'>
            <div className='flex flex-col items-center gap-3'>
              <div className='w-10 h-10 rounded-full border-2 border-t-transparent animate-spin'
                style={{ borderColor: `${C.red} transparent transparent transparent` }} />
              <p className='text-[13px]' style={{ color: C.muted }}>Loading banners…</p>
            </div>
          </div>
        ) : visible.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-16 gap-3'>
            <div className='w-14 h-14 rounded-2xl flex items-center justify-center'
              style={{ background: C.redSoft }}>
              <FaPlusCircle size={22} style={{ color: C.red }} />
            </div>
            <p className='text-[14px] font-[600]' style={{ color: C.text }}>No banners yet</p>
            <p className='text-[12px]' style={{ color: C.muted }}>Click "Add Banner" to create your first one</p>
          </div>
        ) : (
          visible.map((slider, idx) => (
            <div
              key={slider._id}
              className='grid grid-cols-[1fr_120px] items-center px-5 py-4 transition-colors'
              style={{
                borderBottom: idx < visible.length - 1 ? `1px solid ${C.border}` : 'none',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {/* Images */}
              <div className='flex flex-wrap gap-3'>
                {(slider.images || []).map((img, i) => (
                  <div key={i}
                    className='rounded-xl overflow-hidden border group'
                    style={{
                      width: '200px', height: '80px',
                      borderColor: C.border,
                      flexShrink: 0,
                    }}>
                    <img
                      src={img}
                      alt={`banner-${i}`}
                      className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-105'
                    />
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className='flex items-center gap-1.5'>
                {/* Edit */}
                <button
                  onClick={() => context.handleOpenFullScreenPanel('Edit Banner', slider)}
                  className='w-9 h-9 rounded-xl flex items-center justify-center transition-all'
                  style={{ color: '#60a5fa', background: 'transparent' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(96,165,250,0.12)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  title='Edit'
                >
                  <AiTwotoneEdit size={17} />
                </button>

                {/* Delete */}
                <button
                  onClick={() => handleDelete(slider._id)}
                  disabled={deletingId === slider._id}
                  className='w-9 h-9 rounded-xl flex items-center justify-center transition-all disabled:opacity-50'
                  style={{ color: '#f87171', background: 'transparent' }}
                  onMouseEnter={e => { if (deletingId !== slider._id) e.currentTarget.style.background = 'rgba(248,113,113,0.12)' }}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  title='Delete'
                >
                  {deletingId === slider._id
                    ? <CircularProgress size={14} sx={{ color: '#f87171' }} />
                    : <MdDeleteSweep size={18} />
                  }
                </button>
              </div>
            </div>
          ))
        )}

        {/* ── Pagination ── */}
        {sliders.length > rowsPerPage && (
          <div className='flex items-center justify-between px-5 py-3 border-t' style={{ borderColor: C.border }}>
            <span className='text-[12px]' style={{ color: C.muted }}>
              {page * rowsPerPage + 1}–{Math.min((page + 1) * rowsPerPage, sliders.length)} of {sliders.length}
            </span>
            <div className='flex items-center gap-2'>
              <button disabled={page === 0} onClick={() => setPage(p => p - 1)}
                className='w-8 h-8 rounded-lg flex items-center justify-center text-[13px] font-[700] transition-all disabled:opacity-30'
                style={{ background: C.surface, color: C.text, border: `1px solid ${C.border}` }}>
                ‹
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button key={i} onClick={() => setPage(i)}
                  className='w-8 h-8 rounded-lg flex items-center justify-center text-[12px] font-[700] transition-all'
                  style={{
                    background: page === i ? C.red : C.surface,
                    color:      page === i ? '#fff' : C.subtle,
                    border:     `1px solid ${page === i ? C.red : C.border}`,
                  }}>
                  {i + 1}
                </button>
              ))}
              <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}
                className='w-8 h-8 rounded-lg flex items-center justify-center text-[13px] font-[700] transition-all disabled:opacity-30'
                style={{ background: C.surface, color: C.text, border: `1px solid ${C.border}` }}>
                ›
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default HomeBanner