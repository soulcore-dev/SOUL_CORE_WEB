/**
 * SoulCore Email Service — centralized email sending via Resend
 * All emails go through here for consistency, logging, and compliance.
 */
import { Resend } from 'resend'
import { transactionalEmail, receiptEmail } from './templates'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null
const FROM = process.env.FROM_EMAIL ?? 'SoulCore <hello@send.soulcore.dev>'
const PORTAL_URL = 'https://soulcore.dev/es/account'

interface SendResult {
  success: boolean
  messageId?: string
  error?: string
}

async function send(to: string, subject: string, html: string): Promise<SendResult> {
  if (!resend) {
    console.warn('[email] Resend not configured — email not sent to', to)
    return { success: false, error: 'Resend not configured' }
  }

  try {
    const result = await resend.emails.send({
      from: FROM,
      to,
      subject,
      html,
    })

    if (result.error) {
      console.error('[email] Resend error:', result.error)
      return { success: false, error: result.error.message }
    }

    console.log(`[email] Sent "${subject}" to ${to} — id: ${result.data?.id}`)
    return { success: true, messageId: result.data?.id }
  } catch (err: any) {
    console.error('[email] Send failed:', err.message)
    return { success: false, error: err.message }
  }
}

// ============================================
// T1 — WELCOME
// ============================================
export async function sendWelcome(to: string, name?: string): Promise<SendResult> {
  const greeting = name ? `Hola ${name}` : 'Bienvenido a SoulCore'
  const html = transactionalEmail({
    greeting,
    body: `
      <p>Gracias por unirte a SoulCore. Tu cuenta est&aacute; lista.</p>
      <p>Desde tu portal puedes ver tus productos, licencias y dispositivos vinculados.</p>
    `,
    ctaText: 'Ir a Mi Cuenta',
    ctaUrl: PORTAL_URL,
  })

  return send(to, 'Bienvenido a SoulCore', html)
}

// ============================================
// T3 — PURCHASE (one-time)
// ============================================
export async function sendPurchaseReceipt(to: string, params: {
  productName: string
  amount: string
  licenseKey: string
  orderId: string
  downloadUrl?: string
}): Promise<SendResult> {
  const html = receiptEmail({
    productName: params.productName,
    amount: params.amount,
    date: new Date().toLocaleDateString('es-DO', { year: 'numeric', month: 'long', day: 'numeric' }),
    orderId: params.orderId,
    licenseKey: params.licenseKey,
    downloadUrl: params.downloadUrl,
    portalUrl: PORTAL_URL,
  })

  return send(to, `Recibo — ${params.productName}`, html)
}

// ============================================
// T3-free — FREE LICENSE
// ============================================
export async function sendFreeLicense(to: string, params: {
  productName: string
  licenseKey: string
  repoUrl?: string
}): Promise<SendResult> {
  const repoLink = params.repoUrl
    ? `<p><a href="${params.repoUrl}" style="color: ${('#8B5CF6')};">Ver en GitHub &rarr;</a></p>`
    : ''

  const html = transactionalEmail({
    greeting: `Tu licencia de ${params.productName}`,
    body: `
      <p>Aqu&iacute; est&aacute; tu clave de licencia gratuita:</p>
      <div class="mono">${params.licenseKey}</div>
      <p style="font-size: 12px; margin-top: 8px;">Guarda esta clave &mdash; la necesitas para iniciar sesi&oacute;n en tu portal.</p>
      ${repoLink}
    `,
    ctaText: 'Ir a Mi Cuenta',
    ctaUrl: PORTAL_URL,
    note: 'Este es un producto gratuito. No se te ha cobrado nada.',
  })

  return send(to, `Tu licencia gratuita — ${params.productName}`, html)
}

// ============================================
// T4 — SUBSCRIPTION START
// ============================================
export async function sendSubscriptionStart(to: string, params: {
  productName: string
  amount: string
  licenseKey: string
  orderId: string
  nextBillingDate: string
  downloadUrl?: string
}): Promise<SendResult> {
  const html = receiptEmail({
    productName: params.productName,
    amount: params.amount,
    date: new Date().toLocaleDateString('es-DO', { year: 'numeric', month: 'long', day: 'numeric' }),
    orderId: params.orderId,
    licenseKey: params.licenseKey,
    downloadUrl: params.downloadUrl,
    portalUrl: PORTAL_URL,
    isSubscription: true,
    nextBillingDate: params.nextBillingDate,
  })

  return send(to, `Suscripción activada — ${params.productName}`, html)
}

// ============================================
// T5 — SUBSCRIPTION RENEWED
// ============================================
export async function sendRenewalReceipt(to: string, params: {
  productName: string
  amount: string
  nextBillingDate: string
}): Promise<SendResult> {
  const html = transactionalEmail({
    greeting: 'Renovación exitosa',
    body: `
      <p>Tu suscripci&oacute;n de <strong>${params.productName}</strong> se renov&oacute; correctamente.</p>
      <p><strong>Monto:</strong> ${params.amount}<br>
      <strong>Pr&oacute;ximo cobro:</strong> ${params.nextBillingDate}</p>
    `,
    ctaText: 'Ver Mi Cuenta',
    ctaUrl: PORTAL_URL,
  })

  return send(to, `Renovación — ${params.productName}`, html)
}

// ============================================
// T6 — PAYMENT FAILED
// ============================================
export async function sendPaymentFailed(to: string, params: {
  productName: string
  updatePaymentUrl: string
}): Promise<SendResult> {
  const html = transactionalEmail({
    greeting: 'Problema con tu pago',
    body: `
      <p>No pudimos procesar el cobro de tu suscripci&oacute;n de <strong>${params.productName}</strong>.</p>
      <p>Por favor actualiza tu m&eacute;todo de pago para mantener tu acceso.</p>
    `,
    ctaText: 'Actualizar Método de Pago',
    ctaUrl: params.updatePaymentUrl,
    note: 'Si no actualizas en 7 días, tu licencia será suspendida.',
  })

  return send(to, `Acción requerida — Pago fallido`, html)
}

// ============================================
// T7 — SUBSCRIPTION CANCELLED
// ============================================
export async function sendCancellation(to: string, params: {
  productName: string
  accessEndDate: string
}): Promise<SendResult> {
  const html = transactionalEmail({
    greeting: 'Suscripción cancelada',
    body: `
      <p>Tu suscripci&oacute;n de <strong>${params.productName}</strong> ha sido cancelada.</p>
      <p>Tu acceso contin&uacute;a activo hasta el <strong>${params.accessEndDate}</strong>.</p>
      <p>Si cambias de opini&oacute;n, puedes reactivar desde tu portal en cualquier momento.</p>
    `,
    ctaText: 'Mi Cuenta',
    ctaUrl: PORTAL_URL,
  })

  return send(to, `Cancelación confirmada — ${params.productName}`, html)
}

// ============================================
// T10 — PASSWORD RESET
// ============================================
export async function sendPasswordReset(to: string, resetUrl: string): Promise<SendResult> {
  const html = transactionalEmail({
    greeting: 'Restablecer contraseña',
    body: `
      <p>Recibimos una solicitud para restablecer tu contrase&ntilde;a.</p>
      <p>Si no fuiste t&uacute;, ignora este email.</p>
    `,
    ctaText: 'Restablecer Contraseña',
    ctaUrl: resetUrl,
    note: 'Este enlace expira en 1 hora.',
  })

  return send(to, 'Restablecer contraseña — SoulCore', html)
}
