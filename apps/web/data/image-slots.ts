/**
 * SoulCore Web — Image Factory Slots (Wave 1)
 *
 * 15 slots: 12 service illustrations + 404 + 500 + empty store
 * Style: Isometric/flat 3D, soul-purple (#8B5CF6) dominant
 * Direction: MUSE (creative) + IRIS (implementation)
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

// Shared prompt suffix for style consistency
const STYLE = 'Isometric flat 3D illustration style, purple (#8B5CF6) and violet (#6D28D9) as dominant colors, dark background (#0F0F14), clean minimal design, soft ambient lighting, no text, no watermarks, no people.';

// ═══════════════════════════════════════
// SERVICE ILLUSTRATIONS (12)
// ═══════════════════════════════════════
const SERVICE_SLOTS: ImageSlot[] = [
  {
    id: 'svc-ai',
    filename: 'svc-ai.png',
    label: 'Service — AI & Automation',
    prompt: `Isometric view of a glowing AI brain made of purple circuit nodes, connected to floating data streams and neural pathways, small robotic arms assembling code blocks around it. ${STYLE}`,
    aspect: '1:1',
    usedIn: '/servicios/ai hero illustration',
    fallback: '🤖',
  },
  {
    id: 'svc-software',
    filename: 'svc-software.png',
    label: 'Service — Software Development',
    prompt: `Isometric view of a code editor floating in space with purple-glowing brackets and syntax, surrounded by modular code blocks snapping together like building bricks, deployment pipeline flowing downward. ${STYLE}`,
    aspect: '1:1',
    usedIn: '/servicios/software hero illustration',
    fallback: '💻',
  },
  {
    id: 'svc-industrial',
    filename: 'svc-industrial.png',
    label: 'Service — Industrial Automation',
    prompt: `Isometric view of a smart factory floor with IoT sensors on machines, data flowing upward as purple streams to a central dashboard hologram, mechanical gears with digital overlay. ${STYLE}`,
    aspect: '1:1',
    usedIn: '/servicios/industrial hero illustration',
    fallback: '⚙️',
  },
  {
    id: 'svc-cybersecurity',
    filename: 'svc-cybersecurity.png',
    label: 'Service — Cybersecurity',
    prompt: `Isometric view of a digital fortress with layered purple shields, scanning beams detecting threats as red particles being blocked, lock icons and encrypted data streams flowing safely through. ${STYLE}`,
    aspect: '1:1',
    usedIn: '/servicios/cybersecurity hero illustration',
    fallback: '🛡️',
  },
  {
    id: 'svc-integrations',
    filename: 'svc-integrations.png',
    label: 'Service — API & Integrations',
    prompt: `Isometric view of multiple floating platforms connected by glowing purple API bridges, data packets traveling between systems, plug-and-socket connectors with flowing energy. ${STYLE}`,
    aspect: '1:1',
    usedIn: '/servicios/integrations hero illustration',
    fallback: '🔌',
  },
  {
    id: 'svc-design',
    filename: 'svc-design.png',
    label: 'Service — UX/UI Design',
    prompt: `Isometric view of a designer workspace with floating UI wireframes, color palette selector, typography specimens, and a hand cursor arranging purple glass components on a grid. ${STYLE}`,
    aspect: '1:1',
    usedIn: '/servicios/design hero illustration',
    fallback: '🎨',
  },
  {
    id: 'svc-ecommerce',
    filename: 'svc-ecommerce.png',
    label: 'Service — E-commerce',
    prompt: `Isometric view of an online store with floating product cards, shopping cart with glowing items, payment processing terminal with purple energy flow, conversion funnel visualization. ${STYLE}`,
    aspect: '1:1',
    usedIn: '/servicios/ecommerce hero illustration',
    fallback: '🛒',
  },
  {
    id: 'svc-marketing',
    filename: 'svc-marketing.png',
    label: 'Service — Digital Marketing',
    prompt: `Isometric view of a marketing dashboard with rising bar charts in purple gradients, social media icons orbiting a central megaphone, funnel with leads flowing through stages. ${STYLE}`,
    aspect: '1:1',
    usedIn: '/servicios/marketing hero illustration',
    fallback: '📊',
  },
  {
    id: 'svc-mentoring',
    filename: 'svc-mentoring.png',
    label: 'Service — Tech Mentoring',
    prompt: `Isometric view of a mentoring scene with a glowing knowledge tree, branches made of code symbols, smaller trees growing around it receiving purple light, graduation cap floating at the top. ${STYLE}`,
    aspect: '1:1',
    usedIn: '/servicios/mentoring hero illustration',
    fallback: '🎓',
  },
  {
    id: 'svc-data',
    filename: 'svc-data.png',
    label: 'Service — Data Engineering',
    prompt: `Isometric view of data pipelines as purple flowing rivers between database cylinders, ETL transformation gears in the middle, clean data lake collecting at the bottom with analytics dashboard. ${STYLE}`,
    aspect: '1:1',
    usedIn: '/servicios/data hero illustration',
    fallback: '🗄️',
  },
  {
    id: 'svc-cloud',
    filename: 'svc-cloud.png',
    label: 'Service — Cloud & DevOps',
    prompt: `Isometric view of cloud infrastructure with floating server racks connected by purple data streams, container pods (Docker/K8s style), CI/CD pipeline as conveyor belt deploying to a glowing cloud. ${STYLE}`,
    aspect: '1:1',
    usedIn: '/servicios/cloud hero illustration',
    fallback: '☁️',
  },
  {
    id: 'svc-legacy',
    filename: 'svc-legacy.png',
    label: 'Service — Legacy Modernization',
    prompt: `Isometric view of an old gray monolithic server being transformed: one half crumbling, other half rebuilt as modern purple microservices architecture, transformation energy flowing between old and new. ${STYLE}`,
    aspect: '1:1',
    usedIn: '/servicios/legacy hero illustration',
    fallback: '🔄',
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
    prompt: `Isometric illustration of a cute astronaut floating in purple-tinted space, looking confused at a broken signpost with a question mark, small planet fragments and stars scattered around, whimsical but professional mood. ${STYLE}`,
    aspect: '1:1',
    usedIn: 'not-found.tsx page',
    fallback: '🧭',
  },
  {
    id: 'error-500',
    filename: 'error-500.png',
    label: 'Error 500 — Server Error',
    prompt: `Isometric illustration of a friendly purple robot sitting next to a broken server rack, holding a wrench and looking apologetically at the viewer, small sparks and loose cables visible, empathetic and reassuring mood. ${STYLE}`,
    aspect: '1:1',
    usedIn: 'error.tsx page',
    fallback: '🤖',
  },
  {
    id: 'empty-store',
    filename: 'empty-store.png',
    label: 'Empty Store — Coming Soon',
    prompt: `Isometric illustration of an elegant empty purple display shelf with soft spotlights ready for products, a "coming soon" ribbon floating, small sparkle particles suggesting anticipation, premium retail aesthetic. ${STYLE}`,
    aspect: '1:1',
    usedIn: 'Store page empty state',
    fallback: '🏪',
  },
];

// ═══════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════
export const IMAGE_CATEGORIES: SlotCategory[] = [
  { id: 'services', label: 'Services', slots: SERVICE_SLOTS },
  { id: 'states', label: 'States', slots: STATE_SLOTS },
];

export const ALL_SLOTS = IMAGE_CATEGORIES.flatMap(c => c.slots);

// Wave 1: 15 slots, all AI-generable
// Cost: ~$0.75 with Gemini Flash
