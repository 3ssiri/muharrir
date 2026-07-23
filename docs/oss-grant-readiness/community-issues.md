# Community Issue Backlog

These starter issues were opened privately on 2026-07-23. They become publicly
visible when the repository passes the credential-history gate and its
visibility changes to public.

## Good First Issues

### Add English screenshots to the README

Issue: https://github.com/3ssiri/muharrir/issues/18

Labels: `good first issue`, `documentation`

Create one English UI screenshot that mirrors the existing demo-mode screenshot and add it near the current README demo preview.

Acceptance:

- Screenshot does not include private prompts, API keys, or personal data.
- README renders both screenshots clearly.
- Image file is optimized enough for GitHub browsing.

### Add a provider CORS troubleshooting FAQ entry

Issue: https://github.com/3ssiri/muharrir/issues/19

Labels: `good first issue`, `provider`, `documentation`

Add a short FAQ entry linking to `docs/providers.md` and explaining why some providers fail in browser mode but work in desktop mode.

Acceptance:

- FAQ avoids blaming the user's API key when CORS is the likely cause.
- Links to provider docs and privacy docs.
- Arabic and English wording is clear.

### Add a local model setup note for Ollama

Issue: https://github.com/3ssiri/muharrir/issues/20

Labels: `good first issue`, `provider`, `documentation`

Document the minimum Ollama setup needed to use Muharrir with `http://localhost:11434/v1`.

Acceptance:

- Mentions the built-in Ollama provider.
- Includes one example model.
- Explains that local models do not require a remote API key.

## Help Wanted Issues

### Improve Arabic prompt proposal templates

Issue: https://github.com/3ssiri/muharrir/issues/21

Labels: `help wanted`, `i18n`

Improve the Arabic-first examples used by prompt proposal flows so final prompts read naturally in Arabic and preserve RTL-friendly structure.

Acceptance:

- Adds or updates examples without hardcoding user-visible strings outside i18n files.
- Keeps English behavior intact.
- Includes before/after examples in the PR.

### Add accessibility audit coverage

Issue: https://github.com/3ssiri/muharrir/issues/22

Labels: `help wanted`, `accessibility`, `testing`

Audit the main chat, settings dialog, language switcher, favorites, and prompt proposal card for keyboard and screen-reader behavior.

Acceptance:

- Documents findings.
- Fixes at least one concrete issue.
- Adds Playwright or manual verification notes.

### Add desktop release documentation

Issue: https://github.com/3ssiri/muharrir/issues/23

Labels: `help wanted`, `desktop`, `documentation`

Document how maintainers create signed Tauri releases through GitHub Actions, including required updater signing secrets.

Acceptance:

- Explains why local `tauri build` may produce installers before updater signing fails.
- Does not reveal or request secrets.
- Links to `SECURITY.md` where relevant.

### Add offline PWA support plan

Issue: https://github.com/3ssiri/muharrir/issues/24

Labels: `help wanted`, `privacy`, `documentation`

Design a cautious plan for service worker/offline support that does not cache sensitive prompts or provider responses unexpectedly.

Acceptance:

- Identifies what can and cannot be cached.
- Notes privacy risks.
- Does not add a service worker without a reviewed design.

### Add provider fixture tests

Issue: https://github.com/3ssiri/muharrir/issues/25

Labels: `help wanted`, `provider`, `testing`

Expand provider tests with fixtures for custom provider import/export and CORS messaging behavior.

Acceptance:

- Keeps tests offline.
- Covers OpenRouter and one local provider.
- Does not require API keys.

