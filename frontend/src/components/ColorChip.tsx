'use client';

import { useState } from 'react';
import { ColorResult } from '@/lib/types';

interface ColorChipProps {
  label: string;
  color: ColorResult;
}

export function ColorChip({ label, color }: ColorChipProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(color.hex);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm text-neutral-500 uppercase tracking-wide">{label}</span>
      <button
        onClick={copyToClipboard}
        className="group flex items-center gap-3 p-3 rounded-lg border border-neutral-200 hover:border-neutral-300 transition-colors"
      >
        <div
          className="w-12 h-12 rounded-lg shadow-inner border border-neutral-200"
          style={{ backgroundColor: color.hex }}
        />
        <div className="flex flex-col items-start">
          <span className="font-mono text-sm">{color.hex}</span>
          <span className="text-xs text-neutral-400">
            {copied ? 'Copied!' : `${Math.round(color.confidence * 100)}% confidence`}
          </span>
        </div>
      </button>
    </div>
  );
}

interface ColorEvidenceProps {
  color: ColorResult;
}

export function ColorEvidence({ color }: ColorEvidenceProps) {
  if (!color.evidence.length) return null;

  return (
    <div className="mt-2 space-y-1">
      <span className="text-xs text-neutral-400">Evidence:</span>
      {color.evidence.map((ev, i) => (
        <div key={i} className="text-xs text-neutral-500 pl-2 border-l-2 border-neutral-200">
          <span className="font-mono">&lt;{ev.tag}&gt;</span>
          {ev.text && <span className="ml-1 truncate">"{ev.text.slice(0, 30)}..."</span>}
        </div>
      ))}
    </div>
  );
}
