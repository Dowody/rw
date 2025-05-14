// import React, { useState, useEffect, useMemo } from 'react'
// import { motion, AnimatePresence } from 'framer-motion'
// import { useCart } from './context/CartContext'
// import { useNavigate, useLocation, Link } from 'react-router-dom'
// import { 
//   ChevronLeft, 
//   CreditCard, 
//   Trash2, 
//   Plus, 
//   Minus,
//   CheckCircle,
//   Lock,
//   AlertTriangle,
//   FileText,
//   Gamepad2,
//   ShieldCheck,
//   Wallet,
//   X,
//   Info,
//   AlertCircle,
//   Share2,
//   Link2,
//   ShoppingCart
// } from 'lucide-react'
// import { SiBitcoin, SiEthereum, SiTether, SiSteam, SiTradingview, SiDiscord, SiJoomla, SiRuby } from 'react-icons/si'
// import { supabase } from '../lib/supabaseClient'
// import { PostgrestSingleResponse } from '@supabase/supabase-js'
// import { createAppKit, useAppKit, useAppKitAccount, useAppKitProvider, useAppKitNetworkCore } from '@reown/appkit/react'
// import { networks, projectId, metadata, ethersAdapter } from '../lib/config'
// import { BrowserProvider, JsonRpcSigner, parseEther, formatEther } from 'ethers'
// import type { Provider } from '@reown/appkit/react'

// import { generateInvoicePDF } from '../lib/invoiceUtils'
// import { ethers } from 'ethers'

// // Initialize AppKit
// createAppKit({
//   adapters: [ethersAdapter],
//   networks,
//   metadata,
//   projectId,
//   themeMode: 'dark',
//   features: {
//     analytics: true,
//     socials: false,
//     email: false
//   },
//   themeVariables: {
//     '--w3m-accent': '#FFFFF',
//   }
// })

// // Add USDC Icon component
// const UsdcIcon = ({ className }: { className?: string }) => (
//   <img 
//     src="https://icones.pro/wp-content/uploads/2024/04/blue-usdc-icon-symbol-logo.png"
//     alt="USDC"
//     className={className}
//   />
// )

// const CheckoutPage: React.FC = () => {
//   const { 
//     cart, 
//     removeFromCart, 
//     getTotalPrice, 
//     updateQuantity, 
//     clearCart 
//   } = useCart()
//   const navigate = useNavigate()

//   const [email, setEmail] = useState('')
//   const [isOrderPlaced, setIsOrderPlaced] = useState(false)
//   const [selectedCrypto, setSelectedCrypto] = useState<'bitcoin' | 'ethereum' | 'tether'>('bitcoin')
//   const [isAuthenticated, setIsAuthenticated] = useState(false)
//   const [error, setError] = useState<string | null>(null)
//   const [loading, setLoading] = useState(true)
//   const [showSkinPaymentModal, setShowSkinPaymentModal] = useState(false)

//   // Policy Acknowledgment State
//   const [isPolicyAcknowledged, setIsPolicyAcknowledged] = useState(false)
//   const [showPolicyModal, setShowPolicyModal] = useState(false)

//   // Check for multiple subscriptions
//   useEffect(() => {
//     const subscriptionCount = cart.filter(item => 
//       item.id === 'monthly' || 
//       item.id === '6-months' || 
//       item.id === 'yearly' || 
//       item.id === 'free-trial'
//     ).length

//     if (subscriptionCount > 1) {
//       setError('You can only have one subscription in your cart at a time. Please remove any additional subscriptions before proceeding.')
//     } else {
//       setError(null)
//     }
//   }, [cart])

//   // Memoized calculations for performance
//   const subtotal = useMemo(() => getTotalPrice(), [cart])
//   const total = useMemo(() => subtotal, [subtotal])

//   const [skinMarketplaces, setSkinMarketplaces] = useState([
//     {
//       id: 'skinport',
//       name: 'Skinport',
//       logo: <SiRuby className="w-10 h-10 text-green-500" />,
//       status: 'coming_soon',
//       description: 'Popular skin trading platform'
//     },
//     {
//       id: 'dmarket',
//       name: 'DMarket',
//       logo: <SiJoomla className="w-10 h-10 text-blue-500" />,
//       status: 'coming_soon',
//       description: 'Global skin marketplace'
//     },
//     {
//       id: 'bitskins',
//       name: 'BitSkins',
//       logo: <SiTradingview className="w-10 h-10 text-purple-500" />,
//       status: 'coming_soon',
//       description: 'Trusted skin trading platform'
//     }
//   ])

//   const [selectedPayment, setSelectedPayment] = useState<{
//     id: string,
//     name: string,
//     type: 'crypto' | 'skin'
//   }>({
//     id: 'usdc',
//     name: 'USDC',
//     type: 'crypto'
//   })

//   // Payment Options
//   const paymentOptions: Array<{
//     id: string;
//     name: string;
//     icon: JSX.Element;
//     type: 'crypto' | 'skin';
//   }> = [
//     { 
//       id: 'usdc', 
//       name: 'USDC', 
//       icon: <UsdcIcon className="lg:w-8 lg:h-8 w-8 h-8 relative left-0" />,
//       type: 'crypto'
//     },
//     { 
//       id: 'ethereum', 
//       name: 'Ethereum', 
//       icon: <SiEthereum className="lg:w-8 lg:h-8 w-7 h-7 relative lg:left-0 left-1 text-[#627EEA]" />,
//       type: 'crypto'
//     },
//     { 
//       id: 'tether', 
//       name: 'Tether', 
//       icon: <SiTether className="lg:w-8 lg:h-8 w-7 h-7 relative lg:left-0 left-1 text-[#26A17B]" />,
//       type: 'crypto'
//     },
//     { 
//       id: 'skins', 
//       name: 'Skins', 
//       icon: <SiSteam className="w-7 h-8 relative top-1 left-2 text-blue-500" />,
//       type: 'skin'
//     }
//   ]

//   const [hasActiveSubscription, setHasActiveSubscription] = useState(false)
//   const [hasJoinedDiscord, setHasJoinedDiscord] = useState(false)

//   // AppKit hooks
//   const { open } = useAppKit()
//   const { isConnected, address } = useAppKitAccount()
//   const { walletProvider } = useAppKitProvider<Provider>('eip155')
//   const { chainId } = useAppKitNetworkCore()

//   // Authentication and User Check
//   useEffect(() => {
//     const checkAuthentication = async () => {
//       try {
//         const { data: { session } } = await supabase.auth.getSession()
        
//         if (!session) {
//           // Redirect to sign-in if not authenticated
//           navigate('/signin', { 
//             state: { 
//               from: '/checkout',
//               message: 'Please sign in to complete your purchase'
//             }
//           })
//           setLoading(false)
//           return
//         }

//         // User is authenticated
//         setIsAuthenticated(true)
        
//         // Fetch user details
//         const { data: { user } } = await supabase.auth.getUser()
        
//         if (user) {
//           setEmail(user.email || '')
//         }

//         // Check if we're coming from a successful order placement
//         const state = (location as any).state as { section?: string, message?: string }
//         if (cart.length === 0 && state?.message) {
//           navigate('/dashboard', { 
//             state: { 
//               section: 'purchases',
//               message: state.message
//             }
//           })
//         }

//         // Check for active subscription
//         if (user) {
//           const { data: userData } = await supabase
//             .from('users')
//             .select('subscription_end_date')
//             .eq('auth_id', user.id)
//             .single()
//           if (userData && userData.subscription_end_date) {
//             const endDate = new Date(userData.subscription_end_date)
//             const now = new Date()
//             if (endDate > now) {
//               setHasActiveSubscription(true)
//               setError('You already have an active subscription. You cannot purchase another until your current subscription expires.')
//             } else {
//               setHasActiveSubscription(false)
//             }
//           } else {
//             setHasActiveSubscription(false)
//           }
//         }

//         // Clear the state to prevent message reappearing on refresh
//         window.history.replaceState({}, document.title)
        
//         setLoading(false)
//       } catch (authError) {
//         console.error('Authentication check failed:', authError)
//         setError('Failed to verify authentication. Please try again.')
//         setLoading(false)
//       }
//     }

//     checkAuthentication()
//   }, [navigate, cart])

//   // Determine if the free trial is in the cart
//   const isFreeTrialInCart = cart.some(item => item.id === 'free-trial')
//   const isOnlyFreeTrialInCart = cart.length === 1 && isFreeTrialInCart

//   // Place Order Handler
//   const handlePlaceOrder = async () => {
//     // Check for multiple subscriptions before proceeding
//     const subscriptionCount = cart.filter(item => 
//       item.id === 'monthly' || 
//       item.id === '6-months' || 
//       item.id === 'yearly' || 
//       item.id === 'free-trial'
//     ).length

//     if (subscriptionCount > 1) {
//       setError('Only one subscription is allowed at a time. Please remove one of your subscriptions from the cart.')
//       return
//     }

//     if (hasActiveSubscription) {
//       setError('You already have an active subscription. You cannot purchase another until your current subscription expires.')
//       return
//     }

//     try {
//       // Get current user
//       const { data: { user } } = await supabase.auth.getUser()
      
//       if (!user) {
//         setError('User not authenticated')
//         return
//       }
      
//       // Fetch user details to ensure they exist in users table
//       let userData: PostgrestSingleResponse<{
//         id: string;
//         current_subscription_id: string | null;
//         subscription_start_date: string | null;
//         subscription_end_date: string | null;
//       }> = await supabase
//         .from('users')
//         .select(`
//           id, 
//           current_subscription_id, 
//           subscription_start_date, 
//           subscription_end_date
//         `)
//         .eq('auth_id', user.id)
//         .single()
      
//       if (userData.error || !userData.data) {
//         // Create user profile if not exists
//         const { data: newUserData, error: insertError } = await supabase
//           .from('users')
//           .insert({
//             auth_id: user.id,
//             email: user.email || '',
//             username: user.user_metadata?.username || user.email?.split('@')[0],
//             created_at: new Date().toISOString()
//           })
//           .select()
//           .single()
      
//         if (insertError) {
//           console.error('User profile creation error:', insertError)
//           setError('Failed to create user profile')
//           return
//         }
  
//         userData = { 
//           data: newUserData,
//           error: null,
//           count: 1,
//           status: 200,
//           statusText: 'OK'
//         }
//       }
  
//       if (!userData.data) {
//         setError('Failed to get user data')
//         return
//       }
  
//       // Mapping cart items to subscription names with more flexible matching
//       const subscriptionMap: Record<string, { name: string; duration: number }> = {
//         '1 Month Licence': { name: '1 Month Subscription', duration: 1 },
//         '6 Months Licence': { name: '6 Months Subscription', duration: 6 },
//         '12 Months Licence': { name: '12 Months Subscription', duration: 12 }
//       }
  
//       // Find the best matching subscription name
//       const cartItemName = cart[0].name
//       const mappedSubscription = subscriptionMap[cartItemName] || { 
//         name: cartItemName, 
//         duration: 1 
//       }
  
//       // Fetch subscription with more flexible matching
//       const { data: subscriptions, error: subscriptionError } = await supabase
//         .from('subscriptions')
//         .select('id, name, duration_days, price')
//         .or(`name.ilike.%${mappedSubscription.name}%,name.eq.${mappedSubscription.name}`)
  
//       if (subscriptionError) {
//         console.error('Subscription lookup error:', subscriptionError)
//         setError('Could not find a matching subscription')
//         return
//       }
  
//       if (!subscriptions || subscriptions.length === 0) {
//         console.error('No matching subscription found', { 
//           cartItemName, 
//           mappedSubscriptionName: mappedSubscription.name 
//         })
//         setError('No suitable subscription found. Please contact support.')
//         return
//       }
  
//       // Select the first matching subscription
//       const selectedSubscription = subscriptions[0]
  
//       // Determine subscription upgrade logic
//       let finalSubscriptionId = selectedSubscription.id
//       let subscriptionStartDate = new Date()
//       let subscriptionEndDate = new Date()
  
//       // If user has an existing subscription
//       if (userData.data.current_subscription_id) {
//         // Fetch current subscription details
//         const { data: currentSubscription, error: currentSubError } = await supabase
//           .from('subscriptions')
//           .select('id, name, duration_days, price')
//           .eq('id', userData.data.current_subscription_id)
//           .single()
  
//         // Upgrade logic: Extend subscription if new subscription is longer
//         if (currentSubscription && selectedSubscription.duration_days > currentSubscription.duration_days) {
//           // Calculate pro-rated price
//           const endDate = userData.data.subscription_end_date ? new Date(userData.data.subscription_end_date) : new Date()
//           const remainingDays = Math.ceil(
//             (endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
//           )
//           const proRatedPrice = (selectedSubscription.price / selectedSubscription.duration_days) * remainingDays
//           const finalPrice = total - proRatedPrice
  
//           // Update subscription with extended duration
//           subscriptionStartDate = new Date()
//           subscriptionEndDate = new Date(subscriptionStartDate)
//           subscriptionEndDate.setDate(subscriptionStartDate.getDate() + selectedSubscription.duration_days)
//         } else {
//           // If current subscription is longer or same, keep current subscription
//           finalSubscriptionId = userData.data.current_subscription_id
//           subscriptionStartDate = new Date(userData.data.subscription_start_date || new Date())
//           subscriptionEndDate = new Date(userData.data.subscription_end_date || new Date())
//         }
//       } else {
//         // No existing subscription, calculate end date based on trial or regular subscription
//         subscriptionEndDate = cart[0].id === 'free-trial'
//           ? new Date(subscriptionStartDate.getTime() + (2 * 24 * 60 * 60 * 1000)) // 2 days for trial
//           : new Date(subscriptionStartDate.setDate(subscriptionStartDate.getDate() + selectedSubscription.duration_days))
//       }
  
//       // Prepare order items
//       const orderItems = cart.map(item => ({
//         id: item.id,
//         name: item.name,
//         price: item.price,
//         quantity: item.quantity
//       }))
      
//       // Create order
//       const { data: order, error: orderError } = await supabase
//         .from('orders')
//         .insert({
//           user_id: userData.data.id,
//           subscription_id: finalSubscriptionId,
//           total_amount: total,
//           transaction_date: new Date().toISOString(),
//           status: 'completed',
//           transaction_hash: transactionHash,
//           items: [{
//             id: selectedSubscription.id,
//             name: selectedSubscription.name,
//             price: total,
//             quantity: 1
//           }]
//         })
//         .select()
//         .single()
      
//       if (orderError) {
//         console.error('Order creation error:', orderError)
//         setError('Failed to process order. Please try again.')
//         return
//       }

//       if (!order) {
//         setError('Failed to create order. Please try again.')
//         return
//       }
      
//       // Update user's subscription
//       const { error: updateError } = await supabase
//         .from('users')
//         .update({
//           current_subscription_id: finalSubscriptionId,
//           subscription_start_date: subscriptionStartDate.toISOString(),
//           subscription_end_date: subscriptionEndDate.toISOString()
//         })
//         .eq('id', userData.data.id)
      
//       if (updateError) {
//         console.error('Subscription update error:', updateError)
//         setError('Failed to update subscription. Please contact support.')
//         return
//       }
      
//       // After successful order placement
//       setIsOrderPlaced(true)
//       clearCart()
      
//       // Set multiple flags to ensure the popup appears
//       localStorage.setItem('showPurchaseSuccess', 'true')
//       localStorage.setItem('newSubscription', 'true')
      
//       // Generate invoice with transaction hash
//       if (order && !isFreeTrialInCart) {
//         const purchase = {
//           id: order.id,
//           subscriptionName: selectedSubscription.name,
//           date: new Date(),
//           amount: total,
//           items: orderItems,
//           duration_days: selectedSubscription.duration_days,
//           transactionHash: transactionHash || undefined
//         }
        
//         const userData = {
//           email: user.email || '',
//           username: user.user_metadata?.username || user.email?.split('@')[0] || ''
//         }
        
//         if (purchase.transactionHash) {
//           await generateInvoicePDF(purchase, userData)
//         }
//       }
      
//       // Navigate to dashboard with success message
//       navigate('/dashboard', { 
//         state: { 
//           section: 'purchases',
//           message: 'Purchase completed successfully! Your subscription is now active.',
//           showCongrats: true
//         }
//       })
      
//     } catch (err) {
//       console.error('Order placement error:', err)
//       setError('An unexpected error occurred. Please try again.')
//     }
//   }
  
//   const [isWalletModalOpen, setIsWalletModalOpen] = useState(false)
//   const [isProcessingPayment, setIsProcessingPayment] = useState(false)
//   const [currentStep, setCurrentStep] = useState(1)
//   const [paymentError, setPaymentError] = useState<string | null>(null)
//   const [transactionHash, setTransactionHash] = useState<string | null>(null)
//   const [showPaymentGuidance, setShowPaymentGuidance] = useState(false)
//   const [showPendingConfirmation, setShowPendingConfirmation] = useState(false)
//   const [hasInsufficientFunds, setHasInsufficientFunds] = useState(false)
//   const [requiredAmount, setRequiredAmount] = useState<string>('0')
//   const [showFinalizing, setShowFinalizing] = useState(false)
//   const [confirmingTimer, setConfirmingTimer] = useState<NodeJS.Timeout | null>(null)
//   const [longTransactionTimer, setLongTransactionTimer] = useState<NodeJS.Timeout | null>(null)
//   const [isTransactionRejected, setIsTransactionRejected] = useState(false)
//   const [notificationState, setNotificationState] = useState<{
//     type: 'info' | 'error' | null;
//     message: string | null;
//   }>({ type: null, message: null })

//   useEffect(() => {
//     return () => {
//       if (confirmingTimer) {
//         clearTimeout(confirmingTimer)
//       }
//       if (longTransactionTimer) {
//         clearTimeout(longTransactionTimer)
//       }
//     }
//   }, [confirmingTimer, longTransactionTimer])

//   const handleWalletPayment = async () => {
//     if (!isConnected || !walletProvider || !address) {
//       setPaymentError('Please connect your wallet first')
//       setIsProcessingPayment(false)
//       return
//     }

//     // Reset all states at the start
//     setPaymentError(null)
//     setShowFinalizing(false)
//     setIsTransactionRejected(false)
//     setNotificationState({ type: null, message: null })
//     if (confirmingTimer) {
//       clearTimeout(confirmingTimer)
//     }
//     if (longTransactionTimer) {
//       clearTimeout(longTransactionTimer)
//     }

//     try {
//       // Step 1: Preparing transaction
//       setCurrentStep(1)
//       const provider = new BrowserProvider(walletProvider, chainId)
//       const signer = new JsonRpcSigner(provider, address)

//       // For free trial, skip the transaction and directly handle the order
//       if (isOnlyFreeTrialInCart) {
//         handlePlaceOrder()
//         return
//       }

//       // Calculate amount in ETH with proper decimal handling
//       const euroAmount = total;
//       const amountInEth = Number((euroAmount / 2000).toFixed(8));
      
//       if (isNaN(amountInEth) || amountInEth <= 0) {
//         throw new Error('Invalid payment amount');
//       }

//       // Get current gas price
//       const feeData = await provider.getFeeData()
//       const gasPrice = feeData.gasPrice || BigInt(0)

//       // Create contract instance based on selected cryptocurrency
//       let contractAddress = ""
//       let contractABI: Array<{
//         inputs: any[];
//         name: string;
//         outputs: any[];
//         stateMutability: string;
//         type: string;
//       }> = []
      
//       switch(selectedPayment.id) {
//         case 'usdc':
//           contractAddress = "0xe317A4424eC6d68Ec4a4268F4144b206eF5609D7"
//           contractABI = [
//             {
//               "inputs": [],
//               "name": "deposit",
//               "outputs": [],
//               "stateMutability": "payable",
//               "type": "function"
//             }
//           ]
//           break
//         case 'ethereum':
//           contractAddress = "0xe317A4424eC6d68Ec4a4268F4144b206eF5609D7"
//           contractABI = [
//             {
//               "inputs": [],
//               "name": "deposit",
//               "outputs": [],
//               "stateMutability": "payable",
//               "type": "function"
//             }
//           ]
//           break
//         case 'tether':
//           contractAddress = "0xe317A4424eC6d68Ec4a4268F4144b206eF5609D7"
//           contractABI = [
//             {
//               "inputs": [],
//               "name": "deposit",
//               "outputs": [],
//               "stateMutability": "payable",
//               "type": "function"
//             }
//           ]
//           break
//         default:
//           throw new Error('Invalid payment method')
//       }
      
//       // For ETH, USDC, and USDT, use contract instance
//       if (selectedPayment.id === 'ethereum' || selectedPayment.id === 'usdc' || selectedPayment.id === 'tether') {
//         const contract = new ethers.Contract(contractAddress, contractABI, signer)
        
//         // Check if balance is sufficient
//         const balance = await provider.getBalance(address)
//         const totalRequired = parseEther(amountInEth.toString()) + (gasPrice * BigInt(21000))
//         setRequiredAmount(formatEther(totalRequired))
        
//         if (balance < totalRequired) {
//           setHasInsufficientFunds(true)
//           throw new Error('Insufficient funds')
//         }

//         // Step 2: Waiting for wallet confirmation
//         setCurrentStep(2)
//         setNotificationState({
//           type: 'info',
//           message: 'Please confirm the transaction in your wallet to continue.'
//         })

//         // Set timeout for finalizing message
//         const timer = setTimeout(() => {
//           if (!isTransactionRejected) {
//             setShowFinalizing(true)
//           }
//         }, 20000)
//         setConfirmingTimer(timer)

//         // Set timeout for long transaction message
//         const longTxTimer = setTimeout(() => {
//           if (!isTransactionRejected) {
//             setNotificationState({
//               type: 'info',
//               message: 'The transaction is taking longer than usual. Please be patient while we wait for blockchain confirmation.'
//             })
//           }
//         }, 25000)
//         setConfirmingTimer(longTxTimer)

//         // Set timeout for very long transaction message
//         const veryLongTxTimer = setTimeout(() => {
//           if (!isTransactionRejected) {
//             setNotificationState({
//               type: 'error',
//               message: 'Transaction is still pending. Please DO NOT close this page! If you leave now, your payment will be processed but your subscription won\'t be activated. Stay on this page until the transaction is complete.'
//             })
//           }
//         }, 50000)
//         setLongTransactionTimer(veryLongTxTimer)
        
//         try {
//           // Send transaction using contract instance
//           const tx = await contract.deposit({
//             value: parseEther(amountInEth.toString()),
//             gasPrice: gasPrice
//           })
          
//           if (tx?.hash) {
//             setTransactionHash(tx.hash)
//             setNotificationState({
//               type: 'info',
//               message: 'Success! Payment received.'
//             })

//             // Step 3: Waiting for blockchain confirmation
//             setCurrentStep(3)
//             // Wait for transaction to be mined
//             const receipt = await tx.wait()
            
//             if (receipt && receipt.status === 1) {
//               handlePlaceOrder()
//               setIsWalletModalOpen(false)
//             } else {
//               throw new Error('Transaction failed')
//             }
//           }
//         } catch (txError: any) {
//           // Handle transaction-specific errors
//           if (txError.code === 'ACTION_REJECTED' || txError.message?.toLowerCase().includes('user denied')) {
//             setIsTransactionRejected(true)
//             if (longTransactionTimer) {
//               clearTimeout(longTransactionTimer)
//               setLongTransactionTimer(null)
//             }
//             if (confirmingTimer) {
//               clearTimeout(confirmingTimer)
//               setConfirmingTimer(null)
//             }
//             setNotificationState({
//               type: 'error',
//               message: 'You rejected the transaction. Click Pay again if you want to try.'
//             })
//           } else {
//             throw txError // Re-throw other errors to be caught by outer catch
//           }
//         }
//       } else {
//         // For USDT, show address for manual transfer
//         setNotificationState({
//           type: 'info',
//           message: `Please send ${amountInEth} ${(selectedPayment.id as string).toUpperCase()} to: ${contractAddress}`
//         })
//       }
//     } catch (error: any) {
//       console.error('Payment Error:', error)
      
//       if (error.code === 'INSUFFICIENT_FUNDS' || error.message === 'Insufficient funds') {
//         setHasInsufficientFunds(true)
//         setNotificationState({
//           type: 'error',
//           message: `Not enough funds in your wallet. You need €${total.toFixed(2)} to complete this transaction.`
//         })
//       } else {
//         setNotificationState({
//           type: 'error',
//           message: 'Something went wrong. The transaction was rejected. Please try again or contact support if the problem persists.'
//         })
//       }
//     } finally {
//       setIsProcessingPayment(false)
//       setCurrentStep(1)
//       setShowFinalizing(false)
//       if (confirmingTimer) {
//         clearTimeout(confirmingTimer)
//         setConfirmingTimer(null)
//       }
//       if (longTransactionTimer) {
//         clearTimeout(longTransactionTimer)
//         setLongTransactionTimer(null)
//       }
//     }
//   }

//   const [showSubscriptionError, setShowSubscriptionError] = useState(false)

//   const handlePayClick = () => {
//     const subscriptionCount = cart.filter(item => 
//       item.id === 'monthly' || 
//       item.id === '6-months' || 
//       item.id === 'yearly' || 
//       item.id === 'free-trial'
//     ).length

//     if (subscriptionCount > 1) {
//       setShowSubscriptionError(true)
//       return
//     }

//     setIsProcessingPayment(true)
//     setCurrentStep(1)
//     handleWalletPayment()
//   }

//   // Policy Modal Component
//   const PolicyModal = () => (
//     <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
//       <motion.div 
//         initial={{ opacity: 1, scale: 0.9 }}
//         animate={{ opacity: 1, scale: 1 }}
//         className="bg-[#0a0415] rounded-2xl p-8 max-w-md w-full border border-[#8a4fff]/10"
//       >
//         <div className="flex items-center mb-6">
//           <FileText className="w-8 h-8 text-[#8a4fff] mr-4" />
//           <h2 className="text-2xl font-semibold text-[#8a4fff]">Policy Acknowledgment</h2>
//         </div>
        
//         <div className="mb-6 text-gray-300 space-y-4">
//           <p>Before completing your purchase, please review and acknowledge our:</p>
//           <ul className="list-disc list-inside">
//             <li>
//               <Link 
//                 to="/terms" 
//                 target="_blank" 
//                 className="text-[#8a4fff] hover:underline"
//               >
//                 Terms of Service
//               </Link>
//             </li>
//             <li>
//               <Link 
//                 to="/privacy" 
//                 target="_blank" 
//                 className="text-[#8a4fff] hover:underline"
//               >
//                 Privacy Policy
//               </Link>
//             </li>
//             <li>
//               <Link 
//                 to="/refund" 
//                 target="_blank" 
//                 className="text-[#8a4fff] hover:underline"
//               >
//                 Refund Policy
//               </Link>
//             </li>
//           </ul>
//         </div>

//         <div className="flex items-center mb-6">
//           <input 
//             type="checkbox" 
//             id="policy-acknowledge"
//             checked={isPolicyAcknowledged}
//             onChange={() => setIsPolicyAcknowledged(!isPolicyAcknowledged)}
//             className="mr-3 w-5 h-5 text-[#8a4fff] rounded focus:ring-[#8a4fff]"
//           />
//           <label 
//             htmlFor="policy-acknowledge" 
//             className="text-gray-300"
//           >
//             I have read and agree to the terms and conditions.
//           </label>
//         </div>

//         <div className="flex space-x-4">
//           <button 
//             onClick={() => setShowPolicyModal(false)}
//             className="flex-1 py-3 bg-transparent border border-[#8a4fff]/30 text-[#8a4fff] rounded-lg"
//           >
//             Cancel
//           </button>
//           <button 
//             onClick={() => {
//               if (isPolicyAcknowledged) {
//                 setShowPolicyModal(false)
//                 handlePayClick()
//               }
//             }}
//             disabled={!isPolicyAcknowledged}
//             className={`
//               flex-1 py-3 rounded-lg
//               ${isPolicyAcknowledged 
//                 ? 'bg-[#8a4fff] text-white' 
//                 : 'bg-gray-500 text-gray-300 cursor-not-allowed'}
//             `}
//           >
//             Confirm
//           </button>
//         </div>
//       </motion.div>
//     </div>
//   )

//   // Skin Payment Modal Component
//   const SkinPaymentModal = () => (
//     <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
//       <motion.div 
//         initial={{ opacity: 1, scale: 0.9 }}
//         animate={{ opacity: 1, scale: 1 }}
//         className="bg-[#0a0415] rounded-2xl p-4 sm:p-8 max-w-3xl w-full border border-[#8a4fff]/10 my-4 sm:my-8"
//       >
//         <div className="flex items-center mb-4 sm:mb-6 sticky top-0 bg-[#0a0415] z-10">
//           {/* <Gamepad2 className="w-6 h-6 sm:w-8 sm:h-8 text-[#8a4fff] mr-3 sm:mr-4" /> */}
//           <h2 className="text-[20px] sm:text-2xl font-semibold text-[#8a4fff] m-auto">Skin Transfer Marketplaces</h2>
//         </div>
        
//         <div className="mb-4 sm:mb-6 text-gray-300 space-y-3 sm:space-y-4">
//           <p className="text-center text-[14px] sm:text-base">
//             Select a marketplace to transfer your skins seamlessly.
//           </p>
          
//           <div className="grid md:grid-cols-3 gap-3 sm:gap-4">
//             {[
             
//               {
//                 id: 'bitskins',
//                 name: 'BitSkins',
//                 logo: <SiJoomla className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500" />,
//                 description: "Trusted skin trading platform",
//                 url: "https://bitskins.com/",
//                 status: 'active'
//               },
//               {
//                 id: 'tradeit',
//                 name: 'TradeIt.gg',
//                 logo: <SiSteam className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />,
//                 description: "Instant skin trading platform",
//                 url: "https://tradeit.gg/",
//                 status: 'active'
//               }
//             ].map((marketplace) => (
//               <motion.div 
//                 key={marketplace.id}
//                 whileHover={{ scale: 1.05 }}
//                 whileTap={{ scale: 0.95 }}
//                 className={`
//                   bg-[#2c1b4a] rounded-xl p-4 sm:p-6 text-center relative
//                   transition-all duration-300 
//                   ${marketplace.status === 'active' 
//                     ? 'hover:border-[#8a4fff] border border-transparent' 
//                     : 'opacity-50 cursor-not-allowed'}
//                 `}
//               >
//                 <div className="flex justify-center mb-3 sm:mb-4">
//                   {marketplace.logo}
//                 </div>
//                 <h3 className="text-[16px] sm:text-lg font-semibold mb-2 text-white">{marketplace.name}</h3>
//                 <p className="text-gray-400 text-[12px] sm:text-sm mb-3 sm:mb-4">{marketplace.description}</p>
                
//                 <button
//                   onClick={() => {
//                     if (marketplace.status === 'active') {
//                       window.open(marketplace.url, '_blank', 'noopener,noreferrer')
//                     }
//                   }}
//                   disabled={marketplace.status !== 'active'}
//                   className={`
//                     w-full py-2 sm:py-3 rounded-lg transition-colors text-[12px] sm:text-sm
//                     ${marketplace.status === 'active' 
//                       ? 'bg-[#8a4fff] text-white hover:bg-[#7a3ddf]' 
//                       : 'bg-gray-500 text-gray-300 cursor-not-allowed'}
//                   `}
//                 >
//                   {marketplace.status === 'active' ? 'Open Marketplace' : 'Coming Soon'}
//                 </button>
//               </motion.div>
//             ))}
//           </div>
//         </div>

//         <div className="mt-4 bg-gradient-to-br from-[#8a4fff]/20 to-[#8a4fff]/5 rounded-xl border border-[#8a4fff]/20 shadow-lg hover:border-[#8a4fff] transition-all duration-300">
//           <div className="p-4">
//             <div className="flex items-center mb-3">
//               <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8a4fff]/30 to-[#8a4fff]/10 flex items-center justify-center mr-3 shadow-inner">
//                 <ShieldCheck className="w-5 h-5 text-[#8a4fff]" />
//               </div>
//               <div>
//                 <h3 className="text-base font-semibold text-white">Marketplace Security</h3>
//                 <p className="text-xs text-[#8a4fff]/70">Stay protected</p>
//               </div>
//             </div>
//             <p className="text-sm text-gray-300 pl-13 leading-relaxed">
//               We only work with verified marketplaces. Double-check trade details and never accept offers from unofficial sources.
//             </p>
//           </div>
//         </div>

//         <div className="flex space-x-3 sm:space-x-4">
//           <button 
//             onClick={() => setShowSkinPaymentModal(false)}
//             className="flex-1 py-2 sm:py-3 bg-transparent border border-[#8a4fff]/30 text-[#8a4fff] rounded-lg text-[14px] sm:text-sm"
//           >
//             Close
//           </button>
//           <button 
//             onClick={() => {
//               window.open('/contact', '_blank')
//               setShowSkinPaymentModal(false)
//             }}
//             className="flex-1 py-2 sm:py-3 bg-[#8a4fff] text-white rounded-lg hover:bg-[#7a3ddf] text-[14px] sm:text-sm"
//           >
//             Contact Support
//           </button>
//         </div>
//       </motion.div>
//     </div>
//   )

//   // Notification component
//   const Notification = ({ message, type, onClose }: { message: string; type: 'error' | 'success' | 'info'; onClose: () => void }) => {
//     const [progress, setProgress] = useState(100)

//     useEffect(() => {
//       if (type !== 'info') {
//         const duration = 5000
//         const interval = 50
//         const steps = duration / interval
//         const decrement = 100 / steps

//         const timer = setInterval(() => {
//           setProgress((prev) => {
//             if (prev <= 0) {
//               clearInterval(timer)
//               onClose()
//               return 0
//             }
//             return prev - decrement
//           })
//         }, interval)

//         return () => clearInterval(timer)
//       }
//     }, [onClose, type])

//     const handleClose = () => {
//       onClose()
//     }

//     return (
//       <motion.div
//         initial={{ opacity: 1, y: -20 }}
//         animate={{ opacity: 1, y: 0 }}
//         exit={{ opacity: 1, y: -20 }}
//         className={`fixed left-0 right-0 mx-auto z-[60] p-4 rounded-xl w-[calc(100%-2rem)] max-w-md relative overflow-hidden ${
//           type === 'error' 
//             ? 'bg-red-500 border border-red-500 text-white' 
//             : type === 'success'
//             ? 'bg-emerald-500 border border-emerald-500 text-white'
//             : 'bg-blue-500 border border-blue-500 text-white'
//         }`}
//         style={{ top: '60px' }}
//       >
//         <div className="flex items-center justify-between">
//           <div className="flex items-center">
//             {type === 'error' ? (
//               <AlertTriangle className="mr-3 w-6 h-6 flex-shrink-0" />
//             ) : type === 'success' ? (
//               <CheckCircle className="mr-3 w-6 h-6 flex-shrink-0" />
//             ) : (
//               <Info className="mr-3 w-6 h-6 flex-shrink-0" />
//             )}
//             <span className="text-sm font-medium">{message}</span>
//           </div>
//           <button 
//             onClick={handleClose}
//             className="ml-4 text-white/80 hover:text-white transition-colors"
//           >
//             <X className="w-4 h-4" />
//           </button>
//         </div>
//       </motion.div>
//     )
//   }

//   // Loading State
//   if (loading) {
//     // Check for success message in location state
//     const state = (location as any).state as { section?: string, message?: string }
    
//     return (
//       <div className="min-h-screen bg-[#04011C] flex items-center justify-center">
//         {state?.message && (
//           <div className="absolute top-20 w-full max-w-md">
//             <div className="bg-emerald-500/10 border border-emerald-500 text-emerald-400 p-4 rounded-xl flex items-center">
//               <CheckCircle className="mr-3 w-6 h-6" />
//               {state.message}
//             </div>
//           </div>
//         )}
//         <div className="animate-spin rounded-full h-16 w-16 "></div>
//       </div>
//     )
//   }

//   // Empty Cart State
//   if (cart.length === 0) {
//     navigate('/dashboard', { 
//       state: { 
//         section: 'purchases'
//       }
//     })
//     return null
//   }

//   return (
//     <>
//       <div className="min-h-screen bg-[#04011C]">
//         <div className="max-w-4xl lg:max-w-2xl mx-auto px-4 sm:px-4 py-8 sm:py-10">
//           {/* Error Handling */}
//           {/* Removing the error message from here */}

//           {/* Header */}
//           <motion.div 
//             initial={{ opacity: 1, y: 0 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.4 }}
//             className="flex items-center mt-6 sm:mt-10"
//           >
//             <button 
//               onClick={() => navigate('/')}
//               className="text-gray-400 hover:text-[#8a4fff] flex items-center mr-auto mb-12 sm:mb-20"
//             >
//               <ChevronLeft className="mr-2  w-5 h-5 mt-5 sm:w-6 sm:h-6" /> 
//               <span className="text-[14px] sm:text-base mt-5">Back</span>
//             </button>
//             <h1 className="text-[24px] sm:text-3xl font-bold text-white absolute  mt-2 left-1/2 transform -translate-x-1/2 pt-4">
//               Checkout
//             </h1>
//           </motion.div>

//           <div className="grid md:grid-cols-1 gap-4 sm:gap-6">
//             {/* Left Column - Order Details */}
//             <motion.div 
//               initial={{ opacity: 1, x: 0 }}
//               animate={{ opacity: 1, x: 0 }}
//               transition={{ duration: 0.5, delay: 0.2 }}
//               className="space-y-4 sm:space-y-6"
//             >
//               {/* Cart Items */}
//               <div className="bg-gradient-to-br from-[#210746] to-[#2C095D] rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-[#8a4fff]/10">
//                 <h2 className="text-[18px] sm:text-xl font-semibold text-[#8a4fff] mb-4 sm:mb-6 flex items-center">
//                   <ShoppingCart className="mr-2 sm:mr-3 w-5 h-5 sm:w-6 sm:h-6" /> Your Items
//                 </h2>
//                 <div className="space-y-3 sm:space-y-4">
//                   {cart.map((item) => (
//                     <div 
//                       key={item.id} 
//                       className="flex items-center justify-between p-4 bg-gradient-to-br from-[#8a4fff]/20 to-[#8a4fff]/5 rounded-xl border border-[#8a4fff]/20"
//                     >
//                       <div className="flex items-center space-x-4">
//                         <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#8a4fff]/30 to-[#8a4fff]/10 flex items-center justify-center shadow-inner">
//                           <Gamepad2 className="w-6 h-6 text-[#8a4fff]" />
//                         </div>
//                         <div>
//                           <h3 className="text-sm font-medium text-white lg:text-base">{item.name}</h3>
//                           <p className="text-xs text-gray-400">
//                             {item.id === 'free-trial' && 'CSGORoll Script'}
//                             {item.id === 'monthly' && 'CSGORoll Script'}
//                             {item.id === '6-months' && 'CSGORoll Script'}
//                             {item.id === 'yearly' && 'CSGORoll Script'}
//                           </p>
//                         </div>
//                       </div>
//                       <div className="flex items-center space-x-4 lg:space-x-6">
//                         <span className="text-base font-bold lg:text-lg text-[#8a4fff]">
//                           €{(item.price).toFixed(2)}
//                         </span>
//                         <button 
//                           onClick={() => removeFromCart(item.id)}
//                           className="text-red-500 hover:text-red-400 p-2 hover:bg-red-500/10 rounded-lg transition-colors"
//                         >
//                           <Trash2 className="w-4 h-4 lg:w-5 lg:h-5" />
//                         </button>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               {/* Payment Method */}
//               {!isOnlyFreeTrialInCart && (
//                 <div className="bg-gradient-to-br from-[#210746] to-[#2C095D] rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-[#8a4fff]/10">
//                   <h2 className="text-[18px] sm:text-xl font-semibold text-[#8a4fff] mb-4 sm:mb-6 flex items-center">
//                     <Lock className="mr-2 sm:mr-3 w-5 h-5 sm:w-6 sm:h-6" /> Payment Method
//                   </h2>
                  
//                   <div className="space-y-3">
//                     {/* Crypto Options */}
//                     <div className="grid grid-cols-3 gap-3">
//                       {paymentOptions.filter(p => p.type === 'crypto').map((payment) => (
//                         <button
//                           key={payment.id}
//                           onClick={() => setSelectedPayment({
//                             id: payment.id,
//                             name: payment.name,
//                             type: payment.type
//                           })}
//                           className={`
//                             flex flex-col items-center p-3 rounded-xl transition-all duration-300
//                             ${selectedPayment.id === payment.id 
//                               ? 'bg-[#8a4fff]/10 border-2 border-[#8a4fff]' 
//                               : 'bg-[#1a0b2e] border-2 border-transparent hover:bg-[#8a4fff]/5'}
//                           `}
//                         >
//                           <div className="w-8 h-8 mb-2">{payment.icon}</div>
//                           <p className="text-sm font-medium text-white">{payment.name}</p>
//                         </button>
//                       ))}
//                     </div>

//                     {/* Skins Option */}
//                     {paymentOptions.filter(p => p.type === 'skin').map((payment) => (
//                       <button
//                         key={payment.id}
//                         onClick={() => setSelectedPayment({
//                           id: payment.id,
//                           name: payment.name,
//                           type: payment.type
//                         })}
//                         className={`
//                           w-full flex items-center p-4 rounded-xl transition-all duration-300
//                           ${selectedPayment.id === payment.id 
//                             ? 'bg-[#8a4fff]/10 border-2 border-[#8a4fff]' 
//                             : 'bg-[#1a0b2e] border-2 border-transparent hover:bg-[#8a4fff]/5'}
//                         `}
//                       >
//                         <div className="w-10 h-10 mr-4">{payment.icon}</div>
//                         <div className="flex-1 text-left">
//                           <p className="text-base font-medium text-white">{payment.name}</p>
//                           <p className="text-sm text-gray-400">Pay with CS:GO skins</p>
//                         </div>
//                         <div className="flex items-center space-x-3">
//                           <SiTradingview className="w-6 h-6 text-[#1E73A4]" />
//                           <SiSteam className="w-6 h-6 text-blue-500" />
//                         </div>
//                       </button>
//                     ))}
//                   </div>
//                 </div>
//               )}
//             </motion.div>

//             {/* Right Column - Order Summary and Wallet Connection */}
//             <motion.div 
//               initial={{ opacity: 1, x: 0 }}
//               animate={{ opacity: 1, x: 0 }}
//               transition={{ duration: 0.5, delay: 0.2 }}
//               className="space-y-4 sm:space-y-6"
//             >
//               {/* Connection Panel */}
//               {!isOnlyFreeTrialInCart && selectedPayment && (
//                 <div className="bg-gradient-to-br from-[#210746] to-[#2C095D] rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-[#8a4fff]/10">
//                   {selectedPayment.type === 'skin' ? (
//                     <>
//                       <h2 className="text-[18px] sm:text-xl font-semibold text-[#8a4fff] mb-4 sm:mb-6 flex items-center">
//                         <Gamepad2 className="mr-2 sm:mr-3 w-6 h-6 sm:w-6 sm:h-6" /> Select Marketplace
//                       </h2>
//                       <div className="space-y-3">
//                         {[
//                           {
//                             id: 'bitskins',
//                             name: 'BitSkins',
//                             logo: <SiJoomla className="w-5 h-5 text-purple-500" />,
//                             description: "Trusted skin trading platform",
//                             url: "https://bitskins.com/",
//                             status: 'active'
//                           },
//                           {
//                             id: 'tradeit',
//                             name: 'TradeIt.gg',
//                             logo: <SiSteam className="w-5 h-5 text-blue-500" />,
//                             description: "Instant skin trading platform",
//                             url: "https://tradeit.gg/",
//                             status: 'active'
//                           }
//                         ].map((marketplace) => (
//                           <button
//                             key={marketplace.id}
//                             onClick={() => window.open(marketplace.url, '_blank', 'noopener,noreferrer')}
//                             className={`
//                               w-full flex items-center p-3 rounded-lg transition-all duration-300
//                               ${marketplace.status === 'active' 
//                                 ? 'bg-gradient-to-br from-[#8a4fff]/20 to-[#8a4fff]/5 hover:from-[#8a4fff]/30 hover:to-[#8a4fff]/10 border border-[#8a4fff]/20 hover:border-[#8a4fff]' 
//                                 : 'bg-gray-800/50 cursor-not-allowed'}
//                             `}
//                           >
//                             <div className="w-8 h-8 mr-3 flex items-center justify-center">
//                               {marketplace.logo}
//                             </div>
//                             <div className="flex-1 text-left">
//                               <p className="text-sm font-medium text-white">{marketplace.name}</p>
//                               <p className="text-xs text-gray-400">{marketplace.description}</p>
//                             </div>
//                             <div className="ml-3">
//                               <svg className="w-5 h-5 text-[#8a4fff]" viewBox="0 0 24 24" fill="none">
//                                 <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//                               </svg>
//                             </div>
//                           </button>
//                         ))}
//                       </div>

//                       <div className="mt-4 bg-gradient-to-br from-[#8a4fff]/20 to-[#8a4fff]/5 rounded-xl border border-[#8a4fff]/20 shadow-lg hover:border-[#8a4fff] transition-all duration-300">
//                         <div className="p-4">
//                           <div className="flex items-center mb-3">
//                             <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8a4fff]/30 to-[#8a4fff]/10 flex items-center justify-center mr-3 shadow-inner">
//                               <ShieldCheck className="w-5 h-5 text-[#8a4fff]" />
//                             </div>
//                             <div>
//                               <h3 className="text-base font-semibold text-white">Marketplace Security</h3>
//                               <p className="text-xs text-[#8a4fff]/70">Stay protected</p>
//                             </div>
//                           </div>
//                           <p className="text-sm text-gray-300 pl-13 leading-relaxed">
//                             We only work with verified marketplaces. Double-check trade details and never accept offers from unofficial sources.
//                           </p>
//                         </div>
//                       </div>
//                     </>
//                   ) : (
//                     <>
//                       <h2 className="text-[18px] sm:text-xl font-semibold text-[#8a4fff] mb-4 sm:mb-6 flex items-center">
//                         <Wallet className="mr-2 sm:mr-3 w-5 h-5 sm:w-6 sm:h-6" /> Connect Your Wallet
//                       </h2>
//                       {!isConnected ? (
//                         <div>
//                           <div className="py-6 px-2">
//                             <div className="flex items-center gap-6 mb-8 p-4 bg-gradient-to-br from-[#8a4fff]/20 to-[#8a4fff]/5 rounded-xl border border-[#8a4fff]/20">
//                               <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-[#8a4fff]/30 to-[#8a4fff]/10 flex items-center justify-center shadow-inner">
//                                 <Wallet className="w-7 h-7 text-[#8a4fff]" />
//                               </div>
//                               <div>
//                                 <h3 className="text-lg font-semibold text-white mb-2">Wallet Not Connected</h3>
//                                 <p className="text-sm text-gray-400">Connect your crypto wallet to continue</p>
//                               </div>
//                             </div>
//                             <div className="scale-110 ml-2 w-fit p-1 bg-gradient-to-br from-[#8a4fff]/20 to-[#8a4fff]/5 rounded-full border border-[#8a4fff]/20">
//                               <appkit-button />
//                             </div>
//                           </div>
//                         </div>
//                       ) : (
//                         <div className="space-y-4">
//                           <div className="flex items-center justify-between p-4 bg-gradient-to-br from-[#8a4fff]/20 to-[#8a4fff]/5 rounded-xl border border-[#8a4fff]/20">
//                             <div className="flex items-center space-x-4">
//                               <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#8a4fff]/30 to-[#8a4fff]/10 flex items-center justify-center shadow-inner">
//                                 {selectedPayment.id === 'usdc' && <UsdcIcon className="w-7 h-7" />}
//                                 {selectedPayment.id === 'ethereum' && <SiEthereum className="w-7 h-7 text-[#627EEA]" />}
//                                 {selectedPayment.id === 'tether' && <SiTether className="w-7 h-7 text-[#26A17B]" />}
//                               </div>
//                               <div>
//                                 <p className="text-base font-medium text-white">{selectedPayment.name}</p>
//                                 <p className="text-sm text-gray-400">
//                                   {selectedPayment.id === 'ethereum' && `${(total / 2000).toFixed(8)} ETH`}
//                                   {selectedPayment.id === 'usdc' && `${(total).toFixed(2)} USDC`}
//                                   {selectedPayment.id === 'tether' && `${(total).toFixed(2)} USDT`}
//                                 </p>
//                               </div>
//                             </div>
//                             <div className="flex items-center space-x-2 bg-green-500/10 px-4 py-2 rounded-full">
//                               <div className="w-2 h-2 bg-green-500 rounded-full"></div>
//                               <span className="text-sm text-green-400">Connected</span>
//                             </div>
//                           </div>

//                           <div className="grid grid-cols-2 gap-4">
//                             <div className="p-4 bg-gradient-to-br from-[#8a4fff]/20 to-[#8a4fff]/5 rounded-xl border border-[#8a4fff]/20">
//                               <div className="flex items-center space-x-2 mb-2">
//                                 <Wallet className="w-5 h-5 text-[#8a4fff]" />
//                                 <p className="text-sm text-gray-400">Balance</p>
//                               </div>
//                               <p className="text-base font-medium text-white">
//                                 {walletProvider && chainId && (
//                                   <WalletBalance 
//                                     provider={walletProvider}
//                                     address={address}
//                                     chainId={Number(chainId)}
//                                   />
//                                 )}
//                               </p>
//                             </div>

//                             <div className="p-4 bg-gradient-to-br from-[#8a4fff]/20 to-[#8a4fff]/5 rounded-xl border border-[#8a4fff]/20">
//                               <div className="flex items-center space-x-2 mb-2">
//                                 <Link2 className="w-5 h-5 text-[#8a4fff]" />
//                                 <p className="text-sm text-gray-400">Network</p>
//                               </div>
//                               <p className="text-base font-medium text-white">
//                                 {chainId === 1 ? 'Ethereum' : 
//                                  chainId === 5 ? 'Goerli Testnet' : 
//                                  chainId === 11155111 ? 'Sepolia Testnet' : 
//                                  `Chain ID: ${chainId}`}
//                               </p>
//                             </div>
//                           </div>

//                           <div className="flex items-center justify-between p-4 bg-gradient-to-br from-[#8a4fff]/20 to-[#8a4fff]/5 rounded-xl border border-[#8a4fff]/20">
//                             <div className="flex items-center space-x-3">
//                               <SiEthereum className="w-5 h-5 text-[#627EEA]" />
//                               <div>
//                                 <p className="text-sm text-gray-400">Wallet Address</p>
//                                 <p className="text-sm font-medium text-white">
//                                   {address?.slice(0, 6)}...{address?.slice(-4)}
//                                 </p>
//                               </div>
//                             </div>
//                             <div className="flex justify-center">
//                               <appkit-button />
//                             </div>
//                           </div>
//                         </div>
//                       )}
//                     </>
//                   )}
//                 </div>
//               )}

//               {/* Order Summary */}
//               <div className="bg-gradient-to-br from-[#210746] to-[#2C095D] rounded-2xl sm:rounded-3xl p-4 border border-[#8a4fff]/10">
//                 <div className="space-y-4 mb-6">
//                   <div className="flex items-center justify-between p-4 bg-[#1a0b2e] rounded-xl">
//                     <div className="flex items-center space-x-3">
//                       <div className="w-10 h-10 rounded-lg bg-[#8a4fff]/10 flex items-center justify-center">
//                         <CreditCard className="w-5 h-5 text-[#8a4fff]" />
//                       </div>
//                       <div className="flex items-center space-x-2">
//                         <span className="text-sm text-gray-400">Total Amount</span>
//                       </div>
//                     </div>
//                     <div className="flex items-center">
//                       <span className="text-xl font-medium text-white">€{total.toFixed(2)}</span>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Policy Acknowledgment */}
//                 <div className="mb-6">
//                   <div className="flex items-center justify-center">
//                     <button
//                       onClick={() => setIsPolicyAcknowledged(!isPolicyAcknowledged)}
//                       className={`
//                         w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200
//                         ${isPolicyAcknowledged 
//                           ? 'bg-[#8a4fff] border-[#8a4fff]' 
//                           : 'bg-transparent border-[#8a4fff]/30 hover:border-[#8a4fff]/50'}
//                       `}
//                     >
//                       {isPolicyAcknowledged && (
//                         <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none">
//                           <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//                         </svg>
//                       )}
//                     </button>
//                     <button 
//                       onClick={() => setIsPolicyAcknowledged(!isPolicyAcknowledged)}
//                       className="text-gray-400 flex items-center text-sm ml-3 cursor-pointer hover:text-gray-300 transition-colors"
//                     >
//                       I've read and accept the{' '}
//                       <Link 
//                         to="/policy" 
//                         className="ml-1 text-[#8a4fff] hover:underline"
//                         onClick={(e) => e.stopPropagation()}
//                       >
//                         Policies
//                       </Link>
//                     </button>
//                   </div>
//                 </div>

//                 {/* Action Buttons */}
//                 <div className="space-y-3">
//                   {isOnlyFreeTrialInCart && !hasJoinedDiscord ? (
//                     <button
//                       onClick={() => {
//                         window.open('https://discord.gg/rollwithdraw', '_blank', 'noopener,noreferrer')
//                         setHasJoinedDiscord(true)
//                       }}
//                       className="w-full py-4 bg-[#5865F2] text-white rounded-xl hover:bg-[#4752C4] transition-colors text-lg flex items-center justify-center"
//                     >
//                       <SiDiscord className="w-6 h-6 mr-2" />
//                       Join Discord
//                     </button>
//                   ) : (
//                     <button
//                       onClick={handlePayClick}
//                       disabled={!isPolicyAcknowledged || hasActiveSubscription || isProcessingPayment}
//                       className={`
//                         w-full py-3.5 rounded-lg transition-all duration-300 flex items-center justify-center relative
//                         ${isPolicyAcknowledged && !hasActiveSubscription
//                           ? 'bg-gradient-to-r from-[#8a4fff] via-[#6a2dcf] to-[#4a1daf] text-white hover:from-[#7a3ddf] hover:via-[#5a2dbf] hover:to-[#3a1d9f] active:scale-[0.98] shadow-lg shadow-[#8a4fff]/20'
//                           : 'bg-gray-500 text-gray-300 cursor-not-allowed'}
//                       `}
//                     >
//                       {isProcessingPayment ? (
//                         <div className="flex items-center justify-between w-full px-4">
//                           <div className="flex items-center space-x-3">
//                             <div className="relative">
//                               <div className="animate-spin rounded-full h-6 w-6 border-2 border-white/30"></div>
//                               <div className="absolute top-0 left-0 animate-spin rounded-full h-6 w-6 border-t-2 border-white"></div>
//                             </div>
//                             <div className="flex flex-col">
//                               <span className="text-sm font-medium">Processing Payment</span>
//                               <div className="flex items-center space-x-2 mt-1">
//                                 <div className={`w-1.5 h-1.5 rounded-full ${currentStep >= 1 ? 'bg-white' : 'bg-white/30'}`}></div>
//                                 <div className={`w-1.5 h-1.5 rounded-full ${currentStep >= 2 ? 'bg-white' : 'bg-white/30'}`}></div>
//                                 <div className={`w-1.5 h-1.5 rounded-full ${currentStep >= 3 ? 'bg-white' : 'bg-white/30'}`}></div>
//                               </div>
//                             </div>
//                           </div>
//                           <div className="text-sm font-medium">
//                             {currentStep === 1 && "Preparing..."}
//                             {currentStep === 2 && !showFinalizing && "Confirming..."}
//                             {currentStep === 2 && showFinalizing && "Finalizing..."}
//                             {currentStep === 3 && "Done..."}
//                           </div>
//                         </div>
//                       ) : (
//                         <div className="flex items-center justify-center">
//                           <CreditCard className="w-4 h-4 mr-2" />
//                           <span className="text-base font-medium">
//                             {isOnlyFreeTrialInCart ? 'Activate Free Trial' : `Pay €${total.toFixed(2)}`}
//                           </span>
//                         </div>
//                       )}
//                     </button>
//                   )}
//                   <button
//                     onClick={() => navigate('/')}
//                     className="w-full py-3.5 bg-transparent border border-[#8a4fff]/30 
//                       text-[#8a4fff] rounded-lg hover:bg-[#8a4fff]/10 
//                       transition-colors text-base"
//                   >
//                     Cancel
//                   </button>
//                 </div>
//               </div>
//             </motion.div>
//           </div>
//         </div>
//       </div>

//       {/* Modals */}
//       {showPolicyModal && <PolicyModal />}
//       {showSkinPaymentModal && <SkinPaymentModal />}

//       {/* Notifications */}
//       <div className="fixed top-0 left-0 right-0 z-[60] flex flex-col gap-2 p-4">
//         <AnimatePresence>
//           {notificationState.type && notificationState.message && (
//             <Notification 
//               message={notificationState.message}
//               type={notificationState.type}
//               onClose={() => setNotificationState({ type: null, message: null })}
//             />
//           )}
//           {hasInsufficientFunds && (
//             <Notification 
//               message={`Not enough funds in your wallet. You need €${total.toFixed(2)} to complete this transaction.`}
//               type="error"
//               onClose={() => setHasInsufficientFunds(false)}
//             />
//           )}
//           {showSubscriptionError && (
//             <Notification 
//               message="You can only have one subscription in your cart at a time. Please remove any additional subscriptions before proceeding."
//               type="error"
//               onClose={() => setShowSubscriptionError(false)}
//             />
//           )}
//         </AnimatePresence>
//       </div>
//     </>
//   )
// }

// // Add this component at the end of the file, before the export
// const WalletBalance: React.FC<{
//   provider: Provider;
//   address: string | undefined;
//   chainId: number;
// }> = ({ provider, address, chainId }) => {
//   const [eurBalance, setEurBalance] = useState<string>('0');

//   useEffect(() => {
//     const fetchBalance = async () => {
//       if (provider && address) {
//         try {
//           const browserProvider = new BrowserProvider(provider, chainId);
//           const balance = await browserProvider.getBalance(address);
//           const ethBalance = formatEther(balance);

//           // Convert ETH to EUR (using 2000 EUR/ETH rate)
//           const eurValue = (Number(ethBalance) * 2000).toFixed(2);
//           setEurBalance(eurValue);
//         } catch (error) {
//           console.error('Error fetching balance:', error);
//         }
//       }
//     };

//     fetchBalance();
//     const interval = setInterval(fetchBalance, 10000); // Update every 10 seconds

//     return () => clearInterval(interval);
//   }, [provider, address, chainId]);

//   return <>€{eurBalance}</>;
// };

// export default CheckoutPage
