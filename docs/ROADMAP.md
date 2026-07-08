# Roadmap

This roadmap focuses on making Muharrir a useful local-first Arabic/English prompt engineering workspace before and after the public OSS release.

## Now

- Resolve license and package identity.
- Add OSS governance docs: contributing, security, privacy, roadmap, issue templates, and PR template.
- Strengthen CI with lint, typecheck, unit tests, and production build.
- Refresh README positioning, quick start, demo mode, privacy, and Web vs Desktop behavior.
- Improve demo mode so first-time users understand the core prompt workflow without a provider key.
- Add screenshots or GIFs for the README.

## Next

- Add clearer provider troubleshooting, especially browser CORS guidance.
- Improve prompt proposal templates for Arabic-first workflows.
- Add Playwright smoke coverage for `/ar`, `/en`, settings, language switch, and demo mode.
- Add prompt import/export documentation.
- Add a privacy center or settings section that explains local storage and provider boundaries in-app.
- Prepare a signed desktop release when the release gate is otherwise ready.

## Later

- Prompt packs for developers, educators, product teams, and content creators.
- Prompt versioning and comparison improvements.
- Offline PWA support with a service worker.
- Optional local model integrations where practical.
- Browser extension research after the main app is stable.

## Non-Goals For The First Public Release

- Cloud accounts or hosted prompt storage.
- A project-owned backend proxy for provider calls.
- Team collaboration features that require centralized storage.
- Claims that Muharrir replaces provider privacy policies or enterprise compliance reviews.
