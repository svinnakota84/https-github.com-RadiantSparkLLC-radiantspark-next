/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const configuredBase = String((import.meta as any).env?.VITE_API_BASE_URL || '')
  .trim()
  .replace(/\/$/, '');

export function resolveApiUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return configuredBase ? `${configuredBase}${normalized}` : normalized;
}

export interface SafeJsonResult<T = any> {
  ok: boolean;
  status: number;
  isStaticHtmlHost: boolean;
  data: T | null;
}

export async function safeFetchJson<T = any>(
  path: string,
  init?: RequestInit
): Promise<SafeJsonResult<T>> {
  try {
    const res = await fetch(resolveApiUrl(path), init);
    const contentType = (res.headers.get('content-type') || '').toLowerCase();
    if (!contentType.includes('application/json')) {
      return {
        ok: false,
        status: res.status,
        isStaticHtmlHost: true,
        data: null,
      };
    }
    const data = (await res.json()) as T;
    return {
      ok: res.ok,
      status: res.status,
      isStaticHtmlHost: false,
      data,
    };
  } catch {
    return {
      ok: false,
      status: 0,
      isStaticHtmlHost: false,
      data: null,
    };
  }
}
