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
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

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
  const navigate = useNavigate()
  const location = useLocation()

  // Redirect if already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      // If authenticated, redirect to home or previous page
      if (session) {
        const state = location.state as { from?: string }
        const destinationPath = state?.from || '/'
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
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'https://rollwithdraw.com/reset-password'
      })

      if (error) {
        setError(error.message)
      } else {
        setError('Password reset link sent to your email')
        setMode('signin')
      }
    } catch (err) {
      setError('Failed to send reset link. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Sign In Handler
  const handleSignIn = async () => {
    // Validate email format
    if (!validateEmail(email)) {
      setError('Please enter a valid email address')
      return
    }
  
    setLoading(true)
    try {
      // Signin with comprehensive error handling
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
  
      if (error) {
        console.error('Signin Error:', {
          message: error.message,
          code: error.code,
          details: (error as any).details
        })
  
        // Provide more specific error messages
        switch (error.code) {
          case 'invalid_grant':
            setError('Invalid email or password. Please try again.')
            break
          case 'auth/user-not-found':
            setError('No account found with this email. Please sign up.')
            break
          case 'auth/wrong-password':
            setError('Incorrect password. Please try again.')
            break
          default:
            setError(error.message || 'Authentication failed. Please try again.')
        }
        return
      }
  
      // Ensure user exists
      if (data.user) {
        try {
          // Fetch user details from users table
          const { data: userData, error: userFetchError } = await supabase
            .from('users')
            .select('*')
            .eq('auth_id', data.user.id)
            .single()
  
          if (userFetchError) {
            console.error('User fetch error:', {
              message: userFetchError.message,
              code: userFetchError.code,
              details: userFetchError.details
            })
            
            // Create user profile if it doesn't exist
            if (!data.user?.email) {
              setError('Invalid user data. Please contact support.')
              return
            }
            const { error: createError } = await supabase
              .from('users')
              .insert({
                auth_id: data.user.id,
                email: data.user.email,
                username: data.user.user_metadata?.username || data.user.email.split('@')[0],
                created_at: new Date().toISOString(),
                status: 'active',
                last_login: new Date().toISOString()
              })

            if (createError) {
              console.error('Profile creation error:', createError)
              setError('Failed to create user profile. Please contact support.')
              return
            }
          }
  
          // Navigate based on previous route or default
          const state = location.state as { from?: string }
          if (state?.from) {
            navigate(state.from)
          } else {
            navigate('/dashboard')
          }
  
          // Optional: Dispatch auth change event
          window.dispatchEvent(new Event('authChange'))
        } catch (profileError) {
          console.error('Profile retrieval error:', profileError)
          setError('An unexpected error occurred. Please try again.')
        }
      } else {
        // Unexpected scenario: no user data
        setError('Authentication failed. Please try again.')
      }
    } catch (err) {
      console.error('Unexpected Signin Catch Error:', err)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Sign Up Handler
  const handleSignUp = async () => {
    // Validate inputs
    if (!validateUsername(username)) {
      setError('Username must be 3-16 characters, alphanumeric or underscores')
      return
    }

    if (!validatePassword(password)) {
      setError('Password must be at least 8 characters with uppercase, lowercase, and number')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    setLoading(true)
  try {
    // Comprehensive username check with error handling
    const { data: existingUsers, error: usernameCheckError } = await supabase
      .from('users')
      .select('username')
      .eq('username', username)
      .maybeSingle()

    if (usernameCheckError) {
      console.error('Username check error:', {
        code: usernameCheckError.code,
        message: usernameCheckError.message,
        details: usernameCheckError.details
      })
      
      // If table doesn't exist, attempt to create it
      if (usernameCheckError.code === '42P01') {
        // You might want to trigger table creation here or contact support
        setError('Database configuration error. Please contact support.')
        return
      }
      
      setError('Error checking username availability')
      return
    }

    if (existingUsers) {
      setError('Username is already taken')
      return
    }

    // Signup with Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          email_confirm: true
        },
        emailRedirectTo: `${window.location.origin}/signin`
      }
    })

    if (error) {
      console.error('Auth Signup Error:', {
        message: error.message,
        code: error.code,
        details: (error as any).details
      })
      setError(error.message || 'Failed to create account')
      return
    }

    // Ensure user exists before inserting
    if (data.user) {
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          auth_id: data.user.id,
          email: data.user.email,
          username: username,
          created_at: new Date().toISOString(),
          status: 'active'
        })

      if (insertError) {
        console.error('Detailed Insert Error:', {
          message: insertError.message,
          code: insertError.code,
          details: insertError.details
        })
        
        setError(insertError.message || 'Failed to create user profile')
        return
      }

      // Success path
      setError('Account created successfully!')
      setTimeout(() => {
        navigate('/signin', {
          state: { 
            message: 'Please open your email to confirm your account.',
            mode: 'signin'
          }
        })
      }, 2000)
    }
  } catch (err) {
    console.error('Unexpected Signup Error:', err)
    setError('An unexpected error occurred. Please try again.')
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
        await handleSignIn()
        break
      case 'signup':
        await handleSignUp()
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
      opacity: 0, 
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
      opacity: 0, 
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
            backgroundImage: 'url(/hero_bg.jpg)',
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
      
      <div className="relative z-10 min-h-screen w-full flex items-center justify-center px-4 py-16">
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
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`absolute ${mode === 'signup' ? '-top-20' : '-top-20'} left-0 right-0 p-4 rounded-xl flex items-center justify-center ${
                  error.includes('Log In or Sign Up')
                    ? 'bg-purple-500/10 border border-purple-500 text-purple-400'
                    : error.includes('Account created successfully')
                    ? 'bg-green-500/10 border border-green-500 text-green-400'
                    : 'bg-red-500/10 border border-red-500 text-red-400'
                }`}
              >
                <Info className="mr-3 w-6 h-6" />
                <span className="text-center">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="bg-gradient-to-br from-[#1a0b2e] to-[#130428] rounded-2xl shadow-2xl overflow-hidden">
            {/* Header Tabs */}
            <motion.div 
              initial={{ opacity: 0 }}
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
                    flex-1 py-4 text-lg font-semibold transition-all duration-300
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
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {/* Conditional Rendering Based on Mode */}
              {mode !== 'forgot-password' && (
                <>
                  {/* Email Input */}
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8a4fff] opacity-70" />
                    <input 
                      type="email" 
                      placeholder="Email Address" 
                      required
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value)
                        setError(null)
                      }}
                      className="w-full pl-10 pr-4 py-3 rounded-lg bg-[#2c1b4a] border border-[#8a4fff]/20 text-white 
                        focus:outline-none focus:border-[#8a4fff] transition-all duration-300"
                    />
                  </div>

                  {/* Username Input for Signup */}
                  {mode === 'signup' && (
                    <div className="relative">
                      <AtSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8a4fff] opacity-70" />
                      <input 
                        type="text" 
                        placeholder="Username" 
                        required
                        value={username}
                        onChange={(e) => {
                          setUsername(e.target.value)
                          setError(null)
                        }}
                        className="w-full pl-10 pr-4 py-3 rounded-lg bg-[#2c1b4a] border border-[#8a4fff]/20 text-white 
                          focus:outline-none focus:border-[#8a4fff] transition-all duration-300"
                      />
                    </div>
                  )}

                  {/* Password Input */}
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8a4fff] opacity-70" />
                    <input 
                      type={showPassword ? "text" : "password"} 
                      placeholder="Password" 
                      required
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value)
                        setError(null)
                      }}
                      className="w-full pl-10 pr-10 py-3 rounded-lg bg-[#2c1b4a] border border-[#8a4fff]/20 text-white 
                        focus:outline-none focus:border-[#8a4fff] transition-all duration-300"
                    />
                    <motion.button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#8a4fff] opacity-70"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </motion.button>
                  </div>

                  {/* Confirm Password for Signup */}
                  {mode === 'signup' && (
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8a4fff] opacity-70" />
                      <input 
                        type="password" 
                        placeholder="Confirm Password" 
                        required
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value)
                          setError(null)
                        }}
                        className="w-full pl-10 pr-4 py-3 rounded-lg bg-[#2c1b4a] border border-[#8a4fff]/20 text-white 
                          focus:outline-none focus:border-[#8a4fff] transition-all duration-300"
                      />
                    </div>
                  )}
                </>
              )}

              {/* Forgot Password Mode */}
              {mode === 'forgot-password' && (
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8a4fff] opacity-70" />
                  <input 
                    type="email" 
                    placeholder="Enter your email" 
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      setError(null)
                    }}
                    className="w-full pl-10 pr-4 py-3 rounded-lg bg-[#2c1b4a] border border-[#8a4fff]/20 text-white 
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
                  text-white py-3 rounded-lg 
                  flex items-center justify-center
                  hover:opacity-90 transition-opacity
                  ${loading ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                {loading ? 'Processing...' : 
                 mode === 'signin' ? 'Sign In' : 
                 mode === 'signup' ? 'Create Account' : 
                 'Send Reset Link'}
                {!loading && <ArrowRight className="ml-2 w-5 h-5" />}
              </motion.button>

              {/* Forgot Password Link */}
              {mode === 'signin' && (
                <div className="text-center">
                  <button 
                    type="button"
                    onClick={() => setMode('forgot-password')}
                    className="text-[#8a4fff] hover:underline text-sm"
                  >
                    Forgot Password?
                  </button>
                </div>
              )}
            </form>

            {/* Mode Switch */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-[#2c1b4a] border-t border-[#8a4fff]/10 p-4 text-center"
            >
              {mode === 'signin' && (
                <p className="text-gray-400">
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
                <p className="text-gray-400">
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
                <p className="text-gray-400">
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
