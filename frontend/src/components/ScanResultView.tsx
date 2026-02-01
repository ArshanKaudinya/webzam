'use client';

import { ScanResult } from '@/lib/types';
import { ColorChip } from './ColorChip';
import { TypographyPreview } from './TypographyPreview';
import { LogoPreview } from './LogoPreview';
import { VibeCard } from './VibeCard';

interface ScanResultViewProps {
  result: ScanResult;
}

export function ScanResultView({ result }: ScanResultViewProps) {
  const hostname = (() => {
    try {
      return new URL(result.url).hostname;
    } catch {
      return result.url;
    }
  })();

  return (
    <div className="space-y-20">
      {/* Header */}
      <div className="border-b border-black/10 pb-8">
        <p className="text-xs uppercase tracking-widest text-black/40 mb-2">Scan Results</p>
        <h1 className="font-medium text-3xl md:text-4xl mb-3">{hostname}</h1>
        <div className="flex items-center gap-4 text-sm text-black/50">
          <a
            href={result.url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline underline-offset-2"
          >
            {result.url}
          </a>
          <span>·</span>
          <span>{new Date(result.scannedAt).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Summary Section */}
      {result.vibe.summary?.one_liner && (
        <section>
          <p className="font-regular text-2xl md:text-3xl leading-relaxed max-w-3xl">
            "{result.vibe.summary.elevator_pitch || result.vibe.summary.one_liner}"
          </p>
          {result.vibe.summary.keywords?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-6">
              {result.vibe.summary.keywords.map((keyword, i) => (
                <span
                  key={i}
                  className="px-3 py-1 text-xs uppercase tracking-wider border border-black/20"
                >
                  {keyword}
                </span>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Color Palette */}
      <section>
        <h2 className="font-medium text-2xl mb-8">Color Palette</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <ColorChip label="Primary" color={result.colors.primary} />
          <ColorChip label="Secondary" color={result.colors.secondary} />
          <ColorChip label="Background" color={result.colors.background} />
        </div>
      </section>

      {/* Typography */}
      <section>
        <h2 className="font-medium text-2xl mb-8">Typography</h2>
        <TypographyPreview
          heading={result.typography.heading}
          body={result.typography.body}
        />
      </section>

      {/* Logo */}
      {result.logo && (
        <section>
          <h2 className="font-medium text-2xl mb-8">Logo</h2>
          <LogoPreview logo={result.logo} />
        </section>
      )}

      {/* Brand Intelligence */}
      <section>
        <h2 className="font-medium text-2xl mb-8">Brand Intelligence</h2>
        <VibeCard vibe={result.vibe} />
      </section>

      {/* Raw Content */}
      {result.vibeSlice && (result.vibeSlice.heroH1 || result.vibeSlice.navLabels.length > 0) && (
        <section className="border-t border-black/10 pt-12">
          <p className="text-xs uppercase tracking-widest text-black/40 mb-6">Extracted Content</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
            {result.vibeSlice.heroH1 && (
              <div>
                <p className="text-black/40 mb-1">Hero Headline</p>
                <p>{result.vibeSlice.heroH1}</p>
              </div>
            )}
            {result.vibeSlice.heroSubheading && (
              <div>
                <p className="text-black/40 mb-1">Subheading</p>
                <p>{result.vibeSlice.heroSubheading}</p>
              </div>
            )}
            {result.vibeSlice.primaryCTA && (
              <div>
                <p className="text-black/40 mb-1">Primary CTA</p>
                <p>{result.vibeSlice.primaryCTA}</p>
              </div>
            )}
            {result.vibeSlice.navLabels.length > 0 && (
              <div>
                <p className="text-black/40 mb-1">Navigation</p>
                <p>{result.vibeSlice.navLabels.join(' · ')}</p>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
