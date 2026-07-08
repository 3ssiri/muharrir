# Privacy

Muharrir is designed as a local-first prompt engineering workspace. This document explains where data is stored and when data leaves the device.

## What Stays Local

- Conversations and saved prompts are stored in the browser's IndexedDB through Dexie.
- Most settings are stored locally through Zustand persistence.
- PDF and DOCX parsing is performed in the browser.
- The project does not run a central Muharrir backend for chat, file parsing, telemetry, or account storage.

## API Keys

### Browser Mode

In a regular browser, API keys and provider settings are stored in local browser storage. This makes the web app easy to run locally, but it also means access is controlled by the user's browser profile and device security.

### Desktop Mode

In Tauri desktop builds, Muharrir prefers storing API keys in the operating system keychain:

- Windows: Credential Manager
- macOS: Keychain
- Linux: Secret Service

If the keychain is unavailable, the desktop app fails closed and does not save the key to localStorage. The user can still use the key for the current session, but it will not persist across restarts until OS Keychain access works.

## When Data Leaves The Device

User prompts, selected file text, and conversation context are sent to the configured AI provider when the user sends a message with a real API key. Supported provider formats include OpenAI-compatible chat completions and Anthropic Claude Messages API.

The provider is controlled by the user's settings, including `baseUrl`, model, and API key. Muharrir does not proxy these requests through a project server.

## Demo Mode

When the API key is set to `demo`, Muharrir uses a simulated demo response and does not call an external AI provider.

## Uploaded Files

PDF and DOCX files are parsed locally in the browser. Parsed text may be included in the prompt context that the user sends to their configured provider.

Do not upload documents containing secrets or sensitive personal data unless you are comfortable sending the resulting text to your selected provider.

## Telemetry

Muharrir does not include default telemetry. If telemetry is ever proposed, it must be opt-in and documented before release.

## User Responsibilities

- Keep API keys private.
- Review provider privacy policies before sending sensitive prompts.
- Avoid sharing screenshots that reveal keys, prompts, documents, or private conversations.
- Clear browser or desktop app data when using a shared machine.
