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
        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-3 border-neutral-300 border-t-neutral-900 rounded-full animate-spin" />
            <p className="mt-4 text-neutral-600">Loading scan...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 inline-block">
              {error}
            </div>
            <div className="mt-4">
              <Link
                href="/history"
                className="text-blue-600 hover:underline"
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
      <footer className="border-t border-neutral-200 mt-12">
        <div className="max-w-5xl mx-auto px-6 py-6 text-center text-sm text-neutral-400">
          Built with Cloudflare Browser Rendering + Workers + D1
        </div>
      </footer>
    </div>
  );
}
