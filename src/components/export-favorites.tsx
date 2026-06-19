'use client'

import { useState } from 'react'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { db, type FavoritePrompt } from '@/lib/db'
import { exportToMarkdown, exportToJSON } from '@/lib/export-utils'
import { useTranslations } from 'next-intl'

export function ExportFavorites() {
  const t = useTranslations()
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async (format: 'md' | 'json' | 'docx') => {
    setIsExporting(true)
    try {
      const favorites = await db.favoritePrompts.toArray()

      if (favorites.length === 0) {
        alert(t('favoritesDialog.noFavorites'))
        return
      }

      let content: string
      let filename: string
      let mimeType: string

      if (format === 'md') {
        content = exportToMarkdown(favorites)
        filename = `favorites-${Date.now()}.md`
        mimeType = 'text/markdown'
      } else if (format === 'json') {
        content = exportToJSON(favorites)
        filename = `favorites-${Date.now()}.json`
        mimeType = 'application/json'
      } else {
        // تنسيق DOCX غير متوفر حالياً، إبلاغ المستخدم
        alert('ميزة التصدير بتنسيق DOCX قيد التطوير')
        return
      }

      // إنشاء رابط التنزيل
      const blob = new Blob([content], { type: mimeType })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('فشل التصدير:', error)
      alert('فشل التصدير، يرجى المحاولة مرة أخرى')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={isExporting}>
          <Download className="w-4 h-4 me-2" />
          {t('favoritesDialog.export')}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => handleExport('md')}>
          التصدير إلى Markdown (.md)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('json')}>
          التصدير إلى JSON (.json)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('docx')} disabled>
          التصدير إلى Word (.docx) - قيد التطوير
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
