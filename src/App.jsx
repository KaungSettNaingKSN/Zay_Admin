import './App.css'
import { createBrowserRouter, RouterProvider, Navigate, Outlet, useLocation } from 'react-router-dom'
import React, { useEffect, createContext } from 'react'
import Dialog from '@mui/material/Dialog'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Slide from '@mui/material/Slide'
import { IoIosClose } from 'react-icons/io'
import toast, { Toaster } from 'react-hot-toast'
import { setOnAuthFail } from './utils/axiosInstance'
import { fetchData } from './utils/api'

import Header from './components/Header'
import Sidebar from './components/Sidebar'
import OrderItem from './components/OrderItem'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Products from './pages/Products'
import AddProduct from './pages/Products/addProduct'
import EditProduct from './pages/Products/editProduct'
import ProductDetails from './pages/Products/productDetails'
import AddRam from './pages/Products/addRam'
import AddColor from './pages/Products/addColor'
import AddSize from './pages/Products/addSize'
import AddWeight from './pages/Products/addWeight'
import HomeBanner from './pages/HomeBanner'
import AddHomeBanner from './pages/HomeBanner/addHomeBanner'
import EditHomeBanner from './pages/HomeBanner/editHomeBanner'
import CategoryList from './pages/Category'
import AddCategory from './pages/Category/addCategory'
import EditCategory from './pages/Category/editCategory'
import SubCategory from './pages/Category/subCategory'
import AddSubCategory from './pages/Category/addSubCategory'
import Users from './pages/Users'
import Orders from './pages/Orders'
import Profile from './pages/Profile'
import AddAddress from './pages/Address/addAddress'

const Mycontext = createContext()
const Transition = React.forwardRef((props, ref) => <Slide direction='up' ref={ref} {...props} />)

const SIDEBAR_W = 220

const APP_C = {
  bg: '#0f1117',
  surface: '#161b26',
  card: '#1a1f2b',
  card2: '#222838',
  border: '#2a3040',
  text: '#ffffff',
  muted: '#9ca3af',
  red: '#f51111',
  redSoft: 'rgba(245,17,17,0.12)',
}

const AdminLayout = ({ sidebarOpen, toggleSidebar, setSidebarOpen }) => {
  const location = useLocation()

  React.useEffect(() => {
    if (window.innerWidth < 768) setSidebarOpen(false)
  }, [location.pathname, setSidebarOpen])

  return (
    <section className='flex min-h-screen' style={{ background: APP_C.bg }}>
      {/* Backdrop */}
      <div
        onClick={toggleSidebar}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 40,
          background: 'rgba(0,0,0,0.55)',
          backdropFilter: 'blur(4px)',
          opacity: sidebarOpen ? 1 : 0,
          pointerEvents: sidebarOpen ? 'auto' : 'none',
          transition: 'opacity 0.35s cubic-bezier(0.4,0,0.2,1)',
        }}
        className='md:hidden'
      />

      {/* Sidebar */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100%',
          width: `${SIDEBAR_W}px`,
          zIndex: 50,
          transform: sidebarOpen ? 'translateX(0)' : `translateX(-${SIDEBAR_W}px)`,
          transition: 'transform 0.35s cubic-bezier(0.4,0,0.2,1)',
          boxShadow: sidebarOpen
            ? '6px 0 32px rgba(0,0,0,0.45), 1px 0 0 rgba(255,255,255,0.05)'
            : 'none',
          willChange: 'transform',
        }}
      >
        <Sidebar />
      </div>

      {/* Desktop spacer */}
      <div
        className='hidden md:block flex-shrink-0'
        style={{
          width: sidebarOpen ? `${SIDEBAR_W}px` : '0px',
          transition: 'width 0.35s cubic-bezier(0.4,0,0.2,1)',
          overflow: 'hidden',
        }}
      />

      {/* Main */}
      <div className='flex flex-col flex-1 min-w-0' style={{ minHeight: '100vh', background: APP_C.bg }}>
        <Header toggleSidebar={toggleSidebar} />
        <main className='p-4 md:p-6 flex-1' style={{ background: APP_C.bg }}>
          <Outlet />
        </main>
      </div>
    </section>
  )
}

const AdminRoute = ({ isLogin, authChecked, userData }) => {
  if (!authChecked) return null
  if (!isLogin) return <Navigate to='/login' replace />
  if (userData?.role !== 'Admin') return <Navigate to='/login' replace />
  return <Outlet />
}

const GuestRoute = ({ isLogin, authChecked, userData }) => {
  if (!authChecked) return null
  if (isLogin && userData?.role === 'Admin') return <Navigate to='/' replace />
  return <Outlet />
}

function App() {
  const [sidebarOpen, setSidebarOpen] = React.useState(() => window.innerWidth >= 768)
  const [categories, setCategories] = React.useState([])
  const [products, setProducts] = React.useState([])
  const [userData, setUserData] = React.useState(null)
  const [authChecked, setAuthChecked] = React.useState(false)
  const [isLogin, setIsLogin] = React.useState(() => !!localStorage.getItem('accessToken'))
  const [isOpenFullScreenPanel, setIsOpenFullScreenPanel] = React.useState({
    open: false,
    model: '',
    data: null,
  })
  const [openProductModal, setOpenProductModal] = React.useState(false)

  React.useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setSidebarOpen(true)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const toggleSidebar = () => setSidebarOpen((p) => !p)

  const openAlertBox = React.useCallback((status, message) => {
    if (status === 'success') toast.success(message)
    else toast.error(message)
  }, [])

  useEffect(() => {
    if (!isLogin) {
      setAuthChecked(true)
      return
    }

    const getUser = async () => {
      try {
        const res = await fetchData('/api/user/get-user')
        const user = res?.data?.data

        if (user?.role === 'Admin') {
          setUserData(user)
          setIsLogin(true)
        } else if (user) {
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
          setIsLogin(false)
          setUserData(null)
          openAlertBox('error', 'Access denied — admins only')
        } else {
          setIsLogin(false)
          setUserData(null)
        }
      } catch {
        setIsLogin(false)
        setUserData(null)
      } finally {
        setAuthChecked(true)
      }
    }

    getUser()
  }, [isLogin, openAlertBox])

  useEffect(() => {
    setOnAuthFail(() => {
      setIsLogin(false)
      setUserData(null)
      openAlertBox('error', 'Session expired. Please log in again.')
    })
  }, [openAlertBox])

  const reloadCategories = React.useCallback(async () => {
    try {
      const res = await fetchData('/api/category')
      setCategories(res?.data?.category || [])
    } catch (e) {
      openAlertBox('error', e?.message || 'Failed')
    }
  }, [openAlertBox])

  const reloadProducts = React.useCallback(async (page = 1, perPage = 10) => {
    try {
      const res = await fetchData(`/api/product/?page=${page}&perPage=${perPage}`)
      setProducts(res?.data?.product || [])
    } catch (e) {
      console.error(e)
    }
  }, [])

  const handleOpenFullScreenPanel = (model = '', data = null) =>
    setIsOpenFullScreenPanel({ open: true, model, data })

  const handleCloseFullScreenPanel = () =>
    setIsOpenFullScreenPanel({ open: false, model: '', data: null })

  const value = React.useMemo(
    () => ({
      setOpenProductModal,
      isLogin,
      setIsLogin,
      authChecked,
      userData,
      setUserData,
      categories,
      setCategories,
      reloadCategories,
      products,
      setProducts,
      reloadProducts,
      isOpenFullScreenPanel,
      setIsOpenFullScreenPanel,
      handleOpenFullScreenPanel,
      handleCloseFullScreenPanel,
      openAlertBox,
      setSidebarOpen,
    }),
    [
      isLogin,
      authChecked,
      userData,
      categories,
      products,
      isOpenFullScreenPanel,
      reloadCategories,
      reloadProducts,
      openAlertBox,
    ]
  )

  const router = React.useMemo(
    () =>
      createBrowserRouter([
        {
          element: <GuestRoute isLogin={isLogin} authChecked={authChecked} userData={userData} />,
          children: [{ path: '/login', element: <Login /> }],
        },
        {
          element: <AdminRoute isLogin={isLogin} authChecked={authChecked} userData={userData} />,
          children: [
            {
              element: (
                <AdminLayout
                  sidebarOpen={sidebarOpen}
                  toggleSidebar={toggleSidebar}
                  setSidebarOpen={setSidebarOpen}
                />
              ),
              children: [
                { path: '/', element: <Dashboard /> },
                { path: '/products', element: <Products /> },
                { path: '/product/:id', element: <ProductDetails /> },
                { path: '/productRam', element: <AddRam /> },
                { path: '/productColor', element: <AddColor /> },
                { path: '/productSize', element: <AddSize /> },
                { path: '/productWeight', element: <AddWeight /> },
                { path: '/homeBanner', element: <HomeBanner /> },
                { path: '/category', element: <CategoryList /> },
                { path: '/subcategory', element: <SubCategory /> },
                { path: '/users', element: <Users /> },
                { path: '/orders', element: <Orders /> },
                { path: '/profile', element: <Profile /> },
              ],
            },
          ],
        },
        { path: '*', element: <Navigate to='/' replace /> },
      ]),
    [isLogin, authChecked, userData, sidebarOpen]
  )

  if (!authChecked) {
    return (
      <div
        className='min-h-screen flex items-center justify-center'
        style={{ background: APP_C.bg }}
      >
        <div
          className='w-11 h-11 rounded-full border-[3px] animate-spin'
          style={{ borderColor: `${APP_C.red} transparent transparent transparent` }}
        />
      </div>
    )
  }

  return (
    <Mycontext.Provider value={value}>
      <RouterProvider router={router} />

      <Toaster
        position='top-center'
        reverseOrder={false}
        toastOptions={{
          style: {
            background: APP_C.card,
            color: APP_C.text,
            border: `1px solid ${APP_C.border}`,
            fontSize: '13px',
            borderRadius: '12px',
            boxShadow: '0 12px 30px rgba(0,0,0,0.25)',
          },
          success: {
            iconTheme: {
              primary: '#22c55e',
              secondary: APP_C.card,
            },
          },
          error: {
            iconTheme: {
              primary: APP_C.red,
              secondary: APP_C.card,
            },
          },
        }}
      />

      <Dialog
        open={openProductModal}
        onClose={() => setOpenProductModal(false)}
        fullWidth
        maxWidth='lg'
        PaperProps={{
          sx: {
            backgroundColor: APP_C.card,
            color: APP_C.text,
            border: `1px solid ${APP_C.border}`,
            borderRadius: '16px',
          },
        }}
      >
        <OrderItem />
      </Dialog>

      <Dialog
        fullScreen
        open={isOpenFullScreenPanel.open}
        onClose={handleCloseFullScreenPanel}
        slots={{ transition: Transition }}
        PaperProps={{
          sx: {
            backgroundColor: APP_C.bg,
            color: APP_C.text,
          },
        }}
      >
        <AppBar
          sx={{
            position: 'relative',
            background: APP_C.surface,
            borderBottom: `1px solid ${APP_C.border}`,
            boxShadow: 'none',
          }}
        >
          <Toolbar>
            <IconButton edge='start' onClick={handleCloseFullScreenPanel} sx={{ color: APP_C.text }}>
              <IoIosClose />
            </IconButton>

            <Typography
              sx={{
                ml: 2,
                flex: 1,
                color: APP_C.text,
                fontSize: '15px',
                fontWeight: 700,
              }}
            >
              {isOpenFullScreenPanel?.model}
            </Typography>
          </Toolbar>
        </AppBar>

        {isOpenFullScreenPanel.model === 'Add Product' && <AddProduct />}
        {isOpenFullScreenPanel.model === 'Add Banner' && <AddHomeBanner />}
        {isOpenFullScreenPanel.model === 'Add Category' && <AddCategory />}
        {isOpenFullScreenPanel.model === 'Add Sub Category' && <AddSubCategory />}
        {isOpenFullScreenPanel.model === 'Add Address' && <AddAddress />}
        {isOpenFullScreenPanel.model === 'Edit Category' && (
          <EditCategory data={isOpenFullScreenPanel.data} />
        )}
        {isOpenFullScreenPanel.model === 'Edit Product' && (
          <EditProduct data={isOpenFullScreenPanel.data} />
        )}
        {isOpenFullScreenPanel.model === 'Edit Banner' && (
          <EditHomeBanner data={isOpenFullScreenPanel.data} />
        )}
      </Dialog>
    </Mycontext.Provider>
  )
}

export default App
export { Mycontext }