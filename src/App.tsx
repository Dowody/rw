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

// Lazy load components
const Home = React.lazy(() => import('./components/Home'))
const SignInPage = React.lazy(() => import('./components/SignInPage'))
const CheckoutPage = React.lazy(() => import('./components/CheckoutPage'))
const TermsOfService = React.lazy(() => import('./components/TermsOfService'))
const PrivacyPolicy = React.lazy(() => import('./components/PrivacyPolicy'))
const RefundPolicy = React.lazy(() => import('./components/RefundPolicy'))
const PolicyPage = React.lazy(() => import('./components/PolicyPage'))
const UserDashboard = React.lazy(() => import('./components/UserDashboard'))

// Loading spinner
// const LoadingSpinner = () => (
//   <div className="fixed inset-0 flex items-center justify-center bg-[#04011C] z-50">
//     <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[#8a4fff]"></div>
//   </div>
// )

// Initial Load Wrapper
const InitialLoadWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoad(false)
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  // if (isInitialLoad) {
  //   return <LoadingSpinner />
  // }

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

  if (!isInitialized) {
    // return <LoadingSpinner />
  }

  return (
    <div className="bg-[#0a0415] text-white min-h-screen">
      <Header onCartToggle={toggleCart} />
      <CartDropdown isOpen={isCartOpen} onClose={closeCart} />
      <DiscordButton />

      <AnimatePresence mode="wait" initial={false}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route 
            path="/signin" 
            element={
              isAuthenticated ? <Navigate to="/" replace /> : <SignInPage />
            } 
          />
          <Route 
            path="/checkout" 
            element={
              <PrivateRoute>
                <CheckoutPage />
              </PrivateRoute>
            } 
          />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/refund" element={<RefundPolicy />} />
          <Route path="/policy" element={<PolicyPage />} />
          <Route 
            path="/dashboard" 
            element={
              <PrivateRoute>
                <UserDashboard />
              </PrivateRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
          <Route path="/reset-password" element={<PasswordResetPage />} />
        </Routes>
      </AnimatePresence>
    </div>
  )
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