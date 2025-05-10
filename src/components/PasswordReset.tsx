import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight,
  AlertTriangle,
  Info,
  CheckCircle
} from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { verifyPasswordResetToken } from '../lib/passwordReset'

const PasswordResetPage: React.FC = () => {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [isResetComplete, setIsResetComplete] = useState(false)
  const [isTokenValid, setIsTokenValid] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    // Extract token from URL
    const urlParams = new URLSearchParams(window.location.search)
    const token = urlParams.get('token')

    if (!token) {
      setError('Invalid or missing reset token')
      return
    }

    // Verify token with Supabase
    const verifyToken = async () => {
      const result = await verifyPasswordResetToken(token)
      if (!result.isValid) {
        setError(result.error || 'Invalid or expired reset token')
        return
      }
      setIsTokenValid(true)
    }

    verifyToken()
  }, [])

  useEffect(() => {
    // Check if there's a password reset token in the URL
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        // User is in password recovery mode
        console.log('Password recovery mode activated')
      }
    })

    return () => {
      data.subscription.unsubscribe()
    }
  }, [])

  // Password validation
  const validatePassword = (password: string) => {
    // At least 8 characters, one uppercase, one lowercase, one number
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/
    return re.test(password)
  }

  // Button Hover and Tap Animation
  const buttonAnimation = {
    whileHover: { 
      scale: 1.05,
      transition: { 
        type: 'spring', 
        stiffness: 300 
      }
    },
    whileTap: { 
      scale: 0.95 
    }
  }

  // Page Transition Variants
  const pageVariants = {
    initial: { 
      opacity: 1, 
      scale: 0.95 
    },
    in: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: 0.3,
        ease: 'easeOut'
      }
    },
    out: { 
      opacity: 1, 
      scale: 0.95,
      transition: {
        duration: 0.2,
        ease: 'easeIn'
      }
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validate password
    if (!validatePassword(password)) {
      setError('Password must be at least 8 characters with uppercase, lowercase, and number')
      return
    }

    // Check password match
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      // Update password
      const { error } = await supabase.auth.updateUser({ password })

      if (error) {
        setError(error.message || 'Failed to reset password')
        return
      }

      // Reset successful
      setIsResetComplete(true)
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleBackToSignIn = () => {
    navigate('/signin')
  }

  // If reset is complete, show success screen
  if (isResetComplete) {
    return (
      <div className="min-h-screen relative h-[100vh] overflow-hidden">
        <div className="absolute inset-0 h-[100vh]">
          <div
            style={{
              backgroundImage: 'url(/rw/hero_bg.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              width: '100%',
              height: '100vh',
              opacity: 1,
              filter: 'blur(8px)',
              transform: 'scale(1.1)',
            }}
          />
          
          <div
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: '100%',
              height: '100vh',
            }}
          />
        </div>
        
        <div className="relative z-10 min-h-screen w-full flex items-center justify-center px-4 py-8 sm:py-16">
          <motion.div 
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            className="w-full max-w-md relative"
          >
            <div className="bg-gradient-to-br from-[#1a0b2e] to-[#130428] rounded-2xl shadow-2xl overflow-hidden p-8 text-center">
              <CheckCircle className="w-24 h-24 mx-auto text-green-500 mb-6" />
              <h2 className="text-2xl font-bold text-[#8a4fff] mb-4">
                Password Reset Successful
              </h2>
              <p className="text-gray-300 mb-6">
                Your password has been successfully reset. You can now sign in with your new password.
              </p>
              
              <motion.button
                {...buttonAnimation}
                onClick={handleBackToSignIn}
                className="w-full bg-gradient-to-r from-[#8a4fff] to-[#5e3c9b] 
                  text-white py-3 rounded-lg 
                  flex items-center justify-center
                  hover:opacity-90 transition-opacity"
              >
                Back to Sign In
                <ArrowRight className="ml-2 w-5 h-5" />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative h-[100vh] overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 h-[100vh]">
        <div
          style={{
            backgroundImage: 'url(/rw/hero_bg.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            width: '100%',
            height: '100vh',
            opacity: 1,
            filter: 'blur(8px)',
            transform: 'scale(1.1)',
          }}
        />
        
        {/* Black Overlay */}
        <div
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100%',
            height: '100vh',
          }}
        />
      </div>
      
      <div className="relative z-10 min-h-screen w-full flex items-center justify-center px-4 py-8 sm:py-16">
        <motion.div 
          initial="initial"
          animate="in"
          exit="out"
          variants={pageVariants}
          className="w-full max-w-md relative"
        >
          {/* Message Container */}
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 1, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 1, y: -20 }}
                className="absolute -top-[80px] sm:-top-20 left-0 right-0 p-3 sm:p-4 rounded-xl flex items-center justify-center bg-red-500/10 border border-red-500 text-red-400"
              >
                <AlertTriangle className="mr-2 sm:mr-3 w-5 h-5 sm:w-6 sm:h-6" />
                <span className="text-[14px] sm:text-base text-center">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="bg-gradient-to-br from-[#1a0b2e] to-[#130428] rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-[#8a4fff]/10">
              <h1 className="text-xl font-semibold text-[#8a4fff] text-center">
                Reset Password
              </h1>
            </div>

            {!isTokenValid ? (
              <div className="p-6 sm:p-8 text-center">
                <div className="bg-[#8a4fff]/10 rounded-full p-4 w-16 h-16 mx-auto mb-4">
                  <AlertTriangle className="w-8 h-8 text-[#8a4fff] mx-auto" />
                </div>
                <p className="text-gray-300 mb-4">Please wait while we verify your reset token...</p>
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#8a4fff] mx-auto"></div>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="p-6 sm:p-8 space-y-4 sm:space-y-6">
                {/* New Password Input */}
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8a4fff] opacity-70 w-4 h-4 sm:w-5 sm:h-5" />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="New Password" 
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      setError(null)
                    }}
                    className="w-full pl-10 sm:pl-10 pr-10 py-2.5 sm:py-3 rounded-lg bg-[#2c1b4a] border border-[#8a4fff]/20 text-white text-[14px] sm:text-base
                      focus:outline-none focus:border-[#8a4fff] transition-all duration-300"
                  />
                  <motion.button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 1.2 }}
                    className="absolute right-3 lg:bottom-4 bottom-3 text-[#8a4fff] opacity-70"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                  </motion.button>
                </div>

                {/* Confirm New Password Input */}
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8a4fff] opacity-70 w-4 h-4 sm:w-5 sm:h-5" />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Confirm New Password" 
                    required
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value)
                      setError(null)
                    }}
                    className="w-full pl-10 sm:pl-10 pr-10 py-2.5 sm:py-3 rounded-lg bg-[#2c1b4a] border border-[#8a4fff]/20 text-white text-[14px] sm:text-base
                      focus:outline-none focus:border-[#8a4fff] transition-all duration-300"
                  />
                  <motion.button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 1.2 }}
                    className="absolute right-3 lg:bottom-4 bottom-3 text-[#8a4fff] opacity-70"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                  </motion.button>
                </div>

                {/* Submit Button */}
                <motion.button
                  {...buttonAnimation}
                  type="submit"
                  disabled={loading}
                  className={`
                    w-full bg-gradient-to-r from-[#8a4fff] to-[#5e3c9b] 
                    text-white py-2.5 sm:py-3 rounded-lg text-[14px] sm:text-base
                    flex items-center justify-center
                    hover:opacity-90 transition-opacity
                    ${loading ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  {loading ? 'Processing...' : 'Reset Password'}
                  {!loading && <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />}
                </motion.button>
              </form>
            )}

            {/* Navigation */}
            <div className="bg-[#2c1b4a] border-t border-[#8a4fff]/10 p-4 sm:p-4 text-center">
              <p className="text-gray-400 text-[13px] sm:text-base">
                Remember your password?{' '}
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/signin')}
                  className="text-[#8a4fff] hover:underline"
                >
                  Sign In
                </motion.button>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default PasswordResetPage
