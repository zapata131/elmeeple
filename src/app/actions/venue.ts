'use server'

import { StructuredSchedule } from '@/components/QuickViewCard'

export interface OnboardingData {
  ownerName: string
  ownerEmail: string
  name: string
  description: string
  schedule: StructuredSchedule
  lat: number
  lng: number
  tags: string[]
  type: 'cafe' | 'tienda' | 'hibrido' | 'comunidad'
  instagram?: string
  discord?: string
  logoUrl?: string
}

export async function createVenue(data: OnboardingData) {
  // Simple server-side validation
  if (
    !data.ownerName ||
    !data.ownerEmail ||
    !data.name ||
    !data.description ||
    !data.type ||
    !data.schedule ||
    data.lat === undefined ||
    data.lng === undefined
  ) {
    return {
      success: false,
      error: 'Por favor, completa todos los campos requeridos.'
    }
  }

  // Log on the server side (simulating database write in development/MVP stage)
  console.log('--- [SERVER ACTION] Creating New Venue Proposal ---')
  console.log('Owner Details:', { name: data.ownerName, email: data.ownerEmail })
  console.log('Venue Details:', {
    name: data.name,
    type: data.type,
    description: data.description,
    schedule: data.schedule,
    instagram: data.instagram,
    discord: data.discord,
    logoUrl: data.logoUrl,
    coordinates: `[${data.lat}, ${data.lng}]`,
    tags: data.tags
  })

  // Simulated DB success response
  const generatedId = `venue_${Math.random().toString(36).substring(2, 9)}`
  
  return {
    success: true,
    venueId: generatedId
  }
}
