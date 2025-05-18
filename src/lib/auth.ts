import { supabase } from './supabaseClient'

// Function to get user's IP address
export const getUserIP = async () => {
  try {
    const response = await fetch('https://api.ipify.org?format=json')
    const data = await response.json()
    return data.ip
  } catch (error) {
    console.error('Error fetching IP:', error)
    return null
  }
}

// Function to update user's IP address
export const updateUserIP = async (userId: string, ipAddress: string) => {
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

// Enhanced sign in function
export const signInWithIP = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error

    // If sign in successful, get and update IP
    if (data.user) {
      const ipAddress = await getUserIP()
      if (ipAddress) {
        await updateUserIP(data.user.id, ipAddress)
      }
    }

    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

// Enhanced sign up function
export const signUpWithIP = async (email: string, password: string, username: string) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) throw error

    // If sign up successful, get and update IP
    if (data.user) {
      const ipAddress = await getUserIP()
      if (ipAddress) {
        await updateUserIP(data.user.id, ipAddress)
      }
    }

    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

// Function to update IP on session refresh
export const updateIPOnSessionRefresh = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      const ipAddress = await getUserIP()
      if (ipAddress) {
        await updateUserIP(session.user.id, ipAddress)
      }
    }
  } catch (error) {
    console.error('Error updating IP on session refresh:', error)
  }
} 