'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, ZoomControl, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Venue } from './QuickViewCard'

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

// Custom brand-purple vector SVG marker icon
let purpleIcon: L.DivIcon | undefined

if (typeof window !== 'undefined') {
  purpleIcon = L.divIcon({
    html: `
      <div style="display: flex; align-items: center; justify-content: center;">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#8367C7" style="width: 32px; height: 32px; filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.3));">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
      </div>
    `,
    className: 'custom-purple-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  })
}

interface MapProps {
  center?: [number, number]
  zoom?: number
  venues?: Venue[]
  onSelectVenue?: (venue: Venue) => void
  selectedVenue?: Venue | null
}

const DEFAULT_CENTER: [number, number] = [19.432608, -99.133209] // Mexico City (CDMX) as default center
const DEFAULT_ZOOM = 13

// Component to programmatically pan and center the map on the selected venue or searched location
function MapController({ 
  selectedVenue, 
  center 
}: { 
  selectedVenue: Venue | null
  center?: [number, number]
}) {
  const map = useMap()

  useEffect(() => {
    if (center) {
      map.flyTo(center, 13, {
        animate: true,
        duration: 1.5,
      })
    }
  }, [center, map])

  useEffect(() => {
    if (selectedVenue) {
      map.setView([selectedVenue.lat, selectedVenue.lng], 15, {
        animate: true,
        duration: 1.0, // 1 second smooth animation
      })
    }
  }, [selectedVenue, map])

  return null
}

export default function Map({ 
  center, 
  zoom = DEFAULT_ZOOM, 
  venues = [], 
  onSelectVenue,
  selectedVenue = null
}: MapProps) {
  const initialCenter = center || DEFAULT_CENTER

  return (
    <div className="w-full h-full relative z-0" data-testid="map-container">
      <MapContainer
        center={initialCenter}
        zoom={zoom}
        scrollWheelZoom={true}
        zoomControl={false} // Disable default top-left zoom controls
        className="w-full h-full"
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        <ZoomControl position="topright" /> {/* Re-add zoom controls in top-right */}
        
        {/* Helper component to animate camera pan when a venue is selected or center changes */}
        <MapController selectedVenue={selectedVenue} center={center} />

        {venues.map((venue) => (
          <Marker
            key={venue.id}
            position={[venue.lat, venue.lng]}
            icon={purpleIcon}
            eventHandlers={{
              click: () => {
                if (onSelectVenue) {
                  onSelectVenue(venue)
                }
              }
            }}
          />
        ))}
      </MapContainer>
    </div>
  )
}
