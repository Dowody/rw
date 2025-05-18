import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  User, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight,
  AlertTriangle,
  Info,
  AtSign
} from 'lucide-react'
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { generatePasswordResetUrl } from '../lib/passwordReset'

type AuthMode = 'signin' | 'signup' | 'reset' | 'forgot-password'

const SignInPage: React.FC = () => {
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [mode, setMode] = useState<AuthMode>('signin')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [hideOnRlsError, setHideOnRlsError] = useState(false)
  const [isResetLinkSent, setIsResetLinkSent] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()

  // Handle referral code from URL
  useEffect(() => {
    const referralCode = searchParams.get('ref')
    if (referralCode) {
      // Set mode to signup if there's a referral code
      setMode('signup')
      // Store the referral code in state or context if needed
      localStorage.setItem('referralCode', referralCode)
    }
  }, [searchParams])

  // Redirect if already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      // If authenticated, redirect to home or previous page
      if (session) {
        const state = location.state as { from?: string }
        const destinationPath = state?.from || '/rw/dashboard'
        navigate(destinationPath, { replace: true })
      }
    }
    checkAuth()
  }, [navigate, location])

  // Handle redirect messages and mode changes
  useEffect(() => {
    const state = location.state as { from?: string, message?: string, mode?: AuthMode }
    
    // Show welcome message every time the page is opened
    if (state?.message) { 
      setError(state.message)
      
      // Clear welcome/account creation messages after 5 seconds
      if (state.message.includes('Log In or Sign Up')) {
        const timer = setTimeout(() => {
          setError(null)
        }, 5000)
        
        return () => clearTimeout(timer)
      }
    } else {
      // If no message in state, show default welcome message
      setError('Log In or Sign Up to use RollWithdraw.')
      const timer = setTimeout(() => {
        setError(null)
      }, 5000)
      
      return () => clearTimeout(timer)
    }

    // Set mode from navigation state if provided
    if (state?.mode) {
      setMode(state.mode)
    }
  }, [location])

  // Email validation
  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  // Username validation
  const validateUsername = (username: string) => {
    // 3-16 characters, alphanumeric and underscores
    const re = /^[a-zA-Z0-9_]{3,16}$/
    return re.test(username)
  }

  // Password validation
  const validatePassword = (password: string) => {
    // At least 8 characters, one uppercase, one lowercase, one number
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/
    return re.test(password)
  }

  // Forgot Password Handler
  const handleForgotPassword = async () => {
    // Validate email
    if (!validateEmail(email)) {
      setError('Please enter a valid email address')
      return
    }

    setLoading(true)
    try {
      const result = await generatePasswordResetUrl(email)
      
      if (result.success) {
        setError('Password reset link sent to your email')
        setMode('signin')
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError('Failed to send reset link. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Sign In Handler
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        setError(error.message)
        return
      }

      // Redirect to dashboard or home page after successful sign in
      navigate('/rw/dashboard')
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  // Sign Up Handler
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    // Validate inputs
    if (!validateEmail(email)) {
      setError('Please enter a valid email address')
      setLoading(false)
      return
    }

    if (!validateUsername(username)) {
      setError('Username must be 3-16 characters and contain only letters, numbers, and underscores')
      setLoading(false)
      return
    }

    if (!validatePassword(password)) {
      setError('Password must be at least 8 characters and contain uppercase, lowercase, and numbers')
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    try {
      // Get referral code from localStorage
      const referralCode = localStorage.getItem('referralCode')
      console.log('Referral code from localStorage:', referralCode)
      let referrerId = null

      // If there's a referral code, verify it first
      if (referralCode) {
        console.log('Verifying referral code:', referralCode)
        const { data: referrerData, error: referrerError } = await supabase
          .from('users')
          .select('id')
          .eq('referral_code', referralCode)
          .maybeSingle()

        if (referrerError) {
          console.error('Referral code verification error:', referrerError)
        } else if (referrerData) {
          referrerId = referrerData.id
          console.log('Found referrer ID:', referrerId)
        } else {
          console.log('No user found with referral code:', referralCode)
        }
      }

      // First create the auth user
      console.log('Creating auth user...')
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/rw/dashboard`
        }
      })

      if (authError) {
        console.error('Auth user creation error:', authError)
        if (authError.message.includes('User already registered')) {
          setError('An account with this email already exists. Please sign in instead.')
          setMode('signin')
        } else {
        throw authError
        }
        return
      }

      if (authData.user) {
        console.log('Auth user created:', authData.user.id)
        
        // Then create the user record
        console.log('Creating user record...')
        const { data: userData, error: userError } = await supabase
          .from('users')
          .insert({
            auth_id: authData.user.id,
            email: email,
            username: username,
            created_at: new Date().toISOString(),
            last_login: new Date().toISOString(),
            status: 'active',
            referred_by: referralCode || null,
            referral_count: 0,
            total_referral_earnings: 0.00,
            subscription_end_date: null
          })
          .select()
          .single()

        if (userError) {
          console.error('User record creation error:', userError)
          // If user creation fails, delete the auth user
          await supabase.auth.admin.deleteUser(authData.user.id)
          if (userError.code === '23505') {
            setError('An account with this email already exists. Please sign in instead.')
            setMode('signin')
          } else {
          throw userError
          }
          return
        }

        console.log('User record created:', userData)

        // If we have a valid referrer ID, create the referral record
        if (referrerId && userData) {
          console.log('Creating referral record...', {
            referrerId,
            referredId: authData.user.id
          })
          
          const { data: referralData, error: referralError } = await supabase
            .from('referrals')
            .insert({
              referrer_id: referrerId,
              referred_id: authData.user.id,
              status: 'Signed Up',
              reward_amount: '7 days'
            })
            .select()
            .single()

          if (referralError) {
            console.error('Referral creation error:', referralError)
          } else {
            console.log('Referral created successfully:', referralData)
          }
        } else {
          console.log('Skipping referral creation:', {
            hasReferrerId: !!referrerId,
            hasUserData: !!userData
          })
        }

        // Clear the stored referral code
        localStorage.removeItem('referralCode')
        
        // Show success message
        setError('Account created successfully! Please check your email to verify your account.')
        setMode('signin')
      }
    } catch (error: any) {
      console.error('Signup error:', error)
      if (error.code === '23505') {
        setError('An account with this email already exists. Please sign in instead.')
        setMode('signin')
      } else {
      setError(error.message || 'An error occurred during signup')
      }
    } finally {
      setLoading(false)
    }
  }

  // Reset Password Handler
  const handleResetPassword = async () => {
    if (!email) {
      setError('Please enter your email address')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const result = await generatePasswordResetUrl(email)
      
      if (result.success) {
        setIsResetLinkSent(true)
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError('Failed to send reset link')
    } finally {
      setLoading(false)
    }
  }

  // Main Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Email validation
    if (!validateEmail(email)) {
      setError('Please enter a valid email address')
      return
    }

    // Mode-specific handling
    switch(mode) {
      case 'signin':
        await handleSignIn(e)
        break
      case 'signup':
        await handleSignUp(e)
        break
      case 'forgot-password':
        await handleForgotPassword()
        break
    }
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
                className={`absolute ${mode === 'signup' ? '-top-[90px] sm:-top-[120px]' : '-top-[80px] sm:-top-30'} left-0 right-0 p-3 sm:p-4 rounded-xl flex items-center justify-center ${
                  error.includes('Log In or Sign Up')
                    ? 'bg-purple-500/10 border border-purple-500 text-purple-400'
                    : error.includes('Account created successfully')
                    ? 'bg-green-500/10 border border-green-500 text-green-400'
                    : 'bg-red-500/10 border border-red-500 text-red-400'
                }`}
              >
                <Info className="mr-2 sm:mr-3 w-5 h-5 sm:w-6 sm:h-6" />
                <span className="text-[14px] sm:text-base text-center">{error}</span>
              </motion.div>
            )}
            {isResetLinkSent && (
              <motion.div 
                initial={{ opacity: 1, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 1, y: -20 }}
                className="absolute -top-[80px] sm:-top-20 left-0 right-0 p-3 sm:p-4 rounded-xl flex items-center justify-center bg-green-500/10 border border-green-500 text-green-400"
              >
                <Info className="mr-2 sm:mr-3 w-5 h-5 sm:w-6 sm:h-6" />
                <span className="text-[14px] sm:text-base text-center">
                  Password reset link has been sent to your email
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="bg-gradient-to-br from-[#1a0b2e] to-[#130428] rounded-2xl shadow-2xl overflow-hidden">
            {/* Header Tabs */}
            <motion.div 
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="flex border-b border-[#8a4fff]/10"
            >
              {['signin', 'signup', 'forgot-password'].map((authMode) => (
                <motion.button
                  key={authMode}
                  onClick={() => {
                    setMode(authMode as AuthMode)
                    setError(null)
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`
                    flex-1 py-3 sm:py-4 text-[16px] sm:text-lg font-semibold transition-all duration-300
                    ${mode === authMode 
                      ? 'bg-[#8a4fff]/10 text-[#8a4fff]' 
                      : 'text-gray-400 hover:bg-[#8a4fff]/5'}
                  `}
                >
                  {authMode === 'signin' ? 'Sign In' : 
                   authMode === 'signup' ? 'Sign Up' : 
                   'Reset'}
                </motion.button>
              ))}
            </motion.div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-4 sm:space-y-6 ">
              {/* Conditional Rendering Based on Mode */}
              {mode !== 'forgot-password' && (
                <>
                  {/* Email Input */}
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8a4fff] opacity-70 w-4 h-4 sm:w-5 sm:h-5 " />
                    <input 
                      type="email" 
                      placeholder="Email Address" 
                      required
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value)
                        setError(null)
                        setIsResetLinkSent(false)
                      }}
                      className="w-full pl-10 sm:pl-10 pr-4 py-2.5 sm:py-3 rounded-lg bg-[#2c1b4a] border border-[#8a4fff]/20 text-white text-[14px] sm:text-base
                        focus:outline-none focus:border-[#8a4fff] transition-all duration-300"
                    />
                  </div>

                  {/* Username Input for Signup */}
                  {mode === 'signup' && (
                    <div className="relative">
                      <AtSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8a4fff] opacity-70 w-4 h-4 sm:w-5 sm:h-5" />
                      <input 
                        type="text" 
                        placeholder="Username" 
                        required
                        value={username}
                        onChange={(e) => {
                          setUsername(e.target.value)
                          setError(null)
                        }}
                        className="w-full pl-10 sm:pl-10 pr-4 py-2.5 sm:py-3 rounded-lg bg-[#2c1b4a] border border-[#8a4fff]/20 text-white text-[14px] sm:text-base
                          focus:outline-none focus:border-[#8a4fff] transition-all duration-300"
                      />
                    </div>
                  )}

                  {/* Password Input */}
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8a4fff] opacity-70 w-4 h-4 sm:w-5 sm:h-5" />
                    <input 
                      type={showPassword ? "text" : "password"} 
                      placeholder="Password" 
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

                  {/* Confirm Password for Signup */}
                  {mode === 'signup' && (
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8a4fff] opacity-70 w-4 h-4 sm:w-5 sm:h-5" />
                      <input 
                        type={showPassword ? "text" : "password"} 
                        placeholder="Confirm Password" 
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
                  )}
                </>
              )}

              {/* Forgot Password Mode */}
              {mode === 'forgot-password' && (
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8a4fff] opacity-70 w-4 h-4 sm:w-5 sm:h-5" />
                  <input 
                    type="email" 
                    placeholder="Enter your email" 
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      setError(null)
                    }}
                    className="w-full pl-10 sm:pl-10 pr-4 py-2.5 sm:py-3 rounded-lg bg-[#2c1b4a] border border-[#8a4fff]/20 text-white text-[14px] sm:text-base
                      focus:outline-none focus:border-[#8a4fff] transition-all duration-300"
                  />
                </div>
              )}

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
                {loading ? 'Processing...' : 
                 mode === 'signin' ? 'Sign In' : 
                 mode === 'signup' ? 'Create Account' : 
                 'Send Reset Link'}
                {!loading && <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />}
              </motion.button>

              {/* Forgot Password Link */}
              {mode === 'signin' && (
                <div className="text-center">
                  <motion.button
                    type="button"
                    onClick={handleResetPassword}
                    disabled={loading}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="text-[#8a4fff] text-[13px] sm:text-sm hover:underline"
                  >
                    Forgot Password?
                  </motion.button>
                </div>
              )}
            </form>

            {/* Mode Switch */}
            <motion.div 
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-[#2c1b4a] border-t border-[#8a4fff]/10 p-4 sm:p-4 text-center"
            >
              {mode === 'signin' && (
                <p className="text-gray-400 text-[14px] sm:text-base">
                  Don't have an account?{' '}
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setMode('signup')}
                    className="text-[#8a4fff] hover:underline"
                  >
                    Sign Up
                  </motion.button>
                </p>
              )}
              {mode === 'signup' && (
                <p className="text-gray-400 text-[14px] sm:text-base">
                  Already have an account?{' '}
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setMode('signin')}
                    className="text-[#8a4fff] hover:underline"
                  >
                    Sign In
                  </motion.button>
                </p>
              )}
              {mode === 'forgot-password' && (
                <p className="text-gray-400 text-[13px] sm:text-base">
                  Remember your password?{' '}
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setMode('signin')}
                    className="text-[#8a4fff] hover:underline"
                  >
                    Sign In
                  </motion.button>
                </p>
              )}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default SignInPage
