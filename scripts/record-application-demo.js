const { chromium } = require('playwright')
const fs = require('fs')
const path = require('path')

const baseUrl = process.env.DEMO_BASE_URL || process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:3111'
const outputDir = path.resolve(__dirname, '../docs/screenshots')
const finalVideoPath = path.join(outputDir, 'muharrir-application-demo.webm')

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function clickIfVisible(page, locator, timeout = 3000) {
  try {
    await locator.waitFor({ state: 'visible', timeout })
    await locator.click()
    return true
  } catch {
    return false
  }
}

async function main() {
  fs.mkdirSync(outputDir, { recursive: true })

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    locale: 'ar-SA',
    viewport: { width: 1280, height: 800 },
    recordVideo: {
      dir: outputDir,
      size: { width: 1280, height: 800 },
    },
  })

  const page = await context.newPage()
  page.setDefaultTimeout(30000)

  try {
    await page.goto(`${baseUrl.replace(/\/+$/, '')}/ar/`, { waitUntil: 'domcontentloaded' })
    await wait(1500)

    await clickIfVisible(page, page.getByRole('button', { name: 'جرّب بدون مفتاح' }), 8000)
    await wait(1200)

    const prompt =
      'حوّل فكرة دورة قصيرة عن أساسيات الذكاء الاصطناعي للمعلمين إلى موجه منظم'
    await page.locator('textarea').fill(prompt)
    await wait(800)

    await page.getByRole('button', { name: 'إرسال' }).click()
    await wait(3500)

    await page.getByText(/اقتراحات التحسين|Document-to-Prompt|مقترح الموجّه/).first().waitFor({
      state: 'visible',
      timeout: 15000,
    }).catch(() => {})
    await wait(2500)

    await page.mouse.wheel(0, 500)
    await wait(1200)

    await page.screenshot({
      path: path.join(outputDir, 'muharrir-application-demo-final.png'),
      fullPage: true,
    })
  } finally {
    await context.close()
    await browser.close()
  }

  const videos = fs
    .readdirSync(outputDir)
    .filter((name) => name.endsWith('.webm'))
    .map((name) => path.join(outputDir, name))
    .sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs)

  if (videos.length === 0) {
    throw new Error('No Playwright video was created')
  }

  if (fs.existsSync(finalVideoPath)) fs.unlinkSync(finalVideoPath)
  fs.renameSync(videos[0], finalVideoPath)
  console.log(`Demo video saved to ${finalVideoPath}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
