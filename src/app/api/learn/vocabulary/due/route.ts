import { NextRequest, NextResponse } from 'next/server'
import { getOnlineSupabase } from '@/lib/supabase-server'
import { jsonResponse, CACHE_CONFIGS } from '@/lib/api-utils'
import { logger } from '@/lib/logger'

// GET /api/learn/vocabulary/due - 取得待複習詞彙
export async function GET(request: NextRequest) {
  try {
    const supabase = getOnlineSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20', 10)

    // 取得待複習的詞彙進度
    const { data: progress, error: progressError } = await supabase
      .from('user_vocabulary_progress')
      .select('*')
      .eq('user_id', user.id)
      .in('status', ['learning', 'reviewing'])
      .lte('due_date', new Date().toISOString())
      .order('due_date', { ascending: true })
      .limit(limit)

    if (progressError) throw progressError

    if (!progress || progress.length === 0) {
      return jsonResponse({ vocabulary: [], total: 0 }, { cache: CACHE_CONFIGS.privateShort })
    }

    // 取得詞彙詳情
    const vocabularyIds = progress.map((p) => p.vocabulary_id)
    const { data: vocabulary, error: vocabError } = await supabase
      .from('vocabulary')
      .select(`
        *,
        japanese_data:vocabulary_japanese_data(*),
        contexts:vocabulary_contexts(*)
      `)
      .in('id', vocabularyIds)

    if (vocabError) throw vocabError

    // 合併進度和詞彙資料
    const vocabularyWithProgress = progress.map((p) => {
      const vocab = vocabulary?.find((v) => v.id === p.vocabulary_id)
      return {
        ...vocab,
        progress: p,
      }
    })

    // 取得總待複習數量
    const { count } = await supabase
      .from('user_vocabulary_progress')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .in('status', ['learning', 'reviewing'])
      .lte('due_date', new Date().toISOString())

    return jsonResponse(
      { vocabulary: vocabularyWithProgress, total: count || 0 },
      { cache: CACHE_CONFIGS.privateShort }
    )
  } catch (error) {
    logger.error('Failed to get due vocabulary:', error)
    return NextResponse.json({ error: 'Failed to get due vocabulary' }, { status: 500 })
  }
}
