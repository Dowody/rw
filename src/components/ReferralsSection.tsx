import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Share2, 
  Copy, 
  CheckCircle, 
  Users, 
  Gift, 
  Clock, 
  AlertCircle,
  RefreshCw,
  ExternalLink,
  AlertTriangle,
  Info,
  X
} from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { toast } from 'react-hot-toast'
import emailjs from '@emailjs/browser'

interface ReferralStats {
  totalReferrals: number
  completedReferrals: number
  pendingReferrals: number
  totalRewards: number
  pendingRewards: number
}

interface ReferralData {
  id: string
  referral_status: 'Signed Up' | 'Redeemed' | null
  reward_amount: number
  created_at: string
  completed_at: string | null
  referred_id: string
  referred_user: {
    username: string
    email: string
  }
}

interface Referral {
  id: string
  referredUser: {
    username: string
    email: string
  }
  referral_status: 'Signed Up' | 'Redeemed' | null
  rewardAmount: number
  createdAt: Date
  completedAt?: Date
}

interface ReferralCode {
  id: string
  code: string
  isActive: boolean
  createdAt: Date
}

const ReferralsSection: React.FC = () => {
  const [stats, setStats] = useState<ReferralStats>({
    totalReferrals: 0,
    completedReferrals: 0,
    pendingReferrals: 0,
    totalRewards: 0,
    pendingRewards: 0
  })
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [referralCodes, setReferralCodes] = useState<ReferralCode[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [showAllReferrals, setShowAllReferrals] = useState(false)
  const [isGeneratingCode, setIsGeneratingCode] = useState(false)
  const [isRedeeming, setIsRedeeming] = useState(false)
  const [notificationState, setNotificationState] = useState<{
    type: 'error' | 'success' | 'info';
    message: string | null;
  }>({ type: 'error', message: null })

  useEffect(() => {
    fetchReferralData()
  }, [])

  const fetchReferralData = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setError('User not authenticated')
        return
      }

      // Fetch user details with referral code
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, referral_code')
        .eq('auth_id', user.id)
        .single()

      if (userError) throw userError

      // Set referral code
      if (userData.referral_code) {
        setReferralCodes([{
          id: 'current',
          code: userData.referral_code,
          isActive: true,
          createdAt: new Date()
        }])

        // Fetch users who were referred by this user
        const { data: referredUsers, error: referredError } = await supabase
          .from('users')
        .select(`
          id,
            username,
            email,
            created_at,
            status
        `)
          .eq('referred_by', userData.referral_code)
        .order('created_at', { ascending: false })

        if (referredError) throw referredError

        // Get all referrals for this user with their reward amounts
        const { data: referralsData, error: referralsError } = await supabase
          .from('referrals')
          .select('referred_id, referral_status, reward_amount, completed_at')
          .eq('referrer_id', userData.id)

      if (referralsError) throw referralsError

        // Create a set of completed referral IDs
        const completedReferralIds = new Set(
          referralsData
            ?.filter(r => r.referral_status === 'Redeemed')
            .map(r => r.referred_id) || []
        )

        // Transform the data into referrals format
        const transformedReferrals: Referral[] = (referredUsers || [])
          .map(user => {
            const referralData = referralsData?.find(r => r.referred_id === user.id)
            return {
              id: user.id,
        referredUser: {
                username: user.username || 'Unknown',
                email: user.email || 'Unknown'
        },
              referral_status: referralData?.referral_status || 'Signed Up',
              rewardAmount: 5, // 5 days free subscription
              createdAt: new Date(user.created_at),
              completedAt: referralData?.completed_at ? new Date(referralData.completed_at) : undefined
            }
          })

      setReferrals(transformedReferrals)

      // Calculate stats
      const signedUpReferrals = transformedReferrals.filter(r => r.referral_status === 'Signed Up').length
      const redeemedReferrals = transformedReferrals.filter(r => r.referral_status === 'Redeemed').length
      const totalSignedUp = signedUpReferrals + redeemedReferrals
        
      // Calculate total rewards based on pending referrals
        const totalRewards = signedUpReferrals * 5

        // Update rewards_days in the database
        const { error: updateError } = await supabase
          .from('users')
          .update({
            rewards_days: totalRewards
          })
          .eq('auth_id', user.id)

        if (updateError) {
          console.error('Error updating rewards_days:', updateError)
        }

      setStats({
        totalReferrals: transformedReferrals.length,
        completedReferrals: totalSignedUp,
        pendingReferrals: redeemedReferrals,
        totalRewards,
          pendingRewards: 0
      })
      }

    } catch (err) {
      console.error('Error fetching referral data:', err)
      setError('Failed to load referral data')
    } finally {
      setLoading(false)
    }
  }

  const generateReferralCode = async () => {
    try {
      setIsGeneratingCode(true)
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast.error('User not authenticated')
        return
      }

      // Get user's ID from the users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', user.id)
        .single()

      if (userError || !userData) {
        toast.error('Failed to get user data')
        return
      }

      // Generate a new referral code and deactivate old ones
      const { data: newCode, error: codeError } = await supabase
        .rpc('handle_referral_code_generation', {
          p_user_id: userData.id
        })

      if (codeError) {
        throw codeError
      }

      toast.success('New referral link generated!')
      await fetchReferralData() // Refresh the data
    } catch (err) {
      console.error('Error generating referral link:', err)
      toast.error('Failed to generate referral link')
    } finally {
      setIsGeneratingCode(false)
    }
  }

  const copyToClipboard = (code: string) => {
    const referralLink = `https://dowody.github.io/rw/signin?ref=${code}`
    navigator.clipboard.writeText(referralLink)
    setCopiedCode(code)
    toast.success('Referral link copied to clipboard!')
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const getStatusColor = (referralStatus: string | null) => {
    if (referralStatus === 'Redeemed') {
      return 'bg-green-500/20 text-green-400'
    }
    if (referralStatus === 'Signed Up') {
        return 'bg-blue-500/20 text-blue-400'
    }
        return 'bg-gray-500/20 text-gray-400'
  }

  const handleRedeemSubscription = async () => {
    try {
      setIsRedeeming(true)
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setNotificationState({
          type: 'error',
          message: 'User not authenticated'
        })
        return
      }

      // Get user's ID and subscription status from the users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, subscription_end_date, rewards_days, username, email')
        .eq('auth_id', user.id)
        .single()

      if (userError || !userData) {
        setNotificationState({
          type: 'error',
          message: 'Failed to get user data'
        })
        return
      }

      // Check for active subscription
      const currentDate = new Date()
      const subscriptionEndDate = userData.subscription_end_date ? new Date(userData.subscription_end_date) : null
      const hasActiveSubscription = subscriptionEndDate && subscriptionEndDate > currentDate

      if (hasActiveSubscription) {
        setNotificationState({
          type: 'error',
          message: `You already have an active subscription until ${subscriptionEndDate.toLocaleDateString()}. Please wait until it expires to redeem new rewards.`
        })
        return
      }

      // Get all pending referrals to calculate total reward days
      const { data: pendingReferrals, error: pendingError } = await supabase
        .from('referrals')
        .select('id, reward_amount, status')
        .eq('referrer_id', userData.id)
        .eq('status', 'Signed Up')

      if (pendingError) {
        console.error('Error fetching pending referrals:', pendingError)
        throw pendingError
      }

      console.log('Pending referrals before update:', pendingReferrals)

      // Calculate total reward days (5 days per pending referral)
      const totalRewardDays = (pendingReferrals?.length || 0) * 5

      if (totalRewardDays <= 0) {
        setNotificationState({
          type: 'error',
          message: 'No pending referrals available to redeem'
        })
        return
      }

      // Calculate new subscription end date
      const newEndDate = new Date()
      newEndDate.setDate(newEndDate.getDate() + totalRewardDays)

      // Get or create a free subscription plan for referral rewards
      const { data: subscriptionPlan, error: subscriptionError } = await supabase
        .from('subscriptions')
        .select('id, name')
        .eq('name', 'Referral Reward')
        .single()

      let subscriptionId = subscriptionPlan?.id

      if (!subscriptionId) {
        // Create a free subscription plan for referral rewards if it doesn't exist
        const { data: newPlan, error: createError } = await supabase
          .from('subscriptions')
          .insert({
            name: 'Referral Reward',
            description: 'Free subscription days earned through referrals',
            price: 0,
            duration_days: 1, // Base duration, will be multiplied by rewards_days
            max_withdrawals_per_day: 5,
            max_case_collection: true,
            advanced_filtering: true,
            risk_management: true,
            is_active: true
          })
          .select()
          .single()

        if (createError) {
          throw createError
        }
        subscriptionId = newPlan.id
      }

      // Create a new order linked to the subscription plan
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: userData.id,
          amount: 0.00, // Free subscription from referral rewards
          status: 'completed',
          subscription_id: subscriptionId,
          expiration_date: newEndDate.toISOString(),
          transaction_date: currentDate.toISOString(),
          created_at: currentDate.toISOString(),
          updated_at: currentDate.toISOString()
        })
        .select()
        .single()

      if (orderError) {
        throw orderError
      }

      // Update user's subscription end date
      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update({
          subscription_end_date: newEndDate.toISOString()
        })
        .eq('auth_id', user.id)
        .select('subscription_end_date')
        .single()

      if (updateError) {
        console.error('Error updating user:', updateError)
        throw updateError
      }

      // Update each pending referral individually using RPC
      for (const referral of pendingReferrals || []) {
        const { data: updateResult, error: referralUpdateError } = await supabase
          .rpc('update_referral_status', {
            p_referral_id: referral.id,
            p_new_status: 'Redeemed',
            p_completed_at: currentDate.toISOString()
          })

        if (referralUpdateError) {
          console.error(`Error updating referral ${referral.id}:`, referralUpdateError)
          throw referralUpdateError
        }

        console.log(`Update result for referral ${referral.id}:`, updateResult)
      }

      // Send email notifications
      try {
        // Get user's IP address
        const { data: userIpData } = await supabase
          .from('users')
          .select('ip_address')
          .eq('id', userData.id)
          .single()

        // Admin notification email
        await emailjs.send(
          'service_27i9rew',
          'template_vm9z8fa',
          {
            order_id: orderData.id,
            user_id: userData.id,
            status: 'completed',
            total_amount: 0,
            transaction_date: new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }),
            expiration_date: newEndDate.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }),
            created_at: new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }),
            ip_address: userIpData?.ip_address || 'Not available'
          }
        )

        // User confirmation email
        await emailjs.send(
          'service_rl84opo',
          'template_uu06rg9',
          {
            username: userData.username || userData.email?.split('@')[0],
            id: orderData.id,
            total_amount: 0,
            transaction_date: new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }),
            subscription_id: subscriptionId,
            subscription_name: 'Referral Reward',
            expiration_date: newEndDate.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }),
            orders: [{
              name: 'Referral Reward Subscription',
              units: 1,
              price: 0
            }],
            cost: {
              total: 0
            },
            email: userData.email,
            created_at: new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })
          }
        )

        console.log('Referral reward confirmation emails sent successfully')
      } catch (error) {
        console.error('Failed to send referral reward confirmation emails:', error)
      }

      // Verify the update
      const { data: verifyReferrals, error: verifyError } = await supabase
        .from('referrals')
        .select('id, referral_status')
        .eq('referrer_id', userData.id)
        .in('id', pendingReferrals?.map(r => r.id) || [])

      if (verifyError) {
        console.error('Error verifying update:', verifyError)
      } else {
        console.log('Referrals after update:', verifyReferrals)
      }

      // Refresh the data to ensure we have the latest state
      await fetchReferralData()

      setNotificationState({
        type: 'success',
        message: `Successfully created a new subscription for ${totalRewardDays} days! Your subscription is valid until ${newEndDate.toLocaleDateString()}`
      })
    } catch (err) {
      console.error('Error redeeming subscription:', err)
      setNotificationState({
        type: 'error',
        message: 'Failed to redeem subscription days'
      })
    } finally {
      setIsRedeeming(false)
    }
  }

  // Notification component
  const Notification = ({ message, type, onClose }: { message: string; type: 'error' | 'success' | 'info'; onClose: () => void }) => {
    const [progress, setProgress] = useState(100)

    useEffect(() => {
      if (type !== 'info') {
        const duration = 5000
        const interval = 50
        const steps = duration / interval
        const decrement = 100 / steps

        const timer = setInterval(() => {
          setProgress((prev) => {
            if (prev <= 0) {
              clearInterval(timer)
              onClose()
              return 0
            }
            return prev - decrement
          })
        }, interval)

        return () => clearInterval(timer)
      }
    }, [onClose, type])

    return (
      <motion.div
        initial={{ opacity: 1, y: 0 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 1, y: 0 }}
        className={`mx-auto z-40 p-4 rounded-xl w-[calc(100%-2rem)] max-w-md relative overflow-hidden ${
          type === 'error' 
            ? 'bg-red-500 border border-red-500 text-white' 
            : type === 'success'
            ? 'bg-emerald-500 border border-emerald-500 text-white'
            : 'bg-blue-500 border border-blue-500 text-white'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {type === 'error' ? (
              <AlertTriangle className="mr-3 w-6 h-6 flex-shrink-0" />
            ) : type === 'success' ? (
              <CheckCircle className="mr-3 w-6 h-6 flex-shrink-0" />
            ) : (
              <Info className="mr-3 w-6 h-6 flex-shrink-0" />
            )}
            <span className="text-sm font-medium">{message}</span>
          </div>
          <button 
            onClick={onClose}
            className="ml-4 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <p>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <>
    <motion.div 
      initial={{ opacity: 1, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      {/* Introduction */}
      <div className="bg-gradient-to-br from-[#210746] to-[#2C095D] rounded-2xl p-6 border border-[#8a4fff]/10">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-[#8a4fff]/10 p-2 rounded-lg">
              <Share2 className="w-5 h-5 text-[#8a4fff]" />
            </div>
            <h3 className="text-xl font-semibold text-[#8a4fff]">Referral Program</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <p className="text-gray-300">
                Invite friends to join RollWithdraw and earn free subscription days for each successful referral.
              </p>
              <div className="flex items-center gap-2 text-[#8a4fff]">
                <Gift className="w-4 h-4" />
                <span className="text-sm font-medium">5 days free subscription per referral</span>
              </div>
            </div>
            
            <div className="bg-[#2c1b4a] rounded-xl p-4">
              <h4 className="text-[#8a4fff] font-medium mb-3">How it works:</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-300">
                  <div className="w-6 h-6 rounded-full bg-[#8a4fff]/10 flex items-center justify-center text-[#8a4fff] text-sm font-medium">1</div>
                  <span className="text-sm">Generate your unique referral link</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <div className="w-6 h-6 rounded-full bg-[#8a4fff]/10 flex items-center justify-center text-[#8a4fff] text-sm font-medium">2</div>
                  <span className="text-sm">Share it with your friends</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <div className="w-6 h-6 rounded-full bg-[#8a4fff]/10 flex items-center justify-center text-[#8a4fff] text-sm font-medium">3</div>
                  <span className="text-sm">Earn rewards when they sign up</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-[#210746] to-[#2C095D] rounded-2xl p-4 border border-[#8a4fff]/10">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-[#8a4fff]/10 p-2 rounded-lg">
              <Users className="w-5 h-5 text-[#8a4fff]" />
            </div>
            <h3 className="text-lg font-semibold text-[#8a4fff]">Total Referrals</h3>
          </div>
          <p className="text-2xl font-bold text-white">{stats.totalReferrals}</p>
          <p className="text-sm text-gray-400 mt-1">
            {stats.completedReferrals} signed up, {stats.pendingReferrals} redeemed
          </p>
        </div>

        <div className="bg-gradient-to-br from-[#210746] to-[#2C095D] rounded-2xl p-4 border border-[#8a4fff]/10">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-[#8a4fff]/10 p-2 rounded-lg">
              <Gift className="w-5 h-5 text-[#8a4fff]" />
            </div>
            <h3 className="text-lg font-semibold text-[#8a4fff]">Total Rewards</h3>
          </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-2xl font-bold text-white">{stats.totalRewards} days</p>
          <p className="text-sm text-gray-400 mt-1">
                  Free subscription days earned
          </p>
        </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRedeemSubscription}
                disabled={isRedeeming || stats.totalRewards <= 0}
                className="bg-[#8a4fff] text-white px-4 py-2 rounded-lg 
                  hover:bg-[#7a3ddf] transition-colors flex items-center justify-center gap-2
                  text-sm disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
              >
                {isRedeeming ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Redeeming...
                  </>
                ) : (
                  <>
                    <Gift className="w-4 h-4" /> Redeem Subscription
                  </>
                )}
              </motion.button>
            </div>
          </div>
      </div>

      {/* Referral Codes */}
      <div className="bg-gradient-to-br from-[#210746] to-[#2C095D] rounded-2xl p-4 sm:p-6 border border-[#8a4fff]/10">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div>
            <h3 className="text-lg sm:text-xl font-semibold text-[#8a4fff] flex items-center gap-2">
                <Share2 className="w-4 h-4 sm:w-5 sm:h-5" /> Your Referral Link
            </h3>
              <p className="text-sm sm:text-sm text-gray-400 mt-0.5">
              Share this link with friends to earn rewards
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={generateReferralCode}
            disabled={isGeneratingCode}
              className="bg-[#8a4fff] text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl 
            hover:bg-[#7a3ddf] transition-colors flex items-center justify-center gap-2 w-full sm:w-auto
              disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {isGeneratingCode ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Generating...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" /> Generate New Link
              </>
            )}
          </motion.button>
        </div>

          <div className="space-y-3 sm:space-y-4">
          {isGeneratingCode ? (
              <div className="text-center py-6 sm:py-8 text-gray-400">
                <RefreshCw className="w-5 h-5 sm:w-6 sm:h-6 animate-spin mx-auto mb-2" />
                <p className="text-sm">Generating new referral link...</p>
            </div>
          ) : loading ? (
              <div className="text-center py-6 sm:py-8 text-gray-400">
                <RefreshCw className="w-5 h-5 sm:w-6 sm:h-6 animate-spin mx-auto mb-2" />
                <p className="text-sm">Loading referral link...</p>
            </div>
          ) : referralCodes.length === 0 ? (
              <div className="text-center py-6 sm:py-8 text-gray-400">
                <p className="text-sm">No referral link generated yet</p>
            </div>
          ) : (
            referralCodes.map((code) => (
              <div 
                key={code.id}
                  className="bg-[#2c1b4a] rounded-lg sm:rounded-xl p-3 sm:p-4"
                >
                  <div className="flex flex-col justify-between gap-3">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="bg-[#8a4fff]/10 p-1.5 sm:p-2 rounded-lg">
                        <Share2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#8a4fff]" />
                  </div>
                  <div className="min-w-0 flex-1">
                        <p className="text-sm sm:text-base text-white font-medium truncate">https://dowody.github.io/rw/signin?ref={code.code}</p>
                        <p className="text-xs sm:text-sm text-gray-400">
                      Created {code.createdAt.toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(code.code)}
                        className="bg-[#8a4fff]/10 text-[#8a4fff] p-1.5 sm:p-2 rounded-lg 
                    hover:bg-[#8a4fff]/20 transition-colors"
                    title="Copy referral link"
                  >
                    {copiedCode === code.code ? (
                          <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                    ) : (
                          <Copy className="w-4 h-4 sm:w-5 sm:h-5" />
                    )}
                  </button>
                </div>
                
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Referral History */}
        <div className="bg-gradient-to-br from-[#210746] to-[#2C095D] rounded-2xl p-4 sm:p-6 border border-[#8a4fff]/10">
          <div className="flex justify-between items-center mb-4 sm:mb-6">
          <div>
              <h3 className="text-lg sm:text-xl font-semibold text-[#8a4fff] flex items-center gap-2">
                <Users className="w-4 h-4 sm:w-5 sm:h-5" /> Referral History
            </h3>
              <p className="text-sm sm:text-sm text-gray-400 mt-0.5">
              Track your referrals and rewards
            </p>
          </div>
            {!loading && referrals.length > 3 && (
            <button
              onClick={() => setShowAllReferrals(!showAllReferrals)}
                className="text-[#8a4fff] hover:bg-[#8a4fff]/10 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl 
                transition-colors text-xs sm:text-sm"
            >
              {showAllReferrals ? 'Show Less' : 'Show More'}
            </button>
          )}
        </div>

          <div className="space-y-3 sm:space-y-4">
            {loading ? (
              <div className="text-center py-6 sm:py-8 text-gray-400">
                <RefreshCw className="w-5 h-5 sm:w-6 sm:h-6 animate-spin mx-auto mb-2" />
                <p className="text-sm">Loading referral history...</p>
              </div>
            ) : referrals.length === 0 ? (
              <div className="text-center py-6 sm:py-8 text-gray-400">
                <p className="text-sm">No referrals yet</p>
            </div>
          ) : (
            referrals
              .slice(0, showAllReferrals ? undefined : 3)
              .map((referral) => (
                <div 
                  key={referral.id}
                    className="bg-[#2c1b4a] rounded-lg sm:rounded-xl p-4 pt-5 pb-5 sm:p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 sm:gap-3 mb-2">
                        <div className="bg-[#8a4fff]/10 p-1.5 sm:p-2 rounded-lg">
                          <Users className="w-4 h-4 sm:w-5 sm:h-5 text-[#8a4fff]" />
                      </div>
                      <div>
                          <p className="text-sm sm:text-base text-white font-medium">
                          {referral.referredUser.username}
                        </p>
                          <p className="text-xs sm:text-sm text-gray-400">
                          {referral.referredUser.email}
                        </p>
                      </div>
                    </div>
                      <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm ${getStatusColor(referral.referral_status)}`}>
                        {referral.referral_status}
                    </span>
                  </div>
                    <div className="flex items-center justify-between mt-2 text-xs sm:text-sm">
                      <div className="">
                      Referred on {referral.createdAt.toLocaleDateString()}
                    </div>
                    <div className="text-white font-medium">
                        Reward: {referral.rewardAmount} days free
                    </div>
                  </div>
                </div>
              ))
          )}
        </div>
      </div>
    </motion.div>

      {/* Notifications */}
      <div className="fixed top-20 left-0 right-0 z-40 flex flex-col gap-2 p-4">
        <AnimatePresence>
          {notificationState.type && notificationState.message && (
            <Notification 
              message={notificationState.message}
              type={notificationState.type}
              onClose={() => setNotificationState({ type: 'error', message: null })}
            />
          )}
        </AnimatePresence>
      </div>
    </>
  )
}

export default ReferralsSection
