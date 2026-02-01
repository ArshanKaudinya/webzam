'use client';

import { useState } from 'react';
import { LogoResult } from '@/lib/types';

interface LogoPreviewProps {
  logo: LogoResult | null;
}

/**
 * Check if the logo value is inline SVG markup (as opposed to a URL).
 * Inline SVG starts with '<' (e.g., "<svg...>"), URLs start with "http" or "/".
 */
function isInlineSvg(logo: LogoResult): boolean {
  return logo.type === 'svg' && logo.value.trim().startsWith('<');
}

export function LogoPreview({ logo }: LogoPreviewProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  if (!logo) {
    return (
      <div className="p-12 border border-black/10 text-center text-black/30">
        No logo detected
      </div>
    );
  }

  const inline = isInlineSvg(logo);

  return (
    <div>
      <div className="p-12 border border-black/10 flex items-center justify-center bg-white min-h-[180px] relative">
        {inline ? (
          <div
            className="max-w-[240px] max-h-[120px] [&_svg]:max-w-full [&_svg]:max-h-[120px]"
            dangerouslySetInnerHTML={{ __html: logo.value }}
          />
        ) : error ? (
          <div className="text-center">
            <p className="text-black/40 text-sm mb-2">Image could not be loaded</p>
            <a
              href={logo.value}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs uppercase tracking-wider hover:underline underline-offset-2"
            >
              Open in new tab
            </a>
          </div>
        ) : (
          <>
            {!loaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-black/20 border-t-black rounded-full animate-spin" />
              </div>
            )}
            <img
              src={logo.value}
              alt="Logo"
              className={`max-w-[240px] max-h-[120px] object-contain transition-opacity ${loaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setLoaded(true)}
              onError={() => setError(true)}
              referrerPolicy="no-referrer"
            />
          </>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between text-sm">
        <span className="text-black/40">{logo.reason}</span>
        <div className="flex items-center gap-4">
          <span className="text-xs text-black/40">{Math.round(logo.confidence * 100)}%</span>
          {!inline && (
            <a
              href={logo.value}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs uppercase tracking-wider hover:underline underline-offset-2"
            >
              View Original
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
