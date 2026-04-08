'use client';

import { useState, useEffect, useCallback } from 'react';
import { IMAGE_CATEGORIES, ALL_SLOTS, type ImageSlot } from '@/data/image-slots';

/**
 * Image Factory — Admin Panel
 *
 * Shows all image slots organized by category.
 * For each slot: preview, status (exists/missing), prompt, generate button.
 * Reads the `fallback` field from each slot — no hardcoded icons.
 */

const AI_IMAGE_URL = process.env.NEXT_PUBLIC_AI_IMAGE_URL || '';

interface SlotState {
  exists: boolean;
  generating: boolean;
  error: string | null;
  preview: string | null;
}

export default function AdminImagenesPage() {
  const [activeTab, setActiveTab] = useState<string>(IMAGE_CATEGORIES[0].id);
  const [slotStates, setSlotStates] = useState<Record<string, SlotState>>({});
  const [checkingImages, setCheckingImages] = useState(true);

  // Check which images already exist in /generated/
  useEffect(() => {
    async function checkExisting() {
      const states: Record<string, SlotState> = {};
      await Promise.all(
        ALL_SLOTS.map(async (slot) => {
          try {
            const res = await fetch(`/generated/${slot.filename}`, { method: 'HEAD' });
            states[slot.id] = { exists: res.ok, generating: false, error: null, preview: null };
          } catch {
            states[slot.id] = { exists: false, generating: false, error: null, preview: null };
          }
        })
      );
      setSlotStates(states);
      setCheckingImages(false);
    }
    checkExisting();
  }, []);

  const activeCategory = IMAGE_CATEGORIES.find(c => c.id === activeTab) || IMAGE_CATEGORIES[0];
  const totalSlots = ALL_SLOTS.length;
  const existingCount = Object.values(slotStates).filter(s => s.exists || s.preview).length;

  // Generate image via API (if AI_IMAGE_URL configured) or show prompt for manual generation
  const handleGenerate = useCallback(async (slot: ImageSlot) => {
    if (!AI_IMAGE_URL) {
      // No API configured — copy prompt to clipboard
      try {
        await navigator.clipboard.writeText(slot.prompt);
        alert(`Prompt copied to clipboard!\n\nGenerate the image manually and save as:\npublic/generated/${slot.filename}`);
      } catch {
        alert(`No AI API configured.\n\nPrompt:\n${slot.prompt}\n\nSave as: public/generated/${slot.filename}`);
      }
      return;
    }

    setSlotStates(prev => ({
      ...prev,
      [slot.id]: { ...prev[slot.id], generating: true, error: null },
    }));

    try {
      const res = await fetch(`${AI_IMAGE_URL}/api/v1/images/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: slot.prompt,
          aspectRatio: slot.aspect,
          filename: slot.filename,
        }),
      });

      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();

      setSlotStates(prev => ({
        ...prev,
        [slot.id]: {
          exists: true,
          generating: false,
          error: null,
          preview: data.imageUrl || data.url || null,
        },
      }));
    } catch (err: any) {
      setSlotStates(prev => ({
        ...prev,
        [slot.id]: { ...prev[slot.id], generating: false, error: err.message || 'Generation failed' },
      }));
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
            Visual control panel. Each slot maps to a specific place on a specific page.
          </p>
          {/* Progress bar */}
          <div className="mt-4 w-full max-w-xs">
            <div className="flex justify-between text-xs text-white/60 mb-1">
              <span>{existingCount} / {totalSlots} images</span>
              <span>{totalSlots > 0 ? Math.round((existingCount / totalSlots) * 100) : 0}%</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden bg-white/15">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${totalSlots > 0 ? (existingCount / totalSlots) * 100 : 0}%`,
                  background: existingCount === totalSlots ? '#22c55e' : '#eab308',
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Tab navigation */}
      <div className="flex overflow-x-auto gap-1 mb-6 pb-1">
        {IMAGE_CATEGORIES.map((cat) => {
          const catExisting = cat.slots.filter(s => slotStates[s.id]?.exists || slotStates[s.id]?.preview).length;
          const isActive = activeTab === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all border ${
                isActive
                  ? 'bg-yellow-500/15 border-yellow-500 text-yellow-500'
                  : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-gray-300'
              }`}
            >
              {cat.label}
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  catExisting === cat.slots.length
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-white/10 text-gray-500'
                }`}
              >
                {catExisting}/{cat.slots.length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Slot grid */}
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

            return (
              <div
                key={slot.id}
                className={`rounded-xl overflow-hidden transition-all bg-gray-800 border ${
                  isAvailable ? 'border-green-500/30' : 'border-gray-700'
                }`}
              >
                {/* Image preview area */}
                <div className="relative aspect-video overflow-hidden bg-gray-900">
                  {/* z-1: Placeholder — uses slot.fallback */}
                  <div className="absolute inset-0 flex items-center justify-center z-[1]">
                    <div className="text-center">
                      <div className="text-4xl opacity-20 mb-1">
                        {slot.fallback || '🖼️'}
                      </div>
                      {!isAvailable && (
                        <span className="text-[10px] text-gray-600">Not generated</span>
                      )}
                    </div>
                  </div>

                  {/* z-2: Real image */}
                  {isAvailable && (
                    <img
                      src={state.preview || `/generated/${slot.filename}`}
                      alt={slot.label}
                      className="absolute inset-0 w-full h-full object-cover z-[2]"
                      onError={(e: any) => { e.target.style.display = 'none'; }}
                    />
                  )}

                  {/* Status badge */}
                  <div className="absolute top-2 right-2 z-[3]">
                    <span
                      className={`text-[10px] font-semibold px-2 py-1 rounded-full ${
                        isAvailable
                          ? 'bg-green-500/90 text-white'
                          : 'bg-white/15 text-gray-400'
                      }`}
                    >
                      {isAvailable ? 'Available' : 'Missing'}
                    </span>
                  </div>

                  {/* Priority badge */}
                  {'priority' in slot && (
                    <div className="absolute top-2 left-2 z-[3]">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                        slot.priority === 'required'
                          ? 'bg-red-500/20 text-red-400'
                          : slot.priority === 'recommended'
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-gray-500/20 text-gray-500'
                      }`}>
                        {slot.priority === 'required' ? '★' : slot.priority === 'recommended' ? '◆' : '○'}
                      </span>
                    </div>
                  )}

                  {/* Generating overlay */}
                  {state.generating && (
                    <div className="absolute inset-0 z-[4] flex items-center justify-center bg-black/80">
                      <div className="text-center">
                        <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                        <span className="text-xs text-yellow-500">Generating...</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Info + actions */}
                <div className="p-3">
                  <h3 className="text-sm font-semibold text-gray-100 mb-0.5">
                    {slot.label}
                  </h3>
                  <p className="text-[10px] text-gray-500 mb-1">
                    {slot.usedIn}
                  </p>

                  {/* Type + generation badges */}
                  <div className="flex gap-1 mb-2">
                    {'type' in slot && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-gray-700 text-gray-400">
                        {String((slot as any).type)}
                      </span>
                    )}
                    {'generation' in slot && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-gray-700 text-gray-400">
                        {String((slot as any).generation)}
                      </span>
                    )}
                    {'aspect' in slot && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-gray-700 text-gray-400">
                        {String((slot as any).aspect)}
                      </span>
                    )}
                  </div>

                  {/* Prompt preview (only for AI slots) */}
                  {slot.prompt && (
                    <details className="mb-2">
                      <summary className="text-[10px] cursor-pointer text-gray-400 hover:text-gray-300">
                        View prompt
                      </summary>
                      <p className="text-[10px] mt-1 p-2 rounded bg-gray-900 text-gray-500 break-words">
                        {slot.prompt}
                      </p>
                    </details>
                  )}

                  {/* Error */}
                  {state.error && (
                    <p className="text-[10px] mb-2 text-red-400">{state.error}</p>
                  )}

                  {/* Action button — only for AI-generable slots */}
                  {slot.generation === 'ai' && slot.prompt && (
                    <button
                      onClick={() => handleGenerate(slot)}
                      disabled={state.generating}
                      className={`w-full py-2 rounded-lg text-xs font-semibold transition-all ${
                        isAvailable
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-yellow-500 text-gray-900 hover:bg-yellow-400'
                      } ${state.generating ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {state.generating ? 'Generating...' : isAvailable ? 'Regenerate' : 'Generate'}
                    </button>
                  )}

                  {/* Non-AI slots show generation method */}
                  {slot.generation !== 'ai' && (
                    <div className="w-full py-2 rounded-lg text-xs text-center text-gray-500 bg-gray-900">
                      {slot.generation === 'manual' ? 'Design manually' :
                       slot.generation === 'photo' ? 'Use real photo' :
                       slot.generation === 'screenshot' ? 'Take screenshot' :
                       slot.generation === 'code' ? 'Generate with code' :
                       slot.generation === 'external' ? 'External source' : slot.generation}
                    </div>
                  )}

                  {/* Filename */}
                  <p className="text-[9px] mt-1.5 text-center font-mono text-gray-600">
                    /generated/{slot.filename}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Summary footer */}
      <div className="mt-8 text-center">
        <p className="text-xs text-gray-500">
          {totalSlots} slots in {IMAGE_CATEGORIES.length} categories.
          Images in <code className="font-mono text-gray-400">/public/generated/</code>
        </p>
      </div>
    </div>
  );
}
