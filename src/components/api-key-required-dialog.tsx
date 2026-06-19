'use client'

import { AlertCircle, Settings } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useTranslations } from 'next-intl'

interface ApiKeyRequiredDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onOpenSettings: () => void
}

/**
 * مربع حوار للتنبيه عند عدم تهيئة مفتاح API
 *
 * المميزات:
 * - تأثير ضبابي للخلفية
 * - رسالة تنبيه أنيقة
 * - الانتقال إلى الإعدادات بنقرة واحدة
 */
export function ApiKeyRequiredDialog({
  open,
  onOpenChange,
  onOpenSettings,
}: ApiKeyRequiredDialogProps) {
  const t = useTranslations()

  const handleOpenSettings = () => {
    onOpenChange(false)
    onOpenSettings()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md backdrop-blur-sm">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            <DialogTitle>{t('apiKeyRequired.title', { default: 'يلزم تهيئة مفتاح API' })}</DialogTitle>
          </div>
          <DialogDescription className="pt-4 space-y-2">
            <p>{t('apiKeyRequired.description', {
              default: 'لم تقم بتهيئة مفتاح API بعد، ولا يمكنك استخدام ميزات الذكاء الاصطناعي.'
            })}</p>
            <p className="text-sm text-muted-foreground">
              {t('apiKeyRequired.hint', {
                default: 'يرجى النقر على الزر أدناه للانتقال إلى صفحة الإعدادات لتهيئة مفتاح API الخاص بك.'
              })}
            </p>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            {t('common.cancel', { default: 'إلغاء' })}
          </Button>
          <Button
            onClick={handleOpenSettings}
            className="gap-2"
          >
            <Settings className="h-4 w-4" />
            {t('apiKeyRequired.goToSettings', { default: 'الذهاب إلى الإعدادات' })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
