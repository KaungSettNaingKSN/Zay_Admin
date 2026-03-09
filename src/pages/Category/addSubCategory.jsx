import React from 'react'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import CircularProgress from '@mui/material/CircularProgress'
import { MdCategory } from 'react-icons/md'
import { postData } from '../../utils/api'
import { Mycontext } from '../../App'

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
  background:C.surface, color:C.text, borderRadius:'12px', fontSize:'13px',
  '& .MuiOutlinedInput-notchedOutline':{ borderColor:C.border },
  '&:hover .MuiOutlinedInput-notchedOutline':{ borderColor:C.red },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline':{ borderColor:C.red },
  '& .MuiSvgIcon-root':{ color:C.muted },
}
const menuProps = { PaperProps:{ sx:{
  background:C.card, border:`1px solid ${C.border}`, borderRadius:'12px', mt:0.5,
  '& .MuiMenuItem-root':{ color:C.subtle, fontSize:'13px', py:1 },
  '& .MuiMenuItem-root:hover':{ background:C.hover, color:C.text },
  '& .MuiMenuItem-root.Mui-selected':{ background:C.redSoft, color:C.red },
}}}

const DarkInput = ({ value, onChange, name, placeholder }) => {
  const [focused, setFocused] = React.useState(false)
  return (
    <input name={name} value={value} onChange={onChange} placeholder={placeholder}
      onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
      className='w-full h-[44px] rounded-xl px-4 text-[14px] outline-none transition-all'
      style={{ background:C.surface, color:C.text, border:`1px solid ${focused ? C.borderFocus : C.border}`, boxShadow: focused ? `0 0 0 3px ${C.redSoft}` : 'none' }} />
  )
}

const Field = ({ label, children }) => (
  <div className='flex flex-col gap-1.5'>
    <label className='text-[11px] font-[700] uppercase tracking-wider' style={{ color: C.muted }}>{label}</label>
    {children}
  </div>
)

const flattenAll = (nodes = [], out = []) => {
  for (const n of nodes) { out.push(n); if (n.children?.length) flattenAll(n.children, out) }
  return out
}

const AddSubCategory = () => {
  const context = React.useContext(Mycontext)
  const [isLoading, setIsLoading] = React.useState(false)

  const [subFormFields,   setSubFormFields]   = React.useState({ name:'', parentId:null, parentCatName:null })
  const [subcategory,     setSubCategory]     = React.useState('')
  const [thirdFormFields, setThirdFormFields] = React.useState({ name:'', parentId:null, parentCatName:null })
  const [subThirdcategory,setSubThirdCategory]= React.useState('')

  const allSubcats = React.useMemo(() => {
    const all = flattenAll(context.categories || [])
    return all.filter(x => { if (!x.parentId) return false; const p = all.find(c => c._id === x.parentId); return p && !p.parentId })
  }, [context.categories])

  const handleChangeSubCategory = e => {
    setSubCategory(e.target.value)
    const sel = (context.categories || []).find(c => c._id === e.target.value)
    setSubFormFields(p => ({ ...p, parentId: e.target.value, parentCatName: sel?.name || null }))
  }
  const onChangeSubInput = e => setSubFormFields(p => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    if (subFormFields.name === '') return context.openAlertBox('error', 'Please enter category name')
    try {
      setIsLoading(true)
      const response = await postData('/api/category/create', { name: subFormFields.name, parentId: subFormFields.parentId, parentCatName: subFormFields.parentCatName }, { withCredentials: true })
      context.openAlertBox('success', response.message)
      setSubFormFields({ name:'', parentId:null, parentCatName:null }); setSubCategory('')
      context.reloadCategories()
    } catch (error) { context.openAlertBox('error', error.message) }
    finally { setIsLoading(false); context.setIsOpenFullScreenPanel({ open:false, model:null }) }
  }

  const handleChangeSubThirdCategory = e => {
    setSubThirdCategory(e.target.value)
    const sel = allSubcats.find(c => c._id === e.target.value)
    setThirdFormFields(p => ({ ...p, parentId: e.target.value, parentCatName: sel?.name || null }))
  }
  const onChangeThirdInput = e => setThirdFormFields(p => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit2 = async e => {
    e.preventDefault()
    if (thirdFormFields.name === '') return context.openAlertBox('error', 'Please enter category name')
    try {
      setIsLoading(true)
      const response = await postData('/api/category/create', { name: thirdFormFields.name, parentId: thirdFormFields.parentId, parentCatName: thirdFormFields.parentCatName }, { withCredentials: true })
      context.openAlertBox('success', response.message)
      setThirdFormFields({ name:'', parentId:null, parentCatName:null }); setSubThirdCategory('')
      context.reloadCategories()
    } catch (error) { context.openAlertBox('error', error.message) }
    finally { setIsLoading(false); context.setIsOpenFullScreenPanel({ open:false, model:null }) }
  }

  return (
    <section className='p-5 min-h-screen' style={{ background: C.bg }}>
      <div className='fixed pointer-events-none' style={{ width:'500px', height:'500px', borderRadius:'50%', background:`radial-gradient(circle, ${C.redGlow} 0%, transparent 70%)`, top:'-150px', right:'-100px', opacity:0.2, zIndex:0 }} />

      <div className='relative z-10 grid grid-cols-1 md:grid-cols-2 gap-5'>

        {/* ── Sub Category ── */}
        <form onSubmit={handleSubmit} className='flex flex-col gap-5'>
          <div className='flex items-center gap-3'>
            <div className='w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0' style={{ background: C.redSoft }}>
              <MdCategory size={18} style={{ color: C.red }} />
            </div>
            <div>
              <h2 className='text-[18px] font-[900] tracking-tight' style={{ color: C.text }}>Add Sub Category</h2>
              <p className='text-[12px]' style={{ color: C.muted }}>Second level category</p>
            </div>
          </div>

          <div className='rounded-2xl border p-5 flex flex-col gap-4' style={{ background: C.card, borderColor: C.border }}>
            <Field label='Parent Category'>
              <Select size='small' value={subcategory} onChange={handleChangeSubCategory} defaultValue=''
                sx={selectSx} MenuProps={menuProps}>
                {(context.categories || []).map(cat => (
                  <MenuItem key={cat._id} value={cat._id}>{cat.name}</MenuItem>
                ))}
              </Select>
            </Field>
            <Field label='Sub Category Name'>
              <DarkInput name='name' value={subFormFields.name} onChange={onChangeSubInput} placeholder='e.g. Smartphones' />
            </Field>
          </div>

          <button type='submit' disabled={isLoading}
            className='h-[48px] rounded-xl font-[700] text-[14px] text-white flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50'
            style={{ background:`linear-gradient(135deg,#ff4444 0%,${C.red} 100%)`, boxShadow:`0 4px 14px ${C.redGlow}` }}>
            {isLoading ? <><CircularProgress size={18} color='inherit' /> Adding…</> : 'Add Sub Category'}
          </button>
        </form>

        {/* ── Divider on mobile ── */}
        <div className='block md:hidden h-px w-full' style={{ background: C.border }} />

        {/* ── Third Level ── */}
        <form onSubmit={handleSubmit2} className='flex flex-col gap-5'>
          <div className='flex items-center gap-3'>
            <div className='w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0' style={{ background:'rgba(99,102,241,0.12)' }}>
              <MdCategory size={18} style={{ color:'#818cf8' }} />
            </div>
            <div>
              <h2 className='text-[18px] font-[900] tracking-tight' style={{ color: C.text }}>Third Level Category</h2>
              <p className='text-[12px]' style={{ color: C.muted }}>Third level category</p>
            </div>
          </div>

          <div className='rounded-2xl border p-5 flex flex-col gap-4' style={{ background: C.card, borderColor: C.border }}>
            <Field label='Sub Category'>
              <Select size='small' value={subThirdcategory} onChange={handleChangeSubThirdCategory} defaultValue='' displayEmpty
                sx={selectSx} MenuProps={menuProps}>
                {allSubcats.map(cat => (
                  <MenuItem key={cat._id} value={cat._id}>{cat.name}</MenuItem>
                ))}
              </Select>
            </Field>
            <Field label='Third Level Name'>
              <DarkInput name='name' value={thirdFormFields.name} onChange={onChangeThirdInput} placeholder='e.g. iPhone' />
            </Field>
          </div>

          <button type='submit' disabled={isLoading}
            className='h-[48px] rounded-xl font-[700] text-[14px] text-white flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50'
            style={{ background:'linear-gradient(135deg,#6366f1,#4f46e5)', boxShadow:'0 4px 14px rgba(99,102,241,0.3)' }}>
            {isLoading ? <><CircularProgress size={18} color='inherit' /> Adding…</> : 'Add Third Level'}
          </button>
        </form>

      </div>
    </section>
  )
}
export default AddSubCategory