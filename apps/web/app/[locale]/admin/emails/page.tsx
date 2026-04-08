'use client'

import { useState } from 'react'
import { Mail, Eye, Send, Copy, Check, ChevronDown } from 'lucide-react'
import { useTranslations } from 'next-intl'

// Mock data for previewing templates
const MOCK = {
  name: 'Randhy Paul',
  email: 'ranx043@gmail.com',
  productName: 'Agent Blackboard',
  productSlug: 'agent-blackboard',
  licenseKey: 'SOULCORE-0000-0001-DEMO-XXXX-XXXX-XXXX-FFFF-PREVIEW-KEY',
  amount: '$49.99',
  amountFree: 'Free',
  orderId: 'ord_demo_12345',
  nextBillingDate: '8 de mayo, 2026',
  accessEndDate: '8 de mayo, 2026',
  downloadUrl: 'https://soulcore.dev/api/licenses/download/agent-blackboard-v1.0.0.zip',
  repoUrl: 'https://github.com/soulcore-dev/agent-blackboard',
  resetUrl: 'https://soulcore.dev/es/account/reset?token=demo-token-xxx',
  portalUrl: 'https://soulcore.dev/es/account',
  updatePaymentUrl: 'https://whop.com/billing',
  oldVersion: '1.0.0',
  newVersion: '2.0.0',
  changelogSummary: 'Nuevo sistema de coordinación multi-agente con soporte para Claude 4.5 y GPT-5.',
}

interface EmailTemplate {
  id: string
  name: string
  family: string
  familyColor: string
  priority: string
  description: string
  status: 'implemented' | 'planned'
}

const TEMPLATES: EmailTemplate[] = [
  // Family 1: Account
  { id: 'T1', name: 'Bienvenida', family: 'Cuenta', familyColor: 'bg-violet-500/20 text-violet-400', priority: 'P0', description: 'Se envía al registrarse. Bienvenida + link al portal.', status: 'implemented' },
  { id: 'T2', name: 'Verificar Email', family: 'Cuenta', familyColor: 'bg-violet-500/20 text-violet-400', priority: 'P1', description: 'Link de verificación de email (expira 24h).', status: 'planned' },
  { id: 'T10', name: 'Reset Password', family: 'Cuenta', familyColor: 'bg-violet-500/20 text-violet-400', priority: 'P1', description: 'Link para restablecer contraseña (expira 1h).', status: 'implemented' },
  // Family 2: Purchase & License
  { id: 'T3', name: 'Recibo Compra Única', family: 'Compra', familyColor: 'bg-emerald-500/20 text-emerald-400', priority: 'P0', description: 'Recibo + license key + link descarga. Se envía al comprar.', status: 'implemented' },
  { id: 'T3-free', name: 'Licencia Gratuita', family: 'Compra', familyColor: 'bg-emerald-500/20 text-emerald-400', priority: 'P0', description: 'License key para productos gratis. Se envía al reclamar.', status: 'implemented' },
  { id: 'T4', name: 'Suscripción Iniciada', family: 'Compra', familyColor: 'bg-emerald-500/20 text-emerald-400', priority: 'P0', description: 'Recibo + license key + próximo cobro.', status: 'implemented' },
  { id: 'T8', name: 'Licencia Activada', family: 'Compra', familyColor: 'bg-emerald-500/20 text-emerald-400', priority: 'P2', description: 'Notificación de device binding. Muestra dispositivos restantes.', status: 'planned' },
  { id: 'T9', name: 'Licencia Revocada', family: 'Compra', familyColor: 'bg-emerald-500/20 text-emerald-400', priority: 'P2', description: 'Notificación cuando admin revoca una licencia.', status: 'planned' },
  // Family 3: Billing
  { id: 'T5', name: 'Renovación Exitosa', family: 'Billing', familyColor: 'bg-blue-500/20 text-blue-400', priority: 'P1', description: 'Recibo de renovación automática + próximo ciclo.', status: 'implemented' },
  { id: 'T6', name: 'Pago Fallido', family: 'Billing', familyColor: 'bg-blue-500/20 text-blue-400', priority: 'P1', description: 'Alerta de tarjeta rechazada + link para actualizar.', status: 'implemented' },
  { id: 'T7', name: 'Cancelación', family: 'Billing', familyColor: 'bg-blue-500/20 text-blue-400', priority: 'P1', description: 'Confirmación de cancelación + fecha fin de acceso.', status: 'implemented' },
  { id: 'T11', name: 'Reembolso', family: 'Billing', familyColor: 'bg-blue-500/20 text-blue-400', priority: 'P2', description: 'Confirmación de refund + licencia desactivada.', status: 'planned' },
  // Family 4: Product
  { id: 'T12', name: 'Update Disponible', family: 'Producto', familyColor: 'bg-amber-500/20 text-amber-400', priority: 'P2', description: 'Changelog + link descarga de nueva versión.', status: 'planned' },
  // Family 5: Onboarding
  { id: 'L1', name: 'Onboarding Quickstart', family: 'Lifecycle', familyColor: 'bg-pink-500/20 text-pink-400', priority: 'P1', description: 'Guía paso a paso. Se envía D+1 si no activó.', status: 'planned' },
  { id: 'L2', name: 'Tip Técnico', family: 'Lifecycle', familyColor: 'bg-pink-500/20 text-pink-400', priority: 'P2', description: 'Caso de uso avanzado. D+7 post-registro.', status: 'planned' },
  { id: 'L6', name: 'NPS Survey', family: 'Lifecycle', familyColor: 'bg-pink-500/20 text-pink-400', priority: 'P3', description: 'Encuesta de satisfacción (1-10). D+30.', status: 'planned' },
  // Family 6: Retention
  { id: 'L3', name: 'Expiración Próxima', family: 'Retención', familyColor: 'bg-orange-500/20 text-orange-400', priority: 'P1', description: 'Recordatorio 7 días antes de vencer.', status: 'planned' },
  { id: 'L4', name: 'Win-back', family: 'Retención', familyColor: 'bg-orange-500/20 text-orange-400', priority: 'P2', description: 'Recuperar usuario que canceló. D+7 post-cancel.', status: 'planned' },
  { id: 'L5', name: 'Re-engagement', family: 'Retención', familyColor: 'bg-orange-500/20 text-orange-400', priority: 'P2', description: 'Reactivar usuario inactivo 30 días.', status: 'planned' },
  // Family 7: Enterprise
  { id: 'E1', name: 'Team Trial Invite', family: 'Enterprise', familyColor: 'bg-cyan-500/20 text-cyan-400', priority: 'P3', description: 'Invitación a dev para trial de equipo.', status: 'planned' },
  { id: 'E2', name: 'Quote Formal', family: 'Enterprise', familyColor: 'bg-cyan-500/20 text-cyan-400', priority: 'P3', description: 'PDF con desglose por seats y precio.', status: 'planned' },
  { id: 'E3', name: 'Seats Usage Report', family: 'Enterprise', familyColor: 'bg-cyan-500/20 text-cyan-400', priority: 'P3', description: 'Reporte mensual de uso de licencias.', status: 'planned' },
  { id: 'E4', name: 'Renewal Notice Enterprise', family: 'Enterprise', familyColor: 'bg-cyan-500/20 text-cyan-400', priority: 'P3', description: 'Aviso 30 días antes de vencer contrato.', status: 'planned' },
]

export default function AdminEmailsPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [previewHtml, setPreviewHtml] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [sendingTo, setSendingTo] = useState('')
  const [sendResult, setSendResult] = useState<string | null>(null)
  const [filterFamily, setFilterFamily] = useState<string>('all')

  const families = ['all', ...new Set(TEMPLATES.map(t => t.family))]
  const filtered = filterFamily === 'all' ? TEMPLATES : TEMPLATES.filter(t => t.family === filterFamily)

  const implementedCount = TEMPLATES.filter(t => t.status === 'implemented').length
  const totalCount = TEMPLATES.length

  const handlePreview = async (templateId: string) => {
    setSelectedId(templateId)
    setLoading(true)
    setSendResult(null)

    try {
      const res = await fetch(`/api/admin/email-preview?template=${templateId}`)
      if (res.ok) {
        const data = await res.json()
        setPreviewHtml(data.html)
      } else {
        setPreviewHtml('<div style="padding:40px;color:#ff6b6b;text-align:center;">Template not implemented yet</div>')
      }
    } catch {
      setPreviewHtml('<div style="padding:40px;color:#ff6b6b;text-align:center;">Error loading preview</div>')
    } finally {
      setLoading(false)
    }
  }

  const handleSendTest = async () => {
    if (!selectedId || !sendingTo) return
    setSendResult('sending')
    try {
      const res = await fetch('/api/admin/email-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ template: selectedId, to: sendingTo }),
      })
      if (res.ok) {
        setSendResult('sent')
        setTimeout(() => setSendResult(null), 3000)
      } else {
        setSendResult('error')
      }
    } catch {
      setSendResult('error')
    }
  }

  return (
    <div className="pb-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Mail size={24} className="text-soul-purple" />
            Email Templates
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            {implementedCount}/{totalCount} implementados — Preview y test de todos los emails
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-semibold">
            {implementedCount} live
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-gray-700 text-gray-400 text-xs font-semibold">
            {totalCount - implementedCount} pending
          </div>
        </div>
      </div>

      {/* Family Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {families.map(f => (
          <button
            key={f}
            onClick={() => setFilterFamily(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filterFamily === f
                ? 'bg-soul-purple text-white'
                : 'bg-soul-dark-card border border-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            {f === 'all' ? 'Todos' : f}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Template List */}
        <div className="space-y-2">
          {filtered.map(tmpl => (
            <button
              key={tmpl.id}
              onClick={() => handlePreview(tmpl.id)}
              className={`w-full text-left p-4 rounded-xl border transition-all ${
                selectedId === tmpl.id
                  ? 'bg-soul-purple/10 border-soul-purple/50'
                  : 'bg-soul-dark-card border-gray-800 hover:border-gray-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-gray-500">{tmpl.id}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${tmpl.familyColor}`}>
                    {tmpl.family}
                  </span>
                  <span className={`text-xs px-1.5 py-0.5 rounded ${
                    tmpl.priority === 'P0' ? 'bg-red-500/20 text-red-400' :
                    tmpl.priority === 'P1' ? 'bg-amber-500/20 text-amber-400' :
                    tmpl.priority === 'P2' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-gray-700 text-gray-500'
                  }`}>
                    {tmpl.priority}
                  </span>
                </div>
                <span className={`text-xs font-medium ${
                  tmpl.status === 'implemented' ? 'text-emerald-400' : 'text-gray-600'
                }`}>
                  {tmpl.status === 'implemented' ? 'LIVE' : 'PENDING'}
                </span>
              </div>
              <h3 className="text-white font-semibold text-sm">{tmpl.name}</h3>
              <p className="text-gray-500 text-xs mt-0.5">{tmpl.description}</p>
            </button>
          ))}
        </div>

        {/* Right: Preview + Send Test */}
        <div className="sticky top-24">
          {selectedId ? (
            <div className="bg-soul-dark-card rounded-xl border border-gray-800 overflow-hidden">
              {/* Preview Header */}
              <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye size={16} className="text-soul-purple" />
                  <span className="text-white font-semibold text-sm">
                    Preview: {TEMPLATES.find(t => t.id === selectedId)?.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="email"
                    value={sendingTo}
                    onChange={e => setSendingTo(e.target.value)}
                    placeholder="test@email.com"
                    className="px-3 py-1.5 bg-soul-dark-lighter border border-gray-700 rounded-lg text-xs text-white w-44"
                  />
                  <button
                    onClick={handleSendTest}
                    disabled={!sendingTo || sendResult === 'sending'}
                    className="flex items-center gap-1 px-3 py-1.5 bg-soul-purple hover:bg-soul-purple-dark rounded-lg text-xs font-semibold text-white disabled:opacity-50 transition-all"
                  >
                    <Send size={12} />
                    {sendResult === 'sending' ? 'Enviando...' : sendResult === 'sent' ? 'Enviado!' : 'Test'}
                  </button>
                </div>
              </div>

              {/* Preview Frame */}
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="animate-spin h-6 w-6 border-2 border-soul-purple border-t-transparent rounded-full" />
                </div>
              ) : (
                <iframe
                  srcDoc={previewHtml}
                  className="w-full bg-white"
                  style={{ height: '600px', border: 'none' }}
                  title="Email Preview"
                />
              )}
            </div>
          ) : (
            <div className="bg-soul-dark-card rounded-xl border border-gray-800 flex items-center justify-center py-32">
              <div className="text-center">
                <Mail size={48} className="text-gray-700 mx-auto mb-4" />
                <p className="text-gray-500">Selecciona un template para previsualizar</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
