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
      opacity: 0, 
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
      opacity: 0, 
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
    },
    exit: { 
      opacity: 0, 
      x: 10,
      scale: 0.98,
      transition: {
        type: 'tween',
        duration: 0.2,
        ease: 'easeIn'
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
      className="fixed top-24 right-10 lg:right-[530px] w-[26rem] bg-[#1a0b2e] rounded-2xl shadow-2xl z-50 border border-[#8a4fff]/10 overflow-hidden"
    >
      {/* Elegant Header */}
      <div className="flex justify-between items-center p-5 border-b border-[#8a4fff]/10">
        <div className="flex items-center space-x-3">
          <ShoppingCart className="w-7 h-7 text-[#8a4fff] opacity-80" />
          <h3 className="text-xl font-semibold text-[#8a4fff]">Your Cart</h3>
        </div>
        <motion.button 
          whileHover={{ rotate: 90, scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onClose}
          className="text-gray-300 hover:text-[#8a4fff] transition-colors"
        >
          <X className="w-6 h-6" />
        </motion.button>
      </div>

      {/* Empty Cart State */}
      {cart.length === 0 && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="p-8 text-center"
        >
          <ShoppingCart className="w-20 h-20 mx-auto text-[#8a4fff] mb-4 opacity-30" />
          <p className="text-gray-400 text-lg">Your cart is empty</p>
        </motion.div>
      )}

      {/* Cart Items */}
      <AnimatePresence>
        {cart.length > 0 && (
          <motion.div 
            initial="hidden"
            animate="visible"
            exit="exit"
            className="max-h-64 overflow-y-auto custom-scrollbar"
          >
            {cart.map((item) => (
              <motion.div 
                key={item.id}
                variants={itemVariants}
                className="flex items-center justify-between p-4 border-b border-[#8a4fff]/5 
                  hover:bg-[#2c1b4a]/30 transition-colors duration-300 group"
              >
                <div className="flex-grow">
                  <h4 className="text-base font-semibold text-[#8a4fff] group-hover:text-white transition-colors">
                    {item.name}
                  </h4>
                  <p className="text-sm text-gray-300 group-hover:text-gray-200 transition-colors">
                    €{item.price.toFixed(2)}
                  </p>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="flex items-center bg-[#2c1b4a] rounded-full border border-[#8a4fff]/10">
                    <motion.button 
                      whileTap={{ scale: 0.9 }}
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-2 text-gray-300 hover:text-[#8a4fff]"
                    >
                      <Minus className="w-4 h-4" />
                    </motion.button>
                    <span className="px-3 text-white font-semibold">{item.quantity}</span>
                    <motion.button 
                      whileTap={{ scale: 0.9 }}
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-2 text-gray-300 hover:text-[#8a4fff]"
                    >
                      <Plus className="w-4 h-4" />
                    </motion.button>
                  </div>
                  
                  <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
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
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.4, 
            ease: 'easeOut',
            delay: 0.2 
          }}
          className="p-5 border-t border-[#8a4fff]/10 bg-[#2c1b4a]/30 backdrop-blur-sm"
        >
          <div className="flex justify-between mb-4">
            <span className="text-gray-300 text-sm uppercase tracking-wider">Total</span>
            <span className="text-xl font-bold text-[#8a4fff]">
              €{getTotalPrice().toFixed(2)}
            </span>
          </div>
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <button 
              onClick={handleProceedToCheckout}
              className="w-full bg-gradient-to-r from-[#8a4fff] to-[#5e3c9b] 
                text-white py-3 rounded-lg 
                flex items-center justify-center space-x-2
                hover:opacity-90 transition-opacity"
            >
              <ShoppingCart className="w-5 h-5" />
              <span>Proceed to Checkout</span>
            </button>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  )
}

export default CartDropdown
