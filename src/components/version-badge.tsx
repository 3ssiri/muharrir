'use client'

import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'

interface VersionInfo {
  localVersion: string
  remoteVersion: string | null
  hasUpdate: boolean
}

export function VersionBadge() {
  const [versionInfo, setVersionInfo] = useState<VersionInfo | null>(null)
  const [loading, setLoading] = useState(true)

  // جلب الإصدار مباشرةً من GitHub API (client-side) بدلاً من مسار خادم
  // محذوف. لا تتوفّر مقارنة محلية في وضع static export/Tauri.
  const fetchVersion = async () => {
    try {
      let remoteVersion: string | null = null
      try {
        const response = await fetch(
          'https://api.github.com/repos/systemoutprintlnhelloworld/interactive-prompt-iterator/commits?per_page=1',
          { headers: { Accept: 'application/vnd.github.v3+json' } }
        )
        if (response.ok) {
          const linkHeader = response.headers.get('Link')
          const match = linkHeader?.match(/page=(\d+)>; rel="last"/)
          if (match) {
            remoteVersion = `v1.${match[1]}`
          }
        }
      } catch {
        // تجاهل أخطاء الشبكة عند تعذّر الوصول إلى GitHub
      }

      if (remoteVersion) {
        setVersionInfo({ localVersion: remoteVersion, remoteVersion, hasUpdate: false })
      }
    } catch (error) {
      console.error('Failed to fetch version:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVersion()
  }, [])

  if (loading) {
    return <Badge variant="outline" className="text-xs font-normal">جارٍ التحميل...</Badge>
  }

  if (!versionInfo) {
    return null
  }

  return (
    <div className="flex items-center gap-2">
      <Badge
        variant={versionInfo.hasUpdate ? "default" : "outline"}
        className={`text-xs font-normal ${versionInfo.hasUpdate ? 'bg-orange-500 hover:bg-orange-600' : ''}`}
      >
        {versionInfo.localVersion}
        {versionInfo.hasUpdate && (
          <Download className="w-3 h-3 ms-1 inline" />
        )}
      </Badge>
    </div>
  )
}
