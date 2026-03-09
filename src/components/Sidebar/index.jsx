import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { RiDashboardLine } from 'react-icons/ri'
import { IoIosImages } from 'react-icons/io'
import { FaAngleDown, FaUsers } from 'react-icons/fa'
import { HiMiniSquare3Stack3D } from 'react-icons/hi2'
import { MdCategory } from 'react-icons/md'
import { LuBaggageClaim, LuLogOut } from 'react-icons/lu'
import { FaRegUser } from 'react-icons/fa6'
import { Mycontext } from '../../App'
import { postData } from '../../utils/api'

const C = {
  bg:      '#111118',
  surface: '#16161f',
  border:  'rgba(255,255,255,0.07)',
  red:     '#f51111',
  redSoft: 'rgba(245,17,17,0.12)',
  text:    '#f0f0f5',
  muted:   '#6b7280',
}

// ── Collapsible submenu ───────────────────────────────────────────────────────
const SubMenu = ({ isOpen, children }) => {
  const ref = React.useRef(null)
  const [height, setHeight] = React.useState(0)
  React.useEffect(() => {
    if (ref.current) setHeight(isOpen ? ref.current.scrollHeight : 0)
  }, [isOpen])
  return (
    <div style={{ height, overflow: 'hidden', transition: 'height 0.25s ease' }}>
      <div ref={ref}>{children}</div>
    </div>
  )
}

// ── Nav item ──────────────────────────────────────────────────────────────────
const NavItem = ({ to, icon: Icon, label, end = false }) => (
  <NavLink to={to} end={end}
    className='flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] no-underline transition-all relative'
    style={({ isActive }) => ({
      color:      isActive ? '#fff' : C.muted,
      background: isActive ? C.redSoft : 'transparent',
      fontWeight: isActive ? 700 : 500,
    })}
  >
    {({ isActive }) => (
      <>
        {isActive && (
          <span className='absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full'
            style={{ background: C.red }} />
        )}
        <Icon size={15} style={{ color: isActive ? C.red : C.muted, flexShrink: 0 }} />
        <span>{label}</span>
      </>
    )}
  </NavLink>
)

// ── Nav group (collapsible) ───────────────────────────────────────────────────
// FIX: added !important-equivalent inline styles to override any CSS reset
// that was turning nav button text black
const NavGroup = ({ icon: Icon, label, isOpen, onToggle, children }) => (
  <div>
    <button
      onClick={onToggle}
      className='w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] transition-all'
      style={{
        // Explicit overrides — nav button { color: black } in index.css was winning
        color:      isOpen ? C.text : C.muted,
        fontWeight: isOpen ? 700 : 500,
        background: isOpen ? 'rgba(255,255,255,0.04)' : 'transparent',
        // Reset browser/MUI button defaults
        border:     'none',
        outline:    'none',
        cursor:     'pointer',
        textAlign:  'left',
        lineHeight: 1,
      }}
    >
      <Icon size={15} style={{ color: isOpen ? C.red : C.muted, flexShrink: 0 }} />
      <span className='flex-1 text-left' style={{ color: 'inherit' }}>{label}</span>
      <FaAngleDown size={11} style={{
        transition: 'transform 0.25s',
        transform:  isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
        color:      C.muted,
        flexShrink: 0,
      }} />
    </button>
    <SubMenu isOpen={isOpen}>
      <div className='pl-5 pt-0.5 pb-1 flex flex-col gap-0.5'>
        {children}
      </div>
    </SubMenu>
  </div>
)

// ── Sub nav item ──────────────────────────────────────────────────────────────
const SubNavItem = ({ to, label }) => (
  <NavLink to={to}
    className='flex items-center gap-2 px-3 py-1.5 rounded-lg text-[12px] no-underline transition-all'
    style={({ isActive }) => ({
      color:      isActive ? '#fff' : C.muted,
      background: isActive ? C.redSoft : 'transparent',
      fontWeight: isActive ? 700 : 500,
    })}
  >
    {({ isActive }) => (
      <>
        <span className='w-1.5 h-1.5 rounded-full flex-shrink-0'
          style={{ background: isActive ? C.red : C.muted }} />
        <span style={{ color: 'inherit' }}>{label}</span>
      </>
    )}
  </NavLink>
)

// ── Sidebar ───────────────────────────────────────────────────────────────────
const Sidebar = () => {
  const context  = React.useContext(Mycontext)
  const navigate = useNavigate()
  const [openMenu, setOpenMenu] = React.useState(null)

  const toggle = (key) => setOpenMenu(p => p === key ? null : key)

  const handleLogout = async () => {
    try { await postData('/api/user/logout') } catch {}
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    context.setIsLogin(false)
    context.setUserData(null)
    navigate('/login')
  }

  return (
    <div className='flex flex-col h-full' style={{ background: C.bg }}>

      {/* Logo */}
      <div className='flex items-center gap-3 px-5 py-5 border-b flex-shrink-0'
        style={{ borderColor: C.border }}>
        <div className='w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0'
          style={{ background: C.redSoft }}>
          <RiDashboardLine size={17} style={{ color: C.red }} />
        </div>
        <div>
          <p className='text-[14px] font-[900] tracking-tight' style={{ color: C.text }}>ZAY</p>
          <p className='text-[10px] font-[500] uppercase tracking-widest' style={{ color: C.muted }}>Admin Panel</p>
        </div>
      </div>

      {/* Nav
          FIX: added style={{ color: C.muted }} on <nav> so the CSS rule
          "nav button { color: black }" is overridden by specificity        */}
      <nav className='flex-1 px-3 py-4 flex flex-col gap-0.5 overflow-y-auto'
        style={{ color: C.muted }}>

        <NavItem to='/'          icon={RiDashboardLine}     label='Dashboard'   end />
        <NavItem to='/homeBanner' icon={IoIosImages}         label='Home Slider'    />
        <NavItem to='/users'      icon={FaUsers}             label='Users'          />

        <NavGroup
          icon={HiMiniSquare3Stack3D}
          label='Products'
          isOpen={openMenu === 'products'}
          onToggle={() => toggle('products')}
        >
          <SubNavItem to='/products'      label='View Products' />
          <SubNavItem to='/productRam'    label='Add RAM'       />
          <SubNavItem to='/productColor'  label='Add Color'     />
          <SubNavItem to='/productSize'   label='Add Size'      />
          <SubNavItem to='/productWeight' label='Add Weight'    />
        </NavGroup>

        <NavGroup
          icon={MdCategory}
          label='Categories'
          isOpen={openMenu === 'categories'}
          onToggle={() => toggle('categories')}
        >
          <SubNavItem to='/category'    label='Category'     />
          <SubNavItem to='/subcategory' label='Sub Category' />
        </NavGroup>

        <NavItem to='/orders'  icon={LuBaggageClaim} label='Orders'  />
        <NavItem to='/profile' icon={FaRegUser}      label='Profile' />

      </nav>

      {/* User card + logout */}
      <div className='px-3 pb-4 flex-shrink-0 border-t pt-3' style={{ borderColor: C.border }}>
        {context?.userData && (
          <div className='flex items-center gap-2.5 px-3 py-2.5 rounded-xl mb-2 border'
            style={{ background: C.surface, borderColor: C.border }}>
            <div className='w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border'
              style={{ borderColor: 'rgba(245,17,17,0.25)' }}>
              {context.userData.avatar
                ? <img src={context.userData.avatar} alt='' className='w-full h-full object-cover' />
                : <div className='w-full h-full flex items-center justify-center text-[12px] font-[800]'
                    style={{ background: C.redSoft, color: C.red }}>
                    {context.userData.name?.charAt(0)?.toUpperCase()}
                  </div>
              }
            </div>
            <div className='flex-1 min-w-0'>
              <p className='text-[12px] font-[700] truncate' style={{ color: C.text }}>{context.userData.name}</p>
              <p className='text-[10px] truncate' style={{ color: C.muted }}>{context.userData.email}</p>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          className='w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-[600] transition-all'
          style={{ color: C.muted, background: 'transparent', border: 'none', cursor: 'pointer' }}
          onMouseEnter={e => { e.currentTarget.style.background = C.redSoft; e.currentTarget.style.color = '#f87171' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.muted }}
        >
          <LuLogOut size={15} />
          Logout
        </button>
      </div>
    </div>
  )
}

export default Sidebar