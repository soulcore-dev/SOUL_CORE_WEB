# SoulCore Store — Plan de Emails y Comunicaciones

> Documento generado por reunión de 6 agentes: Email Architect, Client Dev, Client Enterprise, Client Free User, Platform UX Strategist, Security Engineer.
> Fecha: 2026-04-08

---

## Arquitectura General

```mermaid
graph TB
    subgraph Triggers["Fuentes de Eventos"]
        WHOP[Whop Webhooks]
        LS[License Server Go]
        WEB[Next.js Frontend]
        CRON[Cron Jobs]
    end

    subgraph EmailEngine["Motor de Emails"]
        QUEUE[Cola de Emails]
        TMPL[Template Engine]
        RESEND[Resend API]
    end

    subgraph Templates["3 Templates Base"]
        BT[base-transactional]
        BM[base-marketing]
        BR[base-receipt]
    end

    subgraph Storage["Datos"]
        DB[(SQLite - customers)]
        PREFS[Email Preferences]
        AUDIT[Audit Log]
    end

    WHOP -->|membership events| QUEUE
    LS -->|license events| QUEUE
    WEB -->|user actions| QUEUE
    CRON -->|scheduled checks| QUEUE

    QUEUE --> TMPL
    TMPL --> BT & BM & BR
    BT & BM & BR --> RESEND
    RESEND -->|delivery status| AUDIT

    DB --> TMPL
    PREFS -->|opt-in check| QUEUE
```

---

## Familia 1: Transaccionales — Cuenta

Emails relacionados con la cuenta del usuario. NO requieren opt-in (son necesarios para el servicio).

```mermaid
sequenceDiagram
    participant U as Usuario
    participant W as Web (Next.js)
    participant LS as License Server
    participant R as Resend

    Note over U,R: REGISTRO
    U->>W: Crea cuenta (email)
    W->>LS: POST /customers
    LS->>R: T1 — welcome
    R->>U: Bienvenida + verificar email

    Note over U,R: VERIFICACIÓN
    U->>W: Click link verificación
    W->>LS: Verify token
    LS-->>U: Cuenta verificada

    Note over U,R: PASSWORD RESET
    U->>W: "Olvidé mi contraseña"
    W->>LS: POST /auth/reset
    LS->>R: T10 — password-reset
    R->>U: Link reset (expira 1h)
```

### Emails de esta familia

| ID | Nombre | Template | Trigger | Contenido | Timing |
|----|--------|----------|---------|-----------|--------|
| T1 | `welcome` | base-transactional | Registro de cuenta | Logo + "Bienvenido a SoulCore" + verificar email + link dashboard | Inmediato |
| T2 | `verify-email` | base-transactional | Click "reenviar verificación" | Token/link verificación (expira 24h) | Inmediato |
| T10 | `password-reset` | base-transactional | Solicitud reset | Link reset (expira 1h) + "Si no fuiste tú, ignora" | Inmediato |

### Datos necesarios
- `email`, `name`, `locale`, `verification_token`, `reset_token`

---

## Familia 2: Transaccionales — Compra y Licencia

Emails relacionados con la adquisición de productos. El corazón del negocio.

```mermaid
sequenceDiagram
    participant U as Usuario
    participant WH as Whop
    participant LS as License Server
    participant R as Resend

    Note over U,R: COMPRA ÚNICA
    U->>WH: Paga en Whop checkout
    WH->>LS: webhook membership.went_valid
    LS->>LS: Genera license key ECDSA
    LS->>R: T3 — purchase-single
    R->>U: Recibo + license key + link descarga

    Note over U,R: SUSCRIPCIÓN
    U->>WH: Paga suscripción
    WH->>LS: webhook membership.went_valid (plan: renewal)
    LS->>LS: Genera license key con expiración
    LS->>R: T4 — subscription-start
    R->>U: Recibo + license key + período + próxima fecha cobro

    Note over U,R: PRODUCTO GRATIS
    U->>LS: POST /api/free-license (email)
    LS->>LS: Genera license key perpetua
    LS->>R: T3-free — free-license
    R->>U: License key + link descarga + link GitHub
```

### Emails de esta familia

| ID | Nombre | Template | Trigger | Contenido | Timing |
|----|--------|----------|---------|-----------|--------|
| T3 | `purchase-single` | base-receipt | Whop webhook (one_time) | Recibo PDF + license key + link descarga firmado + specs producto | Inmediato |
| T3-free | `free-license` | base-transactional | POST /api/free-license | License key + link descarga + link repo GitHub | Inmediato |
| T4 | `subscription-start` | base-receipt | Whop webhook (renewal) | Recibo + license key + período + fecha próximo cobro + link portal | Inmediato |
| T8 | `license-activated` | base-transactional | Machine binding | "Licencia activada en [device]" + dispositivos restantes + link gestión | Inmediato |
| T9 | `license-revoked` | base-transactional | Admin revoca | Motivo + alternativas + link soporte | Inmediato |

### Datos necesarios
- `email`, `name`, `product_name`, `product_slug`, `license_key`, `price_formatted`, `receipt_url`, `download_url`, `subscription_period`, `next_billing_date`, `machine_count`, `max_machines`

---

## Familia 3: Transaccionales — Billing y Pagos

Gestión de pagos, renovaciones, fallos, reembolsos.

```mermaid
sequenceDiagram
    participant WH as Whop
    participant LS as License Server
    participant R as Resend
    participant U as Usuario

    Note over WH,U: RENOVACIÓN EXITOSA
    WH->>LS: webhook membership.renewed
    LS->>LS: Extender expiración licencia
    LS->>R: T5 — subscription-renewed
    R->>U: Recibo renovación + próximo ciclo

    Note over WH,U: PAGO FALLIDO
    WH->>LS: webhook payment.failed
    LS->>R: T6 — payment-failed
    R->>U: Alerta + link actualizar método pago
    Note right of R: Retry: D+3, D+7

    Note over WH,U: CANCELACIÓN
    WH->>LS: webhook membership.went_invalid
    LS->>LS: Suspender licencias
    LS->>R: T7 — subscription-cancelled
    R->>U: Confirmación + fecha fin acceso + oferta win-back

    Note over WH,U: REEMBOLSO
    WH->>LS: webhook refund
    LS->>LS: Revocar licencia
    LS->>R: T11 — refund-issued
    R->>U: Confirmación reembolso + licencia desactivada
```

### Emails de esta familia

| ID | Nombre | Template | Trigger | Contenido | Timing |
|----|--------|----------|---------|-----------|--------|
| T5 | `subscription-renewed` | base-receipt | Whop renewal webhook | Recibo + confirmación próximo ciclo + monto | Inmediato |
| T6 | `payment-failed` | base-transactional | Whop payment failed | Alerta + link Whop para actualizar método + "tienes X días" | Inmediato, retry D+3, D+7 |
| T7 | `subscription-cancelled` | base-transactional | Whop went_invalid | Confirmación + fecha fin acceso + "puedes reactivar hasta [fecha]" | Inmediato |
| T11 | `refund-issued` | base-receipt | Admin/Whop refund | Monto reembolsado + licencia desactivada + timeline | Inmediato |

### Datos necesarios
- `email`, `name`, `product_name`, `amount_formatted`, `currency`, `next_billing_date`, `access_end_date`, `payment_update_url`, `refund_amount`

---

## Familia 4: Transaccionales — Producto

Actualizaciones de producto, nuevas versiones, changelog.

```mermaid
sequenceDiagram
    participant ADMIN as Admin
    participant LS as License Server
    participant R as Resend
    participant U as Usuarios con licencia

    ADMIN->>LS: Publica nueva versión
    LS->>LS: Query: usuarios con licencia activa de este producto
    LS->>R: T12 — product-update (batch)
    R->>U: Changelog + link descarga nueva versión
```

### Emails de esta familia

| ID | Nombre | Template | Trigger | Contenido | Timing |
|----|--------|----------|---------|-----------|--------|
| T12 | `product-update` | base-transactional | Admin publica versión | Changelog resumido + link descarga + "qué hay nuevo" | Al publicar |

### Datos necesarios
- `email`, `name`, `product_name`, `old_version`, `new_version`, `changelog_summary`, `download_url`

---

## Familia 5: Lifecycle — Onboarding y Activación

Emails que guían al usuario nuevo. Requieren opt-in marketing (excepto L1 que es parte del servicio).

```mermaid
stateDiagram-v2
    [*] --> Registrado: Crea cuenta
    Registrado --> Activado: Instala + usa producto
    Registrado --> Inactivo48h: No activa en 48h

    Inactivo48h --> Activado: Email L1 → activa
    Inactivo48h --> Abandonado: No responde

    Activado --> Engaged: Usa >3 veces/semana
    Activado --> Dormido: No usa en 14 días

    state Engaged {
        [*] --> TipEmail: D+7 — L2
        TipEmail --> NPS: D+30 — L6
    }
```

### Emails de esta familia

| ID | Nombre | Template | Trigger | Contenido | Timing |
|----|--------|----------|---------|-----------|--------|
| L1 | `onboarding-quickstart` | base-marketing | Registro + no activó en 48h | Guía paso a paso + código ejemplo + "5 minutos para empezar" | D+1 (si activó: skip) |
| L2 | `tip-tecnico` | base-marketing | D+7 post-registro | Caso de uso avanzado + integración con herramienta popular | D+7 |
| L6 | `nps-survey` | base-marketing | D+30 post-registro | "¿Qué tan probable es que recomiendes SoulCore?" (1-10) + campo libre | D+30 |

### Reglas (del cliente dev):
- **Máximo 3-4 emails el primer mes**
- Si el usuario activó el producto rápido, skip L1
- Tips deben ser técnicos reales, no marketing disfrazado

---

## Familia 6: Lifecycle — Retención y Revenue

Emails para mantener usuarios activos y generar upgrades.

```mermaid
stateDiagram-v2
    [*] --> Activo: Usa producto
    Activo --> PreExpiracion: 7 días antes de vencer
    PreExpiracion --> Renovado: Paga renovación
    PreExpiracion --> Expirado: No renueva

    Activo --> Inactivo: 30 días sin login
    Inactivo --> Reactivado: Email L5 → vuelve
    Inactivo --> Churned: 60 días sin respuesta

    Expirado --> Winback: Email L4
    Winback --> Reactivado: Acepta oferta
    Winback --> Perdido: No responde

    Activo --> Upgrade: Llega a límite natural del free tier
```

### Emails de esta familia

| ID | Nombre | Template | Trigger | Contenido | Timing |
|----|--------|----------|---------|-----------|--------|
| L3 | `subscription-expiring` | base-marketing | Suscripción vence en 7 días | "Tu licencia de [producto] vence el [fecha]" + CTA renovar | D-7, D-1 |
| L4 | `winback` | base-marketing | Canceló suscripción | "Qué hay nuevo desde que te fuiste" + oferta especial | D+7 post-cancel |
| L5 | `re-engagement` | base-marketing | 30 días sin login | "¿Sigues usando [producto]?" + novedades + link directo | D+30, D+60 |

### Reglas (del cliente free user):
- **El upgrade debe sentirse natural, no forzado**
- Mostrar límite alcanzado, no popup de venta
- Máximo 1 email de lifecycle por mes post-onboarding
- Win-back: máximo 2 intentos, luego silencio

---

## Familia 7: Enterprise

Emails específicos para clientes corporativos.

```mermaid
flowchart LR
    subgraph Trial["Trial Equipo"]
        A[Quote request] --> B[Trial 3-5 devs]
        B --> C[Evaluación 2 semanas]
    end

    subgraph Purchase["Compra"]
        C --> D[Quote formal PDF]
        D --> E[PO / Facturación]
        E --> F[Onboarding masivo]
    end

    subgraph Ongoing["Operación"]
        F --> G[Uso mensual report]
        G --> H[Renovación D-30]
        H --> I[Invoice anual]
    end
```

### Emails enterprise (adicionales a los anteriores)

| ID | Nombre | Template | Trigger | Contenido |
|----|--------|----------|---------|-----------|
| E1 | `team-trial-invite` | base-transactional | Admin invita dev al trial | "Tu equipo te invitó a probar [producto]" + setup |
| E2 | `quote-formal` | base-receipt | Solicitud de quote | PDF: desglose seats, precio unitario, descuento volumen, total anual |
| E3 | `seats-usage-report` | base-transactional | Mensual (cron) | X/Y seats usados + quién activó + recomendación |
| E4 | `renewal-notice-enterprise` | base-transactional | D-30 antes de vencer | "Su contrato vence el [fecha]" + quote renovación adjunto |

### Documentos necesarios (PDFs generables):
- Quote formal con desglose
- Invoice/factura con datos fiscales
- DPA (Data Processing Agreement)
- SLA document

---

## Templates Base HTML

### 1. `base-transactional`
```
┌─────────────────────────────┐
│  [Logo SoulCore]            │
├─────────────────────────────┤
│                             │
│  Hola {name},               │
│                             │
│  {contenido principal}      │
│                             │
│  [CTA Button]               │
│                             │
├─────────────────────────────┤
│  SoulCore Dev               │
│  soulcore.dev               │
│  {dirección física}         │
└─────────────────────────────┘
```
- Sin imágenes pesadas, max 600px ancho
- Dark mode compatible (prefers-color-scheme)
- Plain text fallback automático

### 2. `base-receipt`
```
┌─────────────────────────────┐
│  [Logo] RECIBO              │
├─────────────────────────────┤
│  Producto: {name}           │
│  Monto:    {price}          │
│  Fecha:    {date}           │
│  Ref:      {order_id}       │
├─────────────────────────────┤
│  License Key:               │
│  ┌─────────────────────┐    │
│  │ XXXX-XXXX-XXXX-XXXX │    │
│  └─────────────────────┘    │
│                             │
│  [Descargar] [Mi Cuenta]    │
├─────────────────────────────┤
│  Footer legal               │
└─────────────────────────────┘
```

### 3. `base-marketing`
```
┌─────────────────────────────┐
│  [Logo SoulCore]            │
├─────────────────────────────┤
│  {hero image/banner}        │
│                             │
│  {contenido}                │
│                             │
│  [CTA principal]            │
│                             │
├─────────────────────────────┤
│  Footer + Unsubscribe link  │
│  "Gestionar preferencias"   │
└─────────────────────────────┘
```
- DEBE tener link de unsubscribe (CAN-SPAM/GDPR)
- DEBE tener link "gestionar preferencias"

---

## Compliance y Seguridad

### GDPR
- **Opt-in explícito** para emails marketing (checkbox desmarcado por defecto)
- **Transaccionales** no necesitan opt-in (necesarios para el servicio)
- **Unsubscribe** en 1 click, efectivo inmediato
- **Doble opt-in** recomendado para newsletters

### CAN-SPAM
- Dirección física en footer de CADA email
- Subject no engañoso
- Identificar como publicidad si es marketing

### DNS (configurar en Resend)
- **SPF**: `v=spf1 include:resend.com ~all`
- **DKIM**: activar en Resend (2048-bit)
- **DMARC**: `v=DMARC1; p=quarantine; pct=100; rua=mailto:dmarc@soulcore.dev`

### Datos del cliente

| Dato | Retención | Borrable por GDPR |
|------|-----------|-------------------|
| Email + nombre | Mientras cuenta activa | Sí (pseudoanonimizar) |
| License keys | Mientras cuenta activa | Sí (revocar + borrar) |
| Payment refs (Whop ID) | 7 años (fiscal) | No |
| IPs de activación | 90 días rolling | Sí |
| Historial compras | 7 años (fiscal) | No (montos + fechas se mantienen) |
| Email preferences | Mientras cuenta activa | Sí |

### DELETE Account Flow
1. Usuario solicita → confirmar vía email
2. Pseudoanonimizar: email → `SHA256(email+salt)`, nombre → `DELETED_USER`
3. Conservar: order_id, montos, fechas (fiscal)
4. Revocar licencias activas
5. Eliminar de listas Resend
6. Plazo: ≤30 días

### Audit Log
```sql
CREATE TABLE email_audit_log (
    id INTEGER PRIMARY KEY,
    message_id TEXT,           -- Resend message ID
    email_hash TEXT,           -- SHA256 del destinatario
    template_name TEXT,        -- "welcome", "purchase-single", etc
    status TEXT,               -- sent, bounced, opened, clicked
    consent_version TEXT,      -- versión T&C aceptada
    sent_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```
Retención: 90 días transaccionales, 30 días marketing.

---

## Datos del Usuario (schema)

```sql
-- Agregar a tabla customers existente
ALTER TABLE customers ADD COLUMN name TEXT;
ALTER TABLE customers ADD COLUMN locale TEXT DEFAULT 'es';
ALTER TABLE customers ADD COLUMN email_verified INTEGER DEFAULT 0;
ALTER TABLE customers ADD COLUMN marketing_opt_in INTEGER DEFAULT 0;
ALTER TABLE customers ADD COLUMN opt_in_at DATETIME;
ALTER TABLE customers ADD COLUMN last_login_at DATETIME;
ALTER TABLE customers ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP;

-- Preferencias de email
CREATE TABLE email_preferences (
    customer_id INTEGER PRIMARY KEY REFERENCES customers(id),
    transactional INTEGER DEFAULT 1,   -- siempre 1, no desactivable
    product_updates INTEGER DEFAULT 1,
    lifecycle INTEGER DEFAULT 1,
    marketing INTEGER DEFAULT 0,       -- opt-in explícito
    updated_at DATETIME
);
```

---

## Priorización

### P0 — Semana 1 (sin estos no hay tienda funcional)
- [ ] T1 `welcome` — Bienvenida con verificación
- [ ] T3 `purchase-single` — Recibo + license key (compra única)
- [ ] T3-free `free-license` — License key para productos gratis
- [ ] T4 `subscription-start` — Recibo + license key (suscripción)
- [ ] Template `base-transactional`
- [ ] Template `base-receipt`
- [ ] DNS: SPF + DKIM + DMARC

### P1 — Semana 2 (billing funcional)
- [ ] T5 `subscription-renewed` — Recibo renovación
- [ ] T6 `payment-failed` — Alerta pago fallido
- [ ] T7 `subscription-cancelled` — Confirmación cancelación
- [ ] T10 `password-reset` — Reset de contraseña
- [ ] L1 `onboarding-quickstart` — Guía setup
- [ ] L3 `subscription-expiring` — Recordatorio D-7

### P2 — Semana 3-4 (engagement)
- [ ] T8 `license-activated` — Device binding notification
- [ ] T12 `product-update` — Changelog nueva versión
- [ ] L2 `tip-tecnico` — Caso de uso D+7
- [ ] L5 `re-engagement` — Inactivo 30d
- [ ] Template `base-marketing`
- [ ] Email preferences page en portal
- [ ] Audit log table

### P3 — Mes 2+ (enterprise + growth)
- [ ] L4 `winback` — Recuperar churned
- [ ] L6 `nps-survey` — Encuesta satisfacción
- [ ] E1-E4 — Emails enterprise (trial, quote, seats, renewal)
- [ ] PDF generator (invoices, quotes, DPA)
- [ ] DELETE account flow
- [ ] Referral program emails

---

## Métricas a Trackear

| Métrica | Cómo | Herramienta |
|---------|------|-------------|
| Delivery rate | Resend dashboard | Resend |
| Open rate por template | Resend webhooks | SQLite audit log |
| Click rate en CTAs | Resend webhooks | SQLite audit log |
| Bounce rate | Resend suppression | Auto-cleanup |
| Spam complaints | Resend feedback loop | Alerta si >0.1% |
| Unsubscribe rate | Link tracking | SQLite preferences |
| Time to activation | license created_at - email sent_at | SQLite |
| Free→Paid conversion | Correlate free license → paid purchase | SQLite |

---

## Resumen Ejecutivo

- **22 emails** en 7 familias
- **3 templates base** HTML (transactional, receipt, marketing)
- **Provider**: Resend (ya configurado)
- **Compliance**: GDPR + CAN-SPAM + SPF/DKIM/DMARC
- **P0 en semana 1**: 4 emails + 2 templates + DNS = tienda funcional
- **Inversión total**: ~3 semanas para sistema completo
