import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from './context/CartContext'
import { useNavigate } from 'react-router-dom'
import { 
  ShoppingCart, 
  Trash2, 
  X, 
  Plus, 
  Minus 
} from 'lucide-react'

interface CartDropdownProps {
  isOpen: boolean
  onClose: () => void
}

const CartDropdown: React.FC<CartDropdownProps> = ({ isOpen, onClose }) => {
  const { cart, removeFromCart, getTotalPrice, updateQuantity } = useCart()
  const navigate = useNavigate()

  const dropdownVariants = {
    hidden: { 
      opacity: 1, 
      y: -10,
      scale: 0.98,
      boxShadow: '0 0 0 rgba(138, 79, 255, 0)',
      transition: {
        type: 'tween',
        duration: 0.3,
        ease: 'easeOut'
      }
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      boxShadow: '0 10px 30px rgba(138, 79, 255, 0.2)',
      transition: {
        type: 'tween',
        duration: 0.4,
        ease: 'easeOut'
      }
    }
  }

  const itemVariants = {
    hidden: { 
      opacity: 1, 
      x: -10,
      scale: 0.98
    },
    visible: { 
      opacity: 1, 
      x: 0,
      scale: 1,
      transition: {
        type: 'tween',
        duration: 0.3,
        ease: 'easeOut'
      }
    }
  }

  // Prevent rendering if not open
  if (!isOpen) return null

  // Handle Proceed to Checkout
  const handleProceedToCheckout = () => {
    // Close the cart dropdown
    onClose()
    
    // Navigate to checkout
    navigate('/checkout', {
      state: { 
        from: window.location.pathname 
      }
    })
  }

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={dropdownVariants}
      className="fixed top-24 right-4 sm:right-6 md:right-8 lg:right-[530px] w-[calc(100%-2rem)] sm:w-[26rem] bg-[#1a0b2e] rounded-2xl shadow-2xl z-50 border border-[#8a4fff]/10 overflow-hidden"
    >
      {/* Elegant Header */}
      <div className="flex justify-between items-center p-4 sm:p-5 border-b border-[#8a4fff]/10">
        <div className="flex items-center space-x-3">
          <ShoppingCart className="w-6 h-6 sm:w-7 sm:h-7 text-[#8a4fff] opacity-80" />
          <h3 className="text-lg sm:text-xl font-semibold text-[#8a4fff]">Your Cart</h3>
        </div>
        <motion.button 
          whileHover={{ rotate: 90, scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onClose}
          className="text-gray-300 hover:text-[#8a4fff] transition-colors"
        >
          <X className="w-5 h-5 sm:w-6 sm:h-6" />
        </motion.button>
      </div>

      {/* Empty Cart State */}
      {cart.length === 0 && (
        <motion.div 
          initial={{ opacity: 1, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="p-6 sm:p-8 text-center"
        >
          <ShoppingCart className="w-16 h-16 sm:w-20 sm:h-20 mx-auto text-[#8a4fff] mb-4 opacity-30" />
          <p className="text-base sm:text-lg text-gray-400 mb-4">Your cart is empty</p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              onClose()
              navigate('/', { state: { scrollTo: '#products' } })
            }}
            className="bg-[#8a4fff] text-white px-6 py-2.5 rounded-lg hover:bg-[#7a3ddf] transition-colors text-sm"
          >
            View Subscriptions
          </motion.button>
        </motion.div>
      )}

      {/* Cart Items */}
      <AnimatePresence>
        {cart.length > 0 && (
          <motion.div 
            initial="hidden"
            animate="visible"
            exit="exit"
            className="max-h-[50vh] sm:max-h-64 overflow-y-auto custom-scrollbar"
          >
            {cart.map((item) => (
              <motion.div 
                key={item.id}
                variants={itemVariants}
                className="flex items-center justify-between p-3 sm:p-4 border-b border-[#8a4fff]/5 
                  hover:bg-[#2c1b4a]/30 transition-colors duration-300 group"
              >
                <div className="flex-grow min-w-0 mr-2">
                  <h4 className="text-sm sm:text-base font-semibold text-[#8a4fff] group-hover:text-white transition-colors truncate">
                    {item.name}
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-300 group-hover:text-gray-200 transition-colors">
                    €{item.price.toFixed(2)}
                  </p>
                </div>
                
                <div className="flex items-center space-x-2 sm:space-x-3">
                  {/* <div className="flex items-center bg-[#2c1b4a] rounded-full border border-[#8a4fff]/10">
                    <motion.button 
                      whileTap={{ scale: 0.9 }}
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-1.5 sm:p-2 text-gray-300 hover:text-[#8a4fff]"
                    >
                      <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                    </motion.button>
                    <span className="px-2 sm:px-3 text-sm sm:text-base text-white font-semibold">{item.quantity}</span>
                    <motion.button 
                      whileTap={{ scale: 0.9 }}
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-1.5 sm:p-2 text-gray-300 hover:text-[#8a4fff]"
                    >
                      <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                    </motion.button>
                  </div> */}
                  
                  <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart Summary */}
      {cart.length > 0 && (
        <motion.div 
          initial={{ opacity: 1, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.4, 
            ease: 'easeOut',
            delay: 0.2 
          }}
          className="p-4 sm:p-5 border-t border-[#8a4fff]/10 bg-[#2c1b4a]/30 backdrop-blur-sm"
        >
          <div className="flex justify-between mb-4">
            <span className="text-xs sm:text-sm text-gray-300 uppercase tracking-wider">Total</span>
            <span className="text-base sm:text-lg font-semibold text-[#8a4fff]">€{getTotalPrice().toFixed(2)}</span>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleProceedToCheckout}
            className="w-full bg-gradient-to-r from-[#8a4fff] to-[#5e3c9b] text-white py-2.5 sm:py-3 rounded-lg 
              flex items-center justify-center text-sm sm:text-base font-semibold
              hover:opacity-90 transition-opacity"
          >
            Proceed to Checkout
          </motion.button>
        </motion.div>
      )}
    </motion.div>
  )
}

export default CartDropdown
