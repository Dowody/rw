import { supabase } from './supabaseClient'

const IPIFY_API_KEY = 'at_HdANd8rHmn0Li0wWj7Iu7taZMOkLq'

// Store IP in memory to avoid repeated checks
let cachedIP: string | null = null
let isUpdatingIP = false
let lastUpdateTime = 0
const UPDATE_COOLDOWN = 1200000 // 5 minutes cooldown between updates

// Function to get user's IP address using ipify Geolocation API
export const getUserIP = async () => {
  try {
    const response = await fetch(`https://geo.ipify.org/api/v2/country?apiKey=${IPIFY_API_KEY}`)
    
    if (!response.ok) {
      throw new Error(`ipify API responded with status: ${response.status}`)
    }

    const data = await response.json()
    return data.ip
  } catch (error) {
    return null
  }
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
        // First verify the user exists and get current data
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

        // Update the user's IP address
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
  // Check if we've already updated IP in this session
  const sessionKey = `ip_updated_${userId}`
  if (!forceUpdate && sessionStorage.getItem(sessionKey)) {
    return true
  }

  try {
    // First verify the user is authenticated and get the correct user ID
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return false
    }

    // Get the correct user ID from the auth session
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('auth_id', user.id)
      .single()

    if (userError) {
      return false 
    }

    if (!userData) {
      return false
    }

    const correctUserId = userData.id

    // Get new IP
    const newIP = await getUserIP()
    if (!newIP) {
      return false
    }

    // If force update is true, skip the cache check
    if (!forceUpdate && cachedIP === newIP) {
      return true
    }

    // Then check if user exists and get current IP
    const { data: currentUserData, error: currentUserError } = await supabase
      .from('users')
      .select('ip_address, last_ip_update')
      .eq('id', correctUserId)
      .single()

    if (currentUserError) {
      throw currentUserError
    }

    // Update IP if force update is true, or if it's different or hasn't been updated in the last 24 hours
    const shouldUpdate = forceUpdate || !currentUserData.ip_address || 
      currentUserData.ip_address !== newIP ||
      !currentUserData.last_ip_update ||
      (new Date().getTime() - new Date(currentUserData.last_ip_update).getTime() > 86400000) // 24 hours

    if (shouldUpdate) {
      const updateResult = await updateUserIP(correctUserId, newIP, forceUpdate)
      if (updateResult) {
        // Mark IP as updated in this session
        sessionStorage.setItem(sessionKey, 'true')
      }
      return updateResult
    }

    // Mark IP as checked in this session even if no update was needed
    sessionStorage.setItem(sessionKey, 'true')
    return true
  } catch (error) {
    return false
  }
}

// Function to handle auth state changes
export const handleAuthStateChange = async (event: string, session: any) => {
  // Only handle SIGNED_IN event
  if (event !== 'SIGNED_IN' || !session?.user) return

  // Force update IP on sign in
  ensureIPUpdated(session.user.id, true).catch(() => {})
}

// Initialize IP tracking
export const initializeIPTracking = () => {
  // Set up auth state change listener
  const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange)

  // Check and update IP for current session in background
  const checkCurrentSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        // Force update on initial session check
        ensureIPUpdated(session.user.id, true).catch(() => {})
      }
    } catch (error) {
      // Silent error handling
    }
  }

  // Run initial check after a longer delay to ensure auth is ready
  setTimeout(checkCurrentSession, 15000) // 15 seconds delay

  return () => {
    subscription.unsubscribe()
  }
} 