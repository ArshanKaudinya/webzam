import { VibeResult } from '@/lib/types';

interface VibeCardProps {
  vibe: VibeResult;
}

export function VibeCard({ vibe }: VibeCardProps) {
  if (vibe.provider === 'none' || vibe.confidence === 0) {
    return (
      <div className="p-6 rounded-lg border border-neutral-200 bg-neutral-50 text-center text-neutral-400">
        Vibe analysis unavailable (no LLM provider configured)
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-neutral-500 uppercase tracking-wide">Brand Vibe</span>
        <span className="text-xs text-neutral-400">
          via {vibe.provider} · {Math.round(vibe.confidence * 100)}% confidence
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Tone */}
        <div className="p-4 rounded-lg border border-neutral-200 bg-white">
          <span className="text-xs text-neutral-400 uppercase">Tone</span>
          <p className="text-lg font-medium mt-1">{vibe.tone}</p>
        </div>

        {/* Positioning */}
        <div className="p-4 rounded-lg border border-neutral-200 bg-white md:col-span-2">
          <span className="text-xs text-neutral-400 uppercase">Positioning</span>
          <p className="text-base mt-1">{vibe.positioning}</p>
        </div>

        {/* Audience */}
        <div className="p-4 rounded-lg border border-neutral-200 bg-white">
          <span className="text-xs text-neutral-400 uppercase">Target Audience</span>
          <div className="flex flex-wrap gap-2 mt-2">
            {vibe.audience.map((a, i) => (
              <span key={i} className="px-2 py-1 text-sm bg-neutral-100 rounded-md">
                {a}
              </span>
            ))}
          </div>
        </div>

        {/* Aesthetic Style */}
        <div className="p-4 rounded-lg border border-neutral-200 bg-white">
          <span className="text-xs text-neutral-400 uppercase">Aesthetic Style</span>
          <div className="flex flex-wrap gap-2 mt-2">
            {vibe.aesthetic_style.map((s, i) => (
              <span key={i} className="px-2 py-1 text-sm bg-blue-50 text-blue-700 rounded-md">
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="p-4 rounded-lg border border-neutral-200 bg-white md:col-span-2">
          <span className="text-xs text-neutral-400 uppercase">Summary</span>
          <p className="text-base mt-1 text-neutral-700">{vibe.summary}</p>
        </div>
      </div>
    </div>
  );
}
