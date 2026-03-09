import React from 'react'
import CircularProgress from '@mui/material/CircularProgress'
import { AiTwotoneEdit } from 'react-icons/ai'
import { MdDeleteSweep } from 'react-icons/md'
import { HiOutlineChip } from 'react-icons/hi'
import { fetchData, postData, putData, deleteData } from '../../utils/api'
import { Mycontext } from '../../App'

const C = {
  bg:'#0a0a0f', surface:'#111118', card:'#16161f', hover:'rgba(255,255,255,0.025)',
  border:'rgba(255,255,255,0.08)', borderFocus:'rgba(245,17,17,0.5)',
  red:'#f51111', redSoft:'rgba(245,17,17,0.1)', redGlow:'rgba(245,17,17,0.25)',
  text:'#f0f0f5', muted:'#6b7280', subtle:'#9ca3af',
}

const DarkInput = ({ value, onChange, placeholder, name, autoFocus }) => {
  const [focused, setFocused] = React.useState(false)
  return (
    <input
      autoFocus={autoFocus}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      className='w-full h-[44px] rounded-xl px-4 text-[14px] outline-none transition-all'
      style={{
        background: C.surface, color: C.text,
        border: `1px solid ${focused ? C.borderFocus : C.border}`,
        boxShadow: focused ? `0 0 0 3px ${C.redSoft}` : 'none',
      }}
    />
  )
}

const AddRam = () => {
  const context = React.useContext(Mycontext)
  const [isLoading, setIsLoading] = React.useState(false)
  const [ramList,   setRamList]   = React.useState([])
  const [editingId, setEditingId] = React.useState(null)
  const [formFields,setFormFields]= React.useState({ name: '' })
  const [editValue, setEditValue] = React.useState('')

  const loadRam = async () => {
    try {
      const res = await fetchData('/api/product/productRam')
      setRamList(res.data?.productRam || res.data || [])
    } catch (e) { context.openAlertBox('error', e?.message || 'Failed to load') }
  }
  React.useEffect(() => { loadRam() }, [])

  const onChangeInput = e => setFormFields(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    if (!formFields.name.trim()) return context.openAlertBox('error', 'Please enter RAM value')
    try {
      setIsLoading(true)
      await postData('/api/product/addProductRam', { name: formFields.name })
      context.openAlertBox('success', 'RAM added')
      setFormFields({ name: '' })
      await loadRam()
    } catch (error) { context.openAlertBox('error', error?.message || 'Failed') }
    finally { setIsLoading(false) }
  }

  const handleUpdate = async id => {
    if (!editValue.trim()) return context.openAlertBox('error', 'Please enter RAM value')
    try {
      await putData(`/api/product/updateProductRam/${id}`, { name: editValue })
      context.openAlertBox('success', 'RAM updated')
      setEditingId(null)
      await loadRam()
    } catch (error) { context.openAlertBox('error', error?.message || 'Failed') }
  }

  const handleDelete = async id => {
    try {
      await deleteData(`/api/product/productRam/${id}`)
      context.openAlertBox('success', 'RAM deleted')
      await loadRam()
    } catch (error) { context.openAlertBox('error', error?.message || 'Failed') }
  }

  return (
    <section className='p-5 min-h-screen' style={{ background: C.bg }}>
      {/* Glow */}
      <div className='fixed pointer-events-none' style={{
        width:'500px', height:'500px', borderRadius:'50%',
        background:`radial-gradient(circle, ${C.redGlow} 0%, transparent 70%)`,
        top:'-150px', right:'-100px', opacity:0.2, zIndex:0,
      }} />

      <div className='relative z-10 max-w-2xl mx-auto flex flex-col gap-6'>
        {/* Header */}
        <div className='flex items-center gap-3 mt-4'>
          <div className='w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0'
            style={{ background: C.redSoft }}>
            <HiOutlineChip size={20} style={{ color: C.red }} />
          </div>
          <div>
            <h1 className='text-[20px] font-[900] tracking-tight' style={{ color: C.text }}>Product RAM</h1>
            <p className='text-[12px]' style={{ color: C.muted }}>{ramList.length} values added</p>
          </div>
        </div>

        {/* Add form */}
        <div className='rounded-2xl border p-5 flex flex-col gap-4'
          style={{ background: C.card, borderColor: C.border }}>
          <p className='text-[12px] font-[700] uppercase tracking-wider' style={{ color: C.muted }}>Add New</p>
          <form onSubmit={handleSubmit} className='flex gap-3 flex-wrap'>
            <div className='flex-1 min-w-[180px]'>
              <DarkInput name='name' value={formFields.name} onChange={onChangeInput} placeholder='e.g. 8GB' />
            </div>
            <button type='submit' disabled={isLoading}
              className='h-[44px] px-6 rounded-xl font-[700] text-[14px] text-white flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50'
              style={{ background:`linear-gradient(135deg,#ff4444 0%,${C.red} 100%)`, boxShadow:`0 4px 14px ${C.redGlow}` }}>
              {isLoading ? <CircularProgress size={18} color='inherit' /> : 'Add RAM'}
            </button>
          </form>
        </div>

        {/* List */}
        <div className='rounded-2xl border overflow-hidden' style={{ background: C.card, borderColor: C.border }}>
          {ramList.length === 0 ? (
            <div className='flex flex-col items-center justify-center py-14 gap-3'>
              <div className='w-12 h-12 rounded-2xl flex items-center justify-center' style={{ background: C.redSoft }}>
                <HiOutlineChip size={22} style={{ color: C.red }} />
              </div>
              <p className='text-[13px]' style={{ color: C.muted }}>No RAM values added yet</p>
            </div>
          ) : (
            <ul>
              {ramList.map((ram, i) => (
                <li key={ram._id}
                  className='flex items-center justify-between px-5 py-3 transition-colors'
                  style={{
                    borderBottom: i < ramList.length - 1 ? `1px solid ${C.border}` : 'none',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = C.hover}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  {editingId === ram._id ? (
                    <div className='flex items-center gap-3 flex-1 flex-wrap'>
                      <div className='flex-1 min-w-[160px]'>
                        <DarkInput autoFocus value={editValue}
                          onChange={e => setEditValue(e.target.value)} placeholder='RAM value' />
                      </div>
                      <div className='flex gap-2'>
                        <button onClick={() => handleUpdate(ram._id)}
                          className='h-[36px] px-4 rounded-xl text-[12px] font-[700] text-white transition-all'
                          style={{ background:`linear-gradient(135deg,#22c55e,#16a34a)` }}>Save</button>
                        <button onClick={() => setEditingId(null)}
                          className='h-[36px] px-4 rounded-xl text-[12px] font-[600] transition-all'
                          style={{ background: C.surface, color: C.muted, border:`1px solid ${C.border}` }}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className='flex items-center gap-3'>
                        <div className='w-8 h-8 rounded-lg flex items-center justify-center'
                          style={{ background: C.redSoft }}>
                          <HiOutlineChip size={14} style={{ color: C.red }} />
                        </div>
                        <span className='text-[14px] font-[600]' style={{ color: C.text }}>{ram.name}</span>
                      </div>
                      <div className='flex items-center gap-1'>
                        <button onClick={() => { setEditingId(ram._id); setEditValue(ram.name) }}
                          className='w-9 h-9 rounded-xl flex items-center justify-center transition-all'
                          style={{ color: C.subtle, background:'transparent' }}
                          onMouseEnter={e => e.currentTarget.style.background = C.hover}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          <AiTwotoneEdit size={16} />
                        </button>
                        <button onClick={() => handleDelete(ram._id)}
                          className='w-9 h-9 rounded-xl flex items-center justify-center transition-all'
                          style={{ color:'#f87171', background:'transparent' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(248,113,113,0.1)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          <MdDeleteSweep size={17} />
                        </button>
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

export default AddRam