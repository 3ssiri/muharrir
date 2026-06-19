'use client'

import { useState, useRef, useEffect } from 'react'
import { Upload, X, Image, FileText, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import { ImagePreview } from '@/components/image-preview'

interface FileUploadProps {
  onFileSelect: (file: File, preview?: string) => void
  onFileRemove: (index: number) => void
  currentFiles: Array<{ file: File; preview?: string }>
  modelSupportsVision: boolean
}

export function FileUpload({
  onFileSelect,
  onFileRemove,
  currentFiles,
  modelSupportsVision
}: FileUploadProps) {
  const t = useTranslations();
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [showFullDropZone, setShowFullDropZone] = useState(false)
  const dragCounterRef = useRef(0)

  // مراقبة السحب على مستوى النافذة بالكامل
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    // معالجة جميع الملفات المحددة
    for (let i = 0; i < files.length; i++) {
      await processFile(files[i])
    }

    // إعادة تعيين input للسماح باختيار الملف نفسه مرة أخرى
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const processFile = async (file: File) => {
    const isImage = file.type.startsWith('image/')
    const isPDF = file.type === 'application/pdf'
    const isDoc = file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    const isText = file.type.startsWith('text/') || file.name.endsWith('.txt') || file.name.endsWith('.md')

    // التحقق من دعم الصور
    if (isImage && !modelSupportsVision) {
      toast.error(t('fileUploadComponent.visionNotSupported'))
      return
    }

    // التحقق من نوع الملف
    if (!isImage && !isPDF && !isDoc && !isText) {
      toast.error(t('fileUploadComponent.unsupportedFormat'))
      return
    }

    // التحقق من حجم الملف (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error(t('fileUploadComponent.fileTooLarge'))
      return
    }

    // معالجة معاينة الصورة
    if (isImage) {
      const reader = new FileReader()
      reader.onload = (e) => {
        onFileSelect(file, e.target?.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      onFileSelect(file)
    }
  }

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
      // معالجة جميع الملفات المسحوبة
      for (let i = 0; i < files.length; i++) {
        await processFile(files[i])
      }
    }
  }

  return (
    <>
      {/* منطقة رفع الملفات بالسحب على كامل الشاشة */}
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

      {/* منطقة الرفع العادية */}
      <div className="space-y-3">
        {/* قائمة الملفات - تُعرض بشكل مستقل في الأعلى */}
        {currentFiles.length > 0 && (
          <div className="flex flex-wrap gap-2 p-3 bg-muted/30 rounded-lg border">
            {currentFiles.map((item, index) => (
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
                  onClick={() => onFileRemove(index)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* زر الرفع - في سطر مستقل */}
        <div className="relative">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-10 w-10 shrink-0"
            onClick={() => fileInputRef.current?.click()}
            title={t('fileUploadComponent.uploadFile')}
          >
            <Upload className="w-4 h-4" />
          </Button>

          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/*,.pdf,.docx,.txt,.md"
            multiple
            onChange={handleFileChange}
          />
        </div>
      </div>
    </>
  )
}
