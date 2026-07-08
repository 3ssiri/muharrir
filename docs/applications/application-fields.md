# Shared Application Fields

Use this file for copy/paste answers across Anthropic, OpenAI, grants, accelerators, and OSS program forms.

## One-Line Description

Muharrir is a local-first Arabic/English prompt engineering workspace that turns rough ideas, documents, and requirements into structured, reusable AI prompts.

## 280 Characters

Muharrir is a local-first Arabic/English prompt engineering workspace that turns vague ideas and documents into structured, reusable AI prompts through guided refinement, RTL support, local storage, provider choice, demo mode, and desktop-ready privacy.

## 500 Characters

Muharrir helps developers, educators, researchers, and creators turn rough ideas, long documents, and unclear requirements into structured AI prompts. It is local-first, bilingual Arabic/English, RTL-ready, and built for guided prompt refinement rather than generic chat. It supports local history, browser-side PDF/DOCX parsing, native Claude API, OpenAI-compatible providers, demo mode without external calls, local Ollama, and Tauri desktop builds with OS Keychain API key storage when available.

## 1,000 Characters

Muharrir is an open-source, local-first Arabic/English prompt engineering workspace for developers, educators, researchers, and creators. It helps users transform rough ideas, long documents, and unclear requirements into structured, reusable AI prompts through a guided workflow: clarification questions, enhancement choices, and final copy-ready prompt proposals. The project supports Arabic RTL and English from the same interface, local IndexedDB history, browser-side PDF/DOCX parsing, native Claude API support, configurable OpenAI-compatible providers, demo mode without external calls, local Ollama, and Tauri desktop builds with OS Keychain API key storage when available. The goal is to make high-quality prompt engineering more accessible for Arabic-first and privacy-conscious users without forcing prompts, files, or keys through a central project server.

## Problem

Prompt quality is still a bottleneck for practical AI use. Users often begin with vague ideas, incomplete requirements, or long documents and then struggle to convert them into prompts that produce reliable results. This causes wasted tokens, inconsistent outputs, and repeated trial-and-error.

Arabic-speaking users face an additional gap: many AI tools are English-first, RTL support is often shallow, Arabic examples are limited, and privacy-conscious local workflows are uncommon. Muharrir addresses this by making prompt refinement a guided, bilingual, local-first workflow.

## Solution

Muharrir guides users from rough input to reusable prompts. It asks clarifying questions when needed, suggests multi-dimensional improvements, generates structured final prompts, and lets users save, compare, export, and reuse the result. The product is not a generic chat interface; it is a workflow layer for better prompting across models and providers.

## Why Now

AI coding agents, document workflows, educational tools, and knowledge work all depend on clear instructions. As more users rely on models for high-stakes daily work, the ability to transform messy intent into structured prompts becomes a core productivity skill. Muharrir makes that workflow accessible to Arabic and English users while preserving local control.

## Users

- Developers using AI coding assistants and agents.
- Educators designing lessons, rubrics, and learning activities.
- Researchers and writers converting documents into AI instructions.
- Arabic-speaking professionals who need strong RTL and bilingual support.
- Privacy-conscious users who prefer local-first tools and provider choice.

## Differentiation

1. Arabic-first and bilingual rather than English-only.
2. Local-first storage instead of a central hosted prompt database.
3. Guided prompt refinement instead of generic chat.
4. Browser-side document parsing for PDF/DOCX context.
5. Web and desktop builds from the same codebase.
6. Multi-provider architecture, including native Claude API, local Ollama, and OpenAI-compatible endpoints.

## Current State

Muharrir currently supports:

- Arabic and English UI with RTL support.
- Demo mode with no external provider call.
- Native Claude API support and OpenAI-compatible provider settings.
- Local Ollama detection and one-click setup without an API key.
- Local conversation history through IndexedDB.
- Browser-side PDF/DOCX parsing.
- Tauri desktop mode with OS Keychain API key storage when available.
- Unit and Playwright coverage for the main flows.

## Six-Month Plan

Month 1: Publish the public beta, record demo materials, and stabilize onboarding.

Month 2: Smoke-test native Claude API support with real keys, improve OpenAI provider presets, and publish provider guides.

Month 3: Add prompt packs for developers, educators, and Arabic creators.

Month 4: Improve desktop release automation and signed builds.

Month 5: Add prompt evaluation and versioning improvements.

Month 6: Build community contribution paths, examples, and public templates.

## Support Request

Support would help Muharrir remain open, local-first, and provider-flexible while improving Arabic prompt quality, provider compatibility, desktop releases, test coverage, and contribution-ready documentation.

## Evidence To Attach

- Repository: https://github.com/3ssiri/muharrir (confirm visibility or provide a private review link)
- Website or landing page: TODO
- Demo video: https://github.com/3ssiri/muharrir-demo-assets/raw/master/muharrir-application-demo.mp4
- Release: https://github.com/3ssiri/muharrir/releases/tag/v0.3.0-beta.1
- CI status: confirm latest `master` run before submission
- Roadmap: TODO
- Privacy/security docs: `docs/PRIVACY.md`, `SECURITY.md`

## Do Not Claim Unless True

- User counts or revenue.
- VC backing.
- Existing OpenAI or Anthropic partnership.
- Production customers.
- Anthropic credits, partnership, or production Claude usage.
- Zero Data Retention from providers.
- That all browser provider calls avoid CORS.

