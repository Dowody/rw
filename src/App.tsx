import React, { Suspense, useState, useCallback, useEffect } from 'react'
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { CartProvider } from './components/context/CartContext'
import Header from './components/Header'
import CartDropdown from './components/CartDropdown'
import { supabase } from './lib/supabaseClient'
import { motion } from 'framer-motion'
import PasswordResetPage from './components/PasswordReset'
import DiscordButton from './components/DiscordButton'
import { requireAdmin } from './middleware/adminAuth'
import AdminSignIn from './pages/AdminSignIn'
import AdminDashboard from './pages/AdminDashboard'
import SessionTokenPage from './pages/SessionTokenPage'
import { initializeIPTracking } from './lib/ipTracker'

// Lazy load components
const Home = React.lazy(() => import('./components/Home'))
const SignInPage = React.lazy(() => import('./components/SignInPage'))
const CheckoutPage = React.lazy(() => import('./components/CheckoutPage'))
const TermsOfService = React.lazy(() => import('./components/TermsOfService'))
const PrivacyPolicy = React.lazy(() => import('./components/PrivacyPolicy'))
const PolicyPage = React.lazy(() => import('./components/PolicyPage'))
const UserDashboard = React.lazy(() => import('./components/UserDashboard'))


// Initial Load Wrapper
const InitialLoadWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoad(false)
    }, 100)

    return () => clearTimeout(timer)
  }, [])
  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.div>
  )
}

// Authentication Wrapper Component
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Get current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('Session error:', sessionError)
          throw sessionError
        }
        
        if (session) {
          // Verify the session is still valid
          const { data: { user }, error: userError } = await supabase.auth.getUser()
          
          if (userError) {
            console.error('User verification error:', userError)
            throw userError
          }

          if (user) {
          setIsAuthenticated(true)
          } else {
            // Session exists but user verification failed
            await supabase.auth.signOut()
            throw new Error('Session invalid')
          }
        } else {
          // No session, redirect to sign in
          navigate('/signin', { 
            state: { 
              from: location.pathname,
              message: 'Please sign in to access this page',
            },
          })
        }
      } catch (error) {
        console.error('Authentication check failed:', error)
        // Clear any invalid session data
        await supabase.auth.signOut()
        navigate('/signin', { 
          state: { 
            from: location.pathname,
            message: 'Your session has expired. Please sign in again.',
          },
        })
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false)
        navigate('/signin')
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setIsAuthenticated(true)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [navigate, location])

  // if (isLoading) return <LoadingSpinner />
  return isAuthenticated ? <>{children}</> : null
}

// Main App Component with Routes
const AppContent: React.FC = () => {
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const location = useLocation()
  const [isAdminRoute, setIsAdminRoute] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const toggleCart = useCallback(() => {
    setIsCartOpen(prev => !prev)
  }, [])

  const closeCart = useCallback(() => {
    setIsCartOpen(false)
  }, [])

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setIsAuthenticated(!!session)
      } catch (error) {
        console.error('Failed to check authentication:', error)
        setIsAuthenticated(false)
      } finally {
        setIsInitialized(true)
      }
    }

    checkAuthStatus()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setIsAuthenticated(!!session)
      }
    )

    const openCartHandler = () => setIsCartOpen(true)
    const closeCartHandler = () => setIsCartOpen(false)

    window.addEventListener('openCart', openCartHandler)
    window.addEventListener('closeCart', closeCartHandler)

    return () => {
      subscription.unsubscribe()
      window.removeEventListener('openCart', openCartHandler)
      window.removeEventListener('closeCart', closeCartHandler)
    }
  }, [])

  useEffect(() => {
    const checkAdminAccess = async () => {
      const path = window.location.pathname
      if (path.startsWith('/admin')) {
        setIsAdminRoute(true)
        if (path !== '/admin') {
          const hasAccess = await requireAdmin()
          if (!hasAccess) {
            setIsLoading(false)
            return
          }
        }
      }
      setIsLoading(false)
    }

    checkAdminAccess()
  }, [])

  useEffect(() => {
    // Initialize IP tracking when the app starts
    initializeIPTracking()
  }, [])

  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#04011C] to-[#0a0415] flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[#8a4fff]"></div>
      </div>
    )
  }

  return (
    <CartProvider>
      <div className="min-h-screen bg-gradient-to-br from-[#04011C] to-[#0a0415]">
        {!isAdminRoute && <Header onCartToggle={toggleCart} />}
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Home />} />
            <Route path="/signin" element={<SignInPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/policy" element={<PolicyPage />} />
            <Route path="/session-token" element={<SessionTokenPage />} />
            <Route
              path="/dashboard/*"
              element={
                <PrivateRoute>
                  <UserDashboard />
                </PrivateRoute>
              }
            />
            <Route path="/admin" element={<AdminSignIn />} />
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedAdminRoute>
                  <AdminDashboard />
                </ProtectedAdminRoute>
              }
            />
            <Route path="/reset-password" element={<PasswordResetPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
        {!isAdminRoute && <CartDropdown isOpen={isCartOpen} onClose={closeCart} />}
        {!isAdminRoute && <DiscordButton />}
      </div>
    </CartProvider>
  )
}

// Protected Admin Route Component
const ProtectedAdminRoute = ({ children }: { children: React.ReactNode }) => {
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const hasAccess = await requireAdmin()
      setIsAuthorized(hasAccess)
      setIsChecking(false)
    }

    checkAuth()
  }, [])

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#04011C] to-[#0a0415] flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[#8a4fff]"></div>
      </div>
    )
  }

  return isAuthorized ? <>{children}</> : <Navigate to="/admin" replace />
}

// Root App with Router and Context
const App: React.FC = () => {
  return (
    <Router basename="/rw/">
      <CartProvider>
        <InitialLoadWrapper>
          <AppContent />
        </InitialLoadWrapper>
      </CartProvider>
    </Router>
  )
}

export default App