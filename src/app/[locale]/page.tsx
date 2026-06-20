'use client'

import { useEffect, useRef } from 'react'
import { Send, Trash2, StopCircle, User, Bot, Copy, Pencil, Code2, Sparkles, Star, FileText, MessageSquare, Upload, X, RotateCcw, AlertCircle, RefreshCw } from '@/components/icons'
import { useAppStore } from '@/lib/store'
import { ChatSidebar } from '@/components/chat-sidebar'
import { db } from '@/lib/db'
import { useState } from 'react'
import { toast } from 'sonner'
import { SettingsDialog } from '@/components/settings-dialog'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

import { QuestionForm } from '@/components/question-form'
import { PromptProposalCard } from '@/components/prompt-proposal-card'
import { EnhancementForm } from '@/components/enhancement-form'
import { FileUpload } from '@/components/file-upload'
import { AutoResizeTextarea } from '@/components/auto-resize-textarea'
import { FileAttachmentIcon } from '@/components/file-attachment-icon'
import { FavoritesPage } from '@/components/favorites-page'
import { SpotlightSearch } from '@/components/spotlight-search'
import { ImagePreview } from '@/components/image-preview'
import { VersionBadge } from '@/components/version-badge'
import { LanguageSwitcher } from '@/components/language-switcher'
import { KeyboardShortcutsDialog } from '@/components/keyboard-shortcuts-dialog'
import { ApiKeyRequiredDialog } from '@/components/api-key-required-dialog'
import { useTranslations } from 'next-intl'
import { streamChat } from '@/lib/chat-client'
import { isTauriApp } from '@/lib/tauri-bridge'

export default function Home() {
  const t = useTranslations();
  const { apiKey, baseUrl, model, systemPrompt, availableModels, correctionModel, setModel, hydrateApiKey } = useAppStore()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // عند بدء التطبيق على سطح المكتب: حمّل مفتاح API من الـ OS Keychain
  useEffect(() => {
    hydrateApiKey()
  }, [hydrateApiKey])

  const [sessionId, setSessionId] = useState<number | null>(null)
  const sessionIdRef = useRef(sessionId)

  // Core fix: use local state and ref
  const [localInput, setLocalInput] = useState('')
  const aiContentRef = useRef('')
  const aiToolInvocationsRef = useRef<any[]>([])

  const [messages, setMessages] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isToolRendering, setIsToolRendering] = useState(false) // tool rendering state
  const abortControllerRef = useRef<AbortController | null>(null)
  const [activeTab, setActiveTab] = useState<'chat' | 'favorites'>('chat') // tab state
  const [spotlightOpen, setSpotlightOpen] = useState(false) // Spotlight search state
  const [shortcutsOpen, setShortcutsOpen] = useState(false) // shortcuts dialog state
  const [apiKeyDialogOpen, setApiKeyDialogOpen] = useState(false) // API key alert dialog state
  const [settingsOpen, setSettingsOpen] = useState(false) // settings dialog state
  const [isDesktopApp, setIsDesktopApp] = useState(false)
  const [isCheckingForUpdate, setIsCheckingForUpdate] = useState(false)

  // File upload state - supports multiple files
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ file: File; preview?: string; text?: string }>>([])

  // Drag and drop upload state
  const [showFullDropZone, setShowFullDropZone] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const dragCounterRef = useRef(0)

  // Image recognition is no longer restricted by model; uploads are allowed for everyone with a user warning
  const modelSupportsVision = true // Allow all models to upload images, leaving the judgment to the user

  useEffect(() => {
    sessionIdRef.current = sessionId
  }, [sessionId])

  useEffect(() => {
    setIsDesktopApp(isTauriApp())
  }, [])

  // Abort the in-flight request when the component unmounts
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        console.log('Component unmounting, aborting request')
        abortControllerRef.current.abort()
      }
    }
  }, [])

  // Monitor drag and drop at the window level
  useEffect(() => {
    const handleGlobalDragEnter = (e: DragEvent) => {
      e.preventDefault()
      dragCounterRef.current++
      if (dragCounterRef.current === 1) {
        setShowFullDropZone(true)
      }
    }

    const handleGlobalDragLeave = (e: DragEvent) => {
      e.preventDefault()
      dragCounterRef.current--
      if (dragCounterRef.current === 0) {
        setShowFullDropZone(false)
      }
    }

    const handleGlobalDragOver = (e: DragEvent) => {
      e.preventDefault()
    }

    const handleGlobalDrop = (e: DragEvent) => {
      e.preventDefault()
      dragCounterRef.current = 0
      setShowFullDropZone(false)
    }

    window.addEventListener('dragenter', handleGlobalDragEnter)
    window.addEventListener('dragleave', handleGlobalDragLeave)
    window.addEventListener('dragover', handleGlobalDragOver)
    window.addEventListener('drop', handleGlobalDrop)

    return () => {
      window.removeEventListener('dragenter', handleGlobalDragEnter)
      window.removeEventListener('dragleave', handleGlobalDragLeave)
      window.removeEventListener('dragover', handleGlobalDragOver)
      window.removeEventListener('drop', handleGlobalDrop)
    }
  }, [])

  // Monitor keyboard shortcuts at the window level
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent the browser's default behavior for Ctrl+T (new tab)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 't') {
        e.preventDefault()
        e.stopPropagation()
        // A custom function can be added here, or just prevent the default behavior
        return
      }

      // Ctrl+K - open Spotlight search
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        e.stopPropagation()
        setSpotlightOpen(true)
        return
      }

      // Ctrl+N - new conversation (with reinforced prevention)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault()
        e.stopPropagation()
        e.stopImmediatePropagation()
        setSessionId(null)
        setMessages([])
        setLocalInput('')
        setUploadedFiles([])
        if (activeTab === 'favorites') {
          setActiveTab('chat')
        }
        return false
      }

      // Ctrl+/ - focus the input field (fix: use a more reliable selector)
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault()
        e.stopPropagation()
        // Use a more reliable way to find the input field
        setTimeout(() => {
          const textarea = document.querySelector('textarea') as HTMLTextAreaElement
          if (textarea && !textarea.disabled) {
            textarea.focus()
            textarea.scrollIntoView({ behavior: 'smooth', block: 'center' })
          }
        }, 0)
        return
      }

      // Alt+S - open settings (to avoid conflicts with other software)
      if (e.altKey && e.key.toLowerCase() === 's') {
        e.preventDefault()
        e.stopPropagation()
        const settingsButton = document.querySelector('[data-settings-trigger]') as HTMLButtonElement
        if (settingsButton) {
          settingsButton.click()
        }
        return
      }

      // Ctrl+B - toggle the sidebar
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault()
        e.stopPropagation()
        const sidebarToggle = document.querySelector('[data-sidebar-toggle]') as HTMLButtonElement
        if (sidebarToggle) {
          sidebarToggle.click()
        }
        return
      }

      // Tab - switch tab (chat ⇄ favorites)
      if (e.key === 'Tab' && !e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey) {
        // Check whether focus is inside an input field or an editable element
        const activeElement = document.activeElement
        const isInputFocused = activeElement?.tagName === 'TEXTAREA' ||
                              activeElement?.tagName === 'INPUT' ||
                              (activeElement as HTMLElement)?.isContentEditable

        // If inside an input field, allow the default Tab behavior (without switching tab)
        if (isInputFocused) {
          return // Let the browser handle the default behavior
        }

        // If not inside an input field, prevent the default behavior and switch tab
        e.preventDefault()
        e.stopPropagation()
        setActiveTab(prev => prev === 'chat' ? 'favorites' : 'chat')
        return
      }

      // Shift+/ - show the shortcuts panel
      if (e.shiftKey && (e.key === '?' || e.key === '/')) {
        e.preventDefault()
        setShortcutsOpen(true)
        return
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeTab])

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Load chat history when sessionId changes
  useEffect(() => {
    if (!sessionId) {
      setMessages([])
      return
    }

    const loadHistory = async () => {
      const history = await db.messages.where('sessionId').equals(sessionId).sortBy('createdAt')
      const uiMessages = history.map(m => ({
        id: m.id?.toString() || Math.random().toString(),
        role: m.role as any,
        content: m.content,
        toolInvocations: m.toolInvocations,
        files: m.files
      }))
      setMessages(uiMessages)
    }

    loadHistory()
  }, [sessionId])

  // Fundamental fix: bypass useChat entirely and use fetch directly
  const onFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!localInput.trim()) return

    // Check whether the API key is configured (KISS principle - keep it simple!)
    if (!apiKey) {
      setApiKeyDialogOpen(true)
      return
    }

    // Abort the previous request (if any)
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Create a new AbortController
    const abortController = new AbortController()
    abortControllerRef.current = abortController

    let currentId = sessionId

    if (!currentId) {
      const title = localInput.slice(0, 30)
      currentId = await db.chatSessions.add({
        title,
        previewText: title,
        createdAt: new Date(),
        updatedAt: new Date()
      }) as number
      setSessionId(currentId)
    }

    // Build the user message content (including multiple files)
    let userContent = localInput
    if (uploadedFiles.length > 0) {
      const fileContents = uploadedFiles.map((item, index) => {
        if (item.text) {
          return `[مرفق${index + 1}: ${item.file.name}]\n${item.text.substring(0, 3000)}`
        } else if (item.preview) {
          return `[صورة${index + 1}: ${item.file.name}]`
        }
        return `[ملف${index + 1}: ${item.file.name}]`
      }).join('\n\n')
      userContent = `${localInput}\n\n${fileContents}`
    }

    const userMessage = {
      id: Math.random().toString(),
      role: 'user',
      content: userContent,
      files: uploadedFiles.length > 0 ? uploadedFiles.map(item => ({
        name: item.file.name,
        type: item.file.type,
        preview: item.preview
      })) : undefined
    }

    // Save the user message to the database (with file info and full content)
    await db.messages.add({
      sessionId: currentId,
      role: 'user',
      content: userContent,
      files: uploadedFiles.length > 0 ? uploadedFiles.map(item => ({
        name: item.file.name,
        type: item.file.type,
        preview: item.preview
      })) : undefined,
      createdAt: new Date()
    })

    // Display the user message immediately
    setMessages(prev => [...prev, userMessage])
    setLocalInput('')
    setIsLoading(true)

    // Clear the files state
    setUploadedFiles([])

    // Reset the AI content accumulator
    aiContentRef.current = ''
    aiToolInvocationsRef.current = []

    // Save an empty AI message to the database immediately (to avoid loss on Fast Refresh)
    const aiDbId = await db.messages.add({
      sessionId: currentId,
      role: 'assistant',
      content: '',
      createdAt: new Date()
    })

    const aiMessageId = aiDbId.toString()
    const aiMessage = {
      id: aiMessageId,
      role: 'assistant',
      content: ''
    }

    // Add a placeholder for an empty AI message
    setMessages(prev => [...prev, aiMessage])

    try {
      console.log('Starting chat request...')
      const response = await streamChat({
        messages: [...messages, userMessage],
        model: model,
        systemPrompt: systemPrompt,
        apiKey: apiKey,
        baseUrl: baseUrl,
        correctionModel: correctionModel,
        signal: abortController.signal
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || `HTTP error! status: ${response.status}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('No reader available')
      }

      const decoder = new TextDecoder()
      console.log('Starting to read stream...')
      let chunkCount = 0
      let lastChunkTime = Date.now()
      const TIMEOUT_MS = 30000 // 30 second timeout
      let buffer = ''

      while (true) {
        // Add timeout detection
        if (Date.now() - lastChunkTime > TIMEOUT_MS) {
          console.warn('Stream timeout - no data received for 30s')
          break
        }

        try {
          const { done, value } = await reader.read()

          if (done) {
            console.log('Stream complete normally')
            break
          }

          lastChunkTime = Date.now()
          chunkCount++
          const chunk = decoder.decode(value, { stream: true })
          console.log(`Chunk ${chunkCount} raw:`, chunk.substring(0, 100))
          buffer += chunk

          // Parse the Vercel AI SDK data stream protocol
          const lines = buffer.split('\n')
          buffer = lines.pop() || '' // Keep the last incomplete line

          for (const line of lines) {
            if (!line.trim()) continue

            console.log('Processing line:', line.substring(0, 100))

            try {
              // The Vercel AI SDK uses the format: "0:text" or "9:{json}" or "e:{error}"
              if (line.startsWith('0:')) {
                // Text content
                const text = JSON.parse(line.slice(2))
                aiContentRef.current += text
                console.log('Text added, total length:', aiContentRef.current.length)
              } else if (line.startsWith('9:')) {
                // Tool call
                const toolData = JSON.parse(line.slice(2))
                console.log('Tool call detected:', toolData)
                aiToolInvocationsRef.current.push(toolData)
                setIsToolRendering(true) // Signal that the tool is being rendered
              } else if (line.startsWith('e:')) {
                // Error info
                const errorData = JSON.parse(line.slice(2))
                console.error('Stream error detected:', errorData)

                // Stop processing the stream immediately and display the error
                throw new Error(errorData.message || 'Stream error')
              } else {
                // Might be another format, accumulate it directly as text
                console.log('Unknown format, treating as text')
                aiContentRef.current += line
              }
            } catch (parseError) {
              console.warn('Failed to parse line:', line.substring(0, 50), parseError)
              // If it is an error object, re-throw it
              if (parseError instanceof Error && parseError.message.includes('Stream error')) {
                throw parseError
              }
              // When parsing fails, treat it as plain text
              aiContentRef.current += line
            }
          }

          // Update the message display
          setMessages(prev => {
            const updated = prev.map(m =>
              m.id === aiMessageId ? {
                ...m,
                content: aiContentRef.current,
                toolInvocations: aiToolInvocationsRef.current.length > 0 ? aiToolInvocationsRef.current : undefined
              } : m
            )
            return updated
          })

          // Update the database in real time (once every 10 chunks)
          if (chunkCount % 10 === 0) {
            db.messages.update(parseInt(aiMessageId), {
              content: aiContentRef.current,
              toolInvocations: aiToolInvocationsRef.current.length > 0 ? aiToolInvocationsRef.current : undefined
            }).catch(err => console.error('Failed to update message:', err))
          }
        } catch (readError: any) {
          console.error('Stream read error:', readError)
          break
        }
      }

      console.log('Final AI content length:', aiContentRef.current.length)
      console.log('Tool invocations count:', aiToolInvocationsRef.current.length)

      // Detect an empty response
      if (aiContentRef.current.length === 0 && aiToolInvocationsRef.current.length === 0) {
        console.warn('Empty response detected - treating as authentication error')

        // An empty response usually means an error in the API key configuration or a permissions issue
        const errorType = 'auth'
        const errorMessage = t('settings.emptyResponseError')

        await db.messages.update(parseInt(aiMessageId), {
          content: '',
          error: {
            type: errorType,
            message: errorMessage,
            retryCount: 0
          }
        })

        setMessages(prev => prev.map(m =>
          m.id === aiMessageId
            ? { ...m, error: { type: errorType, message: errorMessage, retryCount: 0 } }
            : m
        ))

        toast.error(`حدث خطأ في الطلب: ${errorMessage}`, { duration: 4000 })
      } else {
        // Final update of the AI message in the database
        await db.messages.update(parseInt(aiMessageId), {
          content: aiContentRef.current,
          toolInvocations: aiToolInvocationsRef.current.length > 0 ? aiToolInvocationsRef.current : undefined
        })

        // Update the session
        await db.chatSessions.update(currentId, {
          updatedAt: new Date(),
          previewText: aiContentRef.current.slice(0, 50)
        })
      }

    } catch (error: any) {
      console.error('Chat error:', error)

      // Determine the error type
      let errorType: 'network' | 'auth' | 'quota' | 'server' | 'unknown' = 'unknown'
      const errorMessage = error.message || 'خطأ غير معروف'

      if (error.name === 'AbortError') {
        console.log('Request was aborted')
        toast.info('تم إلغاء الطلب', { duration: 2000 })
        return
      }

      if (errorMessage.includes('Authentication Failed') || errorMessage.includes('401')) {
        errorType = 'auth'
      } else if (errorMessage.includes('Connection Failed') || errorMessage.includes('fetch failed')) {
        errorType = 'network'
      } else if (errorMessage.includes('429') || errorMessage.includes('quota')) {
        errorType = 'quota'
      } else if (errorMessage.includes('500') || errorMessage.includes('502') || errorMessage.includes('503')) {
        errorType = 'server'
      }

      // Update the AI message and add the error info
      await db.messages.update(parseInt(aiMessageId), {
        content: '',
        error: {
          type: errorType,
          message: errorMessage,
          retryCount: 0
        }
      })

      // Update the message in the UI
      setMessages(prev => prev.map(m =>
        m.id === aiMessageId
          ? { ...m, error: { type: errorType, message: errorMessage, retryCount: 0 } }
          : m
      ))

      toast.error(`حدث خطأ في الطلب: ${errorMessage}`, { duration: 4000 })
    } finally {
      console.log('Setting isLoading to false')
      setIsLoading(false)
      console.log('isLoading set to false')

      // Clean up the AbortController reference
      if (abortControllerRef.current === abortController) {
        abortControllerRef.current = null
      }
    }
  }

  const handleNewChat = async () => {
    // Clear only the UI state without deleting database records
    setSessionId(null)
    setMessages([])
    setLocalInput('')
    setUploadedFiles([])

    // If on the favorites tab, switch to the chat tab
    if (activeTab === 'favorites') {
      setActiveTab('chat')
    }
  }

  const handleCheckForUpdate = async () => {
    if (!isTauriApp()) {
      toast.info(t('updater.desktopOnly'))
      return
    }

    setIsCheckingForUpdate(true)
    try {
      const [{ check }, { relaunch }] = await Promise.all([
        import('@tauri-apps/plugin-updater'),
        import('@tauri-apps/plugin-process'),
      ])
      const update = await check()

      if (!update) {
        toast.success(t('updater.noUpdate'))
        return
      }

      toast.info(t('updater.downloading'), { duration: 3000 })
      await update.downloadAndInstall()
      toast.success(t('updater.installed'), { duration: 3000 })
      await relaunch()
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      toast.error(`${t('updater.failed')}: ${message}`)
    } finally {
      setIsCheckingForUpdate(false)
    }
  }

  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items
    if (!items) return

    for (let i = 0; i < items.length; i++) {
      const item = items[i]

      // Check whether it is an image
      if (item.type.startsWith('image/')) {
        e.preventDefault()

        const file = item.getAsFile()
        if (!file) continue

        // Read the image and set the preview
        const reader = new FileReader()
        reader.onload = (event) => {
          handleFileSelect(file, event.target?.result as string)
          toast.success('تم لصق الصورة', {
            description: 'ملاحظة: تأكد من أن نموذجك يدعم التعرف على الصور (مثل GPT-4o و Claude 3.5 وغيرها)',
            duration: 4000
          })
        }
        reader.readAsDataURL(file)
        break
      }
    }
  }

  const handleFileSelect = async (file: File, preview?: string) => {
    let fileText: string | undefined = undefined

    // If it is a PDF file, use client-side parsing
    if (file.type === 'application/pdf') {
      try {
        toast.info('جارٍ تحليل PDF...', { duration: 3000 })
        const arrayBuffer = await file.arrayBuffer()

        // Import pdfjs-dist dynamically
        const pdfjs = await import('pdfjs-dist')

        // Set up the worker - using the static file in the public folder
        if (typeof window !== 'undefined' && !pdfjs.GlobalWorkerOptions.workerSrc) {
          pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'
        }

        const loadingTask = pdfjs.getDocument({ data: arrayBuffer })
        const pdf = await loadingTask.promise
        let fullText = ''

        // Extract text from all pages
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i)
          const textContent = await page.getTextContent()
          const pageText = textContent.items
            .map((item: any) => ('str' in item ? item.str : ''))
            .join(' ')
          fullText += pageText + '\n'
        }

        fileText = fullText
        toast.success(`تم تحليل PDF (${pdf.numPages} صفحة)`)
      } catch (error: any) {
        console.error('خطأ في تحليل PDF:', error)
        toast.error(`فشل تحليل PDF: ${error.message || 'خطأ غير معروف'}`)
      }
    }
    // Parse a DOCX file
    else if (file.type.includes('wordprocessing') || file.name.endsWith('.docx')) {
      try {
        toast.info('جارٍ تحليل DOCX...')
        const arrayBuffer = await file.arrayBuffer()

        // Import mammoth dynamically
        const mammoth = await import('mammoth')

        const result = await mammoth.extractRawText({ arrayBuffer })
        fileText = result.value
        toast.success('تم تحليل DOCX')
      } catch (error: any) {
        console.error('خطأ في تحليل DOCX:', error)
        toast.error(`فشل تحليل DOCX: ${error.message || 'خطأ غير معروف'}`)
      }
    }
    // Parse the text file
    else if (file.type.startsWith('text/') || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
      try {
        const text = await file.text()
        fileText = text
        toast.success('تم قراءة الملف النصي')
      } catch (error: any) {
        console.error('خطأ في قراءة الملف النصي:', error)
        toast.error(`فشل قراءة الملف: ${error.message || 'خطأ غير معروف'}`)
      }
    }

    // Add to the files list
    setUploadedFiles(prev => [...prev, { file, preview, text: fileText }])
  }

  const handleFileRemove = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  // Drag and drop handler functions
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    setShowFullDropZone(false)
    dragCounterRef.current = 0

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        await handleFileSelect(files[i])
      }
    }
  }

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content)
  }

  const handleEdit = (content: string) => {
    setLocalInput(content)
  }

  const handleDeleteMessage = async (id: string, sessionId: number | null) => {
    setMessages(messages.filter((m: any) => m.id !== id))

    if (id) {
      const dbId = parseInt(id)
      if (!isNaN(dbId)) {
        await db.messages.delete(dbId)
        toast.success("تم حذف الرسالة")
      }
    }
  }

  const handleRetry = async (messageIndex: number) => {
    // Find the last user message before the current assistant message
    const userMessages = messages.slice(0, messageIndex).filter((m: any) => m.role === 'user')
    if (userMessages.length === 0) return

    const lastUserMessage = userMessages[userMessages.length - 1]

    // Delete all messages that follow that user message
    const messagesToKeep = messages.slice(0, messages.indexOf(lastUserMessage) + 1)
    setMessages(messagesToKeep)

    // Resend that message
    await append({ content: lastUserMessage.content })
  }

  const append = async (message: any) => {
    // Add the user message
    const userMessage = {
      id: Math.random().toString(),
      role: 'user',
      content: message.content
    }

    setMessages(prev => [...prev, userMessage])

    // Save to the database
    if (sessionIdRef.current) {
      await db.messages.add({
        sessionId: sessionIdRef.current,
        role: 'user',
        content: message.content,
        createdAt: new Date()
      })
    }

    // Fire off the API request
    setIsLoading(true)
    aiContentRef.current = ''
    aiToolInvocationsRef.current = []

    const currentId = sessionIdRef.current

    // Create a placeholder for the AI message
    const aiDbId = await db.messages.add({
      sessionId: currentId!,
      role: 'assistant',
      content: '',
      createdAt: new Date()
    })

    const aiMessageId = aiDbId.toString()
    const aiMessage = {
      id: aiMessageId,
      role: 'assistant',
      content: ''
    }

    setMessages(prev => [...prev, aiMessage])

    // Send the chat request
    try {
      const response = await streamChat({
        messages: [...messages, userMessage],
        model: model,
        systemPrompt: systemPrompt,
        apiKey: apiKey,
        baseUrl: baseUrl,
        correctionModel: correctionModel
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No reader available')

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        buffer += chunk

        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (!line.trim()) continue

          try {
            if (line.startsWith('0:')) {
              const text = JSON.parse(line.slice(2))
              aiContentRef.current += text
            } else if (line.startsWith('9:')) {
              const toolData = JSON.parse(line.slice(2))
              aiToolInvocationsRef.current.push(toolData)
            }
          } catch (e) {
            aiContentRef.current += line
          }
        }

        setMessages(prev => prev.map(m =>
          m.id === aiMessageId ? {
            ...m,
            content: aiContentRef.current,
            toolInvocations: aiToolInvocationsRef.current.length > 0 ? aiToolInvocationsRef.current : undefined
          } : m
        ))
      }

      // Save to the database
      await db.messages.update(parseInt(aiMessageId), {
        content: aiContentRef.current,
        toolInvocations: aiToolInvocationsRef.current.length > 0 ? aiToolInvocationsRef.current : undefined
      })

    } catch (error: any) {
      console.error('Chat error:', error)
      toast.error(`حدث خطأ في الطلب: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const stop = () => {
    console.log('Stop button clicked')
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    setIsLoading(false)
  }

  // Handle form submission (for shortcuts)
  const handleSubmit = () => {
    const form = document.querySelector('form') as HTMLFormElement
    if (form) {
      form.requestSubmit()
    }
  }

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar */}
      <ChatSidebar
        currentSessionId={sessionId}
        onSessionSelect={setSessionId}
        onNewChat={handleNewChat}
      />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-3.5 border-b border-border bg-card shrink-0 z-10">
          <div className="flex items-center gap-2 md:hidden">
            <div className="w-8" />
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <Code2 className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold tracking-tight font-display text-gradient">Prompt Iterator</h1>
            <VersionBadge />
          </div>
          <div className="flex items-center gap-2">
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger className="min-w-[180px] w-auto max-w-[280px] h-8 text-xs font-medium">
                <SelectValue placeholder={t('header.model')} />
              </SelectTrigger>
              <SelectContent className="max-w-[320px]">
                {availableModels.length > 0 ? (
                  availableModels.map(m => (
                    <SelectItem key={m} value={m} className="text-xs">{m}</SelectItem>
                  ))
                ) : (
                  <>
                    <SelectItem value="gpt-4-turbo" className="text-xs">GPT-4 Turbo</SelectItem>
                    <SelectItem value="gpt-3.5-turbo" className="text-xs">GPT-3.5 Turbo</SelectItem>
                    <SelectItem value="deepseek-chat" className="text-xs">DeepSeek Chat</SelectItem>
                    <SelectItem value="deepseek-coder" className="text-xs">DeepSeek Coder</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
            <LanguageSwitcher />
            {isDesktopApp && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleCheckForUpdate}
                      disabled={isCheckingForUpdate}
                      className="text-muted-foreground hover:text-primary"
                    >
                      <RefreshCw className={`w-5 h-5 ${isCheckingForUpdate ? 'animate-spin' : ''}`} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t('updater.check')}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
            <ThemeToggle />
            <div className="h-6 w-px bg-border mx-2" />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={handleNewChat} className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t('header.clearChat')}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </header>

        {/* Tab switcher — minimal underline */}
        <div className="border-b border-border bg-card shrink-0">
          <div className="max-w-3xl mx-auto px-4 sm:px-8">
            <div className="flex gap-8 justify-center">
              <button
                onClick={() => setActiveTab('chat')}
                className={`relative py-3 px-1 text-sm transition-colors flex items-center gap-2 ${
                  activeTab === 'chat'
                    ? 'text-primary font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                {t('tabs.chat')}
                {activeTab === 'chat' && <span className="absolute inset-x-0 -bottom-px h-0.5 bg-primary rounded-full" />}
              </button>
              <button
                onClick={() => setActiveTab('favorites')}
                className={`relative py-3 px-1 text-sm transition-colors flex items-center gap-2 ${
                  activeTab === 'favorites'
                    ? 'text-primary font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Star className={`w-4 h-4 ${activeTab === 'favorites' ? 'fill-gold text-gold' : ''}`} />
                {t('tabs.favorites')}
                {activeTab === 'favorites' && <span className="absolute inset-x-0 -bottom-px h-0.5 bg-primary rounded-full" />}
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'chat' ? (
            <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
              {messages.length === 0 ? (
              <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 mt-10">
                <div className="text-center space-y-5">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-accent text-xs font-medium text-accent-foreground">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{t('welcome.quickStart')}</span>
                  </div>
                  <h2 className="text-4xl font-extrabold tracking-tight lg:text-6xl font-display text-foreground pb-1 leading-[1.1]">
                    {t('welcome.title')}
                  </h2>
                  <p className="text-lg text-muted-foreground max-w-[600px] mx-auto">
                    {t('welcome.subtitle')}
                  </p>
                </div>

                {/* Quick examples */}
                <div className="max-w-2xl mx-auto">
                  <h3 className="text-sm font-semibold text-muted-foreground mb-4 text-center">{t('welcome.quickStart')}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {[
                      { emoji: '📝', title: t('welcome.example1Title'), desc: t('welcome.example1Desc'), prompt: t('welcome.example1Prompt') },
                      { emoji: '📊', title: t('welcome.example2Title'), desc: t('welcome.example2Desc'), prompt: t('welcome.example2Prompt') },
                      { emoji: '💻', title: t('welcome.example3Title'), desc: t('welcome.example3Desc'), prompt: t('welcome.example3Prompt') },
                      { emoji: '📋', title: t('welcome.example4Title'), desc: t('welcome.example4Desc'), prompt: t('welcome.example4Prompt') },
                    ].map((ex, i) => (
                      <button
                        key={i}
                        onClick={() => setLocalInput(ex.prompt)}
                        className="group text-start rounded-lg border border-border bg-card p-4 transition-colors duration-200 hover:border-primary hover:bg-accent/40"
                      >
                        <div className="flex items-start gap-3">
                          <span className="shrink-0 w-10 h-10 rounded-md bg-accent flex items-center justify-center text-lg">
                            {ex.emoji}
                          </span>
                          <div className="flex flex-col gap-1 min-w-0">
                            <span className="font-semibold text-sm group-hover:text-primary transition-colors">{ex.title}</span>
                            <span className="text-xs text-muted-foreground line-clamp-2">{ex.desc}</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {messages.map((m: any, index) => (
                  <div
                    key={m.id}
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
                          {m.role === 'assistant' && m.id === messages[messages.length - 1]?.id && isLoading && !m.toolInvocations && (
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
                          {m.files.map((file: any, index: number) => (
                            <div key={index}>
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
                                    const attachmentMarker = `[مرفق${index + 1}: ${file.name}]`
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
                      {m.toolInvocations?.map((toolInvocation: any) => {
                        const toolCallId = toolInvocation.toolCallId;

                        if (toolInvocation.toolName === 'ask_questions') {
                          return (
                            <div key={toolCallId} className="mt-3">
                              <QuestionForm
                                toolInvocation={toolInvocation}
                                addToolResult={({ toolCallId, result }: { toolCallId: string; result: any }) => {
                                  append({
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
                                  append({
                                    role: 'user',
                                    content: text
                                  })
                                  setIsToolRendering(false)
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
                                addToolResult={({ toolCallId, result }: { toolCallId: string; result: any }) => {
                                  setIsToolRendering(false)
                                }}
                              />
                            </div>
                          )
                        }
                        return null
                      })}

                      {/* Loading message - blur overlay animation */}
                      {m.role === 'assistant' && m.id === messages[messages.length - 1]?.id && isLoading && (
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
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleCopy(m.content)}>
                        <Copy className="w-3 h-3" />
                      </Button>
                      {m.role === 'user' && (
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleEdit(m.content)}>
                          <Pencil className="w-3 h-3" />
                        </Button>
                      )}
                      {m.role === 'assistant' && (
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleRetry(index)}>
                          <RotateCcw className="w-3 h-3" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive/50 hover:text-destructive" onClick={() => handleDeleteMessage(m.id, sessionId)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}

                <div ref={messagesEndRef} className="h-1" />
              </div>
            )}
          </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-left-4 duration-300">
              <FavoritesPage />
            </div>
          )}
        </div>

        {/* Floating Input Area - shown only on the chat tab */}
        {activeTab === 'chat' && (
        <div className="p-4 bg-card border-t border-border shrink-0">
          <div className="max-w-3xl mx-auto">
            {/* Files list - displayed independently at the top */}
            {uploadedFiles.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2 p-3 bg-muted/30 rounded-lg border">
                {uploadedFiles.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-background rounded-lg border shadow-sm">
                    {item.preview ? (
                      <ImagePreview
                        src={item.preview}
                        alt={item.file.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-muted-foreground/10 rounded flex items-center justify-center">
                        <FileText className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0 max-w-[150px]">
                      <p className="text-xs font-medium truncate">{item.file.name}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {(item.file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0"
                      onClick={() => handleFileRemove(index)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Input area: upload button + input field + send button */}
            <form
              onSubmit={onFormSubmit}
              className="relative flex items-end gap-2 p-2 rounded-lg border border-input bg-background hover:border-primary/50 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15 transition-colors"
            >
              {/* Upload button - on the left */}
              <div className="mb-1 ms-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 shrink-0"
                  onClick={() => document.getElementById('file-input')?.click()}
                  title="رفع ملف"
                >
                  <Upload className="w-4 h-4" />
                </Button>
                <input
                  id="file-input"
                  type="file"
                  className="hidden"
                  accept="image/*,.pdf,.docx,.txt,.md"
                  multiple
                  onChange={async (e) => {
                    const files = e.target.files
                    if (!files || files.length === 0) return
                    for (let i = 0; i < files.length; i++) {
                      await handleFileSelect(files[i])
                    }
                    e.target.value = ''
                  }}
                />
              </div>

              {/* Input field - in the middle */}
              <AutoResizeTextarea
                value={localInput}
                onChange={setLocalInput}
                onPaste={handlePaste}
                onSubmit={handleSubmit}
                placeholder={t('chat.inputPlaceholder')}
                disabled={isLoading}
                autoFocus
              />

              {/* Send/stop button - on the right */}
              <Button
                type="submit"
                size="icon"
                disabled={isLoading || (!localInput?.trim())}
                className={`h-10 w-10 mb-1 me-1 shrink-0 rounded-lg ${isLoading ? 'hidden' : 'flex'}`}
              >
                <Send className="w-4 h-4" />
              </Button>
              {isLoading && (
                <Button
                  type="button"
                  size="icon"
                  variant="destructive"
                  onClick={() => stop()}
                  className="h-10 w-10 mb-1 me-1 shrink-0 rounded-lg animate-in fade-in zoom-in"
                >
                  <StopCircle className="w-4 h-4" />
                </Button>
              )}
            </form>
            <div className="text-center text-xs text-muted-foreground mt-2">
              {t('chat.disclaimer')}
            </div>
          </div>
        </div>
        )}
      </div>

      {/* Full-screen drag and drop upload area */}
      {showFullDropZone && (
        <div
          className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-200"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="max-w-2xl w-full mx-4">
            <div className={`border-4 border-dashed rounded-2xl p-12 text-center transition-all ${
              isDragging ? 'border-primary bg-primary/10 scale-105' : 'border-primary/50 bg-primary/5'
            }`}>
              <Upload className="w-16 h-16 mx-auto mb-4 text-primary animate-bounce" />
              <h3 className="text-2xl font-bold mb-2">{t('fileUploadComponent.dropToUpload')}</h3>
              <p className="text-muted-foreground mb-4">
                {t('fileUploadComponent.supportedFormats')}
              </p>
              {!modelSupportsVision && (
                <div className="flex items-center justify-center gap-2 text-amber-600">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{t('fileUploadComponent.modelNotSupported')}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Spotlight search */}
      <SpotlightSearch
        open={spotlightOpen}
        onOpenChange={setSpotlightOpen}
        onSessionSelect={(id) => {
          setSessionId(id)
          setActiveTab('chat')
        }}
        onNavigateToFavorites={() => setActiveTab('favorites')}
      />

      {/* Shortcuts dialog */}
      <KeyboardShortcutsDialog
        open={shortcutsOpen}
        onOpenChange={setShortcutsOpen}
      />

      {/* Alert dialog for when the API key is not configured */}
      <ApiKeyRequiredDialog
        open={apiKeyDialogOpen}
        onOpenChange={setApiKeyDialogOpen}
        onOpenSettings={() => setSettingsOpen(true)}
      />
    </div>
  )
}
