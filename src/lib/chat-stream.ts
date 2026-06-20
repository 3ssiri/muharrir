/**
 * Shared chat-stream consumer + error helpers.
 *
 * Previously the streaming protocol (`0:` text, `9:` tool call, `e:` status)
 * was parsed by two near-identical ~80-line loops duplicated inside
 * `onFormSubmit` and `append` in page.tsx. Any fix had to be made twice. This
 * module is the single source of truth for reading that stream.
 */

import { log } from '@/lib/logger'

export interface ToolInvocation {
  toolCallId: string
  toolName: string
  args: unknown
}

export type ChatErrorType = 'network' | 'auth' | 'quota' | 'server' | 'unknown'

export interface MessageError {
  type: ChatErrorType
  message: string
  retryCount?: number
}

export interface UiMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  toolInvocations?: ToolInvocation[]
  files?: Array<{ name: string; type: string; preview?: string }>
  error?: MessageError
}

export interface StreamResult {
  content: string
  toolInvocations: ToolInvocation[]
}

const STREAM_TIMEOUT_MS = 30000

/**
 * Read a streamed chat Response and incrementally surface progress.
 *
 * @param response  the Response returned by `streamChat`
 * @param onUpdate  called after each chunk with the accumulated content/tools
 * @returns the final accumulated content and tool invocations
 * @throws Error when the stream emits a fatal `e:{type:"error"}` event
 */
export async function consumeChatStream(
  response: Response,
  onUpdate: (content: string, tools: ToolInvocation[]) => void
): Promise<StreamResult> {
  const reader = response.body?.getReader()
  if (!reader) throw new Error('No reader available')

  const decoder = new TextDecoder()
  let content = ''
  const tools: ToolInvocation[] = []
  let buffer = ''
  let lastChunkTime = Date.now()

  while (true) {
    if (Date.now() - lastChunkTime > STREAM_TIMEOUT_MS) {
      log.warn('Stream timeout — no data for 30s')
      break
    }

    const { done, value } = await reader.read()
    if (done) break
    lastChunkTime = Date.now()

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || '' // keep the trailing partial line

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed) continue

      try {
        if (trimmed.startsWith('0:')) {
          content += JSON.parse(trimmed.slice(2))
        } else if (trimmed.startsWith('9:')) {
          tools.push(JSON.parse(trimmed.slice(2)) as ToolInvocation)
        } else if (trimmed.startsWith('e:')) {
          const evt = JSON.parse(trimmed.slice(2))
          // Only `type:"error"` is fatal. Correction status events
          // (correcting/success/failed) are informational and must not abort.
          if (evt?.type === 'error') {
            throw new Error(evt.message || 'Stream error')
          }
        } else {
          // Unknown line — treat as raw text rather than dropping it.
          content += line
        }
      } catch (err) {
        if (err instanceof Error && err.message && !err.message.startsWith('Unexpected')) {
          // Re-throw genuine stream errors; swallow JSON.parse hiccups.
          if (trimmed.startsWith('e:')) throw err
        }
        log.warn('Failed to parse stream line:', trimmed.slice(0, 60))
      }
    }

    onUpdate(content, tools)
  }

  return { content, toolInvocations: tools }
}

/** Map an arbitrary thrown error to a typed, user-facing classification. */
export function classifyChatError(error: unknown): MessageError {
  const message = error instanceof Error ? error.message : String(error ?? 'Unknown error')

  let type: ChatErrorType = 'unknown'
  if (/Authentication Failed|invalid api key|\b401\b/i.test(message)) {
    type = 'auth'
  } else if (/Connection Failed|fetch failed|Failed to fetch|network|\b504\b/i.test(message)) {
    type = 'network'
  } else if (/\b429\b|\b402\b|quota|rate limit|insufficient (balance|credits|quota|funds)|more credits/i.test(message)) {
    type = 'quota'
  } else if (/\b5\d\d\b|server error|service unavailable/i.test(message)) {
    type = 'server'
  }

  return { type, message }
}
