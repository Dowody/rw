import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Users, 
  ShoppingCart, 
  Settings, 
  Bot, 
  LogOut,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Eye,
  Shield,
  Zap,
  BarChart2,
  Calendar,
  Clock,
  DollarSign,
  UserPlus,
  UserMinus,
  Power,
  PowerOff,
  Plus,
  Minus,
  Trash2,
  Edit2,
  Save,
  X,
  Crown,
  User,
  Percent
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

// Add this function to get IP address
const getUserIP = async () => {
  try {
    const response = await fetch('https://api.ipify.org?format=json')
    const data = await response.json()
    return data.ip
  } catch (error) {
    console.error('Error fetching IP:', error)
    return null
  }
}

// Add this function to update user's IP address
const updateUserIP = async (userId: string, ipAddress: string) => {
  try {
    const { error } = await supabase
      .from('users')
      .update({ ip_address: ipAddress })
      .eq('id', userId)

    if (error) throw error
  } catch (error) {
    console.error('Error updating IP:', error)
  }
}

// Add this function to handle user login
const handleUserLogin = async (userId: string) => {
  const ipAddress = await getUserIP()
  if (ipAddress) {
    await updateUserIP(userId, ipAddress)
  }
}

type AdminSection = 'users' | 'orders' | 'bot-config'

interface User {
  id: string
  email: string
  username: string
  created_at: string
  status: string
  is_admin: boolean
  subscription_end_date: string | null
  subscription_name?: string
  current_subscription_id?: string
  ip_address?: string
}

interface Order {
  id: string
  user_id: string
  amount: number
  total_amount: number | null
  status: string
  created_at: string
  transaction_date: string | null
  subscription_id: string | null
  expiration_date: string | null
  subscription_name: string | null
  subscriptions: {
    name: string
  } | null
  users: {
    email: string
    username: string
    ip_address?: string
  } | null
}

interface BotConfig {
  id: string
  user_id: string
  bot_type: string
  status: string
  bot_status: string
  min_price: number
  max_price: number
  max_percentage: number
  min_sticker_price?: number
  session_token: string
  blacklist: string[]
  created_at: string
  timer_end?: string
  valid_session_token?: boolean
  users?: {
    email: string
    username: string
  } | null
}

const AdminDashboard: React.FC = () => {
  const [activeSection, setActiveSection] = useState<AdminSection>('bot-config')
  const [users, setUsers] = useState<User[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [botConfigs, setBotConfigs] = useState<BotConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info' | null
    message: string | null
  }>({ type: null, message: null })
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    users: {
      subscription: 'all'
    },
    orders: {
      status: 'all',
      subscription: 'all'
    },
    botConfig: {
      status: 'all',
      type: 'all'
    }
  })
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [selectedBotConfigUser, setSelectedBotConfigUser] = useState<{ email: string; username: string } | null>(null)

  const navigate = useNavigate()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch users with their subscription information
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select(`
          *,
          subscriptions:current_subscription_id (
            name
          )
        `)
        .order('created_at', { ascending: false })

      if (usersError) throw usersError
      
      // Process users data to include subscription name
      const processedUsers = usersData?.map(user => ({
        ...user,
        subscription_name: user.subscriptions?.name || null
      })) || []
      
      setUsers(processedUsers)

      // Fetch orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          subscriptions:subscription_id (
            name
          ),
          users:user_id (
            email,
            username,
            ip_address
          )
        `)
        .order('transaction_date', { ascending: false })

      if (ordersError) throw ordersError

      // Process orders with subscription names and user info
      const processedOrders = (ordersData || []).map(order => ({
        ...order,
        subscription_name: order.subscriptions?.name || null,
        subscriptions: order.subscriptions || null,
        users: order.users || null
      }))

      setOrders(processedOrders)

      // Fetch bot configurations
      const { data: botConfigsData, error: botConfigsError } = await supabase
        .from('bot_configurations')
        .select(`
          *,
          users:user_id (
            email,
            username
          )
        `)
        .order('created_at', { ascending: false })

      if (botConfigsError) throw botConfigsError
      setBotConfigs(botConfigsData || [])

    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      navigate('/admin')
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleBotActivation = async (configId: string, activate: boolean) => {
    try {
      const { error } = await supabase
        .from('bot_configurations')
        .update({
          status: activate ? 'active' : 'inactive',
          bot_status: activate ? 'start' : 'stop',
          bg_color: activate ? '#4CAF50' : '#F44336'
        })
        .eq('id', configId)

      if (error) throw error

      // Update local state
      setBotConfigs(prevConfigs => 
        prevConfigs.map(config => 
          config.id === configId 
            ? { 
                ...config, 
                status: activate ? 'active' : 'inactive',
                bot_status: activate ? 'start' : 'stop',
                bg_color: activate ? '#4CAF50' : '#F44336'
              }
            : config
        )
      )

      setNotification({
        type: 'success',
        message: `Bot ${activate ? 'activated' : 'deactivated'} successfully`
      })

    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err.message
      })
    }
  }

  const handleUserDeactivation = async (userId: string, deactivate: boolean) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ status: deactivate ? 'inactive' : 'active' })
        .eq('id', userId)

      if (error) throw error

      // Update local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId 
            ? { ...user, status: deactivate ? 'inactive' : 'active' }
            : user
        )
      )

      setNotification({
        type: 'success',
        message: `User account ${deactivate ? 'disabled' : 'enabled'} successfully`
      })

    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err.message
      })
    }
  }

  const handleToggleValidSessionToken = async (configId: string, currentState: boolean) => {
    try {
      const { error } = await supabase
        .from('bot_configurations')
        .update({ valid_session_token: !currentState })
        .eq('id', configId)

      if (error) throw error

      // Update local state
      setBotConfigs(prevConfigs => 
        prevConfigs.map(config => 
          config.id === configId 
            ? { ...config, valid_session_token: !currentState }
            : config
        )
      )

      setNotification({
        type: 'success',
        message: `Session token ${!currentState ? 'validated' : 'invalidated'} successfully`
      })

    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err.message
      })
    }
  }

  const filterUsers = (users: User[]) => {
    return users.filter(user => {
      const matchesSearch = 
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.id.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesSubscription = filters.users.subscription === 'all' || 
        (filters.users.subscription === 'with' && user.current_subscription_id) ||
        (filters.users.subscription === 'without' && !user.current_subscription_id)

      return matchesSearch && matchesSubscription
    })
  }

  const filterOrders = (orders: Order[]) => {
    return orders.filter(order => {
      const matchesSearch = 
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.subscription_name?.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus = filters.orders.status === 'all' || order.status === filters.orders.status
      const matchesSubscription = filters.orders.subscription === 'all' || order.subscription_name === filters.orders.subscription

      return matchesSearch && matchesStatus && matchesSubscription
    })
  }

  const filterBotConfigs = (configs: BotConfig[]) => {
    return configs.filter(config => {
      const userEmail = config.users?.email?.toLowerCase() || '';
      const username = config.users?.username?.toLowerCase() || '';
      const userId = config.user_id.toLowerCase();
      
      const matchesSearch = 
        config.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        config.bot_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        userEmail.includes(searchQuery.toLowerCase()) ||
        username.includes(searchQuery.toLowerCase()) ||
        userId.includes(searchQuery.toLowerCase());

      const matchesStatus = filters.botConfig.status === 'all' || config.status === filters.botConfig.status;
      const matchesType = filters.botConfig.type === 'all' || config.bot_type === filters.botConfig.type;

      return matchesSearch && matchesStatus && matchesType;
    })
  }

  const Notification = ({ message, type, onClose }: { message: string; type: 'success' | 'error' | 'info'; onClose: () => void }) => {
    const [progress, setProgress] = useState(100)

    useEffect(() => {
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
    }, [onClose])

    return (
      <div className="fixed inset-0 flex items-start justify-center z-[9999] pointer-events-none">
        <motion.div
          initial={{ opacity: 1, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 1, y: -10 }}
          transition={{ duration: 0.15 }}
          className={`mt-24 px-4 py-3 rounded-lg w-[calc(100%-2rem)] max-w-md relative overflow-hidden pointer-events-auto
            ${type === 'error' 
              ? 'bg-red-500 text-white' 
              : type === 'success'
              ? 'bg-emerald-500 text-white'
              : 'bg-blue-500 text-white'}`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {type === 'error' ? (
                <AlertTriangle className="w-4 h-4" />
              ) : type === 'success' ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <Shield className="w-4 h-4" />
              )}
              <span className="text-sm">{message}</span>
            </div>
            <button 
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div 
            className="absolute bottom-0 left-0 h-0.5 bg-white/20 transition-all duration-50"
            style={{ width: `${progress}%` }}
          />
        </motion.div>
      </div>
    )
  }

  // Add UserOverviewModal component
  const UserOverviewModal = ({ user, onClose }: { user: User; onClose: () => void }) => {
    const [userOrders, setUserOrders] = useState<Order[]>([])

    useEffect(() => {
      const fetchUserOrders = async () => {
        const { data, error } = await supabase
          .from('orders')
          .select(`
            id,
            user_id,
            amount,
            total_amount,
            status,
            created_at,
            transaction_date,
            subscription_id,
            expiration_date,
            subscriptions:subscription_id (
              name
            ),
            users:user_id (
              email,
              username
            )
          `)
          .eq('user_id', user.id)
          .order('transaction_date', { ascending: false })

        if (!error && data) {
          const processedOrders: Order[] = data.map(order => ({
            id: order.id,
            user_id: order.user_id,
            amount: order.amount,
            total_amount: order.total_amount,
            status: order.status,
            created_at: order.created_at,
            transaction_date: order.transaction_date,
            subscription_id: order.subscription_id,
            expiration_date: order.expiration_date,
            subscription_name: order.subscriptions?.[0]?.name || null,
            subscriptions: order.subscriptions?.[0] || null,
            users: order.users?.[0] || null
          }))
          setUserOrders(processedOrders)
        }
      }

      fetchUserOrders()
    }, [user.id])

    return (
      <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-[9999]">
        <div className="fixed inset-0 bg-black/30 backdrop-blur-md" />
        <motion.div
          initial={{ opacity: 1, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 1, scale: 0.95 }}
          className="bg-[#1a0b2e]/80 backdrop-blur-xl rounded-2xl w-[calc(100%-2rem)] max-w-2xl relative border border-white/5 shadow-2xl z-[10000]"
        >
          {/* Close button */}  
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header */}
          <div className="p-6 border-b border-white/5">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#8a4fff] to-[#6a2dcf] flex items-center justify-center shadow-lg shadow-[#8a4fff]/20">
                  <span className="text-lg font-medium text-white">
                    {user.username.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <div>
                <h2 className="text-lg font-medium text-white">{user.username}</h2>
                <p className="text-sm text-gray-400">{user.email}</p>
                <p className="text-xs text-gray-500">ID: {user.id}</p>
                <p className="text-xs text-gray-500">IP: {user.ip_address || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
            <div className="space-y-4">
              {/* Account Info */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/5">
                <p className="text-xs text-gray-400 mb-1.5">Current Subscription</p>
                <p className="text-sm font-medium text-white">
                  {user.subscription_name || 'No active subscription'}
                </p>
                {user.subscription_end_date && (
                  <div className="mt-2 pt-2 border-t border-white/5">
                    <p className="text-xs text-gray-400 mb-1">Ends</p>
                    <p className="text-sm font-medium text-white">
                      {new Date(user.subscription_end_date).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>

              {/* Orders Section */}
              <div>
                <h3 className="text-sm font-medium text-white mb-4">Order History</h3>
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                  {userOrders.length > 0 ? (
                    userOrders.map((order) => (
                      <div key={order.id} className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/5">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <ShoppingCart className="w-4 h-4 text-[#8a4fff]" />
                            <span className="text-sm text-white">Order #{order.id}</span>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            order.status === 'completed' 
                              ? 'bg-green-500/20 text-green-400' 
                              : 'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-3">
                          <div>
                            <p className="text-xs text-gray-400 mb-1">Paid</p>
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-4 h-4 text-[#8a4fff]" />
                              <span className="text-sm text-white">
                                €{(order.total_amount || order.amount).toFixed(2)}
                              </span>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 mb-1">Purchase Date</p>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-[#8a4fff]" />
                              <span className="text-sm text-white">
                                {new Date(order.transaction_date || order.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        {order.subscription_name && (
                          <div className="mt-3 pt-3 border-t border-white/5">
                            <p className="text-xs text-gray-400 mb-1">Subscription</p>
                            <div className="flex items-center gap-2">
                              <Crown className="w-4 h-4 text-[#8a4fff]" />
                              <span className="text-sm text-white">{order.subscription_name}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/5">
                      <p className="text-sm text-gray-400">No orders found</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  // Add BotConfigModal component
  const BotConfigModal = ({ user, configs, onClose }: { user: { email: string; username: string }; configs: BotConfig[]; onClose: () => void }) => {
    return (
      <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-[9999]">
        <div className="fixed inset-0 bg-black/30 backdrop-blur-md" />
        <motion.div
          initial={{ opacity: 1, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 1, scale: 0.95 }}
          className="bg-[#1a0b2e]/80 backdrop-blur-xl rounded-2xl w-[calc(100%-2rem)] max-w-2xl relative border border-white/5 shadow-2xl z-[10000]"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header */}
          <div className="p-6 border-b border-white/5">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#8a4fff] to-[#6a2dcf] flex items-center justify-center shadow-lg shadow-[#8a4fff]/20">
                  <span className="text-lg font-medium text-white">
                    {user.username.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <div>
                <h2 className="text-lg font-medium text-white">{user.username}</h2>
                <p className="text-sm text-gray-400">{user.email}</p>
                <p className="text-xs text-gray-500">ID: {configs[0].user_id}</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
            <div className="space-y-4">
              {configs.map((config) => (
                <div key={config.id} className="bg-white/5 rounded-xl overflow-hidden">
                  {/* Top Bar */}
                  <div className="px-4 py-3 bg-[#8a4fff]/5 border-b border-[#8a4fff]/10">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <Bot className="w-5 h-5 text-[#8a4fff]" />
                        <span className="uppercase text-sm font-medium text-white">{config.bot_type}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleValidSessionToken(config.id, config.valid_session_token || false)}
                          className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg transition-colors ${
                            config.valid_session_token
                              ? 'text-green-400 hover:bg-green-500/10'
                              : 'text-yellow-400 hover:bg-yellow-500/10'
                          }`}
                          title={config.valid_session_token ? 'Session Token is Valid' : 'Session Token is Invalid'}
                        >
                          {config.valid_session_token ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <AlertTriangle className="w-4 h-4" />
                          )}
                          <span className="text-xs">
                            {config.valid_session_token ? 'Valid Session Token' : 'Invalid Session Token'}
                          </span>
                        </button>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          config.status === 'active' 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {config.status}
                        </span>
                        <button
                          onClick={() => handleBotActivation(config.id, config.status !== 'active')}
                          className={`p-1.5 rounded-lg transition-colors ${
                            config.status === 'active'
                              ? 'text-red-400 hover:bg-red-500/10'
                              : 'text-green-400 hover:bg-green-500/10'
                          }`}
                          title={config.status === 'active' ? 'Deactivate Bot' : 'Activate Bot'}
                        >
                          {config.status === 'active' ? (
                            <PowerOff className="w-4 h-4" />
                          ) : (
                            <Power className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Settings Grid */}
                  <div className="p-4 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Price Range</p>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-[#8a4fff]" />
                        <span className="text-sm text-white">
                          €{config.min_price} - €{config.max_price}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Max Percentage</p>
                      <div className="flex items-center gap-2">
                        <Percent className="w-4 h-4 text-[#8a4fff]" />
                        <span className="text-sm text-white">
                          {config.max_percentage}%
                        </span>
                      </div>
                    </div>
                    {config.min_sticker_price && (
                      <div className="col-span-2">
                        <p className="text-xs text-gray-400 mb-1">Min Sticker Price</p>
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-[#8a4fff]" />
                          <span className="text-sm text-white">€{config.min_sticker_price}</span>
                        </div>
                      </div>
                    )}
                    <div className="col-span-2">
                      <p className="text-xs text-gray-400 mb-1">Session Token</p>
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-[#8a4fff]" />
                        <span className="text-sm text-white font-mono bg-white/5 px-2 py-1 rounded">
                          {config.session_token}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Blacklist */}
                  <div className="px-4 py-3 bg-white/5 border-t border-white/5">
                    <p className="text-xs text-gray-400 mb-2">Blacklist Items</p>
                    <div className="flex flex-wrap gap-2">
                      {config.blacklist.length > 0 ? (
                        config.blacklist.map((item, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-[#8a4fff]/10 text-[#8a4fff] rounded-lg text-xs"
                          >
                            {item}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-gray-400">No blacklist items</span>
                      )}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="px-4 py-3 bg-white/5 border-t border-white/5 flex items-center justify-between text-xs text-gray-400">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>Activated: {new Date(config.created_at).toLocaleString()}</span>
                    </div>
                    {config.timer_end && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>
                          {(() => {
                            const endTime = new Date(config.timer_end).getTime();
                            const now = new Date().getTime();
                            const hoursLeft = Math.ceil((endTime - now) / (1000 * 60 * 60));
                            return `Verification ends in ${hoursLeft} hours`;
                          })()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#04011C] to-[#0a0415] flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[#8a4fff]"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#04011C] to-[#0a0415] flex items-center justify-center p-4">
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl max-w-md w-full">
          <div className="flex items-center">
            <AlertTriangle className="w-6 h-6 mr-3" />
            <span>{error}</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#04011C] to-[#0a0415]">
      {/* Notifications */}
      <AnimatePresence>
        {notification.type && notification.message && (
          <Notification 
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification({ type: null, message: null })}
          />
        )}
      </AnimatePresence>

      {/* Modals Backdrop */}
      <AnimatePresence>
        {(selectedUser || selectedBotConfigUser) && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-md z-[9998]" />
        )}
      </AnimatePresence>

      {/* Add UserOverviewModal */}
      <AnimatePresence>
        {selectedUser && (
          <div className="fixed inset-0 flex items-center justify-center z-[9999]">
            <motion.div
              initial={{ opacity: 1, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 1, scale: 0.95 }}
              className="bg-[#1a0b2e]/80 backdrop-blur-xl rounded-2xl w-[calc(100%-2rem)] max-w-2xl relative border border-white/5 shadow-2xl"
            >
              <UserOverviewModal
                user={selectedUser}
                onClose={() => setSelectedUser(null)}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add BotConfigModal */}
      <AnimatePresence>
        {selectedBotConfigUser && (
          <div className="fixed inset-0 flex items-center justify-center z-[9999]">
            <motion.div
              initial={{ opacity: 1, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 1, scale: 0.95 }}
              className="bg-[#1a0b2e]/80 backdrop-blur-xl rounded-2xl w-[calc(100%-2rem)] max-w-2xl relative border border-white/5 shadow-2xl"
            >
              <BotConfigModal
                user={selectedBotConfigUser}
                configs={botConfigs.filter(config => config.users?.email === selectedBotConfigUser.email)}
                onClose={() => setSelectedBotConfigUser(null)}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 mt-16">
        {/* Page Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-3xl font-bold text-white">Admin Dashboard</h1>
              <p className="text-xs sm:text-sm text-gray-400 mt-1">Manage users, orders, and bot configurations</p>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                onClick={() => fetchData()}
                className="p-2 text-gray-400 hover:text-white transition-colors bg-[#1a0b2e] rounded-lg"
                title="Refresh Data"
              >
                <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-red-500/10 text-red-400 rounded-lg 
                hover:bg-red-500/20 transition-colors"
              >
                <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-sm">Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex flex-wrap gap-2 sm:gap-4 mb-6 sm:mb-8">
          <button
            onClick={() => setActiveSection('users')}
            className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg transition-colors ${
              activeSection === 'users'
                ? 'bg-[#8a4fff] text-white'
                : 'bg-[#1a0b2e] text-gray-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-sm">Users</span>
          </button>
          <button
            onClick={() => setActiveSection('orders')}
            className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg transition-colors ${
              activeSection === 'orders'
                ? 'bg-[#8a4fff] text-white'
                : 'bg-[#1a0b2e] text-gray-400 hover:text-white'
            }`}
          >
            <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-sm">Orders</span>
          </button>
          <button
            onClick={() => setActiveSection('bot-config')}
            className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg transition-colors ${
              activeSection === 'bot-config'
                ? 'bg-[#8a4fff] text-white'
                : 'bg-[#1a0b2e] text-gray-400 hover:text-white'
            }`}
          >
            <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-sm">Bot Config</span>
          </button>
        </div>

        {/* Search and Filters */}
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full pl-9 sm:pl-10 pr-4 py-2 bg-[#1a0b2e] border border-[#8a4fff]/20 rounded-lg 
                text-sm text-white placeholder-gray-400 focus:border-[#8a4fff] transition-colors"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center space-x-2 px-4 py-2 bg-[#1a0b2e] text-gray-400 
              rounded-lg hover:text-white transition-colors w-full sm:w-auto"
            >
              <Filter className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm">Filters</span>
              {showFilters ? (
                <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5" />
              ) : (
                <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </button>
          </div>

          {/* Filter Options */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 1, y: 0 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.2,
                  ease: [0.4, 0, 0.2, 1],
                  opacity: { duration: 0.15 }
                }}
                className="mt-4 p-4 bg-[#1a0b2e] rounded-lg border border-[#8a4fff]/20"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {activeSection === 'users' && (
                    <motion.div
                      initial={{ opacity: 1, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <label className="block text-xs sm:text-sm text-gray-400 mb-2">Subscription</label>
                      <select
                        value={filters.users.subscription}
                        onChange={(e) => setFilters({ ...filters, users: { ...filters.users, subscription: e.target.value } })}
                        className="w-full px-3 py-2 bg-[#2c1b4a] border border-[#8a4fff]/20 rounded-lg 
                        text-sm text-white focus:border-[#8a4fff] transition-colors"
                      >
                        <option value="all">All Users</option>
                        <option value="with">With Subscription</option>
                        <option value="without">Without Subscription</option>
                      </select>
                    </motion.div>
                  )}

                  {activeSection === 'orders' && (
                    <>
                      <motion.div
                        initial={{ opacity: 1, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        <label className="block text-xs sm:text-sm text-gray-400 mb-2">Status</label>
                        <select
                          value={filters.orders.status}
                          onChange={(e) => setFilters({ ...filters, orders: { ...filters.orders, status: e.target.value } })}
                          className="w-full px-3 py-2 bg-[#2c1b4a] border border-[#8a4fff]/20 rounded-lg 
                          text-sm text-white focus:border-[#8a4fff] transition-colors"
                        >
                          <option value="all">All</option>
                          <option value="completed">Completed</option>
                          <option value="pending">Pending</option>
                        </select>
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 1, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.15 }}
                      >
                        <label className="block text-xs sm:text-sm text-gray-400 mb-2">Subscription</label>
                        <select
                          value={filters.orders.subscription}
                          onChange={(e) => setFilters({ ...filters, orders: { ...filters.orders, subscription: e.target.value } })}
                          className="w-full px-3 py-2 bg-[#2c1b4a] border border-[#8a4fff]/20 rounded-lg 
                          text-sm text-white focus:border-[#8a4fff] transition-colors"
                        >
                          <option value="all">All Subscriptions</option>
                          <option value="basic">Basic</option>
                          <option value="premium">Premium</option>
                          <option value="pro">Pro</option>
                        </select>
                      </motion.div>
                    </>
                  )}

                  {activeSection === 'bot-config' && (
                    <>
                      <motion.div
                        initial={{ opacity: 1, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        <label className="block text-xs sm:text-sm text-gray-400 mb-2">Status</label>
                        <select
                          value={filters.botConfig.status}
                          onChange={(e) => setFilters({ ...filters, botConfig: { ...filters.botConfig, status: e.target.value } })}
                          className="w-full px-3 py-2 bg-[#2c1b4a] border border-[#8a4fff]/20 rounded-lg 
                          text-sm text-white focus:border-[#8a4fff] transition-colors"
                        >
                          <option value="all">All</option>
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 1, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.15 }}
                      >
                        <label className="block text-xs sm:text-sm text-gray-400 mb-2">Bot Type</label>
                        <select
                          value={filters.botConfig.type}
                          onChange={(e) => setFilters({ ...filters, botConfig: { ...filters.botConfig, type: e.target.value } })}
                          className="w-full px-3 py-2 bg-[#2c1b4a] border border-[#8a4fff]/20 rounded-lg 
                          text-sm text-white focus:border-[#8a4fff] transition-colors"
                        >
                          <option value="all">All Types</option>
                          <option value="skin withdraw bot">Skin Withdraw Bot</option>
                          <option value="sticker craft bot">Sticker Craft Bot</option>
                        </select>
                      </motion.div>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Content Sections */}
        <div className="bg-[#1a0b2e]/50 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-[#8a4fff]/10 p-4 sm:p-6">
          {activeSection === 'users' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <h2 className="text-lg sm:text-xl font-bold text-white">Users Management</h2>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                  <span className="text-xs sm:text-sm text-white bg-[#8a4fff]  rounded-lg  px-3 py-2">
                    Total Users: {users.length}
                  </span>
                 
                </div>
              </div>

              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <div className="min-w-full inline-block align-middle">
                  <div className="overflow-hidden">
                    <table className="min-w-full divide-y divide-[#8a4fff]/10">
                      <thead>
                        <tr className="text-left border-b border-[#8a4fff]/20">
                          <th className="px-6 py-4 text-xs sm:text-sm font-medium text-gray-400">User</th>
                          <th className="px-6 py-4 text-xs sm:text-sm font-medium text-gray-400">User ID</th>
                          <th className="px-6 py-4 text-xs sm:text-sm font-medium text-gray-400">IP</th>
                          <th className="px-6 py-4 text-xs sm:text-sm font-medium text-gray-400">Subscription</th>
                          <th className="px-6 py-4 text-xs sm:text-sm font-medium text-gray-400">End Date</th>
                          <th className="px-6 py-4 text-xs sm:text-sm font-medium text-gray-400">Days Left</th>
                          <th className="px-6 py-4 text-xs sm:text-sm font-medium text-gray-400">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#8a4fff]/10">
                        {filterUsers(users).map((user) => {
                          // Calculate days left
                          const endDate = user.subscription_end_date ? new Date(user.subscription_end_date) : null;
                          const daysLeft = endDate ? Math.ceil((endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0;
                          
                          return (
                            <tr key={user.id} className="group">
                              <td className="px-6 py-4">
                                <div className="flex items-center space-x-3">
                                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#8a4fff]/10 flex items-center justify-center">
                                    <span className="text-[#8a4fff] text-sm sm:text-base font-medium">
                                      {user.username.charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                  <div>
                                    <p className="text-sm sm:text-base text-white font-medium">{user.username}</p>
                                    <p className="text-xs sm:text-sm text-gray-400">{user.email}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className="text-xs sm:text-sm text-gray-400">{user.id}</span>
                              </td>
                              <td className="px-6 py-4">
                                <span className="text-xs sm:text-sm text-gray-400">{user.ip_address || 'N/A'}</span>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center space-x-2">
                                  {user.current_subscription_id ? (
                                    <>
                                      <Crown className="w-3 h-3 sm:w-4 sm:h-4 text-[#8a4fff]" />
                                      <span className="text-xs sm:text-sm text-gray-300">
                                        {user.subscription_name || 'Active Subscription'}
                                      </span>
                                    </>
                                  ) : (
                                    <span className="text-xs sm:text-sm text-gray-400">No subscription</span>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center space-x-2">
                                  {endDate ? (
                                    <>
                                      <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-[#8a4fff]" />
                                      <span className="text-xs sm:text-sm text-gray-300">
                                        {endDate.toLocaleDateString()}
                                      </span>
                                    </>
                                  ) : (
                                    <span className="text-xs sm:text-sm text-gray-400">N/A</span>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                {daysLeft > 0 ? (
                                  <span className="text-xs sm:text-sm text-green-400">{daysLeft} days</span>
                                ) : (
                                  <span className="text-xs sm:text-sm text-red-400">Expired</span>
                                )}
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() => setSelectedUser(user)}
                                    className="p-1.5 sm:p-2 text-gray-400 hover:text-white hover:bg-[#8a4fff]/10 
                                    rounded-lg transition-colors"
                                    title="View Details"
                                  >
                                    <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'orders' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <h2 className="text-lg sm:text-xl font-bold text-white">Orders Overview</h2>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                  <span className="text-xs sm:text-sm text-gray-400">
                    Total Orders: {orders.length}
                  </span>
                  <div className="flex items-center space-x-2 bg-[#8a4fff]  rounded-lg  px-3 py-2">
                    <BarChart2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#FFFFFF]" />
                    <span className="text-xs sm:text-sm text-white">
                      Total Revenue: €{orders.reduce((sum, order) => sum + (order.total_amount || order.amount), 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <div className="min-w-full inline-block align-middle">
                  <div className="overflow-hidden">
                    <table className="min-w-full divide-y divide-[#8a4fff]/10">
                      <thead>
                        <tr className="text-left border-b border-[#8a4fff]/20">
                          <th className="px-6 py-4 text-xs sm:text-sm font-medium text-gray-400">Order ID</th>
                          <th className="px-6 py-4 text-xs sm:text-sm font-medium text-gray-400">User</th>
                          <th className="px-6 py-4 text-xs sm:text-sm font-medium text-gray-400">IP</th>
                          <th className="px-6 py-4 text-xs sm:text-sm font-medium text-gray-400">Subscription</th>
                          <th className="px-6 py-4 text-xs sm:text-sm font-medium text-gray-400">Amount</th>
                          <th className="px-6 py-4 text-xs sm:text-sm font-medium text-gray-400">Buy Date</th>
                          <th className="px-6 py-4 text-xs sm:text-sm font-medium text-gray-400">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#8a4fff]/10">
                        {filterOrders(orders).map((order) => (
                          <tr key={order.id} className="group">
                            <td className="px-6 py-4">
                              <span className="text-xs sm:text-sm text-gray-300">{order.id}</span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col">
                                <span className="text-xs sm:text-sm text-gray-300">{order.users?.username || 'Unknown'}</span>
                                <span className="text-xs text-gray-400">{order.users?.email || 'Unknown'}</span>
                                <span className="text-xs text-gray-500">ID: {order.user_id}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-xs sm:text-sm text-gray-400">{order.users?.ip_address || 'N/A'}</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-xs sm:text-sm text-gray-300">{order.subscription_name}</span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-2">
                                <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 text-[#8a4fff]" />
                                <span className="text-xs sm:text-sm text-gray-300">€{(order.total_amount || order.amount).toFixed(2)}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-2">
                                <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-[#8a4fff]" />
                                <span className="text-xs sm:text-sm text-gray-300">
                                  {new Date(order.created_at).toLocaleDateString()}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                order.status === 'completed'
                                  ? 'bg-green-500/20 text-green-400'
                                  : 'bg-yellow-500/20 text-yellow-400'
                              }`}>
                                {order.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'bot-config' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-white">Bot Configurations</h2>
                  <p className="text-xs sm:text-sm text-gray-400 mt-1">Manage and monitor bot configurations</p>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-xs sm:text-sm text-white bg-[#8a4fff] rounded-lg px-3 py-2">
                    Total Configs: {botConfigs.length}
                  </span>
                </div>
              </div>

              {/* Users with Bot Configs List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from(new Set(botConfigs.map(config => config.user_id)))
                  .map(userId => {
                    const userConfigs = botConfigs.filter(config => config.user_id === userId);
                    const user = userConfigs[0]?.users;
                    if (!user) return null;

                    // Check if this user matches the search query
                    const userEmail = user.email?.toLowerCase() || '';
                    const username = user.username?.toLowerCase() || '';
                    const matchesSearch = 
                      userEmail.includes(searchQuery.toLowerCase()) ||
                      username.includes(searchQuery.toLowerCase()) ||
                      userId.toLowerCase().includes(searchQuery.toLowerCase());

                    // Check if any of the user's configs match the filters
                    const hasMatchingConfigs = userConfigs.some(config => {
                      const matchesStatus = filters.botConfig.status === 'all' || config.status === filters.botConfig.status;
                      const matchesType = filters.botConfig.type === 'all' || config.bot_type === filters.botConfig.type;
                      return matchesStatus && matchesType;
                    });

                    if ((searchQuery && !matchesSearch) || !hasMatchingConfigs) return null;

                    return (
                      <div
                        key={userId}
                        onClick={() => setSelectedBotConfigUser(user)}
                        className="bg-[#1a0b2e]/50 backdrop-blur-sm rounded-xl border border-[#8a4fff]/10 p-4 cursor-pointer hover:bg-[#1a0b2e]/70 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#8a4fff] to-[#6a2dcf] flex items-center justify-center shadow-lg shadow-[#8a4fff]/20">
                            <span className="text-lg font-medium text-white">
                              {user.username.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-white">{user.username}</h3>
                            <p className="text-xs text-gray-400">{user.email}</p>
                            <p className="text-xs text-gray-500">ID: {userConfigs[0].user_id}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-[#8a4fff]">
                                {userConfigs.length} {userConfigs.length === 1 ? 'Config' : 'Configs'}
                              </span>
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                userConfigs.some(config => config.status === 'active')
                                  ? 'bg-green-500/20 text-green-400'
                                  : 'bg-gray-500/20 text-gray-400'
                              }`}>
                                {userConfigs.some(config => config.status === 'active') ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default AdminDashboard 