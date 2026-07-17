# Muharrir Application Package

This folder contains ready-to-edit materials for applying Muharrir to AI startup, developer, and research support programs, with specific tracks for Anthropic and OpenAI.

Use these files as the source package before copying answers into external forms. Replace every `TODO` with verified information before submitting.

## Current Readiness Verdict

Muharrir is technically demo-ready, but not fully submission-ready until the repository visibility is public or the program accepts a private review link, the private application fields are filled with verified account/company details, and real-key provider smoke tests are recorded.

| Area | Status | Notes |
|---|---:|---|
| Local demo | Ready | Demo mode works without a provider key. |
| Local models | Ready | Ollama can be detected and selected without an API key. |
| OpenAI fit | Strong | The app is already built around OpenAI-compatible provider settings. |
| Anthropic fit | Stronger | Native Claude Messages API support is implemented; run one real-key smoke test before submitting. |
| Public repo | Blocked | GitHub currently reports the repository as private. Switch visibility before submitting to programs that require public OSS. |
| Website/demo URL | Partial | Release and demo video links exist, but private-repo links may not be accessible to reviewers until visibility changes or access is granted. |
| Traction | TODO | Do not invent user counts. Use honest early-stage language. |

## Files

- [provider-program-fit.md](provider-program-fit.md): Which Anthropic/OpenAI routes fit Muharrir and what each requires.
- [anthropic-startups.md](anthropic-startups.md): Draft answers for Anthropic Claude for Startups.
- [openai-startups.md](openai-startups.md): Draft answers for OpenAI startup/community routes.
- [official-statement.md](official-statement.md): Official one-line positioning for forms, README snippets, and outreach.
- [private-submission-data.template.md](private-submission-data.template.md): Private form fields template; copy locally and fill with real account/company details.
- [application-fields.md](application-fields.md): Shared short, medium, and long form copy.
- [demo-script.md](demo-script.md): 90-second demo video script and shot list.
- [submission-checklist.md](submission-checklist.md): Final gate before pressing submit.

## Recommended Submission Order

1. Fill the private application fields in a local, uncommitted copy of [private-submission-data.template.md](private-submission-data.template.md).
2. Run a real-key smoke test for OpenAI-compatible and Claude provider paths.
3. Submit OpenAI Startup Community first because Muharrir is already OpenAI-compatible.
4. Submit Anthropic Claude for Startups with the native Claude integration story front and center.

## Current Public Links

- Repository: https://github.com/3ssiri/muharrir
- Release: https://github.com/3ssiri/muharrir/releases/tag/v0.3.0-beta.1 (prerelease with demo assets; no signed desktop installers yet)
- Public demo video: https://github.com/3ssiri/muharrir-demo-assets/raw/master/muharrir-application-demo.mp4
- Claude API support issue: https://github.com/3ssiri/muharrir/issues/16
- Claude API support milestone: https://github.com/3ssiri/muharrir/milestone/1

## Official Program References

- Anthropic Claude for Startups: https://www.anthropic.com/startups
- Anthropic Startup Program terms: https://www.anthropic.com/startup-program-official-terms
- OpenAI Startups: https://openai.com/business/why-openai/startups/
- OpenAI Startup Community: https://openai.com/leads/startup/
- OpenAI Researcher Access Program: https://openai.com/form/researcher-access-program/

