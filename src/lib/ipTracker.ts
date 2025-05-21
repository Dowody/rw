import { supabase } from './supabaseClient'

const IPIFY_API_KEY = import.meta.env.VITE_IPIFY_API_KEY

if (!IPIFY_API_KEY) {
  throw new Error('Missing IPIFY API key in environment variables')
}

// Store IP in memory to avoid repeated checks
let cachedIP: string | null = null
let isUpdatingIP = false
let lastUpdateTime = 0
const UPDATE_COOLDOWN = 86400000 // 24 hours cooldown between updates
const SESSION_CHECK_DELAY = 1200000 // 20 minutes delay for initial session check
let pendingIPPromise: Promise<string | null> | null = null

// Function to get user's IP address using ipify Geolocation API
export const getUserIP = async () => {
  // If we have a cached IP and it's less than 24 hours old, use it
  if (cachedIP && (Date.now() - lastUpdateTime) < UPDATE_COOLDOWN) {
    return cachedIP
  }

  // If there's already a pending IP fetch, return that promise
  if (pendingIPPromise) {
    return pendingIPPromise
  }

  // Create a new promise for this IP fetch
  pendingIPPromise = (async () => {
  try {
    const response = await fetch(`https://geo.ipify.org/api/v2/country?apiKey=${IPIFY_API_KEY}`)
    
    if (!response.ok) {
      throw new Error(`ipify API responded with status: ${response.status}`)
    }

    const data = await response.json()
      cachedIP = data.ip
      lastUpdateTime = Date.now()
    return data.ip
  } catch (error) {
    return null
    } finally {
      // Clear the pending promise after a short delay to prevent race conditions
      setTimeout(() => {
        pendingIPPromise = null
      }, 100)
  }
  })()

  return pendingIPPromise
}

// Function to update user's IP address in Supabase
export const updateUserIP = async (userId: string, ipAddress: string, forceUpdate: boolean = false) => {
  if (!forceUpdate && (isUpdatingIP || (Date.now() - lastUpdateTime) < UPDATE_COOLDOWN)) {
    return true
  }

  isUpdatingIP = true
  lastUpdateTime = Date.now()

  const maxRetries = 3
  let retryCount = 0

  try {
    while (retryCount < maxRetries) {
      try {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id, ip_address')
          .eq('id', userId)
          .single()

        if (userError && userError.code !== 'PGRST116') {
          throw userError
        }

        if (!userData) {
          return false
        }

        const updateData = { 
          ip_address: ipAddress,
          last_ip_update: new Date().toISOString()
        }

        const { data, error } = await supabase
          .from('users')
          .update(updateData)
          .eq('id', userId)
          .select()

        if (error) {
          throw error
        }

        if (!data || data.length === 0) {
          throw new Error('No data returned from update')
        }

        cachedIP = ipAddress
        return true
      } catch (error) {
        retryCount++
        if (retryCount === maxRetries) {
          return false
        }
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }
    return false
  } finally {
    isUpdatingIP = false
  }
}

// Function to ensure IP is updated
export const ensureIPUpdated = async (userId: string, forceUpdate: boolean = false) => {
  const sessionKey = `ip_updated_${userId}`
  const lastSessionUpdate = sessionStorage.getItem(sessionKey)
  
  if (!forceUpdate && lastSessionUpdate) {
    const lastUpdate = parseInt(lastSessionUpdate)
    if (Date.now() - lastUpdate < UPDATE_COOLDOWN) {
    return true
    }
  }

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return false
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('auth_id', user.id)
      .single()

    if (userError || !userData) {
      return false
    }

    const correctUserId = userData.id

    const newIP = await getUserIP()
    if (!newIP) {
      return false
    }

    const { data: currentUserData, error: currentUserError } = await supabase
      .from('users')
      .select('ip_address, last_ip_update')
      .eq('id', correctUserId)
      .single()

    if (currentUserError) {
      throw currentUserError
    }

    const shouldUpdate = forceUpdate || 
      !currentUserData.ip_address || 
      currentUserData.ip_address !== newIP ||
      !currentUserData.last_ip_update ||
      (new Date().getTime() - new Date(currentUserData.last_ip_update).getTime() > UPDATE_COOLDOWN)

    if (shouldUpdate) {
      const updateResult = await updateUserIP(correctUserId, newIP, forceUpdate)
      if (updateResult) {
        sessionStorage.setItem(sessionKey, Date.now().toString())
      }
      return updateResult
    }

    sessionStorage.setItem(sessionKey, Date.now().toString())
    return true
  } catch (error) {
    return false
  }
}

// Function to handle auth state changes
export const handleAuthStateChange = async (event: string, session: any) => {
  if (event !== 'SIGNED_IN' || !session?.user) return
  ensureIPUpdated(session.user.id, true).catch(() => {})
}

// Initialize IP tracking
export const initializeIPTracking = () => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange)

  const checkCurrentSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        ensureIPUpdated(session.user.id, true).catch(() => {})
      }
    } catch (error) {
      // Silent error handling
    }
  }

  setTimeout(checkCurrentSession, SESSION_CHECK_DELAY)

  return () => {
    subscription.unsubscribe()
  }
} 