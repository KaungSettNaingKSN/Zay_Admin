import React from 'react'
import { PhoneInput } from 'react-international-phone'
import 'react-international-phone/style.css'
import CircularProgress from '@mui/material/CircularProgress'
import { postData, fetchData } from '../../utils/api'
import { Mycontext } from '../../App'
import {
  MdOutlineLocationOn, MdOutlineHome, MdOutlineApartment,
  MdPublic, MdLocalPostOffice, MdPhone, MdOutlineLabel,
  MdOutlineShield,
} from 'react-icons/md'

// ── Design tokens ─────────────────────────────────────────────────────────────
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

// ── Focusable input ───────────────────────────────────────────────────────────
const DarkInput = ({ name, value, onChange, disabled, placeholder, icon: Icon }) => {
  const [focused, setFocused] = React.useState(false)
  return (
    <div className='relative'>
      {Icon && (
        <div className='absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none'>
          <Icon size={15} style={{ color: focused ? C.red : C.subtle, transition: 'color .2s' }} />
        </div>
      )}
      <input
        type='text' name={name} value={value} onChange={onChange}
        disabled={disabled} placeholder={placeholder}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        className={`w-full h-[44px] rounded-xl text-[13px] outline-none transition-all duration-200 placeholder-[#6b7280]
          disabled:opacity-50 disabled:cursor-not-allowed ${Icon ? 'pl-9 pr-4' : 'px-4'}`}
        style={{
          background: C.surface,
          border: `1px solid ${focused ? C.red : C.border}`,
          color: C.text,
          boxShadow: focused ? `0 0 0 3px rgba(245,17,17,0.08)` : 'none',
        }}
      />
    </div>
  )
}

// ── Field wrapper ─────────────────────────────────────────────────────────────
const FieldWrap = ({ label, required, children }) => (
  <div className='flex flex-col gap-1.5'>
    <label className='text-[11px] font-[600] uppercase tracking-wider flex items-center gap-1' style={{ color: C.subtle }}>
      {label}
      {required && <span style={{ color: C.red }}>*</span>}
    </label>
    {children}
  </div>
)

// ── Section head with icon + divider line ─────────────────────────────────────
const SectionHead = ({ icon: Icon, title, accent = C.red, accentBg = C.redSoft }) => (
  <div className='flex items-center gap-2 mb-4'>
    <div className='w-[28px] h-[28px] rounded-lg flex items-center justify-center flex-shrink-0'
      style={{ background: accentBg }}>
      <Icon size={14} style={{ color: accent }} />
    </div>
    <p className='text-[11px] font-[700] uppercase tracking-widest whitespace-nowrap' style={{ color: C.muted }}>{title}</p>
    <div className='flex-1 h-px' style={{ background: C.border }} />
  </div>
)

// ── Address type chip selector ────────────────────────────────────────────────
const ADDRESS_TYPES = ['Home', 'Work', 'Other']

const AddressTypeSelector = ({ value, onChange, disabled }) => (
  <div className='flex gap-2'>
    {ADDRESS_TYPES.map(type => {
      const active = value === type
      return (
        <button key={type} type='button' disabled={disabled}
          onClick={() => onChange(type)}
          className='flex-1 h-[44px] rounded-xl text-[12px] font-[700] transition-all duration-200 active:scale-[0.97] disabled:opacity-50'
          style={{
            background: active ? C.redSoft : 'rgba(255,255,255,0.04)',
            border: `1.5px solid ${active ? C.red : C.border}`,
            color: active ? C.red : C.muted,
            boxShadow: active ? `0 0 12px rgba(245,17,17,0.15)` : 'none',
          }}>
          {type}
        </button>
      )
    })}
  </div>
)

// ── Default toggle ────────────────────────────────────────────────────────────
const DefaultToggle = ({ value, onChange, disabled }) => (
  <div className='flex gap-2 h-[44px]'>
    {[
      { val:'true',  label:'Yes — Default', accent:C.red,     bg:C.redSoft,            border:C.red      },
      { val:'false', label:'No',            accent:'#22c55e', bg:'rgba(34,197,94,0.1)', border:'#22c55e' },
    ].map(opt => {
      const active = value === opt.val
      return (
        <button key={opt.val} type='button' disabled={disabled}
          onClick={() => onChange(opt.val)}
          className='flex-1 rounded-xl text-[12px] font-[700] transition-all duration-200 active:scale-[0.97] disabled:opacity-50'
          style={{
            background: active ? opt.bg : 'rgba(255,255,255,0.04)',
            border: `1.5px solid ${active ? opt.border : C.border}`,
            color: active ? opt.accent : C.muted,
          }}>
          {opt.label}
        </button>
      )
    })}
  </div>
)

// ── Main ──────────────────────────────────────────────────────────────────────
const AddAddress = () => {
  const context = React.useContext(Mycontext)
  const [isLoading, setIsLoading] = React.useState(false)

  const [formFields, setFormFields] = React.useState({
    address_name: 'Home',   // ← backend field (default 'Home')
    address_line: '',
    city:         '',
    state:        '',
    pincode:      '',
    country:      '',
    mobile:       '',
    status:       'false',
  })

  const mobileValue = typeof formFields.mobile === 'string'
    ? formFields.mobile : (formFields.mobile ?? '').toString()

  const onChangeInput = e => setFormFields(p => ({ ...p, [e.target.name]: e.target.value }))

  // Mirrors backend validation exactly
  const validate = () => {
    const checks = [
      [!formFields.address_line,                                    'Please enter address line'],
      [!formFields.city,                                            'Please enter city'],
      [!formFields.state,                                           'Please enter state'],
      [!formFields.pincode,                                         'Please enter pincode'],
      [!formFields.country,                                         'Please enter country'],
      [String(formFields.mobile||'').replace(/\D/g,'').length < 7, 'Please enter a valid mobile number'],
    ]
    for (const [cond, msg] of checks) {
      if (cond) { context.openAlertBox('error', msg); return false }
    }
    return true
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!validate()) return
    setIsLoading(true)
    try {
      const res     = await postData('/api/address/create', formFields, { withCredentials: true })
      const userRes = await fetchData('/api/user/get-user',             { withCredentials: true })
      context.setUserData(userRes.data.data)
      context.setIsOpenFullScreenPanel({ open: false, model: '' })
      context.openAlertBox('success', res.message)
    } catch (err) {
      context.openAlertBox('error', err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const locationFields = [
    { name:'address_line', label:'Address Line',  icon:MdOutlineHome,      placeholder:'123 Main Street', colSpan:2, required:true },
    { name:'city',         label:'City',           icon:MdOutlineApartment, placeholder:'Yangon',          colSpan:1, required:true },
    { name:'state',        label:'State / Region', icon:MdOutlineApartment, placeholder:'Yangon Region',   colSpan:1, required:true },
    { name:'country',      label:'Country',        icon:MdPublic,           placeholder:'Myanmar',         colSpan:1, required:true },
    { name:'pincode',      label:'Postal Code',    icon:MdLocalPostOffice,  placeholder:'11221',           colSpan:1, required:true },
  ]

  const hasPreview = formFields.address_line || formFields.city || formFields.country

  return (
    <div className='min-h-full p-5' style={{ background: C.bg }}>

      {/* Ambient glow */}
      <div className='fixed pointer-events-none' style={{
        width:'400px', height:'400px', borderRadius:'50%',
        background:`radial-gradient(circle, ${C.redGlow} 0%, transparent 70%)`,
        bottom:'-100px', left:'-100px', opacity:0.12, zIndex:0,
      }} />

      <div className='relative z-10 max-w-2xl mx-auto'>

        {/* Page header */}
        <div className='flex items-center gap-3 mb-6'>
          <div className='w-[46px] h-[46px] rounded-2xl flex items-center justify-center flex-shrink-0'
            style={{ background: C.redSoft, boxShadow:`0 0 20px ${C.redGlow}` }}>
            <MdOutlineLocationOn size={22} style={{ color: C.red }} />
          </div>
          <div>
            <h2 className='text-[18px] font-[800] tracking-tight' style={{ color: C.text }}>Add New Address</h2>
            <p className='text-[12px] mt-0.5' style={{ color: C.muted }}>Fill in all required fields to save your delivery address</p>
          </div>
        </div>

        {/* Card */}
        <div className='rounded-3xl border overflow-hidden' style={{ background: C.surface, borderColor: C.border }}>
          <form onSubmit={handleSubmit} className='p-6 flex flex-col gap-6'>

            {/* ── 1. Address Type ── */}
            <div>
              <SectionHead icon={MdOutlineLabel} title='Address Type' />
              <FieldWrap label='Label'>
                <AddressTypeSelector
                  value={formFields.address_name}
                  onChange={v => setFormFields(p => ({ ...p, address_name: v }))}
                  disabled={isLoading}
                />
              </FieldWrap>
            </div>

            {/* ── 2. Location Details ── */}
            <div>
              <SectionHead icon={MdOutlineLocationOn} title='Location Details' />
              <div className='grid grid-cols-2 gap-4'>
                {locationFields.map(f => (
                  <div key={f.name} className={f.colSpan === 2 ? 'col-span-2' : 'col-span-2 sm:col-span-1'}>
                    <FieldWrap label={f.label} required={f.required}>
                      <DarkInput
                        name={f.name} value={formFields[f.name]}
                        onChange={onChangeInput} disabled={isLoading}
                        placeholder={f.placeholder} icon={f.icon}
                      />
                    </FieldWrap>
                  </div>
                ))}
              </div>
            </div>

            {/* ── 3. Contact & Settings ── */}
            <div>
              <SectionHead icon={MdPhone} title='Contact & Settings'
                accent='#60a5fa' accentBg='rgba(59,130,246,0.1)' />
              <div className='grid grid-cols-2 gap-4'>

                {/* Mobile */}
                <div className='col-span-2 sm:col-span-1'>
                  <FieldWrap label='Mobile Number' required>
                    <div style={{
                      '--react-international-phone-background-color': C.surface,
                      '--react-international-phone-text-color':       C.text,
                      '--react-international-phone-border-color':     C.border,
                      '--react-international-phone-height':           '44px',
                      '--react-international-phone-border-radius':    '12px',
                    }}>
                      <PhoneInput
                        defaultCountry='mm' value={mobileValue}
                        onChange={mobile => setFormFields(p => ({ ...p, mobile: mobile ?? '' }))}
                        className='w-full' disabled={isLoading}
                        inputClassName='!w-full !h-[44px] !text-[13px] !rounded-r-xl'
                        countrySelectorStyleProps={{ buttonClassName:'!h-[44px] !rounded-l-xl' }}
                      />
                    </div>
                  </FieldWrap>
                </div>

                {/* Default toggle */}
                <div className='col-span-2 sm:col-span-1'>
                  <FieldWrap label='Set as Default'>
                    <DefaultToggle
                      value={formFields.status}
                      onChange={v => setFormFields(p => ({ ...p, status: v }))}
                      disabled={isLoading}
                    />
                  </FieldWrap>
                </div>

              </div>
            </div>

            {/* ── 4. Live preview strip (shows once user starts typing) ── */}
            {hasPreview && (
              <div className='rounded-2xl border p-4 flex items-start gap-3 transition-all duration-300'
                style={{ background: C.card, borderColor: C.border }}>
                <div className='w-[32px] h-[32px] rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5'
                  style={{ background: C.redSoft }}>
                  <MdOutlineLocationOn size={16} style={{ color: C.red }} />
                </div>
                <div className='flex-1 min-w-0'>
                  <p className='text-[10px] font-[700] uppercase tracking-wider mb-1' style={{ color: C.muted }}>
                    Preview — {formFields.address_name}
                  </p>
                  <p className='text-[13px] font-[600]' style={{ color: C.text }}>{formFields.address_line || '—'}</p>
                  <p className='text-[12px] mt-0.5' style={{ color: C.muted }}>
                    {[formFields.city, formFields.state, formFields.country].filter(Boolean).join(', ')}
                    {formFields.pincode ? ` — ${formFields.pincode}` : ''}
                  </p>
                  {formFields.mobile && (
                    <p className='text-[11px] mt-1' style={{ color: C.subtle }}>📞 {formFields.mobile}</p>
                  )}
                </div>
                {formFields.status === 'true' && (
                  <span className='text-[10px] font-[700] uppercase tracking-wider px-2.5 py-[3px] rounded-full flex-shrink-0'
                    style={{ background: C.redSoft, color: C.red, border:`1px solid rgba(245,17,17,0.25)` }}>
                    Default
                  </span>
                )}
              </div>
            )}

            {/* ── Submit ── */}
            <button type='submit' disabled={isLoading}
              className='w-full h-[50px] rounded-xl text-[14px] font-[800] text-white flex items-center justify-center gap-2
                disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 active:scale-[0.98]'
              style={{
                background: isLoading ? '#374151' : `linear-gradient(135deg,#ff4444 0%,${C.red} 100%)`,
                boxShadow:  isLoading ? 'none'    : `0 4px 20px rgba(245,17,17,0.35)`,
              }}>
              {isLoading
                ? <><CircularProgress size={16} color='inherit' /> Saving address…</>
                : <><MdOutlineLocationOn size={18} /> Save Address</>
              }
            </button>

          </form>
        </div>

        {/* Footer */}
        <div className='flex items-center justify-center gap-2 mt-4'>
          <MdOutlineShield size={13} style={{ color: C.subtle }} />
          <p className='text-[11px]' style={{ color: C.subtle }}>Your address information is stored securely</p>
        </div>

      </div>
    </div>
  )
}

export default AddAddress