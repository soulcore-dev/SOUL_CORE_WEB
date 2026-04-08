import { NextRequest, NextResponse } from 'next/server'
import { transactionalEmail, receiptEmail, marketingEmail } from '@/lib/email/templates'
import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null
const FROM = process.env.FROM_EMAIL ?? 'SoulCore <hello@soulcore.dev>'

// Mock data for previews
const M = {
  name: 'Randhy Paul',
  email: 'ranx043@gmail.com',
  product: 'Agent Blackboard',
  slug: 'agent-blackboard',
  key: 'SOULCORE-0000-0001-DEMO-XXXX-XXXX-XXXX-FFFF-PREVIEW-KEY-1234',
  amount: '$49.99',
  orderId: 'ord_demo_12345',
  nextBilling: '8 de mayo, 2026',
  accessEnd: '8 de mayo, 2026',
  portal: 'https://soulcore.dev/es/account',
  download: 'https://soulcore.dev/api/licenses/download/demo',
  repo: 'https://github.com/soulcore-dev/agent-blackboard',
  reset: 'https://soulcore.dev/es/account/reset?token=demo',
  whopBilling: 'https://whop.com/billing',
}

function renderTemplate(id: string): string | null {
  switch (id) {
    case 'T1':
      return transactionalEmail({
        greeting: `Hola ${M.name}`,
        body: '<p>Gracias por unirte a SoulCore. Tu cuenta est&aacute; lista.</p><p>Desde tu portal puedes ver tus productos, licencias y dispositivos vinculados.</p>',
        ctaText: 'Ir a Mi Cuenta',
        ctaUrl: M.portal,
      })

    case 'T3':
      return receiptEmail({
        productName: M.product,
        amount: M.amount,
        date: new Date().toLocaleDateString('es-DO', { year: 'numeric', month: 'long', day: 'numeric' }),
        orderId: M.orderId,
        licenseKey: M.key,
        downloadUrl: M.download,
        portalUrl: M.portal,
      })

    case 'T3-free':
      return transactionalEmail({
        greeting: `Tu licencia de ${M.product}`,
        body: `<p>Aqu&iacute; est&aacute; tu clave de licencia gratuita:</p><div class="mono">${M.key}</div><p style="font-size:12px;margin-top:8px;">Guarda esta clave &mdash; la necesitas para iniciar sesi&oacute;n en tu portal.</p><p><a href="${M.repo}" style="color:#8B5CF6;">Ver en GitHub &rarr;</a></p>`,
        ctaText: 'Ir a Mi Cuenta',
        ctaUrl: M.portal,
        note: 'Este es un producto gratuito. No se te ha cobrado nada.',
      })

    case 'T4':
      return receiptEmail({
        productName: M.product,
        amount: `${M.amount}/mes`,
        date: new Date().toLocaleDateString('es-DO', { year: 'numeric', month: 'long', day: 'numeric' }),
        orderId: M.orderId,
        licenseKey: M.key,
        downloadUrl: M.download,
        portalUrl: M.portal,
        isSubscription: true,
        nextBillingDate: M.nextBilling,
      })

    case 'T5':
      return transactionalEmail({
        greeting: 'Renovaci&oacute;n exitosa',
        body: `<p>Tu suscripci&oacute;n de <strong>${M.product}</strong> se renov&oacute; correctamente.</p><p><strong>Monto:</strong> ${M.amount}<br><strong>Pr&oacute;ximo cobro:</strong> ${M.nextBilling}</p>`,
        ctaText: 'Ver Mi Cuenta',
        ctaUrl: M.portal,
      })

    case 'T6':
      return transactionalEmail({
        greeting: 'Problema con tu pago',
        body: `<p>No pudimos procesar el cobro de tu suscripci&oacute;n de <strong>${M.product}</strong>.</p><p>Por favor actualiza tu m&eacute;todo de pago para mantener tu acceso.</p>`,
        ctaText: 'Actualizar M&eacute;todo de Pago',
        ctaUrl: M.whopBilling,
        note: 'Si no actualizas en 7 d&iacute;as, tu licencia ser&aacute; suspendida.',
      })

    case 'T7':
      return transactionalEmail({
        greeting: 'Suscripci&oacute;n cancelada',
        body: `<p>Tu suscripci&oacute;n de <strong>${M.product}</strong> ha sido cancelada.</p><p>Tu acceso contin&uacute;a activo hasta el <strong>${M.accessEnd}</strong>.</p><p>Si cambias de opini&oacute;n, puedes reactivar desde tu portal en cualquier momento.</p>`,
        ctaText: 'Mi Cuenta',
        ctaUrl: M.portal,
      })

    case 'T10':
      return transactionalEmail({
        greeting: 'Restablecer contrase&ntilde;a',
        body: '<p>Recibimos una solicitud para restablecer tu contrase&ntilde;a.</p><p>Si no fuiste t&uacute;, ignora este email.</p>',
        ctaText: 'Restablecer Contrase&ntilde;a',
        ctaUrl: M.reset,
        note: 'Este enlace expira en 1 hora.',
      })

    case 'L1':
      return marketingEmail({
        headline: 'Empieza en 5 minutos',
        body: `<p>Hola ${M.name},</p><p>Tu producto <strong>${M.product}</strong> est&aacute; listo. Aqu&iacute; tienes una gu&iacute;a r&aacute;pida:</p><ol style="color:#9CA3AF;line-height:2;"><li>Copia tu license key desde Mi Cuenta</li><li>Instala: <code style="background:#111118;padding:2px 6px;border-radius:4px;font-size:12px;">npm install ${M.slug}</code></li><li>Configura la key en tu proyecto</li><li>Listo — empieza a usar</li></ol>`,
        ctaText: 'Ver Documentaci&oacute;n',
        ctaUrl: M.repo,
        unsubscribeUrl: `${M.portal}/preferences?unsub=lifecycle`,
        preferencesUrl: `${M.portal}/preferences`,
      })

    default:
      return null
  }
}

// GET — render preview
export async function GET(request: NextRequest) {
  const templateId = request.nextUrl.searchParams.get('template')
  if (!templateId) {
    return NextResponse.json({ error: 'template param required' }, { status: 400 })
  }

  const html = renderTemplate(templateId)
  if (!html) {
    return NextResponse.json({ error: 'Template not implemented' }, { status: 404 })
  }

  return NextResponse.json({ html, templateId })
}

// POST — send test email
export async function POST(request: NextRequest) {
  const { template, to } = await request.json()

  if (!template || !to) {
    return NextResponse.json({ error: 'template and to required' }, { status: 400 })
  }

  const html = renderTemplate(template)
  if (!html) {
    return NextResponse.json({ error: 'Template not implemented' }, { status: 404 })
  }

  if (!resend) {
    return NextResponse.json({ error: 'Resend not configured' }, { status: 503 })
  }

  const tmplName = template.toUpperCase()
  const result = await resend.emails.send({
    from: FROM,
    to,
    subject: `[TEST] SoulCore Email — ${tmplName}`,
    html,
  })

  if (result.error) {
    return NextResponse.json({ error: result.error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, messageId: result.data?.id })
}
