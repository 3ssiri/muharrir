'use client'

import { useState, useEffect, useMemo } from 'react'
import { Star, Search, Copy, Trash2, Edit2, X } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { db } from '@/lib/db'
import type { FavoritePrompt } from '@/lib/db'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import { ar, enUS } from 'date-fns/locale'
import { useTranslations, useLocale } from 'next-intl'

interface FavoritesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function FavoritesDialog({ open, onOpenChange }: FavoritesDialogProps) {
  const t = useTranslations();
  const locale = useLocale();
  const dateLocale = locale === 'ar' ? ar : enUS;
  const [favorites, setFavorites] = useState<FavoritePrompt[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')

  // Filter search results (derived during render)
  const filteredFavorites = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return favorites

    return favorites.filter(fav =>
      fav.title?.toLowerCase().includes(query) ||
      fav.content?.toLowerCase().includes(query)
    )
  }, [searchQuery, favorites])

  const loadFavorites = async () => {
    const allFavorites = await db.favoritePrompts.orderBy('updatedAt').reverse().toArray()
    setFavorites(allFavorites)
  }

  useEffect(() => {
    if (!open) return

    const load = async () => {
      const allFavorites = await db.favoritePrompts.orderBy('updatedAt').reverse().toArray()
      setFavorites(allFavorites)
    }
    load()
  }, [open])

  const handleCopy = async (content: string) => {
    await navigator.clipboard.writeText(content)
    toast.success(t('favoritesDialog.copied'))
  }

  const handleDelete = async (id: number) => {
    if (confirm(t('favoritesDialog.confirmDelete'))) {
      await db.favoritePrompts.delete(id)
      await loadFavorites()
      toast.success(t('favoritesDialog.deleted'))
    }
  }

  const handleEdit = (fav: FavoritePrompt) => {
    setEditingId(fav.id!)
    setEditTitle(fav.title)
    setEditContent(fav.content)
  }

  const handleSave = async () => {
    if (!editingId) return
    await db.favoritePrompts.update(editingId, {
      title: editTitle,
      content: editContent,
      updatedAt: new Date()
    })
    setEditingId(null)
    await loadFavorites()
    toast.success(t('favoritesDialog.saved'))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
            {t('favoritesDialog.title')}
          </DialogTitle>
        </DialogHeader>

        {/* Search box */}
        <div className="relative">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('favoritesDialog.searchPlaceholder')}
            className="ps-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Favorites list */}
        <ScrollArea className="flex-1 -mx-6 px-6">
          {filteredFavorites.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Star className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>{searchQuery ? t('favoritesDialog.noMatches') : t('favoritesDialog.noFavorites')}</p>
            </div>
          ) : (
            <div className="space-y-3">{filteredFavorites.map((fav) => (
                <div key={fav.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  {editingId === fav.id ? (
                    <div className="space-y-3">
                      <Input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        placeholder={t('favoritesDialog.titlePlaceholder')}
                        className="font-medium"
                      />
                      <Textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        placeholder={t('favoritesDialog.contentPlaceholder')}
                        className="min-h-[200px] font-mono text-sm"
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleSave}>{t('favoritesDialog.saveButton')}</Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>{t('favoritesDialog.cancelButton')}</Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-lg">{fav.title}</h3>
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleCopy(fav.content)}>
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleEdit(fav)}>
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => handleDelete(fav.id!)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-3">{fav.content}</p>
                      <div className="mt-2 text-xs text-muted-foreground">
                        {formatDistanceToNow(fav.updatedAt, { addSuffix: true, locale: dateLocale })}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
