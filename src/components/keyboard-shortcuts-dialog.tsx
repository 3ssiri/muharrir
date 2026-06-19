'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useTranslations } from 'next-intl'
import { Command, Search, Plus, MessageSquare, Keyboard } from 'lucide-react'

interface KeyboardShortcutsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function KeyboardShortcutsDialog({ open, onOpenChange }: KeyboardShortcutsDialogProps) {
  const t = useTranslations()

  // اكتشاف نظام التشغيل
  const [isMac, setIsMac] = useState(false)

  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().indexOf('MAC') >= 0)
  }, [])

  const modKey = isMac ? '⌘' : 'Ctrl'

  const shortcuts = [
    {
      category: t('shortcuts.general'),
      items: [
        { keys: [modKey, 'K'], description: t('shortcuts.openSearch') },
        { keys: [modKey, 'N'], description: t('shortcuts.newChat') },
        { keys: [modKey, '/'], description: t('shortcuts.focusInput') },
        { keys: ['Alt', 'S'], description: t('shortcuts.openSettings') },
        { keys: [modKey, 'B'], description: t('shortcuts.toggleSidebar') },
        { keys: ['Tab'], description: t('shortcuts.switchTab') },
        { keys: ['Shift', '/'], description: t('shortcuts.showShortcuts') },
      ]
    },
    {
      category: t('shortcuts.chat'),
      items: [
        { keys: ['Enter'], description: t('shortcuts.sendMessage') },
        { keys: ['Shift', 'Enter'], description: t('shortcuts.newLine') },
      ]
    }
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="w-5 h-5" />
            {t('shortcuts.title')}
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {/* تخطيط بعمودين */}
          <div className="grid grid-cols-2 gap-6">
            {shortcuts.map((section, idx) => (
              <div key={idx}>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                  {section.category}
                </h3>
                <div className="space-y-2">
                  {section.items.map((shortcut, itemIdx) => (
                    <div
                      key={itemIdx}
                      className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <span className="text-sm">{shortcut.description}</span>
                      <div className="flex items-center gap-1">
                        {shortcut.keys.map((key, keyIdx) => (
                          <span key={keyIdx} className="flex items-center gap-1">
                            <kbd className="px-2 py-1 text-xs font-semibold text-foreground bg-muted border border-border rounded shadow-sm">
                              {key}
                            </kbd>
                            {keyIdx < shortcut.keys.length - 1 && (
                              <span className="text-muted-foreground">+</span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-xs text-muted-foreground text-center pt-4 border-t">
          {t('shortcuts.hint')}
        </div>
      </DialogContent>
    </Dialog>
  )
}
