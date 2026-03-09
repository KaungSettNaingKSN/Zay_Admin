import React from 'react'
import CircularProgress from '@mui/material/CircularProgress'
import { AiTwotoneEdit } from 'react-icons/ai'
import { MdDeleteSweep } from 'react-icons/md'
import { IoColorPaletteOutline } from 'react-icons/io5'
import { fetchData, postData, putData, deleteData } from '../../utils/api'
import { Mycontext } from '../../App'

const C = {
  bg:'#0a0a0f', surface:'#111118', card:'#16161f', hover:'rgba(255,255,255,0.025)',
  border:'rgba(255,255,255,0.08)', borderFocus:'rgba(245,17,17,0.5)',
  red:'#f51111', redSoft:'rgba(245,17,17,0.1)', redGlow:'rgba(245,17,17,0.25)',
  text:'#f0f0f5', muted:'#6b7280', subtle:'#9ca3af',
}

const DarkInput = ({ value, onChange, placeholder, name, autoFocus, style: extraStyle }) => {
  const [focused, setFocused] = React.useState(false)
  return (
    <input autoFocus={autoFocus} name={name} value={value} onChange={onChange} placeholder={placeholder}
      onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
      className='h-[44px] rounded-xl px-4 text-[14px] outline-none transition-all'
      style={{ background:C.surface, color:C.text, border:`1px solid ${focused ? C.borderFocus : C.border}`, boxShadow: focused ? `0 0 0 3px ${C.redSoft}` : 'none', ...extraStyle }} />
  )
}

const AddColor = () => {
  const context = React.useContext(Mycontext)
  const [isLoading, setIsLoading] = React.useState(false)
  const [colorList, setColorList] = React.useState([])
  const [editingId, setEditingId] = React.useState(null)
  const [editValue, setEditValue] = React.useState({ name: '', color: '#000000' })
  const [formFields,setFormFields]= React.useState({ name: '', color: '#ff0000' })

  const loadColors = async () => {
    try { const res = await fetchData('/api/product/productColor'); setColorList(res.data?.productColor || []) }
    catch (e) { context.openAlertBox('error', e?.message || 'Failed to load') }
  }
  React.useEffect(() => { loadColors() }, [])

  const onChangeInput = e => setFormFields(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    if (!formFields.name.trim()) return context.openAlertBox('error', 'Please enter color name')
    try {
      setIsLoading(true)
      await postData('/api/product/addProductColor', { name: formFields.name, color: formFields.color })
      context.openAlertBox('success', 'Color added')
      setFormFields({ name: '', color: '#ff0000' })
      await loadColors()
    } catch (error) { context.openAlertBox('error', error?.message || 'Failed') }
    finally { setIsLoading(false) }
  }

  const handleUpdate = async id => {
    if (!editValue.name.trim()) return context.openAlertBox('error', 'Please enter color name')
    try {
      await putData(`/api/product/updateProductColor/${id}`, editValue)
      context.openAlertBox('success', 'Color updated'); setEditingId(null); await loadColors()
    } catch (error) { context.openAlertBox('error', error?.message || 'Failed') }
  }

  const handleDelete = async id => {
    try { await deleteData(`/api/product/productColor/${id}`); context.openAlertBox('success', 'Color deleted'); await loadColors() }
    catch (error) { context.openAlertBox('error', error?.message || 'Failed') }
  }

  return (
    <section className='p-5 min-h-screen' style={{ background: C.bg }}>
      <div className='fixed pointer-events-none' style={{ width:'500px', height:'500px', borderRadius:'50%', background:`radial-gradient(circle, ${C.redGlow} 0%, transparent 70%)`, top:'-150px', right:'-100px', opacity:0.2, zIndex:0 }} />

      <div className='relative z-10 max-w-2xl mx-auto flex flex-col gap-6'>
        {/* Header */}
        <div className='flex items-center gap-3 mt-4'>
          <div className='w-10 h-10 rounded-xl flex items-center justify-center' style={{ background: C.redSoft }}>
            <IoColorPaletteOutline size={20} style={{ color: C.red }} />
          </div>
          <div>
            <h1 className='text-[20px] font-[900] tracking-tight' style={{ color: C.text }}>Product Colors</h1>
            <p className='text-[12px]' style={{ color: C.muted }}>{colorList.length} colors added</p>
          </div>
        </div>

        {/* Add form */}
        <div className='rounded-2xl border p-5 flex flex-col gap-4' style={{ background: C.card, borderColor: C.border }}>
          <p className='text-[12px] font-[700] uppercase tracking-wider' style={{ color: C.muted }}>Add New Color</p>
          <form onSubmit={handleSubmit} className='flex flex-col gap-3'>
            <div className='flex gap-3 flex-wrap'>
              {/* Name */}
              <div className='flex-1 min-w-[150px] flex flex-col gap-1.5'>
                <label className='text-[11px] font-[600] uppercase tracking-wider' style={{ color: C.muted }}>Color Name</label>
                <DarkInput name='name' value={formFields.name} onChange={onChangeInput} placeholder='e.g. Red' style={{ width:'100%' }} />
              </div>
              {/* Picker */}
              <div className='flex flex-col gap-1.5'>
                <label className='text-[11px] font-[600] uppercase tracking-wider' style={{ color: C.muted }}>Pick Color</label>
                <div className='flex items-center gap-2'>
                  {/* Color input styled */}
                  <div className='relative w-[44px] h-[44px] rounded-xl overflow-hidden border cursor-pointer' style={{ borderColor: C.border }}>
                    <input type='color' name='color' value={formFields.color} onChange={onChangeInput}
                      className='absolute inset-0 w-full h-full cursor-pointer opacity-0' />
                    <div className='w-full h-full rounded-xl' style={{ background: formFields.color }} />
                  </div>
                  <DarkInput name='color' value={formFields.color} onChange={onChangeInput} placeholder='#000000' style={{ width:'110px' }} />
                  {/* Swatch preview */}
                  <div className='w-[44px] h-[44px] rounded-xl border flex-shrink-0' style={{ background: formFields.color, borderColor: C.border }} />
                </div>
              </div>
            </div>
            <button type='submit' disabled={isLoading}
              className='h-[44px] px-6 rounded-xl font-[700] text-[14px] text-white flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 self-start'
              style={{ background:`linear-gradient(135deg,#ff4444 0%,${C.red} 100%)`, boxShadow:`0 4px 14px ${C.redGlow}` }}>
              {isLoading ? <CircularProgress size={18} color='inherit' /> : 'Add Color'}
            </button>
          </form>
        </div>

        {/* List */}
        <div className='rounded-2xl border overflow-hidden' style={{ background: C.card, borderColor: C.border }}>
          {colorList.length === 0 ? (
            <div className='flex flex-col items-center justify-center py-14 gap-3'>
              <div className='w-12 h-12 rounded-2xl flex items-center justify-center' style={{ background: C.redSoft }}><IoColorPaletteOutline size={22} style={{ color: C.red }} /></div>
              <p className='text-[13px]' style={{ color: C.muted }}>No colors added yet</p>
            </div>
          ) : (
            <ul>
              {colorList.map((item, i) => (
                <li key={item._id} className='flex items-center justify-between px-5 py-3 transition-colors'
                  style={{ borderBottom: i < colorList.length - 1 ? `1px solid ${C.border}` : 'none' }}
                  onMouseEnter={e => e.currentTarget.style.background = C.hover}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  {editingId === item._id ? (
                    <div className='flex items-center gap-3 flex-1 flex-wrap'>
                      <DarkInput autoFocus value={editValue.name} onChange={e => setEditValue(p => ({ ...p, name: e.target.value }))} placeholder='Color name' style={{ width:'140px' }} />
                      <div className='relative w-[36px] h-[36px] rounded-lg overflow-hidden border cursor-pointer' style={{ borderColor: C.border }}>
                        <input type='color' value={editValue.color} onChange={e => setEditValue(p => ({ ...p, color: e.target.value }))} className='absolute inset-0 w-full h-full cursor-pointer opacity-0' />
                        <div className='w-full h-full rounded-lg' style={{ background: editValue.color }} />
                      </div>
                      <DarkInput value={editValue.color} onChange={e => setEditValue(p => ({ ...p, color: e.target.value }))} placeholder='#000000' style={{ width:'100px' }} />
                      <div className='w-8 h-8 rounded-full border flex-shrink-0' style={{ background: editValue.color, borderColor: C.border }} />
                      <div className='flex gap-2'>
                        <button onClick={() => handleUpdate(item._id)} className='h-[36px] px-4 rounded-xl text-[12px] font-[700] text-white' style={{ background:'linear-gradient(135deg,#22c55e,#16a34a)' }}>Save</button>
                        <button onClick={() => setEditingId(null)} className='h-[36px] px-4 rounded-xl text-[12px] font-[600]' style={{ background:C.surface, color:C.muted, border:`1px solid ${C.border}` }}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className='flex items-center gap-3'>
                        <div className='w-9 h-9 rounded-full border-2 flex-shrink-0 shadow-lg'
                          style={{ background: item.color || '#ccc', borderColor: 'rgba(255,255,255,0.15)', boxShadow: `0 0 12px ${item.color}55` }} />
                        <div>
                          <span className='text-[14px] font-[600]' style={{ color: C.text }}>{item.name}</span>
                          <p className='text-[11px]' style={{ color: C.muted }}>{item.color}</p>
                        </div>
                      </div>
                      <div className='flex items-center gap-1'>
                        <button onClick={() => { setEditingId(item._id); setEditValue({ name: item.name, color: item.color || '#000000' }) }}
                          className='w-9 h-9 rounded-xl flex items-center justify-center transition-all' style={{ color: C.subtle }}
                          onMouseEnter={e => e.currentTarget.style.background = C.hover} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}><AiTwotoneEdit size={16} /></button>
                        <button onClick={() => handleDelete(item._id)}
                          className='w-9 h-9 rounded-xl flex items-center justify-center transition-all' style={{ color:'#f87171' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(248,113,113,0.1)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}><MdDeleteSweep size={17} /></button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  )
}
export default AddColor