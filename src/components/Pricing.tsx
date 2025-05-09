import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Zap, Star, Crown, Check, Clock, Sparkles } from 'lucide-react'
import { useCart } from './context/CartContext'
import confetti from 'canvas-confetti'
import { SiDiscord } from 'react-icons/si'

const CountdownBadge = () => {
  const [daysLeft, setDaysLeft] = useState(30)

  useEffect(() => {
    const timer = setInterval(() => {
      setDaysLeft(prev => Math.max(0, prev - 1))
    }, 24 * 60 * 60 * 1000) // Simulate daily countdown

    return () => clearInterval(timer)
  }, [])

  return (
    <motion.div 
      initial={{ opacity: 0, x: 50, rotate: 40 }}
      animate={{ opacity: 1, x: 50, rotate: 40 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="absolute top-[6.2rem] lg:top-[6.8rem] right-[5px] lg:right-[10px] z-10 
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
  )
}

const Products = () => {
  const { 
    cart, 
    addToCart, 
    removeFromCart 
  } = useCart()
  const [addedProducts, setAddedProducts] = useState<string[]>([])

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

  const products = [
    {
      id: 'free-trial',
      name: "48-Hour Free Trial",
      priceRange: "€0.00",
      category: "Limited Access",
      icon: <Sparkles />,
      price: 0,
      duration_days: 2,
      image: "https://mir-s3-cdn-cf.behance.net/project_modules/source/08ce9a65126337.5b4c8ac9c4b3b.jpg",
      features: [
        "Original Price: €49.99",
        "You Save: €49.99",
        "Discount: 100% off",
        "48-Hour Full Access",
        "200 Coins Withdrawal Limit",
        "Join Discord Required"
        // "Experience All Features"
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
        "No Withdrawals Limit",
        "Automated Withdrawals",
        "Custom Price Ranges"
        // "Advanced Filtering"
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
        "No Withdrawals Limit",
        "Daily Case Collection",
        "No Cost",
        // "Simple Interface"
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
        "Priority Support",
        // "Best Value Package"
      ]
    }
  ]

  const orderItems = cart.map(item => ({
    id: item.id,
    name: item.name,
    price: item.price,
    quantity: item.quantity
  }))

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
            Most Popular Plans
          </h2>
          <p className="text-[16px] sm:text-xl text-gray-400 max-w-2xl mx-auto">
            Withdraw like a pro – no effort needed          
          </p>
        </div>
        
        <div className="grid md:grid-cols-4 gap-8">
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
            />
          ))}
        </div>
      </div>
    </section>
  )
}

// Modify ProductCard to handle special styling for free trial
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
  isSpecial
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
      className={`relative group overflow-hidden rounded-2xl ${isSpecial ? 'border-4 border-[#ffd700] animate-pulse' : ''}`}
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
          h-full
        `}
      >
        {/* Icon and Category */}
        <div className="flex justify-between items-center mb-3 sm:mb-4 ">
          <div className="p-2 sm:p-3 rounded-full bg-[#8a4fff]/20">
            {React.cloneElement(icon, {
              className: `w-5 h-5 sm:w-8 sm:h-8 text-[#8a4fff] ${isHovered ? 'animate-pulse' : ''}`
            })}
          </div>
          <span className="text-[13px] sm:text-sm text-gray-300 opacity-70 absolute left-16 lg:left-24">{category}</span>
        </div>
        
        {/* Discount Badge */}
        <div className="absolute top-[24px] opacity-0 lg:opacity-100 lg:top-10 left-[178px]  lg:left-56 z-10 bg-red-500 text-white px-3 py-1 rounded-full text-[10px]">
          {discount}
        </div>

        {/* Only show countdown for non-free trial plans */}
        {!isSpecial && <CountdownBadge />}

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
            <p className="text-[16px] sm:text-2xl font-bold text-green-400">{priceRange}</p>
            <p className="text-[12px] sm:text-sm text-red-400 line-through">{originalPrice}</p>
          </div>
        </div>

        {/* Features */}
        <div className="mb-4 sm:mb-6 flex-grow">
          {features.slice(3).map((feature, index) => (
            <div 
              key={index} 
              className={`
                flex items-center mb-2 
                transform transition-all duration-300
                ${isHovered ? 'translate-x-2' : ''}
              `}
            >
              <Check 
                className={`
                  w-4 h-4 sm:w-5 sm:h-5 mr-2 
                  ${isHovered ? 'text-[#8a4fff]' : 'text-green-500'}
                  transition-colors duration-300
                `} 
              />
              <span className="text-[14px] sm:text-base text-gray-300">{feature}</span>
            </div>
          ))}
        </div>

        {/* Action Button */}
        <button 
          onClick={handleAddToCart}
          disabled={isAdded}
          className={`
            w-full py-2 sm:py-3 rounded-lg 
            transition-all duration-300
            text-[14px] sm:text-base
            ${isSpecial 
              ? 'bg-[#ffd700] text-black hover:bg-[#ffec00]' 
              : (isAdded 
                ? 'bg-gray-500 text-gray-300 cursor-not-allowed' 
                : (isHovered 
                  ? 'bg-[#8a4fff] text-white' 
                  : 'bg-[#6a3de3]/20 text-[#8a4fff]'))}
            hover:bg-[#8a4fff] hover:text-white
            mt-auto
          `}
        >
          {isAdded 
            ? 'Added to Cart' 
            : (isSpecial 
              ? 'Start Free Trial' 
              : (isHovered 
                ? 'Select This Plan' 
                : 'Learn More'))}
        </button>
      </div>
    </motion.div>
  )
}

export default Products
