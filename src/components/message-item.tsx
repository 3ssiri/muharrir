'use client'

import { memo } from 'react'
import { useTranslations } from 'next-intl'
import type { UiMessage, ToolInvocation } from '@/lib/chat-stream'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Bot, User, Copy, Pencil, RotateCcw, Trash2, AlertCircle, Sparkles } from '@/components/icons'
import { ImagePreview } from '@/components/image-preview'
import { FileAttachmentIcon } from '@/components/file-attachment-icon'
import { QuestionForm } from '@/components/question-form'
import { EnhancementForm } from '@/components/enhancement-form'
import { PromptProposalCard } from '@/components/prompt-proposal-card'

interface MessageItemProps {
  m: UiMessage
  index: number
  /** Is this the last message AND a response is still streaming? */
  isActive: boolean
  sessionId: number | null
  onCopy: (content: string) => void
  onEdit: (content: string) => void
  onRetry: (index: number) => void
  onDelete: (id: string, sessionId: number | null) => void
  onAppend: (message: { content: string; role?: string }) => void
  onToolRendered: () => void
}

/**
 * A single chat message. Extracted from page.tsx and memoized so that during
 * streaming only the active (last) message re-renders instead of the whole
 * list — the key performance win for long conversations (#11). The parent
 * passes referentially-stable callbacks so memoization is effective.
 */
function MessageItemComponent({
  m,
  index,
  isActive,
  sessionId,
  onCopy,
  onEdit,
  onRetry,
  onDelete,
  onAppend,
  onToolRendered,
}: MessageItemProps) {
  const t = useTranslations()

  return (
    <div
      className={`group flex gap-4 relative mb-4 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
    >
      {m.role !== 'user' && (
        <Avatar className="w-8 h-8 mt-1 shrink-0 bg-primary">
          <AvatarFallback className="bg-transparent"><Bot className="w-5 h-5 text-primary-foreground" /></AvatarFallback>
          <AvatarImage src="/ai-avatar.png" className="opacity-0" />
        </Avatar>
      )}

      <div
        className={`rounded-xl px-5 py-3 ${
          m.error
            ? 'bg-destructive/10 text-destructive border-2 border-destructive rounded-tl-sm max-w-[90%]'
            : m.role === 'user'
              ? 'bg-primary text-primary-foreground rounded-tr-sm max-w-[85%]'
              : 'bg-card text-card-foreground border border-border rounded-tl-sm max-w-[90%]'
          }`}
      >
        {/* Display the error info */}
        {m.error && (
          <div className="mb-3 flex items-start gap-2 p-3 bg-destructive/20 rounded-lg border border-destructive/50">
            <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            <div className="flex-1 space-y-2">
              <div className="font-semibold text-sm">
                {m.error.type === 'auth' && t('errors.authFailed')}
                {m.error.type === 'quota' && t('errors.quotaExceeded')}
                {m.error.type === 'network' && t('errors.networkError')}
                {m.error.type === 'server' && t('errors.serverError')}
                {m.error.type === 'unknown' && t('errors.unknownError')}
              </div>
              <div className="text-xs opacity-90">{m.error.message}</div>
              {m.error.retryCount && m.error.retryCount > 0 && (
                <div className="text-xs opacity-75">{t('errors.retried', { count: m.error.retryCount })}</div>
              )}
            </div>
          </div>
        )}

        {/* Display text only when there is content and it is not purely a tool call */}
        {/* 🚨 Client-side interception: if there is a tool call, the text content is hidden */}
        {m.content && !m.content.includes('toolCallId') && !m.content.includes('toolName') && !m.toolInvocations && (
          <div className="space-y-3">
            {/* Display only the text entered by the user, without showing the attachment content */}
            {(() => {
              const content = m.content
              // Check for attachment markers in the new format
              const attachmentPattern = /\[مرفق\d+:/
              const imagePattern = /\[صورة\d+:/
              const hasAttachment = attachmentPattern.test(content) || imagePattern.test(content)

              // If there is an attachment marker, display only the text preceding the first marker
              if (hasAttachment) {
                const firstMarkerIndex = content.search(/\[(مرفق|صورة)\d+:/)
                if (firstMarkerIndex > 0) {
                  const userText = content.substring(0, firstMarkerIndex).trim()
                  return (
                    <div className="whitespace-pre-wrap text-sm leading-relaxed break-words">
                      {userText}
                    </div>
                  )
                }
              }

              // Compatibility with the old format
              const oldAttachmentIndex = content.indexOf('[محتوى المرفق]')
              if (oldAttachmentIndex > 0) {
                const userText = content.substring(0, oldAttachmentIndex).trim()
                return (
                  <div className="whitespace-pre-wrap text-sm leading-relaxed break-words">
                    {userText}
                  </div>
                )
              }

              // No attachment content, display normally
              return (
                <div className="whitespace-pre-wrap text-sm leading-relaxed break-words">
                  {content}
                </div>
              )
            })()}

            {/* Waiting message while generating text */}
            {m.role === 'assistant' && isActive && !m.toolInvocations && (
              <div className="mt-3 flex items-center gap-2.5 text-xs text-muted-foreground bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
                <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 animate-spin drop-shadow-sm" style={{ animationDuration: '2s' }} />
                <span className="font-medium text-amber-700 dark:text-amber-300">{t('chat.preparingForm')}</span>
              </div>
            )}
          </div>
        )}

        {/* Preview of multiple files */}
        {m.files && m.files.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {m.files.map((file, fileIndex) => (
              <div key={fileIndex}>
                {file.preview && file.type.startsWith('image/') ? (
                  <ImagePreview
                    src={file.preview}
                    alt={file.name}
                    className="max-w-[200px] rounded-lg border"
                  />
                ) : (
                  <FileAttachmentIcon
                    fileName={file.name}
                    fileType={file.type}
                    fileContent={(() => {
                      const content = m.content
                      if (!content) return undefined

                      // Try to match the new format: [مرفق1: filename.pdf]
                      const attachmentMarker = `[مرفق${fileIndex + 1}: ${file.name}]`
                      const attachmentIndex = content.indexOf(attachmentMarker)

                      if (attachmentIndex >= 0) {
                        const startIndex = attachmentIndex + attachmentMarker.length
                        // Look for the next attachment marker or the end of the content
                        const nextMarkerMatch = content.substring(startIndex).match(/\[(مرفق|صورة)\d+:/)
                        const endIndex = nextMarkerMatch
                          ? startIndex + nextMarkerMatch.index!
                          : content.length
                        return content.substring(startIndex, endIndex).trim()
                      }
                      return undefined
                    })()}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Generative UI for Tool Invocations */}
        {m.toolInvocations?.map((toolInvocation: ToolInvocation) => {
          const toolCallId = toolInvocation.toolCallId;

          if (toolInvocation.toolName === 'ask_questions') {
            return (
              <div key={toolCallId} className="mt-3">
                <QuestionForm
                  toolInvocation={toolInvocation}
                  addToolResult={({ toolCallId, result }: { toolCallId: string; result: any }) => {
                    onAppend({
                      role: 'user',
                      content: result
                    })
                  }}
                />
              </div>
            )
          }

          if (toolInvocation.toolName === 'suggest_enhancements') {
            return (
              <div key={toolCallId} className="-mx-5 -mb-3 mt-3">
                <EnhancementForm
                  toolInvocation={toolInvocation}
                  onSubmit={(text) => {
                    onAppend({
                      role: 'user',
                      content: text
                    })
                    onToolRendered()
                  }}
                />
              </div>
            )
          }

          if (toolInvocation.toolName === 'propose_prompt') {
            return (
              <div key={toolCallId} className="w-full mt-3">
                <PromptProposalCard
                  toolInvocation={toolInvocation}
                  addToolResult={() => {
                    onToolRendered()
                  }}
                />
              </div>
            )
          }
          return null
        })}

        {/* Loading message - blur overlay animation */}
        {m.role === 'assistant' && isActive && (
          <>
            {/* Waiting for the AI response */}
            {!m.content && !m.toolInvocations && (
              <div className="mt-3 flex items-center gap-3 text-sm text-muted-foreground animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 bg-primary/70 rounded-full animate-bounce shadow-sm" style={{ animationDelay: '0ms', animationDuration: '1s' }}></div>
                  <div className="w-2.5 h-2.5 bg-primary/70 rounded-full animate-bounce shadow-sm" style={{ animationDelay: '200ms', animationDuration: '1s' }}></div>
                  <div className="w-2.5 h-2.5 bg-primary/70 rounded-full animate-bounce shadow-sm" style={{ animationDelay: '400ms', animationDuration: '1s' }}></div>
                </div>
                <span className="font-medium">{t('chat.thinking')}</span>
              </div>
            )}

            {/* Tool call loading - blur overlay (shown even when there is text content) */}
            {m.toolInvocations && m.toolInvocations.length > 0 && !m.toolInvocations[0].args && (
              <div className="mt-3 relative animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/15 to-primary/5 animate-pulse rounded-lg backdrop-blur-[2px] z-10" style={{ animationDuration: '2s' }} />
                <div className="relative z-20 flex items-center gap-2.5 text-sm text-muted-foreground bg-gradient-to-br from-muted/40 to-muted/20 rounded-lg p-3.5 border border-dashed border-primary/40 shadow-sm">
                  <Sparkles className="w-4 h-4 animate-spin text-primary drop-shadow-sm" style={{ animationDuration: '2s' }} />
                  <span className="font-medium bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">{t('chat.generatingForm')}</span>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {m.role === 'user' && (
        <Avatar className="w-8 h-8 mt-1 border border-border shrink-0 bg-accent">
          <AvatarFallback className="bg-transparent"><User className="w-5 h-5 text-primary" /></AvatarFallback>
          <AvatarImage src="/user-avatar.png" className="opacity-0" />
        </Avatar>
      )}

      {/* Message Actions */}
      <div className={`absolute -bottom-6 ${m.role === 'user' ? 'end-12' : 'start-12'} opacity-0 group-hover:opacity-100 transition-opacity flex gap-1`}>
        <Button aria-label={t('a11y.copy')} variant="ghost" size="icon" className="h-6 w-6" onClick={() => onCopy(m.content)}>
          <Copy className="w-3 h-3" />
        </Button>
        {m.role === 'user' && (
          <Button aria-label={t('a11y.edit')} variant="ghost" size="icon" className="h-6 w-6" onClick={() => onEdit(m.content)}>
            <Pencil className="w-3 h-3" />
          </Button>
        )}
        {m.role === 'assistant' && (
          <Button aria-label={t('a11y.retry')} variant="ghost" size="icon" className="h-6 w-6" onClick={() => onRetry(index)}>
            <RotateCcw className="w-3 h-3" />
          </Button>
        )}
        <Button aria-label={t('a11y.delete')} variant="ghost" size="icon" className="h-6 w-6 text-destructive/50 hover:text-destructive" onClick={() => onDelete(m.id, sessionId)}>
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>
    </div>
  )
}

export const MessageItem = memo(MessageItemComponent)
