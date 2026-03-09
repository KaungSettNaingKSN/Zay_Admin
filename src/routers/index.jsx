import { createBrowserRouter } from 'react-router-dom'
import Sidebar      from './components/Sidebar'
import Header       from './components/Header'
import Dashboard    from './pages/Dashboard'
import Products     from './pages/Products'
import HomeBanner   from './pages/HomeBanner'
import CategoryList from './pages/Category'
import SubCategory  from './pages/Category/subCategory'
import Users        from './pages/Users'
import Orders       from './pages/Ordes'
import Login        from './pages/Login'

// ── Reusable page shell ───────────────────────────────────────────────────────
// Keeps your exact original logic: sidebarOpen controls w-[20%] / w-[80%]
// Only change: dark bg, mobile overlay backdrop, fixed sidebar on mobile
const Shell = ({ sidebarOpen, toggleSidebar, children }) => (
  <section
    className='flex min-h-screen'
    style={{ background: '#0a0a0f' }}
  >
    {/* ── Mobile backdrop — tap outside to close ── */}
    {sidebarOpen && (
      <div
        className='fixed inset-0 z-40 md:hidden'
        style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(3px)' }}
        onClick={toggleSidebar}
      />
    )}

    {/* ── Sidebar ──────────────────────────────────────────────────────────
        Mobile  : fixed overlay (z-50), slides in/out via translate
        Desktop : static w-[220px] in normal flow (md:relative, no translate)
    ── */}
    <div
      className={[
        // always fixed on mobile
        'fixed top-0 left-0 h-full z-50',
        // slide in/out on mobile
        sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        // desktop: back to normal flow, always visible
        'md:relative md:translate-x-0 md:z-auto md:h-auto md:min-h-screen',
        'transition-transform duration-300 ease-in-out flex-shrink-0',
      ].join(' ')}
      style={{ width: '220px' }}
    >
      <Sidebar />
    </div>

    {/* ── Main area — same flex logic you had ── */}
    <div className='flex flex-col flex-1 min-w-0 w-full'>
      <Header toggleSidebar={toggleSidebar} />
      <main className='flex-1 p-4 md:p-6'>
        {children}
      </main>
    </div>
  </section>
)

// ── Router — identical structure to yours ─────────────────────────────────────
const createRouter = (sidebarOpen, toggleSidebar) => createBrowserRouter([
  {
    path: '/login',
    exact: true,
    element: <Login />,
  },
  {
    path: '/',
    exact: true,
    element: (
      <Shell sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar}>
        <Dashboard />
      </Shell>
    ),
  },
  {
    path: '/products',
    exact: true,
    element: (
      <Shell sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar}>
        <Products />
      </Shell>
    ),
  },
  {
    path: '/homeBanner',
    exact: true,
    element: (
      <Shell sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar}>
        <HomeBanner />
      </Shell>
    ),
  },
  {
    path: '/category',
    exact: true,
    element: (
      <Shell sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar}>
        <CategoryList />
      </Shell>
    ),
  },
  {
    path: '/subcategory',
    exact: true,
    element: (
      <Shell sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar}>
        <SubCategory />
      </Shell>
    ),
  },
  {
    path: '/users',
    exact: true,
    element: (
      <Shell sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar}>
        <Users />
      </Shell>
    ),
  },
  {
    path: '/orders',
    exact: true,
    element: (
      <Shell sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar}>
        <Orders />
      </Shell>
    ),
  },
])

export default createRouter