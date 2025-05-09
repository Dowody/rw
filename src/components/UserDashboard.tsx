import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  User, 
  ShoppingCart, 
  FileText, 
  CreditCard, 
  Download, 
  Clock, 
  CheckCircle, 
  XCircle,
  LogOut,
  Settings,
  BarChart2,
  Layers,
  Tag,
  Calendar,
  AlertTriangle,
  Shield,
  Zap,
  Filter,
  RefreshCw,
  Eye,
  Crown,
  ShieldCheck,
  Box,
  BadgeCheck,
  Play,
  Square,
  X,
  Landmark,
  ChevronUp,
  ChevronDown,
  History
} from 'lucide-react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { generateInvoicePDF } from '../lib/invoiceUtils'
import AccountSettings from './AccountSettings'
import InvoicesSection from './InvoicesSection'

const UserDashboard: React.FC = () => {
  const [userData, setUserData] = useState<any>(null)
  const [activeSection, setActiveSection] = useState<'overview' | 'purchases' | 'invoices' | 'settings' | 'bot-config'>('overview')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // State for products and subscriptions
  const [orders, setOrders] = useState<any[]>([])
  const [currentSubscription, setCurrentSubscription] = useState<any>(null)
  const [subscriptionStatus, setSubscriptionStatus] = useState<'active' | 'expired' | 'inactive'>('inactive')

  const navigate = useNavigate()
  const location = useLocation()

  const [billingHistory, setBillingHistory] = useState<any[]>([])
  const [upcomingBilling, setUpcomingBilling] = useState<any>(null)
  const [showAllBilling, setShowAllBilling] = useState(false)

  const [minPrice, setMinPrice] = useState<number | ''>('')
  const [maxPrice, setMaxPrice] = useState<number | ''>('')
  const [maxPercentage, setMaxPercentage] = useState<number | ''>('')
  const [sessionToken, setSessionToken] = useState('')
  const [blacklist, setBlacklist] = useState([
    "Capsule", "Sticker", "Pass", "Key", 
    "Case", "Graffiti", "Tag", "Music Kit", "Souvenir"
  ])
  const [newBlacklistItem, setNewBlacklistItem] = useState('')
  const [success, setSuccess] = useState<string | null>(null)

  // Handle navigation state and messages
  useEffect(() => {
    const state = location.state as { section?: string, message?: string }
    
    // Set section if provided
    if (state?.section) {
      setActiveSection(state.section as any)
    }

    // Show message if provided
    if (state?.message) {
      setError(state.message)
      
      // Clear message after 4 seconds
      const timer = setTimeout(() => {
        setError(null)
      }, 4000)

      return () => clearTimeout(timer)
    }
  }, [location])

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Get current authenticated user
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          navigate('/signin')
          return
        }

        // Fetch user details
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select(`
            id, 
            auth_id, 
            username, 
            email, 
            current_subscription_id, 
            subscription_start_date,
            total_purchases,
            total_spent,
            created_at
          `)
          .eq('auth_id', user.id)
          .single()

        if (userError) {
          console.error('User Fetch Error:', userError)
          setError('Failed to load user data')
          return
        }

        // Fetch billing history
        const { data: billingData, error: billingError } = await supabase
          .from('orders')
          .select(`
            id,
            total_amount,
            transaction_date,
            status,
            items,
            subscription_id
          `)
          .eq('user_id', userData.id)
          .order('transaction_date', { ascending: false })

        if (billingError) {
          console.error('Billing History Fetch Error:', billingError)
        }

        // Fetch subscriptions to get subscription names
        const subscriptionIds = billingData?.map(order => order.subscription_id).filter(Boolean) || []
        let subscriptionsMap: Record<string, { id: string; name: string }> = {}

        if (subscriptionIds.length > 0) {
          const { data: subscriptionsData, error: subscriptionError } = await supabase
            .from('subscriptions')
            .select('id, name')
            .in('id', subscriptionIds)

          if (subscriptionError) {
            console.error('Subscriptions Fetch Error:', subscriptionError)
          } else {
            subscriptionsMap = (subscriptionsData || []).reduce<Record<string, { id: string; name: string }>>((acc, sub) => {
              acc[sub.id] = sub
              return acc
            }, {})
          }
        }

        // Process billing history
        const processedBillingHistory = (billingData || []).map(order => ({
          id: order.id,
          amount: order.total_amount,
          date: new Date(order.transaction_date),
          status: order.status,
          subscriptionName: subscriptionsMap[order.subscription_id]?.name || 'Unknown Subscription',
          items: order.items || []
        }))

        // Set billing history
        setBillingHistory(processedBillingHistory)

        // Fetch completed orders
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select(`
            id,
            user_id,
            subscription_id,
            total_amount,
            transaction_date,
            status,
            items
          `)
          .eq('user_id', userData.id)
          .eq('status', 'completed')
          .order('transaction_date', { ascending: false })
          .limit(5)

        if (ordersError) {
          console.error('Orders Fetch Error:', ordersError)
        }

        // Fetch subscriptions for these orders
        let subscriptionsOrderMap: { [key: string]: any } = {}
        if (ordersData && ordersData.length > 0) {
          const subscriptionIds = ordersData
            .map(order => order.subscription_id)
            .filter(id => id !== null && id !== undefined)

          if (subscriptionIds.length > 0) {
            const { data: subscriptionsData, error: subscriptionsError } = await supabase
              .from('subscriptions')
              .select('*')
              .in('id', subscriptionIds)

            if (subscriptionsError) {
              console.error('Subscriptions Fetch Error:', subscriptionsError)
            } else if (subscriptionsData) {
              subscriptionsOrderMap = subscriptionsData.reduce((acc, sub) => {
                acc[sub.id] = sub
                return acc
              }, {})
            }
          }
        }

        // Process orders with subscription details
        const processedOrders = (ordersData || []).map(order => {
          const subscription = subscriptionsOrderMap[order.subscription_id] || {}
          
          return {
            ...order,
            subscriptionName: subscription.name || 'Completed Billing',
            subscriptionDuration: subscription.duration_days || 1,
            expirationDate: (() => {
              const expirationDate = new Date(order.transaction_date)
              expirationDate.setDate(
                expirationDate.getDate() + (subscription.duration_days || 1)
              )
              return expirationDate
            })(),
            status: 'completed'
          }
        })

        // Set orders
        setOrders(processedOrders)

        // Fetch current subscription
        if (userData.current_subscription_id) {
          const { data: currentSubscriptionData, error: subscriptionError } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('id', userData.current_subscription_id)
            .single()

          if (currentSubscriptionData) {
            // Get the latest order for this subscription
            const { data: latestOrder, error: orderError } = await supabase
              .from('orders')
              .select('expiration_date, transaction_date')
              .eq('subscription_id', userData.current_subscription_id)
              .eq('status', 'completed')
              .order('transaction_date', { ascending: false })
              .limit(1)
              .single()

            if (latestOrder) {
              const expirationDate = new Date(latestOrder.expiration_date)
              const now = new Date()
              const status = expirationDate > now ? 'active' : 'expired'
              
              // If subscription has expired, update user's subscription status
              if (status === 'expired') {
                await supabase
                  .from('users')
                  .update({
                    current_subscription_id: null,
                    subscription_start_date: null,
                    subscription_end_date: null
                  })
                  .eq('id', userData.id)
              }
            
            setCurrentSubscription({
              ...currentSubscriptionData,
                startDate: new Date(latestOrder.transaction_date),
                endDate: expirationDate,
                status,
                nextBillingDate: expirationDate
            })
            setSubscriptionStatus(status)
            } else {
              // No order found, set status to inactive
              setCurrentSubscription(null)
              setSubscriptionStatus('inactive')
            }
          }
        }

        // Set user data
        setUserData(userData)

        // Update the upcoming billing logic
        if (currentSubscription) {
          const nextBillingDate = new Date(currentSubscription.endDate)
          
          setUpcomingBilling({
            subscriptionName: currentSubscription.name,
            date: nextBillingDate,
            amount: currentSubscription.price
          })
        } else {
          setUpcomingBilling(null)
        }

        setLoading(false)
      } catch (err) {
        console.error('Unexpected Error Fetching User Data:', err)
        setError('An unexpected error occurred')
        setLoading(false)
      }
    }

    fetchUserData()
  }, [navigate, location])

  const addToBlacklist = () => {
    if (newBlacklistItem && !blacklist.includes(newBlacklistItem)) {
      setBlacklist([...blacklist, newBlacklistItem])
      setNewBlacklistItem('')
    }
  }

  const removeFromBlacklist = (item: string) => {
    setBlacklist(blacklist.filter(i => i !== item))
  }

  const handleStartBot = async () => {
    try {
      // Validate inputs
      if (!sessionToken) {
        setError('Session token is required')
        return
      }

      // Prepare bot configuration
      const botConfig = {
        minPrice,
        maxPrice,
        maxPercentage,
        sessionToken,
        blacklist,
        subscriptionId: currentSubscription?.id
      }

      // Send configuration to your backend or Supabase
      const { data, error } = await supabase
        .from('bot_configurations')
        .insert(botConfig)

      if (error) throw error

      setSuccess('Bot started successfully!')
      
      // Clear success message after 4 seconds
      setTimeout(() => {
        setSuccess(null)
      }, 4000)
    } catch (err) {
      console.error('Bot start error:', err)
      setError('Failed to start bot')
    }
  }

  const handleStopBot = async () => {
    try {
      // Stop bot logic - could be a database update or API call
      const { error } = await supabase
        .from('bot_configurations')
        .update({ status: 'stopped' })
        .eq('subscriptionId', currentSubscription?.id)

      if (error) throw error

      setSuccess('Bot stopped successfully!')
      
      // Clear success message after 4 seconds
      setTimeout(() => {
        setSuccess(null)
      }, 4000)
    } catch (err) {
      console.error('Bot stop error:', err)
      setError('Failed to stop bot')
    }
  }

  // Logout Handler
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('Error logging out:', error)
      }

      navigate('/')
    } catch (err) {
      console.error('Logout failed', err)
    }
  }

  // Update the input handlers
  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setMinPrice(value === '' ? '' : Number(value))
  }

  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setMaxPrice(value === '' ? '' : Number(value))
  }

  const handleMaxPercentageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setMaxPercentage(value === '' ? '' : Number(value))
  }

  // Format date helper
  const formatDate = (date: Date | null | undefined) => {
    if (!date) return 'N/A';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Render loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#04011C] flex flex-col items-center justify-center p-4">
        <div className="animate-spin rounded-full h-16 w-16 "></div>
      </div>
    )
  }

  // Render error/success message with loading
  if (error) {
    return (
      <div className="min-h-screen bg-[#04011C] flex flex-col items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 1, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 1, y: -20 }}
          transition={{ duration: 0.3 }}
          className="mb-8 w-full max-w-md mx-auto"
        >
          <div className={`
          ${error.includes('successfully') 
            ? 'bg-green-500/20 border border-green-500 text-green-400 text-sm text-center lg:text-base w-[90%] mx-auto' 
            : 'bg-red-500/10 border border-red-500 text-red-400 text-sm lg:text-base w-[90%] mx-auto'} 
          p-4 rounded-xl flex flex-col items-center
        `}>
          {error.includes('successfully') ? (
            <CheckCircle className="mb-2 w-5 h-5 lg:w-6 lg:h-6 " />
          ) : (
            <AlertTriangle className="mb-2 w-6 h-6" />
          )}
          <p>{error}</p>
        </div>
        </motion.div>
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[#8a4fff]"></div>
      </div>
    )
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-[#04011C] to-[#0a0415] py-16 px-4 mt-10">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-12 gap-8">
          {/* Sidebar Navigation */}
          <div className="md:col-span-3 bg-[#1a0b2e]/50 backdrop-blur-xl rounded-3xl p-4 sm:p-6 border border-[#8a4fff]/10">
            <div className="flex flex-col items-center mb-6 sm:mb-8">
              <div className="relative">
                <img 
                  src={'/rw/avatar.jpg'} 
                  alt={userData?.username || 'User'}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-[#8a4fff] mb-3 sm:mb-4 object-cover"
                />
              </div>
              <h2 className="text-xl mb-1 sm:text-xl font-bold text-white">{userData?.username}</h2>
              <p className="text-sm sm:text-sm text-gray-400">{userData?.email}</p>
            </div>

            <div className="space-y-1 sm:space-y-2">
              {[
                { 
                  icon: <BarChart2 className="mr-2 sm:mr-3 w-4 h-4 sm:w-5 sm:h-5" />, 
                  label: 'Overview', 
                  section: 'overview' 
                },
                { 
                  icon: <BadgeCheck className="mr-2 sm:mr-3 w-4 h-4 sm:w-5 sm:h-5" />, 
                  label: 'Subscriptions', 
                  section: 'purchases' 
                },
                { 
                  icon: <FileText className="mr-2 sm:mr-3 w-4 h-4 sm:w-5 sm:h-5" />, 
                  label: 'Invoices', 
                  section: 'invoices' 
                },
                { 
                  icon: <Settings className="mr-2 sm:mr-3 w-4 h-4 sm:w-5 sm:h-5" />, 
                  label: 'Settings', 
                  section: 'settings' 
                }
              ].map((item) => (
                <motion.button
                  key={item.section}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveSection(item.section as any)}
                  className={`
                    w-full flex items-center p-2 sm:p-3 rounded-xl transition-colors text-sm lg:text-base sm:text-sm
                    ${activeSection === item.section 
                      ? 'bg-[#8a4fff]/20 text-[#8a4fff]' 
                      : 'text-gray-400 hover:bg-[#8a4fff]/10'}
                  `}
                >
                  {item.icon}
                  {item.label}
                </motion.button>
              ))}
            </div>

            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="w-full mt-6 sm:mt-8 py-2 sm:py-3 bg-red-500/10 text-red-400 
              rounded-xl hover:bg-red-500/20 transition-colors flex items-center justify-center text-sm lg:text-base sm:text-sm"
            >
              <LogOut className="mr-2 sm:mr-2 w-4 h-4 sm:w-5 sm:h-5" /> Logout
            </motion.button>
          </div>

          {/* Content Area */}
          <div className="md:col-span-9 space-y-8">
            {activeSection === 'overview' && (
              <motion.div 
                initial={{ opacity: 1, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                {/* User Profile Card */}
                <div className="bg-gradient-to-br from-[#210746] to-[#2C095D] rounded-3xl p-4 sm:p-8 border border-[#8a4fff]/10 flex items-center">
                  <img 
                    src={'/rw/avatar.jpg'} 
                    alt={userData?.username}
                    className="w-16 h-16 sm:w-24 sm:h-24 rounded-full mr-4 sm:mr-6 border-4 border-[#8a4fff]"
                  />
                  <div>
                    <h2 className="text-xl sm:text-3xl font-bold text-[#8a4fff] mb-1 sm:mb-2">
                      {userData?.username}
                    </h2>
                    <p className="text-sm sm:text-base text-gray-400">{userData?.email}</p>
                  </div>
                </div>

                {/* Subscription Overview */}
                <div className="grid md:grid-cols-1 gap-4 sm:gap-6">
                  {/* Current Subscription Card */}
                  <div className="bg-gradient-to-br from-[#210746] to-[#2C095D] rounded-3xl p-4 sm:p-6 border border-[#8a4fff]/10">
                    <div className="flex justify-between items-center mb-3 sm:mb-4">
                      <h3 className="text-lg sm:text-xl font-semibold text-[#8a4fff] flex items-center">
                        <Tag className="mr-2 sm:mr-3 w-5 h-5 sm:w-6 sm:h-6" /> Current Subscription
                      </h3>
                      <span 
                        className={`
                          px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold
                          ${subscriptionStatus === 'active' 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-red-500/20 text-red-400'}
                        `}
                      >
                        {subscriptionStatus === 'active' ? 'Active' : 'Expired'}
                      </span>
                    </div>
                    {currentSubscription ? (
                      <div>
                        <p className="text-xl sm:text-2xl font-bold text-white mb-2">
                          {currentSubscription.name}
                        </p>
                        <div className="space-y-2 text-sm sm:text-base text-gray-300">
                          
                          <div className="flex justify-between">
                            <span>Subscription Time Left:</span>
                            <span>{(() => {
                              const now = new Date();
                              const diffMs = currentSubscription.endDate.getTime() - now.getTime();
                              const diffHours = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60)));
                              const days = Math.floor(diffHours / 24);
                              const hours = diffHours % 24;
                              return days > 0 ? `${days}d ${hours}h` : `${diffHours}h`;
                            })()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Price:</span>
                            <span>€{currentSubscription.price}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Status:</span>
                            <span className={subscriptionStatus === 'active' ? 'text-green-400' : 'text-red-400'}>
                              {subscriptionStatus === 'active' ? 'Active' : 'Expired'}
                            </span>
                          </div>
                          
                          {subscriptionStatus === 'expired' && (
                            <div className="flex items-center text-red-400 mt-2">
                              <AlertTriangle className="mr-2 w-4 h-4 sm:w-5 sm:h-5" />
                              <span className="text-sm">Subscription has expired</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col">
                        <p className="text-sm sm:text-base text-gray-400">No active subscription</p>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            navigate('/', {
                              state: { 
                                scrollTo: '#products',
                                timestamp: Date.now()
                              }
                            })
                          }}
                          className="bg-[#8a4fff] text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg 
                          hover:bg-[#7a3ddf] transition-colors flex items-center justify-center mt-4"
                        >
                          <Zap className="mr-2 w-4 h-4 sm:w-5 sm:h-5" /> Buy Subscription
                        </motion.button>
                      </div>
                    )}
                  </div>

                </div>

                {/* Bot Configuration Section */}
                {subscriptionStatus === 'active' && (
                  <motion.div
                    initial={{ opacity: 1, y: 0 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-gradient-to-br from-[#210746] to-[#2C095D] rounded-3xl p-4 sm:p-6 border border-[#8a4fff]/10"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="text-lg sm:text-xl font-semibold text-[#8a4fff] flex items-center mb-2">
                          <Zap className="mr-2 sm:mr-3 w-5 h-5 sm:w-6 sm:h-6" /> Bot Configuration
                        </h3>
                        <p className="text-gray-400 text-sm lg:text-base sm:text-sm">
                          Set up your withdrawal bot
                        </p>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setActiveSection('purchases')}
                        className="w-full sm:w-auto bg-[#8a4fff] text-[14px] sm:text-base text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl 
                        hover:bg-[#7a3ddf] transition-colors flex items-center justify-center"
                      >
                        <Play className="mr-2 w-4 h-4 sm:w-5 sm:h-5" /> 
                        Activate Bot
                      </motion.button>
                    </div>
                  </motion.div>
                )}


                {/* Upcoming Billing Section */}
                {upcomingBilling && (
                  <div className="bg-gradient-to-br from-[#210746] to-[#2C095D] rounded-3xl p-4 sm:p-6 border border-[#8a4fff]/10 mt-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 sm:mb-6">
                      <h3 className="text-lg sm:text-xl font-bold text-[#8a4fff] flex items-center">
                        <Clock className="mr-2 sm:mr-3 w-5 h-5 sm:w-6 sm:h-6" /> Upcoming Billing
                      </h3>
                      {subscriptionStatus === 'active' && (
                        <button 
                          onClick={() => {
                            if (location.pathname === '/') {
                              const section = document.querySelector('#products')
                              if (section) {
                                section.scrollIntoView({ behavior: 'smooth', block: 'start' })
                              }
                            } else {
                              navigate('/', {
                                state: {
                                  scrollTo: '#products',
                                  timestamp: Date.now()
                                }
                              })
                            }
                          }}
                          className="w-full sm:w-auto bg-[#8a4fff]/10 text-[#8a4fff] px-4 py-2 rounded-lg 
                          hover:bg-[#8a4fff]/20 transition-colors flex items-center justify-center"
                        >
                          <RefreshCw className="mr-2 w-4 h-4" /> 
                          Renew Subscription
                        </button>
                      )}
                    </div>

                    <div className="bg-[#2c1b4a] rounded-xl p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <h5 className="text-sm font-semibold text-white">
                            Next Billing: {upcomingBilling.subscriptionName}
                          </h5>
                          <p className="text-xs text-gray-400 flex items-center mt-1">
                            <Calendar className="mr-2 w-4 h-4" />
                            {upcomingBilling.date.toLocaleDateString('en-US', {
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                        <div className="text-left sm:text-right">
                          <p className="text-white font-bold text-lg">
                            €{upcomingBilling.amount.toFixed(2)}
                          </p>
                          <span 
                            className={`
                              inline-block px-2 py-1 rounded-full text-xs mt-1
                              ${subscriptionStatus === 'active' 
                                ? 'bg-blue-500/20 text-blue-400' 
                                : 'bg-red-500/20 text-red-400'}
                            `}
                          >
                            {subscriptionStatus === 'active' ? 'Upcoming' : 'Expired'}
                          </span>
                        </div>
                      </div>

                      {/* Subscription Expiration Warning */}
                      {subscriptionStatus === 'expired' && (
                        <div className="mt-4 bg-red-500/10 border border-red-500/30 p-3 rounded-lg flex flex-col sm:flex-row sm:items-center gap-3">
                          <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 flex-shrink-0" />
                          <div className="flex-grow">
                            <p className="text-red-400 text-sm">
                              Your subscription has expired. Renew to continue using RollWithdraw.
                            </p>
                            <button 
                              onClick={() => {
                                if (location.pathname === '/') {
                                  const section = document.querySelector('#products')
                                  if (section) {
                                    section.scrollIntoView({ behavior: 'smooth', block: 'start' })
                                  }
                                } else {
                                  navigate('/', {
                                    state: {
                                      scrollTo: '#products',
                                      timestamp: Date.now()
                                    }
                                  })
                                }
                              }}
                              className="mt-2 w-full sm:w-auto bg-red-500/20 text-red-400 
                              px-4 py-2 rounded-lg hover:bg-red-500/30 
                              transition-colors flex items-center justify-center"
                            >
                              <RefreshCw className="mr-2 w-4 h-4" /> 
                              Renew Now
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Subscription Benefits Highlight */}
                    <div className="mt-4 bg-[#2c1b4a] rounded-xl p-4">
                      <h5 className="text-sx lg:text-base font-semibold text-[#8a4fff] mb-3 flex items-center">
                        <Shield className="mr-2 w-5 h-5" /> 
                        Subscription Benefits
                      </h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-300">
                        <div className="flex items-center">
                          <CheckCircle className="mr-2 w-4 h-4 text-green-500" />
                          Unlimited Withdrawals
                        </div>
                        <div className="flex items-center">
                          <CheckCircle className="mr-2 w-4 h-4 text-green-500" />
                          Advanced Filtering
                        </div>
                        <div className="flex items-center">
                          <CheckCircle className="mr-2 w-4 h-4 text-green-500" />
                          Risk Management
                        </div>
                        <div className="flex items-center">
                          <CheckCircle className="mr-2 w-4 h-4 text-green-500" />
                          Case Collection
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {activeSection === 'purchases' && (
              <motion.div 
                initial={{ opacity: 1, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                {/* New Subscription Overview */}
                <div 
                  className="relative rounded-3xl p-4 sm:p-6 border-2 border-[#8a4fff] overflow-hidden"
                  style={{
                    backgroundImage: `url(${
                      currentSubscription?.name === "1 Month Licence" 
                        ? "https://mir-s3-cdn-cf.behance.net/project_modules/source/f02b1965126337.6021db766416d.jpg"
                        : currentSubscription?.name === "6 Months Licence"
                        ? "https://mir-s3-cdn-cf.behance.net/project_modules/source/8bf05765126337.6002d0c795c64.jpg"
                        : currentSubscription?.name === "12 Months Licence"
                        ? "https://mir-s3-cdn-cf.behance.net/project_modules/source/08ce9a65126337.5b4c8ac9c4b3b.jpg"
                        : "https://mir-s3-cdn-cf.behance.net/project_modules/source/08ce9a65126337.5b4c8ac9c4b3b.jpg"
                    })`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                >
                  {/* Dark Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#2c1b4a]/90 to-[#1a0b2e]/90"></div>
                  
                  {/* Subtle Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-[#8a4fff]/20 to-[#5e3c9b]/10 opacity-50 pointer-events-none"></div>
                  
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex-grow">
                      <h2 className="text-xl sm:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3 
                        text-transparent bg-clip-text 
                        bg-gradient-to-r from-[#8a4fff] to-[#5e3c9b]">
                        {currentSubscription?.name || 'No Subscription'}
                      </h2>
                      <div className="flex items-center space-x-2 sm:space-x-4">
                        <motion.span 
                          initial={{ scale: 0.8, opacity: 1}}
                          animate={{ scale: 1, opacity: 1 }}
                          className={`
                            px-2 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-semibold uppercase tracking-wider
                            ${subscriptionStatus === 'active' 
                              ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                              : 'bg-red-500/20 text-red-400 border border-red-500/30'}
                          `}
                        >
                          {subscriptionStatus}
                        </motion.span>
                        {currentSubscription && (
                          <div className="flex items-center space-x-1 sm:space-x-2 text-gray-400">
                            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-[#8a4fff]" />
                            <span className="text-xs sm:text-sm">
                              Expires {currentSubscription.endDate.toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <div className="bg-[#8a4fff]/10 rounded-full p-2 sm:p-3">
                        <Crown className="w-4 h-4 sm:w-6 sm:h-6 text-[#8a4fff]" />
                      </div>
                      <div className="bg-[#8a4fff]/10 rounded-full p-2 sm:p-3">
                        <Zap className="w-4 h-4 sm:w-6 sm:h-6 text-[#8a4fff]" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* New Configuration Panel */}
                {subscriptionStatus === 'active' && currentSubscription && (
                <div className="bg-gradient-to-br from-[#210746] to-[#2C095D] rounded-3xl p-4 sm:p-6 border border-[#8a4fff]/10 space-y-4 sm:space-y-6">
                  <h3 className="text-base sm:text-xl font-semibold text-[#8a4fff] flex items-center">
                    <Settings className="mr-2 sm:mr-3 w-4 h-4 sm:w-6 sm:h-6" /> Bot Configuration
                  </h3>

                  {/* Success/Error Messages */}
                  {success && (
                    <motion.div 
                      initial={{ opacity: 1, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-green-500/20 border border-green-500/30 text-green-400 p-3 sm:p-4 rounded-xl text-sm sm:text-sm"
                    >
                      {success}
                    </motion.div>
                  )}

                  {/* Configuration Inputs */}
                  <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-xs sm:text-sm text-gray-400 mb-1 sm:mb-2">Minimum Price</label>
                      <input 
                        type="number" 
                        value={minPrice}
                        onChange={handleMinPriceChange}
                        className="w-full p-2 sm:p-3 bg-[#2c1b4a] rounded-xl text-sm sm:text-base text-white 
                        border border-[#8a4fff]/20 focus:border-[#8a4fff] 
                        transition-colors"
                        placeholder="Enter minimum price"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm text-gray-400 mb-1 sm:mb-2">Maximum Price</label>
                      <input 
                        type="number" 
                        value={maxPrice}
                        onChange={handleMaxPriceChange}
                        className="w-full p-2 sm:p-3 bg-[#2c1b4a] rounded-xl text-sm sm:text-base text-white 
                        border border-[#8a4fff]/20 focus:border-[#8a4fff] 
                        transition-colors"
                        placeholder="Enter maximum price"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm text-gray-400 mb-1 sm:mb-2">Maximum Percentage</label>
                    <input 
                      type="number" 
                      value={maxPercentage}
                      onChange={handleMaxPercentageChange}
                      className="w-full p-2 sm:p-3 bg-[#2c1b4a] rounded-xl text-sm sm:text-base text-white 
                      border border-[#8a4fff]/20 focus:border-[#8a4fff] 
                      transition-colors"
                      placeholder="Enter maximum percentage"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm text-gray-400 mb-1 sm:mb-2">Session Token</label>
                    <input 
                      type="text" 
                      value={sessionToken}
                      onChange={(e) => setSessionToken(e.target.value)}
                      className="w-full p-2 sm:p-3 bg-[#2c1b4a] rounded-xl text-sm sm:text-base text-white 
                      border border-[#8a4fff]/20 focus:border-[#8a4fff] 
                      transition-colors"
                      placeholder="Enter your session token"
                    />
                    <p className="text-xs sm:text-sm text-gray-400 mt-1 sm:mt-2">
                      Learn how to find your session token{' '}
                      <Link 
                        to="/faq" 
                        className="text-[#8a4fff] hover:underline"
                      >
                        here
                      </Link>
                    </p>
                  </div>

                  {/* Blacklist Management */}
                  <div>
                    <label className="block text-xs sm:text-sm text-gray-400 mb-1 sm:mb-2">Blacklist</label>
                    <div className="flex flex-wrap gap-1 sm:gap-2 mb-2 sm:mb-3">
                      {blacklist.map((item, index) => (
                        <div 
                          key={index} 
                          className="bg-[#2c1b4a] px-2 sm:px-3 py-0.5 sm:py-1 rounded-full flex items-center text-xs sm:text-sm"
                        >
                          <span className="mr-1 sm:mr-2 text-white">{item}</span>
                          <button 
                            onClick={() => removeFromBlacklist(item)}
                            className="text-red-400 hover:text-red-500"
                          >
                            <X className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex">
                      <input 
                        type="text" 
                        value={newBlacklistItem}
                        onChange={(e) => setNewBlacklistItem(e.target.value)}
                        className="flex-grow p-2 sm:p-3 bg-[#2c1b4a] rounded-xl text-sm sm:text-base text-white 
                        border border-[#8a4fff]/20 focus:border-[#8a4fff] 
                        transition-colors mr-2"
                        placeholder="Add blacklist item"
                      />
                      <button 
                        onClick={addToBlacklist}
                        className="bg-[#8a4fff] text-white px-3 sm:px-4 py-2 rounded-xl 
                        hover:bg-[#7a3ddf] transition-colors text-xs sm:text-sm"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  {/* Bot Control Buttons */}
                  <div className="flex space-x-3 sm:space-x-4">
                    <button 
                      onClick={handleStartBot}
                      className="flex-1 bg-green-500 text-white py-2 sm:py-3 rounded-xl 
                      hover:bg-green-600 transition-colors flex items-center justify-center text-xs sm:text-sm"
                    >
                      <Play className="mr-1 sm:mr-2 w-3 h-3 sm:w-5 sm:h-5" /> START
                    </button>
                    <button 
                      onClick={handleStopBot}
                      className="flex-1 bg-red-500 text-white py-2 sm:py-3 rounded-xl 
                      hover:bg-red-600 transition-colors flex items-center justify-center text-xs sm:text-sm"
                    >
                      <Square className="mr-1 sm:mr-2 w-3 h-3 sm:w-5 sm:h-5" /> STOP
                    </button>
                  </div>
                </div>
                )}

                {/* Subscription Details in Vertical Layout */}
                <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
                  {/* Subscription Details Card */}
                  <div className="bg-gradient-to-br from-[#210746] to-[#2C095D] rounded-3xl p-4 sm:p-6 border border-[#8a4fff]/10 space-y-3 sm:space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-base sm:text-xl font-semibold text-[#8a4fff] flex items-center">
                        <Tag className="mr-2 sm:mr-3 w-4 h-4 sm:w-6 sm:h-6" /> Subscription Overview
                      </h3>
                    </div>

                    {currentSubscription ? (
                      <div className="space-y-2 sm:space-y-3">
                        <div className="bg-[#2c1b4a] rounded-xl p-3 sm:p-4 flex justify-between items-center">
                          <span className="text-xs sm:text-sm text-gray-300">Name</span>
                          <span className="font-semibold text-white text-xs sm:text-sm">{currentSubscription.name}</span>
                        </div>
                        <div className="bg-[#2c1b4a] rounded-xl p-3 sm:p-4 flex justify-between items-center">
                          <span className="text-xs sm:text-sm text-gray-300">Price</span>
                          <span className="font-semibold text-green-400 text-xs sm:text-sm">€{currentSubscription.price}</span>
                        </div>
                        <div className="bg-[#2c1b4a] rounded-xl p-3 sm:p-4 flex justify-between items-center">
                          <span className="text-xs sm:text-sm text-gray-300">Duration</span>
                          <span className="font-semibold text-white text-xs sm:text-sm">{currentSubscription.duration_days} Days</span>
                        </div>
                        <div className="bg-[#2c1b4a] rounded-xl p-3 sm:p-4 flex justify-between items-center">
                          <span className="text-xs sm:text-sm text-gray-300">Start Date</span>
                          <span className="font-semibold text-white text-xs sm:text-sm">{currentSubscription.startDate.toLocaleDateString()}</span>
                        </div>
                        <div className="bg-[#2c1b4a] rounded-xl p-3 sm:p-4 flex justify-between items-center">
                          <span className="text-xs sm:text-sm text-gray-300">Expiration Date</span>
                          <span className="font-semibold text-white text-xs sm:text-sm">{currentSubscription.endDate.toLocaleDateString()}</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs sm:text-sm text-gray-400 text-center">No active subscription</p>
                    )}
                  </div>

                  {/* Subscription Features Card */}
                  <div className="bg-gradient-to-br from-[#210746] to-[#2C095D] rounded-3xl p-4 sm:p-6 border border-[#8a4fff]/10 space-y-3 sm:space-y-4">
                    <h3 className="text-base sm:text-xl font-semibold text-[#8a4fff] flex items-center">
                      <BarChart2 className="mr-2 sm:mr-3 w-4 h-4 sm:w-6 sm:h-6" /> Subscription Features
                    </h3>
                    
                    <div className="space-y-2 sm:space-y-3">
                      {[
                        { 
                          label: "Withdrawals per Day", 
                          value: currentSubscription?.max_withdrawals_per_day || 'N/A',
                          icon: <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                        },
                        { 
                          label: "Advanced Filtering", 
                          value: currentSubscription?.advanced_filtering ? 'Enabled' : 'Disabled',
                          icon: <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
                        },
                        { 
                          label: "Risk Management", 
                          value: currentSubscription?.risk_management ? 'Enabled' : 'Disabled',
                          icon: <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                        },
                        { 
                          label: "Case Collection", 
                          value: currentSubscription?.max_case_collection ? 'Enabled' : 'Disabled',
                          icon: <Box className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
                        }
                      ].map((feature, index) => (
                        <div 
                          key={index} 
                          className="bg-[#2c1b4a] rounded-xl p-3 sm:p-4 flex justify-between items-center"
                        >
                          <div className="flex items-center space-x-2 sm:space-x-3">
                            {feature.icon}
                            <span className="text-xs sm:text-sm text-gray-300">{feature.label}</span>
                          </div>
                          <span className="font-semibold text-white text-xs sm:text-sm">{feature.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                

              </motion.div>
            )}

            {activeSection === 'invoices' && (
              <motion.div 
                initial={{ opacity: 1, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                {/* Invoices Section */}
                <div className="bg-gradient-to-br from-[#210746] to-[#2C095D] rounded-3xl p-4 sm:p-6 border border-[#8a4fff]/10">
                  <div className="flex justify-between items-center mb-4 sm:mb-6">
                    <div>
                      <h3 className="text-lg sm:text-2xl font-bold text-[#8a4fff] flex items-center">
                        <History className="mr-2 sm:mr-3 w-4 h-4 sm:w-7 sm:h-7" /> Billing History
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-400 mt-0.5 sm:mt-1">
                        Overview of your recent transactions
                      </p>
                    </div>
                    {/* <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-[#8a4fff]/10 text-[#8a4fff] px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg 
                      hover:bg-[#8a4fff]/20 transition-colors flex items-center text-xs sm:text-sm"
                    >
                      <Download className="mr-1 sm:mr-2 w-3 h-3 sm:w-4 sm:h-4" />
                      Export All
                    </motion.button> */}
                  </div>

                  {billingHistory.length === 0 ? (
                    <div className="bg-[#2c1b4a] rounded-xl p-4 sm:p-8 text-center">
                      <div className="flex justify-center mb-3 sm:mb-4">
                        <div className="bg-[#8a4fff]/20 rounded-full p-3 sm:p-4">
                          <Landmark className="w-8 h-8 sm:w-12 sm:h-12 text-[#8a4fff] opacity-70" />
                        </div>
                      </div>
                      <h4 className="text-sm sm:text-lg text-white mb-1 sm:mb-2">No Billing History</h4>
                      <p className="text-xs sm:text-sm text-gray-400">Your invoices will appear here after purchase</p>
                    </div>
                  ) : (
                    <div className="space-y-3 sm:space-y-4">
                      {billingHistory.slice(0, showAllBilling ? undefined : 3).map((purchase, index) => (
                        <motion.div
                          key={purchase.id}
                          initial={{ opacity: 1, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ 
                            duration: 0.3, 
                            delay: index * 0.1 
                          }}
                          className="bg-[#2c1b4a] rounded-xl p-3 sm:p-5 flex items-center justify-between 
                          hover:bg-[#3a2b5c] transition-colors group"
                        >
                          <div className="flex items-center space-x-3 sm:space-x-4">
                            <div className="bg-[#8a4fff]/20 rounded-full p-2 sm:p-3">
                              <FileText className="w-4 h-4 sm:w-6 sm:h-6 text-[#8a4fff]" />
                            </div>
                            <div>
                              <h4 className="text-xs sm:text-base text-white font-semibold group-hover:text-[#8a4fff] transition-colors">
                                Invoice #{1000 + index + 1}
                              </h4>
                              <p className="text-xs sm:text-sm text-gray-400">
                                {purchase.subscriptionName} • {purchase.date.toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3 sm:space-x-4">
                            <div className="text-right">
                              <p className="text-sm sm:text-lg text-white font-bold">
                                €{purchase.amount.toFixed(2)}
                              </p>
                              <span className="text-[10px] sm:text-xs text-green-400 bg-green-500/20 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                                Completed
                              </span>
                            </div>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => generateInvoicePDF(purchase, userData)}
                              className="bg-[#8a4fff] text-white p-2 sm:p-3 rounded-full 
                              hover:bg-[#7a3ddf] transition-colors"
                              title="Download Invoice"
                            >
                              <Download className="w-3 h-3 sm:w-5 sm:h-5" />
                            </motion.button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {billingHistory.length > 3 && (
                    <div className="mt-4 sm:mt-6 text-center">
                      <button
                        onClick={() => setShowAllBilling(!showAllBilling)}
                        className="text-[#8a4fff] hover:bg-[#8a4fff]/10 px-4 sm:px-6 py-2 sm:py-3 rounded-xl 
                        transition-colors flex items-center justify-center mx-auto text-xs sm:text-sm"
                      >
                        {showAllBilling ? 'Show Less' : 'Show More'}
                        {showAllBilling ? (
                          <ChevronUp className="ml-1 sm:ml-2 w-3 h-3 sm:w-5 sm:h-5" />
                        ) : (
                          <ChevronDown className="ml-1 sm:ml-2 w-3 h-3 sm:w-5 sm:h-5" />
                        )}
                      </button>
                    </div>
                  )}
                </div>

              </motion.div>
            )}

            {activeSection === 'settings' && (
              <AccountSettings />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserDashboard