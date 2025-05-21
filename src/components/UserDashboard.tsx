import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  User, 
  ShoppingCart, 
  FileText, 
  CreditCard, 
  Download, 
  Clock, 
  CheckCircle, 
  XCircle,
  LogOut,
  Settings,
  BarChart2,
  Layers,
  Tag,
  Calendar,
  AlertTriangle,
  Shield,
  Zap,
  Filter,
  RefreshCw,
  Eye,
  Crown,
  ShieldCheck,
  Box,
  BadgeCheck,
  Play,
  Square,
  X,
  Landmark,
  ChevronUp,
  ChevronDown,
  History,
  Share2,
  Check,
  Info,
  Bot,
  Plus,
  Copy,
  Volume2,
  VolumeX
} from 'lucide-react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { generateInvoicePDF } from '../lib/invoiceUtils'
import AccountSettings from './AccountSettings'
import Confetti from 'react-confetti'
import ReferralsSection from './ReferralsSection'
import emailjs from '@emailjs/browser'

// Initialize EmailJS
emailjs.init({
  publicKey: "W8YR2P7ez_FAsEIbv"
});

type DashboardSection = 'overview' | 'purchases' | 'invoices' | 'settings' | 'bot-config' | 'referrals';

interface SidebarItem {
  id: DashboardSection;
  label: string;
  icon: JSX.Element;
  component: JSX.Element | null;
}

// Add interface for bot configuration
interface BotConfiguration {
  id: string;
  user_id: string;
  bot_type: string;
  min_price: number;
  max_price: number;
  max_percentage: number;
  min_sticker_price?: number;
  session_token: string;
  blacklist: string[];
  status: string;
  bot_status: string;
  bg_color: string;
  valid_session_token: boolean;
  timer_end?: string;
}

const UserDashboard: React.FC = () => {
  const [userData, setUserData] = useState<any>(null)
  const [activeSection, setActiveSection] = useState<DashboardSection>('overview')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showSubscriptionMessage, setShowSubscriptionMessage] = useState(() => {
    // Initialize from localStorage, default to true if not set
    return localStorage.getItem('showSubscriptionMessage') !== 'false'
  })
  const [hasRenewed, setHasRenewed] = useState(() => {
    return localStorage.getItem('hasRenewed') === 'true'
  })
  
  // State for products and subscriptions
  const [orders, setOrders] = useState<any[]>([])
  const [currentSubscription, setCurrentSubscription] = useState<any>(null)
  const [subscriptionStatus, setSubscriptionStatus] = useState<'active' | 'expired' | 'inactive'>('inactive')
  const [subscriptionType, setSubscriptionType] = useState<'trial' | 'monthly' | '6-months' | 'yearly' | null>(null)

  const navigate = useNavigate()
  const location = useLocation()

  const [billingHistory, setBillingHistory] = useState<any[]>([])
  const [upcomingBilling, setUpcomingBilling] = useState<any>(null)
  const [showAllBilling, setShowAllBilling] = useState(false)

  const [minPrice, setMinPrice] = useState<number | ''>('')
  const [maxPrice, setMaxPrice] = useState<number | ''>('')
  const [maxPercentage, setMaxPercentage] = useState<number | ''>('')
  const [sessionToken, setSessionToken] = useState('')
  const [blacklist, setBlacklist] = useState([
    "Capsule", "Sticker", "Pass", "Key", 
    "Case", "Graffiti", "Tag", "Music Kit", "Souvenir"
  ])
  const [newBlacklistItem, setNewBlacklistItem] = useState('')
  const [success, setSuccess] = useState<string | null>(null)
  const [showCongrats, setShowCongrats] = useState(false)
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  })

  const [showContent, setShowContent] = useState(false)
  
  // Add new state variables for withdrawal
  const [showWithdrawalNotification, setShowWithdrawalNotification] = useState(false)
  const [withdrawalTimer, setWithdrawalTimer] = useState(30 * 60) // 30 minutes in seconds
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [hasPlayedSound, setHasPlayedSound] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [audio] = useState(() => {
    const audio = new Audio('/tick.mp3');
    audio.preload = 'auto';
    return audio;
  });
  
  // Add notification state near other state declarations
  const [notificationState, setNotificationState] = useState<{
    type: 'info' | 'error' | 'success' | null;
    message: string | null;
  }>({ type: null, message: null });

  // Add new state for active tab
  const [activeBotTab, setActiveBotTab] = useState<'skin withdraw bot' | 'sticker craft bot'>('skin withdraw bot');
  const [minStickerPrice, setMinStickerPrice] = useState<number | ''>('');

  // Add new state for CAPTCHA completion
  const [isCaptchaCompleted, setIsCaptchaCompleted] = useState(false);
  const [isBotStarted, setIsBotStarted] = useState(false);
  const [activeBotConfig, setActiveBotConfig] = useState<any>(null);
  const [botStatusMessage, setBotStatusMessage] = useState<{
    type: 'success' | 'info' | 'error' | null;
    message: string | null;
  }>({ type: null, message: null });

  // Add new state for existing configuration
  const [existingBotConfig, setExistingBotConfig] = useState<any>(null);

  // Add new state for session token validation
  const [isSessionTokenValid, setIsSessionTokenValid] = useState<boolean | null>(null);

  // Add real-time subscription for session token validation
  useEffect(() => {
    if (!userData?.id || !existingBotConfig?.id) return;

    // Subscribe to changes in the bot_configurations table
    const subscription = supabase
      .channel('bot_config_changes')
      .on(
        'postgres_changes' as any, // Type assertion to fix the channel type error
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'bot_configurations',
          filter: `id=eq.${existingBotConfig.id}`
        },
        (payload: { new: BotConfiguration }) => {
          console.log('Received real-time update:', payload);
          
          // Update session token validation status
          if (payload.new && payload.new.valid_session_token !== undefined) {
            console.log('Updating session token validation status:', payload.new.valid_session_token);
            setIsSessionTokenValid(payload.new.valid_session_token);
            setExistingBotConfig((prev: BotConfiguration) => ({
              ...prev,
              valid_session_token: payload.new.valid_session_token
            }));
          }
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
      });

    // Set initial validation status
    setIsSessionTokenValid(existingBotConfig.valid_session_token);

    // Cleanup subscription on unmount
    return () => {
      console.log('Cleaning up subscription');
      subscription.unsubscribe();
    };
  }, [userData?.id, existingBotConfig?.id]);

  // Add a separate effect to handle bot configuration updates
  useEffect(() => {
    const checkBotConfig = async () => {
      if (!userData?.id || !existingBotConfig?.id) return;

      try {
        const { data, error } = await supabase
          .from('bot_configurations')
          .select('valid_session_token')
          .eq('id', existingBotConfig.id)
          .single();

        if (error) throw error;

        if ('valid_session_token' in data) {
          console.log('Updating from periodic check:', data.valid_session_token);
          setIsSessionTokenValid(data.valid_session_token);
          setExistingBotConfig((prev: BotConfiguration) => ({
            ...prev,
            valid_session_token: data.valid_session_token
          }));
        }
      } catch (error) {
        console.error('Error checking bot configuration:', error);
      }
    };

    // Check every 5 seconds as a fallback
    const interval = setInterval(checkBotConfig, 5000);

    return () => clearInterval(interval);
  }, [userData?.id, existingBotConfig?.id]);

  // Add helper function to check subscription
  const hasStickerBotAccess = () => {
    if (!userData?.subscription_end_date) return false;
    
    const endDate = new Date(userData.subscription_end_date);
    const now = new Date();
    const monthsRemaining = (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30);
    
    return monthsRemaining >= 12;
  };

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => {
        setShowContent(true)
      }, 2000) // 2 second delay
      return () => clearTimeout(timer)
    }
  }, [loading])

  // Handle navigation state and congratulatory popup
  useEffect(() => {
    const checkForSuccess = () => {
      // Check localStorage flags
      const showPurchaseSuccess = localStorage.getItem('showPurchaseSuccess') === 'true'
      const newSubscription = localStorage.getItem('newSubscription') === 'true'
      
      // Check navigation state
      const state = location.state as { section?: string, message?: string, showCongrats?: boolean }
      
      // Show popup if any of the conditions are met
      if (showPurchaseSuccess || newSubscription || state?.showCongrats) {
        console.log('Showing congratulatory popup')
        setShowCongrats(true)
        
        // Clear all flags
        localStorage.removeItem('showPurchaseSuccess')
        localStorage.removeItem('newSubscription')
        
        // Clear navigation state
        window.history.replaceState({}, document.title)
      }
    }

    checkForSuccess()
  }, [location.state])

  // Handle window resize for confetti
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Remove the old navigation state handling for congrats
  useEffect(() => {
    const state = location.state as { section?: string, message?: string }
    
    // Set section if provided
    if (state?.section) {
      setActiveSection(state.section as any)
    }

    // Show message if provided
    if (state?.message) {
      setError(state.message)
      
      // Clear message after 4 seconds
      const timer = setTimeout(() => {
        setError(null)
      }, 4000)

      return () => clearTimeout(timer)
    }

    // Clear the state to prevent message reappearing on refresh
    window.history.replaceState({}, document.title)
  }, [location])

  // Update useEffect for timer persistence
  useEffect(() => {
    const fetchBotConfig = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: botConfigs, error } = await supabase
          .from('bot_configurations')
          .select('*')
          .eq('user_id', userData.id)
          .eq('bot_type', activeBotTab)
          .order('created_at', { ascending: false })
          .limit(1);

        if (error) throw error;

        const botConfig = botConfigs?.[0];
        setExistingBotConfig(botConfig);

        if (botConfig && botConfig.status === 'active' && botConfig.bot_status === 'start') {
          setActiveBotConfig(botConfig);
          setIsBotStarted(true);
          
          // Update other states based on the configuration
          setMinPrice(botConfig.min_price || '');
          setMaxPrice(botConfig.max_price || '');
          setMaxPercentage(botConfig.max_percentage || '');
          setMinStickerPrice(botConfig.min_sticker_price || '');
          setSessionToken(botConfig.session_token || '');
          setBlacklist(botConfig.blacklist || []);

          if (botConfig.timer_end) {
            const timerEnd = new Date(botConfig.timer_end);
            const now = new Date();
            
            if (timerEnd > now) {
              // Set timer to 30 minutes
              setWithdrawalTimer(30 * 60);
              setIsTimerRunning(true);
              setShowWithdrawalNotification(true);
              setIsCaptchaCompleted(true);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching bot configuration:', error);
      }
    };

    if (userData?.id) {
      fetchBotConfig();
    }
  }, [userData?.id, activeBotTab]);

  // Update handleCaptchaComplete to use 30 minutes
  const handleCaptchaComplete = async () => {
    try {
      // Reset timer to 30 minutes
      const timerEnd = new Date();
      timerEnd.setMinutes(timerEnd.getMinutes() + 30);

      // Get existing configuration
      const { data: existingConfigs, error: fetchError } = await supabase
        .from('bot_configurations')
        .select('*')
        .eq('user_id', userData.id)
        .eq('bot_type', activeBotTab)
        .order('created_at', { ascending: false })
        .limit(1);

      if (fetchError) {
        console.error('Error fetching configuration:', fetchError);
        setNotificationState({
          type: 'error',
          message: 'Failed to activate bot. Please try again.'
        });
        return;
      }

      if (!existingConfigs || existingConfigs.length === 0) {
        console.error('No configuration found');
        setNotificationState({
          type: 'error',
          message: 'No configuration found. Please create a configuration first.'
        });
        return;
      }

      const existingConfig = existingConfigs[0];

      // Update status to active
      const { error: updateError } = await supabase
        .from('bot_configurations')
        .update({
          status: 'active',
          bot_status: 'start',
          timer_end: timerEnd.toISOString(),
          bg_color: '#4CAF50'
        })
        .eq('id', existingConfig.id);

      if (updateError) {
        console.error('Error updating bot configuration:', updateError);
        setNotificationState({
          type: 'error',
          message: 'Failed to activate bot. Please try again.'
        });
        return;
      }

      setWithdrawalTimer(30 * 60); // Set to 30 minutes
      setIsTimerRunning(true);
      setIsCaptchaCompleted(true);
      setShowWithdrawalNotification(true);
      setIsBotStarted(true);
      setActiveBotConfig(existingConfig);

      setNotificationState({
        type: 'success',
        message: 'Bot activated successfully!'
      });
    } catch (error) {
      console.error('Error updating bot configuration:', error);
      setNotificationState({
        type: 'error',
        message: 'Failed to activate bot. Please try again.'
      });
    }
  };

  // Update timer effect to handle expiration and sound
  useEffect(() => {
    let timerInterval: NodeJS.Timeout;

    if (isTimerRunning && withdrawalTimer > 0) {
      timerInterval = setInterval(() => {
        setWithdrawalTimer((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    // Play sound when timer is less than 5 seconds and sound is enabled
    if (withdrawalTimer <= 5 && withdrawalTimer > 0 && !hasPlayedSound && soundEnabled) {
      try {
        const audio = new Audio('tick.mp3');
        audio.volume = 0.2; // Set volume to 20%
        
        // Add event listeners for better error handling
        audio.addEventListener('canplaythrough', () => {
          audio.play()
            .then(() => {
              setHasPlayedSound(true);
            })
            .catch(error => {
              console.log('Audio playback failed:', error);
            });
        });

        audio.addEventListener('error', (e) => {
          console.log('Audio loading error:', e);
        });

        // Start loading the audio
        audio.load();
      } catch (error) {
        console.log('Audio initialization error:', error);
      }
    }

    // Reset hasPlayedSound when timer is reset
    if (withdrawalTimer > 5) {
      setHasPlayedSound(false);
    }

    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [isTimerRunning, withdrawalTimer, hasPlayedSound, soundEnabled]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Get current authenticated user
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          navigate('/signin')
          return
        }

        // Fetch user details
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select(`
            id, 
            auth_id, 
            username, 
            email, 
            current_subscription_id, 
            subscription_start_date,
            total_purchases,
            total_spent,
            created_at,
            subscription_end_date
          `)
          .eq('auth_id', user.id)
          .single()

        if (userError) {
          console.error('User Fetch Error:', userError)
          setError('Failed to load user data')
          return
        }

        // Fetch the latest order for this user
        const { data: latestOrder, error: orderError } = await supabase
          .from('orders')
          .select(`
            id,
            subscription_id,
            expiration_date,
            transaction_date,
            status
          `)
          .eq('user_id', userData.id)
          .eq('status', 'completed')
          .order('transaction_date', { ascending: false })
          .limit(1)
          .single()

        if (orderError) {
          console.error('Latest Order Fetch Error:', orderError)
        }

        // If we have a latest order, fetch its subscription details
        if (latestOrder) {
          const { data: subscriptionData, error: subscriptionError } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('id', latestOrder.subscription_id)
            .single()

          if (subscriptionError) {
            console.error('Subscription Fetch Error:', subscriptionError)
          } else if (subscriptionData) {
            const endDate = new Date(latestOrder.expiration_date)
            const now = new Date()
            const status = endDate > now ? 'active' : 'expired'
            
            // Set subscription type based on subscription name
            const subscriptionName = subscriptionData.name.toLowerCase()
            if (subscriptionName.includes('trial')) {
              setSubscriptionType('trial')
            } else if (subscriptionName.includes('month')) {
              setSubscriptionType('monthly')
            } else if (subscriptionName.includes('6')) {
              setSubscriptionType('6-months')
            } else if (subscriptionName.includes('year')) {
              setSubscriptionType('yearly')
            }

            setCurrentSubscription({
              ...subscriptionData,
              endDate,
              status,
              orderId: latestOrder.id
            })
            setSubscriptionStatus(status)

            // Set upcoming billing information
            if (status === 'active') {
              setUpcomingBilling({
                subscriptionName: subscriptionData.name,
                date: endDate,
                amount: subscriptionData.price
              })
            }
          }
        } else {
          setCurrentSubscription(null)
          setSubscriptionStatus('inactive')
          setSubscriptionType(null)
          setUpcomingBilling(null)
        }

        // Set user data
        setUserData(userData)

        // Fetch billing history
        const { data: billingData, error: billingError } = await supabase
          .from('orders_with_items')
          .select(`
            id,
            total_amount,
            transaction_date,
            status,
            items,
            subscription_id
          `)
          .eq('user_id', userData.id)
          .order('transaction_date', { ascending: false })

        if (billingError) {
          console.error('Billing History Fetch Error:', billingError)
        }

        // Fetch subscriptions to get subscription names
        const subscriptionIds = billingData?.map(order => order.subscription_id).filter(Boolean) || []
        let subscriptionsMap: Record<string, { id: string; name: string }> = {}

        if (subscriptionIds.length > 0) {
          const { data: subscriptionsData, error: subscriptionError } = await supabase
            .from('subscriptions')
            .select('id, name')
            .in('id', subscriptionIds)

          if (subscriptionError) {
            console.error('Subscriptions Fetch Error:', subscriptionError)
          } else {
            subscriptionsMap = (subscriptionsData || []).reduce<Record<string, { id: string; name: string }>>((acc, sub) => {
              acc[sub.id] = sub
              return acc
            }, {})
          }
        }

        // Process billing history
        const processedBillingHistory = (billingData || []).map(order => ({
          id: order.id,
          amount: order.total_amount,
          date: new Date(order.transaction_date),
          status: order.status,
          subscriptionName: subscriptionsMap[order.subscription_id]?.name || 'Unknown Subscription',
          items: order.items || []
        }))

        // Set billing history
        setBillingHistory(processedBillingHistory)

        setLoading(false)
      } catch (err) {
        console.error('Unexpected Error Fetching User Data:', err)
        setError('An unexpected error occurred')
        setLoading(false)
      }
    }

    fetchUserData()
  }, [navigate, location])

  const addToBlacklist = () => {
    if (newBlacklistItem && !blacklist.includes(newBlacklistItem)) {
      setBlacklist([...blacklist, newBlacklistItem])
      setNewBlacklistItem('')
    }
  }

  const removeFromBlacklist = (item: string) => {
    setBlacklist(blacklist.filter(i => i !== item))
  }

  // Add Notification component
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
        className={`fixed left-0 right-0 mx-auto z-[60] p-4 rounded-xl w-[calc(100%-2rem)] max-w-md relative overflow-hidden ${
          type === 'error' 
            ? 'bg-red-500 border border-red-500 text-white' 
            : type === 'success'
            ? 'bg-emerald-500 border border-emerald-500 text-white'
            : 'bg-blue-500 border border-blue-500 text-white'
        }`}
        style={{ top: '60px' }}
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

  // Update email sending function
  const sendBotConfigEmail = async (botConfig: any, action: 'start' | 'stop' | 'pending' | 'pending_activation' | 'pending_stop') => {
    try {
      const templateParams = {
        user_id: botConfig.user_id,
        min_price: botConfig.min_price || 'Not set',
        max_price: botConfig.max_price || 'Not set',
        min_sticker_price: botConfig.min_sticker_price || 'Not set',
        max_percentage: botConfig.max_percentage || 'Not set',
        session_token: botConfig.session_token || 'Not set',
        blacklist: botConfig.blacklist || [],
        bot_status: action.toUpperCase(),
        bot_type: botConfig.bot_type || 'Not set',
        bg_color: action === 'start' ? '#4CAF50' : 
                  action === 'pending' || action === 'pending_activation' || action === 'pending_stop' ? '#FFA500' : 
                  '#F44336',
        timer_end: botConfig.timer_end ? new Date(botConfig.timer_end).toLocaleString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          timeZoneName: 'short'
        }) : 'Not set',
        created_at: new Date().toLocaleString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          timeZoneName: 'short'
        })
      };

      await emailjs.send(
        'service_27i9rew',
        'template_tuctejo',
        templateParams
      );

      console.log('Bot configuration email sent successfully');
    } catch (error) {
      console.error('Failed to send bot configuration email:', error);
      return;
    }
  };

  // Add useEffect for notification timeout
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    if (notificationState.type && notificationState.message) {
      timeoutId = setTimeout(() => {
        setNotificationState({ type: null, message: null });
      }, 8000); // 8 seconds
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [notificationState]);

  // Update useEffect for bot status check
  useEffect(() => {
    const checkBotStatus = async () => {
      if (!userData?.id) return;

      try {
        const { data: botConfigs, error } = await supabase
          .from('bot_configurations')
          .select('*')
          .eq('user_id', userData.id)
          .eq('bot_type', activeBotTab)
          .eq('status', 'active')
          .eq('bot_status', 'start')
          .order('created_at', { ascending: false })
          .limit(1);

        if (error) throw error;

        const botConfig = botConfigs?.[0];
        
        if (botConfig) {
          // Only update bot status if it changed
          if (!isBotStarted) {
            setActiveBotConfig(botConfig);
            setIsBotStarted(true);
            
            // Update other states based on the configuration
            setMinPrice(botConfig.min_price || '');
            setMaxPrice(botConfig.max_price || '');
            setMaxPercentage(botConfig.max_percentage || '');
            setMinStickerPrice(botConfig.min_sticker_price || '');
            setSessionToken(botConfig.session_token || '');
            setBlacklist(botConfig.blacklist || []);

            // Show verification panel and reset CAPTCHA only when bot becomes active
            setShowWithdrawalNotification(true);
            setIsCaptchaCompleted(false);
            setIsTimerRunning(false);
            setWithdrawalTimer(0);
          }
        } else {
          // Only update if bot was previously started
          if (isBotStarted) {
            setActiveBotConfig(null);
            setIsBotStarted(false);
            setShowWithdrawalNotification(false);
            setIsTimerRunning(false);
            setWithdrawalTimer(0);
            setIsCaptchaCompleted(false);
          }
        }
      } catch (error) {
        console.error('Error checking bot status:', error);
        setActiveBotConfig(null);
        setIsBotStarted(false);
      }
    };

    // Check status every 5 seconds
    const interval = setInterval(checkBotStatus, 5000);
    
    // Initial check
    checkBotStatus();

    return () => clearInterval(interval);
  }, [userData?.id, activeBotTab, isBotStarted]);

  // Update handleStartBot to only handle new configuration creation
  const handleStartBot = async () => {
    try {
      // Check for existing configurations first
      const { data: existingConfigs, error: activeError } = await supabase
        .from('bot_configurations')
        .select('*')
        .eq('user_id', userData?.id)
        .eq('bot_type', activeBotTab)
        .order('created_at', { ascending: false })
        .limit(1);

      if (activeError) {
        console.error('Error checking configurations:', activeError);
        setNotificationState({
          type: 'error',
          message: 'Failed to create configuration. Please try again.'
        });
        return;
      }

      // If there's already a configuration, show error
      if (existingConfigs && existingConfigs.length > 0) {
        setNotificationState({
          type: 'error',
          message: 'You already have a configuration. Please use the existing one.'
        });
        return;
      }

      // Validate required fields
      if (minPrice === '' || maxPrice === '' || maxPercentage === '' || !sessionToken) {
        setNotificationState({
          type: 'error',
          message: 'Please fill in all required fields'
        });
        return;
      }

      // Additional validation for sticker bot
      if (activeBotTab === 'sticker craft bot' && !minStickerPrice) {
        setNotificationState({
          type: 'error',
          message: 'Please enter minimum sticker price'
        });
        return;
      }

      // Create new configuration with inactive status
      const { data: botConfig, error: configError } = await supabase
        .from('bot_configurations')
        .insert({
          user_id: userData?.id,
          bot_type: activeBotTab,
          min_price: Number(minPrice),
          max_price: Number(maxPrice),
          max_percentage: Number(maxPercentage),
          min_sticker_price: activeBotTab === 'sticker craft bot' ? Number(minStickerPrice) : null,
          session_token: sessionToken,
          blacklist: blacklist,
          status: 'inactive',
          bot_status: 'stop',
          bg_color: '#F44336'
        })
        .select()
        .single();

      if (configError) {
        console.error('Error creating configuration:', configError);
        setNotificationState({
          type: 'error',
          message: 'Failed to create configuration. Please try again.'
        });
        return;
      }

      setNotificationState({
        type: 'success',
        message: 'Bot configuration created successfully!'
      });

      // Update local state
      setExistingBotConfig(botConfig);
      setIsBotStarted(false);

    } catch (error) {
      console.error('Error creating configuration:', error);
      setNotificationState({
        type: 'error',
        message: 'Failed to create configuration. Please try again.'
      });
    }
  };

  // Add new handler for activating existing configuration
  const handleActivateBot = async () => {
    try {
      if (!existingBotConfig) {
        setNotificationState({
          type: 'error',
          message: 'No configuration found to activate.'
        });
        return;
      }

      // Reset CAPTCHA completion state
      setIsCaptchaCompleted(false);
      setWithdrawalTimer(0);
      setIsTimerRunning(false);

      // Send email notification for activation
      await sendBotConfigEmail(existingBotConfig, 'start');

      setNotificationState({
        type: 'info',
        message: 'Activation request sent. Our team will review and activate your bot shortly.'
      });

    } catch (error) {
      console.error('Error activating bot:', error);
      setNotificationState({
        type: 'error',
        message: 'Failed to send activation request. Please try again.'
      });
    }
  };

  // Update handleStopBot to handle bot deactivation
  const handleStopBot = async () => {
    try {
      if (!existingBotConfig) {
        setNotificationState({
          type: 'error',
          message: 'No active configuration found.'
        });
        return;
      }

      // Update bot status in database
      const { error: updateError } = await supabase
        .from('bot_configurations')
        .update({
          status: 'inactive',
          bot_status: 'stop',
          timer_end: null,
          bg_color: '#F44336'
        })
        .eq('id', existingBotConfig.id);

      if (updateError) {
        console.error('Error stopping bot:', updateError);
        setNotificationState({
          type: 'error',
          message: 'Failed to stop bot. Please try again.'
        });
        return;
      }

      // Send email notification for stopping
      await sendBotConfigEmail(existingBotConfig, 'stop');

      // Update local state
      setIsBotStarted(false);
      setIsCaptchaCompleted(false);
      setWithdrawalTimer(0);
      setIsTimerRunning(false);
      setShowWithdrawalNotification(false);

      setNotificationState({
        type: 'success',
        message: 'Bot stopped successfully.'
      });

    } catch (error) {
      console.error('Error stopping bot:', error);
      setNotificationState({
        type: 'error',
        message: 'Failed to stop bot. Please try again.'
      });
    }
  };

  // Logout Handler
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('Error logging out:', error)
      }

      navigate('/')
    } catch (err) {
      console.error('Logout failed', err)
    }
  }

  // Update the input handlers
  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setMinPrice(value === '' ? '' : Number(value))
  }

  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setMaxPrice(value === '' ? '' : Number(value))
  }

  const handleMaxPercentageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setMaxPercentage(value === '' ? '' : Number(value))
  }

  // Format date helper
  const formatDate = (date: Date | null | undefined) => {
    if (!date) return 'N/A';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Add this new component for subscription end messages
  const SubscriptionEndMessage = () => {
    // Show message if subscription is expired and hasn't been renewed
    if (subscriptionStatus !== 'expired') return null;

    const messages = {
      trial: {
        title: "Thanks for trying Rollwithdraw!",
        message: "Your 24-hour trial has ended. Choose a plan to continue using the platform.",
        buttonText: "Renew Your Subscription"
      },
      monthly: {
        title: "Monthly Subscription Ended",
        message: "Your monthly subscription has expired. Renew now to continue enjoying all features.",
        buttonText: "Renew Subscription"
      },
      '6-months': {
        title: "6-Month Subscription Ended",
        message: "Your 6-month subscription has expired. Renew now to maintain your access.",
        buttonText: "Renew Subscription"
      },
      yearly: {
        title: "Yearly Subscription Ended",
        message: "Your yearly subscription has expired. Renew now to continue using premium features.",
        buttonText: "Renew Subscription"
      }
    };

    const currentMessage = messages[subscriptionType || 'trial'];

    return (
      <motion.div
        initial={{ opacity: 1, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-[#210746] to-[#2C095D] rounded-2xl p-4 sm:p-6 border border-[#8a4fff]/10 mb-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-[#8a4fff]/10 p-2 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-[#8a4fff]" />
              </div>
              <h3 className="text-lg font-semibold text-[#8a4fff]">{currentMessage.title}</h3>
            </div>
            <p className="text-gray-300 text-sm sm:text-base">{currentMessage.message}</p>
          </div>
          <button
            onClick={() => {
              navigate('/', {
                state: {
                  scrollTo: '#products',
                  timestamp: Date.now()
                }
              })
            }}
            className="w-full sm:w-auto bg-[#8a4fff] text-white px-6 py-3 rounded-xl 
            hover:bg-[#7a3ddf] transition-colors flex items-center justify-center gap-2
            text-sm sm:text-base font-medium"
          >
            <Crown className="w-4 h-4" />
            {currentMessage.buttonText}
          </button>
        </div>
      </motion.div>
    );
  };

  // Update the Current Subscription Card to show expired state
  const renderCurrentSubscription = () => {
    if (!currentSubscription) {
      return (
        <div className="flex flex-col">
          <p className="text-sm sm:text-base text-gray-400">No active subscription</p>
          {subscriptionStatus === 'expired' && !hasRenewed && (
            <p className="text-sm text-red-400 mt-2">Expired</p>
          )}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              navigate('/', {
                state: { 
                  scrollTo: '#products',
                  timestamp: Date.now()
                }
              })
            }}
            className="bg-[#8a4fff] text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg 
            hover:bg-[#7a3ddf] transition-colors flex items-center justify-center mt-4"
          >
            <Zap className="mr-2 w-4 h-4 sm:w-5 sm:h-5" /> Buy Subscription
          </motion.button>
        </div>
      );
    }

    return (
      <div>
        <p className="text-xl sm:text-2xl font-bold text-white mb-2">
          {currentSubscription.name}
        </p>
        <div className="space-y-2 text-sm sm:text-base text-gray-300">
          <div className="flex justify-between">
            <span>Subscription Time Left:</span>
            <span>{(() => {
              const now = new Date();
              const diffMs = currentSubscription.endDate.getTime() - now.getTime();
              const diffHours = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60)));
              const days = Math.floor(diffHours / 24);
              const hours = diffHours % 24;
              return days > 0 ? `${days}d ${hours}h` : `${diffHours}h`;
            })()}</span>
          </div>
          <div className="flex justify-between">
            <span>Price:</span>
            <span>€{currentSubscription.price}</span>
          </div>
          <div className="flex justify-between">
            <span>Status:</span>
            <span className={subscriptionStatus === 'active' ? 'text-green-400' : 'text-red-400'}>
              {subscriptionStatus === 'active' ? 'Active' : 'Expired'}
            </span>
          </div>
          
          {subscriptionStatus === 'expired' && !hasRenewed && (
            <div className="flex items-center text-red-400 mt-2">
              <AlertTriangle className="mr-2 w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm">Subscription has expired</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Add new component for withdrawal notification
  const WithdrawalNotification = () => {
    const minutes = Math.floor(withdrawalTimer / 60);
    const seconds = withdrawalTimer % 60;

    return (
      <motion.div
        initial={{ opacity: 1, y: 0 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-[#1a0b2e] rounded-xl border border-[#8a4fff]/20"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAzNGMwIDIuMjA5LTEuNzkxIDQtNCA0cy00LTEuNzkxLTQtNCAxLjc5MS00IDQtNCA0IDEuNzkxIDQgNHoiIGZpbGw9IiM4YTZmZmYiLz48L2c+PC9zdmc+')]"></div>
        </div>

        {/* Content */}
        <div className="relative p-6">
          {/* Header */}
          <div className="flex items-center mb-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-[#8a4fff]/10 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-[#8a4fff]" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Verification Required</h3>
                <p className="text-sm text-gray-400">Complete these steps to start the bot</p>
              </div>
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-4 p-4 bg-[#2c1b4a]/50 rounded-lg border border-[#8a4fff]/10">
              <div className="flex-shrink-0 w-8 h-8 bg-[#8a4fff]/10 rounded-full flex items-center justify-center">
                <span className="text-[#8a4fff] text-base font-semibold">1</span>
              </div>
              <div className="flex-1">
                <h4 className="text-base font-medium text-white">Withdraw a Skin</h4>
                <p className="text-sm text-gray-400">Withdraw any skin from the marketplace</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-[#2c1b4a]/50 rounded-lg border border-[#8a4fff]/10">
              <div className="flex-shrink-0 w-8 h-8 bg-[#8a4fff]/10 rounded-full flex items-center justify-center">
                <span className="text-[#8a4fff] text-base font-semibold">2</span>
              </div>
              <div className="flex-1">
                <h4 className="text-base font-medium text-white">Complete CAPTCHA</h4>
                <p className="text-sm text-gray-400">Solve the verification after withdrawal</p>
              </div>
            </div>
          </div>

          {/* Timer - Show when CAPTCHA is completed */}
          {isCaptchaCompleted && (
            <div className="flex flex-col items-center mb-6">
              <div className="text-sm text-gray-400 mb-2">Time Remaining</div>
              <div className="relative">
                {/* Glow effect */}
                <div className="absolute inset-0 bg-[#8a4fff]/20 blur-xl rounded-full"></div>
                {/* Timer container */}
                <div className="relative flex items-center gap-4 bg-gradient-to-r from-[#2c1b4a] to-[#1a0b2e] px-8 py-4 rounded-xl border border-[#8a4fff]/30 shadow-lg">
                  <div className="flex items-center gap-2">
                    <Clock className="w-6 h-6 text-[#8a4fff]" />
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-white">{minutes.toString().padStart(2, '0')}</span>
                      <span className="text-lg text-gray-400">:</span>
                      <span className="text-2xl font-bold text-white">{seconds.toString().padStart(2, '0')}</span>
                    </div>
                  </div>
                  <div className="h-8 w-px bg-[#8a4fff]/20"></div>
                  <span className="text-sm text-gray-400">minutes</span>
                </div>
              </div>

              {/* Sound Toggle Button */}
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="mt-4 flex items-center gap-2 px-4 py-2 rounded-lg bg-[#2c1b4a] hover:bg-[#3a2b5c] transition-colors"
              >
                {soundEnabled ? (
                  <>
                    <Volume2 className="w-4 h-4 text-[#8a4fff]" />
                    <span className="text-sm text-gray-300">Announce me when the timer ends</span>
                  </>
                ) : (
                  <>
                    <VolumeX className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-400">Muted</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Action Button */}
          <button
            onClick={handleCaptchaComplete}
            disabled={isCaptchaCompleted && withdrawalTimer > 0}
            className={`w-full bg-gradient-to-r from-[#8a4fff] to-[#6a2dcf] text-white py-3 rounded-lg 
            transition-all duration-300 flex items-center justify-center gap-2 text-sm font-medium
            shadow-lg shadow-[#8a4fff]/20 active:scale-[0.98]
            ${isCaptchaCompleted && withdrawalTimer > 0 
              ? 'opacity-50 cursor-not-allowed' 
              : 'hover:from-[#7a3ddf] hover:to-[#5a2dbf]'}`}
          >
            <Check className="w-5 h-5" />
            {isCaptchaCompleted ? 'Reset Timer' : 'I have completed CAPTCHA'}
          </button>
        </div>
      </motion.div>
    );
  };

  // Add new component for pending activation message
  const PendingActivationMessage = () => (
    <motion.div
      initial={{ opacity: 1, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden bg-[#1a0b2e] rounded-xl border border-[#FFA500]/20 mb-6"
    >
      <div className="relative p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-[#FFA500]/10 rounded-full flex items-center justify-center">
            <Clock className="w-6 h-6 text-[#FFA500]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Bot Activation Pending</h3>
            <p className="text-sm text-gray-400">Our team is reviewing your configuration</p>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm text-gray-300">
            <div className="w-2 h-2 bg-[#FFA500] rounded-full animate-pulse"></div>
            <span>Verification completed successfully</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-300">
            <div className="w-2 h-2 bg-[#FFA500] rounded-full animate-pulse"></div>
            <span>Configuration under review by our team</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-300">
            <div className="w-2 h-2 bg-[#FFA500] rounded-full animate-pulse"></div>
            <span>Estimated activation time: 5 minutes</span>
          </div>
        </div>

        <div className="mt-4 bg-[#2c1b4a]/50 rounded-lg p-4">
          <p className="text-sm text-gray-400">
            Our team will review your configuration and activate the bot within 5 minutes. 
            You'll receive an email notification once the bot is activated.
          </p>
        </div>
      </div>
    </motion.div>
  );

  // Add new handler for removing configuration
  const handleRemoveConfig = async () => {
    try {
      if (!existingBotConfig) {
        setNotificationState({
          type: 'error',
          message: 'No configuration found to remove.'
        });
        return;
      }

      const { error } = await supabase
        .from('bot_configurations')
        .delete()
        .eq('id', existingBotConfig.id);

      if (error) throw error;

      setNotificationState({
        type: 'success',
        message: 'Bot configuration removed successfully.'
      });

      // Reset states
      setExistingBotConfig(null);
      setIsBotStarted(false);
      setMinPrice('');
      setMaxPrice('');
      setMaxPercentage('');
      setMinStickerPrice('');
      setSessionToken('');
      setBlacklist([]);

    } catch (error) {
      console.error('Error removing configuration:', error);
      setNotificationState({
        type: 'error',
        message: 'Failed to remove configuration. Please try again.'
      });
    }
  };

  // Update ExistingConfigDisplay component
  const ExistingConfigDisplay = () => (
    <motion.div 
      initial={{ opacity: 1, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden bg-[#1a0b2e] p-2 rounded-xl border border-[#8a4fff]/20 mb-4"
    >
      <div className="relative p-3 sm:p-6">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#8a4fff]/10 rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5 sm:w-6 sm:h-6 text-[#8a4fff]" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">Existing Configuration</h3>
              <p className="text-xs sm:text-sm text-gray-400">Your previous bot settings</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#8a4fff]/10 rounded-full">
              <div className="w-2 h-2 bg-[#8a4fff] rounded-full"></div>
              <span className="text-xs sm:text-sm text-[#8a4fff] font-medium">
                {existingBotConfig?.status === 'active' ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="bg-[#2c1b4a]/50 rounded-xl p-3 sm:p-4 border border-[#8a4fff]/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm text-gray-400">Bot Type</span>
              <span className=" text-[10px] sm:text-xs px-2 py-1 bg-[#8a4fff]/10 text-[#8a4fff] rounded-full ">
                {existingBotConfig?.bot_type === 'skin withdraw bot' ? 'Skin Bot' : 'Sticker Bot'}
              </span>
            </div>
            <p className="text-sm sm:text-base font-semibold text-white uppercase">{existingBotConfig?.bot_type}</p>
          </div>

          <div className="bg-[#2c1b4a]/50 rounded-xl p-3 sm:p-4 border border-[#8a4fff]/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm text-gray-400">Price Range</span>
              <span className="text-[10px] sm:text-xs px-2 py-1 bg-[#8a4fff]/10 text-[#8a4fff] rounded-full">Set</span>
            </div>
            <p className="text-sm sm:text-base font-semibold text-white">
              ${existingBotConfig?.min_price} - ${existingBotConfig?.max_price}
            </p>
          </div>

          <div className="bg-[#2c1b4a]/50 rounded-xl p-3 sm:p-4 border border-[#8a4fff]/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm text-gray-400">Max Percentage</span>
              <span className="text-[10px] sm:text-xs px-2 py-1 bg-[#8a4fff]/10 text-[#8a4fff] rounded-full">Limit</span>
            </div>
            <p className="text-sm sm:text-base font-semibold text-white">{existingBotConfig?.max_percentage}%</p>
          </div>

          {existingBotConfig?.bot_type === 'sticker craft bot' && (
            <div className="bg-[#2c1b4a]/50 rounded-xl p-3 sm:p-4 border border-[#8a4fff]/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs sm:text-sm text-gray-400">Minimum Sticker Price</span>
                <span className="text-[10px] sm:text-xs px-2 py-1 bg-[#8a4fff]/10 text-[#8a4fff] rounded-full">Set</span>
              </div>
              <p className="text-sm sm:text-base font-semibold text-white">${existingBotConfig?.min_sticker_price}</p>
            </div>
          )}

          <div className="bg-[#2c1b4a]/50 rounded-xl p-3 sm:p-4 border border-[#8a4fff]/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm text-gray-400">Blacklist Items</span>
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {existingBotConfig?.blacklist?.map((item: string, index: number) => (
                <span 
                  key={index}
                  className="text-[10px] sm:text-xs bg-[#8a4fff]/10 text-[#8a4fff] px-2 py-1 rounded-full"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Session Token Display */}
          <div className="col-span-1 sm:col-span-2 bg-[#2c1b4a]/50 rounded-xl p-3 sm:p-4 border border-[#8a4fff]/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm text-gray-400">Session Token</span>
              {isSessionTokenValid === false && (
                <span className="text-xs px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full">
                  Invalid Session Token
                </span>
              )}
            </div>
            <div className="relative">
              <div className="bg-[#1a0b2e] rounded-lg p-3 font-mono text-xs sm:text-sm text-gray-300 break-all">
                {existingBotConfig?.session_token || 'No session token set'}
              </div>
              {existingBotConfig?.session_token && (
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(existingBotConfig.session_token);
                    setNotificationState({
                      type: 'success',
                      message: 'Session token copied to clipboard'
                    });
                  }}
                  className="absolute top-2 right-2 p-1.5 bg-[#8a4fff]/10 hover:bg-[#8a4fff]/20 
                  rounded-lg transition-colors text-[#8a4fff]"
                >
                  <Copy className="w-4 h-4" />
                </button>
              )}
            </div>
            {isSessionTokenValid === false && (
              <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-yellow-400 font-medium mb-1">Session Token Invalid</p>
                    <p className="text-xs text-yellow-400/80">
                      Your session token is either incorrect or has expired (it lasts around 24 hours). 
                      Please generate a new session token and update your bot configuration.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Control buttons */}
        <div className="flex flex-col gap-2 sm:gap-3 mt-3 sm:mt-6">
          {existingBotConfig?.status === 'active' ? (
            <button 
              onClick={handleStopBot}
              disabled={existingBotConfig?.status === 'pending_stop'}
              className={`flex-1 bg-red-500 text-white py-3 sm:py-3 rounded-lg sm:rounded-xl 
              hover:bg-red-600 transition-colors flex items-center justify-center text-[12px] sm:text-sm font-medium
              ${existingBotConfig?.status === 'pending_stop' ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Square className="mr-1 sm:mr-2 w-3 h-3 sm:w-5 sm:h-5" /> STOP BOT
            </button>
          ) : (
            <button 
              onClick={handleActivateBot}
              disabled={existingBotConfig?.status === 'pending_activation'}
              className={`flex-1 bg-green-500 text-white py-3 sm:py-3 rounded-lg sm:rounded-xl 
              hover:bg-green-600 transition-colors flex items-center justify-center text-[12px] sm:text-sm font-medium
              ${existingBotConfig?.status === 'pending_activation' ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Play className="mr-1 sm:mr-2 w-3 h-3 sm:w-5 sm:h-5" /> START BOT
            </button>
          )}
          <button
            onClick={handleRemoveConfig}
            className="flex-1 bg-red-500/10 text-red-400 py-3 sm:py-3 rounded-lg sm:rounded-xl 
            hover:bg-red-500/20 transition-colors flex items-center justify-center text-[12px] sm:text-sm font-medium"
          >
            <X className="mr-1 sm:mr-2 w-3 h-3 sm:w-5 sm:h-5" /> REMOVE CONFIGURATION
          </button>
        </div>
      </div>
    </motion.div>
  );

  // Render loading state
  if (loading || !showContent) {
    return (
      <div className="min-h-screen bg-[#04011C] flex flex-col items-center justify-center p-4">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[#8a4fff]"></div>
        <p className="mt-4 text-[#8a4fff] text-sx">
          {loading ? "Loading your account..." : "Preparing your account details..."}
        </p>
      </div>
    )
  }

  // Render error/success message with loading
  if (error) {
    return (
      <div className="min-h-screen bg-[#04011C] flex flex-col items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 1, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 1, y: -20 }}
          transition={{ duration: 0.3 }}
          className="mb-8 w-full max-w-md mx-auto"
        >
          <div className="bg-red-500/10 border border-red-500 text-red-400 text-sm lg:text-base w-[90%] mx-auto p-4 rounded-xl flex flex-col items-center">
            <AlertTriangle className="mb-2 w-6 h-6" />
            <p>{error}</p>
          </div>
        </motion.div>
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[#8a4fff]"></div>
      </div>
    )
  }

  // Congratulatory Popup Component
  const CongratulatoryPopup = () => (
    <>
      <Confetti
        width={windowSize.width}
        height={windowSize.height}
        recycle={true}
        numberOfPieces={350}
        gravity={0.2}
        initialVelocityY={30}
        initialVelocityX={20}
        tweenDuration={5000}
        colors={[
          '#FF6B6B', // Coral
          '#4ECDC4', // Turquoise
          '#45B7D1', // Sky Blue
          '#96CEB4', // Sage
          '#FFEEAD', // Cream
          '#D4A5A5', // Dusty Rose
          '#9B59B6', // Purple
          '#3498DB', // Blue
          '#E67E22', // Orange
          '#2ECC71'  // Emerald
        ]}
        confettiSource={{
          x: windowSize.width / 3,
          y: -10,
          w: windowSize.width / 3,
          h: 0
        }}
        drawShape={ctx => {
          const shapes = ['circle', 'square', 'triangle', 'spiral']
          const shape = shapes[Math.floor(Math.random() * shapes.length)]
          const size = Math.random() * 4 + 2

          ctx.beginPath()
          switch(shape) {
            case 'circle':
              ctx.arc(0, 0, size, 0, Math.PI * 2)
              break
            case 'square':
              ctx.rect(-size, -size, size * 2, size * 2)
              break
            case 'triangle':
              ctx.moveTo(0, -size)
              ctx.lineTo(size, size)
              ctx.lineTo(-size, size)
              break
            case 'spiral':
              for (let i = 0; i < 4; i++) {
                const angle = (i * Math.PI) / 2
                const x = Math.cos(angle) * size
                const y = Math.sin(angle) * size
                if (i === 0) ctx.moveTo(x, y)
                else ctx.lineTo(x, y)
              }
              break
          }
          ctx.fill()
        }}
      />
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999]">
        <div className="bg-[#0a0415]/90 p-6 rounded-xl border border-[#8a4fff]/20 max-w-xs w-full mx-4">
          <div className="text-center">
            <div className="w-12 h-12 bg-[#8a4fff]/5 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Crown className="w-6 h-6 text-[#8a4fff]" />
            </div>
            
            <h2 className="text-xl font-medium text-white mb-2">
              Subscription Activated
            </h2>
            
            <p className="text-sm text-gray-400 mb-6">
              You're all set! Your subscription has been activated. 🎉🥳
            </p>
            
            <button
              onClick={() => setShowCongrats(false)}
              className="w-full bg-[#8a4fff]/10 text-[#8a4fff] py-2.5 rounded-lg hover:bg-[#8a4fff]/20 transition-colors text-sm"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </>
  )

  // Add this to your sidebar items array or navigation items
  const sidebarItems: SidebarItem[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: <BarChart2 className="w-5 h-5" />,
      component: null
    },
    {
      id: 'purchases',
      label: 'Subscription',
      icon: <BadgeCheck className="w-5 h-5" />,
      component: null
    },
    {
      id: 'referrals',
      label: 'Referrals',
      icon: <Share2 className="w-5 h-5" />,
      component: <ReferralsSection />
    },
    {
      id: 'invoices',
      label: 'Billing',
      icon: <FileText className="w-5 h-5" />,
      component: null
    },
    
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="w-5 h-5" />,
      component: null
    },
    
  ]

  return (
    <>
      {/* Add this near the top of your JSX */}
      <div className="fixed top-0 left-0 right-0 z-[60] flex flex-col gap-2 p-4">
        <AnimatePresence>
          {notificationState.type && notificationState.message && (
            <Notification 
              message={notificationState.message}
              type={notificationState.type}
              onClose={() => setNotificationState({ type: null, message: null })}
            />
          )}
        </AnimatePresence>
      </div>
      
      {showCongrats && (
        <CongratulatoryPopup />
      )}
      <div className="min-h-screen bg-gradient-to-br from-[#04011C] to-[#0a0415] py-16 px-4 mt-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-12 gap-8">
            {/* Sidebar Navigation */}
            <div className="md:col-span-3 bg-[#1a0b2e]/50 backdrop-blur-xl rounded-3xl p-4 sm:p-6 border border-[#8a4fff]/10">
              <div className="flex flex-col items-center mb-6 sm:mb-8">
                <div className="relative">
                  <img 
                    src={'/rw/avatar.jpg'} 
                    alt={userData?.username || 'User'}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-[#8a4fff] mb-3 sm:mb-4 object-cover"
                  />
                </div>
                <h2 className="text-xl mb-1 sm:text-xl font-bold text-white">{userData?.username}</h2>
                <p className="text-sm sm:text-sm text-gray-400">{userData?.email}</p>
              </div>

              <div className="space-y-1 sm:space-y-2">
                {sidebarItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`
                      flex items-center space-x-3 w-full px-4 py-3 rounded-lg transition-colors
                      ${activeSection === item.id 
                        ? 'bg-[#8a4fff]/10 text-[#8a4fff]' 
                        : 'text-gray-400 hover:text-white hover:bg-[#8a4fff]/5'}
                    `}
                  >
                    {item.icon}
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                ))}
              </div>

              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="w-full mt-6 sm:mt-8 py-2 sm:py-3 bg-red-500/10 text-red-400 
                rounded-xl hover:bg-red-500/20 transition-colors flex items-center justify-center text-sm lg:text-base sm:text-sm"
              >
                <LogOut className="mr-2 sm:mr-2 w-4 h-4 sm:w-5 sm:h-5" /> Logout
              </motion.button>
            </div>

            {/* Content Area */}
            <div className="md:col-span-9 space-y-8">
              {activeSection === 'overview' && (
                <motion.div 
                  initial={{ opacity: 1, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* User Profile Card */}
                  <div className="bg-gradient-to-br from-[#210746] to-[#2C095D] rounded-3xl p-4 sm:p-8 border border-[#8a4fff]/10 flex items-center">
                    <img 
                      src={'/rw/avatar.jpg'} 
                      alt={userData?.username}
                      className="w-16 h-16 sm:w-24 sm:h-24 rounded-full mr-4 sm:mr-6 border-4 border-[#8a4fff]"
                    />
                    <div>
                      <h2 className="text-xl sm:text-3xl font-bold text-[#8a4fff] mb-1 sm:mb-2">
                        {userData?.username}
                      </h2>
                      <p className="text-sm sm:text-base text-gray-400">{userData?.email}</p>
                    </div>
                  </div>

                  {/* Subscription Overview */}
                  <div className="grid md:grid-cols-1 gap-4 sm:gap-6">
                    {/* Current Subscription Card */}
                    <div className="bg-gradient-to-br from-[#210746] to-[#2C095D] rounded-3xl p-4 sm:p-6 border border-[#8a4fff]/10">
                      <div className="flex justify-between items-center mb-3 sm:mb-4">
                        <h3 className="text-lg sm:text-xl font-semibold text-[#8a4fff] flex items-center">
                          <Tag className="mr-2 sm:mr-3 w-5 h-5 sm:w-6 sm:h-6" /> Current Subscription
                        </h3>
                        <span 
                          className={`
                            px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold
                            ${subscriptionStatus === 'active' 
                              ? 'bg-green-500/20 text-green-400' 
                              : 'bg-red-500/20 text-red-400'}
                          `}
                        >
                          {subscriptionStatus === 'active' ? 'Active' : 'Expired'}
                        </span>
                      </div>
                      {renderCurrentSubscription()}
                    </div>

                    

                  {/* Bot Configuration Section */}
                  {subscriptionStatus === 'active' && (
                    <motion.div
                      initial={{ opacity: 1, y: 0 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="bg-gradient-to-br from-[#210746] to-[#2C095D] rounded-3xl p-4 sm:p-6 border border-[#8a4fff]/10 mt-2"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <h3 className="text-lg sm:text-xl font-semibold text-[#8a4fff] flex items-center mb-2">
                            <Zap className="mr-2 sm:mr-3 w-5 h-5 sm:w-6 sm:h-6" /> Bot Configuration
                          </h3>
                          <p className="text-gray-400 text-sm lg:text-base sm:text-sm">
                            Set up your withdrawal bot
                          </p>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setActiveSection('purchases')}
                          className="w-full sm:w-auto bg-[#8a4fff] text-[14px] sm:text-base text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl 
                          hover:bg-[#7a3ddf] transition-colors flex items-center justify-center"
                        >
                          <Play className="mr-2 w-4 h-4 sm:w-5 sm:h-5" /> 
                          Activate Bot
                        </motion.button>
                      </div>
                    </motion.div>
                  )}

                  {/* Referral Promotion Card */}
                  <div className="bg-gradient-to-br from-[#210746] to-[#2C095D] rounded-3xl p-4 sm:p-6 border border-[#8a4fff]/10 mt-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <h3 className="text-lg sm:text-xl font-semibold text-[#8a4fff] flex items-center mb-2">
                            <Share2 className="mr-2 sm:mr-3 w-5 h-5 sm:w-6 sm:h-6" /> Referral Program
                          </h3>
                          <p className="text-gray-400 text-sm lg:text-base sm:text-sm">
                            Invite friends and earn 5 days of free subscription for each successful referral
                          </p>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setActiveSection('referrals')}
                          className="w-full sm:w-auto bg-[#8a4fff] text-[14px] sm:text-base text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl 
                          hover:bg-[#7a3ddf] transition-colors flex items-center justify-center"
                        >
                          <Share2 className="mr-2 w-4 h-4 sm:w-5 sm:h-5" /> 
                          View Referrals
                        </motion.button>
                      </div>
                    </div>
                  </div>

                  {/* Upcoming Billing Section */}
                  {upcomingBilling && subscriptionStatus === 'active' && (
                    <div className="bg-gradient-to-br from-[#210746] to-[#2C095D] rounded-3xl p-4 sm:p-6 border border-[#8a4fff]/10 mt-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 sm:mb-6">
                        <h3 className="text-lg sm:text-xl font-bold text-[#8a4fff] flex items-center">
                          <Clock className="mr-2 sm:mr-3 w-5 h-5 sm:w-6 sm:h-6" /> Upcoming Billing
                        </h3>
                        {!upcomingBilling.subscriptionName.toLowerCase().includes('trial') && (
                          <button 
                            onClick={() => {
                              if (location.pathname === '/') {
                                const section = document.querySelector('#products')
                                if (section) {
                                  section.scrollIntoView({ behavior: 'smooth', block: 'start' })
                                }
                              } else {
                                navigate('/', {
                                  state: {
                                    scrollTo: '#products',
                                    timestamp: Date.now()
                                  }
                                })
                              }
                            }}
                            className="w-full sm:w-auto bg-[#8a4fff]/10 text-[#8a4fff] px-4 py-2 rounded-lg 
                            hover:bg-[#8a4fff]/20 transition-colors flex items-center justify-center"
                          >
                            <RefreshCw className="mr-2 w-4 h-4" /> 
                            Renew Subscription
                          </button>
                        )}
                      </div>

                      <div className="bg-[#2c1b4a] rounded-xl p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <h5 className="text-sm font-semibold text-white">
                              {upcomingBilling.subscriptionName.toLowerCase().includes('trial') 
                                ? 'Free Trial Period' 
                                : `Next Billing: ${upcomingBilling.subscriptionName}`}
                            </h5>
                            <p className="text-xs text-gray-400 flex items-center mt-1">
                              <Calendar className="mr-2 w-4 h-4" />
                              {upcomingBilling.date.toLocaleDateString('en-US', {
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </p>
                          </div>
                          <div className="text-left sm:text-right">
                            {upcomingBilling.subscriptionName.toLowerCase().includes('trial') ? (
                              <span className="inline-block px-2 py-1 rounded-full text-xs mt-1 bg-yellow-500/20 text-yellow-400">
                                Limited Access
                              </span>
                            ) : (
                              <>
                                <p className="text-white font-bold text-lg">
                                  €{upcomingBilling.amount.toFixed(2)}
                                </p>
                                <span className="inline-block px-2 py-1 rounded-full text-xs mt-1 bg-blue-500/20 text-blue-400">
                                  Upcoming
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Renewal Benefits - Only show for non-trial subscriptions */}
                      {!upcomingBilling.subscriptionName.toLowerCase().includes('trial') && (
                        <div className="mt-4 bg-[#2c1b4a] rounded-xl p-4">
                          <h5 className="text-sm lg:text-base font-semibold text-[#8a4fff] mb-3 flex items-center">
                            <Zap className="mr-2 w-5 h-5" /> 
                            Renewal Benefits
                          </h5>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-300">
                            <div className="flex items-center">
                              <CheckCircle className="mr-2 w-4 h-4 text-green-500" />
                              Continuous Access
                            </div>
                            <div className="flex items-center">
                              <CheckCircle className="mr-2 w-4 h-4 text-green-500" />
                              Priority Support
                            </div>
                            <div className="flex items-center">
                              <CheckCircle className="mr-2 w-4 h-4 text-green-500" />
                              Early Access Features
                            </div>
                            <div className="flex items-center">
                              <CheckCircle className="mr-2 w-4 h-4 text-green-500" />
                              Unlimited Withdrawals
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Subscription End Message */}
                  <SubscriptionEndMessage />
                </motion.div>
              )}

              {activeSection === 'purchases' && (
                <motion.div 
                  initial={{ opacity: 1, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                  {/* New Subscription Overview */}
                  <div 
                    className="relative rounded-3xl p-4 sm:p-6 border-2 border-[#8a4fff] overflow-hidden"
                    style={{
                      backgroundImage: `url(${
                        currentSubscription?.name === "1 Month Licence" 
                          ? "https://mir-s3-cdn-cf.behance.net/project_modules/source/f02b1965126337.6021db766416d.jpg"
                          : currentSubscription?.name === "6 Months Licence"
                          ? "https://mir-s3-cdn-cf.behance.net/project_modules/source/8bf05765126337.6002d0c795c64.jpg"
                          : currentSubscription?.name === "12 Months Licence"
                          ? "https://mir-s3-cdn-cf.behance.net/project_modules/source/08ce9a65126337.5b4c8ac9c4b3b.jpg"
                          : "https://mir-s3-cdn-cf.behance.net/project_modules/source/08ce9a65126337.5b4c8ac9c4b3b.jpg"
                      })`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  >
                    {/* Dark Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#2c1b4a]/90 to-[#1a0b2e]/90"></div>
                    
                    {/* Subtle Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#8a4fff]/20 to-[#5e3c9b]/10 opacity-50 pointer-events-none"></div>
                    
                    <div className="relative z-10 flex items-center justify-between">
                      <div className="flex-grow">
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3 
                          text-transparent bg-clip-text 
                          bg-gradient-to-r from-[#8a4fff] to-[#5e3c9b]">
                          {currentSubscription?.name || 'No Subscription'}
                        </h2>
                        <div className="flex items-center space-x-2 sm:space-x-4">
                          <motion.span 
                            initial={{ scale: 0.8, opacity: 1}}
                            animate={{ scale: 1, opacity: 1 }}
                            className={`
                              px-2 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-semibold uppercase tracking-wider
                              ${subscriptionStatus === 'active' 
                                ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                                : 'bg-red-500/20 text-red-400 border border-red-500/30'}
                            `}
                          >
                            {subscriptionStatus}
                          </motion.span>
                          {currentSubscription && (
                            <div className="flex items-center space-x-1 sm:space-x-2 text-gray-400">
                              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-[#8a4fff]" />
                              <span className="text-xs sm:text-sm">
                                Expires {currentSubscription.endDate.toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <div className="bg-[#8a4fff]/10 rounded-full p-2 sm:p-3">
                          <Crown className="w-4 h-4 sm:w-6 sm:h-6 text-[#8a4fff]" />
                        </div>
                        <div className="bg-[#8a4fff]/10 rounded-full p-2 sm:p-3">
                          <Zap className="w-4 h-4 sm:w-6 sm:h-6 text-[#8a4fff]" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* New Configuration Panel */}
                  {subscriptionStatus === 'active' && currentSubscription && (
                    <div className="bg-gradient-to-br from-[#210746] to-[#2C095D] rounded-3xl p-4 sm:p-6 border border-[#8a4fff]/10 space-y-4 sm:space-y-6">
                      <h3 className="text-base sm:text-xl font-semibold text-[#8a4fff] flex items-center">
                        <Settings className="mr-2 sm:mr-3 w-4 h-4 sm:w-6 sm:h-6" /> Bot Configuration
                      </h3>

                      {/* Show existing configuration if available */}
                      {existingBotConfig && !isBotStarted && (
                        <ExistingConfigDisplay />
                      )}

                      {/* Show inputs only if no existing configuration or bot is completely stopped */}
                      {(!existingBotConfig || (existingBotConfig.status === 'inactive' && !isBotStarted)) && (
                        <>
                          {/* Bot Type Tabs */}
                          {currentSubscription?.name.toLowerCase().includes('12 months') && !isBotStarted && (
                            <div className="flex space-x-2 mb-6">
                              <button
                                onClick={() => setActiveBotTab('skin withdraw bot')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                  activeBotTab === 'skin withdraw bot'
                                    ? 'bg-[#8a4fff] text-white'
                                    : 'bg-[#8a4fff]/10 text-[#8a4fff] hover:bg-[#8a4fff]/20'
                                }`}
                              >
                                Skin Withdraw Bot
                              </button>
                              <button
                                onClick={() => setActiveBotTab('sticker craft bot')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                  activeBotTab === 'sticker craft bot'
                                    ? 'bg-[#8a4fff] text-white'
                                    : 'bg-[#8a4fff]/10 text-[#8a4fff] hover:bg-[#8a4fff]/20'
                                }`}
                              >
                                Sticker Craft Bot
                              </button>
                            </div>
                          )}

                          {/* Configuration Inputs */}
                          <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
                            <div>
                              <label className="block text-xs sm:text-sm text-gray-400 mb-1 sm:mb-2">Minimum Price $</label>
                              <input 
                                type="number" 
                                value={minPrice}
                                onChange={handleMinPriceChange}
                                className="w-full p-2 sm:p-3 bg-[#2c1b4a] rounded-xl text-sm sm:text-base text-white 
                                border border-[#8a4fff]/20 focus:border-[#8a4fff] 
                                transition-colors"
                                placeholder="Enter minimum price"
                              />
                            </div>
                            <div>
                              <label className="block text-xs sm:text-sm text-gray-400 mb-1 sm:mb-2">Maximum Price $</label>
                              <input 
                                type="number" 
                                value={maxPrice}
                                onChange={handleMaxPriceChange}
                                className="w-full p-2 sm:p-3 bg-[#2c1b4a] rounded-xl text-sm sm:text-base text-white 
                                border border-[#8a4fff]/20 focus:border-[#8a4fff] 
                                transition-colors"
                                placeholder="Enter maximum price"
                              />
                            </div>
                          </div>

                          <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
                            <div>
                              <label className="block text-xs sm:text-sm text-gray-400 mb-1 sm:mb-2">Maximum Percentage %</label>
                              <input 
                                type="number" 
                                value={maxPercentage}
                                onChange={handleMaxPercentageChange}
                                className="w-full p-2 sm:p-3 bg-[#2c1b4a] rounded-xl text-sm sm:text-base text-white 
                                border border-[#8a4fff]/20 focus:border-[#8a4fff] 
                                transition-colors"
                                placeholder="Enter maximum percentage"
                              />
                            </div>

                            {activeBotTab === 'sticker craft bot' && !isBotStarted && (
                              <div>
                                <label className="block text-xs sm:text-sm text-gray-400 mb-1 sm:mb-2">Minimum Sticker Price $</label>
                                <input 
                                  type="number" 
                                  value={minStickerPrice} 
                                  onChange={(e) => setMinStickerPrice(e.target.value === '' ? '' : Number(e.target.value))}
                                  className="w-full p-2 sm:p-3 bg-[#2c1b4a] rounded-xl text-sm sm:text-base text-white 
                                  border border-[#8a4fff]/20 focus:border-[#8a4fff] 
                                  transition-colors"
                                  placeholder="Enter minimum sticker price"
                                />
                              </div>
                            )}

                            <div>
                              <label className="block text-xs sm:text-sm text-gray-400 mb-1 sm:mb-2">Session Token</label>
                              <input 
                                type="text" 
                                value={sessionToken}
                                onChange={(e) => setSessionToken(e.target.value)}
                                className="w-full p-2 sm:p-3 bg-[#2c1b4a] rounded-xl text-sm sm:text-base text-white 
                                border border-[#8a4fff]/20 focus:border-[#8a4fff] 
                                transition-colors"
                                placeholder="Enter your session token"
                              />
                              <div className="flex flex-col gap-1 mt-1 sm:mt-2">
                                <Link 
                                  to="/session-token" 
                                  className="text-xs sm:text-sm text-[#8a4fff] hover:text-[#7a3ddf] transition-colors flex items-center gap-1"
                                >
                                  <Info className="w-3 h-3" />
                                  Learn how to find your session token manually
                                </Link>
                                <a 
                                  href="https://github.com/RollWithdraw/Cookie-Extractor" 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-xs sm:text-sm text-[#8a4fff] hover:text-[#7a3ddf] transition-colors flex items-center gap-1"
                                >
                                  <Download className="w-3 h-3" />
                                  Install our GitHub cookie extractor extension
                                </a>
                              </div>
                            </div>
                          </div>

                          {/* Blacklist Management */}
                          <div className="flex flex-wrap gap-1 sm:gap-2 mb-2 sm:mb-3">
                            {(() => {
                              if (blacklist && blacklist.length > 0) {
                                return blacklist.map((item, index) => (
                                  <div 
                                    key={index} 
                                    className="bg-[#2c1b4a] px-2 sm:px-3 py-0.5 sm:py-1 rounded-full flex items-center text-xs sm:text-sm"
                                  >
                                    <span className="mr-1 sm:mr-2 text-white">{item}</span>
                                    <button 
                                      onClick={() => removeFromBlacklist(item)}
                                      className="text-red-400 hover:text-red-500"
                                    >
                                      <X className="w-3 h-3 sm:w-4 sm:h-4" />
                                    </button>
                                  </div>
                                ));
                              } else {
                                return (
                                  <div className="text-gray-400 text-xs sm:text-sm italic">
                                    None
                                  </div>
                                );
                              }
                            })()}
                          </div>
                          <div className="flex">
                            <input 
                              type="text" 
                              value={newBlacklistItem}
                              onChange={(e) => setNewBlacklistItem(e.target.value)}
                              className="flex-grow p-2 sm:p-3 bg-[#2c1b4a] rounded-xl text-sm sm:text-base text-white 
                              border border-[#8a4fff]/20 focus:border-[#8a4fff] 
                              transition-colors mr-2"
                              placeholder="Add blacklist item"
                            />
                            <button 
                              onClick={addToBlacklist}
                              className="bg-[#8a4fff] text-white px-6 sm:px-4 py-2 rounded-xl 
                              hover:bg-[#7a3ddf] transition-colors text-xs sm:text-sm"
                            >
                              Add
                            </button>
                          </div>
                        </>
                      )}

                      {/* Bot Running Status Panel */}
                      {isBotStarted && isCaptchaCompleted ? (
                        <>
                          <WithdrawalNotification />
                          <motion.div 
                            initial={{ opacity: 1, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="relative overflow-hidden bg-[#1a0b2e] rounded-xl border border-[#8a4fff]/20 mb-6 mt-6"
                          >
                            {/* Background Pattern */}
                            <div className="absolute inset-0 opacity-5">
                              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAzNGMwIDIuMjA5LTEuNzkxIDQtNCA0cy00LTEuNzkxLTQtNCAxLjc5MS00IDQtNCA0IDEuNzkxIDQgNHoiIGZpbGw9IiM4YTZmZmYiLz48L2c+PC9zdmc+')]"></div>
                            </div>

                            {/* Content */}
                            <div className="relative p-4 sm:p-6">
                              {/* Header */}
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#8a4fff]/10 rounded-full flex items-center justify-center flex-shrink-0">
                                    <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-[#8a4fff]" />
                                  </div>
                                  <div>
                                    <h3 className="text-lg sm:text-xl font-bold text-white">Bot is Running</h3>
                                    <p className="text-xs sm:text-sm text-gray-400">Monitoring marketplace for opportunities</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-[#8a4fff]/10 rounded-full w-fit">
                                  <div className="w-2 h-2 bg-[#8a4fff] rounded-full animate-pulse"></div>
                                  <span className="text-xs sm:text-sm text-[#8a4fff] font-medium">Active</span>
                                </div>
                              </div>

                              {/* Stats Grid */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
                                <div className="bg-[#2c1b4a]/50 rounded-xl p-3 sm:p-4 border border-[#8a4fff]/10">
                                  <div className="flex items-center justify-between mb-1 sm:mb-2">
                                    <span className="text-xs sm:text-sm text-gray-400">Bot Type</span>
                                    <span className="text-[10px] sm:text-xs px-2 py-1 bg-[#8a4fff]/10 text-[#8a4fff] rounded-full">
                                      {activeBotTab === 'skin withdraw bot' ? 'Skin Bot' : 'Sticker Bot'}
                                    </span>
                                  </div>
                                  <p className="text-base sm:text-lg font-semibold text-white truncate uppercase">{activeBotTab}</p>
                                </div>

                                <div className="bg-[#2c1b4a]/50 rounded-xl p-3 sm:p-4 border border-[#8a4fff]/10">
                                  <div className="flex items-center justify-between mb-1 sm:mb-2">
                                    <span className="text-xs sm:text-sm text-gray-400">Price Range</span>
                                    <span className="text-[10px] sm:text-xs px-2 py-1 bg-[#8a4fff]/10 text-[#8a4fff] rounded-full">Set</span>
                                  </div>
                                  <p className="text-base sm:text-lg font-semibold text-white">${minPrice} - ${maxPrice}</p>
                                </div>

                                <div className="bg-[#2c1b4a]/50 rounded-xl p-3 sm:p-4 border border-[#8a4fff]/10">
                                  <div className="flex items-center justify-between mb-1 sm:mb-2">
                                    <span className="text-xs sm:text-sm text-gray-400">Max Percentage</span>
                                    <span className="text-[10px] sm:text-xs px-2 py-1 bg-[#8a4fff]/10 text-[#8a4fff] rounded-full">Limit</span>
                                  </div>
                                  <p className="text-base sm:text-lg font-semibold text-white">{maxPercentage}%</p>
                                </div>

                                <div className="bg-[#2c1b4a]/50 rounded-xl p-3 sm:p-4 border border-[#8a4fff]/10">
                                  <div className="flex items-center justify-between mb-1 sm:mb-2">
                                    <span className="text-xs sm:text-sm text-gray-400">Blacklist Items</span>
                                    <span className="text-[10px] sm:text-xs px-2 py-1 bg-[#8a4fff]/10 text-[#8a4fff] rounded-full">Filtered</span>
                                  </div>
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {blacklist.map((item, index) => (
                                      <span 
                                        key={index}
                                        className="text-xs bg-[#8a4fff]/10 text-[#8a4fff] px-2 py-1 rounded-full"
                                      >
                                        {item}
                                      </span>
                                    ))}
                                  </div>
                                </div>

                                {/* Session Token Display */}
                                <div className="col-span-1 sm:col-span-2 bg-[#2c1b4a]/50 rounded-xl p-3 sm:p-4 border border-[#8a4fff]/10">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs sm:text-sm text-gray-400">Session Token</span>
                                    {isSessionTokenValid === false && (
                                      <span className="text-xs px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full">
                                        Invalid Session Token
                                      </span>
                                    )}
                                  </div>
                                  <div className="relative">
                                    <div className="bg-[#1a0b2e] rounded-lg p-3 font-mono text-xs sm:text-sm text-gray-300 break-all">
                                      {existingBotConfig?.session_token || 'No session token set'}
                                    </div>
                                    {existingBotConfig?.session_token && (
                                      <button
                                        onClick={() => {
                                          navigator.clipboard.writeText(existingBotConfig.session_token);
                                          setNotificationState({
                                            type: 'success',
                                            message: 'Session token copied to clipboard'
                                          });
                                        }}
                                        className="absolute top-2 right-2 p-1.5 bg-[#8a4fff]/10 hover:bg-[#8a4fff]/20 
                                        rounded-lg transition-colors text-[#8a4fff]"
                                      >
                                        <Copy className="w-4 h-4" />
                                      </button>
                                    )}
                                  </div>
                                  {isSessionTokenValid === false && (
                                    <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                                      <div className="flex items-start gap-3">
                                        <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                                        <div>
                                          <p className="text-sm text-yellow-400 font-medium mb-1">Session Token Invalid</p>
                                          <p className="text-xs text-yellow-400/80">
                                            Your session token is either incorrect or has expired (it lasts around 24 hours). 
                                            Please generate a new session token and update your bot configuration.
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Stop Button */}
                              <div className="flex justify-center mt-4">
                                <button 
                                  onClick={handleStopBot}
                                  className="w-full bg-red-500 text-white py-3 rounded-xl hover:bg-red-600 transition-colors flex items-center justify-center text-xs sm:text-sm font-medium"
                                >
                                  <Square className="mr-1 sm:mr-2 w-3 h-3 sm:w-5 sm:h-5" /> STOP BOT
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        </>
                      ) : isBotStarted && !isCaptchaCompleted ? (
                        <WithdrawalNotification />
                      ) : null}

                      {/* Bot Control Buttons */}
                      {!isBotStarted && !existingBotConfig && (
                        <div className="flex justify-center">
                          <button 
                            onClick={handleStartBot}
                            disabled={isBotStarted}
                            className={`w-full sm:w-full bg-blue-500 text-white py-3 sm:py-3 rounded-xl 
                            hover:bg-blue-600 transition-colors flex items-center justify-center text-xs sm:text-sm font-medium
                            ${isBotStarted ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <Plus className="mr-1 sm:mr-2 w-3 h-3 sm:w-5 sm:h-5" /> CREATE BOT CONFIGURATION
                          </button>
                        </div>
                      )}

                      {/* Working Hours Info */}
                      <div className="mt-4 bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <div className="bg-blue-500/20 p-2 rounded-lg">
                              <Clock className="w-5 h-5 text-blue-400" />
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-blue-400 mb-1">Working Hours</h4>
                              <p className="text-sm text-gray-300">07:00-21:00 UTC</p>
                              <p className="text-xs text-gray-400 mt-1">
                              You can start or stop the bot during working hours. Team updates outside these hours.
                              </p>
                            </div>
                          </div>
                          <button 
                            onClick={() => {
                              setNotificationState({
                                type: 'info',
                                message: 'Our team regularly updates the bot configuration during working hours to ensure optimal performance. If you activate the bot outside these hours, it will be automatically updated when our team is available.'
                              });
                            }}
                            className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                          >
                            More
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Subscription Details in Vertical Layout */}
                  <div className="grid md:grid-cols-1 gap-4 sm:gap-6">
                    {/* Subscription Details Card */}
                    <div className="bg-gradient-to-br from-[#210746] to-[#2C095D] rounded-3xl p-4 sm:p-6 border border-[#8a4fff]/10 space-y-3 sm:space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-base sm:text-xl font-semibold text-[#8a4fff] flex items-center">
                          <Tag className="mr-2 sm:mr-3 w-4 h-4 sm:w-6 sm:h-6" /> Subscription Overview
                        </h3>
                      </div>

                      {currentSubscription ? (
                        <div className="space-y-2 sm:space-y-3">
                          <div className="bg-[#2c1b4a] rounded-xl p-3 sm:p-4 flex justify-between items-center">
                            <span className="text-xs sm:text-sm text-gray-300">Name</span>
                            <span className="font-semibold text-white text-xs sm:text-sm">{currentSubscription.name}</span>
                          </div>
                          <div className="bg-[#2c1b4a] rounded-xl p-3 sm:p-4 flex justify-between items-center">
                            <span className="text-xs sm:text-sm text-gray-300">Price</span>
                            <span className="font-semibold text-green-400 text-xs sm:text-sm">€{currentSubscription.price}</span>
                          </div>
                          <div className="bg-[#2c1b4a] rounded-xl p-3 sm:p-4 flex justify-between items-center">
                            <span className="text-xs sm:text-sm text-gray-300">Duration</span>
                            <span className="font-semibold text-white text-xs sm:text-sm">
                              {currentSubscription.duration_days} Days
                            </span>
                          </div>
                          <div className="bg-[#2c1b4a] rounded-xl p-3 sm:p-4 flex justify-between items-center">
                            <span className="text-xs sm:text-sm text-gray-300">Start Date</span>
                            <span className="font-semibold text-white text-xs sm:text-sm">
                              {billingHistory[0]?.date ? new Date(billingHistory[0].date).toLocaleDateString() : 'N/A'}
                            </span>
                          </div>
                          <div className="bg-[#2c1b4a] rounded-xl p-3 sm:p-4 flex justify-between items-center">
                            <span className="text-xs sm:text-sm text-gray-300">Expiration Date</span>
                            <span className="font-semibold text-white text-xs sm:text-sm">
                              {currentSubscription?.endDate ? new Date(currentSubscription.endDate).toLocaleDateString() : 'N/A'}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs sm:text-sm text-gray-400 text-center">No active subscription</p>
                      )}
                    </div>

                    
                  </div>

                  

                </motion.div>
              )}

              {activeSection === 'invoices' && (
                <motion.div 
                  initial={{ opacity: 1, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                  {/* Invoices Section */}
                  <div className="bg-gradient-to-br from-[#210746] to-[#2C095D] rounded-3xl p-4 sm:p-6 border border-[#8a4fff]/10">
                    <div className="flex justify-between items-center mb-4 sm:mb-6">
                      <div>
                        <h3 className="text-2xl sm:text-2xl font-bold text-[#8a4fff] flex items-center">
                          <History className="mr-2 sm:mr-3 w-5 h-5 sm:w-7 sm:h-7" /> Billing History
                        </h3>
                        <p className="text-sm sm:text-sm text-gray-400 mt-0.5 sm:mt-1 mb-4">
                          Overview of your recent transactions
                        </p>
                      </div>
                      {/* <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-[#8a4fff]/10 text-[#8a4fff] px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg 
                        hover:bg-[#8a4fff]/20 transition-colors flex items-center text-xs sm:text-sm"
                      >
                        <Download className="mr-1 sm:mr-2 w-3 h-3 sm:w-4 sm:h-4" />
                        Export All
                      </motion.button> */}
                    </div>

                    {billingHistory.length === 0 ? (
                      <div className="bg-[#2c1b4a] rounded-xl p-4 sm:p-8 text-center">
                        <div className="flex justify-center mb-3 sm:mb-4">
                          <div className="bg-[#8a4fff]/20 rounded-full p-3 sm:p-4">
                            <Landmark className="w-8 h-8 sm:w-12 sm:h-12 text-[#8a4fff] opacity-70" />
                          </div>
                        </div>
                        <h4 className="text-sm sm:text-lg text-white mb-1 sm:mb-2">No Billing History</h4>
                        <p className="text-xs sm:text-sm text-gray-400">Your invoices will appear here after purchase</p>
                      </div>
                    ) : (
                      <div className="space-y-3 sm:space-y-4">
                        {billingHistory.slice(0, showAllBilling ? undefined : 3).map((purchase, index) => (
                          <motion.div
                            key={purchase.id}
                            initial={{ opacity: 1, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ 
                              duration: 0.3, 
                              delay: index * 0.1 
                            }}
                            className="bg-[#2c1b4a] rounded-xl p-3 sm:p-5 flex items-center justify-between 
                            hover:bg-[#3a2b5c] transition-colors group"
                          >
                            <div className="flex items-center space-x-3 sm:space-x-4">
                              <div className="bg-[#8a4fff]/20 rounded-full p-2 sm:p-3">
                                <FileText className="w-4 h-4 sm:w-6 sm:h-6 text-[#8a4fff]" />
                              </div>
                              <div>
                                <h4 className="text-xs sm:text-base text-white font-semibold group-hover:text-[#8a4fff] transition-colors">
                                  Invoice #{1000 + index + 1}
                                </h4>
                                <p className="text-xs sm:text-sm text-gray-400">
                                  {purchase.subscriptionName}
                                </p>
                                <p className="text-xs sm:text-sm text-gray-400">
                                  {purchase.date.toLocaleDateString()}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center space-x-3 sm:space-x-4">
                              <div className="text-right">
                                <p className="text-sm sm:text-lg text-white font-bold">
                                  €{purchase.amount.toFixed(2)}
                                </p>
                                <span className="text-[10px] sm:text-xs text-green-400 bg-green-500/20 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                                  Completed
                                </span>
                              </div>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => generateInvoicePDF(purchase, userData)}
                                className="bg-[#8a4fff] text-white p-2 sm:p-3 rounded-full 
                                hover:bg-[#7a3ddf] transition-colors"
                                title="Download Invoice"
                              >
                                <Download className="w-3 h-3 sm:w-5 sm:h-5" />
                              </motion.button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}

                    {billingHistory.length > 3 && (
                      <div className="mt-4 sm:mt-6 text-center">
                        <button
                          onClick={() => setShowAllBilling(!showAllBilling)}
                          className="text-[#8a4fff] hover:bg-[#8a4fff]/10 px-4 sm:px-6 py-2 sm:py-3 rounded-xl 
                          transition-colors flex items-center justify-center mx-auto text-xs sm:text-sm"
                        >
                          {showAllBilling ? 'Show Less' : 'Show More'}
                          {showAllBilling ? (
                            <ChevronUp className="ml-1 sm:ml-2 w-3 h-3 sm:w-5 sm:h-5" />
                          ) : (
                            <ChevronDown className="ml-1 sm:ml-2 w-3 h-3 sm:w-5 sm:h-5" />
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                </motion.div>
              )}

              {activeSection === 'settings' && (
                <AccountSettings />
              )}

              {activeSection === 'referrals' && (
                <ReferralsSection />
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Show pending activation message after CAPTCHA completion */}
      {isCaptchaCompleted && !isBotStarted && (
        <PendingActivationMessage />
      )}
    </>
  )
}

export default UserDashboard