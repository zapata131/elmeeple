'use client'

import { MapContainer, TileLayer, Marker } from 'react-leaflet'
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

interface MapProps {
  center?: [number, number]
  zoom?: number
  venues?: Venue[]
  onSelectVenue?: (venue: Venue) => void
}

const DEFAULT_CENTER: [number, number] = [19.432608, -99.133209] // Mexico City (CDMX) as default center
const DEFAULT_ZOOM = 13

export default function Map({ 
  center = DEFAULT_CENTER, 
  zoom = DEFAULT_ZOOM, 
  venues = [], 
  onSelectVenue 
}: MapProps) {
  return (
    <div className="w-full h-full relative z-0" data-testid="map-container">
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        className="w-full h-full"
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        {venues.map((venue) => (
          <Marker
            key={venue.id}
            position={[venue.lat, venue.lng]}
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
