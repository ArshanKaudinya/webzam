'use client';

import { ScanResult } from '@/lib/types';
import { ColorChip } from './ColorChip';
import { TypographyPreview } from './TypographyPreview';
import { LogoPreview } from './LogoPreview';
import { VibeCard } from './VibeCard';
import { EvidencePanel } from './EvidencePanel';

interface ScanResultViewProps {
  result: ScanResult;
}

export function ScanResultView({ result }: ScanResultViewProps) {
  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="border-b border-neutral-200 pb-6">
        <h1 className="text-2xl font-semibold">Scan Results</h1>
        <a
          href={result.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline text-sm"
        >
          {result.url}
        </a>
        <p className="text-sm text-neutral-400 mt-1">
          Scanned {new Date(result.scannedAt).toLocaleString()}
        </p>
      </div>

      {/* Colors */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Color Palette</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <ColorChip label="Primary" color={result.colors.primary} />
          <ColorChip label="Secondary" color={result.colors.secondary} />
          <ColorChip label="Background" color={result.colors.background} />
        </div>
      </section>

      {/* Typography */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Typography</h2>
        <TypographyPreview
          heading={result.typography.heading}
          body={result.typography.body}
        />
      </section>

      {/* Logo */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Logo</h2>
        <LogoPreview logo={result.logo} />
      </section>

      {/* Vibe */}
      <section>
        <VibeCard vibe={result.vibe} />
      </section>

      {/* Vibe Slice (Debug) */}
      {result.vibeSlice && (
        <section className="p-4 rounded-lg bg-neutral-50 border border-neutral-200">
          <h3 className="text-sm font-medium text-neutral-500 mb-2">Extracted Content Slice</h3>
          <dl className="grid gap-2 text-sm">
            {result.vibeSlice.heroH1 && (
              <>
                <dt className="text-neutral-400">Hero H1</dt>
                <dd className="text-neutral-700">{result.vibeSlice.heroH1}</dd>
              </>
            )}
            {result.vibeSlice.heroSubheading && (
              <>
                <dt className="text-neutral-400">Subheading</dt>
                <dd className="text-neutral-700">{result.vibeSlice.heroSubheading}</dd>
              </>
            )}
            {result.vibeSlice.primaryCTA && (
              <>
                <dt className="text-neutral-400">Primary CTA</dt>
                <dd className="text-neutral-700">{result.vibeSlice.primaryCTA}</dd>
              </>
            )}
            {result.vibeSlice.navLabels.length > 0 && (
              <>
                <dt className="text-neutral-400">Navigation</dt>
                <dd className="text-neutral-700">{result.vibeSlice.navLabels.join(' · ')}</dd>
              </>
            )}
          </dl>
        </section>
      )}

      {/* Evidence */}
      <section className="border-t border-neutral-200 pt-8">
        <EvidencePanel colors={result.colors} typography={result.typography} />
      </section>
    </div>
  );
}
