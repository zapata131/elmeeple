import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { syncBggCollection } from '@/app/actions/bgg'

export async function GET(req: NextRequest) {
  // 1. Verify Authorization Header
  const authHeader = req.headers.get('Authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const supabase = await createClient()

    // 2. Query venues that are approved, have a BGG username, and either:
    // - have never been synced (bgg_last_synced_at is null)
    // - were synced more than 7 days ago
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    const { data: venues, error: dbError } = await supabase
      .from('venues')
      .select('id, name, bgg_username, bgg_last_synced_at')
      .eq('verification_status', 'approved')
      .not('bgg_username', 'is', null)
      .neq('bgg_username', '')
      .or(`bgg_last_synced_at.is.null,bgg_last_synced_at.lt.${oneWeekAgo.toISOString()}`)

    if (dbError) {
      console.error('[CRON Sync] Error querying venues:', dbError)
      return NextResponse.json({ error: `Error de base de datos: ${dbError.message}` }, { status: 500 })
    }

    if (!venues || venues.length === 0) {
      return NextResponse.json({ success: true, message: 'No hay locales que requieran sincronización en este momento.', processed: [] })
    }

    console.log(`[CRON Sync] Found ${venues.length} venues to sync.`)

    // 3. Process sync for each venue sequentially to avoid BGG rate limits
    const results = []
    for (const venue of venues) {
      if (!venue.bgg_username) {
        console.warn(`[CRON Sync] Skipping venue ${venue.name} because bgg_username is empty.`)
        continue
      }
      try {
        console.log(`[CRON Sync] Syncing venue: ${venue.name} (BGG: ${venue.bgg_username})...`)
        const syncResult = await syncBggCollection(venue.id, venue.bgg_username)
        
        if (syncResult.success) {
          results.push({
            venueId: venue.id,
            name: venue.name,
            status: 'success',
            count: syncResult.count,
          })
        } else {
          results.push({
            venueId: venue.id,
            name: venue.name,
            status: 'failed',
            error: syncResult.error,
          })
        }
      } catch (syncErr) {
        console.error(`[CRON Sync] Unexpected error syncing ${venue.name}:`, syncErr)
        results.push({
          venueId: venue.id,
          name: venue.name,
          status: 'failed',
          error: syncErr instanceof Error ? syncErr.message : String(syncErr),
        })
      }

      // Add a small delay (e.g. 1 second) between BGG requests to be polite to the BGG API
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }

    return NextResponse.json({
      success: true,
      message: `Sincronización completada. Procesados ${venues.length} locales.`,
      processed: results,
    })
  } catch (error) {
    console.error('[CRON Sync] Unexpected error:', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 })
  }
}
export const dynamic = 'force-dynamic'
