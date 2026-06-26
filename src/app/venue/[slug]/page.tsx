/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import VenueProfileClient from './VenueProfileClient'
import { Venue } from '@/components/QuickViewCard'

interface PageProps {
  params: Promise<{ slug: string }>
}

import { MOCK_VENUES } from '@/utils/mockData'

export default async function VenueProfilePage({ params }: PageProps) {
  const { slug } = await params

  if (!slug) {
    return notFound()
  }

  // Fetch the venue by slug, including nested relations
  let venueData = null
  let error = null

  try {
    const supabase = await createClient()
    const result = await supabase
      .from('venues')
      .select(`
        id,
        name,
        slug,
        description,
        schedule,
        lat,
        lng,
        type,
        instagram,
        discord,
        logo_url,
        verification_status,
        bgg_last_synced_at,
        venue_tags (
          tags (
            name
          )
        ),
        venue_games (
          id,
          name,
          thumbnail,
          min_players,
          max_players,
          playing_time
        ),
        reviews (
          id,
          user_email,
          rating,
          comment,
          vibe_tags,
          created_at
        )
      `)
      .eq('slug', slug)
      .single()
    venueData = result.data
    error = result.error
  } catch (err) {
    console.warn(`Error querying database for venue "${slug}":`, err)
    error = err
  }

  if (error || !venueData) {
    console.warn(`Venue with slug "${slug}" not found or database error. Checking local mock venues.`, error)
    const mockVenue = MOCK_VENUES.find(v => v.slug === slug)
    if (!mockVenue) {
      return notFound()
    }

    const formattedVenue = {
      ...mockVenue,
      venue_games: mockVenue.venue_games || [],
      reviews: mockVenue.reviews || []
    }
    return <VenueProfileClient venue={formattedVenue} />
  }

  // Format the tags to a clean array
  const tagsList = venueData.venue_tags
    ? (venueData.venue_tags as any[])
        .map((vt: any) => vt.tags?.name)
        .filter(Boolean)
    : []

  // Construct the formatted venue object
  const formattedVenue: Venue & { venue_games: any[]; reviews: any[]; bgg_last_synced_at: string | null } = {
    id: venueData.id,
    name: venueData.name,
    slug: venueData.slug,
    lat: venueData.lat,
    lng: venueData.lng,
    tags: tagsList,
    schedule: venueData.schedule,
    address: 'Roma Norte, CDMX', // Fallback address
    description: venueData.description,
    type: venueData.type as any,
    instagram: venueData.instagram || undefined,
    discord: venueData.discord || undefined,
    logoUrl: venueData.logo_url || undefined,
    venue_games: venueData.venue_games || [],
    reviews: venueData.reviews || [],
    bgg_last_synced_at: venueData.bgg_last_synced_at || null
  }

  return <VenueProfileClient venue={formattedVenue} />
}
