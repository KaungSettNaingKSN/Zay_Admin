import React from 'react'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import CircularProgress from '@mui/material/CircularProgress'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import 'react-lazy-load-image-component/src/effects/blur.css'
import { IoCloseOutline } from 'react-icons/io5'
import { deleteData, postData, fetchData } from '../../utils/api'
import { Mycontext } from '../../App'
import UploadBox from '../../components/UploadBox'

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
  background: C.surface, color: C.text, borderRadius:'12px', fontSize:'13px',
  '& .MuiOutlinedInput-notchedOutline': { borderColor: C.border },
  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: C.red },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: C.red },
  '& .MuiSvgIcon-root': { color: C.muted },
}

const menuProps = {
  PaperProps: {
    sx: {
      background: C.card, border:`1px solid ${C.border}`, borderRadius:'12px', mt:0.5,
      '& .MuiMenuItem-root': { color: C.subtle, fontSize:'13px', py:1 },
      '& .MuiMenuItem-root:hover': { background: C.hover, color: C.text },
      '& .MuiMenuItem-root.Mui-selected': { background: C.redSoft, color: C.red },
    }
  }
}

// ── Reusable dark field ───────────────────────────────────────────────────────
const Field = ({ label, children }) => (
  <div className='flex flex-col gap-1.5'>
    <label className='text-[11px] font-[700] uppercase tracking-wider' style={{ color: C.muted }}>{label}</label>
    {children}
  </div>
)

const DarkInput = ({ value, onChange, name, placeholder, type='text', as }) => {
  const [focused, setFocused] = React.useState(false)
  const cls = 'w-full rounded-xl px-4 text-[13px] outline-none transition-all'
  const style = { background:C.surface, color:C.text, border:`1px solid ${focused ? C.borderFocus : C.border}`, boxShadow: focused ? `0 0 0 3px ${C.redSoft}` : 'none' }
  if (as === 'textarea') return (
    <textarea name={name} value={value} onChange={onChange} placeholder={placeholder} rows={5}
      onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
      className={`${cls} py-3 resize-none`} style={style} />
  )
  return (
    <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder}
      onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
      className={`${cls} h-[44px]`} style={style} />
  )
}

// ── Flatten category tree ─────────────────────────────────────────────────────
const flattenAll = (nodes = [], out = []) => {
  for (const n of nodes) { out.push(n); if (n.children?.length) flattenAll(n.children, out) }
  return out
}

const EMPTY_FORM = {
  name:'', description:'', images:[], brand:'', price:'', oldPrice:'',
  catName:'', catId:'', subCatId:'', subCatName:'', thirdsubCatId:'', thirdsubCatName:'',
  countInStock:'', rating:0, isFeatured:false, discount:'',
  productRam:[], productWeight:[], size:[], productColor:[],
}

const AddProduct = () => {
  const context = React.useContext(Mycontext)
  const [isLoading, setIsLoading] = React.useState(false)
  const [category,  setCategory]  = React.useState('')
  const [subcategory,setSubCategory] = React.useState('')
  const [subThirdcategory,setSubThirdCategory] = React.useState('')
  const [preview,   setPreview]   = React.useState([])
  const [formFields,setFormFields]= React.useState(EMPTY_FORM)
  const [ramOptions,   setRamOptions]   = React.useState([])
  const [weightOptions,setWeightOptions]= React.useState([])
  const [sizeOptions,  setSizeOptions]  = React.useState([])
  const [colorOptions, setColorOptions] = React.useState([])

  React.useEffect(() => {
    const load = async () => {
      try {
        const [ram, weight, size, color] = await Promise.all([
          fetchData('/api/product/productRam'), fetchData('/api/product/productWeight'),
          fetchData('/api/product/productSize'), fetchData('/api/product/productColor'),
        ])
        setRamOptions(ram.data?.productRam || []);  setWeightOptions(weight.data?.productWeight || [])
        setSizeOptions(size.data?.productSize || []); setColorOptions(color.data?.productColor || [])
      } catch (e) { console.error('Failed to load options', e) }
    }
    load()
  }, [])

  const hasCategories = (context.categories || []).length > 0
  const allSubcats = React.useMemo(() => {
    const all = flattenAll(context.categories || [])
    return all.filter(x => { if (!x.parentId) return false; const p = all.find(c => c._id === x.parentId); return p && !p.parentId })
  }, [context.categories])
  const thirdLevelCats = React.useMemo(() => {
    if (!subcategory) return []; const all = flattenAll(context.categories || [])
    return all.filter(x => x.parentId === subcategory)
  }, [context.categories, subcategory])

  const handleChangeCategory = e => {
    const val = e.target.value; setCategory(val); setSubCategory(''); setSubThirdCategory('')
    const sel = (context.categories || []).find(c => c._id === val)
    setFormFields(p => ({ ...p, catId:val, catName:sel?.name||'', subCatId:'', subCatName:'', thirdsubCatId:'', thirdsubCatName:'' }))
  }
  const handleChangeSubCategory = e => {
    const val = e.target.value; setSubCategory(val); setSubThirdCategory('')
    const sel = allSubcats.find(c => c._id === val)
    setFormFields(p => ({ ...p, subCatId:val, subCatName:sel?.name||'', thirdsubCatId:'', thirdsubCatName:'' }))
  }
  const handleChangeSubThirdCategory = e => {
    const val = e.target.value; setSubThirdCategory(val)
    const sel = thirdLevelCats.find(c => c._id === val)
    setFormFields(p => ({ ...p, thirdsubCatId:val, thirdsubCatName:sel?.name||'' }))
  }
  const onChangeInput = e => setFormFields(p => ({ ...p, [e.target.name]: e.target.value }))

  const handleRemovePreview = async imgUrl => {
    try {
      setPreview(p => p.filter(x => x !== imgUrl))
      setFormFields(p => ({ ...p, images: p.images.filter(x => x !== imgUrl) }))
      await deleteData(`/api/product/delete-image?img=${encodeURIComponent(imgUrl)}`)
      context.openAlertBox('success', 'Image removed')
    } catch (error) { context.openAlertBox('error', error.message || 'Remove failed') }
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!formFields.name) return context.openAlertBox('error', 'Please enter name')
    if (!formFields.description) return context.openAlertBox('error', 'Please enter description')
    if (formFields.images.length === 0) return context.openAlertBox('error', 'Please upload at least one image')
    try {
      setIsLoading(true)
      const response = await postData('/api/product/create', formFields)
      context.openAlertBox('success', response.message)
      await context.reloadProducts()
      setFormFields(EMPTY_FORM); setPreview([]); setCategory(''); setSubCategory(''); setSubThirdCategory('')
    } catch (error) { context.openAlertBox('error', error.message) }
    finally { setIsLoading(false); context.setIsOpenFullScreenPanel({ open:false, model:null }) }
  }

  const filteredSubcats = allSubcats.filter(c => c.parentId === category)

  return (
    <section className='p-5 min-h-screen' style={{ background: C.bg }}>
      <form onSubmit={handleSubmit} className='flex flex-col gap-5 max-w-5xl mx-auto'>

        {/* Name + Description */}
        <div className='rounded-2xl border p-5 flex flex-col gap-4' style={{ background:C.card, borderColor:C.border }}>
          <p className='text-[12px] font-[700] uppercase tracking-wider' style={{ color:C.muted }}>Basic Info</p>
          <Field label='Product Name'><DarkInput name='name' value={formFields.name} onChange={onChangeInput} placeholder='Enter product name' /></Field>
          <Field label='Description'><DarkInput as='textarea' name='description' value={formFields.description} onChange={onChangeInput} placeholder='Describe the product…' /></Field>
        </div>

        {/* Categories + Price */}
        <div className='rounded-2xl border p-5 flex flex-col gap-4' style={{ background:C.card, borderColor:C.border }}>
          <p className='text-[12px] font-[700] uppercase tracking-wider' style={{ color:C.muted }}>Categories & Pricing</p>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
            <Field label='Category'>
              <Select size='small' value={category} onChange={handleChangeCategory} displayEmpty disabled={!hasCategories} sx={selectSx} MenuProps={menuProps}>
                <MenuItem value='' disabled><span style={{ color:C.muted }}>{hasCategories ? 'Select' : 'No categories'}</span></MenuItem>
                {(context.categories||[]).map(c => <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>)}
              </Select>
            </Field>
            <Field label='Sub Category'>
              <Select size='small' value={subcategory} onChange={handleChangeSubCategory} displayEmpty disabled={!category || filteredSubcats.length===0} sx={selectSx} MenuProps={menuProps}>
                <MenuItem value='' disabled><span style={{ color:C.muted }}>{filteredSubcats.length===0 ? 'No subcats' : 'Select'}</span></MenuItem>
                {filteredSubcats.map(c => <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>)}
              </Select>
            </Field>
            <Field label='Third Level'>
              <Select size='small' value={subThirdcategory} onChange={handleChangeSubThirdCategory} displayEmpty disabled={!subcategory || thirdLevelCats.length===0} sx={selectSx} MenuProps={menuProps}>
                <MenuItem value='' disabled><span style={{ color:C.muted }}>{thirdLevelCats.length===0 ? 'No third level' : 'Select'}</span></MenuItem>
                {thirdLevelCats.map(c => <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>)}
              </Select>
            </Field>
            <Field label='Price'><DarkInput name='price' value={formFields.price} onChange={onChangeInput} placeholder='0.00' /></Field>
          </div>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
            <Field label='Old Price'><DarkInput name='oldPrice' value={formFields.oldPrice} onChange={onChangeInput} placeholder='0.00' /></Field>
            <Field label='Is Featured'>
              <Select size='small' value={String(formFields.isFeatured)} onChange={e => setFormFields(p => ({ ...p, isFeatured: e.target.value==='true' }))} sx={selectSx} MenuProps={menuProps}>
                <MenuItem value='true'>Yes</MenuItem>
                <MenuItem value='false'>No</MenuItem>
              </Select>
            </Field>
            <Field label='Stock'><DarkInput name='countInStock' value={formFields.countInStock} onChange={onChangeInput} placeholder='0' /></Field>
            <Field label='Brand'><DarkInput name='brand' value={formFields.brand} onChange={onChangeInput} placeholder='e.g. Apple' /></Field>
          </div>
        </div>

        {/* Variants */}
        <div className='rounded-2xl border p-5 flex flex-col gap-4' style={{ background:C.card, borderColor:C.border }}>
          <p className='text-[12px] font-[700] uppercase tracking-wider' style={{ color:C.muted }}>Variants</p>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
            <Field label='Discount'><DarkInput name='discount' value={formFields.discount} onChange={onChangeInput} placeholder='0%' /></Field>
            <Field label='RAM'>
              <Select size='small' multiple value={formFields.productRam} onChange={e => setFormFields(p => ({ ...p, productRam: e.target.value }))} displayEmpty sx={selectSx} MenuProps={menuProps}>
                <MenuItem value='' disabled><span style={{ color:C.muted }}>Select RAM</span></MenuItem>
                {ramOptions.map(r => <MenuItem key={r._id} value={r.name}>{r.name}</MenuItem>)}
              </Select>
            </Field>
            <Field label='Weight'>
              <Select size='small' multiple value={formFields.productWeight} onChange={e => setFormFields(p => ({ ...p, productWeight: e.target.value }))} displayEmpty sx={selectSx} MenuProps={menuProps}>
                <MenuItem value='' disabled><span style={{ color:C.muted }}>Select Weight</span></MenuItem>
                {weightOptions.map(w => <MenuItem key={w._id} value={w.name}>{w.name}</MenuItem>)}
              </Select>
            </Field>
            <Field label='Size'>
              <Select size='small' multiple value={formFields.size} onChange={e => setFormFields(p => ({ ...p, size: e.target.value }))} displayEmpty sx={selectSx} MenuProps={menuProps}>
                <MenuItem value='' disabled><span style={{ color:C.muted }}>Select Size</span></MenuItem>
                {sizeOptions.map(s => <MenuItem key={s._id} value={s.name}>{s.name}</MenuItem>)}
              </Select>
            </Field>
          </div>
          {/* Color */}
          <Field label='Colors'>
            <Select size='small' multiple value={formFields.productColor}
              onChange={e => setFormFields(p => ({ ...p, productColor: e.target.value }))}
              displayEmpty sx={selectSx} MenuProps={menuProps}
              renderValue={selected => selected.length === 0
                ? <span style={{ color:C.muted }}>Select Colors</span>
                : <div className='flex flex-wrap gap-1'>
                    {selected.map(_id => {
                      const found = colorOptions.find(c => c._id === _id)
                      return <div key={_id} className='flex items-center gap-1 rounded-full px-2 py-0.5' style={{ background:C.surface, border:`1px solid ${C.border}` }}>
                        <div className='w-3 h-3 rounded-full flex-shrink-0' style={{ background: found?.color||'#ccc' }} />
                        <span className='text-[11px]' style={{ color:C.text }}>{found?.name||_id}</span>
                      </div>
                    })}
                  </div>
              }>
              {colorOptions.map(c => (
                <MenuItem key={c._id} value={c._id}>
                  <div className='flex items-center gap-2'>
                    <div className='w-[18px] h-[18px] rounded-full border flex-shrink-0' style={{ background:c.color, borderColor:C.border }} />
                    <span>{c.name}</span>
                    <span className='text-[11px] ml-1' style={{ color:C.muted }}>{c.color}</span>
                  </div>
                </MenuItem>
              ))}
            </Select>
          </Field>
        </div>

        {/* Images */}
        <div className='rounded-2xl border p-5 flex flex-col gap-4' style={{ background:C.card, borderColor:C.border }}>
          <p className='text-[12px] font-[700] uppercase tracking-wider' style={{ color:C.muted }}>Product Images</p>
          <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-3'>
            {preview.map(img => (
              <div key={img} className='relative group aspect-square rounded-xl overflow-hidden border' style={{ borderColor:C.border }}>
                <button onClick={() => handleRemovePreview(img)} type='button'
                  className='absolute top-1 right-1 w-6 h-6 rounded-full flex items-center justify-center z-10 transition-all'
                  style={{ background:C.red }}>
                  <IoCloseOutline size={14} className='text-white' />
                </button>
                <LazyLoadImage className='w-full h-full object-cover' effect='blur' alt='' src={img} />
              </div>
            ))}
            <UploadBox setPreview={setPreview} multiple={true} name='images'
              previousImage={preview?.[0]} apiEndPoint='/api/product/uploadImages'
              onRemovePrevious={async imgUrl => await deleteData(`/api/product/delete-image?img=${encodeURIComponent(imgUrl)}`)}
              onUploadSuccess={(imgs, allowMultiple) => setFormFields(p => ({ ...p, images: allowMultiple ? [...p.images,...imgs] : imgs }))} />
          </div>
        </div>

        {/* Submit */}
        <button type='submit' disabled={isLoading}
          className='h-[50px] rounded-xl font-[700] text-[15px] text-white flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50 !mb-10'
          style={{ background:`linear-gradient(135deg,#ff4444 0%,${C.red} 100%)`, boxShadow:`0 6px 20px ${C.redGlow}` }}>
          {isLoading ? <><CircularProgress size={20} color='inherit' /> Adding Product…</> : 'Add Product'}
        </button>
      </form>
    </section>
  )
}
export default AddProduct