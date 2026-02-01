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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-neutral-200">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-semibold tracking-tight">
            Webzam
          </Link>
          <Link
            href="/history"
            className="text-sm text-neutral-900 font-medium"
          >
            History
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-semibold tracking-tight mb-8">
          Scan History
        </h1>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-3 border-neutral-300 border-t-neutral-900 rounded-full animate-spin" />
            <p className="mt-4 text-neutral-600">Loading history...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700">
            {error}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && scans.length === 0 && (
          <div className="text-center py-12">
            <p className="text-neutral-600">No scans yet.</p>
            <Link
              href="/"
              className="inline-block mt-4 px-4 py-2 rounded-lg bg-neutral-900 text-white font-medium hover:bg-neutral-800"
            >
              Scan a website
            </Link>
          </div>
        )}

        {/* Scan List */}
        {!loading && !error && scans.length > 0 && (
          <div className="space-y-3">
            {scans.map((scan) => (
              <Link
                key={scan.id}
                href={`/scan/${scan.id}`}
                className="block p-4 rounded-lg border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-blue-600 truncate max-w-[70%]">
                    {scan.url}
                  </span>
                  <span className="text-sm text-neutral-400">
                    {new Date(scan.created_at).toLocaleDateString()}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
