/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import VenueProfileClient from './VenueProfileClient'
import { Venue } from '@/components/QuickViewCard'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function VenueProfilePage({ params }: PageProps) {
  const { slug } = await params

  if (!slug) {
    return notFound()
  }

  const supabase = await createClient()

  // Fetch the venue by slug, including nested relations
  const { data: venueData, error } = await supabase
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

  if (error || !venueData) {
    console.warn(`Venue with slug "${slug}" not found or database error:`, error)
    return notFound()
  }

  // Format the tags to a clean array
  const tagsList = venueData.venue_tags
    ? (venueData.venue_tags as any[])
        .map((vt: any) => vt.tags?.name)
        .filter(Boolean)
    : []

  // Construct the formatted venue object
  const formattedVenue: Venue & { venue_games: any[]; reviews: any[] } = {
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
    reviews: venueData.reviews || []
  }

  return <VenueProfileClient venue={formattedVenue} />
}
