# OpenAI Startup Draft

Use this for OpenAI Startup Community, startup credits through a VC partner, or related OpenAI builder routes.

Official references:

- OpenAI Startups: https://openai.com/business/why-openai/startups/
- OpenAI Startup Community: https://openai.com/leads/startup/
- OpenAI Researcher Access Program: https://openai.com/form/researcher-access-program/

## Submission Strategy

OpenAI is the most immediately aligned provider route because Muharrir already uses OpenAI-compatible chat and tool-calling flows. The application should emphasize:

- concrete API usage,
- guided prompt refinement rather than generic chat,
- Arabic/English and RTL differentiation,
- privacy-conscious local-first architecture,
- clear plans for OpenAI provider presets, examples, and prompt packs.

If applying for startup credits through a VC partner, prepare:

- VC referral code: TODO
- company/project name: Muharrir
- business email: TODO
- company/project website: https://github.com/3ssiri/muharrir
- OpenAI Organization ID: TODO
- product/API-use description: use the sections below
- basic funding details: TODO, do not invent

Current public demo link:

- https://github.com/3ssiri/muharrir-demo-assets/raw/master/muharrir-application-demo.mp4

Current public repository:

- https://github.com/3ssiri/muharrir

Current release:

- https://github.com/3ssiri/muharrir/releases/tag/v0.3.0-beta.1

## Short Product Description

Muharrir is a local-first Arabic/English prompt engineering workspace that turns rough ideas, documents, and requirements into structured, reusable AI prompts through guided refinement.

## What Are You Building?

We are building Muharrir, a prompt engineering workspace for users who need a reliable workflow between vague intent and useful AI instructions.

Instead of acting as another generic chat UI, Muharrir guides the user through a structured process: it asks clarifying questions when needed, proposes multi-dimensional improvement options, and generates final reusable prompts. Users can save, compare, export, and reuse prompt proposals. The product supports Arabic RTL and English from the same interface, local history, browser-side PDF/DOCX parsing, OpenAI-compatible providers, demo mode without external calls, local Ollama, and Tauri desktop builds.

## How Do You Use The OpenAI API?

Muharrir uses OpenAI-compatible chat completions and tool-calling patterns to power a guided prompt-refinement flow:

- classify ambiguous user intent,
- ask clarification questions,
- suggest structured enhancement options,
- generate final prompt proposals,
- refine prompts using document context,
- stream responses into the app's UI protocol.

OpenAI support would help us improve provider quality, model presets, Arabic/English prompt behavior, and test coverage for production-ready prompt workflows.

## Why OpenAI?

OpenAI is a natural fit because Muharrir's architecture already follows OpenAI-compatible provider conventions. The product is a practical API application: users bring rough ideas and local documents, and the model helps transform that material into structured prompts that improve downstream AI usage.

Using OpenAI models would help Muharrir deliver better instruction following, tool use, structured output, multilingual quality, and developer workflows for users building with AI.

## Who Is It For?

Muharrir is for:

- developers using AI coding agents,
- educators creating AI-assisted lessons and rubrics,
- researchers and writers transforming long documents into instructions,
- Arabic-speaking professionals who need strong RTL and bilingual workflows,
- privacy-conscious builders who prefer local-first storage and provider control.

## Why This Matters

Prompt quality is a hidden infrastructure layer for AI adoption. Many users have access to powerful models but still struggle to explain what they want. Muharrir makes the prompt creation process explicit, reusable, and teachable, especially for Arabic-first users who are underserved by English-first tooling.

## Current Progress

- OpenAI-compatible provider architecture.
- Native Claude provider architecture for cross-provider readiness.
- Streaming chat and tool-call adapter.
- Demo mode without external provider calls.
- Local Ollama detection and no-key setup.
- Arabic/English RTL interface.
- Local IndexedDB history.
- Browser-side PDF/DOCX parsing.
- Tauri desktop app with OS Keychain storage when available.
- Vitest and Playwright coverage for major flows.

## What Support Would Unlock

OpenAI startup support would help us:

- improve OpenAI provider presets and onboarding,
- test prompt workflows against current OpenAI models,
- build high-quality Arabic and English prompt packs,
- improve structured output reliability,
- create public examples for developers and educators,
- publish a stable open-source beta with desktop builds.

## Researcher Access Variant

Use this only if applying through OpenAI Researcher Access rather than startup routes.

Research framing:

> Muharrir can be used as a research platform for studying how Arabic and bilingual users transform vague intent into structured prompts, including questions of fairness, representation, accessibility, and productivity in multilingual AI workflows.

Research question draft:

> How does a guided, local-first Arabic/English prompt-refinement workflow affect prompt quality, user confidence, and task completion compared with free-form chat?

Do not use the researcher route if the application is purely commercial/product support.

## Paste-Ready 1,000 Character Answer

Muharrir is a local-first Arabic/English prompt engineering workspace that helps developers, educators, researchers, and creators turn rough ideas, documents, and requirements into structured, reusable AI prompts. Instead of acting as a generic chat interface, it guides users through clarification, enhancement choices, and final copy-ready prompt proposals. The app supports Arabic RTL and English, local IndexedDB history, browser-side PDF/DOCX parsing, OpenAI-compatible providers, demo mode without external calls, local Ollama, and Tauri desktop builds with OS Keychain API key storage when available. Muharrir uses OpenAI-compatible chat and tool-calling flows for structured prompt refinement. OpenAI support would help improve model presets, Arabic/English prompt quality, structured output reliability, public examples, test coverage, and a stable open-source beta.

