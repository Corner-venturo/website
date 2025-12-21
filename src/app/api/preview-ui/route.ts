import { NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

// POST: 儲存預覽代碼
export async function POST(request: Request) {
  try {
    const { code } = await request.json()

    if (!code) {
      return NextResponse.json(
        { error: '請提供代碼' },
        { status: 400 }
      )
    }

    // 確保預覽目錄存在
    const previewDir = path.join(process.cwd(), 'src/app/dev/ui-generator/preview')
    await mkdir(previewDir, { recursive: true })

    // 寫入預覽檔案
    const previewPath = path.join(previewDir, 'page.tsx')
    await writeFile(previewPath, code, 'utf-8')

    return NextResponse.json({
      success: true,
      path: '/dev/ui-generator/preview',
    })
  } catch (error) {
    console.error('Preview save error:', error)
    return NextResponse.json(
      { error: '儲存預覽失敗' },
      { status: 500 }
    )
  }
}
