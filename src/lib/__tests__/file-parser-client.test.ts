import { describe, expect, it } from 'vitest'
import { parseFile } from '@/lib/file-parser-client'

describe('parseFile', () => {
  it('reads plain text files locally', async () => {
    const file = new File(['Hello Muharrir'], 'sample.txt', { type: 'text/plain' })

    await expect(parseFile(file)).resolves.toEqual({ text: 'Hello Muharrir' })
  })

  it('reads markdown files even when the MIME type is generic', async () => {
    const file = new File(['# Title'], 'sample.md', { type: 'application/octet-stream' })

    await expect(parseFile(file)).resolves.toEqual({ text: '# Title' })
  })

  it('rejects unsupported file types', async () => {
    const file = new File(['{}'], 'sample.json', { type: 'application/json' })

    await expect(parseFile(file)).rejects.toThrow('نوع الملف غير مدعوم')
  })
})

