'use client'

import React from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix default marker icon issue in Leaflet with Next.js
const iconRetinaUrl = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png'
const iconUrl = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png'
const shadowUrl = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'

if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl,
    iconUrl,
    shadowUrl,
  })
}

interface OnboardingMapProps {
  lat?: number
  lng?: number
  onChangeCoordinates: (lat: number, lng: number) => void
}

// Sub-component to dynamically center/pan the map when coordinates change
function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap()
  React.useEffect(() => {
    map.setView(center, 15) // Zoom in closer when location is found/set
  }, [center, map])
  return null
}

function MapEvents({ onClick }: { onClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng)
    }
  })
  return null
}

const DEFAULT_CENTER: [number, number] = [19.432608, -99.133209] // CDMX
const DEFAULT_ZOOM = 12

export default function OnboardingMap({ 
  lat, 
  lng, 
  onChangeCoordinates 
}: OnboardingMapProps) {
  const markerPosition: [number, number] | null = lat && lng ? [lat, lng] : null
  const mapCenter: [number, number] = markerPosition || DEFAULT_CENTER

  return (
    <div className="w-full h-full relative z-0" data-testid="map-container">
      <MapContainer
        center={mapCenter}
        zoom={DEFAULT_ZOOM}
        scrollWheelZoom={true}
        className="w-full h-full"
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        <MapEvents onClick={onChangeCoordinates} />
        {markerPosition && <Marker position={markerPosition} />}
        {markerPosition && <ChangeView center={markerPosition} />}
      </MapContainer>
    </div>
  )
}
