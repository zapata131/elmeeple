'use server'
/* eslint-disable @typescript-eslint/no-explicit-any */

import { createClient } from '@/utils/supabase/server'
import { XMLParser } from 'fast-xml-parser'

export async function syncBggCollection(venueId: string, bggUsername: string) {
  if (!venueId || !bggUsername) {
    return { success: false, error: 'ID de local y usuario de BGG son requeridos.' }
  }

  try {
    // 1. Fetch XML collection from BGG
    const apiKey = process.env.BGG_API_KEY
    let url = `https://boardgamegeek.com/xmlapi2/collection?username=${encodeURIComponent(bggUsername)}&own=1`
    
    const headers: Record<string, string> = {}
    if (apiKey) {
      url += `&apikey=${encodeURIComponent(apiKey)}`
      headers['X-BGG-API-Key'] = apiKey
    }

    const response = await fetch(url, { headers })
    
    if (!response.ok) {
      return { success: false, error: `Error al conectar con BGG (Status: ${response.status})` }
    }

    const xmlText = await response.text()

    // 2. Parse the XML securely with attributes enabled
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '',
      parseAttributeValue: false,
    })

    const parsed = parser.parse(xmlText)

    // BGG returns a 202 status or message if the collection is being generated
    if (parsed.errors?.error?.message) {
      return { success: false, error: parsed.errors.error.message }
    }

    const itemsContainer = parsed.items
    if (!itemsContainer) {
      return { success: false, error: 'No se encontró la colección de BGG. Verifica que el usuario sea correcto y tenga juegos marcados como propios.' }
    }

    // Retrieve items list. Handle single item vs array
    const rawItems = itemsContainer.item
    const itemsList = Array.isArray(rawItems)
      ? rawItems
      : rawItems
        ? [rawItems]
        : []

    if (itemsList.length === 0) {
      return { success: true, count: 0, message: 'La colección de BGG está vacía.' }
    }

    // 3. Map the games to database objects
    const gamesData = itemsList.map((item: any) => {
      const bggId = parseInt(item.objectid || item.id, 10)
      
      // Extract name (fast-xml-parser returns object with #text for tags with attributes)
      let name = ''
      if (item.name) {
        if (typeof item.name === 'object') {
          name = item.name['#text'] || ''
        } else {
          name = String(item.name)
        }
      }

      const thumbnail = item.thumbnail || null
      const min_players = item.stats?.minplayers ? parseInt(item.stats.minplayers, 10) : null
      const max_players = item.stats?.maxplayers ? parseInt(item.stats.maxplayers, 10) : null
      const playing_time = item.stats?.playingtime ? parseInt(item.stats.playingtime, 10) : null

      return {
        venue_id: venueId,
        bgg_id: bggId,
        name: name.trim(),
        thumbnail,
        min_players,
        max_players,
        playing_time,
      }
    })

    // 4. Connect to Supabase and perform idempotent upsert
    const supabase = await createClient()
    
    // Bulk upsert games
    const { error: upsertError } = await supabase
      .from('venue_games')
      .upsert(gamesData, { onConflict: 'venue_id,bgg_id' })

    if (upsertError) {
      return { success: false, error: `Error al guardar los juegos: ${upsertError.message}` }
    }

    // 5. Update the venue's bgg_username
    const { error: venueError } = await supabase
      .from('venues')
      .update({ bgg_username: bggUsername })
      .eq('id', venueId)

    if (venueError) {
      console.error('Error updating venue bgg_username:', venueError)
    }

    return { success: true, count: gamesData.length }
  } catch (error) {
    console.error('Error in syncBggCollection:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }
  }
}
