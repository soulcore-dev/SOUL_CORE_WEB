/**
 * SoulCore Email Templates — HTML generators
 * 3 base layouts: transactional, receipt, marketing
 */

const BRAND = {
  name: 'SoulCore',
  url: 'https://soulcore.dev',
  logo: 'https://soulcore.dev/logo_black.png',
  color: '#8B5CF6',
  colorDark: '#6D28D9',
  bg: '#0F0F14',
  bgCard: '#1A1A24',
  textPrimary: '#FFFFFF',
  textSecondary: '#9CA3AF',
  address: 'SoulCore Dev — soulcore.dev',
}

function baseLayout(content: string, footer: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="dark">
  <meta name="supported-color-schemes" content="dark">
  <style>
    body { margin: 0; padding: 0; background-color: ${BRAND.bg}; color: ${BRAND.textPrimary}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; padding: 24px 16px; }
    .card { background-color: ${BRAND.bgCard}; border-radius: 16px; border: 1px solid #2D2D3A; padding: 32px; margin: 16px 0; }
    .btn { display: inline-block; padding: 12px 28px; background-color: ${BRAND.color}; color: #FFFFFF !important; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 14px; }
    .btn:hover { background-color: ${BRAND.colorDark}; }
    .footer { text-align: center; color: ${BRAND.textSecondary}; font-size: 12px; padding: 24px 0; line-height: 1.6; }
    .footer a { color: ${BRAND.textSecondary}; }
    .logo { height: 40px; margin-bottom: 16px; }
    .divider { border: none; border-top: 1px solid #2D2D3A; margin: 24px 0; }
    .mono { font-family: 'SF Mono', 'Fira Code', monospace; background: #111118; border: 1px solid #2D2D3A; border-radius: 8px; padding: 12px 16px; font-size: 13px; word-break: break-all; color: ${BRAND.color}; }
    .label { color: ${BRAND.textSecondary}; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
    .value { color: ${BRAND.textPrimary}; font-size: 16px; font-weight: 600; }
    h1 { font-size: 24px; margin: 0 0 8px; }
    h2 { font-size: 18px; margin: 0 0 8px; color: ${BRAND.textPrimary}; }
    p { color: ${BRAND.textSecondary}; line-height: 1.6; margin: 0 0 16px; }
    @media (prefers-color-scheme: light) {
      body { background-color: #F3F4F6; color: #111827; }
      .card { background-color: #FFFFFF; border-color: #E5E7EB; }
      .mono { background: #F9FAFB; border-color: #E5E7EB; }
      p { color: #6B7280; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div style="text-align: center; padding: 16px 0;">
      <a href="${BRAND.url}"><img src="${BRAND.logo}" alt="${BRAND.name}" class="logo"></a>
    </div>
    ${content}
    <div class="footer">
      ${footer}
      <p style="margin-top: 12px;">${BRAND.address}</p>
    </div>
  </div>
</body>
</html>`
}

// ============================================
// TRANSACTIONAL TEMPLATE
// ============================================
export function transactionalEmail(params: {
  greeting: string
  body: string
  ctaText?: string
  ctaUrl?: string
  note?: string
}): string {
  const cta = params.ctaUrl
    ? `<div style="text-align: center; margin: 24px 0;"><a href="${params.ctaUrl}" class="btn">${params.ctaText || 'Ir a SoulCore'}</a></div>`
    : ''

  const note = params.note
    ? `<p style="font-size: 12px; color: ${BRAND.textSecondary}; margin-top: 16px;">${params.note}</p>`
    : ''

  const content = `
    <div class="card">
      <h1>${params.greeting}</h1>
      ${params.body}
      ${cta}
      ${note}
    </div>`

  const footer = `<p>${BRAND.name} &mdash; <a href="${BRAND.url}">soulcore.dev</a></p>`

  return baseLayout(content, footer)
}

// ============================================
// RECEIPT TEMPLATE
// ============================================
export function receiptEmail(params: {
  productName: string
  amount: string
  date: string
  orderId: string
  licenseKey: string
  downloadUrl?: string
  portalUrl: string
  isSubscription?: boolean
  nextBillingDate?: string
}): string {
  const download = params.downloadUrl
    ? `<a href="${params.downloadUrl}" class="btn" style="margin-right: 8px;">Descargar</a>`
    : ''

  const subscription = params.isSubscription && params.nextBillingDate
    ? `<div style="margin-top: 12px;"><span class="label">Pr&oacute;ximo cobro</span><br><span class="value">${params.nextBillingDate}</span></div>`
    : ''

  const content = `
    <div class="card">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
        <h1>Recibo</h1>
        <span style="color: ${BRAND.color}; font-size: 12px; font-weight: 600;">CONFIRMADO</span>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
        <div><span class="label">Producto</span><br><span class="value">${params.productName}</span></div>
        <div><span class="label">Monto</span><br><span class="value">${params.amount}</span></div>
        <div><span class="label">Fecha</span><br><span class="value">${params.date}</span></div>
        <div><span class="label">Ref</span><br><span class="value" style="font-size: 13px;">${params.orderId}</span></div>
      </div>
      ${subscription}

      <hr class="divider">

      <span class="label">Tu clave de licencia</span>
      <div class="mono">${params.licenseKey}</div>
      <p style="font-size: 12px; margin-top: 8px;">Guarda esta clave &mdash; la necesitas para activar el producto e iniciar sesi&oacute;n.</p>

      <hr class="divider">

      <div style="text-align: center;">
        ${download}
        <a href="${params.portalUrl}" class="btn">Mi Cuenta</a>
      </div>
    </div>`

  const footer = `<p>${BRAND.name} &mdash; <a href="${BRAND.url}">soulcore.dev</a></p>`

  return baseLayout(content, footer)
}

// ============================================
// MARKETING TEMPLATE
// ============================================
export function marketingEmail(params: {
  headline: string
  body: string
  ctaText: string
  ctaUrl: string
  unsubscribeUrl: string
  preferencesUrl: string
}): string {
  const content = `
    <div class="card">
      <h1>${params.headline}</h1>
      ${params.body}
      <div style="text-align: center; margin: 24px 0;">
        <a href="${params.ctaUrl}" class="btn">${params.ctaText}</a>
      </div>
    </div>`

  const footer = `
    <p>${BRAND.name} &mdash; <a href="${BRAND.url}">soulcore.dev</a></p>
    <p>
      <a href="${params.unsubscribeUrl}">Desuscribirse</a> &nbsp;|&nbsp;
      <a href="${params.preferencesUrl}">Gestionar preferencias</a>
    </p>`

  return baseLayout(content, footer)
}
