'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Download } from '@/components/icons'

interface VersionInfo {
  localVersion: string
  remoteVersion: string | null
  hasUpdate: boolean
}

// Fetch the version directly from the GitHub API (client-side) instead of a server route
// (removed). Local comparison is not available in static export/Tauri mode.
async function fetchVersionInfo(): Promise<VersionInfo | null> {
  try {
    let remoteVersion: string | null = null
    try {
      const response = await fetch(
        'https://api.github.com/repos/3ssiri/muharrir/commits?per_page=1',
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
      // Ignore network errors when GitHub is unreachable
    }

    return remoteVersion ? { localVersion: remoteVersion, remoteVersion, hasUpdate: false } : null
  } catch (error) {
    console.error('Failed to fetch version:', error)
    return null
  }
}

export function VersionBadge() {
  const t = useTranslations()
  const [versionInfo, setVersionInfo] = useState<VersionInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetchVersionInfo()
      .then((info) => {
        if (!cancelled && info) setVersionInfo(info)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (loading) {
    return <Badge variant="outline" className="text-xs font-normal">{t('common.loading')}</Badge>
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
