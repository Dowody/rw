import React, { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useCart } from './context/CartContext'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { 
  ChevronLeft, 
  CreditCard, 
  Trash2, 
  Plus, 
  Minus,
  CheckCircle,
  Lock,
  AlertTriangle,
  FileText,
  Gamepad2,
  ShieldCheck
} from 'lucide-react'
import { SiBitcoin, SiEthereum, SiTether, SiSteam, SiTradingview } from 'react-icons/si'
import { supabase } from '../lib/supabaseClient'
import { PostgrestSingleResponse } from '@supabase/supabase-js'

const CheckoutPage: React.FC = () => {
  const { 
    cart, 
    removeFromCart, 
    getTotalPrice, 
    updateQuantity, 
    clearCart 
  } = useCart()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [isOrderPlaced, setIsOrderPlaced] = useState(false)
  const [selectedCrypto, setSelectedCrypto] = useState<'bitcoin' | 'ethereum' | 'tether'>('bitcoin')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [showSkinPaymentModal, setShowSkinPaymentModal] = useState(false)

  // Policy Acknowledgment State
  const [isPolicyAcknowledged, setIsPolicyAcknowledged] = useState(false)
  const [showPolicyModal, setShowPolicyModal] = useState(false)

  // Memoized calculations for performance
  const subtotal = useMemo(() => getTotalPrice(), [cart])
  const taxAmount = useMemo(() => subtotal * 0.1, [subtotal])
  const total = useMemo(() => subtotal * 1.1, [subtotal])

  const [skinMarketplaces, setSkinMarketplaces] = useState([
    {
      id: 'skinport',
      name: 'Skinport',
      logo: <SiTradingview className="w-10 h-10 text-green-500" />,
      status: 'coming_soon',
      description: 'Popular skin trading platform'
    },
    {
      id: 'dmarket',
      name: 'DMarket',
      logo: <SiTradingview className="w-10 h-10 text-blue-500" />,
      status: 'coming_soon',
      description: 'Global skin marketplace'
    },
    {
      id: 'bitskins',
      name: 'BitSkins',
      logo: <SiTradingview className="w-10 h-10 text-purple-500" />,
      status: 'coming_soon',
      description: 'Trusted skin trading platform'
    }
  ])

  const [selectedPayment, setSelectedPayment] = useState<{
    id: string,
    name: string,
    type: 'crypto' | 'skin'
  }>({
    id: 'bitcoin',
    name: 'Bitcoin',
    type: 'crypto'
  })

  // Payment Options
  const paymentOptions: Array<{
    id: string;
    name: string;
    icon: JSX.Element;
    type: 'crypto' | 'skin';
  }> = [
    { 
      id: 'bitcoin', 
      name: 'Bitcoin', 
      icon: <SiBitcoin className="w-10 h-10 text-[#F7931A]" />,
      type: 'crypto'
    },
    { 
      id: 'ethereum', 
      name: 'Ethereum', 
      icon: <SiEthereum className="w-10 h-10 text-[#627EEA]" />,
      type: 'crypto'
    },
    { 
      id: 'tether', 
      name: 'Tether', 
      icon: <SiTether className="w-10 h-10 text-[#26A17B]" />,
      type: 'crypto'
    },
    { 
      id: 'skins', 
      name: 'Skins', 
      icon: <SiSteam className="w-10 h-10 text-[#1B2838]" />,
      type: 'skin'
    }
  ]

  // Authentication and User Check
  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session) {
          // Redirect to sign-in if not authenticated
          navigate('/signin', { 
            state: { 
              from: '/checkout',
              message: 'Please sign in to complete your purchase'
            }
          })
          setLoading(false)
      return
    }

        // User is authenticated
        setIsAuthenticated(true)
        
        // Fetch user details
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          setEmail(user.email || '')
        }

        // Validate cart is not empty
        if (cart.length === 0) {
          navigate('/dashboard', { 
            state: { 
              section: 'purchases',
              message: 'Purchase completed successfully! Your subscription is now active.'
            }
          })
        }

        // Clear the state to prevent message reappearing on refresh
        window.history.replaceState({}, document.title)
        
        setLoading(false)
      } catch (authError) {
        console.error('Authentication check failed:', authError)
        setError('Failed to verify authentication. Please try again.')
        setLoading(false)
      }
    }

    checkAuthentication()
  }, [navigate, cart])

  // Place Order Handler
  const handlePlaceOrder = async () => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setError('User not authenticated')
        return
      }
      
      // Fetch user details to ensure they exist in users table
      let userData: PostgrestSingleResponse<{
        id: string;
        current_subscription_id: string | null;
        subscription_start_date: string | null;
        subscription_end_date: string | null;
      }> = await supabase
        .from('users')
        .select(`
          id, 
          current_subscription_id, 
          subscription_start_date, 
          subscription_end_date
        `)
        .eq('auth_id', user.id)
        .single()
      
      if (userData.error || !userData.data) {
        // Create user profile if not exists
        const { data: newUserData, error: insertError } = await supabase
          .from('users')
          .insert({
            auth_id: user.id,
            email: user.email || '',
            username: user.user_metadata?.username || user.email?.split('@')[0],
            created_at: new Date().toISOString()
          })
          .select()
          .single()
      
        if (insertError) {
          console.error('User profile creation error:', insertError)
          setError('Failed to create user profile')
          return
        }
  
        userData = { 
          data: newUserData,
          error: null,
          count: 1,
          status: 200,
          statusText: 'OK'
        }
      }
  
      if (!userData.data) {
        setError('Failed to get user data')
        return
      }
  
      // Mapping cart items to subscription names with more flexible matching
      const subscriptionMap: Record<string, { name: string; duration: number }> = {
        '1 Month Licence': { name: '1 Month Subscription', duration: 1 },
        '6 Months Licence': { name: '6 Months Subscription', duration: 6 },
        '12 Months Licence': { name: '12 Months Subscription', duration: 12 }
      }
  
      // Find the best matching subscription name
      const cartItemName = cart[0].name
      const mappedSubscription = subscriptionMap[cartItemName] || { 
        name: cartItemName, 
        duration: 1 
      }
  
      // Fetch subscription with more flexible matching
      const { data: subscriptions, error: subscriptionError } = await supabase
        .from('subscriptions')
        .select('id, name, duration_months, price')
        .or(`name.ilike.%${mappedSubscription.name}%,name.eq.${mappedSubscription.name}`)
  
      if (subscriptionError) {
        console.error('Subscription lookup error:', subscriptionError)
        setError('Could not find a matching subscription')
        return
      }
  
      if (!subscriptions || subscriptions.length === 0) {
        console.error('No matching subscription found', { 
          cartItemName, 
          mappedSubscriptionName: mappedSubscription.name 
        })
        setError('No suitable subscription found. Please contact support.')
        return
      }
  
      // Select the first matching subscription
      const selectedSubscription = subscriptions[0]
  
      // Determine subscription upgrade logic
      let finalSubscriptionId = selectedSubscription.id
      let subscriptionStartDate = new Date()
      let subscriptionEndDate = new Date()
  
      // If user has an existing subscription
      if (userData.data.current_subscription_id) {
        // Fetch current subscription details
        const { data: currentSubscription } = await supabase
          .from('subscriptions')
          .select('id, name, duration_months, price')
          .eq('id', userData.data.current_subscription_id)
          .single()
  
        // Upgrade logic: Extend subscription if new subscription is longer
        if (currentSubscription && selectedSubscription.duration_months > currentSubscription.duration_months) {
          // Prorate the remaining time of current subscription
          const currentEndDate = new Date(userData.data.subscription_end_date || new Date())
          const remainingMonths = Math.max(0, 
            (currentEndDate.getTime() - new Date().getTime()) / (30 * 24 * 60 * 60 * 1000)
          )
  
          // Calculate prorated price
          const proRatedPrice = (selectedSubscription.price / selectedSubscription.duration_months) * remainingMonths
          const finalPrice = total - proRatedPrice
  
          // Update subscription with extended duration
          subscriptionStartDate = new Date()
          subscriptionEndDate = new Date(
            subscriptionStartDate.setMonth(
              subscriptionStartDate.getMonth() + selectedSubscription.duration_months
            )
          )
        } else {
          // If current subscription is longer or same, keep current subscription
          finalSubscriptionId = userData.data.current_subscription_id
          subscriptionStartDate = new Date(userData.data.subscription_start_date || new Date())
          subscriptionEndDate = new Date(userData.data.subscription_end_date || new Date())
        }
      } else {
        // No existing subscription, set new subscription dates
        subscriptionEndDate = new Date(
          subscriptionStartDate.setMonth(
            subscriptionStartDate.getMonth() + selectedSubscription.duration_months
          )
        )
      }
  
      // Prepare order items
      const orderItems = cart.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      }))
      
      // Create order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: userData.data.id,
          subscription_id: finalSubscriptionId,
          total_amount: total,
          items: orderItems,
          payment_method: selectedCrypto,
          status: 'pending'
        })
        .select()
        .single()
      
      if (orderError) {
        console.error('Order creation error:', orderError)
        setError('Failed to process order. Please try again.')
        return
      }

      if (!orderData) {
        setError('Failed to create order. Please try again.')
        return
      }
      
      // Update user's subscription
      const { error: updateError } = await supabase
        .from('users')
        .update({
          current_subscription_id: finalSubscriptionId,
          subscription_start_date: subscriptionStartDate.toISOString(),
          subscription_end_date: subscriptionEndDate.toISOString()
        })
        .eq('id', userData.data.id)
      
      if (updateError) {
        console.error('Subscription update error:', updateError)
        setError('Failed to update subscription. Please contact support.')
        return
      }
      
      // Clear cart and show order confirmation
    clearCart()
      
      // Navigate to dashboard with products section
      navigate('/dashboard', { 
        state: { 
          section: 'purchases',  // Specifically open the products/purchases section
          message: 'Order completed successfully!'
        }
      })
      
    } catch (err) {
      console.error('Order placement error:', err)
      setError('An unexpected error occurred. Please try again.')
    }
  }
  

  // Policy Modal Component
  const PolicyModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#0a0415] rounded-2xl p-8 max-w-md w-full border border-[#8a4fff]/10"
      >
        <div className="flex items-center mb-6">
          <FileText className="w-8 h-8 text-[#8a4fff] mr-4" />
          <h2 className="text-2xl font-semibold text-[#8a4fff]">Policy Acknowledgment</h2>
        </div>
        
        <div className="mb-6 text-gray-300 space-y-4">
          <p>Before completing your purchase, please review and acknowledge our:</p>
          <ul className="list-disc list-inside">
            <li>
              <Link 
                to="/terms" 
                target="_blank" 
                className="text-[#8a4fff] hover:underline"
              >
                Terms of Service
              </Link>
            </li>
            <li>
              <Link 
                to="/privacy" 
                target="_blank" 
                className="text-[#8a4fff] hover:underline"
              >
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link 
                to="/refund" 
                target="_blank" 
                className="text-[#8a4fff] hover:underline"
              >
                Refund Policy
              </Link>
            </li>
          </ul>
        </div>

        <div className="flex items-center mb-6">
          <input 
            type="checkbox" 
            id="policy-acknowledge"
            checked={isPolicyAcknowledged}
            onChange={() => setIsPolicyAcknowledged(!isPolicyAcknowledged)}
            className="mr-3 w-5 h-5 text-[#8a4fff] rounded focus:ring-[#8a4fff]"
          />
          <label 
            htmlFor="policy-acknowledge" 
            className="text-gray-300"
          >
            I have read and agree to the terms and conditions.
          </label>
        </div>

        <div className="flex space-x-4">
          <button 
            onClick={() => setShowPolicyModal(false)}
            className="flex-1 py-3 bg-transparent border border-[#8a4fff]/30 text-[#8a4fff] rounded-lg"
          >
            Cancel
          </button>
          <button 
            onClick={() => {
              if (isPolicyAcknowledged) {
                setShowPolicyModal(false)
                handlePlaceOrder()
              }
            }}
            disabled={!isPolicyAcknowledged}
            className={`
              flex-1 py-3 rounded-lg
              ${isPolicyAcknowledged 
                ? 'bg-[#8a4fff] text-white' 
                : 'bg-gray-500 text-gray-300 cursor-not-allowed'}
            `}
          >
            Confirm
          </button>
        </div>
      </motion.div>
    </div>
  )

  // Skin Payment Modal Component
  const SkinPaymentModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#0a0415] rounded-2xl p-8 max-w-3xl w-full border border-[#8a4fff]/10 my-8"
      >
        <div className="flex items-center mb-6 sticky top-0 bg-[#0a0415] z-10">
          <Gamepad2 className="w-8 h-8 text-[#8a4fff] mr-4" />
          <h2 className="text-2xl font-semibold text-[#8a4fff]">Skin Transfer Marketplaces</h2>
        </div>
        
        <div className="mb-6 text-gray-300 space-y-4">
          <p className="text-center">
            Select a marketplace to transfer your skins seamlessly.
          </p>
          
          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                id: 'skinport',
                name: 'Skinport',
                logo: <SiTradingview className="w-6 h-6 text-green-500" />,
                description: "Popular skin trading platform",
                url: "https://skinport.com/trade",
                status: 'active'
              },
              {
                id: 'bitskins',
                name: 'BitSkins',
                logo: <SiTradingview className="w-6 h-6 text-purple-500" />,
                description: "Trusted skin trading platform",
                url: "https://bitskins.com/",
                status: 'active'
              },
              {
                id: 'tradeit',
                name: 'TradeIt.gg',
                logo: <SiSteam className="w-6 h-6 text-[#1B2838]" />,
                description: "Instant skin trading platform",
                url: "https://tradeit.gg/",
                status: 'active'
              }
            ].map((marketplace) => (
              <motion.div 
                key={marketplace.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`
                  bg-[#2c1b4a] rounded-xl p-6 text-center relative
                  transition-all duration-300 
                  ${marketplace.status === 'active' 
                    ? 'hover:border-[#8a4fff] border border-transparent' 
                    : 'opacity-50 cursor-not-allowed'}
                `}
              >
                <div className="flex justify-center mb-4">
                  {marketplace.logo}
                </div>
                <h3 className="text-white font-semibold mb-2">{marketplace.name}</h3>
                <p className="text-gray-400 text-sm mb-4">{marketplace.description}</p>
                
                <button
                  onClick={() => {
                    if (marketplace.status === 'active') {
                      window.open(marketplace.url, '_blank', 'noopener,noreferrer')
                    }
                  }}
                  disabled={marketplace.status !== 'active'}
                  className={`
                    w-full py-3 rounded-lg transition-colors
                    ${marketplace.status === 'active' 
                      ? 'bg-[#8a4fff] text-white hover:bg-[#7a3ddf]' 
                      : 'bg-gray-500 text-gray-300 cursor-not-allowed'}
                  `}
                >
                  {marketplace.status === 'active' ? 'Open Marketplace' : 'Coming Soon'}
                </button>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-2 bg-[#2c1b4a] p-4 rounded-xl mb-6">
          <ShieldCheck className="w-6 h-6 text-green-500" />
          <p className="text-sm text-gray-300">
            We recommend using trusted marketplaces and verifying trade details.
          </p>
        </div>

        <div className="flex space-x-4">
          <button 
            onClick={() => setShowSkinPaymentModal(false)}
            className="flex-1 py-3 bg-transparent border border-[#8a4fff]/30 text-[#8a4fff] rounded-lg"
          >
            Close
          </button>
          <button 
            onClick={() => {
              window.open('/contact', '_blank')
              setShowSkinPaymentModal(false)
            }}
            className="flex-1 py-3 bg-[#8a4fff] text-white rounded-lg hover:bg-[#7a3ddf]"
          >
            Contact Support
          </button>
        </div>
      </motion.div>
    </div>
  )

  // Loading State
  if (loading) {
    // Check for success message in location state
    const state = (location as any).state as { section?: string, message?: string }
    
    return (
      <div className="min-h-screen bg-[#04011C] flex items-center justify-center">
        {state?.message && (
          <div className="absolute top-20 w-full max-w-md">
            <div className="bg-emerald-500/10 border border-emerald-500 text-emerald-400 p-4 rounded-xl flex items-center">
              <CheckCircle className="mr-3 w-6 h-6" />
              {state.message}
            </div>
          </div>
        )}
        <div className="animate-spin rounded-full h-16 w-16 "></div>
      </div>
    )
  }

  // Order Placed Confirmation
  if (isOrderPlaced) {
    return (
      <div className="min-h-screen bg-[#04011C] flex items-center justify-center px-4 py-16">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full text-center bg-[#0a0415] rounded-3xl p-12 border border-[#8a4fff]/10"
        >
          <CheckCircle className="w-32 h-32 mx-auto text-[#8a4fff] mb-8" />
          <h2 className="text-4xl font-bold text-white mb-6">
            Order Confirmed
          </h2>
          <p className="text-gray-400 mb-10 text-lg">
            Your order has been successfully processed.
          </p>
          <button 
            onClick={() => navigate('/')}
            className="w-full py-4 bg-[#8a4fff] 
            text-white rounded-xl hover:bg-[#7a3ddf] transition-colors text-lg"
          >
            Return to Home
          </button>
        </motion.div>
      </div>
    )
  }

  // Empty Cart State
  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-[#04011C] flex items-center justify-center px-4 py-16">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full text-center bg-[#0a0415] rounded-3xl p-12 border border-[#8a4fff]/10"
        >
          <div className="w-32 h-32 mx-auto mb-8 flex items-center justify-center bg-[#8a4fff]/10 rounded-full">
            <CreditCard className="w-16 h-16 text-[#8a4fff] opacity-70" />
          </div>
          <h2 className="text-4xl font-bold text-white mb-6">
            Cart is Empty
          </h2>
          <p className="text-gray-400 mb-10 text-lg">
            Add items to get started
          </p>
          <button 
            onClick={() => navigate('/')}
            className="w-full py-4 bg-[#8a4fff] 
            text-white rounded-xl hover:bg-[#7a3ddf] transition-colors text-lg"
          >
            Browse Products
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-[#04011C] py-16 px-4">
      <div className="max-w-4xl mx-auto">
          {/* Error Handling */}
          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-400 p-4 rounded-xl mb-6 flex items-center">
              <AlertTriangle className="mr-3 w-6 h-6" />
              {error}
            </div>
          )}

        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
            className="flex items-center mt-10"
        >
          <button 
            onClick={() => navigate('/')}
              className="text-gray-400 hover:text-[#8a4fff] flex items-center mr-auto mb-28"
          >
            <ChevronLeft className="mr-2 w-6 h-6" /> Back
          </button>
            <h1 className="text-3xl font-bold text-white absolute left-1/2 transform -translate-x-1/2 pt-10">
            Checkout
          </h1>
        </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
          {/* Left Column - Order Details */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-8"
          >
            {/* Cart Items */}
              <div className="bg-gradient-to-br from-[#210746] to-[#2C095D] rounded-3xl p-8 border border-[#000000]/10">
              <h2 className="text-xl font-semibold text-[#8a4fff] mb-6 flex items-center">
                <CreditCard className="mr-3 w-6 h-6" /> Your Items
              </h2>
              <div className="space-y-4">
                {cart.map((item) => (
                  <div 
                    key={item.id} 
                    className="flex justify-between items-center pb-4 border-b border-[#8a4fff]/10 last:border-b-0"
                  >
                    <div>
                      <h3 className="text-lg font-bold text-white">{item.name}</h3>
                      <p className="text-gray-400 text-sm">
                        {item.id === 'monthly' && 'Monthly Subscription'}
                          {item.id === '6-months' && 'CSGORoll Script'}
                        {item.id === 'annual' && 'Annual Subscription'}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center bg-[#1a0b2e] rounded-full">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-2 text-gray-400 hover:text-[#8a4fff]"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="px-3 text-white">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-2 text-gray-400 hover:text-[#8a4fff]"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <span className="text-lg font-bold text-[#8a4fff]">
                        €{(item.price * item.quantity).toFixed(2)}
                      </span>
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 hover:text-red-400"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Method */}
              <div className="bg-gradient-to-br from-[#210746] to-[#2C095D] rounded-3xl p-8 border border-[#8a4fff]/10">
              <h2 className="text-xl font-semibold text-[#8a4fff] mb-6 flex items-center">
                <Lock className="mr-3 w-6 h-6" /> Payment Method
              </h2>
              <div className="grid grid-cols-3 gap-4">
                  {paymentOptions.slice(0, 3).map((payment) => (
                  <button
                      key={payment.id}
                      onClick={() => {
                        setSelectedPayment({
                          id: payment.id,
                          name: payment.name,
                          type: payment.type
                        })
                      }}
                    className={`
                      flex flex-col items-center justify-center p-4 rounded-xl
                        ${selectedPayment.id === payment.id 
                        ? 'bg-[#8a4fff]/10 border-2 border-[#8a4fff]' 
                        : 'bg-[#1a0b2e] border-2 border-transparent'}
                      transition-all duration-300 hover:bg-[#8a4fff]/10
                    `}
                  >
                      {payment.icon}
                      <span className="mt-3 text-sm text-white">{payment.name}</span>
                    </button>
                  ))}
                </div>

                {/* Separate Skin Payment Section */}
                <div className="mt-6 bg-[#2c1b4a] rounded-xl p-4 border border-[#8a4fff]/20">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center space-x-3">
                      <SiSteam className="w-8 h-8 text-[#8a4fff]" />
                      <h3 className="text-lg font-semibold text-[#8a4fff]">Skin Payment</h3>
                    </div>
                    <span className="bg-yellow-500/20 text-yellow-400 text-xs px-2 py-1 rounded-full">
                      Coming Soon
                    </span>
                  </div>
                  
                  <p className="text-gray-300 mb-4 text-sm">
                    We're working on integrating multiple skin marketplaces for seamless trading.
                  </p>
                  
                  <button
                    onClick={() => setShowSkinPaymentModal(true)}
                    className="w-full bg-[#8a4fff]/10 text-[#8a4fff] 
                    py-3 rounded-lg hover:bg-[#8a4fff]/20 
                    transition-colors flex items-center justify-center"
                  >
                    <Gamepad2 className="mr-2 w-5 h-5" />
                    Learn More About Skin Payments
                  </button>
                </div>
            </div>
          </motion.div>

          {/* Right Column - Order Summary */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-gradient-to-br from-[#210746] to-[#2C095D] rounded-3xl p-8 border border-[#8a4fff]/10 h-fit"
          >
            <h2 className="text-xl font-semibold text-[#8a4fff] mb-6 flex items-center">
              <CreditCard className="mr-3 w-6 h-6" /> Order Summary
            </h2>
            
            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Subtotal</span>
                <span className="text-white font-semibold">
                    €{subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Tax (10%)</span>
                <span className="text-white">
                    €{taxAmount.toFixed(2)}
                </span>
              </div>
              <div className="border-t border-[#8a4fff]/10 my-4"></div>
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold text-white">Total</span>
                <span className="text-2xl font-bold text-[#8a4fff]">
                    €{total.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Email Input */}
            <div className="mb-8">
              <label className="block text-sm text-gray-400 mb-2">Email Address</label>
              <input 
                type="email"
                value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setError(null)
                  }}
                placeholder="Enter your email"
                className="w-full p-3 bg-[#1a0b2e] rounded-xl text-white 
                border border-[#8a4fff]/20 focus:border-[#8a4fff] 
                transition-colors"
              />
            </div>

              {/* Policy Acknowledgment */}
              <div className="mb-6 flex items-center">
                <input 
                  type="checkbox" 
                  id="policy-checkbox"
                  checked={isPolicyAcknowledged}
                  onChange={() => setIsPolicyAcknowledged(!isPolicyAcknowledged)}
                  className="mr-3 w-5 h-5 text-[#8a4fff] rounded focus:ring-[#8a4fff]"
                />
                <label 
                  htmlFor="policy-checkbox" 
                  className="text-gray-400 flex items-center"
                >
                  I've read and accept the{' '}
                  <Link 
                    to="/policy" 
                    className="ml-1 text-[#8a4fff] hover:underline"
                  >
                    Policies
                  </Link>
                </label>
              </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <button
                onClick={handlePlaceOrder}
                  disabled={!isPolicyAcknowledged}
                  className={`
                    w-full py-4 rounded-xl transition-colors text-lg
                    ${isPolicyAcknowledged 
                      ? 'bg-[#8a4fff] text-white hover:bg-[#7a3ddf]' 
                      : 'bg-gray-500 text-gray-300 cursor-not-allowed'}
                  `}
              >
                Place Order
              </button>
              <button
                onClick={() => navigate('/')}
                className="w-full py-4 bg-transparent border border-[#8a4fff]/30 
                  text-[#00000] rounded-xl hover:bg-[#8a4fff]/10 
                transition-colors text-lg"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>

      {/* Modals */}
      {showPolicyModal && <PolicyModal />}
      {showSkinPaymentModal && <SkinPaymentModal />}
    </>
  )
}

export default CheckoutPage
