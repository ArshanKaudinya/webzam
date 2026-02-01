'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { listScans } from '@/lib/api';
import { ScanSummary } from '@/lib/types';

export default function HistoryPage() {
  const [scans, setScans] = useState<ScanSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchScans() {
      try {
        const data = await listScans();
        setScans(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load history');
      } finally {
        setLoading(false);
      }
    }
    fetchScans();
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="border-b border-black/10">
        <div className="max-w-6xl mx-auto px-8 py-5 flex items-center justify-between">
          <Link href="/" className="font-medium text-2xl tracking-tight">
            Webzam
          </Link>
          <nav className="flex items-center gap-6">
            <Link
              href="/"
              className="text-sm tracking-wide uppercase hover:underline underline-offset-4"
            >
              New Scan
            </Link>
            <span className="text-sm tracking-wide uppercase text-black/40">History</span>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-8 py-16 flex-1 w-full">
        <h1 className="font-medium text-4xl md:text-5xl tracking-tight mb-12">
          Scan History
        </h1>

        {/* Loading State */}
        {loading && (
          <div className="py-24 text-center">
            <div className="inline-block w-6 h-6 border-2 border-black/20 border-t-black rounded-full animate-spin" />
            <p className="mt-6 text-black/50 tracking-wide">Loading history...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="py-4 px-5 border border-black/20 bg-black/5">
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && scans.length === 0 && (
          <div className="py-24 text-center">
            <p className="text-black/50 mb-6">No scans yet</p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-black text-white text-sm uppercase tracking-widest hover:bg-black/80"
            >
              Scan a website
            </Link>
          </div>
        )}

        {/* Scan List */}
        {!loading && !error && scans.length > 0 && (
          <div className="divide-y divide-black/10">
            {scans.map((scan) => {
              const hostname = (() => {
                try {
                  return new URL(scan.url).hostname;
                } catch {
                  return scan.url;
                }
              })();

              return (
                <Link
                  key={scan.id}
                  href={`/scan/${scan.id}`}
                  className="block py-6 group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-xl group-hover:underline underline-offset-4">
                        {hostname}
                      </p>
                      <p className="text-sm text-black/40 mt-1">{scan.url}</p>
                    </div>
                    <span className="text-sm text-black/40">
                      {new Date(scan.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
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
