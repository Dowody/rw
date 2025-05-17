import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { 
  User, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight,
  AlertTriangle,
  Info,
  AtSign,
  Shield
} from 'lucide-react'

const AdminSignIn: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  // Redirect if already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      // If authenticated, redirect to admin dashboard
      if (session) {
        navigate('/admin/dashboard', { replace: true })
      }
    }
    checkAuth()
  }, [navigate])

  // Handle redirect messages
  useEffect(() => {
    const state = location.state as { message?: string }
    
    if (state?.message) {
      setError(state.message)
      
      // Clear message after 5 seconds
      const timer = setTimeout(() => {
        setError(null)
      }, 5000)
      
      return () => clearTimeout(timer)
    }
  }, [location])

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // First authenticate with Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) throw authError

      // Then verify if the user is an admin
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('is_admin')
        .eq('auth_id', authData.user.id)
        .single()

      if (userError) throw userError

      if (!userData?.is_admin) {
        throw new Error('Unauthorized access')
      }

      // If everything is successful, redirect to admin dashboard
      navigate('/admin/dashboard')
    } catch (err: any) {
      setError(err.message || 'Failed to sign in')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#04011C]">
      {/* Background Image */}
      <div className="absolute inset-0 h-[100vh]">
        <div style={{ 
          backgroundImage: 'url(https://mir-s3-cdn-cf.behance.net/project_modules/max_3840_webp/b95e8765126337.60af5cc76e5df.jpg)', 
          backgroundSize: 'cover', 
          backgroundPosition: 'center', 
          width: '100%', 
          height: '100vh', 
          opacity: 1, 
          filter: 'blur(8px)', 
          transform: 'scale(1.1)', 
        }} />
        {/* Black Overlay */}
        <div style={{ 
          backgroundColor: 'rgba(0, 0, 0, 0.6)', 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          width: '100%', 
          height: '100vh', 
        }} />
      </div>
      
      {/* Content */}
      <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-[95%] sm:max-w-md"
        >
          <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 sm:p-8 border border-white/10">
            <div className="text-center mb-6 sm:mb-8">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h1 className="text-xl sm:text-2xl font-medium text-white">Admin Portal</h1>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-4 sm:mb-6 bg-red-500/10 border border-red-500/30 text-red-400 p-3 sm:p-4 rounded-xl flex items-center"
                >
                  <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 flex-shrink-0" />
                  <span className="text-sm">{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSignIn} className="space-y-3 sm:space-y-4">
              <div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-white/50" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 sm:pl-10 p-2.5 sm:p-3 bg-white/5 rounded-xl text-white border border-white/10 
                    focus:border-white/20 focus:bg-white/10 transition-all duration-200
                    placeholder-white/30 text-sm sm:text-base"
                    placeholder="Email"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-white/50" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 sm:pl-10 p-2.5 sm:p-3 bg-white/5 rounded-xl text-white border border-white/10 
                    focus:border-white/20 focus:bg-white/10 transition-all duration-200
                    placeholder-white/30 text-sm sm:text-base"
                    placeholder="Password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white 
                    transition-colors p-1"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                    ) : (
                      <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                    )}
                  </button>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className={`w-full bg-white text-black py-2.5 sm:py-3 rounded-xl font-medium 
                transition-all duration-300 flex items-center justify-center gap-2 text-sm sm:text-base
                ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/90'}`}
              >
                {loading ? (
                  <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                  </>
                )}
              </motion.button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default AdminSignIn 