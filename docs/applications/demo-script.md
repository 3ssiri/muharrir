# 90-Second Demo Script

Goal: record one clean demo that works for Anthropic, OpenAI, OSS grants, and public launch.

## Setup

- Browser URL: `http://127.0.0.1:3111/ar/` or a public demo build.
- Language: start in Arabic, switch briefly to English.
- Provider path: use Demo mode for deterministic recording. Optionally include a 5-second Ollama shot.
- Avoid showing real API keys, private files, private prompts, or personal data.

## Shot List

### 0-10s: Problem

Visual: Muharrir home screen.

Voiceover:

> Most people start AI tasks with vague intent: a rough idea, a document, or a messy requirement. Muharrir turns that into a structured reusable prompt.

### 10-25s: No-Key Onboarding

Visual: Show the welcome panel, "Try without a key", and "Use local Ollama" if available.

Voiceover:

> The first run works without an API key through demo mode, and local users can connect Ollama directly without sending keys to a project server.

### 25-45s: Rough Idea To Guided Refinement

Prompt to type:

```text
حوّل فكرة دورة قصيرة عن أساسيات الذكاء الاصطناعي للمعلمين إلى موجه منظم
```

Voiceover:

> Instead of answering like a generic chatbot, Muharrir guides the prompt engineering workflow: clarification, enhancement options, and a structured final proposal.

### 45-65s: Structured Output

Visual: Show enhancement table and final prompt proposal card.

Voiceover:

> The result is not just text. It is a reusable prompt with role, goals, workflow, constraints, and output format.

### 65-78s: Local-First Privacy

Visual: Show settings/provider, then briefly show privacy doc or README section.

Voiceover:

> Conversations stay local, documents are parsed in the browser, and desktop builds can store API keys in the operating system keychain.

### 78-90s: Why It Matters

Visual: Switch language or show RTL/English support.

Voiceover:

> Muharrir is built for Arabic and English users who need better AI instructions, provider choice, and a practical workflow between messy ideas and useful prompts.

## Optional 15-Second Provider Add-On

Visual: Click "Use local Ollama", show status badge "Ollama local", send a short prompt.

Voiceover:

> For local models, Muharrir detects Ollama and selects a chat-capable model automatically, without requiring an API key.

## Export Checklist

- Length: 60-90 seconds.
- Resolution: 1080p.
- Show no secrets.
- Include captions if possible.
- Save as: `docs/screenshots/muharrir-demo-90s.mp4` or upload externally and paste URL into application forms.

## Generated Local Demo

A short local demo can be regenerated with:

```bash
DEMO_BASE_URL=http://127.0.0.1:3111 node scripts/record-application-demo.js
```

Current generated assets:

- `docs/screenshots/muharrir-application-demo.mp4`
- `docs/screenshots/muharrir-application-demo-final.png`

