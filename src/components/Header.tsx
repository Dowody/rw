import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { 
  Gamepad2, 
  Menu, 
  ShoppingCart, 
  User, 
  X,
  LogOut,
  Settings,
  BarChart2
} from 'lucide-react'
import { SiDiscord } from 'react-icons/si'
import { useCart, CartItem } from './context/CartContext'
import { supabase } from '../lib/supabaseClient'

const smoothScrollToSection = (sectionId: string) => {
  const section = document.querySelector(sectionId)
  if (section) {
    section.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    })
  }
}

const Header = ({ onCartToggle }: { onCartToggle: () => void }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [userAvatar, setUserAvatar] = useState('')
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  
  const navigate = useNavigate()
  const location = useLocation()
  const { cart } = useCart()

  // Navigation Items
  const navItems = [
    { name: 'Home', href: '/', scrollTo: '#hero' },
    { name: 'Features', href: '/', scrollTo: '#features' },
    { name: 'How It Works', href: '/', scrollTo: '#how-it-works' },
    { name: 'Pricing', href: '/', scrollTo: '#products' },
  ]

  // Check Authentication Status
  const checkAuthStatus = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (session) {
      // Fetch user details from Supabase
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        setIsAuthenticated(true)
        setUserEmail(user.email || '')
        
        // Fetch additional user details if needed
        const { data: userData } = await supabase
          .from('users')
          .select('avatar_url')
          .eq('id', user.id)
          .single()

        setUserAvatar(userData?.avatar_url || '/avatar.jpg')
      }
    } else {
      setIsAuthenticated(false)
      setUserEmail('')
      setUserAvatar('')
    }
  }, [])

  // Scroll and scroll event listeners
  const handleScroll = () => {
    setIsScrolled(window.scrollY > 50)
    // Force close both dropdowns on scroll
    setIsAccountDropdownOpen(false)
    setIsMobileMenuOpen(false)
  }

  useEffect(() => {
    // Initial check
    checkAuthStatus()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN') {
          checkAuthStatus()
        } else if (event === 'SIGNED_OUT') {
          setIsAuthenticated(false)
          setUserEmail('')
          setUserAvatar('')
        }
      }
    )

    // Scroll and scroll event listeners
    window.addEventListener('scroll', handleScroll)
    
    // Cleanup
    return () => {
      subscription.unsubscribe()
      window.removeEventListener('scroll', handleScroll)
    }
  }, [checkAuthStatus])

  // Logout Handler
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('Error logging out:', error)
      }

      // Close mobile menu and navigate to home
      setIsMobileMenuOpen(false)
      navigate('/')
    } catch (err) {
      console.error('Logout failed', err)
    }
  }

  // Navigation Handler
  const handleNavigation = useCallback((href: string, scrollTo?: string) => {
    // If on home page, use smooth scroll
    if (location.pathname === '/' && scrollTo) {
      smoothScrollToSection(scrollTo)
    } else {
      // Navigate to home and then scroll
      navigate('/', { 
        state: { 
          scrollTo: scrollTo,
          timestamp: Date.now()
        }
      })
    }
    
    // Close mobile menu
    setIsMobileMenuOpen(false)
  }, [location, navigate])

  return (
    <header 
      className={`
        fixed top-0 left-0 right-0 z-50 
        transition-all duration-300 
        ${isScrolled 
          ? 'bg-[#1a0b2e]/70 backdrop-blur-xl shadow-lg' 
          : 'bg-transparent'}
        py-6
      `}
    >
      <div className="container mx-auto px-6 flex justify-between items-center relative">
        {/* Logo */}
        <div 
          onClick={() => handleNavigation('/', '#hero')}
          className="flex items-center space-x-4 cursor-pointer hover:scale-105 transition-transform"
        >
          <Gamepad2 className="text-[#8a4fff] w-8 h-8 md:w-10 md:h-10" />
          <span className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#8a4fff] to-[#5e3c9b]">
            RollWithdraw
          </span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-10">
          {navItems.map((item, index) => (
            <motion.button 
              key={index} 
              onClick={() => handleNavigation(item.href, item.scrollTo)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="text-lg text-gray-300 hover:text-[#8a4fff] transition-colors cursor-pointer"
            >
              {item.name}
            </motion.button>
          ))}
          
          {/* Desktop Action Buttons */}
          <div className="flex items-center space-x-6">
            <div className="relative">
              <button 
                onClick={onCartToggle}
                className="text-gray-300 mr-5 hover:text-[#8a4fff] transition-colors relative"
              >
                <ShoppingCart className="w-6 h-6" />
                {cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cart.reduce((total: number, item: CartItem) => total + item.quantity, 0)}
                  </span>
                )}
              </button>
              <AnimatePresence>
                {isCartOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute z-50 right-0 top-full mt-2 bg-[#2c1b4a] border border-[#8a4fff]/20 rounded-lg shadow-lg p-2 w-72"
                  >
                    {/* Cart content */}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <a 
              href="https://discord.gg/rollwithdraw" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-[#5865F2] text-white px-6 py-3 rounded-xl hover:bg-[#4752C4] transition-colors flex items-center"
            >
              <SiDiscord className="w-5 h-5 mr-2" /> Contact
            </a>
            
            {/* Authentication Button */}
            {isAuthenticated ? (
              <div className="relative group">
                <img 
                  src={userAvatar} 
                  alt="User Avatar" 
                  className="w-10 h-10 rounded-full cursor-pointer border-2 border-[#8a4fff]"
                  onClick={() => setIsAccountDropdownOpen(!isAccountDropdownOpen)}
                />
                <AnimatePresence>
                  {isAccountDropdownOpen && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.8, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.8, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute z-50 right-0 top-full mt-2 bg-[#2c1b4a] border border-[#8a4fff]/20 rounded-lg shadow-lg p-2 w-56"
                    >
                      <div className="px-4 py-2 border-b border-[#8a4fff]/10 mb-2">
                        <p className="text-sm text-gray-300">Signed in as</p>
                        <p className="font-semibold text-white truncate">
                          {userEmail}
                        </p>
                      </div>
                      <button 
                        onClick={() => {
                          navigate('/dashboard')
                          setIsAccountDropdownOpen(false)
                        }}
                        className="flex items-center w-full text-left px-4 py-2 hover:bg-[#1a0b2e] transition-colors text-gray-300 hover:text-white"
                      >
                        <BarChart2 className="mr-3 w-4 h-4" /> Dashboard
                      </button>
                      <button 
                        onClick={() => {
                          navigate('/dashboard?section=settings')
                          setIsAccountDropdownOpen(false)
                        }}
                        className="flex items-center w-full text-left px-4 py-2 hover:bg-[#1a0b2e] transition-colors text-gray-300 hover:text-white"
                      >
                        <Settings className="mr-3 w-4 h-4" /> Account Settings
                      </button>
                      <button 
                        onClick={handleLogout}
                        className="flex items-center w-full text-left px-4 py-2 hover:bg-[#1a0b2e] transition-colors text-red-400 hover:text-red-500"
                      >
                        <LogOut className="mr-3 w-4 h-4" /> Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button 
                onClick={() => navigate('/signin', { state: { from: location.pathname } })}
                className="bg-[#6a3de3] text-white px-6 py-3 rounded-xl hover:bg-[#5a2cc2] transition-colors flex items-center"
              >
                <User className="w-5 h-5 mr-2" /> Sign In
              </button>
            )}
          </div>
        </nav>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden flex items-center space-x-4">
          <button 
            onClick={onCartToggle}
            className="text-gray-300 hover:text-[#8a4fff] transition-colors relative"
          >
            <ShoppingCart className="w-6 h-6 mr-1" />
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {cart.reduce((total: number, item: CartItem) => total + item.quantity, 0)}
              </span>
            )}
          </button>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-gray-300 hover:text-[#8a4fff] transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 20 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute top-full left-0 w-full bg-[#2c1b4a]/90 backdrop-blur-xl shadow-lg overflow-hidden md:hidden"
            >
              <div className="container mx-auto px-6 py-8">
                <div className="flex flex-col space-y-6">
                  {/* Authenticated User Section */}
                  {isAuthenticated && (
                    <div className="flex flex-col space-y-4 mb-4 border-b border-[#8a4fff]/10 pb-4">
                      <div className="flex items-center space-x-4">
                        <img 
                          src={userAvatar} 
                          alt="User Avatar" 
                          className="w-16 h-16 rounded-full border-4 border-[#8a4fff] object-cover"
                        />
                        <div>
                          <p className="text-xl font-semibold text-white">{userEmail}</p>
                          <p className="text-gray-400 text-sm">Verified User</p>
                        </div>
                      </div>

                      {/* Prominent Account Action Buttons */}
                      <div className="grid grid-cols-2 gap-4">
                        <motion.button 
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            navigate('/dashboard')
                            setIsMobileMenuOpen(false)
                          }}
                          className="flex items-center justify-center space-x-2 bg-[#8a4fff]/20 text-[#8a4fff] 
                          py-3 rounded-xl hover:bg-[#8a4fff]/30 transition-colors"
                        >
                          <BarChart2 className="w-5 h-5" />
                          <span>Dashboard</span>
                        </motion.button>

                        <motion.button 
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleLogout}
                          className="flex items-center justify-center space-x-2 bg-red-500/10 text-red-400 
                          py-3 rounded-xl hover:bg-red-500/20 transition-colors"
                        >
                          <LogOut className="w-5 h-5" />
                          <span>Logout</span>
                        </motion.button>
                      </div>
                    </div>
                  )}

                  {/* Mobile Navigation Items */}
                  {navItems.map((item, index) => (
                    <motion.button
                      key={index}
                      onClick={() => handleNavigation(item.href, item.scrollTo)}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="text-lg text-gray-300 hover:text-[#8a4fff] transition-colors cursor-pointer text-left"
                    >
                      {item.name}
                    </motion.button>
                  ))}

                  {/* Mobile Action Buttons */}
                  <div className="flex flex-col space-y-4">
                    <a 
                      href="https://discord.gg/rollwithdraw"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-[#5865F2] text-white px-6 py-3 rounded-xl hover:bg-[#4752C4] transition-colors flex items-center justify-center"
                    >
                      <SiDiscord className="w-5 h-5 mr-2" /> Contact
                    </a>
                    
                    {/* Conditional Sign In Button */}
                    {!isAuthenticated && (
                      <button 
                        onClick={() => {
                          navigate('/signin', { state: { from: location.pathname } })
                          setIsMobileMenuOpen(false)
                        }}
                        className="flex-1 bg-[#6a3de3] text-white px-6 py-3 rounded-xl hover:bg-[#5a2cc2] transition-colors flex items-center justify-center"
                      >
                        <User className="w-5 h-5 mr-2" /> Sign In
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  )
}

export default Header
