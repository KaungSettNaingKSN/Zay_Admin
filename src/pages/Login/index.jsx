import React from 'react'
import { useNavigate } from 'react-router-dom'
import { FaRegEye, FaEyeSlash } from 'react-icons/fa'
import { MdAdminPanelSettings } from 'react-icons/md'
import CircularProgress from '@mui/material/CircularProgress'
import { Mycontext } from '../../App'
import { fetchData, postData } from '../../utils/api'

const LoginAdmin = () => {
  const context  = React.useContext(Mycontext)
  const navigate = useNavigate()

  const [showPassword, setShowPassword] = React.useState(false)
  const [isLoading,    setIsLoading]    = React.useState(false)
  const [formFields,   setFormFields]   = React.useState({ email: '', password: '' })

  const onChange = (e) => {
    const { name, value } = e.target
    setFormFields(prev => ({ ...prev, [name]: value }))
  }

  const validForm = formFields.email && formFields.password

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validForm) return
    setIsLoading(true)
    try {
      // Step 1: normal login
      const response = await postData('/api/user/admin-login', formFields, { withCredentials: true })

      localStorage.setItem('accessToken',  response?.data?.accessToken)
      localStorage.setItem('refreshToken', response?.data?.refreshToken)

      // Step 2: verify the logged-in user is actually an Admin
      const userRes = await fetchData('/api/user/get-user', { withCredentials: true })
      const user    = userRes?.data?.data

      if (!user) throw new Error('Could not fetch user data')

      if (user.role !== 'Admin') {
        // Not an admin — clear tokens and reject
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        context.openAlertBox('error', 'Access denied — admins only')
        return
      }

      // Step 3: success
      context.setUserData(user)
      context.setIsLogin(true)
      context.openAlertBox('success', 'Welcome back, Admin!')
      navigate('/')

    } catch (error) {
      context.openAlertBox('error', error.message || 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className='min-h-screen bg-gray-950 flex items-center justify-center px-4 py-12'>
      <div className='w-full max-w-[400px]'>

        {/* Card */}
        <div className='bg-gray-900 rounded-3xl border border-gray-800 shadow-2xl p-8 sm:p-10'>

          {/* Header */}
          <div className='flex flex-col items-center mb-8'>
            <div className='w-[56px] h-[56px] rounded-2xl bg-[#f51111]/15 flex items-center justify-center mb-4'>
              <MdAdminPanelSettings size={30} className='text-[#f51111]' />
            </div>
            <h1 className='text-[22px] font-[800] text-white tracking-tight'>Admin Login</h1>
            <p className='text-[13px] text-gray-400 mt-1'>Restricted access — authorised personnel only</p>
          </div>

          <form onSubmit={handleSubmit} className='flex flex-col gap-4'>

            {/* Email */}
            <div className='flex flex-col gap-1.5'>
              <label className='text-[11px] font-[700] text-gray-400 uppercase tracking-wider'>
                Email Address
              </label>
              <input
                type='email'
                name='email'
                value={formFields.email}
                onChange={onChange}
                disabled={isLoading}
                placeholder='admin@example.com'
                className='w-full h-[46px] bg-gray-800 border border-gray-700 rounded-xl px-4
                           text-[14px] text-white placeholder-gray-600 outline-none
                           focus:border-[#f51111] focus:ring-2 focus:ring-[#f51111]/15
                           transition-all duration-200 disabled:opacity-50'
              />
            </div>

            {/* Password */}
            <div className='flex flex-col gap-1.5'>
              <label className='text-[11px] font-[700] text-gray-400 uppercase tracking-wider'>
                Password
              </label>
              <div className='relative'>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name='password'
                  value={formFields.password}
                  onChange={onChange}
                  disabled={isLoading}
                  placeholder='••••••••'
                  className='w-full h-[46px] bg-gray-800 border border-gray-700 rounded-xl px-4 pr-12
                             text-[14px] text-white placeholder-gray-600 outline-none
                             focus:border-[#f51111] focus:ring-2 focus:ring-[#f51111]/15
                             transition-all duration-200 disabled:opacity-50'
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(p => !p)}
                  className='absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8
                             flex items-center justify-center rounded-full
                             text-gray-500 hover:text-gray-300 transition-colors'
                >
                  {showPassword ? <FaEyeSlash size={16} /> : <FaRegEye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type='submit'
              disabled={!validForm || isLoading}
              className='mt-2 w-full h-[48px] rounded-xl font-[700] text-[14px] text-white
                         flex items-center justify-center gap-2
                         disabled:opacity-40 disabled:cursor-not-allowed
                         active:scale-[0.98] transition-all duration-200'
              style={{
                background: validForm && !isLoading
                  ? 'linear-gradient(135deg,#ff4444 0%,#f51111 100%)'
                  : '#374151',
                boxShadow: validForm && !isLoading
                  ? '0 4px 14px rgba(245,17,17,0.4)' : 'none',
              }}
            >
              {isLoading
                ? <><CircularProgress size={18} color='inherit' /> Verifying…</>
                : <><MdAdminPanelSettings size={18} /> Sign In as Admin</>
              }
            </button>

          </form>

          {/* Footer note */}
          <p className='text-center text-[11px] text-gray-600 mt-6'>
            Not an admin?{' '}
            <a href='/login' className='text-gray-400 hover:text-white transition-colors'>
              Go to user login
            </a>
          </p>
        </div>

        {/* Security badge */}
        <p className='text-center text-[11px] text-gray-600 mt-4 flex items-center justify-center gap-1.5'>
          <MdAdminPanelSettings size={13} />
          All admin actions are logged and monitored
        </p>
      </div>
    </section>
  )
}

export default LoginAdmin