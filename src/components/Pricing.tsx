import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Zap, Star, Crown, Check, Clock, Sparkles, Dot, Asterisk } from 'lucide-react'
import { useCart } from './context/CartContext'
import confetti from 'canvas-confetti'
import { SiDiscord } from 'react-icons/si'
import { supabase } from '../lib/supabaseClient'

const CountdownBadge = () => {
  const [daysLeft, setDaysLeft] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCountdownData = async () => {
      try {
        // Get the latest countdown badge with specific columns
        const { data: countdownData, error } = await supabase
          .from('countdown_badges')
          .select('id, start_date, expiration_date')
          .order('expiration_date', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) {
          setDaysLeft(null);
        } else if (countdownData) {
          const expirationDate = new Date(countdownData.expiration_date);
          const now = new Date();
          const diffMs = expirationDate.getTime() - now.getTime();
          const diffDays = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
          setDaysLeft(diffDays);
        } else {
          setDaysLeft(null);
        }
      } catch (err) {
        setDaysLeft(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCountdownData();

    // Update every hour
    const timer = setInterval(fetchCountdownData, 60 * 60 * 1000);
    return () => clearInterval(timer);
  }, []);

  if (loading || daysLeft === null) {
    return null;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, x: 50, rotate: 40 }}
      animate={{ opacity: 1, x: 50, rotate: 40 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="absolute top-[2.2rem] lg:top-[0.8rem] right-[-10px] lg:right-[-15px] z-10 
        bg-gradient-to-r from-[#ff6a00] to-[#fdd835]
        text-white 
        px-14 py-2.5 
        -skew-x-12
        lg:text-sm
        text-xs
        font-extrabold
        flex items-center 
        shadow-2xl
        transform origin-top-right rotate-[30deg]
        hover:scale-110 
        transition-transform 
        duration-300
        border-2 border-white/20"
    >
      <Clock className="w-4 h-4 mr-2" />
      {daysLeft} Days Left
    </motion.div>
  );
};

interface Product {
  id: string
  name: string
  priceRange: string
  category: string
  icon: React.ReactElement
  features: string[]
  price: number
  image: string
  isSpecial?: boolean
}

interface PricingGridProps {
  products: Product[]
  addedProducts: string[]
  handleAddToCart: (product: Product) => void
  setAddedProducts: React.Dispatch<React.SetStateAction<string[]>>
  isSubscriptionDisabled: (productId: string) => boolean
  subscriptionStatus: 'active' | 'expired' | 'inactive'
  currentSubscription?: any
}

// Pricing Grid with Free Trial (4 columns)
const PricingGridWithTrial = ({ products, addedProducts, handleAddToCart, setAddedProducts, isSubscriptionDisabled, subscriptionStatus, currentSubscription }: PricingGridProps) => {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
      {products.map((product) => (
        <ProductCard 
          key={product.id}
          {...product}
          onAddToCart={() => handleAddToCart(product)}
          isAdded={addedProducts.includes(product.id)}
          onRemoveFromAdded={() => {
            setAddedProducts(prev => 
              prev.filter(id => id !== product.id)
            )
          }}
          isDisabled={isSubscriptionDisabled(product.id)}
          subscriptionStatus={subscriptionStatus}
          currentSubscription={currentSubscription}
        />
      ))}
    </div>
  )
}

// Pricing Grid without Free Trial (3 columns)
const PricingGridWithoutTrial = ({ products, addedProducts, handleAddToCart, setAddedProducts, isSubscriptionDisabled, subscriptionStatus, currentSubscription }: PricingGridProps) => {
  return (
    <div className="grid md:grid-cols-3 gap-8">
      {products
        .filter(product => product.id !== 'free-trial')
        .map((product) => (
          <ProductCard 
            key={product.id}
            {...product}
            onAddToCart={() => handleAddToCart(product)}
            isAdded={addedProducts.includes(product.id)}
            onRemoveFromAdded={() => {
              setAddedProducts(prev => 
                prev.filter(id => id !== product.id)
              )
            }}
            isDisabled={isSubscriptionDisabled(product.id)}
            subscriptionStatus={subscriptionStatus}
            currentSubscription={currentSubscription}
          />
        ))}
    </div>
  )
}

const Products = () => {
  const { 
    cart, 
    addToCart, 
    removeFromCart 
  } = useCart()
  const [addedProducts, setAddedProducts] = useState<string[]>([])
  const [currentSubscription, setCurrentSubscription] = useState<any>(null)
  const [subscriptionStatus, setSubscriptionStatus] = useState<'active' | 'expired' | 'inactive'>('inactive')
  const [hasUsedFreeTrial, setHasUsedFreeTrial] = useState(false)
  const [purchasedSubscriptions, setPurchasedSubscriptions] = useState<string[]>([])
  const [hasCheckedTrial, setHasCheckedTrial] = useState(false)

  // Fetch user's current subscription and order history
  useEffect(() => {
    let isMounted = true;
    const fetchUserData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          if (isMounted) setHasCheckedTrial(true)
          return
        }

        // Fetch current subscription
        const { data: userData } = await supabase
          .from('users')
          .select('id, current_subscription_id, subscription_start_date, subscription_end_date')
          .eq('auth_id', user.id)
          .single()

        // Check if there's an active order for this subscription
        if (userData?.current_subscription_id) {
          const { data: activeOrder } = await supabase
            .from('orders')
            .select('id, status, expiration_date')
            .eq('subscription_id', userData.current_subscription_id)
            .eq('status', 'completed')
            .single()

          // If no active order found or order has expired, clear the subscription
          const now = new Date()
          const orderExpired = activeOrder ? new Date(activeOrder.expiration_date) < now : true

          if (!activeOrder || orderExpired) {
            await supabase
              .from('users')
              .update({
                current_subscription_id: null,
                subscription_start_date: null,
                subscription_end_date: null
              })
              .eq('id', userData.id)

            setCurrentSubscription(null)
            setSubscriptionStatus('expired')
            return
          }

          const { data: subscriptionData } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('id', userData.current_subscription_id)
            .single()

          if (subscriptionData) {
            const endDate = new Date(userData.subscription_end_date)
            const status = endDate > now ? 'active' : 'expired'
            
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
              ...subscriptionData,
              endDate,
              status
            })
            setSubscriptionStatus(status)
          }
        } else {
          // No subscription found, set status to inactive
          setCurrentSubscription(null)
          setSubscriptionStatus('inactive')
        }

        // Check order history for free trial usage as soon as possible
        if (userData) {
          const { data: orders } = await supabase
            .from('orders')
            .select('subscription_id, status')
            .eq('user_id', userData.id)

          if (orders && orders.length > 0) {
            const { data: subscriptions } = await supabase
              .from('subscriptions')
              .select('id, name')
              .in('id', orders.map(order => order.subscription_id))

            if (subscriptions) {
              // Check for free trial
              const hasTrial = subscriptions.some(sub => sub.name === '24-Hour Free Trial')
              if (isMounted) setHasUsedFreeTrial(hasTrial)
            }
          } else {
            if (isMounted) setHasUsedFreeTrial(false)
          }
        }
        if (isMounted) setHasCheckedTrial(true)
      } catch (error) {
        console.error('Error fetching user data:', error)
        // On error, set status to inactive
        setCurrentSubscription(null)
        setSubscriptionStatus('inactive')
        if (isMounted) setHasCheckedTrial(true)
      }
    }

    fetchUserData()

    // Set up interval to check subscription status every minute
    const interval = setInterval(fetchUserData, 60000)

    // Cleanup interval on component unmount
    return () => {
      clearInterval(interval)
      isMounted = false
    }
  }, [])

  // Check if subscription is disabled
  const isSubscriptionDisabled = (productId: string) => {
    // If product is in cart, disable it
    if (cart.some(item => item.id === productId)) {
      return true
    }

    // If user has used free trial, disable it
    if (productId === 'free-trial' && hasUsedFreeTrial) {
      return true
    }

    // If user has an active subscription, disable all subscriptions
    if (subscriptionStatus === 'active' && currentSubscription) {
      return true
    }

    // If subscription has expired, enable all subscriptions
    if (subscriptionStatus === 'expired') {
      return false
    }

    return false
  }

  // Close cart on scroll
  useEffect(() => {
    const handleScroll = () => {
      window.dispatchEvent(new Event('closeCart'))
    }

    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  // Track cart changes and update added products
  useEffect(() => {
    const currentCartProductIds = cart.map(item => item.id)
    setAddedProducts(prev => 
      prev.filter(productId => currentCartProductIds.includes(productId))
    )
  }, [cart])

  const handleAddToCart = (product: any) => {
    if (addedProducts.includes(product.id)) return

    addToCart({ 
      id: product.id, 
      name: product.name, 
      price: product.price, 
      quantity: 1 
    })

    setAddedProducts(prev => [...prev, product.id])
    window.dispatchEvent(new Event('openCart'))
  }

  // In the products array, do not filter yet
  const products = [
    {
      id: 'free-trial',
      name: "24-Hour Free Trial",
      priceRange: "€0.00",
      category: "Limited Access",
      icon: <Sparkles />, 
      price: 0,
      duration_days: 1,
      image: "https://mir-s3-cdn-cf.behance.net/project_modules/source/b95e8765126337.60af5cc76e5df.jpg",
      features: [
        "Original Price: €49.99",
        "You Save: €49.99",
        "Discount: 100% off",
        "24-Hour Full Access",
        "200 Coins Withdrawal Limit",
        "Join Discord Required"
      ],
      isSpecial: true
    },
    {
      id: 'monthly',
      name: "1 Month Licence",
      priceRange: "€49.99",
      category: "RollWithdraw Bot",
      icon: <Zap />,
      price: 49.99,
      duration_days: 30,
      image: "https://mir-s3-cdn-cf.behance.net/project_modules/source/f02b1965126337.6021db766416d.jpg",
      features: [
        "Original Price: €249.99",
        "You Save: €200",
        "Discount: 80% off",
        "Priority Support",
        "No Withdrawals Limit",
        "Access to All Features"
      ]
    },
    {
      id: '6-months',
      name: "6 Months Licence",
      priceRange: "€269.99",
      category: "RollWithdraw Bot",
      icon: <Star />,
      price: 269.99,
      duration_days: 180,
      image: "https://mir-s3-cdn-cf.behance.net/project_modules/source/8bf05765126337.6002d0c795c64.jpg",
      features: [
        "Original Price: €1349.99",
        "You Save: €1080",
        "Discount: 80% off",
        "Priority Support",
        "No Withdrawals Limit",
        "Access to All Features",
      ]
    },
    {
      id: 'yearly',
      name: "12 Months Licence",
      priceRange: "€479.99",
      category: "RollWithdraw Bot",
      icon: <Crown />,
      price: 539.99,
      duration_days: 365,
      image: "https://mir-s3-cdn-cf.behance.net/project_modules/source/08ce9a65126337.5b4c8ac9c4b3b.jpg",
      features: [
        "Original Price: €2399.99",
        "You Save: €1860",
        "Discount: 80% off",
        "No Withdrawals Limit",
        "Unlimited Updates",
        "Access to All Features",
        "Ability to snipe expensive sticker crafts",
        // "Best Value Package"
      ]
    }
  ]

  // Filter out the free trial if the user has used it
  const filteredProducts = hasUsedFreeTrial
    ? products.filter(product => product.id !== 'free-trial')
    : products

  const orderItems = cart.map(item => ({
    id: item.id,
    name: item.name,
    price: item.price,
    quantity: item.quantity
  }))

  // Render the section and header immediately, but show loading spinner in the grid area until hasCheckedTrial is true
  return (
    <section 
      id="products" 
      className="py-16 bg-[#04011C] pt-20"
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-[28px] sm:text-4xl font-bold mb-4 
            text-transparent bg-clip-text 
            bg-gradient-to-r from-[#8a4fff] to-[#5e3c9b]">
              Pricing
          </h2>
          <p className="text-[16px] sm:text-xl text-gray-400 max-w-2xl mx-auto">
            Withdraw like a pro – no effort needed          
          </p>
        </div>
        {!hasCheckedTrial ? (
          <div className="flex flex-col items-center justify-center min-h-[300px]">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[#8a4fff] border-solid mb-4"></div>
            <p className="text-gray-400 text-lg">Loading plans...</p>
          </div>
        ) : (
          hasUsedFreeTrial ? (
            <PricingGridWithoutTrial 
              products={filteredProducts}
              addedProducts={addedProducts}
              handleAddToCart={handleAddToCart}
              setAddedProducts={setAddedProducts}
              isSubscriptionDisabled={isSubscriptionDisabled}
              subscriptionStatus={subscriptionStatus}
              currentSubscription={currentSubscription}
            />
          ) : (
            <PricingGridWithTrial 
              products={filteredProducts}
              addedProducts={addedProducts}
              handleAddToCart={handleAddToCart}
              setAddedProducts={setAddedProducts}
              isSubscriptionDisabled={isSubscriptionDisabled}
              subscriptionStatus={subscriptionStatus}
              currentSubscription={currentSubscription}
            />
          )
        )}
      </div>
    </section>
  )
}

// Add this new component at the top of the file
const SubscriptionCountdown = ({ endDate }: { endDate: Date }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0
  })

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date()
      const difference = endDate.getTime() - now.getTime()
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60)
        })
      }
    }

    // Calculate immediately
    calculateTimeLeft()

    // Update every minute
    const timer = setInterval(calculateTimeLeft, 60000)

    return () => clearInterval(timer)
  }, [endDate])

  return (
    <div className="flex items-center space-x-2 text-sm text-gray-400">
      <Clock className="w-4 h-4 text-[#8a4fff]" />
      <span>
        Your Current Subscription Expires in {timeLeft.days}d {timeLeft.hours}h 
      </span>
    </div>
  )
}

// Modify the ProductCard component to show countdown
const ProductCard = ({ 
  id,
  name, 
  priceRange, 
  category, 
  icon, 
  features,
  price,
  image,
  onAddToCart,
  isAdded,
  onRemoveFromAdded,
  isSpecial,
  isDisabled,
  subscriptionStatus,
  currentSubscription
}: {
  id: string
  name: string
  priceRange: string
  category: string
  icon: React.ReactElement
  features: string[]
  price: number
  image: string
  onAddToCart: () => void
  isAdded: boolean
  onRemoveFromAdded: () => void
  isSpecial?: boolean
  isDisabled?: boolean
  subscriptionStatus: 'active' | 'expired' | 'inactive'
  currentSubscription?: any
}) => {
  const [isHovered, setIsHovered] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  const handleAddToCart = () => {
    if (isAdded) return
    onAddToCart()
    
    // Confetti effect
    if (cardRef.current) {
      const cardRect = cardRef.current.getBoundingClientRect()
      
      const confettiInstance = confetti.create(undefined, { 
        resize: true,
        useWorker: true,
      })

      const duration = 3 * 1000
      const animationEnd = Date.now() + duration
      const defaults = { 
        startVelocity: 30, 
        spread: 360, 
        ticks: 60, 
        zIndex: 9999 
      }

      const randomInRange = (min: number, max: number) => {
        return Math.random() * (max - min) + min
      }

      const cardCenterX = cardRect.left + cardRect.width / 2
      const cardCenterY = cardRect.top + cardRect.height / 2

      const normalizedX = cardCenterX / window.innerWidth
      const normalizedY = cardCenterY / window.innerHeight

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now()

        if (timeLeft <= 0) {
          return clearInterval(interval)
        }

        const particleCount = 50 * (timeLeft / duration)
        
        const colors = ['#8a4fff', '#5e3c9b', '#6a3de3', '#4a2d8c']
        
        confettiInstance({
          ...defaults,
          particleCount,
          origin: { 
            x: normalizedX + randomInRange(-0.1, 0.1), 
            y: normalizedY + randomInRange(-0.1, 0.1) 
          },
          colors: [colors[Math.floor(Math.random() * colors.length)]]
        })
      }, 250)
    }
  }

  // Extract original price and discount from features
  const originalPrice = features[0].replace('Original Price: ', '')
  const discount = features[2].replace('Discount: ', '')

  return (
    <motion.div 
      ref={cardRef}
      className={`relative group overflow-hidden rounded-2xl ${isSpecial ? 'border-4 border-[#ffd700]' : ''}`}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      initial={{ opacity: 1, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      viewport={{ once: true }}
    >
      {/* Background Image Container */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className={`
            absolute inset-0 bg-cover bg-center
            transform transition-transform duration-500
            ${isHovered ? 'scale-110' : 'scale-100'}
          `}
          style={{ 
            backgroundImage: `url(${image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        <div className="absolute inset-0 bg-black/50"></div>
      </div>

      {/* Special Badge for Free Trial */}
      {isSpecial && (
        <div className="absolute top-0 right-0 z-20 bg-[#ffd700] text-black px-3 py-1 text-xs font-bold rounded-bl-lg">
          BEST OFFER
        </div>
      )}

      {/* Card Content */}
      <div 
        className={`
          relative z-10 p-4 sm:p-6 
          transition-all duration-500 
          ${isHovered 
            ? 'bg-[#2c1b4a]/90 shadow-2xl' 
            : 'bg-[#2c1b4a]/70 hover:bg-[#2c1b4a]/80'}
          transform 
          ${isHovered ? 'scale-105' : 'scale-100'}
          h-full flex flex-col
        `}
      >
        {/* Icon and Category */}
        <div className="flex justify-between items-center mb-3 sm:mb-4">
          <div className="p-2 sm:p-3 rounded-full bg-[#8a4fff]/20">
            {React.cloneElement(icon, {
              className: `w-5 h-5 sm:w-8 sm:h-8 text-[#8a4fff]`
            })}
          </div>
          <span className="text-[13px] sm:text-sm text-gray-300 opacity-70 absolute left-16 lg:left-24">{category}</span>
        </div>

        {/* Countdown Badge - Only show for non-free trial plans */}
        {!isSpecial && (
          <div className="relative">
            <CountdownBadge />
          </div>
        )}

        {/* Product Name and Price */}
        <div className="mb-3 sm:mb-4">
          <h3 className={`
            text-[24px] lg:text-3xl sm:text-xl font-semibold mb-2 
            ${isHovered ? 'text-[#8a4fff]' : 'text-white'}
            transition-colors duration-300
          `}>
            {name}
          </h3>
          <div className="flex items-center space-x-3">
            <p className="text-[18px] sm:text-2xl font-bold text-green-400">{priceRange}</p>
            <p className="text-[14px] sm:text-sm text-red-400 line-through">{originalPrice}</p>
          </div>
        </div>

        {/* Features */}
        <div className="mb-4 sm:mb-6 flex-grow">
          {features.slice(3).map((feature, index) => {
            const isFreeLimitedFeature = 
              id === 'free-trial' && 
              (feature === "Join Discord Required");
            
            return (
              <div 
                key={index} 
                className={`
                  flex items-center mb-2 
                  transform transition-all duration-300
                  ${isHovered ? 'translate-x-2' : ''}
                `}
              >
                {isFreeLimitedFeature ? (
                  <Asterisk 
                    className={`
                      w-4 h-4 sm:w-5 sm:h-5 mr-2  
                      ${isHovered ? 'text-[#8a4fff]' : 'text-blue-400'}
                      transition-colors duration-300 
                    `}  
                  />
                ) : (
                  <Check 
                    className={`
                      w-4 h-4 sm:w-5 sm:h-5 mr-2 
                      ${isHovered ? 'text-[#8a4fff]' : 'text-green-500'}
                      transition-colors duration-300
                    `} 
                  />
                )}
                <span className="text-[14px] sm:text-base text-gray-300">{feature}</span>
              </div>
            );
          })}
        </div>

        {/* Add countdown before the action button */}
        {subscriptionStatus === 'active' && currentSubscription && (
          <div className="mb-4 mx-auto">
            <SubscriptionCountdown endDate={currentSubscription.endDate} />
          </div>
        )}

        {/* Action Button Container */}
        <div className="mt-auto pt-4">
          <button 
            onClick={handleAddToCart}
            disabled={isAdded || isDisabled}
            className={`
              w-full py-2 sm:py-3 rounded-lg 
              transition-all duration-300
              text-[14px] sm:text-base
              ${isSpecial 
                ? 'bg-[#ffd700] text-black hover:bg-[#ffec00]' 
                : (isAdded || isDisabled
                ? 'bg-gray-500 text-gray-300 cursor-not-allowed' 
                : (isHovered 
                  ? 'bg-[#8a4fff] text-white' 
                    : 'bg-[#6a3de3]/20 text-[#8a4fff]'))}
              hover:bg-[#8a4fff] hover:text-white
            `}
          >
            {isAdded 
              ? 'Added to Cart' 
              : isDisabled
                ? (subscriptionStatus === 'active' 
                  ? 'Active Subscription' 
                  : 'Added to Cart')
                : (isSpecial 
                  ? 'Start Free Trial' 
                  : (isHovered 
                    ? 'Select This Plan' 
                    : 'Buy Now'))}
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default Products

