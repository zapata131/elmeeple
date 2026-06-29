'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, ZoomControl, useMap, useMapEvents, Tooltip } from 'react-leaflet'
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
let communityIcon: L.DivIcon | undefined

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

  communityIcon = L.divIcon({
    html: `
      <div style="display: flex; align-items: center; justify-content: center;">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#73D8D4" style="width: 32px; height: 32px; filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.3));">
          <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.83 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
        </svg>
      </div>
    `,
    className: 'custom-community-icon',
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
  onBoundsChange?: (bounds: [number, number, number, number]) => void
}

const DEFAULT_CENTER: [number, number] = [19.432608, -99.133209] // Mexico City (CDMX) as default center
const DEFAULT_ZOOM = 13

// Distance-based clustering algorithm
function getClusters(venues: Venue[], zoom: number) {
  // At zoom 15+ (very zoomed in), we do not cluster markers to allow precise selection
  if (zoom >= 15) {
    return venues.map((v) => ({
      isCluster: false,
      id: v.id,
      lat: v.lat!,
      lng: v.lng!,
      venues: [v],
    }))
  }

  // Degree-based cluster radius, scaling with zoom level
  const clusterRadius = 0.04 / Math.pow(2, zoom - 10)
  const clusters: Array<{
    isCluster: boolean
    id: string
    lat: number
    lng: number
    venues: Venue[]
  }> = []
  const processed = new Set<string>()

  for (const venue of venues) {
    const vLat = venue.lat
    const vLng = venue.lng
    if (vLat === undefined || vLng === undefined || vLat === null || vLng === null) continue
    if (processed.has(venue.id)) continue

    // Find all nearby venues within the radius
    const neighbors = venues.filter((other) => {
      if (other.lat === undefined || other.lng === undefined || other.lat === null || other.lng === null) return false
      if (processed.has(other.id)) return false

      const latDiff = Math.abs(vLat - other.lat)
      const lngDiff = Math.abs(vLng - other.lng)
      return latDiff < clusterRadius && lngDiff < clusterRadius
    })

    if (neighbors.length > 1) {
      // Calculate centroid of the cluster
      const avgLat = neighbors.reduce((sum, n) => sum + (n.lat ?? 0), 0) / neighbors.length
      const avgLng = neighbors.reduce((sum, n) => sum + (n.lng ?? 0), 0) / neighbors.length

      clusters.push({
        isCluster: true,
        id: `cluster-${venue.id}`,
        lat: avgLat,
        lng: avgLng,
        venues: neighbors,
      })
      neighbors.forEach((n) => processed.add(n.id))
    } else {
      clusters.push({
        isCluster: false,
        id: venue.id,
        lat: vLat,
        lng: vLng,
        venues: [venue],
      })
      processed.add(venue.id)
    }
  }

  return clusters
}

// Component to handle Map bounds and zoom events
function MapEvents({
  onBoundsChange,
  onZoomChange,
}: {
  onBoundsChange?: (bounds: [number, number, number, number]) => void
  onZoomChange?: (zoom: number) => void
}) {
  const map = useMapEvents({
    moveend: () => {
      triggerUpdate()
    },
    zoomend: () => {
      triggerUpdate()
    },
  })

  const triggerUpdate = () => {
    const bounds = map.getBounds()
    if (onBoundsChange) {
      onBoundsChange([
        bounds.getSouthWest().lat,
        bounds.getSouthWest().lng,
        bounds.getNorthEast().lat,
        bounds.getNorthEast().lng,
      ])
    }
    if (onZoomChange) {
      onZoomChange(map.getZoom())
    }
  }

  // Trigger once on mount
  useEffect(() => {
    triggerUpdate()
  }, [])

  return null
}

// Component to programmatically pan and center the map
function MapController({
  selectedVenue,
  center,
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
    if (
      selectedVenue &&
      selectedVenue.lat !== undefined &&
      selectedVenue.lng !== undefined &&
      selectedVenue.lat !== null &&
      selectedVenue.lng !== null
    ) {
      map.setView([selectedVenue.lat, selectedVenue.lng], 15, {
        animate: true,
        duration: 1.0,
      })
    }
  }, [selectedVenue, map])

  return null
}

// Component to render markers and clusters
function MapMarkers({
  venues,
  onSelectVenue,
  currentZoom,
}: {
  venues: Venue[]
  onSelectVenue?: (venue: Venue) => void
  currentZoom: number
}) {
  const map = useMap()
  const validVenues = venues.filter(
    (v) => v.lat !== undefined && v.lng !== undefined && v.lat !== null && v.lng !== null
  )
  const clusters = getClusters(validVenues, currentZoom)

  return (
    <>
      {clusters.map((cluster) => {
        if (cluster.isCluster) {
          const totalEvents = cluster.venues.reduce((sum, v) => sum + (v.events?.length || 0), 0)

          const clusterIcon = L.divIcon({
            html: `
              <div class="relative flex items-center justify-center w-10 h-10 rounded-full bg-[#8367C7] text-white font-bold border-2 border-white shadow-lg cursor-pointer transform hover:scale-105 transition-transform duration-150">
                <span>${cluster.venues.length}</span>
                ${
                  totalEvents > 0
                    ? `
                  <span class="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#73D8D4] opacity-75"></span>
                    <span class="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#73D8D4]"></span>
                  </span>
                `
                    : ''
                }
              </div>
            `,
            className: 'custom-cluster-icon',
            iconSize: [40, 40],
            iconAnchor: [20, 20],
          })

          return (
            <Marker
              key={cluster.id}
              position={[cluster.lat, cluster.lng]}
              icon={clusterIcon}
              eventHandlers={{
                click: () => {
                  map.setView([cluster.lat, cluster.lng], Math.min(map.getZoom() + 2, 18), {
                    animate: true,
                    duration: 0.5,
                  })
                },
              }}
            >
              <Tooltip direction="top" offset={[0, -10]} opacity={0.95}>
                <div className="p-1 text-xs font-sans text-[#3A3A3A] bg-[#F5F0E9] rounded border border-gray-200/50">
                  <p className="font-bold border-b border-gray-250/30 pb-0.5 mb-1 text-[#3A3A3A]">
                    {cluster.venues.length} Locales
                  </p>
                  <p className="text-gray-600 font-medium">{totalEvents} Eventos programados</p>
                  <p className="text-[10px] text-[#8367C7] mt-0.5 italic font-semibold">
                    Haz click para ampliar
                  </p>
                </div>
              </Tooltip>
            </Marker>
          )
        } else {
          const venue = cluster.venues[0]
          return (
            <Marker
              key={venue.id}
              position={[venue.lat!, venue.lng!]}
              icon={venue.type?.split(',').includes('comunidad') ? communityIcon! : purpleIcon!}
              eventHandlers={{
                click: () => {
                  if (onSelectVenue) {
                    onSelectVenue(venue)
                  }
                },
              }}
            />
          )
        }
      })}
    </>
  )
}

export default function Map({
  center,
  zoom = DEFAULT_ZOOM,
  venues = [],
  onSelectVenue,
  selectedVenue = null,
  onBoundsChange,
}: MapProps) {
  const initialCenter = center || DEFAULT_CENTER
  const [currentZoom, setCurrentZoom] = useState(zoom)

  return (
    <div className="w-full h-full relative z-0" data-testid="map-container">
      <MapContainer
        center={initialCenter}
        zoom={zoom}
        scrollWheelZoom={true}
        zoomControl={false}
        className="w-full h-full"
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        <ZoomControl position="topright" />

        <MapController selectedVenue={selectedVenue} center={center} />
        <MapEvents onBoundsChange={onBoundsChange} onZoomChange={setCurrentZoom} />

        <MapMarkers venues={venues} onSelectVenue={onSelectVenue} currentZoom={currentZoom} />
      </MapContainer>
    </div>
  )
}
