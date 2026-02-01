import { Env, ScanResult, ScanRecord } from './types';

export async function saveScan(env: Env, result: ScanResult): Promise<void> {
  await env.DB.prepare(
    'INSERT INTO scans (id, url, created_at, result_json) VALUES (?, ?, ?, ?)'
  )
    .bind(result.id, result.url, result.scannedAt, JSON.stringify(result))
    .run();
}

export async function listScans(env: Env, limit = 50): Promise<Array<{ id: string; url: string; created_at: string }>> {
  const { results } = await env.DB.prepare(
    'SELECT id, url, created_at FROM scans ORDER BY created_at DESC LIMIT ?'
  )
    .bind(limit)
    .all<ScanRecord>();

  return results.map(r => ({
    id: r.id,
    url: r.url,
    created_at: r.created_at
  }));
}

export async function getScan(env: Env, id: string): Promise<ScanResult | null> {
  const result = await env.DB.prepare(
    'SELECT result_json FROM scans WHERE id = ?'
  )
    .bind(id)
    .first<{ result_json: string }>();

  if (!result) {
    return null;
  }

  return JSON.parse(result.result_json) as ScanResult;
}
