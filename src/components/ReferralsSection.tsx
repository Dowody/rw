import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Share2, 
  Copy, 
  CheckCircle, 
  Users, 
  Gift, 
  Clock, 
  AlertCircle,
  RefreshCw,
  ExternalLink
} from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { toast } from 'react-hot-toast'

interface ReferralStats {
  totalReferrals: number
  completedReferrals: number
  pendingReferrals: number
  totalRewards: number
  pendingRewards: number
}

interface Referral {
  id: string
  referredUser: {
    username: string
    email: string
  }
  status: 'pending' | 'completed' | 'expired'
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

  useEffect(() => {
    fetchReferralData()
  }, [])

  const fetchReferralData = async () => {
    try {
      setLoading(false)
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setError('User not authenticated')
        return
      }

      // Fetch user details
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', user.id)
        .single()

      if (userError) throw userError

      // Fetch referral codes
      const { data: codesData, error: codesError } = await supabase
        .from('referral_codes')
        .select('*')
        .eq('user_id', userData.id)
        .order('created_at', { ascending: false })

      if (codesError) throw codesError

      // Fetch referrals with referred user details
      const { data: referralsData, error: referralsError } = await supabase
        .from('referrals')
        .select(`
          id,
          status,
          reward_amount,
          created_at,
          completed_at,
          referred_id,
          referred_user:users!referrals_referred_id_fkey (
            username,
            email
          )
        `)
        .eq('referrer_id', userData.id)
        .order('created_at', { ascending: false })

      if (referralsError) throw referralsError

      // Fetch referral rewards
      const { data: rewardsData, error: rewardsError } = await supabase
        .from('referral_rewards')
        .select('amount, status')
        .in('referral_id', referralsData.map(r => r.id))

      if (rewardsError) throw rewardsError

      // Process and set data
      setReferralCodes(codesData.map(code => ({
        id: code.id,
        code: code.code,
        isActive: code.is_active,
        createdAt: new Date(code.created_at)
      })))

      const transformedReferrals = referralsData.map(referral => ({
        id: referral.id,
        referredUser: {
          username: referral.referred_user[0]?.username || 'Unknown',
          email: referral.referred_user[0]?.email || 'Unknown'
        },
        status: referral.status,
        rewardAmount: referral.reward_amount,
        createdAt: new Date(referral.created_at),
        completedAt: referral.completed_at ? new Date(referral.completed_at) : undefined
      }))

      setReferrals(transformedReferrals)

      // Calculate stats
      const completedReferrals = transformedReferrals.filter(r => r.status === 'completed').length
      const pendingReferrals = transformedReferrals.filter(r => r.status === 'pending').length
      const totalRewards = rewardsData.reduce((sum, reward) => sum + reward.amount, 0)
      const pendingRewards = rewardsData
        .filter(reward => reward.status === 'pending')
        .reduce((sum, reward) => sum + reward.amount, 0)

      setStats({
        totalReferrals: transformedReferrals.length,
        completedReferrals,
        pendingReferrals,
        totalRewards,
        pendingRewards
      })

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

      toast.success('New referral code generated!')
      await fetchReferralData() // Refresh the data
    } catch (err) {
      console.error('Error generating referral code:', err)
      toast.error('Failed to generate referral code')
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'signed_up':
        return 'bg-green-500/20 text-green-400'
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400'
      case 'expired':
        return 'bg-red-500/20 text-red-400'
      default:
        return 'bg-gray-500/20 text-gray-400'
    }
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
    <motion.div 
      initial={{ opacity: 1, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-[#210746] to-[#2C095D] rounded-2xl p-4 border border-[#8a4fff]/10">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-[#8a4fff]/10 p-2 rounded-lg">
              <Users className="w-5 h-5 text-[#8a4fff]" />
            </div>
            <h3 className="text-lg font-semibold text-[#8a4fff]">Total Referrals</h3>
          </div>
          <p className="text-2xl font-bold text-white">{stats.totalReferrals}</p>
          <p className="text-sm text-gray-400 mt-1">
            {stats.completedReferrals} completed, {stats.pendingReferrals} pending
          </p>
        </div>

        <div className="bg-gradient-to-br from-[#210746] to-[#2C095D] rounded-2xl p-4 border border-[#8a4fff]/10">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-[#8a4fff]/10 p-2 rounded-lg">
              <Gift className="w-5 h-5 text-[#8a4fff]" />
            </div>
            <h3 className="text-lg font-semibold text-[#8a4fff]">Total Rewards</h3>
          </div>
          <p className="text-2xl font-bold text-white">€{stats.totalRewards.toFixed(2)}</p>
          <p className="text-sm text-gray-400 mt-1">
            €{stats.pendingRewards.toFixed(2)} pending
          </p>
        </div>

        <div className="bg-gradient-to-br from-[#210746] to-[#2C095D] rounded-2xl p-4 border border-[#8a4fff]/10">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-[#8a4fff]/10 p-2 rounded-lg">
              <CheckCircle className="w-5 h-5 text-[#8a4fff]" />
            </div>
            <h3 className="text-lg font-semibold text-[#8a4fff]">Success Rate</h3>
          </div>
          <p className="text-2xl font-bold text-white">
            {stats.totalReferrals > 0 
              ? Math.round((stats.completedReferrals / stats.totalReferrals) * 100)
              : 0}%
          </p>
          <p className="text-sm text-gray-400 mt-1">
            {stats.completedReferrals} successful referrals
          </p>
        </div>

       
      </div>

      {/* Referral Codes */}
      <div className="bg-gradient-to-br from-[#210746] to-[#2C095D] rounded-2xl p-4 sm:p-6 border border-[#8a4fff]/10">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <div>
            <h3 className="text-lg sm:text-xl font-semibold text-[#8a4fff] flex items-center gap-2">
              <Share2 className="w-5 h-5" /> Your Referral Codes
            </h3>
            <p className="text-sm text-gray-400 mt-1">
              Share these codes with friends to earn rewards
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={generateReferralCode}
            disabled={isGeneratingCode}
            className="bg-[#8a4fff] text-white px-4 py-2 rounded-xl 
            hover:bg-[#7a3ddf] transition-colors flex items-center justify-center gap-2 w-full sm:w-auto
            disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGeneratingCode ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Generating...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" /> Generate New Code
              </>
            )}
          </motion.button>
        </div>

        <div className="space-y-4">
          {isGeneratingCode ? (
            <div className="text-center py-8 text-gray-400">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
              <p>Generating new referral code...</p>
            </div>
          ) : loading ? (
            <div className="text-center py-8 text-gray-400">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
              <p>Loading referral codes...</p>
            </div>
          ) : referralCodes.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p>No referral codes generated yet</p>
            </div>
          ) : (
            referralCodes.map((code) => (
              <div 
                key={code.id}
                className="bg-[#2c1b4a] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-[#8a4fff]/10 p-2 rounded-lg">
                    <Share2 className="w-5 h-5 text-[#8a4fff]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-white font-medium truncate">{code.code}</p>
                    <p className="text-sm text-gray-400">
                      Created {code.createdAt.toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={() => copyToClipboard(code.code)}
                    className="bg-[#8a4fff]/10 text-[#8a4fff] p-2 rounded-lg 
                    hover:bg-[#8a4fff]/20 transition-colors"
                    title="Copy referral link"
                  >
                    {copiedCode === code.code ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <Copy className="w-5 h-5" />
                    )}
                  </button>
                  <a
                    href={`https://dowody.github.io/rw/signin?ref=${code.code}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#8a4fff]/10 text-[#8a4fff] p-2 rounded-lg 
                    hover:bg-[#8a4fff]/20 transition-colors"
                    title="Open referral link"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Referral History */}
      <div className="bg-gradient-to-br from-[#210746] to-[#2C095D] rounded-2xl p-6 border border-[#8a4fff]/10">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-semibold text-[#8a4fff] flex items-center gap-2">
              <Users className="w-5 h-5" /> Referral History
            </h3>
            <p className="text-sm text-gray-400 mt-1">
              Track your referrals and rewards
            </p>
          </div>
          {referrals.length > 3 && (
            <button
              onClick={() => setShowAllReferrals(!showAllReferrals)}
              className="text-[#8a4fff] hover:bg-[#8a4fff]/10 px-4 py-2 rounded-xl 
              transition-colors"
            >
              {showAllReferrals ? 'Show Less' : 'Show More'}
            </button>
          )}
        </div>

        <div className="space-y-4">
          {referrals.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p>No referrals yet</p>
            </div>
          ) : (
            referrals
              .slice(0, showAllReferrals ? undefined : 3)
              .map((referral) => (
                <div 
                  key={referral.id}
                  className="bg-[#2c1b4a] rounded-xl p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="bg-[#8a4fff]/10 p-2 rounded-lg">
                        <Users className="w-5 h-5 text-[#8a4fff]" />
                      </div>
                      <div>
                        <p className="text-white font-medium">
                          {referral.referredUser.username}
                        </p>
                        <p className="text-sm text-gray-400">
                          {referral.referredUser.email}
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(referral.status)}`}>
                      {referral.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-2 text-sm">
                    <div className="text-gray-400">
                      Referred on {referral.createdAt.toLocaleDateString()}
                    </div>
                    <div className="text-white font-medium">
                      Reward: {referral.rewardAmount} free subscription
                    </div>
                  </div>
                </div>
              ))
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default ReferralsSection
