import React from 'react'
import { FaPlusCircle } from 'react-icons/fa'
import { AiTwotoneEdit } from 'react-icons/ai'
import { MdDeleteSweep, MdCategory } from 'react-icons/md'
import { FaChevronDown, FaChevronUp } from 'react-icons/fa'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Skeleton from '@mui/material/Skeleton'
import { Mycontext } from '../../App'
import { deleteData, putData } from '../../utils/api'

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
const selectSx = {
  background:C.surface, color:C.text, borderRadius:'10px', fontSize:'12px', height:'34px',
  '& .MuiOutlinedInput-notchedOutline':{ borderColor:C.border },
  '&:hover .MuiOutlinedInput-notchedOutline':{ borderColor:C.red },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline':{ borderColor:C.red },
  '& .MuiSvgIcon-root':{ color:C.muted },
}
const menuProps = { PaperProps:{ sx:{
  background:C.card, border:`1px solid ${C.border}`, borderRadius:'10px', mt:0.5,
  '& .MuiMenuItem-root':{ color:C.subtle, fontSize:'12px', py:0.75 },
  '& .MuiMenuItem-root:hover':{ background:C.hover, color:C.text },
  '& .MuiMenuItem-root.Mui-selected':{ background:C.redSoft, color:C.red },
}}}
const skelSx = { bgcolor:'rgba(255,255,255,0.06)', borderRadius:1 }

const flattenAll = (nodes = [], out = []) => {
  for (const n of nodes) { out.push(n); if (n.children?.length) flattenAll(n.children, out) }
  return out
}

// ── Inline edit row ───────────────────────────────────────────────────────────
const InlineEditRow = ({ cat, parentOptions, onSave, onCancel }) => {
  const [name,     setName]     = React.useState(cat.name)
  const [parentId, setParentId] = React.useState(cat.parentId || '')
  const [focused,  setFocused]  = React.useState(false)

  const handleSave = e => {
    e.preventDefault()
    const sel = parentOptions.find(p => p._id === parentId)
    onSave(cat._id, { name, parentId: parentId || null, parentCatName: sel?.name || null })
  }

  return (
    <form onSubmit={handleSave}
      className='flex items-center gap-3 px-4 py-2 rounded-xl flex-wrap'
      style={{ background: C.surface, border:`1px solid ${C.border}` }}>
      <Select size='small' value={parentId} onChange={e => setParentId(e.target.value)}
        sx={{ ...selectSx, width:'160px' }} MenuProps={menuProps}>
        {parentOptions.map(p => <MenuItem key={p._id} value={p._id}>{p.name}</MenuItem>)}
      </Select>
      <input type='text' value={name} name='name' onChange={e => setName(e.target.value)}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        className='flex-1 min-w-[120px] h-[34px] rounded-xl px-3 text-[13px] outline-none transition-all'
        style={{ background:C.card, color:C.text, border:`1px solid ${focused ? C.borderFocus : C.border}`, boxShadow: focused ? `0 0 0 3px ${C.redSoft}` : 'none' }} />
      <div className='flex gap-2'>
        <button type='submit'
          className='h-[34px] px-4 rounded-xl text-[12px] font-[700] text-white'
          style={{ background:'linear-gradient(135deg,#22c55e,#16a34a)' }}>Save</button>
        <button type='button' onClick={onCancel}
          className='h-[34px] px-4 rounded-xl text-[12px] font-[600]'
          style={{ background:C.card, color:C.muted, border:`1px solid ${C.border}` }}>Cancel</button>
      </div>
    </form>
  )
}

// ── Row component ─────────────────────────────────────────────────────────────
const CatRow = ({ name, level = 0, hasChildren, isOpen, onToggle, onEdit, onDelete, children }) => (
  <div>
    <div className='flex items-center justify-between px-4 py-2.5 rounded-xl transition-colors mb-1'
      style={{ marginLeft: level * 20 }}
      onMouseEnter={e => e.currentTarget.style.background = C.hover}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
      <div className='flex items-center gap-3'>
        {level > 0 && (
          <span className='text-[13px]' style={{ color: C.border, marginRight:'-4px' }}>
            {'—'.repeat(level)}
          </span>
        )}
        <span className='font-[600] text-[13px]' style={{ color: level===0 ? C.text : C.subtle }}>{name}</span>
      </div>
      <div className='flex items-center gap-1 ml-auto'>
        {onEdit && (
          <button onClick={onEdit} className='w-8 h-8 rounded-lg flex items-center justify-center transition-all' style={{ color:C.subtle }}
            onMouseEnter={e => e.currentTarget.style.background = C.hover} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <AiTwotoneEdit size={15} />
          </button>
        )}
        {onDelete && (
          <button onClick={onDelete} className='w-8 h-8 rounded-lg flex items-center justify-center transition-all' style={{ color:'#f87171' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(248,113,113,0.1)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <MdDeleteSweep size={16} />
          </button>
        )}
        {hasChildren && (
          <button onClick={onToggle} className='w-8 h-8 rounded-lg flex items-center justify-center transition-all' style={{ color: C.muted }}
            onMouseEnter={e => e.currentTarget.style.background = C.hover} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            {isOpen ? <FaChevronUp size={11} /> : <FaChevronDown size={11} />}
          </button>
        )}
      </div>
    </div>
    {isOpen && children}
  </div>
)

// ── Main component ────────────────────────────────────────────────────────────
const SubCategory = () => {
  const context = React.useContext(Mycontext)
  const [loading,   setLoading]   = React.useState(false)
  const [openIds,   setOpenIds]   = React.useState([])
  const [editingId, setEditingId] = React.useState(null)

  React.useEffect(() => {
    (async () => { try { setLoading(true); await context.reloadCategories() } finally { setLoading(false) } })()
  }, [])

  const toggleOpen = id => setOpenIds(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])

  const handleDelete = async id => {
    try { await deleteData(`/api/category/${id}`, { withCredentials:true }); await context.reloadCategories(); context.openAlertBox('success', 'Category deleted') }
    catch (e) { context.openAlertBox('error', e.message) }
  }

  const handleSave = async (id, payload) => {
    try { await putData(`/api/category/${id}`, payload, { withCredentials:true }); await context.reloadCategories(); context.openAlertBox('success', 'Category updated'); setEditingId(null) }
    catch (e) { context.openAlertBox('error', e.message) }
  }

  const topLevelCats = context.categories || []
  const allSubcats   = React.useMemo(() => {
    const all = flattenAll(context.categories || [])
    return all.filter(x => { if (!x.parentId) return false; const p = all.find(c => c._id === x.parentId); return p && !p.parentId })
  }, [context.categories])

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
            <h2 className='text-[20px] font-[900] tracking-tight' style={{ color: C.text }}>Sub Category</h2>
            <p className='text-[12px]' style={{ color: C.muted }}>{loading ? 'Loading…' : `${topLevelCats.length} top-level categories`}</p>
          </div>
        </div>
        <button onClick={() => context.handleOpenFullScreenPanel('Add Sub Category')}
          className='flex items-center gap-2 px-4 h-[40px] rounded-xl text-[13px] font-[700] text-white transition-all active:scale-95'
          style={{ background:`linear-gradient(135deg,#ff4444 0%,${C.red} 100%)`, boxShadow:`0 4px 14px ${C.redGlow}` }}>
          <FaPlusCircle size={14} /> Add Sub Category
        </button>
      </div>

      {/* Tree card */}
      <div className='relative z-10 rounded-2xl border p-4' style={{ background: C.card, borderColor: C.border }}>
        {loading ? (
          <div className='flex flex-col gap-2'>
            {[...Array(6)].map((_, i) => (
              <div key={i} className='flex items-center justify-between px-4 py-2.5 rounded-xl' style={{ background: C.surface }}>
                <Skeleton width={150} height={16} sx={skelSx} />
                <div className='flex gap-2'><Skeleton variant='circular' width={32} height={32} sx={skelSx} /><Skeleton variant='circular' width={32} height={32} sx={skelSx} /></div>
              </div>
            ))}
          </div>
        ) : topLevelCats.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-14 gap-3'>
            <div className='w-14 h-14 rounded-2xl flex items-center justify-center' style={{ background: C.redSoft }}><MdCategory size={26} style={{ color: C.red }} /></div>
            <p className='text-[14px] font-[600]' style={{ color: C.text }}>No categories yet</p>
          </div>
        ) : (
          <div className='flex flex-col gap-1'>
            {topLevelCats.map(parentCat => {
              const hasSubcats  = parentCat.children?.length > 0
              const isParentOpen = openIds.includes(parentCat._id)
              return (
                <div key={parentCat._id}>
                  {/* Parent row — no edit/delete (top-level managed in CategoryList) */}
                  <div className='flex items-center justify-between px-4 py-2.5 rounded-xl mb-0.5'
                    style={{ background: C.surface, border:`1px solid ${C.border}` }}>
                    <div className='flex items-center gap-2'>
                      <div className='w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0' style={{ background: C.redSoft }}>
                        <MdCategory size={13} style={{ color: C.red }} />
                      </div>
                      <span className='font-[700] text-[14px]' style={{ color: C.text }}>{parentCat.name}</span>
                      {hasSubcats && (
                        <span className='text-[10px] font-[600] px-2 py-0.5 rounded-full' style={{ background:'rgba(99,102,241,0.1)', color:'#818cf8' }}>
                          {parentCat.children.length}
                        </span>
                      )}
                    </div>
                    {hasSubcats && (
                      <button onClick={() => toggleOpen(parentCat._id)}
                        className='w-8 h-8 rounded-lg flex items-center justify-center transition-all' style={{ color: C.muted }}
                        onMouseEnter={e => e.currentTarget.style.background = C.hover} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        {isParentOpen ? <FaChevronUp size={11} /> : <FaChevronDown size={11} />}
                      </button>
                    )}
                  </div>

                  {/* Sub cats */}
                  {hasSubcats && isParentOpen && (
                    <div className='ml-5 flex flex-col gap-1 mb-1'>
                      {parentCat.children.map(subCat => {
                        const hasThirdLevel   = subCat.children?.length > 0
                        const isSubOpen       = openIds.includes(subCat._id)
                        const isEditingThisSub = editingId === subCat._id

                        return (
                          <div key={subCat._id}>
                            {isEditingThisSub ? (
                              <InlineEditRow cat={subCat} parentOptions={topLevelCats} onSave={handleSave} onCancel={() => setEditingId(null)} />
                            ) : (
                              <div className='flex items-center justify-between px-4 py-2 rounded-xl transition-colors'
                                onMouseEnter={e => e.currentTarget.style.background = C.hover}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                <span className='flex items-center gap-2 text-[13px]' style={{ color: C.subtle }}>
                                  <span style={{ color: C.border }}>—</span>
                                  {subCat.name}
                                </span>
                                <div className='flex items-center gap-1 ml-auto'>
                                  <button onClick={() => setEditingId(subCat._id)}
                                    className='w-8 h-8 rounded-lg flex items-center justify-center transition-all' style={{ color: C.subtle }}
                                    onMouseEnter={e => e.currentTarget.style.background = C.hover} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                    <AiTwotoneEdit size={14} />
                                  </button>
                                  <button onClick={e => { e.stopPropagation(); handleDelete(subCat._id) }}
                                    className='w-8 h-8 rounded-lg flex items-center justify-center transition-all' style={{ color:'#f87171' }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(248,113,113,0.1)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                    <MdDeleteSweep size={15} />
                                  </button>
                                  {hasThirdLevel && (
                                    <button onClick={() => toggleOpen(subCat._id)}
                                      className='w-8 h-8 rounded-lg flex items-center justify-center transition-all' style={{ color: C.muted }}
                                      onMouseEnter={e => e.currentTarget.style.background = C.hover} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                      {isSubOpen ? <FaChevronUp size={11} /> : <FaChevronDown size={11} />}
                                    </button>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Third level */}
                            {hasThirdLevel && isSubOpen && (
                              <div className='ml-5 flex flex-col gap-1 mb-1'>
                                {subCat.children.map(thirdCat => {
                                  const isEditingThisThird = editingId === thirdCat._id
                                  return (
                                    <div key={thirdCat._id}>
                                      {isEditingThisThird ? (
                                        <InlineEditRow cat={thirdCat} parentOptions={allSubcats} onSave={handleSave} onCancel={() => setEditingId(null)} />
                                      ) : (
                                        <div className='flex items-center justify-between px-4 py-2 rounded-xl transition-colors'
                                          onMouseEnter={e => e.currentTarget.style.background = C.hover}
                                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                          <span className='flex items-center gap-2 text-[12px]' style={{ color: C.muted }}>
                                            <span style={{ color: C.border }}>——</span>
                                            {thirdCat.name}
                                          </span>
                                          <div className='flex items-center gap-1 ml-auto'>
                                            <button onClick={() => setEditingId(thirdCat._id)}
                                              className='w-8 h-8 rounded-lg flex items-center justify-center transition-all' style={{ color: C.subtle }}
                                              onMouseEnter={e => e.currentTarget.style.background = C.hover} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                              <AiTwotoneEdit size={13} />
                                            </button>
                                            <button onClick={e => { e.stopPropagation(); handleDelete(thirdCat._id) }}
                                              className='w-8 h-8 rounded-lg flex items-center justify-center transition-all' style={{ color:'#f87171' }}
                                              onMouseEnter={e => e.currentTarget.style.background = 'rgba(248,113,113,0.1)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                              <MdDeleteSweep size={14} />
                                            </button>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  )
                                })}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
export default SubCategory