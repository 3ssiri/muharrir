# Privacy

The canonical privacy policy is maintained at [`docs/PRIVACY.md`](docs/PRIVACY.md).

Short version:

- Muharrir does not run a central project server for prompts, files, chat history, telemetry, or account storage.
- Conversations and saved prompts are stored locally.
- PDF and DOCX files are parsed locally before any provider request is made.
- With a real API key, prompts and selected file text are sent directly to the AI provider configured by the user.
- With the API key value `demo`, no external provider call is made.
- Desktop builds store API keys in the operating system keychain and do not fall back to localStorage if keychain persistence fails.

Read [`docs/PRIVACY.md`](docs/PRIVACY.md) before using sensitive prompts or documents.
