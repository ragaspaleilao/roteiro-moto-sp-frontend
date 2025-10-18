import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

const InteractiveMap = ({ completedRoutes, roteiros }) => {
  const [geoData, setGeoData] = useState(null)
  const [completedMunicipios, setCompletedMunicipios] = useState(new Set())

  // Load GeoJSON data
  useEffect(() => {
    fetch('/sp_municipios.geojson')
      .then(response => response.json())
      .then(data => setGeoData(data))
      .catch(error => console.error('Error loading GeoJSON:', error))
  }, [])

  // Calculate completed municipalities
  useEffect(() => {
    const completed = new Set()
    Object.keys(completedRoutes).forEach(routeId => {
      if (completedRoutes[routeId]) {
        const route = roteiros.find(r => r.id === parseInt(routeId))
        if (route) {
          route.municipios.forEach(municipio => {
            completed.add(municipio.toLowerCase().trim())
          })
        }
      }
    })
    setCompletedMunicipios(completed)
  }, [completedRoutes, roteiros])

  const getFeatureStyle = (feature) => {
    const municipioName = feature.properties.name?.toLowerCase().trim()
    const isCompleted = completedMunicipios.has(municipioName)

    return {
      fillColor: isCompleted ? '#22c55e' : '#e5e7eb',
      fillOpacity: isCompleted ? 0.7 : 0.3,
      color: isCompleted ? '#16a34a' : '#9ca3af',
      weight: isCompleted ? 2 : 1,
    }
  }

  const onEachFeature = (feature, layer) => {
    if (feature.properties && feature.properties.name) {
      const municipioName = feature.properties.name
      const isCompleted = completedMunicipios.has(municipioName.toLowerCase().trim())
      
      layer.bindPopup(`
        <div style="font-family: sans-serif;">
          <strong>${municipioName}</strong><br/>
          ${isCompleted ? '<span style="color: #16a34a;">✓ Concluído</span>' : '<span style="color: #9ca3af;">Pendente</span>'}
        </div>
      `)
    }
  }

  if (!geoData) {
    return (
      <div className="w-full h-[600px] bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">Carregando mapa...</p>
      </div>
    )
  }

  return (
    <div className="w-full h-[600px] rounded-lg overflow-hidden shadow-lg border-2 border-gray-200">
      <MapContainer
        center={[-23.5505, -46.6333]}
        zoom={7}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <GeoJSON
          data={geoData}
          style={getFeatureStyle}
          onEachFeature={onEachFeature}
        />
      </MapContainer>
    </div>
  )
}

export default InteractiveMap

