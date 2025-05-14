import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Settings, 
  User, 
  Lock, 
  Upload, 
  Eye, 
  EyeOff,
  AlertTriangle,
  CheckCircle,
  DollarSign
} from 'lucide-react'
import { supabase } from '../lib/supabaseClient'

const AccountSettings: React.FC = () => {
  // Password Change State
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)

  // Feedback & Status
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Password Change Handler
  const handlePasswordChange = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)

    // Validate password
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match')
      setLoading(false)
      return
    }

    try {
      // Reauthenticate user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('User not authenticated')
        setLoading(false)
        return
      }
      // Update password
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }
      setSuccess('Password updated successfully')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-[#8a4fff]"></div>
      </div>
    )
  }

  return (
    <motion.div 
      initial={{ opacity: 1, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      {/* Error/Success Notifications */}
      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-400 p-3 sm:p-4 rounded-xl flex items-center text-xs sm:text-sm">
          <AlertTriangle className="mr-2 sm:mr-3 w-4 h-4 sm:w-6 sm:h-6" />
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-500/10 border border-green-500 text-green-400 p-3 sm:p-4 rounded-xl flex items-center text-xs sm:text-sm">
          <CheckCircle className="mr-2 sm:mr-3 w-4 h-4 sm:w-6 sm:h-6" />
          {success}
        </div>
      )}
      {/* Password Change Section */}
      <div className="bg-gradient-to-br from-[#210746] to-[#2C095D] rounded-3xl p-4 sm:p-8 border border-[#8a4fff]/10">
        <h3 className="text-2xl sm:text-xl font-semibold text-[#8a4fff] mb-4 sm:mb-6 flex items-center">
          <Lock className="mr-2 sm:mr-3 w-5 h-5 sm:w-6 sm:h-6" /> Change Password
        </h3>
        <div className="grid md:grid-cols-2 gap-3 sm:gap-4 py-2">
          <div className="relative">
            <label className="block text-sm sm:text-sm text-gray-400 mb-1 sm:mb-2">New Password</label>
            <input 
              type={showNewPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-2 sm:p-3 bg-[#2c1b4a] rounded-lg text-sm sm:text-base text-white border border-[#8a4fff]/20 focus:border-[#8a4fff] transition-colors pr-10"
            />
            <button 
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-9 sm:top-11 text-gray-400"
            >
              {showNewPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>
          </div>
          <div className="relative">
            <label className="block text-sm sm:text-sm text-gray-400 mb-1 sm:mb-2">Confirm New Password</label>
            <input 
              type={showNewPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-2 sm:p-3 bg-[#2c1b4a] rounded-lg text-sm sm:text-base text-white border border-[#8a4fff]/20 focus:border-[#8a4fff] transition-colors pr-10"
            />
            <button 
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-9 sm:top-11 text-gray-400"
            >
              {showNewPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>
          </div>
        </div>
        <div className="mt-4 sm:mt-6">
          <button 
            onClick={handlePasswordChange}
            className="my-1 bg-[#8a4fff] text-white w-full sm:px-6 py-3 sm:py-3 rounded-lg hover:bg-[#7a3ddf] transition-colors text-sm sm:text-sm"
          >
            Change Password
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default AccountSettings
