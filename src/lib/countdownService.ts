import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL, 
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

export const initializeCountdownTimer = async (userId: string) => {
  const { data, error } = await supabase
    .from('countdown_timers')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .single()

  if (error || !data) {
    // Create new countdown timer
    const { data: newTimer, error: insertError } = await supabase
      .from('countdown_timers')
      .insert({
        user_id: userId,
        start_date: new Date().toISOString(),
        days_left: 30,
        is_active: true
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating countdown timer:', insertError)
      return null
    }

    return newTimer
  }

  // Check if timer needs to be reset or updated
  const startDate = new Date(data.start_date)
  const currentDate = new Date()
  const daysDifference = Math.floor(
    (currentDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24)
  )

  if (daysDifference >= 30) {
    // Reset timer
    const { data: updatedTimer, error: updateError } = await supabase
      .from('countdown_timers')
      .update({
        start_date: currentDate.toISOString(),
        days_left: 30
      })
      .eq('id', data.id)
      .select()
      .single()

    if (updateError) {
      console.error('Error resetting countdown timer:', updateError)
      return null
    }

    return updatedTimer
  }

  // Update days left
  const updatedDaysLeft = Math.max(0, 30 - daysDifference)
  const { data: updatedTimer, error: updateError } = await supabase
    .from('countdown_timers')
    .update({ days_left: updatedDaysLeft })
    .eq('id', data.id)
    .select()
    .single()

  if (updateError) {
    console.error('Error updating countdown timer:', updateError)
    return null
  }

  return updatedTimer
}

export const getCountdownTimer = async (userId: string) => {
  const { data, error } = await supabase
    .from('countdown_timers')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .single()

  if (error) {
    console.error('Error fetching countdown timer:', error)
    return null
  }

  return data
}
