import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { RiMenu2Line } from 'react-icons/ri'
import { MdSearch } from 'react-icons/md'
import { FaRegUser } from 'react-icons/fa6'
import { IoMdLogOut } from 'react-icons/io'
import { BsPersonBoundingBox } from 'react-icons/bs'
import { Mycontext } from '../../App'
import { postData } from '../../utils/api'

const C = {
  bg: '#0f1117',
  surface: '#1a1f2b',
  border: '#2a3040',
  red: '#f51111',
  redSoft: 'rgba(245,17,17,0.12)',
  text: '#ffffff',
  muted: '#9ca3af',
}

const Header = ({ toggleSidebar }) => {
  const context = React.useContext(Mycontext)
  const navigate = useNavigate()

  const [menuOpen, setMenuOpen] = React.useState(false)
  const [searchVal, setSearchVal] = React.useState('')
  const [searchFocus, setSearchFocus] = React.useState(false)
  const menuRef = React.useRef(null)

  React.useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = async () => {
    setMenuOpen(false)
    try {
      await postData('/api/user/logout')
    } catch {}
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    context.setIsLogin(false)
    context.setUserData(null)
    navigate('/login')
  }

  return (
    <header
      className='flex items-center gap-3 px-4 sm:px-5 h-[60px] border-b sticky top-0 z-30 flex-shrink-0'
      style={{
        background: C.bg,
        borderColor: C.border,
      }}
    >
      {/* Hamburger */}
      <button
        onClick={toggleSidebar}
        className='w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all border'
        style={{
          color: C.muted,
          borderColor: C.border,
          background: C.surface,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#222838'
          e.currentTarget.style.color = C.text
          e.currentTarget.style.borderColor = '#3a4255'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = C.surface
          e.currentTarget.style.color = C.muted
          e.currentTarget.style.borderColor = C.border
        }}
      >
        <RiMenu2Line size={18} />
      </button>

      {/* Search */}
      <div
        className='flex items-center gap-2 rounded-xl px-3 h-10 border flex-1 max-w-[320px]'
        style={{
          background: C.surface,
          borderColor: searchFocus ? C.red : C.border,
          boxShadow: searchFocus ? '0 0 0 3px rgba(245,17,17,0.08)' : 'none',
          transition: 'all 0.2s ease',
        }}
      >
        <MdSearch
          size={16}
          style={{
            color: searchFocus ? C.red : C.muted,
            flexShrink: 0,
            transition: 'color 0.2s ease',
          }}
        />
        <input
          value={searchVal}
          onChange={(e) => setSearchVal(e.target.value)}
          onFocus={() => setSearchFocus(true)}
          onBlur={() => setSearchFocus(false)}
          placeholder='Search…'
          className='bg-transparent outline-none text-[13px] w-full'
          style={{ color: C.text }}
        />
      </div>

      {/* Right side */}
      <div className='ml-auto flex items-center gap-2'>
        <div className='relative' ref={menuRef}>
          <button
            onClick={() => setMenuOpen((p) => !p)}
            className='flex items-center gap-2 rounded-xl px-2.5 py-1.5 border transition-all'
            style={{
              background: menuOpen ? '#222838' : C.surface,
              borderColor: menuOpen ? 'rgba(245,17,17,0.35)' : C.border,
            }}
            onMouseEnter={(e) => {
              if (!menuOpen) {
                e.currentTarget.style.background = '#222838'
                e.currentTarget.style.borderColor = '#3a4255'
              }
            }}
            onMouseLeave={(e) => {
              if (!menuOpen) {
                e.currentTarget.style.background = C.surface
                e.currentTarget.style.borderColor = C.border
              }
            }}
          >
            <div
              className='w-8 h-8 rounded-full overflow-hidden border flex-shrink-0'
              style={{ borderColor: 'rgba(245,17,17,0.35)' }}
            >
              {context.userData?.avatar ? (
                <img
                  src={context.userData.avatar}
                  alt=''
                  className='w-full h-full object-cover'
                />
              ) : (
                <div
                  className='w-full h-full flex items-center justify-center'
                  style={{ background: C.redSoft }}
                >
                  <BsPersonBoundingBox size={15} style={{ color: C.red }} />
                </div>
              )}
            </div>

            <div className='hidden sm:block text-left'>
              <p
                className='text-[12px] font-[700] leading-none'
                style={{ color: C.text }}
              >
                {context.userData?.name || 'Admin'}
              </p>
              <p className='text-[10px] mt-0.5' style={{ color: C.red }}>
                Admin
              </p>
            </div>

            <svg
              width='10'
              height='10'
              viewBox='0 0 10 10'
              className='hidden sm:block flex-shrink-0'
              style={{
                color: C.muted,
                transform: menuOpen ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.2s',
              }}
            >
              <path
                d='M1 3l4 4 4-4'
                stroke='currentColor'
                strokeWidth='1.5'
                fill='none'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            </svg>
          </button>

          {menuOpen && (
            <div
              className='absolute right-0 top-[calc(100%+8px)] w-[230px] rounded-2xl border overflow-hidden z-50'
              style={{
                background: '#1a1f2b',
                borderColor: C.border,
                boxShadow: '0 20px 60px rgba(0,0,0,0.55)',
              }}
            >
              {context.userData && (
                <div
                  className='flex items-center gap-3 px-4 py-3.5 border-b'
                  style={{ borderColor: C.border }}
                >
                  <div
                    className='w-10 h-10 rounded-full overflow-hidden border flex-shrink-0'
                    style={{ borderColor: 'rgba(245,17,17,0.35)' }}
                  >
                    {context.userData.avatar ? (
                      <img
                        src={context.userData.avatar}
                        alt=''
                        className='w-full h-full object-cover'
                      />
                    ) : (
                      <div
                        className='w-full h-full flex items-center justify-center text-[14px] font-[800]'
                        style={{ background: C.redSoft, color: C.red }}
                      >
                        {context.userData.name?.charAt(0)?.toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className='flex-1 min-w-0'>
                    <p
                      className='text-[13px] font-[700] truncate'
                      style={{ color: C.text }}
                    >
                      {context.userData.name}
                    </p>
                    <p
                      className='text-[11px] truncate'
                      style={{ color: C.muted }}
                    >
                      {context.userData.email}
                    </p>
                  </div>
                </div>
              )}

              <div className='py-1.5'>
                <Link
                  to='/profile'
                  onClick={() => setMenuOpen(false)}
                  className='flex items-center gap-3 px-4 py-2.5 text-[13px] font-[500] no-underline transition-all'
                  style={{ color: C.muted }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                    e.currentTarget.style.color = C.text
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = C.muted
                  }}
                >
                  <FaRegUser size={14} style={{ flexShrink: 0 }} />
                  My Account
                </Link>

                <button
                  onClick={handleLogout}
                  className='w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-[500] transition-all'
                  style={{
                    color: C.muted,
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = C.redSoft
                    e.currentTarget.style.color = '#ff7b7b'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = C.muted
                  }}
                >
                  <IoMdLogOut size={15} style={{ flexShrink: 0 }} />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header