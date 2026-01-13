import { NextRequest } from 'next/server'
import { getOnlineSupabase } from '@/lib/supabase-server'
import { jsonResponse, CACHE_CONFIGS } from '@/lib/api-utils'

// GET /api/learn/scenarios/[scenarioId] - Get scenario details with vocabulary
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ scenarioId: string }> }
) {
  try {
    const { scenarioId } = await params
    const supabase = getOnlineSupabase()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.id) {
      return jsonResponse({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get learning profile
    const { data: profile } = await supabase
      .from('learning_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!profile) {
      return jsonResponse({ error: 'Profile not found' }, { status: 404 })
    }

    // Fetch scenario, vocabulary, and progress in parallel
    const [scenarioResult, vocabularyResult, patternsResult, dialoguesResult] = await Promise.all([
      supabase
        .from('learning_scenarios')
        .select('*')
        .eq('id', scenarioId)
        .single(),
      supabase
        .from('vocabulary')
        .select(`
          *,
          vocabulary_progress!left (
            id,
            learned,
            mastery_level,
            stability,
            difficulty,
            next_review_at,
            review_count
          )
        `)
        .eq('scenario_id', scenarioId)
        .eq('vocabulary_progress.profile_id', profile.id)
        .order('difficulty_level', { ascending: true })
        .order('display_order', { ascending: true }),
      supabase
        .from('sentence_patterns')
        .select('*')
        .eq('scenario_id', scenarioId)
        .order('difficulty_level', { ascending: true })
        .order('display_order', { ascending: true }),
      supabase
        .from('dialogues')
        .select(`
          *,
          dialogue_lines (*)
        `)
        .eq('scenario_id', scenarioId)
        .order('display_order', { ascending: true }),
    ])

    if (scenarioResult.error) {
      return jsonResponse({ error: 'Scenario not found' }, { status: 404 })
    }

    // Calculate progress stats
    const vocabulary = vocabularyResult.data || []
    const learnedVocabulary = vocabulary.filter(
      (v) => v.vocabulary_progress?.[0]?.learned
    )
    const masteredVocabulary = vocabulary.filter(
      (v) => (v.vocabulary_progress?.[0]?.mastery_level || 0) >= 4
    )

    const patterns = patternsResult.data || []
    const dialogues = dialoguesResult.data || []

    return jsonResponse({
      scenario: scenarioResult.data,
      vocabulary: vocabulary.map((v) => ({
        ...v,
        progress: v.vocabulary_progress?.[0] || null,
        vocabulary_progress: undefined,
      })),
      patterns,
      dialogues,
      stats: {
        totalVocabulary: vocabulary.length,
        learnedVocabulary: learnedVocabulary.length,
        masteredVocabulary: masteredVocabulary.length,
        totalPatterns: patterns.length,
        totalDialogues: dialogues.length,
      },
    }, { cache: CACHE_CONFIGS.privateShort })
  } catch (error) {
    console.error('Error fetching scenario details:', error)
    return jsonResponse({ error: 'Internal server error' }, { status: 500 })
  }
}
