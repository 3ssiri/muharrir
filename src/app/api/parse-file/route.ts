import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'لم يُعثر على ملف' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    let text = ''

    // معالجة ملفات PDF
    if (file.type === 'application/pdf') {
      const pdfParse = require('pdf-parse')
      const data = await pdfParse(buffer)
      text = data.text
    }
    // معالجة ملفات DOCX
    else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const mammoth = require('mammoth')
      const result = await mammoth.extractRawText({ buffer })
      text = result.value
    }
    else {
      return NextResponse.json({ error: 'نوع الملف غير مدعوم' }, { status: 400 })
    }

    return NextResponse.json({ text })
  } catch (error: any) {
    console.error('خطأ في تحليل الملف:', error)
    return NextResponse.json({ error: error.message || 'فشل تحليل الملف' }, { status: 500 })
  }
}
