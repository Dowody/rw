import { supabase } from '../lib/supabaseClient'

export const isAdmin = async () => {
  try {
    // Get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) throw sessionError
    if (!session) return false

    // Check if user is admin
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('is_admin')
      .eq('auth_id', session.user.id)
      .single()

    if (userError) throw userError
    return userData?.is_admin || false

  } catch (error) {
    console.error('Admin auth error:', error)
    return false
  }
}

export const requireAdmin = async () => {
  const adminStatus = await isAdmin()
  if (!adminStatus) {
    window.location.href = '/admin'
    return false
  }
  return true
} 