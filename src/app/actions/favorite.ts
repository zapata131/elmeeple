'use server'

import { createClient } from '@/utils/supabase/server'
import { getServerSession } from 'next-auth'

export async function toggleFavorite(venueId: string) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return { success: false, error: 'No autenticado.' }
    }

    const email = session.user.email
    const supabase = await createClient()

    // Check if already favorited
    const { data, error: selectError } = await supabase
      .from('favorites')
      .select('*')
      .eq('user_email', email)
      .eq('venue_id', venueId)
      .single()

    if (selectError && selectError.code !== 'PGRST116') {
      return { success: false, error: selectError.message }
    }

    if (data) {
      // Remove from favorites
      const { error: deleteError } = await supabase
        .from('favorites')
        .delete()
        .eq('user_email', email)
        .eq('venue_id', venueId)

      if (deleteError) {
        return { success: false, error: deleteError.message }
      }
      return { success: true, isFavorite: false }
    } else {
      // Add to favorites
      const { error: insertError } = await supabase
        .from('favorites')
        .insert({
          user_email: email,
          venue_id: venueId,
        })

      if (insertError) {
        return { success: false, error: insertError.message }
      }
      return { success: true, isFavorite: true }
    }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) }
  }
}
