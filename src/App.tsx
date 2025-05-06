import React, { Suspense, useState, useCallback, useEffect } from 'react'
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Navigate, 
  useLocation,
  useNavigate 
} from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { CartProvider } from './components/context/CartContext'
import Header from './components/Header'
import CartDropdown from './components/CartDropdown'
import { supabase } from './lib/supabaseClient'

// Lazy load components for better performance
const Home = React.lazy(() => import('./components/Home'))
const SignInPage = React.lazy(() => import('./components/SignInPage'))
const CheckoutPage = React.lazy(() => import('./components/CheckoutPage'))
const TermsOfService = React.lazy(() => import('./components/TermsOfService'))
const PrivacyPolicy = React.lazy(() => import('./components/PrivacyPolicy'))
const RefundPolicy = React.lazy(() => import('./components/RefundPolicy'))
const PolicyPage = React.lazy(() => import('./components/PolicyPage'))
const UserDashboard = React.lazy(() => import('./components/UserDashboard'))

// Loading Spinner Component
const LoadingSpinner = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-[#0a0415] z-50">
    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[#8a4fff]"></div>
  </div>
)

// Authentication Wrapper Component
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session) {
          setIsAuthenticated(true)
        } else {
          navigate('/signin', { 
            state: { 
              from: location.pathname,
              message: 'Please sign in to access this page' 
            }
          })
        }
      } catch (error) {
        console.error('Authentication check failed:', error)
        navigate('/signin')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [navigate, location])

  if (isLoading) {
    return <LoadingSpinner />
  }

  return isAuthenticated ? <>{children}</> : null
}

// Page Transition Wrapper
const PageTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {children}
      </Routes>
    </AnimatePresence>
  )
}

function App() {
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Toggle Cart
  const toggleCart = useCallback(() => {
    setIsCartOpen(prev => !prev)
  }, [])

  // Close Cart
  const closeCart = useCallback(() => {
    setIsCartOpen(false)
  }, [])

  // Check authentication status
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setIsAuthenticated(!!session)
      } catch (error) {
        console.error('Failed to check authentication:', error)
        setIsAuthenticated(false)
      }
    }

    checkAuthStatus()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setIsAuthenticated(!!session)
      }
    )

    // Cart event listeners
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

  return (
    <Router>
      <CartProvider>
        <div className="bg-[#0a0415] text-white min-h-screen">
          <Header onCartToggle={toggleCart} />
          <CartDropdown 
            isOpen={isCartOpen} 
            onClose={closeCart} 
          />
          
          <Suspense fallback={<LoadingSpinner />}>
            <PageTransition>
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
              {/* 404 Route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </PageTransition>
          </Suspense>
        </div>
      </CartProvider>
    </Router>
  )
}

export default App
