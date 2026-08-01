#!/usr/bin/env node
// Preflight check for the Tauri updater signing secret used by the desktop
// release workflow. Fails fast (before a full desktop build) when
// TAURI_SIGNING_PRIVATE_KEY is missing, contains hidden characters, or has no
// decodable base64 payload — a hidden/BOM prefix previously broke decoding at
// the signing step after the installers were already built.

const key = process.env.TAURI_SIGNING_PRIVATE_KEY || ''

function fail(message) {
  console.error(`Signing secret preflight failed: ${message}`)
  process.exit(1)
}

if (!key.trim()) {
  fail('TAURI_SIGNING_PRIVATE_KEY is required for signed desktop updater artifacts.')
}

// Reject BOM/zero-width/hidden characters anywhere, not just at the start.
const hidden = /[\uFEFF\u200B\u200C\u200D\u2060]/
if (hidden.test(key)) {
  fail('TAURI_SIGNING_PRIVATE_KEY contains a BOM/hidden character. Re-copy the Tauri private key secret as plain text.')
}

// The minisign key file carries a base64 payload line; make sure it decodes.
const payload =
  key
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => /^[A-Za-z0-9+/=]+$/.test(line))[0] || ''
if (!payload || Buffer.from(payload, 'base64').length < 32) {
  fail('TAURI_SIGNING_PRIVATE_KEY has no decodable base64 payload. Paste the full contents of the Tauri .key file.')
}

console.log('Signing secret preflight passed.')
