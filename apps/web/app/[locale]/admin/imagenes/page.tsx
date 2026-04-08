'use client';

import { useState, useEffect, useCallback } from 'react';
import { IMAGE_CATEGORIES, ALL_SLOTS, type ImageSlot } from '@/data/image-slots';

/**
 * Image Factory — Admin Panel v2
 *
 * Features:
 * - Image slot management with visual preview
 * - Display controls: opacity, fit, position, blur, brightness, contrast, scale
 * - Dark/Light preview toggle
 * - Settings saved to localStorage, exportable as CSS
 * - Generation via Gemini (best available model)
 */

const STORAGE_KEY = 'image-factory-settings';

interface DisplaySettings {
  opacityDark: number;
  opacityLight: number;
  objectFit: 'cover' | 'contain' | 'fill';
  objectPosition: string;
  blur: number;
  brightness: number;
  contrast: number;
  scale: number;
  invertLight: boolean;
}

const DEFAULT_SETTINGS: DisplaySettings = {
  opacityDark: 25,
  opacityLight: 8,
  objectFit: 'cover',
  objectPosition: 'center',
  blur: 0,
  brightness: 100,
  contrast: 100,
  scale: 100,
  invertLight: true,
};

interface SlotState {
  exists: boolean;
  generating: boolean;
  error: string | null;
  preview: string | null;
}

function loadSettings(): Record<string, DisplaySettings> {
  if (typeof window === 'undefined') return {};
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
  catch { return {}; }
}

function saveSettings(settings: Record<string, DisplaySettings>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

function SlotControls({ slotId, settings, onChange }: {
  slotId: string; settings: DisplaySettings; onChange: (s: DisplaySettings) => void;
}) {
  const update = (key: keyof DisplaySettings, value: any) => onChange({ ...settings, [key]: value });

  const exportCSS = () => {
    const filters = [
      settings.blur > 0 ? `blur(${settings.blur}px)` : '',
      settings.brightness !== 100 ? `brightness(${settings.brightness}%)` : '',
      settings.contrast !== 100 ? `contrast(${settings.contrast}%)` : '',
    ].filter(Boolean).join(' ');
    const css = `/* ${slotId} */
.slot-${slotId} {
  opacity: ${settings.opacityDark / 100};
  object-fit: ${settings.objectFit};
  object-position: ${settings.objectPosition};${filters ? `\n  filter: ${filters};` : ''}${settings.scale !== 100 ? `\n  transform: scale(${settings.scale / 100});` : ''}
}
.light .slot-${slotId} {
  opacity: ${settings.opacityLight / 100} !important;${settings.invertLight ? '\n  filter: invert(1) hue-rotate(180deg);' : ''}
}`;
    navigator.clipboard.writeText(css).then(() => alert('CSS copied!'));
  };

  const controls: { label: string; key: keyof DisplaySettings; min: number; max: number; color: string; suffix: string }[] = [
    { label: 'Opacity (dark)', key: 'opacityDark', min: 0, max: 100, color: 'accent-purple-500', suffix: '%' },
    { label: 'Opacity (light)', key: 'opacityLight', min: 0, max: 100, color: 'accent-yellow-500', suffix: '%' },
    { label: 'Blur', key: 'blur', min: 0, max: 20, color: 'accent-blue-500', suffix: 'px' },
    { label: 'Brightness', key: 'brightness', min: 0, max: 200, color: 'accent-yellow-400', suffix: '%' },
    { label: 'Contrast', key: 'contrast', min: 0, max: 200, color: 'accent-orange-500', suffix: '%' },
    { label: 'Scale', key: 'scale', min: 50, max: 200, color: 'accent-green-500', suffix: '%' },
  ];

  return (
    <div className="space-y-2 pt-2 border-t border-gray-700">
      {controls.map(c => (
        <div key={c.key} className="flex items-center justify-between">
          <label className="text-[10px] text-gray-400 w-24">{c.label}</label>
          <input type="range" min={c.min} max={c.max} value={settings[c.key] as number}
            onChange={e => update(c.key, Number(e.target.value))}
            className={`flex-1 mx-2 h-1 ${c.color}`} />
          <span className="text-[10px] text-gray-500 w-10 text-right">{String(settings[c.key])}{c.suffix}</span>
        </div>
      ))}

      {/* Object Fit */}
      <div className="flex items-center justify-between">
        <label className="text-[10px] text-gray-400 w-24">Fit</label>
        <select value={settings.objectFit} onChange={e => update('objectFit', e.target.value)}
          className="flex-1 mx-2 bg-gray-900 border border-gray-700 rounded text-[10px] text-gray-300 px-1 py-0.5">
          <option value="cover">Cover</option>
          <option value="contain">Contain</option>
          <option value="fill">Fill</option>
        </select>
      </div>

      {/* Object Position */}
      <div className="flex items-center justify-between">
        <label className="text-[10px] text-gray-400 w-24">Position</label>
        <select value={settings.objectPosition} onChange={e => update('objectPosition', e.target.value)}
          className="flex-1 mx-2 bg-gray-900 border border-gray-700 rounded text-[10px] text-gray-300 px-1 py-0.5">
          {['center','top','bottom','left','right','top left','top right','bottom left','bottom right'].map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      {/* Invert Light */}
      <div className="flex items-center justify-between">
        <label className="text-[10px] text-gray-400 w-24">Invert (light)</label>
        <button onClick={() => update('invertLight', !settings.invertLight)}
          className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all ${
            settings.invertLight ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
              : 'bg-gray-900 text-gray-500 border border-gray-700'
          }`}>
          {settings.invertLight ? 'ON' : 'OFF'}
        </button>
      </div>

      {/* Actions */}
      <div className="flex gap-1 pt-1">
        <button onClick={exportCSS}
          className="flex-1 py-1 rounded text-[10px] font-medium bg-purple-500/20 text-purple-400 hover:bg-purple-500/30">
          Export CSS
        </button>
        <button onClick={() => onChange({ ...DEFAULT_SETTINGS })}
          className="flex-1 py-1 rounded text-[10px] font-medium bg-gray-700 text-gray-400 hover:bg-gray-600">
          Reset
        </button>
      </div>
    </div>
  );
}

export default function AdminImagenesPage() {
  const [activeTab, setActiveTab] = useState<string>(IMAGE_CATEGORIES[0].id);
  const [slotStates, setSlotStates] = useState<Record<string, SlotState>>({});
  const [displaySettings, setDisplaySettings] = useState<Record<string, DisplaySettings>>({});
  const [checkingImages, setCheckingImages] = useState(true);
  const [expandedSlot, setExpandedSlot] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<'dark' | 'light'>('dark');

  useEffect(() => { setDisplaySettings(loadSettings()); }, []);

  useEffect(() => {
    async function checkExisting() {
      const states: Record<string, SlotState> = {};
      await Promise.all(ALL_SLOTS.map(async (slot) => {
        try {
          const res = await fetch(`/generated/${slot.filename}`, { method: 'HEAD' });
          states[slot.id] = { exists: res.ok, generating: false, error: null, preview: null };
        } catch { states[slot.id] = { exists: false, generating: false, error: null, preview: null }; }
      }));
      setSlotStates(states);
      setCheckingImages(false);
    }
    checkExisting();
  }, []);

  const getSettings = (id: string) => displaySettings[id] || { ...DEFAULT_SETTINGS };

  const updateSettings = (id: string, s: DisplaySettings) => {
    const next = { ...displaySettings, [id]: s };
    setDisplaySettings(next);
    saveSettings(next);
  };

  const activeCategory = IMAGE_CATEGORIES.find(c => c.id === activeTab) || IMAGE_CATEGORIES[0];
  const totalSlots = ALL_SLOTS.length;
  const existingCount = Object.values(slotStates).filter(s => s.exists || s.preview).length;

  const handleGenerate = useCallback(async (slot: ImageSlot) => {
    setSlotStates(prev => ({ ...prev, [slot.id]: { ...prev[slot.id], generating: true, error: null } }));
    try {
      const res = await fetch('/api/admin/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: slot.prompt, filename: slot.filename }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Error ${res.status}`);
      }
      const data = await res.json();
      setSlotStates(prev => ({
        ...prev, [slot.id]: { exists: true, generating: false, error: null, preview: data.url || `/generated/${slot.filename}?t=${Date.now()}` },
      }));
    } catch (err: any) {
      setSlotStates(prev => ({ ...prev, [slot.id]: { ...prev[slot.id], generating: false, error: err.message || 'Failed' } }));
    }
  }, []);

  return (
    <div className="pb-8">
      {/* Hero */}
      <section className="relative min-h-[200px] rounded-xl overflow-hidden mb-6 bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50" />
        <div className="relative z-10 flex flex-col items-center justify-center min-h-[200px] p-6 text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Image Factory</h1>
          <p className="text-sm text-white/70 max-w-md">
            Visual control panel — manage images, adjust display, export CSS.
          </p>
          <div className="mt-4 w-full max-w-xs">
            <div className="flex justify-between text-xs text-white/60 mb-1">
              <span>{existingCount} / {totalSlots} images</span>
              <span>{totalSlots > 0 ? Math.round((existingCount / totalSlots) * 100) : 0}%</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden bg-white/15">
              <div className="h-full rounded-full transition-all duration-500"
                style={{ width: `${totalSlots > 0 ? (existingCount / totalSlots) * 100 : 0}%`,
                  background: existingCount === totalSlots ? '#22c55e' : '#eab308' }} />
            </div>
          </div>
          {/* Preview mode toggle */}
          <div className="mt-3 flex gap-1 bg-gray-800 rounded-lg p-0.5">
            <button onClick={() => setPreviewMode('dark')}
              className={`px-3 py-1 rounded-md text-[10px] font-medium transition-all ${
                previewMode === 'dark' ? 'bg-gray-600 text-white' : 'text-gray-500'}`}>
              Dark
            </button>
            <button onClick={() => setPreviewMode('light')}
              className={`px-3 py-1 rounded-md text-[10px] font-medium transition-all ${
                previewMode === 'light' ? 'bg-white text-gray-900' : 'text-gray-500'}`}>
              Light
            </button>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div className="flex overflow-x-auto gap-1 mb-6 pb-1">
        {IMAGE_CATEGORIES.map((cat) => {
          const catExisting = cat.slots.filter(s => slotStates[s.id]?.exists || slotStates[s.id]?.preview).length;
          return (
            <button key={cat.id} onClick={() => setActiveTab(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all border ${
                activeTab === cat.id ? 'bg-yellow-500/15 border-yellow-500 text-yellow-500'
                  : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-gray-300'}`}>
              {cat.label}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                catExisting === cat.slots.length ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-gray-500'}`}>
                {catExisting}/{cat.slots.length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Grid */}
      {checkingImages ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl overflow-hidden animate-pulse bg-gray-800 h-[280px]" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeCategory.slots.map((slot) => {
            const state = slotStates[slot.id] || { exists: false, generating: false, error: null, preview: null };
            const isAvailable = state.exists || state.preview;
            const settings = getSettings(slot.id);
            const isExpanded = expandedSlot === slot.id;
            const isLight = previewMode === 'light';

            const opacity = isLight ? settings.opacityLight : settings.opacityDark;
            const filters = [
              settings.blur > 0 ? `blur(${settings.blur}px)` : '',
              settings.brightness !== 100 ? `brightness(${settings.brightness}%)` : '',
              settings.contrast !== 100 ? `contrast(${settings.contrast}%)` : '',
              isLight && settings.invertLight ? 'invert(1) hue-rotate(180deg)' : '',
            ].filter(Boolean).join(' ') || undefined;

            return (
              <div key={slot.id} className={`rounded-xl overflow-hidden transition-all bg-gray-800 border ${
                isAvailable ? 'border-green-500/30' : 'border-gray-700'}`}>

                {/* Preview with live settings */}
                <div className="relative aspect-video overflow-hidden"
                  style={{ backgroundColor: isLight ? '#f8f8fc' : '#0F0F14' }}>

                  <div className="absolute inset-0 flex items-center justify-center z-[1]">
                    <div className="text-center">
                      <div className="text-4xl opacity-20 mb-1">{slot.fallback || '🖼️'}</div>
                      {!isAvailable && <span className={`text-[10px] ${isLight ? 'text-gray-400' : 'text-gray-600'}`}>Not generated</span>}
                    </div>
                  </div>

                  {isAvailable && (
                    <img src={state.preview || `/generated/${slot.filename}`} alt={slot.label}
                      className="absolute inset-0 w-full h-full z-[2] transition-all duration-300"
                      style={{
                        opacity: opacity / 100,
                        objectFit: settings.objectFit,
                        objectPosition: settings.objectPosition,
                        filter: filters,
                        transform: settings.scale !== 100 ? `scale(${settings.scale / 100})` : undefined,
                      }}
                      onError={(e: any) => { e.target.style.display = 'none'; }} />
                  )}

                  <div className="absolute top-2 right-2 z-[3]">
                    <span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${
                      isAvailable ? 'bg-green-500/90 text-white' : 'bg-white/15 text-gray-400'}`}>
                      {isAvailable ? 'Available' : 'Missing'}
                    </span>
                  </div>

                  <div className="absolute bottom-2 left-2 z-[3]">
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-black/60 text-white/70 font-mono">
                      {opacity}%
                    </span>
                  </div>

                  {state.generating && (
                    <div className="absolute inset-0 z-[4] flex items-center justify-center bg-black/80">
                      <div className="text-center">
                        <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                        <span className="text-xs text-yellow-500">Generating...</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Info + controls */}
                <div className="p-3">
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-gray-100">{slot.label}</h3>
                      <p className="text-[10px] text-gray-500">{slot.usedIn}</p>
                    </div>
                    <button onClick={() => setExpandedSlot(isExpanded ? null : slot.id)}
                      className={`ml-2 px-2 py-1 rounded text-[10px] font-medium transition-all ${
                        isExpanded ? 'bg-purple-500/20 text-purple-400' : 'bg-gray-700 text-gray-400 hover:text-gray-300'}`}>
                      {isExpanded ? 'Hide' : 'Controls'}
                    </button>
                  </div>

                  <div className="flex gap-1 mb-2">
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-gray-700 text-gray-400">{slot.aspect}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-gray-700 text-gray-400">Gemini</span>
                  </div>

                  {isExpanded && (
                    <SlotControls slotId={slot.id} settings={settings}
                      onChange={(s) => updateSettings(slot.id, s)} />
                  )}

                  {slot.prompt && (
                    <details className="mb-2 mt-2">
                      <summary className="text-[10px] cursor-pointer text-gray-400 hover:text-gray-300">View prompt</summary>
                      <p className="text-[10px] mt-1 p-2 rounded bg-gray-900 text-gray-500 break-words">{slot.prompt}</p>
                    </details>
                  )}

                  {state.error && <p className="text-[10px] mb-2 text-red-400">{state.error}</p>}

                  {slot.prompt && (
                    <button onClick={() => handleGenerate(slot)} disabled={state.generating}
                      className={`w-full py-2 rounded-lg text-xs font-semibold transition-all ${
                        isAvailable ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-yellow-500 text-gray-900 hover:bg-yellow-400'
                      } ${state.generating ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      {state.generating ? 'Generating...' : isAvailable ? 'Regenerate' : 'Generate'}
                    </button>
                  )}

                  <p className="text-[9px] mt-1.5 text-center font-mono text-gray-600">/generated/{slot.filename}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-8 text-center">
        <p className="text-xs text-gray-500">
          {totalSlots} slots · {IMAGE_CATEGORIES.length} categories · Gemini · Settings in browser
        </p>
      </div>
    </div>
  );
}
