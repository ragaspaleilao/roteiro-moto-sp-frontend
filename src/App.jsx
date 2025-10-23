import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Bike, MapPin, DollarSign, Calendar, Fuel, Navigation, Hotel, Utensils, Search, CheckCircle2, Circle, ExternalLink, Upload, Image, Video, ArrowDownUp, Building, Camera, Save, Youtube } from 'lucide-react'
import './App.css'
import roteirosData from './assets/roteiros_sp_moto_agrupados.csv?raw'
import InteractiveMap from './components/InteractiveMap.jsx'
import AuthModal from './components/AuthModal.jsx'
import MemberArea from './components/MemberArea.jsx'

function App() {
  const [roteiros, setRoteiros] = useState([])
  const [filteredRoteiros, setFilteredRoteiros] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTipo, setSelectedTipo] = useState('Todos')
  const [completedRoutes, setCompletedRoutes] = useState({})
  const [routeMedia, setRouteMedia] = useState({})
  const [member, setMember] = useState(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showMemberArea, setShowMemberArea] = useState(false)
  const [sortOrder, setSortOrder] = useState('distancia-desc')

  // Load data from localStorage on initial render
  // App.jsx

// ... (mantenha todos os 'useState' do início)

// SUBSTITUA O PRIMEIRO useEffect POR ESTE BLOCO COMPLETO
useEffect(() => {
  const savedCompleted = localStorage.getItem('completedRoutes');
  const savedMedia = localStorage.getItem('routeMedia');
  const savedRoteiros = localStorage.getItem('roteiros');

  if (savedCompleted) {
    setCompletedRoutes(JSON.parse(savedCompleted));
  }
  if (savedMedia) {
    setRouteMedia(JSON.parse(savedMedia));
  }

  // Lógica para carregar os roteiros (mantida como está)
  if (savedRoteiros) {
    setRoteiros(JSON.parse(savedRoteiros));
  } else {
    // ... (seu código de parsing do CSV continua aqui, sem alterações)
    const lines = roteirosData.trim().split('\n');
    const parsedRoteiros = lines.slice(1).map((line, index) => {
      // ... (código de parsing)
      const values = [];
      let currentValue = '';
      let insideQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          insideQuotes = !insideQuotes;
        } else if (char === ',' && !insideQuotes) {
          values.push(currentValue);
          currentValue = '';
        } else {
          currentValue += char;
        }
      }
      values.push(currentValue);
      const municipios = values[1].replace(/[\[\]\']/g, '').split(',').map(m => m.trim()).filter(m => m.length > 0);
      return { id: index + 1, tipo: values[0], municipios: municipios, distancia_total_km: parseFloat(values[2]), custo_combustivel: parseFloat(values[3]), custo_pedagio: parseFloat(values[4]), custo_alimentacao: parseFloat(values[5]), custo_estadia: parseFloat(values[6]), custo_total: parseFloat(values[7]) };
    });
    setRoteiros(parsedRoteiros);
  }

  // ===== INÍCIO DA LÓGICA ADICIONADA =====
  const checkMembershipStatus = async () => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      try {
        const response = await fetch('https://roteiro-moto-sp-backend.onrender.com/api/auth/check-membership', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        } );
        
        if (response.ok) {
          const data = await response.json();
          // Atualiza o estado do membro com os dados mais recentes do backend
          setMember(prevMember => ({ ...prevMember, ...data }));
          // Mostra a área de membros se a assinatura estiver ativa
          if (data.is_active) {
            setShowMemberArea(true);
          }
        } else {
          // Se o token for inválido ou expirado, faz o logout
          handleLogout();
        }
      } catch (error) {
        console.error('Error checking membership status:', error);
      }
    }
  };

  checkMembershipStatus();
  // ===== FIM DA LÓGICA ADICIONADA =====

}, []); // O array vazio no final é importante, garante que isso só rode uma vez quando o app carrega

// ... (o resto do seu App.jsx continua igual)


  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('completedRoutes', JSON.stringify(completedRoutes))
  }, [completedRoutes])

  useEffect(() => {
    localStorage.setItem('routeMedia', JSON.stringify(routeMedia))
  }, [routeMedia])

  useEffect(() => {
    localStorage.setItem('roteiros', JSON.stringify(roteiros))
  }, [roteiros])

  // Filtering and Sorting Logic
  useEffect(() => {
    let currentFiltered = [...roteiros]

    if (selectedTipo !== 'Todos') {
      currentFiltered = currentFiltered.filter(r => r.tipo === selectedTipo)
    }

    if (searchTerm) {
      currentFiltered = currentFiltered.filter(r => 
        r.municipios.some(m => 
          m.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    }

    switch (sortOrder) {
      case 'distancia-desc':
        currentFiltered.sort((a, b) => b.distancia_total_km - a.distancia_total_km)
        break
      case 'distancia-asc':
        currentFiltered.sort((a, b) => a.distancia_total_km - b.distancia_total_km)
        break
      case 'alfabetica':
        currentFiltered.sort((a, b) => a.municipios[0].localeCompare(b.municipios[0]))
        break
    }

    setFilteredRoteiros(currentFiltered)
  }, [searchTerm, selectedTipo, roteiros, sortOrder])

  const toggleRouteCompletion = (routeId) => {
    setCompletedRoutes(prev => ({
      ...prev,
      [routeId]: !prev[routeId]
    }))
  }

  const handleFileUpload = (routeId, event) => {
    const files = Array.from(event.target.files)
    const filePromises = files.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          resolve({
            name: file.name,
            type: file.type,
            data: reader.result
          })
        }
        reader.readAsDataURL(file)
      })
    })

    Promise.all(filePromises).then(fileData => {
      setRouteMedia(prev => ({
        ...prev,
        [routeId]: [...(prev[routeId] || []), ...fileData]
      }))
    }).catch(error => {
      console.error("Error uploading files:", error)
      alert("Erro ao fazer upload dos arquivos. Tente novamente.")
    })
  }

  const removeMedia = (routeId, mediaIndex) => {
    setRouteMedia(prev => ({
      ...prev,
      [routeId]: prev[routeId].filter((_, index) => index !== mediaIndex)
    }))
  }

  const handleValueChange = useCallback((routeId, field, value) => {
    setRoteiros(prevRoteiros =>
      prevRoteiros.map(route =>
        route.id === routeId ? { ...route, [field]: parseFloat(value) || 0 } : route
      )
    )
  }, [])

  const getGoogleMapsUrl = (municipio) => {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(municipio + ', São Paulo, Brasil')}`
  }

  const getBookingUrl = (municipio) => {
    return `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(municipio + ', São Paulo, Brasil')}`
  }

  const getAirbnbUrl = (municipio) => {
    return `https://www.airbnb.com.br/s/${encodeURIComponent(municipio + '--São-Paulo--Brasil')}/homes`
  }

  const getPontosTuristicosUrl = (municipio) => {
    return `https://www.google.com/search?q=pontos+turisticos+em+${encodeURIComponent(municipio + ', São Paulo')}`
  }

  const getYouTubeSearchUrl = (municipio) => {
    return `https://www.youtube.com/results?search_query=${encodeURIComponent('viagem de moto ' + municipio + ' São Paulo')}`
  }

  // Calculate totals for dashboard based on *uncompleted* routes
  const uncompletedRoteiros = roteiros.filter(r => !completedRoutes[r.id])
  const totalCustoPendente = uncompletedRoteiros.reduce((sum, r) => sum + r.custo_total, 0)
  const totalDistanciaPendente = uncompletedRoteiros.reduce((sum, r) => sum + r.distancia_total_km, 0)
  const totalMunicipiosPendentes = uncompletedRoteiros.reduce((sum, r) => sum + r.municipios.length, 0)
  const totalRoteirosPendentes = uncompletedRoteiros.length


  const handleAuthSuccess = (memberData) => {
    setMember(memberData)
    setShowMemberArea(true)
  }

  const handleLogout = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('member_data')
    setMember(null)
    setShowMemberArea(false)
  }

  // App.jsx

const handleSubscribe = async (priceId) => { // O parâmetro é 'priceId'
  console.log('ID do Preço selecionado:', priceId); // Usando 'priceId'

  try {
    const token = localStorage.getItem('auth_token');
    const response = await fetch('https://roteiro-moto-sp-backend.onrender.com/api/subscription/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        plan: priceId, // A chave é 'plan', mas o valor vem da variável 'priceId'
        success_url: window.location.origin + '/success',
        cancel_url: window.location.origin
      } )
    });

    const data = await response.json();
    if (data.checkout_url) {
      window.location.href = data.checkout_url;
    } else {
      // Este alerta é importante se o backend falhar
      alert('Ocorreu um erro ao obter a URL de pagamento. Verifique o console do backend.');
      console.error('Resposta do servidor sem checkout_url:', data);
    }
  } catch (error) {
    console.error('Error creating checkout session:', error);
    alert('Erro ao criar sessão de pagamento');
  }
};


  const handleManageSubscription = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch('/api/subscription/customer-portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          return_url: window.location.origin
        })
      })

      const data = await response.json()
      if (data.portal_url) {
        window.location.href = data.portal_url
      }
    } catch (error) {
      console.error('Error creating portal session:', error)
      alert('Erro ao acessar portal de gerenciamento')
    }
  }

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
            <div className="flex items-center gap-2">
              {member ? (
                <>
                  <Button variant="outline" onClick={() => setShowMemberArea(!showMemberArea)}>
                    Área de Membros
                  </Button>
                  <Button variant="ghost" onClick={handleLogout}>
                    Sair
                  </Button>
                </>
              ) : (
                <Button onClick={() => setShowAuthModal(true)}>
                  Entrar / Cadastrar
                </Button>
              )}
            </div>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Navigation className="w-4 h-4" />
                Roteiros Pendentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalRoteirosPendentes}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Concluídos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{Object.keys(completedRoutes).length}</div>
              <div className="text-xs mt-1 opacity-90">
                {roteiros.length > 0 ? ((Object.keys(completedRoutes).length / roteiros.length) * 100).toFixed(1) : 0}% completo
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Municípios Pendentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalMunicipiosPendentes}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Fuel className="w-4 h-4" />
                Distância Pendente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalDistanciaPendente.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} km</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-pink-500 to-pink-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Custo Pendente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">R$ {totalCustoPendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Sort */}
        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Filtros e Ordenação
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
              <div className="flex gap-2 flex-wrap">
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
                <Select value={sortOrder} onValueChange={setSortOrder}>
                  <SelectTrigger className="w-[220px]">
                    <ArrowDownUp className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Ordenar por" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="distancia-desc">Distância (Maior primeiro)</SelectItem>
                    <SelectItem value="distancia-asc">Distância (Menor primeiro)</SelectItem>
                    <SelectItem value="alfabetica">Ordem Alfabética</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Interactive Map */}
        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Mapa Interativo - Municípios Concluídos
            </CardTitle>
            <CardDescription>
              Os municípios destacados em verde são aqueles que você já visitou
            </CardDescription>
          </CardHeader>
          <CardContent>
            <InteractiveMap completedRoutes={completedRoutes} roteiros={roteiros} />
          </CardContent>
        </Card>

        {/* Roteiros List */}
        <div className="space-y-6">
          {filteredRoteiros.map((roteiro) => (
            <Card 
              key={roteiro.id} 
              className={`hover:shadow-xl transition-all duration-300 border-2 ${
                completedRoutes[roteiro.id] 
                  ? 'border-green-400 bg-green-50/50' 
                  : 'hover:border-blue-300'
              }`}
            >
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
                      {completedRoutes[roteiro.id] && (
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Concluído
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-xl mb-3">
                      {roteiro.municipios.map((municipio, index) => (
                        <span key={index}>
                          {index > 0 && ', '}
                          <a
                            href={getGoogleMapsUrl(municipio)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-1"
                          >
                            {municipio}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </span>
                      ))}
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
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Navigation className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Distância</div>
                      <Input
                        type="number"
                        value={roteiro.distancia_total_km.toFixed(0)}
                        onChange={(e) => handleValueChange(roteiro.id, 'distancia_total_km', e.target.value)}
                        className="font-semibold w-24"
                      />
                      <span className="ml-1">km</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Fuel className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Combustível</div>
                      <Input
                        type="number"
                        value={roteiro.custo_combustivel.toFixed(2)}
                        onChange={(e) => handleValueChange(roteiro.id, 'custo_combustivel', e.target.value)}
                        className="font-semibold w-24"
                      />
                      <span className="ml-1">R$</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <DollarSign className="w-4 h-4 text-orange-600" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Pedágio</div>
                      <Input
                        type="number"
                        value={roteiro.custo_pedagio.toFixed(2)}
                        onChange={(e) => handleValueChange(roteiro.id, 'custo_pedagio', e.target.value)}
                        className="font-semibold w-24"
                      />
                      <span className="ml-1">R$</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Utensils className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Alimentação</div>
                      <Input
                        type="number"
                        value={roteiro.custo_alimentacao.toFixed(2)}
                        onChange={(e) => handleValueChange(roteiro.id, 'custo_alimentacao', e.target.value)}
                        className="font-semibold w-24"
                      />
                      <span className="ml-1">R$</span>
                    </div>
                  </div>
                  
                  {roteiro.custo_estadia > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-pink-100 rounded-lg">
                        <Hotel className="w-4 h-4 text-pink-600" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Estadia</div>
                        <Input
                          type="number"
                          value={roteiro.custo_estadia.toFixed(2)}
                          onChange={(e) => handleValueChange(roteiro.id, 'custo_estadia', e.target.value)}
                          className="font-semibold w-24"
                        />
                        <span className="ml-1">R$</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Media Gallery */}
                {routeMedia[roteiro.id] && routeMedia[roteiro.id].length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <Image className="w-4 h-4" />
                      Fotos e Vídeos ({routeMedia[roteiro.id].length})
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {routeMedia[roteiro.id].map((media, index) => (
                        <div key={index} className="relative group">
                          {media.type.startsWith('image/') ? (
                            <img 
                              src={media.data} 
                              alt={media.name}
                              className="w-full h-32 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-full h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                              <Video className="w-8 h-8 text-gray-500" />
                            </div>
                          )}
                          <button
                            onClick={() => removeMedia(roteiro.id, index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 flex-wrap">
                  <Button
                    variant={completedRoutes[roteiro.id] ? 'default' : 'outline'}
                    onClick={() => toggleRouteCompletion(roteiro.id)}
                    className="flex items-center gap-2"
                  >
                    {completedRoutes[roteiro.id] ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        Concluído
                      </>
                    ) : (
                      <>
                        <Circle className="w-4 h-4" />
                        Marcar como Concluído
                      </>
                    )}
                  </Button>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="flex items-center gap-2">
                        <Upload className="w-4 h-4" />
                        Upload de Mídia
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Upload de Fotos e Vídeos</DialogTitle>
                        <DialogDescription>
                          Adicione fotos e vídeos da sua viagem para o roteiro #{roteiro.id}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Input
                          type="file"
                          accept="image/*,video/*"
                          multiple
                          onChange={(e) => handleFileUpload(roteiro.id, e)}
                          className="cursor-pointer"
                        />
                        <p className="text-sm text-gray-500">
                          Você pode selecionar múltiplos arquivos de uma vez. As mídias serão armazenadas localmente no seu navegador.
                        </p>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <a href={getBookingUrl(roteiro.municipios[0])} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="flex items-center gap-2">
                      <Building className="w-4 h-4" />
                      Booking.com
                    </Button>
                  </a>

                  <a href={getAirbnbUrl(roteiro.municipios[0])} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="flex items-center gap-2">
                      <Building className="w-4 h-4" />
                      Airbnb
                    </Button>
                  </a>

                  <a href={getPontosTuristicosUrl(roteiro.municipios[0])} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="flex items-center gap-2">
                      <Camera className="w-4 h-4" />
                      Pontos Turísticos
                    </Button>
                  </a>

                  <a href={getYouTubeSearchUrl(roteiro.municipios[0])} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="flex items-center gap-2">
                      <Youtube className="w-4 h-4" />
                      Vídeos de Viagem
                    </Button>
                  </a>
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
      {/* Member Area */}
      {showMemberArea && member && (
        <div className="container mx-auto px-4 py-8">
          <MemberArea 
            member={member} 
            onSubscribe={handleSubscribe}
            onManageSubscription={handleManageSubscription}
          />
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={handleAuthSuccess}
      />


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

