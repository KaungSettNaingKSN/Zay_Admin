import React, { useContext, useState } from 'react'
import { FiUploadCloud } from 'react-icons/fi'
import { IoCloseSharp } from 'react-icons/io5'
import { postData } from '../../utils/api'
import { Mycontext } from '../../App'

const C = {
  surface: '#16161f',
  border:  'rgba(255,255,255,0.07)',
  text:    '#f0f0f5',
  muted:   '#6b7280',
  red:     '#f51111',
  redSoft: 'rgba(245,17,17,0.08)',
}

const UploadBox = (props) => {
  const context = useContext(Mycontext)
  const [uploading, setUploading] = useState(false)
  const [progress,  setProgress]  = useState(0)
  const [dragOver,  setDragOver]  = useState(false)

  const processFiles = async (files) => {
    if (!files?.length) return
    const formData   = new FormData()
    const okTypes    = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
    setUploading(true)
    setProgress(10)

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (!okTypes.includes(file.type)) {
        context.openAlertBox('error', 'Invalid image format (jpeg/png/webp only)')
        setUploading(false)
        return
      }
      formData.append(props.name, file)
    }

    try {
      setProgress(40)
      const response = await postData(props.apiEndPoint, formData)
      setProgress(90)
      if (response.success) {
        const imgs         = Array.isArray(response.image) ? response.image : [response.image]
        const allowMultiple = props.multiple ?? false
        if (!allowMultiple && props.previousImage && props.onRemovePrevious)
          await props.onRemovePrevious(props.previousImage)
        props.setPreview?.((prev) => allowMultiple ? [...prev, ...imgs] : imgs)
        props.onUploadSuccess?.(imgs, allowMultiple)
        context.openAlertBox('success', 'Uploaded successfully')
      } else {
        context.openAlertBox('error', response.message || 'Upload failed')
      }
    } catch (error) {
      context.openAlertBox('error', error.message || 'Upload failed')
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  const onChangeFile = (e) => { processFiles(e.target.files); e.target.value = '' }
  const onDrop       = (e) => { e.preventDefault(); setDragOver(false); processFiles(e.dataTransfer.files) }
  const onDragOver   = (e) => { e.preventDefault(); setDragOver(true) }
  const onDragLeave  = () => setDragOver(false)

  return (
    <div
      className='relative rounded-2xl border-2 border-dashed h-[130px] w-full flex flex-col items-center justify-center gap-2 cursor-pointer transition-all overflow-hidden'
      style={{
        background:   dragOver ? 'rgba(245,17,17,0.06)' : C.surface,
        borderColor:  dragOver ? C.red : uploading ? 'rgba(245,17,17,0.3)' : C.border,
      }}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {/* Progress bar */}
      {uploading && (
        <div className='absolute top-0 left-0 h-[2px] rounded-full transition-all duration-300'
          style={{ width: `${progress}%`, background: C.red }} />
      )}

      {uploading ? (
        <div className='flex flex-col items-center gap-2'>
          {/* Animated upload icon */}
          <div className='w-10 h-10 rounded-full border-2 border-t-transparent animate-spin flex-shrink-0'
            style={{ borderColor: `${C.red} transparent transparent transparent` }} />
          <p className='text-[12px] font-[600]' style={{ color: C.muted }}>Uploading…</p>
        </div>
      ) : (
        <>
          <div className='w-10 h-10 rounded-xl flex items-center justify-center'
            style={{ background: C.redSoft }}>
            <FiUploadCloud size={20} style={{ color: C.red }} />
          </div>
          <div className='text-center px-3'>
            <p className='text-[13px] font-[700]' style={{ color: C.text }}>
              {dragOver ? 'Drop to upload' : 'Click or drag to upload'}
            </p>
            <p className='text-[11px] mt-0.5' style={{ color: C.muted }}>
              JPEG · PNG · WEBP supported
            </p>
          </div>
        </>
      )}

      <input
        type='file'
        disabled={uploading}
        name={props.name}
        onChange={onChangeFile}
        accept='image/*'
        multiple={props.multiple ?? false}
        className='absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10'
      />
    </div>
  )
}

export default UploadBox