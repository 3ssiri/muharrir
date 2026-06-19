import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // التحقّق ممّا إذا كانت بيئة نشر سحابية (Vercel)
    const isProduction = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production'

    // جلب عدد commits البعيدة من GitHub
    let remoteVersion = null
    let localVersion = null
    let hasUpdate = false

    try {
      const response = await fetch(
        'https://api.github.com/repos/systemoutprintlnhelloworld/interactive-prompt-iterator/commits?per_page=1',
        {
          headers: {
            'Accept': 'application/vnd.github.v3+json',
          },
          next: { revalidate: 300 } // التخزين المؤقّت لمدة 5 دقائق
        }
      )

      if (response.ok) {
        const linkHeader = response.headers.get('Link')
        if (linkHeader) {
          const match = linkHeader.match(/page=(\d+)>; rel="last"/)
          if (match) {
            const remoteCommitCount = match[1]
            remoteVersion = `v1.${remoteCommitCount}`
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch remote version:', error)
    }

    // النشر السحابي: عرض الإصدار البعيد مباشرةً
    if (isProduction) {
      return NextResponse.json({
        localVersion: remoteVersion,
        remoteVersion: remoteVersion,
        hasUpdate: false
      })
    }

    // التطوير المحلي: جلب عدد commits المحلية ومقارنتها
    try {
      const { execSync } = require('child_process')
      const localCommitCount = execSync('git rev-list --count HEAD', { encoding: 'utf-8' }).trim()
      localVersion = `v1.${localCommitCount}`

      if (remoteVersion) {
        const remoteCount = parseInt(remoteVersion.replace('v1.', ''))
        const localCount = parseInt(localCommitCount)
        hasUpdate = remoteCount > localCount
      }
    } catch (error) {
      console.error('Failed to get local version:', error)
      localVersion = remoteVersion // في حال فشل جلب الإصدار المحلي، استخدم الإصدار البعيد
    }

    return NextResponse.json({
      localVersion,
      remoteVersion,
      hasUpdate
    })
  } catch (error) {
    console.error('Version check error:', error)
    return NextResponse.json(
      { error: 'Failed to check version' },
      { status: 500 }
    )
  }
}
