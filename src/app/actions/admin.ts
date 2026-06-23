'use server'

import { createClient } from '@/utils/supabase/server'

/**
 * Approves a venue, marking its verification_status as 'approved' and verified as true.
 */
export async function approveVenue(id: string) {
  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('venues')
      .update({
        verification_status: 'approved',
        verified: true
      })
      .eq('id', id)

    if (error) {
      return { success: false, error: error.message }
    }
    return { success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return { success: false, error: message }
  }
}

/**
 * Rejects a venue, marking its verification_status as 'rejected', verified as false, and recording the reason.
 */
export async function rejectVenue(id: string, reason: string) {
  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('venues')
      .update({
        verification_status: 'rejected',
        verified: false,
        rejection_reason: reason
      })
      .eq('id', id)

    if (error) {
      return { success: false, error: error.message }
    }
    return { success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return { success: false, error: message }
  }
}
