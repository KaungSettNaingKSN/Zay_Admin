import React from 'react'
import { useContext, useEffect, useState } from 'react'
import { Mycontext } from '../../App'
import { CircularProgress } from '@mui/material'
import { FaCloudUploadAlt } from 'react-icons/fa'
import { BsPersonBoundingBox } from 'react-icons/bs'
import { putData, fetchData } from '../../utils/api'
import { Collapse } from 'react-collapse'
import { PhoneInput } from 'react-international-phone'
import 'react-international-phone/style.css'
import { MdLockOutline, MdOutlineLocationOn, MdAddCircleOutline, MdCheckCircle, MdPerson } from 'react-icons/md'
import { IoShieldCheckmarkOutline } from 'react-icons/io5'

// ── Design tokens (matches ProductDetails) ───────────────────────────────────
const C = {
  bg:      '#0f1117',
  surface: '#161a23',
  card:    '#1f2430',
  border:  'rgba(255,255,255,0.08)',
  red:     '#f51111',
  redGlow: 'rgba(245,17,17,0.22)',
  redSoft: 'rgba(245,17,17,0.12)',
  text:    '#f5f6fa',
  muted:   '#a1a1aa',
  subtle:  '#6b7280',
}

// ── Shared input style ────────────────────────────────────────────────────────
const inputStyle = {
  background: C.surface,
  border: `1px solid ${C.border}`,
  color: C.text,
}
const inputCls = `w-full h-[44px] rounded-xl px-4 text-[13px] outline-none transition-all duration-200
  placeholder-[#6b7280]`

const fieldFocusStyle = (focused) => ({
  ...inputStyle,
  border: `1px solid ${focused ? C.red : C.border}`,
  boxShadow: focused ? `0 0 0 3px rgba(245,17,17,0.1)` : 'none',
})

// ── Section label ─────────────────────────────────────────────────────────────
const SectionLabel = ({ children }) => (
  <p className='text-[10px] font-[700] uppercase tracking-widest mb-3' style={{ color: C.muted }}>
    {children}
  </p>
)

// ── Field wrapper ─────────────────────────────────────────────────────────────
const FieldWrap = ({ label, children }) => (
  <div className='flex flex-col gap-1.5'>
    <label className='text-[11px] font-[600] uppercase tracking-wider' style={{ color: C.subtle }}>{label}</label>
    {children}
  </div>
)

// ── Focusable input ───────────────────────────────────────────────────────────
const DarkInput = ({ name, value, onChange, disabled, placeholder, type = 'text' }) => {
  const [focused, setFocused] = useState(false)
  return (
    <input
      type={type} name={name} value={value} onChange={onChange}
      disabled={disabled} placeholder={placeholder}
      onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
      className={inputCls}
      style={fieldFocusStyle(focused)}
    />
  )
}

// ── Red button ────────────────────────────────────────────────────────────────
const RedButton = ({ onClick, disabled, loading, children, type = 'button', fullWidth = false }) => (
  <button
    type={type} onClick={onClick} disabled={disabled || loading}
    className={`h-[44px] ${fullWidth ? 'w-full' : 'px-8'} rounded-xl text-[13px] font-[700] text-white flex items-center justify-center gap-2
      disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 active:scale-[0.97]`}
    style={{
      background: disabled || loading ? '#374151' : `linear-gradient(135deg,#ff4444 0%,${C.red} 100%)`,
      boxShadow: disabled || loading ? 'none' : `0 4px 14px rgba(245,17,17,0.3)`,
    }}
  >
    {loading ? <CircularProgress size={16} color='inherit' /> : children}
  </button>
)

// ── Main ──────────────────────────────────────────────────────────────────────
const Profile = () => {
  const context = useContext(Mycontext)
  const [preview,               setPreview]               = useState([])
  const [uploading,             setUploading]             = useState(false)
  const [isLoading,             setIsLoading]             = useState(false)
  const [isLoading2,            setIsLoading2]            = useState(false)
  const [userId,                setUserId]                = useState(false)
  const [isChangePasswordShow,  setIsChangePasswordShow]  = useState(false)
  const [selectingAddressId,    setSelectingAddressId]    = useState(null)
  const [selectedValue,         setSelectedValue]         = useState('')

  const [formFields, setFormFields] = useState({ email: '', name: '', mobile: '' })
  const [changePassword, setChangePassword] = useState({
    email: '', oldPassword: '', newPassword: '', confirmPassword: ''
  })

  const mobileValue = typeof formFields.mobile === 'string'
    ? formFields.mobile : (formFields.mobile ?? '').toString()

  const valideValue = Object.values(changePassword).every(el => el)

  useEffect(() => {
    const defaultAddr = context?.userData?.address_details?.find(a => a.status)
    if (defaultAddr?._id) setSelectedValue(defaultAddr._id)
  }, [context?.userData?.address_details])

  useEffect(() => {
    if (context?.userData?.avatar) setPreview([context.userData.avatar])
    else setPreview([])
  }, [context?.userData?.avatar])

  useEffect(() => {
    if (context?.userData?._id) {
      setUserId(context.userData._id)
      setFormFields({
        name:   context.userData.name   ?? '',
        email:  context.userData.email  ?? '',
        mobile: (context.userData.mobile ?? '').toString(),
      })
      setChangePassword(prev => ({ ...prev, email: context.userData.email ?? '' }))
    }
  }, [context?.userData])

  const handleSelectAddress = async (addressId) => {
    if (addressId === selectedValue || selectingAddressId) return
    const prev = selectedValue
    try {
      setSelectingAddressId(addressId); setSelectedValue(addressId)
      context.setUserData(u => ({
        ...u,
        address_details: (u?.address_details || []).map(a => ({ ...a, status: a._id === addressId })),
      }))
      await putData(`/api/address/select/${addressId}`, {}, { withCredentials: true })
      context.openAlertBox('success', 'Address selected')
    } catch (e) {
      setSelectedValue(prev)
      context.setUserData(u => ({
        ...u,
        address_details: (u?.address_details || []).map(a => ({ ...a, status: a._id === prev })),
      }))
      context.openAlertBox('error', e.message)
    } finally {
      setSelectingAddressId(null)
    }
  }

  const onChangeFile = async (e) => {
    const files = e.target.files
    const formData = new FormData()
    setUploading(true)
    try {
      for (let i = 0; i < files.length; i++) {
        const f = files[i]
        if (!['image/jpeg','image/png','image/jpg','image/webp'].includes(f.type)) {
          context.openAlertBox('error', 'Please valid image format'); return
        }
        formData.append('avatar', f)
        const res = await putData('/api/user/user-avatar', formData)
        const newAvatar = res?.data?.avatar || res?.data?.data?.avatar || res?.avatar
        if (newAvatar) {
          setPreview([newAvatar])
          context.setUserData(prev => ({ ...(prev || {}), avatar: newAvatar }))
          context.openAlertBox('success', 'Avatar updated')
        }
      }
    } catch (e) { console.error(e) }
    finally { setUploading(false) }
  }

  const handleSubmit = async (e) => {
    e.preventDefault(); setIsLoading(true)
    if (!formFields.name)  { context.openAlertBox('error', 'Please enter your name'); setIsLoading(false); return }
    if (!formFields.email) { context.openAlertBox('error', 'Please enter email');     setIsLoading(false); return }
    try {
      const res = await putData(`/api/user/${userId}`, formFields, { withCredentials: true })
      const userRes = await fetchData('/api/user/get-user', { withCredentials: true })
      context.setUserData(userRes.data.data)
      context.openAlertBox('success', res.message)
    } catch (e) { context.openAlertBox('error', e.message) }
    finally { setIsLoading(false) }
  }

  const handleSubmitChangePassword = async (e) => {
    e.preventDefault(); setIsLoading2(true)
    try {
      const res = await putData('/api/user/reset-password', changePassword, { withCredentials: true })
      setChangePassword({ email: context.userData.email ?? '', newPassword: '', confirmPassword: '', oldPassword: '' })
      context.openAlertBox('success', res.message)
    } catch (e) { context.openAlertBox('error', e.message) }
    finally { setIsLoading2(false) }
  }

  const onChangeInput    = e => setFormFields(p => ({ ...p, [e.target.name]: e.target.value }))
  const onChangePassword = e => setChangePassword(p => ({ ...p, [e.target.name]: e.target.value }))

  return (
    <div className='min-h-screen p-5' style={{ background: C.bg }}>
      {/* Ambient glow */}
      <div className='fixed pointer-events-none' style={{
        width: '600px', height: '600px', borderRadius: '50%',
        background: `radial-gradient(circle, ${C.redGlow} 0%, transparent 70%)`,
        top: '-200px', right: '-150px', opacity: 0.15, zIndex: 0,
      }} />

      <div className='relative z-10 max-w-4xl mx-auto flex flex-col gap-5'>

        {/* ── Profile card ── */}
        <div className='rounded-3xl border overflow-hidden' style={{ background: C.surface, borderColor: C.border }}>

          {/* Header strip */}
          <div className='px-6 py-5 border-b flex items-center justify-between flex-wrap gap-3'
            style={{ borderColor: C.border, background: `linear-gradient(to right, ${C.redSoft}, transparent)` }}>
            <div className='flex items-center gap-3'>
              <div className='w-[42px] h-[42px] rounded-2xl flex items-center justify-center flex-shrink-0'
                style={{ background: C.redSoft }}>
                <MdPerson size={22} style={{ color: C.red }} />
              </div>
              <div>
                <h2 className='text-[17px] font-[800] tracking-tight' style={{ color: C.text }}>My Profile</h2>
                <p className='text-[11px]' style={{ color: C.muted }}>Manage your personal information</p>
              </div>
            </div>
            <button
              onClick={() => setIsChangePasswordShow(p => !p)}
              className='h-[38px] px-5 rounded-xl text-[12px] font-[700] flex items-center gap-2 transition-all duration-200 active:scale-[0.97]'
              style={{
                background: isChangePasswordShow ? `linear-gradient(135deg,#ff4444,${C.red})` : 'rgba(255,255,255,0.06)',
                color: isChangePasswordShow ? '#fff' : C.muted,
                border: `1px solid ${isChangePasswordShow ? C.red : C.border}`,
                boxShadow: isChangePasswordShow ? `0 4px 14px rgba(245,17,17,0.3)` : 'none',
              }}
            >
              <MdLockOutline size={15} />
              {isChangePasswordShow ? 'Hide Password' : 'Change Password'}
            </button>
          </div>

          <div className='p-6 flex flex-col gap-6'>

            {/* Avatar */}
            <div className='flex items-center gap-5'>
              <div className='relative flex-shrink-0'>
                <div className='w-[90px] h-[90px] rounded-2xl overflow-hidden border-2'
                  style={{ borderColor: C.red, boxShadow: `0 0 20px ${C.redGlow}` }}>
                  {preview.length > 0
                    ? <img src={preview[0]} alt='avatar' className='w-full h-full object-cover' />
                    : <div className='w-full h-full flex items-center justify-center' style={{ background: C.card }}>
                        <BsPersonBoundingBox size={36} style={{ color: C.muted }} />
                      </div>
                  }
                  <div className={`absolute inset-0 rounded-2xl flex items-center justify-center transition-all duration-300
                    ${uploading ? 'opacity-90' : 'opacity-0 hover:opacity-90'}`}
                    style={{ background: 'rgba(0,0,0,0.6)' }}>
                    {uploading
                      ? <CircularProgress size={22} sx={{ color: C.red }} />
                      : <>
                          <input type='file' accept='image/*' onChange={onChangeFile} disabled={uploading}
                            className='absolute inset-0 opacity-0 cursor-pointer w-full h-full' />
                          <FaCloudUploadAlt size={28} color='white' />
                        </>
                    }
                  </div>
                </div>
              </div>
              <div>
                <p className='text-[15px] font-[700]' style={{ color: C.text }}>{formFields.name || 'Your Name'}</p>
                <p className='text-[12px] mt-0.5' style={{ color: C.muted }}>{formFields.email || 'your@email.com'}</p>
                <p className='text-[11px] mt-2' style={{ color: C.subtle }}>Click avatar to change photo</p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
              <SectionLabel>Personal Information</SectionLabel>
              <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
                <FieldWrap label='Full Name'>
                  <DarkInput name='name' value={formFields.name} onChange={onChangeInput} disabled={isLoading} placeholder='John Doe' />
                </FieldWrap>
                <FieldWrap label='Email Address'>
                  <DarkInput name='email' value={formFields.email} onChange={onChangeInput} disabled={true} placeholder='john@example.com' type='email' />
                </FieldWrap>
                <FieldWrap label='Mobile Number'>
                  <div style={{ '--react-international-phone-background-color': C.surface,
                    '--react-international-phone-text-color': C.text,
                    '--react-international-phone-border-color': C.border,
                    '--react-international-phone-height': '44px',
                  }}>
                    <PhoneInput
                      defaultCountry='mm' value={mobileValue}
                      onChange={mobile => setFormFields(p => ({ ...p, mobile: mobile ?? '' }))}
                      className='w-full' disabled={isLoading}
                      inputClassName='!w-full !h-[44px] !text-[13px] !rounded-r-xl !border-l-0'
                      countrySelectorStyleProps={{ buttonClassName: '!h-[44px] !rounded-l-xl' }}
                    />
                  </div>
                </FieldWrap>
              </div>
              <div>
                <RedButton type='submit' loading={isLoading}>Update Profile</RedButton>
              </div>
            </form>
          </div>
        </div>

        {/* ── Change password ── */}
        <Collapse isOpened={isChangePasswordShow}>
          <div className='rounded-3xl border overflow-hidden' style={{ background: C.surface, borderColor: C.border }}>
            <div className='px-6 py-5 border-b flex items-center gap-3'
              style={{ borderColor: C.border, background: `linear-gradient(to right, rgba(59,130,246,0.06), transparent)` }}>
              <div className='w-[38px] h-[38px] rounded-xl flex items-center justify-center flex-shrink-0'
                style={{ background: 'rgba(59,130,246,0.1)' }}>
                <IoShieldCheckmarkOutline size={18} style={{ color: '#60a5fa' }} />
              </div>
              <div>
                <h3 className='text-[14px] font-[800]' style={{ color: C.text }}>Change Password</h3>
                <p className='text-[11px]' style={{ color: C.muted }}>Update your security credentials</p>
              </div>
            </div>
            <div className='p-6'>
              <form onSubmit={handleSubmitChangePassword} className='flex flex-col gap-4'>
                <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
                  <FieldWrap label='Old Password'>
                    <DarkInput name='oldPassword' value={changePassword.oldPassword} onChange={onChangePassword}
                      disabled={isLoading2} placeholder='••••••••' type='password' />
                  </FieldWrap>
                  <FieldWrap label='New Password'>
                    <DarkInput name='newPassword' value={changePassword.newPassword} onChange={onChangePassword}
                      disabled={isLoading2} placeholder='••••••••' type='password' />
                  </FieldWrap>
                  <FieldWrap label='Confirm Password'>
                    <DarkInput name='confirmPassword' value={changePassword.confirmPassword} onChange={onChangePassword}
                      disabled={isLoading2} placeholder='••••••••' type='password' />
                  </FieldWrap>
                </div>
                <div>
                  <RedButton type='submit' loading={isLoading2} disabled={!valideValue}>Update Password</RedButton>
                </div>
              </form>
            </div>
          </div>
        </Collapse>

        {/* ── Addresses ── */}
        <div className='rounded-3xl border overflow-hidden' style={{ background: C.surface, borderColor: C.border }}>
          <div className='px-6 py-5 border-b flex items-center gap-3'
            style={{ borderColor: C.border, background: `linear-gradient(to right, rgba(34,197,94,0.05), transparent)` }}>
            <div className='w-[38px] h-[38px] rounded-xl flex items-center justify-center flex-shrink-0'
              style={{ background: 'rgba(34,197,94,0.1)' }}>
              <MdOutlineLocationOn size={18} style={{ color: '#22c55e' }} />
            </div>
            <div>
              <h3 className='text-[14px] font-[800]' style={{ color: C.text }}>Saved Addresses</h3>
              <p className='text-[11px]' style={{ color: C.muted }}>{context?.userData?.address_details?.length || 0} saved addresses</p>
            </div>
          </div>

          <div className='p-5 flex flex-col gap-3'>
            {context?.userData?.address_details?.map((address, i) => {
              const isSelected  = selectedValue === address._id
              const isSelecting = selectingAddressId === address._id
              return (
                <div
                  key={i}
                  onClick={() => handleSelectAddress(address._id)}
                  className='rounded-2xl p-4 relative transition-all duration-200'
                  style={{
                    background: isSelected ? 'rgba(245,17,17,0.06)' : C.card,
                    border: `1.5px solid ${isSelected ? C.red : C.border}`,
                    boxShadow: isSelected ? `0 0 16px rgba(245,17,17,0.12)` : 'none',
                    cursor: selectingAddressId ? 'not-allowed' : 'pointer',
                    opacity: selectingAddressId && !isSelecting ? 0.6 : 1,
                  }}
                >
                  <div className='flex items-start justify-between gap-3'>
                    <div className='flex-1'>
                      <p className='text-[13px] font-[600]' style={{ color: C.text }}>
                        {address.address_name}
                      </p>
                      <p className='text-[13px] font-[600]' style={{ color: C.text }}>
                        {address.address_line}
                      </p>
                      <p className='text-[12px] mt-1' style={{ color: C.muted }}>
                        {[address.city, address.state, address.country].filter(Boolean).join(', ')}
                        {address.pincode ? ` — ${address.pincode}` : ''}
                      </p>
                      <p className='text-[11px] mt-1' style={{ color: C.subtle }}>📞 {address.mobile}</p>
                    </div>
                    <div className='flex-shrink-0 mt-0.5'>
                      {isSelecting
                        ? <CircularProgress size={16} sx={{ color: C.red }} />
                        : isSelected
                          ? <MdCheckCircle size={20} style={{ color: C.red }} />
                          : <div className='w-[18px] h-[18px] rounded-full border-2' style={{ borderColor: C.border }} />
                      }
                    </div>
                  </div>
                  {isSelected && !isSelecting && (
                    <span className='mt-2 inline-block text-[10px] font-[700] uppercase tracking-wider px-2 py-[2px] rounded-full'
                      style={{ background: C.redSoft, color: C.red }}>
                      Default
                    </span>
                  )}
                </div>
              )
            })}

            {/* Add address button */}
            <button
              onClick={() => context.setIsOpenFullScreenPanel({ open: true, model: 'Add Address' })}
              className='w-full h-[50px] rounded-2xl flex items-center justify-center gap-2 text-[13px] font-[700] transition-all duration-200 active:scale-[0.98]'
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: `1.5px dashed ${C.border}`,
                color: C.muted,
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = C.red; e.currentTarget.style.color = C.red }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.muted }}
            >
              <MdAddCircleOutline size={18} />
              Add New Address
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}

export default Profile