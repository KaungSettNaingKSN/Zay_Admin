import React from 'react'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import 'react-lazy-load-image-component/src/effects/blur.css'
import { IoCloseOutline } from 'react-icons/io5'
import { MdOutlineAddPhotoAlternate } from 'react-icons/md'
import CircularProgress from '@mui/material/CircularProgress'
import { useContext } from 'react'
import { Mycontext } from '../../App'
import { deleteData, putData } from '../../utils/api'
import UploadBox from '../../components/UploadBox'

const C = {
  bg:      '#0a0a0f',
  surface: '#111118',
  card:    '#16161f',
  border:  'rgba(255,255,255,0.07)',
  red:     '#f51111',
  redSoft: 'rgba(245,17,17,0.08)',
  text:    '#f0f0f5',
  muted:   '#6b7280',
}

const EditHomeBanner = ({ data }) => {
  const [isLoading,  setIsLoading]  = React.useState(false)
  const [preview,    setPreview]    = React.useState([])
  const [formFields, setFormFields] = React.useState({ images: [] })
  const context                     = useContext(Mycontext)

  // Unchanged logic
  React.useEffect(() => {
    setPreview(data.images)
    setFormFields({ images: data.images })
  }, [data])

  const handleRemovePreview = async (imgUrl) => {
    try {
      setPreview(prev => prev.filter(x => x !== imgUrl))
      setFormFields(prev => ({ ...prev, images: prev.images.filter(x => x !== imgUrl) }))
      await deleteData(`/api/homeSlider/delete-image?img=${encodeURIComponent(imgUrl)}`)
      context.openAlertBox('success', 'Image removed')
    } catch (error) {
      context.openAlertBox('error', error.message || 'Remove failed')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (formFields.images.length === 0) {
      context.openAlertBox('error', 'Please upload at least one image')
      return
    }
    setIsLoading(true)
    try {
      await putData(`/api/homeSlider/${data._id}`, { images: formFields.images })
      context.openAlertBox('success', 'Banner updated successfully')
      setFormFields({ images: [] })
      setPreview([])
      context.setIsOpenFullScreenPanel({ open: false, model: null })
    } catch (error) {
      context.openAlertBox('error', error.message || 'Something went wrong')
    } finally { setIsLoading(false) }
  }

  return (
    <section className='p-5 md:p-8' style={{ background: C.bg, minHeight: '100%' }}>
      <form onSubmit={handleSubmit} className='max-w-4xl mx-auto flex flex-col gap-6'>

        {/* ── Section title ── */}
        <div>
          <h3 className='text-[17px] font-[700]' style={{ color: C.text }}>
            <MdOutlineAddPhotoAlternate className='inline mr-2 mb-0.5' size={20} style={{ color: C.red }} />
            Edit Banner Images
          </h3>
          <p className='text-[12px] mt-1' style={{ color: C.muted }}>
            Remove existing images or upload new ones.
          </p>
        </div>

        {/* ── Image grid ── */}
        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3'>

          {/* Preview tiles */}
          {preview.map((img) => (
            <div key={img} className='relative group rounded-xl overflow-hidden border aspect-[16/9]'
              style={{ borderColor: C.border, background: C.surface }}>
              <LazyLoadImage
                src={img} alt='banner' effect='blur'
                className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-105'
              />
              <button
                type='button'
                onClick={() => handleRemovePreview(img)}
                className='absolute top-1.5 right-1.5 w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-10'
                style={{ background: C.red, color: '#fff' }}
              >
                <IoCloseOutline size={14} />
              </button>
              <div className='absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity pointer-events-none'
                style={{ background: '#000' }} />
            </div>
          ))}

          {/* Upload box */}
          <div className='aspect-[16/9]'>
            <UploadBox
              setPreview={setPreview}
              multiple={false}
              name='images'
              apiEndPoint='/api/homeSlider/uploadImages'
              previousImage={data?.images?.[0]}
              onRemovePrevious={async (imgUrl) => {
                await deleteData(`/api/homeSlider/delete-image?img=${encodeURIComponent(imgUrl)}`)
              }}
              onUploadSuccess={(imgs, allowMultiple) => {
                setFormFields(prev => ({
                  ...prev,
                  images: allowMultiple ? [...prev.images, ...imgs] : imgs,
                }))
              }}
            />
          </div>
        </div>

        {/* ── Count hint ── */}
        {preview.length > 0 && (
          <p className='text-[12px]' style={{ color: C.muted }}>
            {preview.length} image{preview.length !== 1 ? 's' : ''} selected
          </p>
        )}

        {/* ── Submit ── */}
        <div className='flex items-center gap-3 pt-2'>
          <button
            type='submit'
            disabled={isLoading}
            className='flex items-center gap-2 px-8 py-2.5 rounded-xl text-[13px] font-[700] text-white transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed'
            style={{ background: 'linear-gradient(135deg,#ff4444,#f51111)', boxShadow: '0 4px 14px rgba(245,17,17,0.35)' }}
          >
            {isLoading
              ? <><CircularProgress size={16} sx={{ color: '#fff' }} /> Updating…</>
              : 'Update Banner'
            }
          </button>
          <button
            type='button'
            onClick={() => context.setIsOpenFullScreenPanel({ open: false, model: null })}
            className='px-6 py-2.5 rounded-xl text-[13px] font-[600] transition-all'
            style={{ color: C.muted, background: C.surface, border: `1px solid ${C.border}` }}
            onMouseEnter={e => { e.currentTarget.style.color = C.text; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)' }}
            onMouseLeave={e => { e.currentTarget.style.color = C.muted; e.currentTarget.style.borderColor = C.border }}
          >
            Cancel
          </button>
        </div>
      </form>
    </section>
  )
}

export default EditHomeBanner