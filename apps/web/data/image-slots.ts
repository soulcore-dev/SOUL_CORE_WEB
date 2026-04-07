/**
 * SoulCore Web — Image Factory Slots (Wave 1 + Wave 2)
 *
 * Wave 1: 12 service illustrations + 404 + 500 + empty store
 * Wave 2: Homepage sections + service page sections + store hero
 *
 * IMPORTANT: All illustrations must work on BOTH dark (#0F0F14) and light (#ffffff) modes.
 * Strategy: transparent PNG backgrounds, components handle theme-aware containers.
 */

export interface ImageSlot {
  id: string;
  filename: string;
  label: string;
  prompt: string;
  aspect: '16:9' | '4:3' | '1:1' | '3:1';
  usedIn: string;
  fallback?: string;
}

export interface SlotCategory {
  id: string;
  label: string;
  slots: ImageSlot[];
}

// Style for isometric illustrations — transparent bg for theme compatibility
const STYLE_ILLUST = 'Isometric flat 3D illustration, purple (#8B5CF6) and violet (#6D28D9) dominant colors, solid pure black background (#0F0F14), subject fading smoothly into black at edges, clean minimal design, soft ambient lighting, high detail, no text, no watermarks, no people, no grid pattern, no checkerboard.';

// Style for hero/section backgrounds — abstract, works as overlay
const STYLE_BG = 'Abstract digital art, purple (#8B5CF6) and deep violet (#6D28D9) color palette, flowing organic shapes with subtle glow, ethereal atmosphere, suitable as website background with text overlay, high resolution. No text, no watermarks.';

// ═══════════════════════════════════════
// HOMEPAGE — 7 sections need visuals
// ═══════════════════════════════════════
const HOMEPAGE_SLOTS: ImageSlot[] = [
  {
    id: 'hero-bg',
    filename: 'hero-bg.png',
    label: 'Homepage Hero Background',
    prompt: `Wide panoramic abstract digital landscape with flowing purple energy waves and particles, neural network nodes connected by violet light beams, depth and dimension with bokeh orbs, cinematic cosmic atmosphere. ${STYLE_BG}`,
    aspect: '16:9',
    usedIn: 'Homepage Hero section background',
    fallback: '🚀',
  },
  {
    id: 'whyus-bg',
    filename: 'whyus-bg.png',
    label: 'Why Us Section Background',
    prompt: `Abstract technology background with glowing purple circuit board patterns and interconnected nodes, hexagonal mesh grid fading to edges, data flow lines in violet, dark navy background (#1A1A24) blending to pure black at edges. Dramatic but not overwhelming. ${STYLE_BG}`,
    aspect: '16:9',
    usedIn: 'Homepage WhyUs section background',
    fallback: '✨',
  },
  {
    id: 'portfolio-header',
    filename: 'portfolio-header.png',
    label: 'Portfolio Section Background',
    prompt: `Wide panoramic scene of multiple floating holographic project screens and code editors scattered across dark space, purple and violet glow emanating from screens, depth of field with screens fading into darkness at edges, cinematic dark background (#1A1A24) fading to black. ${STYLE_BG}`,
    aspect: '16:9',
    usedIn: 'Homepage Portfolio section header illustration',
    fallback: '🏆',
  },
  {
    id: 'products-header',
    filename: 'products-header.png',
    label: 'Products Section Background',
    prompt: `Abstract digital product ecosystem visualization, three glowing purple orbs of different sizes connected by flowing energy streams, floating in dark space with particle trails, dark background (#0F0F14) fading to pure black at edges, premium tech aesthetic. ${STYLE_BG}`,
    aspect: '16:9',
    usedIn: 'Homepage Products section header illustration',
    fallback: '📦',
  },
  {
    id: 'team-illustration',
    filename: 'team-illustration.png',
    label: 'Team — AI Network Background',
    prompt: `Constellation of glowing purple AI consciousness nodes connected by thin violet neural pathways spreading across dark space, each node a small different geometric shape, organic network pattern, dark background (#1A1A24) with nodes fading to darkness at edges, subtle and elegant. ${STYLE_BG}`,
    aspect: '16:9',
    usedIn: 'Homepage Team section illustration',
    fallback: '🤝',
  },
  {
    id: 'contact-bg',
    filename: 'contact-bg.png',
    label: 'Contact Section Background',
    prompt: `Subtle abstract gradient with soft purple aurora light streaks on dark background, gentle flowing curves suggesting connection and communication, very subtle and elegant for form background. ${STYLE_BG}`,
    aspect: '16:9',
    usedIn: 'Homepage Contact section background',
    fallback: '📬',
  },
  {
    id: 'store-hero-bg',
    filename: 'store-hero-bg.png',
    label: 'Store Hero Background',
    prompt: `Abstract digital marketplace visualization, floating holographic product cards with purple glow, shopping experience in cyberspace, premium software store atmosphere, depth with bokeh particles. ${STYLE_BG}`,
    aspect: '16:9',
    usedIn: 'Store page hero background',
    fallback: '🛍️',
  },
];

// ═══════════════════════════════════════
// SERVICE ILLUSTRATIONS (12) — REGENERATED
// Better prompts: transparent bg, no visible borders
// ═══════════════════════════════════════
const SERVICE_SLOTS: ImageSlot[] = [
  {
    id: 'svc-ai',
    filename: 'svc-ai.png',
    label: 'Service — AI & Automation',
    prompt: `Isometric floating AI brain made of glowing purple neural circuits, data streams flowing in and out, small robotic arms assembling code blocks, energy particles radiating outward. ${STYLE_ILLUST}`,
    aspect: '1:1',
    usedIn: '/servicios/ai hero illustration',
    fallback: '🤖',
  },
  {
    id: 'svc-software',
    filename: 'svc-software.png',
    label: 'Service — Software Development',
    prompt: `Isometric floating code editor with purple syntax highlighting, modular code blocks snapping together like building bricks around it, deployment pipeline flowing downward as light stream. ${STYLE_ILLUST}`,
    aspect: '1:1',
    usedIn: '/servicios/software hero illustration',
    fallback: '💻',
  },
  {
    id: 'svc-industrial',
    filename: 'svc-industrial.png',
    label: 'Service — Industrial Automation',
    prompt: `Isometric smart factory machinery with IoT sensor nodes emitting purple data streams upward to a holographic dashboard, mechanical gears with digital overlay, industrial meets digital. ${STYLE_ILLUST}`,
    aspect: '1:1',
    usedIn: '/servicios/industrial hero illustration',
    fallback: '⚙️',
  },
  {
    id: 'svc-cybersecurity',
    filename: 'svc-cybersecurity.png',
    label: 'Service — Cybersecurity',
    prompt: `Isometric digital shield fortress with layered purple energy barriers, scanning beams detecting and blocking red threat particles, encrypted data flowing safely through protected channels. ${STYLE_ILLUST}`,
    aspect: '1:1',
    usedIn: '/servicios/cybersecurity hero illustration',
    fallback: '🛡️',
  },
  {
    id: 'svc-integrations',
    filename: 'svc-integrations.png',
    label: 'Service — API & Integrations',
    prompt: `Isometric floating platforms connected by glowing purple API bridges, data packets traveling as light particles between systems, plug-and-socket connectors with flowing energy beams. ${STYLE_ILLUST}`,
    aspect: '1:1',
    usedIn: '/servicios/integrations hero illustration',
    fallback: '🔌',
  },
  {
    id: 'svc-design',
    filename: 'svc-design.png',
    label: 'Service — UX/UI Design',
    prompt: `Isometric designer workspace with floating UI wireframes and color palettes, typography specimens hovering, a cursor arranging purple glass UI components on an invisible grid. ${STYLE_ILLUST}`,
    aspect: '1:1',
    usedIn: '/servicios/design hero illustration',
    fallback: '🎨',
  },
  {
    id: 'svc-ecommerce',
    filename: 'svc-ecommerce.png',
    label: 'Service — E-commerce',
    prompt: `Isometric online store with floating product cards, glowing shopping cart with items, payment terminal processing purple energy, conversion funnel as light stream. ${STYLE_ILLUST}`,
    aspect: '1:1',
    usedIn: '/servicios/ecommerce hero illustration',
    fallback: '🛒',
  },
  {
    id: 'svc-marketing',
    filename: 'svc-marketing.png',
    label: 'Service — Digital Marketing',
    prompt: `Isometric marketing dashboard with rising bar charts in purple gradients, social media icons orbiting a central megaphone emitting purple waves, analytics funnel with flowing leads. ${STYLE_ILLUST}`,
    aspect: '1:1',
    usedIn: '/servicios/marketing hero illustration',
    fallback: '📊',
  },
  {
    id: 'svc-mentoring',
    filename: 'svc-mentoring.png',
    label: 'Service — Tech Mentoring',
    prompt: `Isometric glowing knowledge tree with branches made of code symbols and circuit patterns, smaller trees growing around it receiving purple light, graduation cap floating above the canopy. ${STYLE_ILLUST}`,
    aspect: '1:1',
    usedIn: '/servicios/mentoring hero illustration',
    fallback: '🎓',
  },
  {
    id: 'svc-data',
    filename: 'svc-data.png',
    label: 'Service — Data Engineering',
    prompt: `Isometric data pipelines as purple flowing rivers between floating database cylinders, ETL transformation gears spinning in the middle, clean data lake collecting below with analytics hologram. ${STYLE_ILLUST}`,
    aspect: '1:1',
    usedIn: '/servicios/data hero illustration',
    fallback: '🗄️',
  },
  {
    id: 'svc-cloud',
    filename: 'svc-cloud.png',
    label: 'Service — Cloud & DevOps',
    prompt: `Isometric cloud infrastructure with floating server racks connected by purple data streams, container pods stacking, CI/CD pipeline as conveyor belt deploying to a glowing purple cloud. ${STYLE_ILLUST}`,
    aspect: '1:1',
    usedIn: '/servicios/cloud hero illustration',
    fallback: '☁️',
  },
  {
    id: 'svc-legacy',
    filename: 'svc-legacy.png',
    label: 'Service — Legacy Modernization',
    prompt: `Isometric transformation scene: old gray monolithic server crumbling on left, modern purple microservices architecture assembling on right, transformation energy bridge flowing between old and new. ${STYLE_ILLUST}`,
    aspect: '1:1',
    usedIn: '/servicios/legacy hero illustration',
    fallback: '🔄',
  },
];

// ═══════════════════════════════════════
// SERVICE PAGE SECTIONS — additional visuals
// ═══════════════════════════════════════
const SERVICE_SECTION_SLOTS: ImageSlot[] = [
  {
    id: 'svc-process-bg',
    filename: 'svc-process-bg.png',
    label: 'Service Process Section BG',
    prompt: `Abstract flowing timeline with 5 connected glowing purple nodes, organic curved path connecting them, subtle particle trail, representing a project workflow progression. ${STYLE_BG}`,
    aspect: '16:9',
    usedIn: 'Service detail — process/timeline section background',
    fallback: '📋',
  },
  {
    id: 'svc-cta-bg',
    filename: 'svc-cta-bg.png',
    label: 'Service CTA Section BG',
    prompt: `Bold abstract gradient with converging purple light rays pointing to center, call-to-action energy, dynamic and inviting, dramatic purple spotlight effect on dark background. ${STYLE_BG}`,
    aspect: '16:9',
    usedIn: 'Service detail — CTA section background',
    fallback: '🎯',
  },
];

// ═══════════════════════════════════════
// ERROR & STATE ILLUSTRATIONS (3)
// ═══════════════════════════════════════
const STATE_SLOTS: ImageSlot[] = [
  {
    id: 'error-404',
    filename: 'error-404.png',
    label: 'Error 404 — Page Not Found',
    prompt: `Isometric cute astronaut floating in space looking confused at a broken signpost with a question mark, small planet fragments and stars scattered around, whimsical but professional. ${STYLE_ILLUST}`,
    aspect: '1:1',
    usedIn: 'not-found page',
    fallback: '🧭',
  },
  {
    id: 'error-500',
    filename: 'error-500.png',
    label: 'Error 500 — Server Error',
    prompt: `Isometric friendly purple robot sitting next to a broken server rack, holding a wrench apologetically, small sparks and loose cables visible, empathetic and reassuring mood. ${STYLE_ILLUST}`,
    aspect: '1:1',
    usedIn: 'error page',
    fallback: '🤖',
  },
  {
    id: 'empty-store',
    filename: 'empty-store.png',
    label: 'Empty Store — Coming Soon',
    prompt: `Isometric elegant empty display shelf with soft purple spotlights ready for products, sparkle particles suggesting anticipation, premium retail aesthetic, coming soon vibe. ${STYLE_ILLUST}`,
    aspect: '1:1',
    usedIn: 'Store page empty state',
    fallback: '🏪',
  },
];

// ═══════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════
export const IMAGE_CATEGORIES: SlotCategory[] = [
  { id: 'homepage', label: 'Homepage', slots: HOMEPAGE_SLOTS },
  { id: 'services', label: 'Services', slots: SERVICE_SLOTS },
  { id: 'svc-sections', label: 'Service Sections', slots: SERVICE_SECTION_SLOTS },
  { id: 'states', label: 'States', slots: STATE_SLOTS },
];

export const ALL_SLOTS = IMAGE_CATEGORIES.flatMap(c => c.slots);

// Total: 29 slots
// Wave 1 (regenerate): 12 services + 3 states = 15
// Wave 2 (new): 7 homepage + 2 service sections = 9
// All AI-generable: ~$1.45 with Gemini Flash
