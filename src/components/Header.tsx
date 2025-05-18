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
  BarChart2,
  SlidersHorizontal,
  Receipt,
  Wallet,
  Settings2,
  CreditCard,
  BadgeCheck,
  Share2
} from 'lucide-react'
import { SiDiscord } from 'react-icons/si'
import { useCart, CartItem } from './context/CartContext'
import { supabase } from '../lib/supabaseClient'

const smoothScrollToSection = (sectionId: string) => {
  const section = document.querySelector(sectionId)
  if (section) {
    const headerOffset = 100 // Adjust based on your header height
    const elementPosition = section.getBoundingClientRect().top
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
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
    { name: 'Home', href: '/rw/', scrollTo: '#hero' },
    { name: 'How It Works', href: '/rw/', scrollTo: '#how-it-works' },
    { name: 'Pricing', href: '/rw/', scrollTo: '#products' },
    { name: 'Referrals', href: '/dashboard', state: { section: 'referrals' } },
    { name: 'FAQ', href: '/rw/', scrollTo: '#faq' }
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
        setUserAvatar('/rw/avatar.jpg')
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
      navigate('/rw/')
    } catch (err) {
      console.error('Logout failed', err)
    }
  }

  // Navigation Handler
  const handleNavigation = useCallback((href: string, scrollTo?: string, state?: any) => {
    // If on home page, use smooth scroll
    if (location.pathname === '/rw/' && scrollTo) {
      smoothScrollToSection(scrollTo)
    } else if (scrollTo) {
      // Navigate to home and scroll after a small delay
      navigate('/')
      setTimeout(() => {
        smoothScrollToSection(scrollTo)
      }, 100)
    } else {
      // Regular navigation without scroll
      navigate(href, { state })
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
        py-4 sm:py-6
      `}
    >
      <div className="container mx-auto px-4 sm:px-6 flex justify-between items-center relative">
        {/* Logo */}
        <div 
          onClick={() => handleNavigation('/', '#hero')}
          className="flex items-center space-x-1 sm:space-x-4 cursor-pointer hover:scale-105 transition-transform"
        >
          <img src="logo.png" alt="RollWithdraw Logo" className="w-10 h-10 mr-2 md:mr-0 sm:w-12 sm:h-12 md:w-12 md:h-12" />
          <span className="text-[24px] sm:text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#8a4fff] to-[#6E42DB]">
            RollWithdraw
          </span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8 sm:space-x-10">
          {navItems.map((item, index) => (
            <motion.button 
              key={index} 
              onClick={() => handleNavigation(item.href, item.scrollTo, item.state)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="text-[16px] sm:text-lg text-gray-300 hover:text-[#8a4fff] transition-colors cursor-pointer"
            >
              {item.name}
            </motion.button>
          ))}
          
          {/* Desktop Action Buttons */}
          <div className="flex items-center space-x-4 sm:space-x-6">
            <div className="relative">
              <button 
                onClick={(e) => {
                  e.preventDefault()
                  onCartToggle()
                }}
                className="text-gray-300 mr-4 sm:mr-5 hover:text-[#8a4fff] transition-colors relative"
              >
                <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
                {cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] sm:text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
                    {cart.reduce((total: number, item: CartItem) => total + item.quantity, 0)}
                  </span>
                )}
              </button>
            </div>
            <a 
              href="https://discord.gg/XxHsYT4m" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-[#5865F2] text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl hover:bg-[#4752C4] transition-colors flex items-center text-[14px] sm:text-base"
            >
              <SiDiscord className="w-4 h-4 sm:w-5 sm:h-5 mr-2" /> Contact
            </a>
            
            {/* Authentication Button */}
            {isAuthenticated ? (
              <div className="relative group">
                <img 
                  src={userAvatar} 
                  alt="User Avatar" 
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full cursor-pointer border-2 border-[#8a4fff]"
                  onClick={() => setIsAccountDropdownOpen(!isAccountDropdownOpen)}
                />
                <AnimatePresence>
                  {isAccountDropdownOpen && (
                    <motion.div 
                      initial={{ opacity: 1, scale: 0.8, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 1, scale: 0.8, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute z-50 right-0 top-full mt-2 bg-[#2c1b4a] border border-[#8a4fff]/20 rounded-lg shadow-lg p-2 w-48 sm:w-[250px]"
                    >
                      <div className="px-3 sm:px-4 py-2 border-b border-[#8a4fff]/10 mb-2">
                        <p className="text-xs sm:text-sm text-gray-300">Signed in as</p>
                        <p className="font-semibold text-white truncate text-[14px] sm:text-base">
                          {userEmail}
                        </p>
                      </div>
                      <button 
                        onClick={() => {
                          navigate('/dashboard', { 
                            state: { 
                              section: 'overview'
                            }
                          })
                          setIsAccountDropdownOpen(false)
                        }}
                        className="flex items-center w-full text-left px-3 sm:px-4 py-2 hover:bg-[#1a0b2e] transition-colors text-gray-300 hover:text-white text-[14px] sm:text-base"
                      >
                        <BarChart2 className="mr-2 sm:mr-3 w-4 h-4" /> Dashboard
                      </button>
                      <button 
                        onClick={() => {
                          navigate('/dashboard', { 
                            state: { 
                              section: 'purchases'
                            }
                          })
                          setIsAccountDropdownOpen(false)
                        }}
                        className="flex items-center w-full text-left px-3 sm:px-4 py-2 hover:bg-[#1a0b2e] transition-colors text-gray-300 hover:text-white text-[14px] sm:text-base"
                      >
                        <BadgeCheck className="mr-2 sm:mr-3 w-4 h-4" /> My Subscription
                      </button>
                      
                      <button 
                        onClick={() => {
                          navigate('/dashboard', { 
                            state: { 
                              section: 'purchases'
                            }
                          })
                          setIsAccountDropdownOpen(false)
                        }}
                        className="flex items-center w-full text-left px-3 sm:px-4 py-2 hover:bg-[#1a0b2e] transition-colors text-gray-300 hover:text-white text-[14px] sm:text-base"
                      >
                        <Settings2 className="mr-2 sm:mr-3 w-4 h-4" /> Bot Configuration
                      </button>
                      <button 
                        onClick={() => {
                          navigate('/dashboard', { 
                            state: { 
                              section: 'referrals'
                            }
                          })
                          setIsAccountDropdownOpen(false)
                        }}
                        className="flex items-center w-full text-left px-3 sm:px-4 py-2 hover:bg-[#1a0b2e] transition-colors text-gray-300 hover:text-white text-[14px] sm:text-base"
                      >
                        <Share2 className="mr-2 sm:mr-3 w-4 h-4" /> Referrals
                      </button>
                      <button 
                        onClick={() => {
                          navigate('/dashboard', { 
                            state: { 
                              section: 'invoices'
                            }
                          })
                          setIsAccountDropdownOpen(false)
                        }}
                        className="flex items-center w-full text-left px-3 sm:px-4 py-2 hover:bg-[#1a0b2e] transition-colors text-gray-300 hover:text-white text-[14px] sm:text-base"
                      >
                        <Wallet className="mr-2 sm:mr-3 w-4 h-4" /> Billing & Invoices
                      </button>
                      
                      
                      {/* <button 
                        onClick={() => {
                          navigate('/dashboard', { 
                            state: { 
                              section: 'settings'
                            }
                          })
                          setIsAccountDropdownOpen(false)
                        }}
                        className="flex items-center w-full text-left px-3 sm:px-4 py-2 hover:bg-[#1a0b2e] transition-colors text-gray-300 hover:text-white text-[14px] sm:text-base"
                      >
                        <Settings className="mr-2 sm:mr-3 w-4 h-4" /> Settings
                      </button> */}
                      <button 
                        onClick={handleLogout}
                        className="flex items-center w-full text-left px-3 sm:px-4 py-2 hover:bg-[#1a0b2e] transition-colors text-red-400 hover:text-red-300 text-[14px] sm:text-base"
                      >
                        <LogOut className="mr-2 sm:mr-3 w-4 h-4" /> Log Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button 
                onClick={() => navigate('/signin', { state: { from: location.pathname } })}
                className="bg-[#6a3de3] text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl hover:bg-[#5a2cc2] transition-colors flex items-center text-[14px] sm:text-base"
              >
                <User className="w-4 h-4 sm:w-5 sm:h-5 mr-2" /> Sign In
              </button>
            )}
          </div>
        </nav>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden flex items-center space-x-3 sm:space-x-4">
          <button 
            onClick={(e) => {
              e.preventDefault()
              onCartToggle()
            }}
            className="text-gray-300 hover:text-[#8a4fff] mr-2 transition-colors relative"
          >
            <ShoppingCart className="w-6 h-6 sm:w-6 sm:h-6 mr-0" />
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] sm:text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
                {cart.reduce((total: number, item: CartItem) => total + item.quantity, 0)}
              </span>
            )}
          </button>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-gray-300 hover:text-[#8a4fff] transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-7 h-7 sm:w-7 sm:h-7" /> : <Menu className="w-7 h-7 sm:w-7 sm:h-7" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 1, y: 10 }}
              animate={{ opacity: 1, y: 14 }}
              className="absolute top-full left-0 w-full bg-[#2c1b4a]/90 backdrop-blur-xl shadow-lg overflow-hidden md:hidden"
            >
              <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
                <div className="flex flex-col space-y-4 sm:space-y-6">
                  {/* Authenticated User Section */}
                  {isAuthenticated && (
                    <div className="flex flex-col space-y-3 sm:space-y-4 pb-8 mb-2 border-b border-[#8a4fff]/10 pb-4">
                      <div className="flex items-center space-x-3 sm:space-x-4">
                        <img 
                          src={userAvatar} 
                          alt="User Avatar" 
                          className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border-4 border-[#8a4fff] object-cover"
                        />
                        <div>
                          <p className="text-[16px] sm:text-xl font-semibold text-white">{userEmail}</p>
                          <p className="text-[12px] sm:text-sm text-gray-400">Verified User</p>
                        </div>
                      </div>

                      {/* Prominent Account Action Buttons */}
                      <div className="grid grid-cols-2 gap-3 sm:gap-4">
                        <motion.button 
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            navigate('/dashboard', { 
                              state: { 
                                section: 'overview'
                              }
                            })
                            setIsMobileMenuOpen(false)
                          }}
                          className="flex items-center justify-center space-x-2 bg-[#8a4fff]/20 text-[#8a4fff] 
                          py-2 sm:py-3 rounded-xl hover:bg-[#8a4fff]/30 transition-colors text-[14px] sm:text-base"
                        >
                          <BarChart2 className="w-4 h-4 sm:w-5 sm:h-5" />
                          <span>Dashboard</span>
                        </motion.button>

                        <motion.button 
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleLogout}
                          className="flex items-center justify-center space-x-2 bg-red-500/10 text-red-400 
                          py-2 sm:py-3 rounded-xl hover:bg-red-500/20 transition-colors text-[14px] sm:text-base"
                        >
                          <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                          <span>Logout</span>
                        </motion.button>
                      </div>
                    </div>
                  )}

                  {/* Mobile Navigation Items */}
                  {navItems.map((item, index) => (
                    <motion.button
                      key={index}
                      onClick={() => handleNavigation(item.href, item.scrollTo, item.state)}
                      initial={{ opacity: 1, x: -10 }}
                      animate={{ opacity: 1, x: 5 }}
                      transition={{ delay: index * 0.1 }}
                      className="text-[16px] sm:text-lg text-gray-300 hover:text-[#8a4fff] transition-colors cursor-pointer text-left"
                    >
                      {item.name}
                    </motion.button>
                  ))}

                  {/* Mobile Action Buttons */}
                  <div className="flex flex-col space-y-3 sm:space-y-4">
                    <a 
                      href="https://discord.gg/XxHsYT4m"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-[#5865F2] text-white px-4 sm:px-6 py-2 mt-1 sm:py-3 rounded-xl hover:bg-[#4752C4] transition-colors flex items-center justify-center text-[14px] sm:text-base"
                    >
                      <SiDiscord className="w-4 h-4 sm:w-5 sm:h-5 mr-2" /> Contact
                    </a>
                    
                    {/* Conditional Sign In Button */}
                    {!isAuthenticated && (
                      <button 
                        onClick={() => {
                          navigate('/signin', { state: { from: location.pathname } })
                          setIsMobileMenuOpen(false)
                        }}
                        className="flex-1 bg-[#6a3de3] text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl hover:bg-[#5a2cc2] transition-colors flex items-center justify-center text-[14px] sm:text-base"
                      >
                        <User className="w-4 h-4 sm:w-5 sm:h-5 mr-2" /> Sign In
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
