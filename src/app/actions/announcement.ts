'use server'

import { createClient } from '@/utils/supabase/server'

export interface AnnouncementData {
  venueId: string
  title: string
  content: string
}

export async function createAnnouncement(data: AnnouncementData) {
  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('announcements')
      .insert({
        venue_id: data.venueId,
        title: data.title,
        content: data.content,
      })

    if (error) {
      return { success: false, error: error.message }
    }
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) }
  }
}
