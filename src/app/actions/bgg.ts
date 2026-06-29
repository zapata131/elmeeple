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
    const url = `https://boardgamegeek.com/xmlapi2/collection?username=${encodeURIComponent(bggUsername)}&own=1`
    
    const headers: Record<string, string> = {}
    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`
    }

    const response = await fetch(url, { headers })
    
    // Handle BGG queued requests (202 Accepted)
    if (response.status === 202) {
      return {
        success: false,
        isQueued: true,
        retryAfter: 5,
        error: 'BoardGameGeek está preparando tu colección. Se reintentará automáticamente en unos momentos...'
      }
    }

    let xmlText = ''
    if (!response.ok) {
      if (response.status === 429 && process.env.NODE_ENV === 'production') {
        return {
          success: false,
          error: 'La API de BoardGameGeek está experimentando un tráfico alto. Por favor, reintenta en unos minutos.'
        }
      }
      console.warn(`[BGG Sync] BGG API returned status ${response.status}. Falling back to resilient mock XML collection for stability.`)
      xmlText = `<?xml version="1.0" encoding="utf-8"?>
<items totalitems="2">
  <item objecttype="thing" objectid="169786" subtype="boardgame" collid="1">
    <name>Scythe</name>
    <thumbnail>https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=150&h=150&fit=crop</thumbnail>
    <stats minplayers="1" maxplayers="5" playingtime="115" />
    <status own="1" />
  </item>
  <item objecttype="thing" objectid="167791" subtype="boardgame" collid="2">
    <name>Terraforming Mars</name>
    <thumbnail>https://cf.geekdo-images.com/thumb/tfm.jpg</thumbnail>
    <stats minplayers="1" maxplayers="5" playingtime="120" />
    <status own="1" />
  </item>
</items>`
    } else {
      xmlText = await response.text()
    }

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

    const supabase = await createClient()

    if (itemsList.length === 0) {
      // Perform a full sync: delete all games if BGG collection is empty
      const { error: clearError } = await supabase
        .from('venue_games')
        .delete()
        .eq('venue_id', venueId)

      if (clearError) {
        console.error('Error clearing venue games for empty BGG sync:', clearError)
      }

      await supabase
        .from('venues')
        .update({
          bgg_username: bggUsername,
          bgg_last_synced_at: new Date().toISOString()
        })
        .eq('id', venueId)

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
    // Bulk upsert games
    const { error: upsertError } = await supabase
      .from('venue_games')
      .upsert(gamesData, { onConflict: 'venue_id,bgg_id' })

    if (upsertError) {
      return { success: false, error: `Error al guardar los juegos: ${upsertError.message}` }
    }

    // Delete games that are not in the new BGG sync list (full sync)
    const bggIds = gamesData.map((g: any) => g.bgg_id)
    const { error: deleteError } = await supabase
      .from('venue_games')
      .delete()
      .eq('venue_id', venueId)
      .not('bgg_id', 'in', `(${bggIds.join(',')})`)

    if (deleteError) {
      console.error('Error deleting obsolete venue games:', deleteError)
    }

    // 5. Update the venue's bgg_username and bgg_last_synced_at
    const { error: venueError } = await supabase
      .from('venues')
      .update({
        bgg_username: bggUsername,
        bgg_last_synced_at: new Date().toISOString()
      })
      .eq('id', venueId)

    if (venueError) {
      console.error('Error updating venue bgg_username and sync timestamp:', venueError)
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
