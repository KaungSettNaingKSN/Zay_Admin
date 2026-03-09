import React, { useState, useContext } from 'react'
import UploadBox from '../../components/UploadBox'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import 'react-lazy-load-image-component/src/effects/blur.css'
import { IoCloseOutline } from 'react-icons/io5'
import { MdCategory } from 'react-icons/md'
import CircularProgress from '@mui/material/CircularProgress'
import { deleteData, postData } from '../../utils/api'
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

const DarkInput = ({ value, onChange, name, placeholder, disabled }) => {
  const [focused, setFocused] = React.useState(false)
  return (
    <input name={name} value={value} onChange={onChange} placeholder={placeholder} disabled={disabled}
      onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
      className='w-full h-[44px] rounded-xl px-4 text-[14px] outline-none transition-all disabled:opacity-50'
      style={{ background:C.surface, color:C.text, border:`1px solid ${focused ? C.borderFocus : C.border}`, boxShadow: focused ? `0 0 0 3px ${C.redSoft}` : 'none' }} />
  )
}

const AddCategory = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [preview,   setPreview]   = useState([])
  const context = useContext(Mycontext)
  const [formFields, setFormFields] = useState({ name: '', images: [] })

  const onChangeInput = e => {
    const { name, value } = e.target
    setFormFields(prev => ({ ...prev, [name]: value }))
  }

  const handleRemovePreview = async imgUrl => {
    try {
      setPreview(prev => prev.filter(x => x !== imgUrl))
      setFormFields(prev => ({ ...prev, images: prev.images.filter(x => x !== imgUrl) }))
      await deleteData(`/api/category/delete-image?img=${encodeURIComponent(imgUrl)}`)
      context.openAlertBox('success', 'Image removed')
    } catch (error) { context.openAlertBox('error', error.message || 'Remove failed') }
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setIsLoading(true)
    if (formFields.name === '') { context.openAlertBox('error', 'Please enter category name'); setIsLoading(false); return }
    if (formFields.images.length === 0) { context.openAlertBox('error', 'Please upload category image'); setIsLoading(false); return }
    try {
      setIsLoading(true)
      const response = await postData('/api/category/create', { name: formFields.name, images: formFields.images }, { withCredentials: true })
      context.openAlertBox('success', response.message)
      setFormFields({ name: '', images: [] }); setPreview([])
      context.reloadCategories()
    } catch (error) { context.openAlertBox('error', error.message) }
    finally { setIsLoading(false); context.setIsOpenFullScreenPanel({ open: false, model: null }) }
  }

  return (
    <section className='p-5 min-h-screen' style={{ background: C.bg }}>
      <div className='fixed pointer-events-none' style={{ width:'500px', height:'500px', borderRadius:'50%', background:`radial-gradient(circle, ${C.redGlow} 0%, transparent 70%)`, top:'-150px', right:'-100px', opacity:0.2, zIndex:0 }} />

      <form onSubmit={handleSubmit} className='relative z-10 max-w-2xl mx-auto flex flex-col gap-5'>
        {/* Header */}
        <div className='flex items-center gap-3 mt-2'>
          <div className='w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0' style={{ background: C.redSoft }}>
            <MdCategory size={20} style={{ color: C.red }} />
          </div>
          <div>
            <h1 className='text-[20px] font-[900] tracking-tight' style={{ color: C.text }}>Add Category</h1>
            <p className='text-[12px]' style={{ color: C.muted }}>Create a new product category</p>
          </div>
        </div>

        {/* Name field */}
        <div className='rounded-2xl border p-5 flex flex-col gap-3' style={{ background: C.card, borderColor: C.border }}>
          <p className='text-[11px] font-[700] uppercase tracking-wider' style={{ color: C.muted }}>Category Info</p>
          <div className='flex flex-col gap-1.5'>
            <label className='text-[11px] font-[700] uppercase tracking-wider' style={{ color: C.muted }}>Category Name</label>
            <DarkInput name='name' value={formFields.name} onChange={onChangeInput} placeholder='e.g. Electronics' disabled={isLoading} />
          </div>
        </div>

        {/* Images */}
        <div className='rounded-2xl border p-5 flex flex-col gap-3' style={{ background: C.card, borderColor: C.border }}>
          <p className='text-[11px] font-[700] uppercase tracking-wider' style={{ color: C.muted }}>Category Image</p>
          <div className='grid grid-cols-2 sm:grid-cols-4 gap-3'>
            {preview.map(img => (
              <div key={img} className='relative aspect-square rounded-xl overflow-hidden border' style={{ borderColor: C.border }}>
                <button type='button' onClick={() => handleRemovePreview(img)}
                  className='absolute top-1 right-1 w-6 h-6 rounded-full flex items-center justify-center z-10'
                  style={{ background: C.red }}>
                  <IoCloseOutline size={14} className='text-white' />
                </button>
                <LazyLoadImage className='w-full h-full object-cover' effect='blur' alt='' src={img} />
              </div>
            ))}
            <UploadBox setPreview={setPreview} multiple={false} name='images'
              previousImage={preview?.[0]} apiEndPoint='/api/category/uploadImages'
              onRemovePrevious={async imgUrl => await deleteData(`/api/category/delete-image?img=${encodeURIComponent(imgUrl)}`)}
              onUploadSuccess={(imgs, allowMultiple) => setFormFields(prev => ({ ...prev, images: allowMultiple ? [...prev.images, ...imgs] : imgs }))} />
          </div>
        </div>

        {/* Submit */}
        <button type='submit' disabled={isLoading}
          className='h-[50px] rounded-xl font-[700] text-[15px] text-white flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50'
          style={{ background:`linear-gradient(135deg,#ff4444 0%,${C.red} 100%)`, boxShadow:`0 6px 20px ${C.redGlow}` }}>
          {isLoading ? <><CircularProgress size={20} color='inherit' /> Adding…</> : 'Add Category'}
        </button>
      </form>
    </section>
  )
}
export default AddCategory