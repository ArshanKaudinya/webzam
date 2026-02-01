'use client';

import { useState } from 'react';
import { scanUrl } from '@/lib/api';
import { ScanResult } from '@/lib/types';
import { ScanResultView } from '@/components/ScanResultView';
import Link from 'next/link';

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ScanResult | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);

    try {
      const scanResult = await scanUrl(url);
      setResult(scanResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Scan failed');
    } finally {
      setLoading(false);
    }
  };

  const resetScan = () => {
    setResult(null);
    setUrl('');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="border-b border-black/10">
        <div className="max-w-6xl mx-auto px-8 py-5 flex items-center justify-between">
          <Link href="/" className="font-serif text-2xl tracking-tight">
            Webzam
          </Link>
          <nav className="flex items-center gap-6">
            {result && (
              <button
                onClick={resetScan}
                className="text-sm tracking-wide uppercase hover:underline underline-offset-4"
              >
                New Scan
              </button>
            )}
            <Link
              href="/history"
              className="text-sm tracking-wide uppercase hover:underline underline-offset-4"
            >
              History
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-8 flex-1">
        {/* Hero */}
        {!result && !loading && (
          <div className="py-24 md:py-32">
            <h1 className="font-serif text-5xl md:text-7xl tracking-tight mb-6 max-w-4xl">
              Design Intelligence Scanner
            </h1>
            <p className="text-lg md:text-xl text-black/60 max-w-2xl mb-12 leading-relaxed">
              Extract design tokens, typography, colors, and brand vibe from any website.
            </p>

            {/* URL Input Form */}
            <form onSubmit={handleSubmit} className="max-w-xl">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="arshankaudinya.com"
                  required
                  disabled={loading}
                  className="flex-1 px-5 py-4 border border-black/20 focus:border-black focus:outline-none transition-colors disabled:opacity-50 text-lg"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-4 bg-black text-white text-sm uppercase tracking-widest hover:bg-black/80 focus:outline-none disabled:opacity-50 transition-colors"
                >
                  Scan
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="py-24 text-center">
            <div className="inline-block w-6 h-6 border-2 border-black/20 border-t-black rounded-full animate-spin" />
            <p className="mt-6 text-black/50 tracking-wide">
              Rendering page and extracting design tokens (may take up to a minute)...
            </p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="max-w-xl py-4 px-5 border border-black/20 bg-black/5 mb-12">
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="py-12">
            <ScanResultView result={result} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-black/10 mt-auto">
        <div className="max-w-6xl mx-auto px-8 py-8 text-center text-xs text-black/40 tracking-wide uppercase">
          Arshan Kaudinya for WebZam
        </div>
      </footer>
    </div>
  );
}
