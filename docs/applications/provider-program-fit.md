# Provider Program Fit

Last checked: 2026-07-08.

This document maps Muharrir to current Anthropic and OpenAI routes. Keep it conservative: do not claim funding, users, partnerships, or native integrations that do not exist yet.

## Best Fit Summary

| Program route | Fit | Why |
|---|---:|---|
| OpenAI Startup Community | Strong | OpenAI asks for startup/company details and an Organization ID; Muharrir already supports OpenAI-compatible provider configuration. |
| OpenAI startup credits through VC partner | Conditional | OpenAI says VC-backed startups may access credits, rate limit upgrades, and technical support through partner VCs. Needs VC referral/basic funding details. |
| OpenAI Researcher Access Program | Conditional | Good only if positioning Muharrir as a research project about Arabic prompt workflows, fairness, representation, or human-AI interaction. It is not the default startup route. |
| Anthropic Claude for Startups | Stronger after Claude adapter | Anthropic accepts early-stage founders/startups building with Claude. Muharrir now has native Claude Messages API support; run a real-key smoke test before submission. |
| Anthropic AI for Science | Weak | Muharrir is a developer/productivity tool, not primarily a science research project. |

## Anthropic Notes

Official page highlights:

- Claude for Startups gives founders community/resources and allows applying for credits and priority rate limits.
- It says early-stage founders or startups building with Claude can apply.
- It says credit qualification may require equity funding, being founded within the last four years, no prior Anthropic startup credits, a Claude Console account, company email, website, and short product description.
- It says startup credits apply to the first-party Claude API via Claude Console, not Bedrock, Vertex AI, or other third-party platforms.

### Muharrir Fit

Muharrir is a strong product fit for Claude because it turns rough ideas and documents into structured instructions, which aligns with Claude strengths in writing, coding, document understanding, and tool use.

The previous technical gap was that Muharrir was OpenAI-compatible rather than native Anthropic-compatible. The current submission should include:

1. The merged native Claude provider adapter.
2. Unit-test evidence for Claude request shape and stream parsing.
3. A real Claude Console API-key smoke test before pressing submit.

Recommended claim:

> Muharrir is prepared as a local-first prompt engineering workspace with native Claude Messages API support, so users can run the guided prompt-refinement workflow directly on Claude.

Avoid claiming:

> Muharrir has Anthropic credits, an Anthropic partnership, or production Claude usage.

## OpenAI Notes

Official page highlights:

- OpenAI says it supports founders at every stage of the startup journey.
- OpenAI Startup Community asks for first/last name, business email, company name, company website, founder/operator/investor role, and optional Organization ID.
- OpenAI startup credit FAQ says VC-backed companies may be eligible for API credits, rate limit upgrades, and technical support via VC partners.
- For credits, OpenAI says applicants may need a VC referral code, product/API-use description, company/key contacts with business email, and basic funding details.
- The OpenAI Researcher Access Program offers up to $1,000 of API credits for eligible research, reviewed quarterly, with credits valid for 12 months.
- OpenAI Grove Cohort 2 is listed as closed as of January 12, 2026, so it should not be treated as an active route unless reopened.

### Muharrir Fit

Muharrir is a strong fit for OpenAI startup/community routes because:

- It already supports OpenAI-compatible APIs.
- It can demonstrate concrete API usage: guided refinement, tool calls, and final prompt generation.
- It has a clear privacy story: no Muharrir backend, local history, local file parsing, and optional desktop keychain storage.

Recommended claim:

> Muharrir uses OpenAI-compatible chat and tool-calling flows to turn vague user input and local documents into structured prompts. Support would help expand provider compatibility, improve Arabic prompt quality, and prepare public desktop releases.

Avoid claiming:

> Muharrir has OpenAI funding, direct OpenAI partnership, or production customers.

## Technical Milestones That Improve Both Applications

1. Run real-key smoke tests for OpenAI-compatible and Claude provider paths.
2. Add a first-run provider wizard with OpenAI and Claude side by side.
3. Record a demo with four paths: demo mode, Claude, OpenAI-compatible provider, local Ollama.
4. Publish a stable release with signed desktop artifacts or a documented unsigned beta.
5. Add public good-first-issues for provider adapters, prompt packs, and Arabic examples.

