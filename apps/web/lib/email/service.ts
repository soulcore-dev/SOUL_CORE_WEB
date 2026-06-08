/**
 * SoulCore Email Service — centralized email sending via Google
 * Workspace SMTP (nodemailer over smtp.gmail.com:587 with STARTTLS).
 *
 * Why this transport:
 * - Sovereignty: we already pay Workspace; one provider for inbox + outbox.
 * - No SPF/DKIM conflicts: outbound uses google._domainkey already in DNS.
 * - 2,000 emails/day quota per Workspace user (more than enough).
 *
 * Auth: SMTP_USER (full address like founder@soulcore.dev) +
 * SMTP_APP_PASSWORD (16-char Google App Password). 2-Step Verification
 * must be enabled on the Google account to generate App Passwords.
 *
 * Note on `from`: Gmail SMTP will rewrite the "From" header to your
 * authenticated user UNLESS the address is a verified "Send mail as"
 * alias in Workspace. To send as hello@soulcore.dev with auth as
 * founder@soulcore.dev, configure the alias in Gmail Settings →
 * Accounts → Send mail as. Until then, FROM is set to SMTP_USER.
 */
import nodemailer, { type Transporter } from 'nodemailer'
import { transactionalEmail, receiptEmail } from './templates'

const SMTP_USER = process.env.SMTP_USER ?? ''
const SMTP_PASS = process.env.SMTP_APP_PASSWORD ?? ''
const FROM = process.env.FROM_EMAIL || SMTP_USER || 'hello@soulcore.dev'
const REPLY_TO = process.env.REPLY_TO_EMAIL || FROM
const PORTAL_URL = 'https://soulcore.dev/es/account'

/**
 * Single, reused SMTP transporter. Pool=true keeps a small connection
 * pool open so we don't re-auth on every send.
 */
const transporter: Transporter | null = SMTP_USER && SMTP_PASS
  ? nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // STARTTLS upgrade
      auth: { user: SMTP_USER, pass: SMTP_PASS },
      pool: true,
      maxConnections: 3,
      maxMessages: 100,
    })
  : null

interface SendResult {
  success: boolean
  messageId?: string
  error?: string
}

/**
 * Low-level send. Exported so non-template senders (e.g. the contact
 * form admin notification) can compose their own HTML and still go
 * through the centralized transport / FROM / logging path.
 */
export async function send(to: string, subject: string, html: string): Promise<SendResult> {
  if (!transporter) {
    console.warn('[email] SMTP not configured — email not sent to', to)
    return { success: false, error: 'SMTP not configured' }
  }

  try {
    const info = await transporter.sendMail({
      from: FROM.includes('<') ? FROM : `SoulCore <${FROM}>`,
      to,
      replyTo: REPLY_TO,
      subject,
      html,
    })
    console.log(`[email] Sent "${subject}" to ${to} — id: ${info.messageId}`)
    return { success: true, messageId: info.messageId }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[email] SMTP send failed:', message)
    return { success: false, error: message }
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
