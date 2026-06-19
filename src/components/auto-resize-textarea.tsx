'use client'

import { useEffect, useRef, useState } from 'react'
import { Maximize2 } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface AutoResizeTextareaProps {
  value: string
  onChange: (value: string) => void
  onPaste?: (e: React.ClipboardEvent<HTMLTextAreaElement>) => void
  onSubmit?: () => void
  placeholder?: string
  disabled?: boolean
  autoFocus?: boolean
  className?: string
}

export function AutoResizeTextarea({
  value,
  onChange,
  onPaste,
  onSubmit,
  placeholder,
  disabled,
  autoFocus,
  className = '',
}: AutoResizeTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const [showExpandButton, setShowExpandButton] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // Handle keyboard events: Enter to submit, Shift+Enter for a new line
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (onSubmit && value.trim()) {
        onSubmit()
      }
    }
  }

  // Ensure the component is mounted to avoid hydration errors
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Adjust the height automatically
  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    // Reset the height to get the correct scrollHeight value
    textarea.style.height = 'auto'

    // Calculate the maximum height (a quarter of the screen height, for a larger display area)
    const maxHeight = Math.max(window.innerHeight / 4, 150)
    const scrollHeight = textarea.scrollHeight

    // Set the actual height
    if (scrollHeight > maxHeight) {
      textarea.style.height = `${maxHeight}px`
    } else {
      textarea.style.height = `${scrollHeight}px`
    }

    // Update the expand button state only after mounting on the client side
    if (isMounted) {
      // Calculate the single-line height: minHeight(50px) + padding(3px top and bottom) = 56px
      const singleLineHeight = 56
      const hasMultipleLines = value.includes('\n') || scrollHeight > singleLineHeight
      setShowExpandButton(hasMultipleLines)
    }
  }, [value, isMounted])

  // Avoid hydration errors
  if (!isMounted) {
    return (
      <div className="relative flex-1">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={`resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-4 py-3 leading-relaxed ${className}`}
          rows={1}
          style={{
            lineHeight: '1.6',
            wordBreak: 'break-word',
            overflowWrap: 'anywhere',
            whiteSpace: 'pre-wrap',
            minHeight: '50px'
          }}
        />
      </div>
    )
  }

  return (
    <>
      <div className="relative flex-1">
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={onPaste}
          placeholder={placeholder}
          disabled={disabled}
          autoFocus={autoFocus}
          className={`resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-4 py-3 leading-relaxed ${className}`}
          rows={1}
          style={{
            lineHeight: '1.6',
            wordBreak: 'break-word',
            overflowWrap: 'anywhere',
            whiteSpace: 'pre-wrap',
            minHeight: '50px'
          }}
        />

        {/* Use visibility instead of conditional rendering to avoid hydration errors */}
        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={() => setIsExpanded(true)}
          className="absolute end-2 top-2 h-8 w-8 rounded-md bg-background/80 backdrop-blur-sm hover:bg-muted shadow-sm transition-all z-10"
          title="توسيع حقل الإدخال (عرض المحتوى الكامل)"
          style={{
            visibility: isMounted && showExpandButton ? 'visible' : 'hidden',
            opacity: isMounted && showExpandButton ? 1 : 0,
            pointerEvents: isMounted && showExpandButton ? 'auto' : 'none'
          }}
        >
          <Maximize2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Enlarge dialog */}
      {isMounted && (
        <Dialog open={isExpanded} onOpenChange={setIsExpanded}>
          <DialogContent className="max-w-5xl w-[90vw] h-[90vh] flex flex-col p-0 border-4">
            <DialogHeader className="px-6 py-4 border-b">
              <DialogTitle className="text-lg font-semibold">Pasted content</DialogTitle>
              <div className="text-xs text-muted-foreground mt-1">
                {value.length} حرف • {value.split('\n').length} سطر
              </div>
            </DialogHeader>
            <div className="flex-1 overflow-hidden px-6 py-4">
              <Textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full h-full resize-none leading-relaxed border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                autoFocus
                style={{
                  lineHeight: '1.6',
                  wordBreak: 'break-word',
                  overflowWrap: 'anywhere',
                  whiteSpace: 'pre-wrap'
                }}
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
