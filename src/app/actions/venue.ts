'use server'

import { StructuredSchedule } from '@/components/QuickViewCard'
import { createClient } from '@/utils/supabase/server'

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
  businessTaxId?: string
  verificationProof?: string
  contactEmail?: string
  contactPhone?: string
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

  try {
    const supabase = await createClient()

    // 1. Insert the venue into the 'venues' table
    const { data: insertedVenue, error: venueError } = await supabase
      .from('venues')
      .insert({
        owner_name: data.ownerName,
        owner_email: data.ownerEmail,
        name: data.name,
        description: data.description,
        schedule: data.schedule,
        lat: data.lat,
        lng: data.lng,
        type: data.type,
        instagram: data.instagram,
        discord: data.discord,
        logo_url: data.logoUrl,
        business_tax_id: data.businessTaxId,
        verification_proof: data.verificationProof,
        verification_status: 'pending',
        verified: false, // Default to false (requires admin approval)
        contact_email: data.contactEmail,
        contact_phone: data.contactPhone
      })

      .select()

    if (venueError) {
      return {
        success: false,
        error: `Error al crear el local: ${venueError.message}`
      }
    }

    if (!insertedVenue || insertedVenue.length === 0) {
      return {
        success: false,
        error: 'No se pudo obtener el ID del local insertado.'
      }
    }

    const venueId = insertedVenue[0].id

    // 2. Map tags if any are selected
    if (data.tags && data.tags.length > 0) {
      // Fetch corresponding tag records to get their IDs
      const { data: dbTags, error: tagsError } = await supabase
        .from('tags')
        .select('id, name')
        .in('name', data.tags)

      if (tagsError) {
        console.error('Error fetching tags:', tagsError)
      } else if (dbTags && dbTags.length > 0) {
        const venueTags = dbTags.map(tag => ({
          venue_id: venueId,
          tag_id: tag.id
        }))

        const { error: mappingError } = await supabase
          .from('venue_tags')
          .insert(venueTags)

        if (mappingError) {
          console.error('Error mapping tags to venue:', mappingError)
        }
      }
    }

    return {
      success: true,
      venueId: venueId
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    return {
      success: false,
      error: `Ocurrió un error inesperado: ${errorMessage}`
    }
  }
}
