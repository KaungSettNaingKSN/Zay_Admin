import React from 'react'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Checkbox from '@mui/material/Checkbox'
import Rating from '@mui/material/Rating'
import Skeleton from '@mui/material/Skeleton'
import { FaPlusCircle } from 'react-icons/fa'
import { MdDeleteSweep, MdSearch, MdClose } from 'react-icons/md'
import { AiTwotoneEdit } from 'react-icons/ai'
import { LuView } from 'react-icons/lu'
import { HiMiniSquare3Stack3D } from 'react-icons/hi2'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import 'react-lazy-load-image-component/src/effects/blur.css'
import { Mycontext } from '../../App'
import { fetchData, deleteData } from '../../utils/api'
import { Link } from 'react-router-dom'

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

const Products = () => {
  const context = React.useContext(Mycontext)
  const [category,    setCategory]    = React.useState('')
  const [categoryName,setCategoryName]= React.useState('')
  const [searchQuery, setSearchQuery] = React.useState('')
  const [searchInput, setSearchInput] = React.useState('')
  const [rowsPerPage, setRowsPerPage] = React.useState(10)
  const [page,        setPage]        = React.useState(0)
  const [totalCount,  setTotalCount]  = React.useState(0)
  const [loading,     setLoading]     = React.useState(false)
  const [selectedIds, setSelectedIds] = React.useState([])
  const [focused,     setFocused]     = React.useState(false)
  const debounceRef = React.useRef(null)
  const hasCategories = (context.categories || []).length > 0
  const totalPages = Math.ceil(totalCount / rowsPerPage)

  const loadProducts = async (pg, perPage, catName = '', query = '') => {
    try {
      setLoading(true)
      let url
      if (query) url = `/api/product/search?q=${encodeURIComponent(query)}&page=${pg+1}&perPage=${perPage}`
      else if (catName) url = `/api/product/byCategoryName?catName=${encodeURIComponent(catName)}&page=${pg+1}&perPage=${perPage}`
      else url = `/api/product/?page=${pg+1}&perPage=${perPage}`
      const res = await fetchData(url)
      context.setProducts(res.data?.product || [])
      setTotalCount(res.data?.totalPages * perPage || 0)
    } catch (e) { context.openAlertBox('error', e?.message || 'Failed') }
    finally { setLoading(false) }
  }

  const handleSearch = (query) => {
    setSearchQuery(query); setPage(0); setSelectedIds([])
    if (query) { setCategory(''); setCategoryName('') }
    loadProducts(0, rowsPerPage, query ? '' : categoryName, query)
  }

  const handleSearchInput = val => {
    setSearchInput(val); clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => handleSearch(val), 400)
  }

  const handleChangeCategory = e => {
    const val = e.target.value; setCategory(val); setPage(0); setSelectedIds([]); setSearchQuery(''); setSearchInput('')
    const name = (context.categories || []).find(c => c._id === val)?.name || ''
    setCategoryName(name); loadProducts(0, rowsPerPage, name, '')
  }

  React.useEffect(() => {
    (async () => { try { await context.reloadCategories() } catch (e) { context.openAlertBox('error', e?.message) } })()
  }, [])

  React.useEffect(() => { loadProducts(page, rowsPerPage, categoryName, searchQuery) }, [page, rowsPerPage])

  const handleDelete = async id => {
    try { await deleteData(`/api/product/${id}`); context.openAlertBox('success', 'Product deleted'); setSelectedIds(p => p.filter(i => i !== id)); loadProducts(page, rowsPerPage, categoryName, searchQuery) }
    catch (e) { context.openAlertBox('error', e?.message || 'Delete failed') }
  }

  const handleDeleteSelected = async () => {
    if (!selectedIds.length) return
    try { await deleteData('/api/product/deleteMultiple', { ids: selectedIds }); context.openAlertBox('success', `${selectedIds.length} product(s) deleted`); setSelectedIds([]); loadProducts(page, rowsPerPage, categoryName, searchQuery) }
    catch (e) { context.openAlertBox('error', e?.message || 'Bulk delete failed') }
  }

  const allIds      = context.products.map(p => p._id)
  const allSelected = allIds.length > 0 && allIds.every(id => selectedIds.includes(id))
  const someSel     = selectedIds.length > 0 && !allSelected
  const handleSelectAll = e => setSelectedIds(e.target.checked ? allIds : [])
  const handleSelectOne = id => setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])

  return (
    <div className='flex flex-col gap-5 pb-8' style={{ minHeight:'100vh', background: C.bg }}>
      <div className='fixed pointer-events-none' style={{ width:'500px', height:'500px', borderRadius:'50%', background:`radial-gradient(circle, ${C.redGlow} 0%, transparent 70%)`, top:'-150px', right:'-100px', opacity:0.2, zIndex:0 }} />

      {/* Header */}
      <div className='relative z-10 flex items-center justify-between gap-3 flex-wrap'>
        <div className='flex items-center gap-3'>
          <div className='w-10 h-10 rounded-xl flex items-center justify-center' style={{ background: C.redSoft }}>
            <HiMiniSquare3Stack3D size={18} style={{ color: C.red }} />
          </div>
          <div>
            <h2 className='text-[20px] font-[900] tracking-tight' style={{ color: C.text }}>Products</h2>
            <p className='text-[12px]' style={{ color: C.muted }}>{loading ? 'Loading…' : `${totalCount} total`}</p>
          </div>
        </div>
        <div className='flex items-center gap-2 flex-wrap'>
          {selectedIds.length > 0 && (
            <button onClick={handleDeleteSelected}
              className='flex items-center gap-2 px-4 h-[38px] rounded-xl text-[13px] font-[700] transition-all active:scale-95'
              style={{ background:'rgba(245,17,17,0.1)', color:'#f87171', border:'1px solid rgba(245,17,17,0.2)' }}>
              <MdDeleteSweep size={16} /> Delete ({selectedIds.length})
            </button>
          )}
          <button onClick={() => context.handleOpenFullScreenPanel('Add Product')}
            className='flex items-center gap-2 px-4 h-[38px] rounded-xl text-[13px] font-[700] text-white transition-all active:scale-95'
            style={{ background:`linear-gradient(135deg,#ff4444 0%,${C.red} 100%)`, boxShadow:`0 4px 14px ${C.redGlow}` }}>
            <FaPlusCircle size={14} /> Add Product
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className='relative z-10 flex items-end gap-3 flex-wrap'>
        <div className='flex flex-col gap-1.5' style={{ minWidth:'160px' }}>
          <label className='text-[11px] font-[600] uppercase tracking-wider' style={{ color: C.muted }}>Category</label>
          <Select size='small' value={category} onChange={handleChangeCategory} displayEmpty disabled={!hasCategories || !!searchQuery}
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
        </div>
        {/* Search */}
        <div className='relative flex items-center flex-1' style={{ maxWidth:'280px' }}>
          <MdSearch size={15} className='absolute left-3 pointer-events-none z-10' style={{ color: focused ? C.red : C.muted, transition:'color 0.2s' }} />
          <input value={searchInput} onChange={e => handleSearchInput(e.target.value)}
            onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
            placeholder='Search products…'
            className='w-full h-[40px] pl-9 pr-8 rounded-xl text-[13px] outline-none transition-all'
            style={{ background:C.surface, border:`1px solid ${focused ? C.red : C.border}`, color:C.text, boxShadow: focused ? `0 0 0 3px ${C.redSoft}` : 'none' }} />
          {searchInput && (
            <button onClick={() => { setSearchInput(''); handleSearch('') }}
              className='absolute right-2.5 w-5 h-5 rounded-full flex items-center justify-center'
              style={{ color:C.muted, background:'rgba(255,255,255,0.06)' }}
              onMouseEnter={e => { e.currentTarget.style.background = C.redSoft; e.currentTarget.style.color = C.red }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = C.muted }}>
              <MdClose size={11} />
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className='relative z-10 rounded-2xl border overflow-hidden' style={{ background: C.card, borderColor: C.border }}>
        <div className='overflow-x-auto'>
          <table className='w-full text-[13px]' style={{ minWidth:'900px' }}>
            <thead>
              <tr style={{ background: C.surface, borderBottom:`1px solid ${C.border}` }}>
                <th className='px-4 py-3 w-10'>
                  <Checkbox checked={allSelected} indeterminate={someSel} onChange={handleSelectAll} size='small'
                    sx={{ color:C.muted, p:0, '&.Mui-checked':{color:C.red}, '&.MuiCheckbox-indeterminate':{color:C.red} }} />
                </th>
                {['Product','Category','Sub Category','Price','Sales','Stock','Rating','Action'].map(col => (
                  <th key={col} className='px-4 py-3 text-left text-[11px] font-[700] uppercase tracking-wider whitespace-nowrap' style={{ color: C.muted }}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i} style={{ borderBottom:`1px solid ${C.border}` }}>
                    <td className='px-4 py-3'><Skeleton variant='rectangular' width={16} height={16} sx={skelSx} /></td>
                    <td className='px-4 py-3'>
                      <div className='flex items-center gap-3'>
                        <Skeleton variant='rectangular' width={60} height={60} sx={{ ...skelSx, borderRadius:2 }} />
                        <div><Skeleton width={120} height={14} sx={skelSx} /><Skeleton width={70} height={12} sx={skelSx} /></div>
                      </div>
                    </td>
                    {[...Array(7)].map((_, j) => <td key={j} className='px-4 py-3'><Skeleton width={70} height={13} sx={skelSx} /></td>)}
                  </tr>
                ))
              ) : context.products.length === 0 ? (
                <tr><td colSpan={9} className='py-16 text-center'>
                  <div className='flex flex-col items-center gap-3'>
                    <div className='w-14 h-14 rounded-2xl flex items-center justify-center' style={{ background: C.redSoft }}>
                      <HiMiniSquare3Stack3D size={26} style={{ color: C.red }} />
                    </div>
                    <p className='text-[14px] font-[600]' style={{ color: C.text }}>{searchQuery ? `No results for "${searchQuery}"` : 'No products found'}</p>
                  </div>
                </td></tr>
              ) : context.products.map(product => (
                <tr key={product._id} style={{ borderBottom:`1px solid ${C.border}` }}
                  onMouseEnter={e => e.currentTarget.style.background = C.hover}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td className='px-4 py-3'>
                    <Checkbox size='small' checked={selectedIds.includes(product._id)} onChange={() => handleSelectOne(product._id)}
                      sx={{ color:C.muted, '&.Mui-checked':{color:C.red}, p:0 }} />
                  </td>
                  <td className='px-4 py-3'>
                    <div className='flex items-center gap-3' style={{ minWidth:'220px' }}>
                      <div className='w-[56px] h-[56px] rounded-xl overflow-hidden flex-shrink-0 border' style={{ borderColor: C.border, background: C.surface }}>
                        {product.images?.[0]
                          ? <LazyLoadImage alt={product.name} src={product.images[0]} effect='blur' className='w-full h-full object-cover' />
                          : <div className='w-full h-full flex items-center justify-center text-[10px]' style={{ color: C.muted }}>No img</div>
                        }
                      </div>
                      <div className='flex-1 min-w-0'>
                        <h3 className='font-[700] text-[13px] line-clamp-2 leading-tight' style={{ color: C.text }}>{product.name}</h3>
                        <span className='text-[11px]' style={{ color: C.muted }}>{product.brand}</span>
                      </div>
                    </div>
                  </td>
                  <td className='px-4 py-3 whitespace-nowrap'><span className='text-[12px]' style={{ color: C.subtle }}>{product.catName || '—'}</span></td>
                  <td className='px-4 py-3 whitespace-nowrap'><span className='text-[12px]' style={{ color: C.subtle }}>{product.subCatName || '—'}</span></td>
                  <td className='px-4 py-3'>
                    <div className='flex flex-col gap-0.5'>
                      {product.oldPrice > product.price && <span className='line-through text-[11px]' style={{ color: C.muted }}>${product.oldPrice}</span>}
                      <span className='font-[700] text-[13px]' style={{ color: C.red }}>${product.price}</span>
                    </div>
                  </td>
                  <td className='px-4 py-3'><span className='text-[12px]' style={{ color: C.subtle }}>{product.sale ?? 0}</span></td>
                  <td className='px-4 py-3'>
                    <span className='inline-flex items-center gap-1 text-[12px] font-[700] px-2 py-1 rounded-lg'
                      style={{ background: product.countInStock > 0 ? 'rgba(34,197,94,0.1)' : 'rgba(245,17,17,0.1)', color: product.countInStock > 0 ? '#22c55e' : '#f87171' }}>
                      {product.countInStock}
                    </span>
                  </td>
                  <td className='px-4 py-3'>
                    <Rating value={product.rating || 0} size='small' readOnly sx={{ '& .MuiRating-iconFilled':{ color: C.red } }} />
                  </td>
                  <td className='px-4 py-3'>
                    <div className='flex items-center gap-1'>
                      <button onClick={() => context.handleOpenFullScreenPanel('Edit Product', product)}
                        className='w-9 h-9 rounded-xl flex items-center justify-center transition-all' style={{ color: C.subtle }}
                        onMouseEnter={e => e.currentTarget.style.background = C.hover} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <AiTwotoneEdit size={16} />
                      </button>
                      <Link to={`/product/${product._id}`} state={{ product }}
                        className='w-9 h-9 rounded-xl flex items-center justify-center transition-all no-underline' style={{ color: C.subtle }}
                        onMouseEnter={e => e.currentTarget.style.background = C.hover} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <LuView size={16} />
                      </Link>
                      <button onClick={() => handleDelete(product._id)}
                        className='w-9 h-9 rounded-xl flex items-center justify-center transition-all' style={{ color:'#f87171' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(248,113,113,0.1)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <MdDeleteSweep size={17} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className='flex items-center justify-between px-5 py-3 border-t flex-wrap gap-3' style={{ borderColor:C.border, background:C.surface }}>
          <div className='flex items-center gap-2'>
            <span className='text-[11px] font-[600] uppercase tracking-wider' style={{ color: C.muted }}>Rows</span>
            {[10,25,50].map(n => (
              <button key={n} onClick={() => { setRowsPerPage(n); setPage(0); setSelectedIds([]) }}
                className='w-8 h-7 rounded-lg text-[12px] font-[700] transition-all'
                style={{ background: rowsPerPage===n ? C.red : C.card, color: rowsPerPage===n ? '#fff' : C.muted, border:`1px solid ${rowsPerPage===n ? C.red : C.border}` }}>
                {n}
              </button>
            ))}
          </div>
          <div className='flex items-center gap-1.5'>
            <span className='text-[12px] mr-1' style={{ color: C.muted }}>
              {totalCount===0 ? '0' : page*rowsPerPage+1}–{Math.min((page+1)*rowsPerPage,totalCount)} of {totalCount}
            </span>
            <button disabled={page===0} onClick={() => { setPage(p=>p-1); setSelectedIds([]) }}
              className='w-8 h-8 rounded-lg flex items-center justify-center text-[14px] font-[700] disabled:opacity-30'
              style={{ background:C.card, color:C.text, border:`1px solid ${C.border}` }}>‹</button>
            {[...Array(Math.min(totalPages,5))].map((_, i) => {
              const pg = Math.max(0, Math.min(page-2, totalPages-5)) + i
              return <button key={pg} onClick={() => { setPage(pg); setSelectedIds([]) }}
                className='w-8 h-8 rounded-lg flex items-center justify-center text-[12px] font-[700] transition-all'
                style={{ background: page===pg ? C.red : C.card, color: page===pg ? '#fff' : C.subtle, border:`1px solid ${page===pg ? C.red : C.border}`, boxShadow: page===pg ? `0 2px 8px ${C.redGlow}` : 'none' }}>
                {pg+1}
              </button>
            })}
            <button disabled={page>=totalPages-1} onClick={() => { setPage(p=>p+1); setSelectedIds([]) }}
              className='w-8 h-8 rounded-lg flex items-center justify-center text-[14px] font-[700] disabled:opacity-30'
              style={{ background:C.card, color:C.text, border:`1px solid ${C.border}` }}>›</button>
          </div>
        </div>
      </div>
    </div>
  )
}
export default Products