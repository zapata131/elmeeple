'use server'

export interface OnboardingData {
  ownerName: string
  ownerEmail: string
  name: string
  description: string
  schedule: string
  lat: number
  lng: number
  tags: string[]
}

export async function createVenue(data: OnboardingData) {
  // Simple server-side validation
  if (
    !data.ownerName ||
    !data.ownerEmail ||
    !data.name ||
    !data.description ||
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
    description: data.description,
    schedule: data.schedule,
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
