# Security Policy

Muharrir is local-first and provider-based. The project does not run a central API for user prompts, but security reports still matter because the app handles API keys, local files, and prompt history.

## Reporting A Vulnerability

Please do not open a public issue for a suspected vulnerability. Contact the maintainer privately first:

- GitHub: https://github.com/3ssiri

Include:

- A concise description of the issue.
- Reproduction steps.
- Affected platform: web, Windows, macOS, Linux, or all.
- Whether API keys, local files, prompt history, or provider requests are involved.

Do not include real API keys, private prompts, personal data, or private documents in the report. Use redacted examples.

## Supported Versions

Until the first public OSS release, security fixes target the current `master` branch and the newest tagged release.

## Secrets And API Keys

- Do not commit `.env` files, signing keys, provider tokens, or API keys.
- Do not paste API keys into GitHub issues or pull requests.
- Desktop builds store API keys through the OS Keychain in Tauri. If the system keychain is unavailable, the key is not persisted to localStorage.
- Browser builds store settings locally in the user's browser.

## Security Expectations For Changes

- No telemetry by default.
- No backend routes or middleware without an accepted architecture decision.
- Uploaded files should continue to be parsed locally in the browser.
- Provider requests should go directly to the configured OpenAI-compatible provider.
- Logs must not expose secrets.
