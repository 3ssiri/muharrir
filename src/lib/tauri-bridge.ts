/**
 * React <-> Tauri bridge
 * Provides a unified interface for storing API keys and testing the connection.
 * Inside a Tauri app: calls Rust commands (which store keys in the OS Keychain).
 * Outside Tauri (browser): uses localStorage as a fallback.
 */

import { invoke } from '@tauri-apps/api/core';

const LS_PREFIX = 'api-key:';

/** Is the app running inside Tauri? */
export function isTauriApp(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}

/** Save an API key (Keychain inside Tauri, or localStorage in the browser) */
export async function saveApiKey(provider: string, apiKey: string): Promise<void> {
  if (isTauriApp()) {
    await invoke('save_api_key', { provider, apiKey });
    return;
  }
  localStorage.setItem(LS_PREFIX + provider, apiKey);
}

/** Get the saved API key (empty string if not found in browser mode) */
export async function getApiKey(provider: string): Promise<string> {
  if (isTauriApp()) {
    return await invoke<string>('get_api_key', { provider });
  }
  return localStorage.getItem(LS_PREFIX + provider) ?? '';
}

/** Delete the saved API key */
export async function deleteApiKey(provider: string): Promise<void> {
  if (isTauriApp()) {
    await invoke('delete_api_key', { provider });
    return;
  }
  localStorage.removeItem(LS_PREFIX + provider);
}

/** Check whether a saved API key exists */
export async function hasApiKey(provider: string): Promise<boolean> {
  if (isTauriApp()) {
    return await invoke<boolean>('has_api_key', { provider });
  }
  return localStorage.getItem(LS_PREFIX + provider) !== null;
}

/** Test the provider connection (via Rust inside Tauri to bypass CORS, or fetch in the browser) */
export async function testApiConnection(baseUrl: string, apiKey: string): Promise<boolean> {
  if (isTauriApp()) {
    return await invoke<boolean>('test_api_connection', { baseUrl, apiKey });
  }
  try {
    const res = await fetch(`${baseUrl.replace(/\/$/, '')}/models`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** فتح رابط خارجي: في Tauri عبر متصفّح/تطبيق النظام، وفي المتصفّح عبر علامة <a> */
export async function openExternal(url: string): Promise<void> {
  if (isTauriApp()) {
    const { openUrl } = await import('@tauri-apps/plugin-opener');
    await openUrl(url);
    return;
  }
  const a = document.createElement('a');
  a.href = url;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  a.click();
}
