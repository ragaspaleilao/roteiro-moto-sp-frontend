import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Crown, Gift, Percent, MapPin, Users, Calendar, ExternalLink, CreditCard } from 'lucide-react'

const MemberArea = ({ member, onSubscribe, onManageSubscription }) => {
  const [benefits, setBenefits] = useState([
    {
      id: 1,
      category: 'Produtos',
      icon: Gift,
      title: '20% de desconto em equipamentos',
      description: 'Capacetes, jaquetas, luvas e acessórios',
      partners: ['Motosafe', 'Rider Shop', 'MotoGear'],
      coupon: 'MEMBRO20'
    },
    {
      id: 2,
      category: 'Serviços',
      icon: Percent,
      title: '15% de desconto em hospedagem',
      description: 'Hotéis e pousadas parceiras',
      partners: ['Pousada do Motociclista', 'Hotel Rota SP'],
      coupon: 'HOSPEDA15'
    },
    {
      id: 3,
      category: 'Serviços',
      icon: MapPin,
      title: '10% de desconto em oficinas',
      description: 'Manutenção e revisão',
      partners: ['Oficina Moto Express', 'Mecânica Rota'],
      coupon: 'MANUTENCAO10'
    },
    {
      id: 4,
      category: 'Conteúdo',
      icon: Users,
      title: 'Comunidade exclusiva',
      description: 'Grupo privado com outros motociclistas',
      partners: ['WhatsApp', 'Telegram'],
      coupon: null
    },
    {
      id: 5,
      category: 'Conteúdo',
      icon: Calendar,
      title: 'Eventos exclusivos',
      description: 'Encontros e viagens em grupo',
      partners: ['Eventos mensais'],
      coupon: null
    }
  ])

  const isActiveMember = member?.subscription_status === 'active'

  return (
    <div className="space-y-6">
      {/* Membership Status Card */}
      <Card className={`border-2 ${isActiveMember ? 'border-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-50' : 'border-gray-300'}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-full ${isActiveMember ? 'bg-yellow-400' : 'bg-gray-300'}`}>
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl">
                  {isActiveMember ? 'Membro Ativo' : 'Torne-se Membro'}
                </CardTitle>
                <CardDescription>
                  {isActiveMember 
                    ? `Plano ${member.subscription_plan || 'mensal'} - Aproveite seus benefícios!`
                    : 'Acesse benefícios exclusivos para motociclistas'}
                </CardDescription>
              </div>
            </div>
            {isActiveMember ? (
              <Badge variant="default" className="bg-green-600">Ativo</Badge>
            ) : (
              <Badge variant="outline">Inativo</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isActiveMember ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Plano:</span>
                  <p className="font-semibold capitalize">{member.subscription_plan}</p>
                </div>
                <div>
                  <span className="text-gray-600">Status:</span>
                  <p className="font-semibold capitalize">{member.subscription_status}</p>
                </div>
              </div>
              <Button onClick={onManageSubscription} variant="outline" className="w-full">
                <CreditCard className="mr-2 h-4 w-4" />
                Gerenciar Assinatura
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-gray-700">
                Assine agora e tenha acesso a descontos exclusivos em produtos e serviços, 
                comunidade privada e eventos especiais para motociclistas.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg hover:border-blue-500 transition-colors cursor-pointer" onClick={() => onSubscribe('monthly')}>
                  <h4 className="font-semibold">Mensal</h4>
                  <p className="text-2xl font-bold text-blue-600">R$ 29,90</p>
                  <p className="text-sm text-gray-600">por mês</p>
                </div>
                <div className="p-4 border-2 border-blue-500 rounded-lg bg-blue-50 cursor-pointer" onClick={() => onSubscribe('quarterly')}>
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold">Trimestral</h4>
                    <Badge variant="default" className="text-xs">-10%</Badge>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">R$ 79,90</p>
                  <p className="text-sm text-gray-600">por 3 meses</p>
                </div>
                <div className="p-4 border rounded-lg hover:border-blue-500 transition-colors cursor-pointer" onClick={() => onSubscribe('annual')}>
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold">Anual</h4>
                    <Badge variant="default" className="text-xs">-16%</Badge>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">R$ 299,90</p>
                  <p className="text-sm text-gray-600">por ano</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Benefits Grid */}
      {isActiveMember && (
        <div className="space-y-4">
          <h3 className="text-2xl font-bold">Seus Benefícios Exclusivos</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {benefits.map((benefit) => {
              const IconComponent = benefit.icon
              return (
                <Card key={benefit.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <IconComponent className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <Badge variant="outline" className="mb-2">{benefit.category}</Badge>
                        <CardTitle className="text-lg">{benefit.title}</CardTitle>
                        <CardDescription>{benefit.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-1">Parceiros:</p>
                        <div className="flex flex-wrap gap-1">
                          {benefit.partners.map((partner, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {partner}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      {benefit.coupon && (
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-3 rounded-lg border border-blue-200">
                          <p className="text-xs text-gray-600 mb-1">Cupom de desconto:</p>
                          <div className="flex items-center justify-between">
                            <code className="text-lg font-bold text-blue-600">{benefit.coupon}</code>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                navigator.clipboard.writeText(benefit.coupon)
                                alert('Cupom copiado!')
                              }}
                            >
                              Copiar
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default MemberArea

