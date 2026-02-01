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

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-neutral-200">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-semibold tracking-tight">
            Webzam
          </Link>
          <Link
            href="/history"
            className="text-sm text-neutral-600 hover:text-neutral-900"
          >
            History
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Hero */}
        {!result && (
          <div className="text-center mb-12">
            <h1 className="text-4xl font-semibold tracking-tight mb-4">
              Design Intelligence Scanner
            </h1>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Extract design tokens, typography, colors, and brand vibe from any website.
              Powered by real browser rendering.
            </p>
          </div>
        )}

        {/* URL Input Form */}
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto mb-12">
          <div className="flex gap-3">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://adopt.ai"
              required
              disabled={loading}
              className="flex-1 px-4 py-3 rounded-lg border border-neutral-300 focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-100 transition-colors disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-lg bg-neutral-900 text-white font-medium hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-400 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Scanning...' : 'Scan'}
            </button>
          </div>
        </form>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-3 border-neutral-300 border-t-neutral-900 rounded-full animate-spin" />
            <p className="mt-4 text-neutral-600">
              Rendering page and extracting design tokens...
            </p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="max-w-2xl mx-auto p-4 rounded-lg bg-red-50 border border-red-200 text-red-700">
            {error}
          </div>
        )}

        {/* Result */}
        {result && <ScanResultView result={result} />}
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-200 mt-12">
        <div className="max-w-5xl mx-auto px-6 py-6 text-center text-sm text-neutral-400">
          Built with Cloudflare Browser Rendering + Workers + D1
        </div>
      </footer>
    </div>
  );
}
