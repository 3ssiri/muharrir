# Anthropic Claude for Startups Draft

Use this for Anthropic's Claude for Startups route.

Official references:

- Claude for Startups: https://www.anthropic.com/startups
- Startup Program terms: https://www.anthropic.com/startup-program-official-terms

## Submission Strategy

Anthropic is the strongest fit if Muharrir is framed as a Claude-native prompt refinement workspace. The product story fits Claude well, and the technical submission should be honest:

- Current: OpenAI-compatible provider architecture, native Claude Messages API adapter, local Ollama, demo mode.
- Remaining gate: run a real Claude Console API-key smoke test before pressing submit.

Current public Claude integration tracker:

- Issue: https://github.com/3ssiri/muharrir/issues/16
- Milestone: https://github.com/3ssiri/muharrir/milestone/1

## Short Product Description

Muharrir is a local-first Arabic/English prompt engineering workspace that helps users turn rough ideas, documents, and requirements into structured, reusable AI prompts through guided multi-step refinement.

## What Are You Building?

We are building Muharrir, a bilingual Arabic/English prompt engineering workspace for users who need better AI instructions than a generic chat box can provide.

The workflow starts with a rough idea or uploaded document. Muharrir then guides the user through clarification, multi-dimensional enhancement choices, and a final structured prompt proposal that can be copied, saved, compared, and reused. The product is local-first: conversations and settings stay on the user's device, PDF/DOCX parsing happens in the browser, and the desktop build can store API keys in the OS Keychain.

Muharrir is especially focused on Arabic-first and bilingual workflows, where high-quality RTL UX, Arabic examples, and privacy-conscious provider choice are still underserved.

## How Would You Use Claude?

Claude is a strong fit for Muharrir because the core workflow depends on instruction following, document understanding, tool use, writing quality, and careful multi-step refinement.

Muharrir includes first-party Claude API support so users can run the guided prompt-refinement workflow directly on Claude. Claude would power:

- clarifying questions for ambiguous user intent,
- multi-dimensional prompt improvement options,
- structured final prompt proposals,
- document-to-prompt workflows from local PDF/DOCX text,
- bilingual Arabic/English refinement with high-quality writing.

The native Claude provider adapter maps Muharrir's three structured tools to Claude tool-use schemas and consumes Claude Messages API streaming events through the same UI stream protocol used by the rest of the app.

## Why Claude?

Muharrir needs models that can follow structured instructions, reason over long user context, and produce careful writing in both Arabic and English. Claude's strengths in writing, coding, analysis, and document-heavy workflows align with Muharrir's goal: helping users move from unclear intent to precise reusable prompts.

Claude also fits the product philosophy. Muharrir is not trying to maximize lock-in; it gives users more control over where their prompts and files go. A first-party Claude integration would let privacy-conscious and quality-conscious users choose Claude directly.

## Who Are The Users?

Muharrir serves:

- developers writing prompts for coding agents,
- educators designing learning tasks and rubrics,
- researchers and writers converting documents into AI instructions,
- Arabic-speaking professionals who need good RTL and bilingual workflows,
- privacy-conscious users who prefer local-first tools and provider choice.

## Current Progress

- Next.js and Tauri app with a shared web/desktop codebase.
- Arabic/English UI with RTL support.
- Demo mode that works without an external provider call.
- OpenAI-compatible provider configuration.
- Native Claude Messages API configuration and tool-use mapping.
- Local Ollama detection and one-click setup without an API key.
- Browser-side PDF/DOCX parsing.
- Local IndexedDB history and favorites.
- Tauri desktop key handling through OS Keychain when available.
- Vitest and Playwright coverage for key flows.

## What Support Would Unlock

Anthropic support would help us:

- build and test native Claude API support,
- improve Arabic/English prompt quality on Claude,
- expand document-to-prompt examples,
- improve desktop releases and local-first onboarding,
- prepare community prompt packs and contribution paths,
- keep the project open-source and independent rather than turning it into a closed hosted service.

## Honest Risk / Gap

Native Claude support is implemented, but it should still be smoke-tested with a real Claude Console API key before submission. Do not claim production Claude usage, Anthropic credits, or an Anthropic partnership unless those are actually granted.

## Paste-Ready 1,000 Character Answer

Muharrir is a local-first Arabic/English prompt engineering workspace that helps users turn rough ideas, documents, and requirements into structured, reusable AI prompts. It is not a generic chat app; it guides users through clarification, enhancement choices, and final prompt proposals they can copy, save, compare, and reuse. The app supports RTL Arabic and English, local IndexedDB history, browser-side PDF/DOCX parsing, demo mode without external calls, local Ollama, native Claude Messages API support, OpenAI-compatible providers, and Tauri desktop builds with OS Keychain API key storage when available. Claude is a strong fit because the workflow depends on instruction following, writing quality, document understanding, tool use, and careful multi-step refinement.

