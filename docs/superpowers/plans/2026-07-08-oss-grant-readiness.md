# OSS Grant Readiness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prepare Muharrir for a later public open-source release and grant application while keeping the repository private until the readiness gate passes.

**Architecture:** Treat OSS readiness as a staged product hardening effort, not a single documentation pass. The first slice resolves identity, licensing, package metadata, CI confidence, privacy/security documentation, and community entry points without adding a backend or changing the local-first architecture.

**Tech Stack:** Next.js 14 static export, React 18, TypeScript, Vitest, Playwright, Tauri v2, GitHub Actions, Markdown governance docs.

---

## Important Decisions

- The repository remains private until the release gate is complete.
- The public license target is MIT because Muharrir benefits from broad adoption and easy contribution.
- `package.json` keeps `"private": true` for now to prevent accidental npm publication; repository visibility is a GitHub decision, not an npm publication decision.
- The package name becomes `muharrir` and project metadata must describe the real product.
- Demo mode must become a credible first-use experience before public launch.
- Tauri API key storage must be documented precisely: Keychain is preferred, with an existing localStorage fallback when Keychain is unavailable.
- No backend or API routes are added; the app remains static-export compatible.
- CI must prove `lint`, `typecheck`, unit tests, and production build without requiring API secrets.

## Files And Responsibilities

- `LICENSE`: Legal license text for public OSS release.
- `package.json`: Package identity, scripts, license, repository metadata, and keywords.
- `package-lock.json`: Lockfile metadata synchronized with `package.json`.
- `.github/workflows/ci.yml`: Required web confidence checks.
- `CONTRIBUTING.md`: Contributor setup, tests, i18n, provider, and PR expectations.
- `SECURITY.md`: Vulnerability reporting and secret-handling policy.
- `CODE_OF_CONDUCT.md`: Community conduct baseline.
- `docs/PRIVACY.md`: Data flow, local storage, file parsing, API key behavior, and provider boundaries.
- `docs/ROADMAP.md`: Public-facing roadmap that does not overpromise.
- `.github/PULL_REQUEST_TEMPLATE.md`: Review checklist.
- `.github/ISSUE_TEMPLATE/*.yml`: Structured bug, feature, and documentation issues.
- `docs/oss-grant-readiness/DECISIONS.md`: Internal decision log for readiness work.
- `docs/oss-grant-readiness/execution-checklist.md`: Progress tracker for the broader readiness plan.
- `README.md`: Product positioning, quick start, demo mode, privacy, architecture, and contributing sections.

## Phase 1: Identity, License, And CI Foundation

### Task 1: Create The Readiness Decision Log

**Files:**
- Create: `docs/oss-grant-readiness/DECISIONS.md`
- Modify: `docs/oss-grant-readiness/execution-checklist.md`

- [ ] **Step 1: Add decision log**

Create `docs/oss-grant-readiness/DECISIONS.md` with:

```markdown
# Muharrir OSS Readiness Decisions

## Status

Muharrir remains private while OSS readiness work is completed. The repository should become public only after the readiness gate passes.

## Decisions

| Date | Decision | Rationale | Status |
|---|---|---|---|
| 2026-07-08 | Prepare privately before opening the repository. | Reduces risk from license, privacy, and documentation gaps. | Accepted |
| 2026-07-08 | Use MIT as the target public license. | Maximizes adoption and keeps contribution expectations simple. | Accepted |
| 2026-07-08 | Keep `private: true` in `package.json` for now. | Prevents accidental npm publication; GitHub visibility can still change later. | Accepted |
| 2026-07-08 | Preserve the local-first static-export architecture. | Public readiness must not introduce a backend or cloud dependency. | Accepted |
| 2026-07-08 | Document the Tauri API key fallback honestly. | Keychain is preferred, but the current fallback can use localStorage when Keychain is unavailable. | Accepted |
```

- [ ] **Step 2: Mark phase 0 decisions**

In `docs/oss-grant-readiness/execution-checklist.md`, mark the decided phase 0 items as complete and link to the decision log.

- [ ] **Step 3: Verify docs**

Run: `git diff -- docs/oss-grant-readiness/DECISIONS.md docs/oss-grant-readiness/execution-checklist.md`

Expected: the decision log exists and phase 0 reflects accepted decisions.

### Task 2: Resolve License And Package Identity

**Files:**
- Modify: `LICENSE`
- Modify: `package.json`
- Modify: `package-lock.json`

- [ ] **Step 1: Replace proprietary license with MIT**

Set `LICENSE` to the standard MIT license using copyright holder `Ali Assiri`.

- [ ] **Step 2: Update package metadata**

Set `package.json` fields:

```json
{
  "name": "muharrir",
  "version": "0.2.3",
  "private": true,
  "description": "Local-first Arabic/English prompt engineering workspace for turning vague ideas and documents into structured AI prompts.",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/3ssiri/muharrir.git"
  },
  "bugs": {
    "url": "https://github.com/3ssiri/muharrir/issues"
  },
  "homepage": "https://github.com/3ssiri/muharrir#readme",
  "keywords": [
    "prompt-engineering",
    "arabic",
    "rtl",
    "local-first",
    "tauri",
    "nextjs",
    "ai-tools"
  ]
}
```

Keep existing scripts and dependencies.

- [ ] **Step 3: Add typecheck script**

Add:

```json
"typecheck": "tsc --noEmit"
```

- [ ] **Step 4: Sync lockfile metadata**

Run: `npm install --package-lock-only`

Expected: lockfile root package metadata matches `package.json` without changing installed dependencies.

- [ ] **Step 5: Verify identity**

Run: `node -e "const p=require('./package.json'); console.log(p.name, p.private, p.license, p.scripts.typecheck)"`

Expected output contains: `muharrir true MIT tsc --noEmit`.

### Task 3: Strengthen CI

**Files:**
- Modify: `.github/workflows/ci.yml`

- [ ] **Step 1: Use reproducible install**

Change web job dependency installation from `npm install` to `npm ci`.

- [ ] **Step 2: Add checks before build**

Add steps in order:

```yaml
- name: Lint
  run: npm run lint

- name: Typecheck
  run: npm run typecheck

- name: Unit tests
  run: npm run test:unit
```

- [ ] **Step 3: Verify workflow syntax**

Run: `git diff -- .github/workflows/ci.yml`

Expected: web job runs `npm ci`, lint, typecheck, unit tests, then build.

### Task 4: Run Verification For Phase 1

**Files:**
- Read: `package.json`
- Read: `.github/workflows/ci.yml`

- [ ] **Step 1: Run unit tests**

Run: `npm run test:unit`

Expected: all Vitest tests pass.

- [ ] **Step 2: Run typecheck**

Run: `npm run typecheck`

Expected: TypeScript exits successfully.

- [ ] **Step 3: Run lint**

Run: `npm run lint`

Expected: ESLint exits successfully.

## Phase 2: OSS Governance And Privacy Docs

### Task 5: Add Governance Docs

**Files:**
- Create: `CONTRIBUTING.md`
- Create: `SECURITY.md`
- Create: `CODE_OF_CONDUCT.md`

- [ ] **Step 1: Add contributor guide**

Document setup with `npm ci`, `npm run dev`, `npm run test:unit`, `npm run lint`, `npm run typecheck`, and `npm run build`. Include rules for i18n keys, static export, Tauri guards, and provider additions.

- [ ] **Step 2: Add security policy**

Document that API keys and secrets must not be pasted into issues, and that vulnerability reports should be sent privately to the maintainer before public disclosure.

- [ ] **Step 3: Add code of conduct**

Use a concise contributor covenant style policy suitable for a small OSS project.

### Task 6: Add Privacy And Roadmap Docs

**Files:**
- Create: `docs/PRIVACY.md`
- Create: `docs/ROADMAP.md`

- [ ] **Step 1: Add privacy documentation**

Document local IndexedDB storage, browser localStorage behavior, Tauri Keychain behavior, current localStorage fallback, file parsing in the browser, and provider API boundaries.

- [ ] **Step 2: Add roadmap**

Use Now, Next, Later sections with achievable items: license/docs/CI, demo mode, screenshots, provider docs, prompt packs, privacy center, PWA offline support.

### Task 7: Add GitHub Templates

**Files:**
- Create: `.github/PULL_REQUEST_TEMPLATE.md`
- Create: `.github/ISSUE_TEMPLATE/bug_report.yml`
- Create: `.github/ISSUE_TEMPLATE/feature_request.yml`
- Create: `.github/ISSUE_TEMPLATE/documentation.yml`

- [ ] **Step 1: Add PR template**

Include summary, verification commands, privacy/security checklist, i18n checklist, and static export/Tauri checklist.

- [ ] **Step 2: Add issue templates**

Use GitHub issue forms for bugs, feature requests, and documentation improvements. Include warnings not to share API keys or private prompts.

## Phase 3: README And First-Use Experience

### Task 8: Rewrite README For OSS Readiness

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Reposition product**

Use the headline: `Local-first Arabic/English prompt engineering workspace`.

- [ ] **Step 2: Add quick start and demo mode**

Document `npm ci`, `npm run dev`, and using `demo` as the API key for a no-provider trial.

- [ ] **Step 3: Add Web vs Desktop table**

Explain API key storage, CORS expectations, and Tauri Keychain behavior.

- [ ] **Step 4: Add privacy and contribution links**

Link `docs/PRIVACY.md`, `SECURITY.md`, `CONTRIBUTING.md`, and `docs/ROADMAP.md`.

### Task 9: Improve Demo Mode

**Files:**
- Modify: `src/lib/chat-client.ts`
- Test: `src/lib/__tests__/chat-client.test.ts`

- [ ] **Step 1: Add failing test for structured demo stream**

Add a Vitest test that calls demo mode and expects streamed protocol chunks for at least one realistic assistant text section.

- [ ] **Step 2: Implement stronger demo response**

Replace the thin demo text with a realistic Arabic/English-friendly response that describes questions, enhancement options, and a final structured prompt sample.

- [ ] **Step 3: Verify demo tests**

Run: `npm run test:unit -- src/lib/__tests__/chat-client.test.ts`

Expected: chat-client tests pass.

## Phase 4: Release Gate

### Task 10: Final Verification

**Files:**
- Read: all changed files

- [ ] **Step 1: Run required checks**

Run:

```powershell
npm run lint
npm run typecheck
npm run test:unit
npm run build
```

Expected: all commands pass without API keys.

- [ ] **Step 2: Search for conflicting license language**

Run:

```powershell
rg -n "proprietary|confidential|all rights reserved" . --glob "!node_modules/**" --glob "!out/**" --glob "!target/**"
```

Expected: no active project files claim proprietary/confidential licensing after MIT migration, except historical planning text that explicitly describes the old state.

- [ ] **Step 3: Update readiness checklist**

Mark completed tasks in `docs/oss-grant-readiness/execution-checklist.md` and leave undecided public-release items unchecked.

## Self-Review Notes

- The plan covers the user's decision to start readiness now while opening the repository later.
- It preserves static export and local-first architecture.
- It documents license, package metadata, CI, privacy, security, governance, README, demo mode, and release gate.
- It avoids storing secrets or reading MCP credentials.
