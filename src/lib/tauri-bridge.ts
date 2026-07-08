/**
 * React <-> Tauri bridge
 * Provides a unified interface for storing API keys and testing the connection.
 * Inside a Tauri app: calls Rust commands (which store keys in the OS Keychain).
 * Outside Tauri (browser): uses localStorage.
 */

import { invoke } from '@tauri-apps/api/core';

const LS_PREFIX = 'api-key:';

/** Where an API key ended up being stored. */
export type KeyStorage = 'keychain' | 'localStorage';

/** Is the app running inside Tauri? */
export function isTauriApp(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}

/**
 * Save an API key.
 * - Browser: localStorage.
 * - Tauri: the OS Keychain. If the keychain is unavailable, fail closed instead
 *   of persisting the key in localStorage.
 */
export async function saveApiKey(provider: string, apiKey: string): Promise<KeyStorage> {
  if (isTauriApp()) {
    await invoke('save_api_key', { provider, apiKey });
    // Clean up keys saved by older fallback builds.
    try { localStorage.removeItem(LS_PREFIX + provider); } catch { /* ignore */ }
    return 'keychain';
  }
  localStorage.setItem(LS_PREFIX + provider, apiKey);
  return 'localStorage';
}

/** Get the saved API key (empty string if none found). */
export async function getApiKey(provider: string): Promise<string> {
  if (isTauriApp()) {
    try {
      const key = await invoke<string>('get_api_key', { provider });
      if (key) return key;
    } catch {
      // NoEntry or keychain unavailable.
    }
    return '';
  }
  return localStorage.getItem(LS_PREFIX + provider) ?? '';
}

/** Delete the saved API key. Tauri also clears keys from older fallback builds. */
export async function deleteApiKey(provider: string): Promise<void> {
  if (isTauriApp()) {
    try { await invoke('delete_api_key', { provider }); } catch { /* ignore */ }
    try { localStorage.removeItem(LS_PREFIX + provider); } catch { /* ignore */ }
    return;
  }
  localStorage.removeItem(LS_PREFIX + provider);
}

/** Check whether a saved API key exists. */
export async function hasApiKey(provider: string): Promise<boolean> {
  if (isTauriApp()) {
    try {
      return await invoke<boolean>('has_api_key', { provider });
    } catch { /* ignore */ }
    return false;
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
