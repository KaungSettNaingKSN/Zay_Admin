import React from 'react'
import { FaPlusCircle } from 'react-icons/fa'
import { AiTwotoneEdit } from 'react-icons/ai'
import { MdDeleteSweep, MdCategory } from 'react-icons/md'
import Skeleton from '@mui/material/Skeleton'
import { Mycontext } from '../../App'
import { deleteData } from '../../utils/api'

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
const skelSx = { bgcolor:'rgba(255,255,255,0.06)', borderRadius:1 }

const flattenCategories = (nodes = [], level = 0, out = []) => {
  for (const n of nodes) {
    out.push({ ...n, level })
    if (n.children?.length) flattenCategories(n.children, level + 1, out)
  }
  return out
}

const CategoryList = () => {
  const { categories, reloadCategories, openAlertBox, handleOpenFullScreenPanel } = React.useContext(Mycontext)
  const [rowsPerPage, setRowsPerPage] = React.useState(10)
  const [page,        setPage]        = React.useState(0)
  const [loading,     setLoading]     = React.useState(false)

  React.useEffect(() => {
    (async () => {
      try { setLoading(true); await reloadCategories() }
      catch (e) { openAlertBox('error', e?.message || 'Failed to load') }
      finally { setLoading(false) }
    })()
  }, [])

  const handleDeleteCategory = async id => {
    try { await deleteData(`/api/category/${id}`, { withCredentials: true }); await reloadCategories(); openAlertBox('success', 'Category deleted') }
    catch (e) { openAlertBox('error', e?.message || 'Delete failed') }
  }

  const flat  = React.useMemo(() => flattenCategories(categories || []).filter(c => !c.parentId), [categories])
  const total = flat.length
  const paged = flat.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
  const totalPages = Math.ceil(total / rowsPerPage)

  return (
    <div className='flex flex-col gap-5 pb-8' style={{ minHeight:'100vh', background: C.bg }}>
      <div className='fixed pointer-events-none' style={{ width:'500px', height:'500px', borderRadius:'50%', background:`radial-gradient(circle, ${C.redGlow} 0%, transparent 70%)`, top:'-150px', right:'-100px', opacity:0.2, zIndex:0 }} />

      {/* Header */}
      <div className='relative z-10 flex items-center justify-between gap-3 flex-wrap'>
        <div className='flex items-center gap-3'>
          <div className='w-10 h-10 rounded-xl flex items-center justify-center' style={{ background: C.redSoft }}>
            <MdCategory size={18} style={{ color: C.red }} />
          </div>
          <div>
            <h2 className='text-[20px] font-[900] tracking-tight' style={{ color: C.text }}>Category</h2>
            <p className='text-[12px]' style={{ color: C.muted }}>{loading ? 'Loading…' : `${total} categories`}</p>
          </div>
        </div>
        <button onClick={() => handleOpenFullScreenPanel('Add Category')}
          className='flex items-center gap-2 px-4 h-[40px] rounded-xl text-[13px] font-[700] text-white transition-all active:scale-95'
          style={{ background:`linear-gradient(135deg,#ff4444 0%,${C.red} 100%)`, boxShadow:`0 4px 14px ${C.redGlow}` }}>
          <FaPlusCircle size={14} /> Add Category
        </button>
      </div>

      {/* Table */}
      <div className='relative z-10 rounded-2xl border overflow-hidden' style={{ background: C.card, borderColor: C.border }}>
        <div className='overflow-x-auto'>
          <table className='w-full text-[13px]' style={{ minWidth:'500px' }}>
            <thead>
              <tr style={{ background: C.surface, borderBottom:`1px solid ${C.border}` }}>
                {['Image','Category','Action'].map(col => (
                  <th key={col} className='px-5 py-3 text-left text-[11px] font-[700] uppercase tracking-wider' style={{ color: C.muted }}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i} style={{ borderBottom:`1px solid ${C.border}` }}>
                    <td className='px-5 py-3'><Skeleton variant='rectangular' width={56} height={56} sx={{ ...skelSx, borderRadius:2 }} /></td>
                    <td className='px-5 py-3'><Skeleton width={140} height={14} sx={skelSx} /></td>
                    <td className='px-5 py-3'><div className='flex gap-2'><Skeleton variant='circular' width={36} height={36} sx={skelSx} /><Skeleton variant='circular' width={36} height={36} sx={skelSx} /></div></td>
                  </tr>
                ))
              ) : paged.length === 0 ? (
                <tr><td colSpan={3} className='py-16 text-center'>
                  <div className='flex flex-col items-center gap-3'>
                    <div className='w-14 h-14 rounded-2xl flex items-center justify-center' style={{ background: C.redSoft }}><MdCategory size={26} style={{ color: C.red }} /></div>
                    <p className='text-[14px] font-[600]' style={{ color: C.text }}>No categories yet</p>
                  </div>
                </td></tr>
              ) : paged.map(cat => {
                const imgSrc = Array.isArray(cat.images) ? cat.images[0] : cat.image
                return (
                  <tr key={cat._id} style={{ borderBottom:`1px solid ${C.border}` }}
                    onMouseEnter={e => e.currentTarget.style.background = C.hover}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td className='px-5 py-3'>
                      <div className='w-[56px] h-[56px] rounded-xl overflow-hidden border flex-shrink-0' style={{ borderColor: C.border, background: C.surface }}>
                        {imgSrc
                          ? <img alt='' src={imgSrc} className='w-full h-full object-cover hover:scale-105 transition-all' />
                          : <div className='w-full h-full flex items-center justify-center'><MdCategory size={22} style={{ color: C.muted }} /></div>
                        }
                      </div>
                    </td>
                    <td className='px-5 py-3'>
                      <span className='font-[600] text-[14px]' style={{ color: C.text }}>{cat.name}</span>
                    </td>
                    <td className='px-5 py-3'>
                      <div className='flex items-center gap-1'>
                        <button onClick={() => handleOpenFullScreenPanel('Edit Category', cat)}
                          className='w-9 h-9 rounded-xl flex items-center justify-center transition-all' style={{ color: C.subtle }}
                          onMouseEnter={e => e.currentTarget.style.background = C.hover} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          <AiTwotoneEdit size={16} />
                        </button>
                        <button onClick={e => { e.stopPropagation(); handleDeleteCategory(cat._id) }}
                          className='w-9 h-9 rounded-xl flex items-center justify-center transition-all' style={{ color:'#f87171' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(248,113,113,0.1)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          <MdDeleteSweep size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className='flex items-center justify-between px-5 py-3 border-t flex-wrap gap-3' style={{ borderColor:C.border, background:C.surface }}>
          <div className='flex items-center gap-2'>
            <span className='text-[11px] font-[600] uppercase tracking-wider' style={{ color: C.muted }}>Rows</span>
            {[10,25,50].map(n => (
              <button key={n} onClick={() => { setRowsPerPage(n); setPage(0) }}
                className='w-8 h-7 rounded-lg text-[12px] font-[700] transition-all'
                style={{ background: rowsPerPage===n ? C.red : C.card, color: rowsPerPage===n ? '#fff' : C.muted, border:`1px solid ${rowsPerPage===n ? C.red : C.border}` }}>
                {n}
              </button>
            ))}
          </div>
          <div className='flex items-center gap-1.5'>
            <span className='text-[12px] mr-1' style={{ color: C.muted }}>
              {total===0 ? '0' : page*rowsPerPage+1}–{Math.min((page+1)*rowsPerPage,total)} of {total}
            </span>
            <button disabled={page===0} onClick={() => setPage(p => p-1)}
              className='w-8 h-8 rounded-lg flex items-center justify-center text-[14px] font-[700] disabled:opacity-30'
              style={{ background:C.card, color:C.text, border:`1px solid ${C.border}` }}>‹</button>
            {[...Array(Math.min(totalPages,5))].map((_, i) => {
              const pg = Math.max(0, Math.min(page-2, totalPages-5)) + i
              return <button key={pg} onClick={() => setPage(pg)}
                className='w-8 h-8 rounded-lg flex items-center justify-center text-[12px] font-[700] transition-all'
                style={{ background: page===pg ? C.red : C.card, color: page===pg ? '#fff' : C.subtle, border:`1px solid ${page===pg ? C.red : C.border}`, boxShadow: page===pg ? `0 2px 8px ${C.redGlow}` : 'none' }}>
                {pg+1}
              </button>
            })}
            <button disabled={page>=totalPages-1} onClick={() => setPage(p => p+1)}
              className='w-8 h-8 rounded-lg flex items-center justify-center text-[14px] font-[700] disabled:opacity-30'
              style={{ background:C.card, color:C.text, border:`1px solid ${C.border}` }}>›</button>
          </div>
        </div>
      </div>
    </div>
  )
}
export default CategoryList