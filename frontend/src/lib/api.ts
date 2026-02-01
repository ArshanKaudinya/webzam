import { ScanResult, ScanSummary } from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787';

export async function scanUrl(url: string): Promise<ScanResult> {
  const response = await fetch(`${API_BASE}/scan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

export async function listScans(): Promise<ScanSummary[]> {
  const response = await fetch(`${API_BASE}/scans`);

  if (!response.ok) {
    throw new Error(`Failed to list scans: HTTP ${response.status}`);
  }

  const data = await response.json();
  return data.scans;
}

export async function getScan(id: string): Promise<ScanResult> {
  const response = await fetch(`${API_BASE}/scans/${id}`);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Scan not found');
    }
    throw new Error(`Failed to get scan: HTTP ${response.status}`);
  }

  return response.json();
}
