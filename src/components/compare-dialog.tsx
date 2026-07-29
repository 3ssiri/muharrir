'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { diffLines, isIdentical } from '@/lib/text-diff'
import type { FavoritePrompt } from '@/lib/db'
import { useTranslations } from 'next-intl'

interface CompareDialogProps {
  favorites: FavoritePrompt[]
  trigger: React.ReactNode
}

/**
 * Compare two saved prompts side-by-side via a unified line diff (#6).
 * Fully isolated from the chat/streaming flow — operates on existing data.
 */
export function CompareDialog({ favorites, trigger }: CompareDialogProps) {
  const t = useTranslations()
  const [open, setOpen] = useState(false)
  const withId = favorites.filter((f) => f.id != null)
  const [aId, setAId] = useState<string>(() => String(withId[0]?.id ?? ''))
  const [bId, setBId] = useState<string>(() => String(withId[1]?.id ?? withId[0]?.id ?? ''))

  const a = withId.find((f) => String(f.id) === aId)
  const b = withId.find((f) => String(f.id) === bId)

  const ops = a && b ? diffLines(a.content, b.content) : []

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{t('compare.title')}</DialogTitle>
        </DialogHeader>

        {withId.length < 2 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">{t('compare.needTwo')}</p>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">{t('compare.first')}</label>
                <Select value={aId} onValueChange={setAId}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {withId.map((f) => (
                      <SelectItem key={f.id} value={String(f.id)} className="truncate">{f.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">{t('compare.second')}</label>
                <Select value={bId} onValueChange={setBId}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {withId.map((f) => (
                      <SelectItem key={f.id} value={String(f.id)} className="truncate">{f.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="max-h-[55vh] overflow-auto rounded-md border bg-muted/20 font-mono text-xs leading-relaxed">
              {isIdentical(ops) ? (
                <p className="p-4 text-center text-muted-foreground">{t('compare.identical')}</p>
              ) : (
                ops.map((op, i) => (
                  <div
                    key={i}
                    className={
                      op.type === 'add'
                        ? 'bg-success/15 text-success px-3 py-0.5 whitespace-pre-wrap'
                        : op.type === 'remove'
                          ? 'bg-destructive/10 text-destructive px-3 py-0.5 whitespace-pre-wrap'
                          : 'px-3 py-0.5 whitespace-pre-wrap text-foreground/80'
                    }
                  >
                    <span className="select-none opacity-50 me-2">
                      {op.type === 'add' ? '+' : op.type === 'remove' ? '−' : ' '}
                    </span>
                    {op.text || ' '}
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setOpen(false)}>{t('common.close')}</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
