import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Bike, MapPin, DollarSign, Calendar, Fuel, Navigation, Hotel, Utensils, Search } from 'lucide-react'
import './App.css'
import roteirosData from './assets/roteiros_sp_moto_agrupados.csv?raw'

function App() {
  const [roteiros, setRoteiros] = useState([])
  const [filteredRoteiros, setFilteredRoteiros] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTipo, setSelectedTipo] = useState('Todos')

  useEffect(() => {
    // Parse CSV data
    const lines = roteirosData.trim().split('\n')
    const headers = lines[0].split(',')
    
    const parsedRoteiros = lines.slice(1).map((line, index) => {
      // Handle CSV parsing with potential commas in quoted strings
      const values = []
      let currentValue = ''
      let insideQuotes = false
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i]
        if (char === '"') {
          insideQuotes = !insideQuotes
        } else if (char === ',' && !insideQuotes) {
          values.push(currentValue)
          currentValue = ''
        } else {
          currentValue += char
        }
      }
      values.push(currentValue)
      
      const municipios = values[1]
        .replace(/[\[\]']/g, '')
        .split(',')
        .map(m => m.trim())
        .filter(m => m.length > 0)
      
      return {
        id: index + 1,
        tipo: values[0],
        municipios: municipios,
        distancia_total_km: parseFloat(values[2]),
        custo_combustivel: parseFloat(values[3]),
        custo_pedagio: parseFloat(values[4]),
        custo_alimentacao: parseFloat(values[5]),
        custo_estadia: parseFloat(values[6]),
        custo_total: parseFloat(values[7])
      }
    })
    
    setRoteiros(parsedRoteiros)
    setFilteredRoteiros(parsedRoteiros)
  }, [])

  useEffect(() => {
    let filtered = roteiros

    // Filter by tipo
    if (selectedTipo !== 'Todos') {
      filtered = filtered.filter(r => r.tipo === selectedTipo)
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(r => 
        r.municipios.some(m => 
          m.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    }

    setFilteredRoteiros(filtered)
  }, [searchTerm, selectedTipo, roteiros])

  const totalCusto = filteredRoteiros.reduce((sum, r) => sum + r.custo_total, 0)
  const totalDistancia = filteredRoteiros.reduce((sum, r) => sum + r.distancia_total_km, 0)
  const totalMunicipios = filteredRoteiros.reduce((sum, r) => sum + r.municipios.length, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-orange-500 rounded-xl shadow-lg">
                <Bike className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-orange-600 bg-clip-text text-transparent">
                  Roteiro de Moto por São Paulo
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Partindo de São Caetano do Sul
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Navigation className="w-4 h-4" />
                Total de Roteiros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{filteredRoteiros.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Municípios
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalMunicipios}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Fuel className="w-4 h-4" />
                Distância Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalDistancia.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} km</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Custo Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">R$ {totalCusto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Buscar por município..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={selectedTipo === 'Todos' ? 'default' : 'outline'}
                  onClick={() => setSelectedTipo('Todos')}
                >
                  Todos
                </Button>
                <Button
                  variant={selectedTipo === 'Dia' ? 'default' : 'outline'}
                  onClick={() => setSelectedTipo('Dia')}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Dia
                </Button>
                <Button
                  variant={selectedTipo === 'Final de Semana (Pernoite)' ? 'default' : 'outline'}
                  onClick={() => setSelectedTipo('Final de Semana (Pernoite)')}
                >
                  <Hotel className="w-4 h-4 mr-2" />
                  Pernoite
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Roteiros List */}
        <div className="space-y-6">
          {filteredRoteiros.map((roteiro) => (
            <Card key={roteiro.id} className="hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-300">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge variant={roteiro.tipo === 'Dia' ? 'default' : 'secondary'} className="text-sm">
                        {roteiro.tipo === 'Dia' ? (
                          <><Calendar className="w-3 h-3 mr-1" /> Dia</>
                        ) : (
                          <><Hotel className="w-3 h-3 mr-1" /> Pernoite</>
                        )}
                      </Badge>
                      <span className="text-sm text-gray-500">Roteiro #{roteiro.id}</span>
                    </div>
                    <CardTitle className="text-xl mb-2">
                      {roteiro.municipios.join(', ')}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {roteiro.municipios.length} {roteiro.municipios.length === 1 ? 'município' : 'municípios'}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-blue-600">
                      R$ {roteiro.custo_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-sm text-gray-500">Custo Total</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Navigation className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Distância</div>
                      <div className="font-semibold">{roteiro.distancia_total_km.toFixed(0)} km</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Fuel className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Combustível</div>
                      <div className="font-semibold">R$ {roteiro.custo_combustivel.toFixed(2)}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <DollarSign className="w-4 h-4 text-orange-600" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Pedágio</div>
                      <div className="font-semibold">R$ {roteiro.custo_pedagio.toFixed(2)}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Utensils className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Alimentação</div>
                      <div className="font-semibold">R$ {roteiro.custo_alimentacao.toFixed(2)}</div>
                    </div>
                  </div>
                  
                  {roteiro.custo_estadia > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-pink-100 rounded-lg">
                        <Hotel className="w-4 h-4 text-pink-600" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Estadia</div>
                        <div className="font-semibold">R$ {roteiro.custo_estadia.toFixed(2)}</div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredRoteiros.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <MapPin className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 text-lg">Nenhum roteiro encontrado com os filtros selecionados.</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-100 border-t border-gray-200 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-gray-600">
            <p className="mb-2">
              <strong>Veículo:</strong> Suzuki Boulevard M800 (2011) | <strong>Consumo:</strong> 18 km/l
            </p>
            <p className="text-sm">
              Os valores são estimativas e podem variar. Verifique as condições antes de cada viagem.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App

