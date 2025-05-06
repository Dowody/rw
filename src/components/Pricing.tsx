import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Zap, Star, Crown, Check } from 'lucide-react'
import { useCart } from './context/CartContext'
import confetti from 'canvas-confetti'

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
  onRemoveFromAdded
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
}) => {
  const [isHovered, setIsHovered] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  const handleAddToCart = () => {
    // Prevent adding if already added
    if (isAdded) return

    // Add to cart
    onAddToCart()
    
    // Card-specific Confetti Effect
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

      // Normalize card center position relative to window
      const normalizedX = cardCenterX / window.innerWidth
      const normalizedY = cardCenterY / window.innerHeight

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now()

        if (timeLeft <= 0) {
          return clearInterval(interval)
        }

        const particleCount = 50 * (timeLeft / duration)
        
        // Purple and blue color palette
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

  return (
    <motion.div 
      ref={cardRef}
      className="relative group overflow-hidden rounded-2xl"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 50 }}
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

      {/* Card Content */}
      <div 
        className={`
          relative z-10 p-6 
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
        <div className="flex justify-between items-center mb-4">
          <div className="p-3 rounded-full bg-[#8a4fff]/20">
            {React.cloneElement(icon, {
              className: `w-8 h-8 text-[#8a4fff] ${isHovered ? 'animate-pulse' : ''}`
            })}
          </div>
          <span className="text-sm text-gray-300 opacity-70">{category}</span>
        </div>

        {/* Product Name and Price */}
        <div className="mb-4">
          <h3 className={`
            text-xl font-semibold mb-2 
            ${isHovered ? 'text-[#8a4fff]' : 'text-white'}
            transition-colors duration-300
          `}>
            {name}
          </h3>
          <p className="text-2xl font-bold text-green-400">{priceRange}</p>
        </div>

        {/* Features */}
        <div className="mb-6 flex-grow">
          {features.map((feature, index) => (
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
                  w-5 h-5 mr-2 
                  ${isHovered ? 'text-[#8a4fff]' : 'text-green-500'}
                  transition-colors duration-300
                `} 
              />
              <span className="text-gray-300">{feature}</span>
            </div>
          ))}
        </div>

        {/* Action Button */}
        <button 
          onClick={handleAddToCart}
          disabled={isAdded}
          className={`
            w-full py-3 rounded-lg 
            transition-all duration-300
            ${isAdded 
              ? 'bg-gray-500 text-gray-300 cursor-not-allowed' 
              : (isHovered 
                ? 'bg-[#8a4fff] text-white' 
                : 'bg-[#6a3de3]/20 text-[#8a4fff]')}
            hover:bg-[#8a4fff] hover:text-white
            mt-auto
          `}
        >
          {isAdded ? 'Added to Cart' : (isHovered ? 'Select This Plan' : 'Learn More')}
        </button>
      </div>
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
      // Dispatch a custom event to close the cart
      window.dispatchEvent(new Event('closeCart'))
    }

    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  // Track cart changes and update added products
  useEffect(() => {
    // Remove products from addedProducts that are no longer in the cart
    const currentCartProductIds = cart.map(item => item.id)
    setAddedProducts(prev => 
      prev.filter(productId => currentCartProductIds.includes(productId))
    )
  }, [cart])

  const handleAddToCart = (product: any) => {
    // Prevent adding the same product multiple times
    if (addedProducts.includes(product.id)) return

    // Add to cart
    addToCart({ 
      id: product.id, 
      name: product.name, 
      price: product.price, 
      quantity: 1 
    })

    // Mark product as added
    setAddedProducts(prev => [...prev, product.id])

    // Dispatch a custom event to open the cart
    window.dispatchEvent(new Event('openCart'))
  }

  const products = [
    {
      id: 'monthly',
      name: "1 Month Licence",
      priceRange: "€249.99",
      category: "RollWithdraw Bot",
      icon: <Zap />,
      price: 249.99,
      image: "https://mir-s3-cdn-cf.behance.net/project_modules/source/f02b1965126337.6021db766416d.jpg",
      features: [
        "No Withdrawals Limit",
        "Automated Withdrawals",
        "Custom Price Ranges",
        "Advanced Filtering"
      ]
    },
    {
      id: '6-months',
      name: "6 Months Licence",
      priceRange: "€1349.99",
      category: "RollWithdraw Bot",
      icon: <Star />,
      price: 1349.99,
      image: "https://mir-s3-cdn-cf.behance.net/project_modules/source/8bf05765126337.6002d0c795c64.jpg",
      features: [
        "No Withdrawals Limit",
        "Daily Case Collection",
        "No Cost",
        "Simple Interface"
      ]
    },
    {
      id: 'annual',
      name: "12 Months Licence",
      priceRange: "€2399.99",
      category: "RollWithdraw Bot",
      icon: <Crown />,
      price: 2399.99,
      image: "https://mir-s3-cdn-cf.behance.net/project_modules/source/08ce9a65126337.5b4c8ac9c4b3b.jpg",
      features: [
        "No Withdrawals Limit",
        "Roulette Strategy",
        "Multiple Bet Types",
        "Risk Management"
      ]
    }
  ]

  return (
    <section 
      id="products" 
      className="py-16 bg-[#04011C]"
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 
            text-transparent bg-clip-text 
            bg-gradient-to-r from-[#8a4fff] to-[#5e3c9b]">
            Most Popular Products
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Tailored solutions for every trading strategy
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
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

export default Products
