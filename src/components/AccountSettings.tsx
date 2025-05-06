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
  // User Profile State
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  // Password Change State
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)

  // Currency Preference
  const [currency, setCurrency] = useState('EUR')

  // Feedback & Status
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Currency Options
  const currencyOptions = [
    { code: 'EUR', name: 'Euro (€)', symbol: '€' },
    { code: 'USD', name: 'US Dollar ($)', symbol: '$' },
    { code: 'GBP', name: 'British Pound (£)', symbol: '£' },
    { code: 'RUB', name: 'Russian Ruble (₽)', symbol: '₽' },
    { code: 'BTC', name: 'Bitcoin (₿)', symbol: '₿' }
  ]

  // Load Initial User Data
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          setError('User not authenticated')
          return
        }

        // Fetch additional user details
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select(`
            username, 
            email, 
            avatar_url,
            preferred_currency
          `)
          .eq('auth_id', user.id)
          .single()

        if (userError) {
          setError('Failed to load user profile')
          return
        }

        setUsername(userData.username)
        setEmail(userData.email)
        setAvatarPreview(userData.avatar_url)
        setCurrency(userData.preferred_currency || 'EUR')

        setLoading(false)
      } catch (err) {
        console.error('Profile fetch error:', err)
        setError('An unexpected error occurred')
        setLoading(false)
      }
    }

    fetchUserProfile()
  }, [])
// Avatar Upload Handler
const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file size and type
      const maxSize = 5 * 1024 * 1024 // 5MB
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif']
  
      if (!allowedTypes.includes(file.type)) {
        setError('Invalid file type. Please upload JPEG, PNG, or GIF.')
        return
      }
  
      if (file.size > maxSize) {
        setError('File is too large. Maximum size is 5MB.')
        return
      }
  
      // Preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
      setAvatarFile(file)
    }
  }
  
  // Profile Update Handler
  const handleProfileUpdate = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)
  
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setError('User not authenticated')
        return
      }
  
      // Avatar Upload
      let avatarUrl = null
      if (avatarFile) {
        try {
          const fileExt = avatarFile.name.split('.').pop()
          const fileName = `${user.id}_${Date.now()}.${fileExt}`
          const filePath = `avatars/${fileName}`
  
          // Compress image before upload (optional, but recommended)
          const compressedFile = await compressImage(avatarFile)
  
          // Upload to Supabase storage with explicit content type
          const { data, error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, compressedFile, {
              cacheControl: '3600',
              upsert: true,
              contentType: compressedFile.type
            })
  
          if (uploadError) {
            console.error('Avatar upload error:', uploadError)
            setError(`Avatar upload failed: ${uploadError.message}`)
            return
          }
  
          // Construct public URL
          const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath)
  
          avatarUrl = publicUrl
        } catch (uploadErr) {
          console.error('Avatar upload process error:', uploadErr)
          setError('Failed to process avatar upload')
          return
        }
      }
  
      // Update user profile
      const { error: updateError } = await supabase
        .from('users')
        .update({
          username: username,
          avatar_url: avatarUrl || undefined,
          preferred_currency: currency
        })
        .eq('auth_id', user.id)
  
      if (updateError) {
        console.error('Profile update error:', updateError)
        setError('Profile update failed')
        return
      }
  
      setSuccess('Profile updated successfully')
    } catch (err) {
      console.error('Unexpected profile update error:', err)
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }
  
  // Image Compression Utility
  const compressImage = async (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = (event) => {
        const img = new Image()
        img.src = event.target?.result as string
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          
          // Resize
          const MAX_WIDTH = 800
          const MAX_HEIGHT = 800
          let width = img.width
          let height = img.height
  
          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width
              width = MAX_WIDTH
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height
              height = MAX_HEIGHT
            }
          }
  
          canvas.width = width
          canvas.height = height
  
          // Draw compressed image
          ctx?.drawImage(img, 0, 0, width, height)
  
          // Convert to blob
          canvas.toBlob((blob) => {
            if (!blob) {
              reject(new Error('Compression failed'))
              return
            }
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            })
            resolve(compressedFile)
          }, file.type, 0.7) // 0.7 compression quality
        }
        img.onerror = (error) => reject(error)
      }
      reader.onerror = (error) => reject(error)
    })
  }
  
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
        return
      }

      // Update password
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) {
        setError(error.message)
        return
      }

      setSuccess('Password updated successfully')
      // Reset password fields
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      console.error('Password change error:', err)
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  // Render Loading State
  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-[#8a4fff]"></div>
      </div>
    )
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      {/* Error/Success Notifications */}
      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-400 p-4 rounded-xl flex items-center">
          <AlertTriangle className="mr-3 w-6 h-6" />
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-500/10 border border-green-500 text-green-400 p-4 rounded-xl flex items-center">
          <CheckCircle className="mr-3 w-6 h-6" />
          {success}
        </div>
      )}

      {/* Profile Section */}
      <div className="bg-gradient-to-br from-[#210746] to-[#2C095D] rounded-3xl p-8 border border-[#8a4fff]/10">
        <h3 className="text-xl font-semibold text-[#8a4fff] mb-6 flex items-center">
          <User className="mr-3 w-6 h-6" /> Profile Settings
        </h3>
        
        {/* Avatar Upload */}
        <div className="flex items-center mb-6">
          <div className="mr-6">
            <img 
              src={avatarPreview || '/default-avatar.png'} 
              alt="Profile Avatar" 
              className="w-24 h-24 rounded-full border-4 border-[#8a4fff] object-cover"
            />
          </div>
          <div>
            <input 
              type="file" 
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden" 
              id="avatar-upload"
            />
            <label 
              htmlFor="avatar-upload" 
              className="bg-[#8a4fff]/10 text-[#8a4fff] px-4 py-2 rounded-lg 
              hover:bg-[#8a4fff]/20 transition-colors flex items-center cursor-pointer"
            >
              <Upload className="mr-2 w-5 h-5" /> Upload Avatar
            </label>
          </div>
        </div>

        {/* Username and Currency Input */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Username</label>
            <input 
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 bg-[#2c1b4a] rounded-xl text-white 
              border border-[#8a4fff]/20 focus:border-[#8a4fff] 
              transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Preferred Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full p-3 bg-[#2c1b4a] rounded-xl text-white 
              border border-[#8a4fff]/20 focus:border-[#8a4fff] 
              transition-colors"
            >
              {currencyOptions.map((curr) => (
                <option key={curr.code} value={curr.code}>
                  {curr.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Profile Update Button */}
        <div className="mt-6">
          <button 
            onClick={handleProfileUpdate}
            className="bg-[#8a4fff] text-white px-6 py-3 rounded-lg 
            hover:bg-[#7a3ddf] transition-colors"
          >
            Update Profile
          </button>
        </div>
      </div>

      {/* Password Change Section */}
      <div className="bg-gradient-to-br from-[#210746] to-[#2C095D] rounded-3xl p-8 border border-[#8a4fff]/10">
        <h3 className="text-xl font-semibold text-[#8a4fff] mb-6 flex items-center">
          <Lock className="mr-3 w-6 h-6" /> Change Password
        </h3>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div className="relative">
            <label className="block text-sm text-gray-400 mb-2">New Password</label>
            <input 
              type={showNewPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-3 bg-[#2c1b4a] rounded-xl text-white 
              border border-[#8a4fff]/20 focus:border-[#8a4fff] 
              transition-colors pr-10"
            />
            <button 
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-11 text-gray-400"
            >
              {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          <div className="relative">
            <label className="block text-sm text-gray-400 mb-2">Confirm New Password</label>
            <input 
              type={showNewPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-3 bg-[#2c1b4a] rounded-xl text-white 
              border border-[#8a4fff]/20 focus:border-[#8a4fff] 
              transition-colors pr-10"
            />
            <button 
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-11 text-gray-400"
            >
              {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Password Change Button */}
        <div className="mt-6">
          <button 
            onClick={handlePasswordChange}
            className="bg-[#8a4fff] text-white px-6 py-3 rounded-lg 
            hover:bg-[#7a3ddf] transition-colors"
          >
            Change Password
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default AccountSettings
