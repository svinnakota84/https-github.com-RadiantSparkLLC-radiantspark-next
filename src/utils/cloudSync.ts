/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface CloudSyncResult {
  success: boolean;
  timestamp: string;
  traceId: string;
  latencyMs: number;
  destination: string;
  status: 'synced' | 'queued' | 'error' | 'local_ledger';
  details: string;
}

export async function dispatchToEnterpriseCloud(payload: Record<string, any>): Promise<CloudSyncResult> {
  const startedAt = performance.now();
  try {
    const res = await fetch('/api/brain/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    const latencyMs = data.latencyMs ?? Math.round(performance.now() - startedAt);
    return {
      success: Boolean(data.success ?? res.ok),
      timestamp: data.timestamp || new Date().toISOString(),
      traceId: data.traceId || crypto.randomUUID(),
      latencyMs,
      destination: data.destination || 'Local Persistent Ledger',
      status: data.status || (res.ok ? 'local_ledger' : 'error'),
      details: data.details || (res.ok ? 'Persisted to server ledger.' : 'ERP sync failed.'),
    };
  } catch {
    return {
      success: false,
      timestamp: new Date().toISOString(),
      traceId: crypto.randomUUID(),
      latencyMs: Math.round(performance.now() - startedAt),
      destination: 'Server Unreachable',
      status: 'error',
      details: 'Could not reach /api/brain/sync backend endpoint.',
    };
  }
}
