# Submission Packet

Use this file as the shared copy/paste packet for Codex for Open Source, OpenAI,
and Anthropic forms. Use `codex-for-open-source.md` for the exact OSS form.

## Public Links

- Repository: https://github.com/3ssiri/muharrir
- Release: https://github.com/3ssiri/muharrir/releases/tag/v0.3.0-beta.1 (prerelease with demo assets; no signed desktop installers yet)
- Demo video: https://github.com/3ssiri/muharrir-demo-assets/raw/master/muharrir-application-demo.mp4
- Privacy: https://github.com/3ssiri/muharrir/blob/master/docs/PRIVACY.md
- Security: https://github.com/3ssiri/muharrir/blob/master/SECURITY.md
- Roadmap: https://github.com/3ssiri/muharrir/blob/master/docs/ROADMAP.md
- Claude support issue: https://github.com/3ssiri/muharrir/issues/16

## Official Form Links

- Codex for Open Source: https://openai.com/form/codex-for-oss/
- Codex Open Source Fund: https://openai.com/form/codex-open-source-fund/
- OpenAI Startups: https://openai.com/business/why-openai/startups/
- OpenAI Researcher Access Program: https://grants.openai.com/prog/openai_researcher_access_program/
- Claude for Startups: https://claude.com/programs/startups
- Anthropic Startup Program terms: https://www.anthropic.com/startup-program-official-terms

## One-Line Description

Muharrir is a local-first Arabic/English prompt engineering workspace that turns rough ideas, documents, and requirements into structured, reusable AI prompts.

## 500-Character Description

Muharrir helps developers, educators, researchers, and creators turn rough ideas, long documents, and unclear requirements into structured AI prompts. It is local-first, bilingual Arabic/English, RTL-ready, and built for guided prompt refinement rather than generic chat. It supports local history, browser-side PDF/DOCX parsing, native Claude API, OpenAI-compatible providers, demo mode without external calls, local Ollama, and Tauri desktop builds with OS Keychain API key storage when available.

## 1,000-Character Description

Muharrir is an open-source, local-first Arabic/English prompt engineering workspace for developers, educators, researchers, and creators. It helps users transform rough ideas, long documents, and unclear requirements into structured, reusable AI prompts through a guided workflow: clarification questions, enhancement choices, and final copy-ready prompt proposals. The project supports Arabic RTL and English from the same interface, local IndexedDB history, browser-side PDF/DOCX parsing, native Claude API support, configurable OpenAI-compatible providers, demo mode without external calls, local Ollama, and Tauri desktop builds with OS Keychain API key storage when available. The goal is to make high-quality prompt engineering more accessible for Arabic-first and privacy-conscious users without forcing prompts, files, or keys through a central project server.

## OpenAI API Usage

Muharrir uses OpenAI-compatible chat completions and tool-calling patterns to power a guided prompt-refinement flow: classify ambiguous user intent, ask clarification questions, suggest structured enhancement options, generate final prompt proposals, refine prompts using document context, and stream responses into the app's UI protocol. OpenAI support would help improve model presets, Arabic/English prompt quality, structured output reliability, public examples, test coverage, and a stable open-source beta.

## Claude Usage

Muharrir includes native Claude Messages API support for running guided prompt refinement directly on Claude. The adapter maps Muharrir's structured tools to Claude tool-use schemas and converts Claude streaming events into the app's UI protocol. Claude is a strong fit because the workflow depends on instruction following, writing quality, document understanding, tool use, and careful multi-step refinement.

## Honest Early-Stage Traction Wording

Muharrir is currently an early-stage open-source beta candidate. The project has a working local demo, automated tests, release materials, native Claude support, local Ollama support, and a roadmap for provider integrations and Arabic-first prompt workflows. I am not claiming production traction yet.

## Private Fields Still Required

Do not invent these values. Fill them from the real account/company before submitting:

- First and last name.
- Business or company email.
- Company/project name.
- Company/project website, if available.
- OpenAI Organization ID, if submitting it.
- OpenAI Project ID, if requested.
- Claude Console account email.
- Funding status and investor/accelerator details, if any.
- Current user/revenue/traction numbers, if any.
- VC referral code, only if using a VC credit route.

## Final Gate

- Run one real Claude Console API-key smoke test before claiming production Claude usage.
- Run one real OpenAI-compatible provider smoke test before submitting OpenAI API usage claims.
- Repository, maintainer profile, README, license, and grant-readiness CI were
  verified publicly without authentication on 2026-07-29.
- Do not claim signed desktop installers until the Tauri signing secret is corrected and a release workflow produces artifacts.
- Keep provider privacy claims conservative: prompts are local until the user sends them to the selected provider.
