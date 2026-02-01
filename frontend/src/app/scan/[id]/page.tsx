'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getScan } from '@/lib/api';
import { ScanResult } from '@/lib/types';
import { ScanResultView } from '@/components/ScanResultView';

export default function ScanDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [scan, setScan] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchScan() {
      try {
        const data = await getScan(id);
        setScan(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load scan');
      } finally {
        setLoading(false);
      }
    }
    if (id) {
      fetchScan();
    }
  }, [id]);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="border-b border-black/10">
        <div className="max-w-6xl mx-auto px-8 py-5 flex items-center justify-between">
          <Link href="/" className="font-serif text-2xl tracking-tight">
            Webzam
          </Link>
          <nav className="flex items-center gap-6">
            <Link
              href="/"
              className="text-sm tracking-wide uppercase hover:underline underline-offset-4"
            >
              New Scan
            </Link>
            <Link
              href="/history"
              className="text-sm tracking-wide uppercase hover:underline underline-offset-4"
            >
              History
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-8 py-12 flex-1 w-full">
        {/* Loading State */}
        {loading && (
          <div className="py-24 text-center">
            <div className="inline-block w-6 h-6 border-2 border-black/20 border-t-black rounded-full animate-spin" />
            <p className="mt-6 text-black/50 tracking-wide">Loading scan...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="py-24 text-center">
            <div className="py-4 px-5 border border-black/20 bg-black/5 inline-block mb-6">
              <p className="text-sm">{error}</p>
            </div>
            <div>
              <Link
                href="/history"
                className="text-sm uppercase tracking-wider hover:underline underline-offset-4"
              >
                Back to history
              </Link>
            </div>
          </div>
        )}

        {/* Scan Result */}
        {scan && <ScanResultView result={scan} />}
      </main>

      {/* Footer */}
      <footer className="border-t border-black/10 mt-auto">
        <div className="max-w-6xl mx-auto px-8 py-8 text-center text-xs text-black/40 tracking-wide uppercase">
          Cloudflare Browser Rendering + Workers + D1
        </div>
      </footer>
    </div>
  );
}
