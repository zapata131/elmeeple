import React from 'react'
import { createClient } from '@/utils/supabase/server'
import AdminDashboardClient from './AdminDashboardClient'

export default async function PlatformAdminDashboard() {
  const supabase = await createClient()

  // Fetch all venues to calculate statistics and perform audits
  const { data: venues, error } = await supabase
    .from('venues')
    .select('*')

  if (error) {
    return (
      <div className="min-h-screen bg-[#F5F0E9] p-8">
        <div className="max-w-4xl mx-auto p-6 bg-red-100 border border-red-300 text-red-800 rounded-2xl">
          <h1 className="font-extrabold text-lg">Error al cargar datos del panel</h1>
          <p className="text-sm mt-1">{error.message}</p>
        </div>
      </div>
    )
  }

  return (
    <AdminDashboardClient initialVenues={venues || []} />
  )
}
