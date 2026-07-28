# Muharrir Application Package

This folder contains ready-to-edit materials for applying Muharrir to open-source,
AI startup, developer, and research support programs.

Use these files as the source package before copying answers into external forms. Replace every `TODO` with verified information before submitting.

## Current Readiness Verdict

Muharrir is technically demo-ready. Codex for Open Source is the primary OSS
route and includes API-credit consideration through the Codex Open Source Fund.
A separate fund form remains live, but should be treated as a potentially
overlapping alternative rather than a second default submission. Provider
startup programs remain secondary routes with additional account, funding, and
real-key testing requirements.

| Area | Status | Notes |
|---|---:|---|
| Local demo | Ready | Demo mode works without a provider key. |
| Local models | Ready | Ollama can be detected and selected without an API key. |
| Codex for OSS fit | Ready | The repository is public, CI is green, and a dedicated form packet is prepared. |
| Separate Codex Fund form | Verify overlap | The live form describes grants up to $25,000 in API credits, but the current Codex for OSS route already includes fund consideration. |
| OpenAI fit | Strong | The app is already built around OpenAI-compatible provider settings. |
| Anthropic fit | Stronger | Native Claude Messages API support is implemented; run one real-key smoke test before submitting. |
| Public repo | Ready | Repository and maintainer profile were verified without authentication on 2026-07-29. |
| Website/demo URL | Ready | Repository, release, and public demo links are available. |
| Traction | Early-stage | Do not invent user counts; use the honest wording in the packet. |

## Files

- [codex-for-open-source.md](codex-for-open-source.md): Exact Codex for Open Source form requirements and paste-ready 500-character answers.
- [codex-open-source-fund.md](codex-open-source-fund.md): Separate packet for the OpenAI Codex Open Source Fund application.
- [provider-program-fit.md](provider-program-fit.md): Which Anthropic/OpenAI routes fit Muharrir and what each requires.
- [anthropic-startups.md](anthropic-startups.md): Draft answers for Anthropic Claude for Startups.
- [openai-startups.md](openai-startups.md): Draft answers for OpenAI startup/community routes.
- [official-statement.md](official-statement.md): Official one-line positioning for forms, README snippets, and outreach.
- [private-submission-data.template.md](private-submission-data.template.md): Private form fields template; copy locally and fill with real account/company details.
- [application-fields.md](application-fields.md): Shared short, medium, and long form copy.
- [demo-script.md](demo-script.md): 90-second demo video script and shot list.
- [submission-checklist.md](submission-checklist.md): Final gate before pressing submit.

## Recommended Submission Order

1. Review the current program terms and the verified private application fields.
2. Submit [Codex for Open Source](codex-for-open-source.md) with truthful current
   repository metrics. Use the separate
   [Codex Open Source Fund](codex-open-source-fund.md) form only after confirming
   it is a non-duplicative alternative under the current terms.
3. Run real-key smoke tests before submitting provider startup applications.
4. Submit Claude for Startups or OpenAI for Startups only through a route for which the applicant meets the current account/funding requirements.

## Current Links

The repository, maintainer profile, release, and demo assets are public.

- Repository: https://github.com/3ssiri/muharrir
- Release: https://github.com/3ssiri/muharrir/releases/tag/v0.3.0-beta.1 (prerelease with demo assets; no signed desktop installers yet)
- Public demo video: https://github.com/3ssiri/muharrir-demo-assets/raw/master/muharrir-application-demo.mp4
- Claude API support issue: https://github.com/3ssiri/muharrir/issues/16
- Claude API support milestone: https://github.com/3ssiri/muharrir/milestone/1

## Official Program References

- Codex for Open Source: https://developers.openai.com/community/codex-for-oss
- Codex for Open Source application: https://openai.com/form/codex-for-oss/
- Codex Open Source Fund application: https://openai.com/form/codex-open-source-fund/
- Anthropic Claude for Startups: https://www.anthropic.com/startups
- Anthropic Startup Program terms: https://www.anthropic.com/startup-program-official-terms
- OpenAI Startups: https://openai.com/business/why-openai/startups/
- OpenAI developer community: https://developers.openai.com/community
- OpenAI Researcher Access Program: https://grants.openai.com/prog/openai_researcher_access_program/

