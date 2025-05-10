import { supabase } from './supabaseClient'

export const generatePasswordResetUrl = async (email: string) => {
  if (!email) {
    return {
      success: false,
      message: 'Email is required'
    }
  }

  try {
    // Generate a password reset token and send email using Supabase
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/rw/reset-password`
    })

    if (error) {
      console.error('Error generating password reset link:', error.message)
      return {
        success: false,
        message: error.message || 'Failed to generate password reset link'
      }
    }

    return {
      success: true,
      message: 'Password reset link sent successfully'
    }
  } catch (err) {
    console.error('Unexpected error in password reset:', err)
    return {
      success: false,
      message: 'An unexpected error occurred while sending the reset link'
    }
  }
}

// Utility to extract and verify reset token
export const verifyPasswordResetToken = async (token: string) => {
  if (!token) {
    return {
      isValid: false,
      error: 'No reset token provided'
    }
  }

  try {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: 'recovery'
    })

    if (error) {
      console.error('Token verification failed:', error.message)
      return { 
        isValid: false, 
        error: error.message 
      }
    }

    return { 
      isValid: true 
    }
  } catch (err) {
    console.error('Unexpected error verifying token:', err)
    return { 
      isValid: false, 
      error: 'An unexpected error occurred while verifying the token' 
    }
  }
} 