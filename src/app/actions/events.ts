'use server'

import { createClient } from '@/utils/supabase/server'
import { getServerSession } from 'next-auth'

export async function getEvents(venueId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .or(`venue_id.eq.${venueId},organizer_venue_id.eq.${venueId}`)
      .order('date', { ascending: true })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error in getEvents:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }
  }
}

export async function createEvent(
  organizerVenueId: string,
  title: string,
  game: string,
  description: string,
  date: string,
  entryFee: number,
  maxParticipants?: number,
  venueId?: string | null,
  registrationUrl?: string | null
) {
  try {
    // 1. Check authentication
    const session = await getServerSession()
    if (!session?.user?.email) {
      return { success: false, error: 'Debe iniciar sesión para crear un evento.' }
    }

    const email = session.user.email

    // 2. Verify organizer venue ownership
    const supabase = await createClient()
    const { data: venue, error: venueError } = await supabase
      .from('venues')
      .select('id, owner_email')
      .eq('id', organizerVenueId)
      .eq('owner_email', email)
      .single()

    if (venueError || !venue) {
      return { success: false, error: 'No tiene permisos para crear eventos en este local.' }
    }

    // 3. Insert event
    const { error: insertError } = await supabase
      .from('events')
      .insert({
        organizer_venue_id: organizerVenueId,
        venue_id: venueId || null,
        title: title.trim(),
        game: game.trim(),
        description: description?.trim() || null,
        date,
        entry_fee: entryFee,
        max_participants: maxParticipants || null,
        registration_url: registrationUrl || null,
      })

    if (insertError) {
      return { success: false, error: `Error al guardar el evento: ${insertError.message}` }
    }

    return { success: true }
  } catch (error) {
    console.error('Error in createEvent:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }
  }
}

export async function deleteEvent(eventId: string, organizerVenueId: string) {
  try {
    // 1. Check authentication
    const session = await getServerSession()
    if (!session?.user?.email) {
      return { success: false, error: 'Debe iniciar sesión para eliminar un evento.' }
    }

    const email = session.user.email

    // 2. Verify organizer venue ownership
    const supabase = await createClient()
    const { data: venue, error: venueError } = await supabase
      .from('venues')
      .select('id, owner_email')
      .eq('id', organizerVenueId)
      .eq('owner_email', email)
      .single()

    if (venueError || !venue) {
      return { success: false, error: 'No tiene permisos para eliminar eventos en este local.' }
    }

    // 3. Delete event
    const { error: deleteError } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId)

    if (deleteError) {
      return { success: false, error: `Error al eliminar el evento: ${deleteError.message}` }
    }

    return { success: true }
  } catch (error) {
    console.error('Error in deleteEvent:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }
  }
}
