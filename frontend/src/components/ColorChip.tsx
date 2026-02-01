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
    <div>
      <p className="text-xs uppercase tracking-widest text-black/40 mb-3">{label}</p>
      <button
        onClick={copyToClipboard}
        className="w-full text-left group"
      >
        <div
          className="w-full aspect-[3/2] border border-black/10"
          style={{ backgroundColor: color.hex }}
        />
        <div className="mt-3 flex items-center justify-between">
          <span className="font-mono text-sm">{color.hex.toUpperCase()}</span>
          <span className="text-xs text-black/40">
            {copied ? 'Copied' : `${Math.round(color.confidence * 100)}%`}
          </span>
        </div>
      </button>
    </div>
  );
}
