'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Monitor, Package, Loader2, Calendar, RefreshCw, Hash
} from 'lucide-react'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || ''

interface PortalDevice {
  id: number
  product_name: string
  machine_hash: string
  bound_at: string
  status: string
  rebind_count: number
  max_rebinds: number
}

function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    active: 'bg-emerald-400',
    inactive: 'bg-gray-400',
    revoked: 'bg-red-400',
  }

  return (
    <span className="flex items-center gap-2 text-sm text-gray-300">
      <span className={`w-2 h-2 rounded-full ${colors[status] || colors.active}`} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

function maskHash(hash: string): string {
  if (!hash) return '-'
  if (hash.length <= 16) return hash
  return hash.substring(0, 16) + '...'
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '-'
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return dateStr
  }
}

export default function DevicesPage() {
  const [devices, setDevices] = useState<PortalDevice[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDevices()
  }, [])

  async function loadDevices() {
    const token = sessionStorage.getItem('soulcore_customer_token')
    if (!token) return

    try {
      const res = await fetch(`${API_BASE}/api/licenses/portal/devices`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setDevices(data.data || data || [])
      }
    } catch {
      // fail silently
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-soul-purple" />
      </div>
    )
  }

  return (
    <div className="pb-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold text-white mb-1">My Devices</h1>
        <p className="text-gray-400">Devices bound to your licenses</p>
      </motion.div>

      {devices.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-soul-dark-card rounded-2xl border border-gray-800 p-12 text-center"
        >
          <Monitor size={48} className="text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg text-white font-semibold mb-2">No devices bound</h3>
          <p className="text-gray-400">Devices will appear here once you activate a license.</p>
        </motion.div>
      ) : (
        <div className="grid gap-4">
          {devices.map((device, i) => (
            <motion.div
              key={device.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-soul-dark-card rounded-2xl border border-gray-800 p-6 hover:border-soul-purple/30 transition-all duration-300"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                {/* Icon + Product + Hash */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                    <Monitor size={24} className="text-blue-400" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-white font-semibold truncate">{device.product_name}</h3>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Hash size={14} className="text-gray-500" />
                      <code className="text-sm text-gray-400 font-mono">{maskHash(device.machine_hash)}</code>
                    </div>
                  </div>
                </div>

                {/* Status + Date + Rebinds */}
                <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                  <StatusDot status={device.status} />
                  <div className="flex items-center gap-1.5 text-sm text-gray-400">
                    <Calendar size={14} />
                    <span>{formatDate(device.bound_at)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-gray-400" title="Rebinds used per year">
                    <RefreshCw size={14} />
                    <span>{device.rebind_count ?? 0}/{device.max_rebinds ?? 3} rebinds/yr</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
