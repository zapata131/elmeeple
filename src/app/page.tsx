import React from 'react'
import Navbar from '@/components/Navbar'
import InteractiveMap from '@/components/InteractiveMap'

export default function Home() {
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#F5F0E9]">
      <Navbar />
      <main className="flex-1 relative overflow-hidden">
        <InteractiveMap />
      </main>
    </div>
  )
}
