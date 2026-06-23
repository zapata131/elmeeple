'use server'

import { createClient } from '@/utils/supabase/server'
import { getServerSession } from 'next-auth'

export async function submitReview(
  venueId: string,
  rating: number,
  comment: string,
  vibeTags: string[]
) {
  try {
    // 1. Check authentication
    const session = await getServerSession()
    if (!session?.user?.email) {
      return { success: false, error: 'Debe iniciar sesión para publicar una reseña.' }
    }

    const email = session.user.email

    // 2. Validate rating
    if (rating === undefined || typeof rating !== 'number' || rating < 1 || rating > 5) {
      return { success: false, error: 'Calificación no válida. Debe estar entre 1 y 5.' }
    }

    // 3. Insert review into Supabase
    const supabase = await createClient()
    const { error } = await supabase
      .from('reviews')
      .insert({
        user_email: email,
        venue_id: venueId,
        rating: Math.round(rating),
        comment: comment?.trim() || null,
        vibe_tags: vibeTags || [],
      })

    if (error) {
      return { success: false, error: `Error al guardar la reseña: ${error.message}` }
    }

    return { success: true }
  } catch (error) {
    console.error('Error in submitReview:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }
  }
}
