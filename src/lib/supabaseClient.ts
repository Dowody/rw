import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase credentials')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storageKey: 'rollwithdraw-auth-token',
    storage: {
      getItem: (key) => {
        try {
          const itemStr = localStorage.getItem(key)
          if (!itemStr) return null
          const item = JSON.parse(itemStr)
          const now = new Date()
          if (item.expires_at && new Date(item.expires_at) < now) {
            localStorage.removeItem(key)
            return null
          }
          return item
        } catch (error) {
          console.error('Error reading auth token:', error)
          return null
        }
      },
      setItem: (key, value) => {
        try {
          localStorage.setItem(key, JSON.stringify(value))
        } catch (error) {
          console.error('Error saving auth token:', error)
        }
      },
      removeItem: (key) => {
        try {
          localStorage.removeItem(key)
        } catch (error) {
          console.error('Error removing auth token:', error)
        }
      }
    }
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'x-application-name': 'RollWithdraw',
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Prefer': 'return=representation'
    }
  }
})

export interface Database {
  users: {
    id: string
    auth_id: string
    email: string
    username: string
    avatar_url?: string
    created_at: string
    last_login?: string
    status: 'active' | 'inactive' | 'banned'
    total_purchases?: number
    total_spent?: number
    current_subscription_id?: string
    subscription_start_date?: string
    subscription_end_date?: string
    preferred_currency?: string
    language_preference?: string
    two_factor_enabled?: boolean
    email_verified?: boolean
  }

  subscriptions: {
    id: string
    name: string
    description?: string
    price: number
    duration_days: number
    max_withdrawals_per_day?: number
    max_case_collection?: boolean
    advanced_filtering?: boolean
    risk_management?: boolean
    is_active?: boolean
    created_at: string
    updated_at: string
  }

  orders: {
    id: string
    user_id: string
    subscription_id: string
    total_amount: number
    payment_method?: string
    transaction_date: string
    items: {
      id: string
      name: string
      price: number
      quantity: number
    }[]
    status: 'pending' | 'completed' | 'failed' | 'refunded'
    payment_reference?: string
    notes?: string
  }
}