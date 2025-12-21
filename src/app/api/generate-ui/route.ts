import { NextResponse } from 'next/server'
import { DESIGN_SYSTEM, UI_GENERATION_PROMPT } from '@/lib/design-system'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY

// 可用的模型列表（按優先順序）
const GEMINI_MODELS = [
  'gemini-2.5-flash',          // 最新 2.5 flash 模型
  'gemini-2.5-pro',            // 最新 2.5 pro 模型
  'gemini-2.0-flash-001',      // 穩定版 2.0 flash
]

// POST: 根據用戶需求生成 UI 代碼
export async function POST(request: Request) {
  try {
    const { prompt, pageType } = await request.json()

    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY 未設定' },
        { status: 500 }
      )
    }

    if (!prompt) {
      return NextResponse.json(
        { error: '請提供頁面需求描述' },
        { status: 400 }
      )
    }

    // 構建完整的 prompt
    const fullPrompt = `
${UI_GENERATION_PROMPT}

## 設計系統參考
${JSON.stringify(DESIGN_SYSTEM, null, 2)}

## 頁面類型
${pageType || '通用頁面'}

## 用戶需求
${prompt}

## 輸出要求
請生成完整的 React/Next.js 頁面代碼，包含：
1. "use client" 指令放在第一行
2. 必要的 import（只用 React，不要用 next/image）
3. 完整的組件定義，使用 export default
4. 圖片使用普通 <img> 標籤配合 Unsplash URL
5. 符合 Venturo 設計風格的 UI

只回傳純代碼，不要 markdown 格式，不要說明文字。
`

    // 嘗試多個模型
    let lastError = null
    for (const model of GEMINI_MODELS) {
      try {
        console.log(`Trying model: ${model}`)
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [{ text: fullPrompt }],
                },
              ],
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 8192,
              },
            }),
          }
        )

        if (response.ok) {
          const data = await response.json()
          const generatedCode = data.candidates?.[0]?.content?.parts?.[0]?.text || ''

          // 清理代碼（移除 markdown code block 和其他雜訊）
          let cleanCode = generatedCode
            .replace(/```(?:tsx?|jsx?|javascript|typescript)?\n?/gi, '')  // 移除開始的 code block
            .replace(/```\n?/g, '')  // 移除結束的 code block
            .replace(/^(?:tsx?|jsx?)\n/i, '')  // 移除開頭的語言標記
            .trim()

          // 確保 "use client" 開頭正確
          if (cleanCode.startsWith('use client')) {
            cleanCode = '"' + cleanCode
          }

          return NextResponse.json({
            success: true,
            code: cleanCode,
            prompt: prompt,
            model: model,
          })
        }

        const errorData = await response.json()
        console.error(`Model ${model} error:`, JSON.stringify(errorData))

        // 如果是配額問題，嘗試下一個模型
        if (errorData.error?.code === 429 || errorData.error?.code === 404) {
          lastError = errorData.error
          continue
        }

        // 其他錯誤直接返回
        return NextResponse.json(
          { error: `AI 生成失敗: ${errorData.error?.message || '未知錯誤'}` },
          { status: 500 }
        )
      } catch (fetchError) {
        console.error(`Model ${model} fetch error:`, fetchError)
        lastError = fetchError
        continue
      }
    }

    // 所有模型都失敗
    const errorMessage = lastError?.message || '所有模型都無法使用'
    if (errorMessage.includes('quota') || errorMessage.includes('429')) {
      return NextResponse.json(
        { error: 'API 配額已用盡，請稍後再試或更換 API Key' },
        { status: 429 }
      )
    }

    return NextResponse.json(
      { error: `AI 生成失敗: ${errorMessage}` },
      { status: 500 }
    )
  } catch (error) {
    console.error('Generate UI error:', error)
    return NextResponse.json(
      { error: '系統錯誤' },
      { status: 500 }
    )
  }
}

// GET: 取得設計系統資訊
export async function GET() {
  return NextResponse.json({
    success: true,
    designSystem: DESIGN_SYSTEM,
  })
}
