/**
 * Image Factory — Batch Generator
 *
 * Reads prompts from image-slots.ts (single source of truth)
 * and generates all missing AI images using Gemini.
 *
 * Usage:
 *   node scripts/generate-images.mjs
 *   node scripts/generate-images.mjs --force        # regenerate all
 *   node scripts/generate-images.mjs --only hero    # only slots with "hero" in id
 *   node scripts/generate-images.mjs --group state  # only slots in group "state"
 *   node scripts/generate-images.mjs --dry-run      # show what would be generated
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─── Config ──────────────────────────────────────────────

// Load .env.local manually (zero dependencies)
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf-8').split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) return;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim();
    if (key) process.env[key] = val;
  });
}

const API_KEY = process.env.GOOGLE_GEMINI_API_KEY;
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'generated');
const COST_PER_IMAGE = 0.05; // Gemini Flash estimate

// ─── Parse CLI args ──────────────────────────────────────

const args = process.argv.slice(2);
const FLAG_FORCE = args.includes('--force');
const FLAG_DRY = args.includes('--dry-run');

function getArgValue(flag) {
  const idx = args.indexOf(flag);
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : null;
}
const FILTER_ONLY = getArgValue('--only');
const FILTER_GROUP = getArgValue('--group');

// ─── Load slots from image-slots.ts ─────────────────────

function loadSlots() {
  // Try common locations for image-slots
  const candidates = [
    path.join(__dirname, '..', 'src', 'data', 'image-slots.ts'),
    path.join(__dirname, '..', 'src', 'data', 'image-slots.js'),
    path.join(__dirname, '..', 'image-slots.ts'),
    path.join(__dirname, '..', 'image-slots.js'),
  ];

  let slotsFile = candidates.find(f => fs.existsSync(f));

  if (!slotsFile) {
    console.error('Could not find image-slots.ts in any of:');
    candidates.forEach(c => console.error(`  ${c}`));
    console.error('\nCreate src/data/image-slots.ts first. See image-slots.example.ts');
    process.exit(1);
  }

  console.log(`Reading slots from: ${path.relative(process.cwd(), slotsFile)}\n`);

  // Parse TypeScript/JS to extract slot data
  // We extract the prompt and filename from each slot object
  const content = fs.readFileSync(slotsFile, 'utf-8');

  const slots = [];
  // Match each object with id, filename, prompt, generation, group fields
  const slotRegex = /\{[^}]*?id:\s*['"]([^'"]+)['"][^}]*?filename:\s*['"]([^'"]+)['"][^}]*?prompt:\s*['"]([^'"]*?)['"][^}]*?generation:\s*['"]([^'"]+)['"][^}]*?(?:group:\s*['"]([^'"]+)['"][^}]*?)?\}/gs;

  let match;
  while ((match = slotRegex.exec(content)) !== null) {
    slots.push({
      id: match[1],
      filename: match[2],
      prompt: match[3],
      generation: match[4],
      group: match[5] || 'unknown',
    });
  }

  if (slots.length === 0) {
    // Fallback: simpler regex for less structured files
    const simpleRegex = /filename:\s*['"]([^'"]+)['"][\s\S]*?prompt:\s*['"]([^'"]+)[']/g;
    while ((match = simpleRegex.exec(content)) !== null) {
      slots.push({
        id: match[1].replace(/\.[^.]+$/, ''),
        filename: match[1],
        prompt: match[2],
        generation: 'ai',
        group: 'unknown',
      });
    }
  }

  return slots;
}

// ─── Gemini API ──────────────────────────────────────────

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

async function generateImage(prompt, filename, retries = 2) {
  const url = `${GEMINI_URL}?key=${API_KEY}`;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            role: 'user',
            parts: [{ text: `Generate a high-quality professional image. Output ONLY the image.\n\n${prompt}` }],
          }],
          generationConfig: { responseModalities: ['TEXT', 'IMAGE'] },
        }),
      });

      if (res.status === 429) {
        const wait = Math.min(30, 10 * (attempt + 1));
        process.stdout.write(`  429 rate limit, waiting ${wait}s...`);
        await sleep(wait * 1000);
        continue;
      }

      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);

      const data = await res.json();
      const parts = data.candidates?.[0]?.content?.parts || [];

      for (const part of parts) {
        if (part.inlineData) {
          const buffer = Buffer.from(part.inlineData.data, 'base64');
          fs.writeFileSync(path.join(OUTPUT_DIR, filename), buffer);
          return { ok: true, size: buffer.length };
        }
      }

      throw new Error('No image data in response');
    } catch (e) {
      if (attempt < retries) {
        await sleep(2000);
        continue;
      }
      return { ok: false, error: e.message };
    }
  }
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ─── Main ────────────────────────────────────────────────

async function main() {
  // Load and filter slots
  let slots = loadSlots();

  // Only AI-generable slots
  slots = slots.filter(s => s.generation === 'ai' && s.prompt);

  // Apply filters
  if (FILTER_ONLY) {
    slots = slots.filter(s => s.id.includes(FILTER_ONLY) || s.filename.includes(FILTER_ONLY));
  }
  if (FILTER_GROUP) {
    slots = slots.filter(s => s.group === FILTER_GROUP);
  }

  console.log(`Image Factory — ${slots.length} AI slots to process\n`);

  if (slots.length === 0) {
    console.log('No slots to generate. Check filters or add AI slots to image-slots.ts');
    return;
  }

  // Check API key
  if (!API_KEY && !FLAG_DRY) {
    console.error('Missing GOOGLE_GEMINI_API_KEY in .env.local');
    console.error('Add it with: echo "GOOGLE_GEMINI_API_KEY=your_key" >> .env.local');
    process.exit(1);
  }

  // Ensure output dir
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  let generated = 0, skipped = 0, failed = 0;

  for (let i = 0; i < slots.length; i++) {
    const slot = slots[i];
    const prefix = `[${i + 1}/${slots.length}]`;
    const outputPath = path.join(OUTPUT_DIR, slot.filename);

    // Skip existing (unless --force)
    if (!FLAG_FORCE && fs.existsSync(outputPath)) {
      console.log(`${prefix} SKIP  ${slot.filename} (exists)`);
      skipped++;
      continue;
    }

    if (FLAG_DRY) {
      console.log(`${prefix} WOULD ${slot.filename}`);
      console.log(`        prompt: ${slot.prompt.slice(0, 80)}...`);
      continue;
    }

    process.stdout.write(`${prefix} ${slot.filename} ... `);
    const result = await generateImage(slot.prompt, slot.filename);

    if (result.ok) {
      console.log(`OK (${Math.round(result.size / 1024)}KB)`);
      generated++;
    } else {
      console.log(`FAIL: ${result.error}`);
      failed++;
    }

    // Rate limit spacing (skip on last item)
    if (i < slots.length - 1) await sleep(3000);
  }

  // Summary
  console.log(`\n${'─'.repeat(50)}`);
  console.log(`Generated: ${generated} | Skipped: ${skipped} | Failed: ${failed}`);
  if (generated > 0) {
    console.log(`Est. cost:  ~$${(generated * COST_PER_IMAGE).toFixed(2)} (Gemini Flash)`);
  }
  console.log(`Output:     ${OUTPUT_DIR}`);
  console.log(`${'─'.repeat(50)}\n`);
}

main();
