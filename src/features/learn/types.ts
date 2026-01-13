// ============================================
// Language Learning System - TypeScript Types
// ============================================

// ============================================
// 基礎類型
// ============================================

export type TargetLanguage = 'ja' | 'en'
export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
export type JLPTLevel = 'N5' | 'N4' | 'N3' | 'N2' | 'N1'
export type FormalityLevel = 'casual' | 'polite' | 'formal' | 'humble' | 'honorific'
export type PartOfSpeech = 'noun' | 'verb' | 'adjective' | 'adverb' | 'particle' | 'counter' | 'phrase'

// FSRS 評分: 1=Again, 2=Hard, 3=Good, 4=Easy
export type FSRSRating = 1 | 2 | 3 | 4

export type VocabularyStatus = 'new' | 'learning' | 'reviewing' | 'mastered'
export type GoalStatus = 'active' | 'completed' | 'paused' | 'abandoned'
export type DialogueStatus = 'not_started' | 'in_progress' | 'completed'
export type SessionType = 'vocabulary' | 'pattern' | 'dialogue' | 'ai_conversation' | 'review' | 'mixed' | 'learn'

// ============================================
// 身份與用戶
// ============================================

export interface LearningRole {
  id: string
  code: string
  name_zh: string
  name_en: string
  name_ja: string
  description: string | null
  icon: string | null
  sort_order: number
  is_active: boolean
}

export interface LearningProfile {
  id: string
  user_id: string
  display_name: string | null
  gender: string | null
  role_id: string | null
  role?: LearningRole
  target_language: TargetLanguage
  native_language: string
  cefr_level: CEFRLevel
  daily_goal_minutes: number
  daily_goal_xp: number
  reminder_enabled: boolean
  reminder_time: string | null
  total_xp: number
  current_streak: number
  longest_streak: number
  last_study_date: string | null
  total_study_minutes: number
  words_learned: number
  created_at: string
  updated_at: string
}

export interface LearningStreak {
  id: string
  user_id: string
  date: string
  xp_earned: number
  minutes_studied: number
  lessons_completed: number
  streak_maintained: boolean
  streak_freeze_used: boolean
}

// ============================================
// 情境與目標
// ============================================

export type ScenarioCategory = 'dining' | 'accommodation' | 'transport' | 'shopping' | 'emergency'

export interface LearningScenario {
  id: string
  code: string
  name_zh: string
  name_en: string
  name_ja: string
  category: ScenarioCategory
  difficulty: number
  cefr_min_level: CEFRLevel
  estimated_hours: number
  total_vocabulary: number
  total_patterns: number
  total_dialogues: number
  applicable_roles: string[]
  description_zh: string | null
  description_en: string | null
  description_ja: string | null
  cover_image_url: string | null
  icon: string | null
  sort_order: number
  is_active: boolean
  is_premium: boolean
}

export interface ScenarioTopic {
  id: string
  scenario_id: string
  code: string
  name_zh: string
  name_en: string
  name_ja: string
  order_index: number
  is_required: boolean
  vocabulary_count: number
  pattern_count: number
  is_active: boolean
}

export interface LearningGoal {
  id: string
  user_id: string
  scenario_id: string
  scenario?: LearningScenario
  target_date: string
  priority: number
  trip_id: string | null
  status: GoalStatus
  progress_percentage: number
  vocabulary_learned: number
  vocabulary_total: number
  patterns_learned: number
  patterns_total: number
  dialogues_completed: number
  dialogues_total: number
  started_at: string
  completed_at: string | null
  last_studied_at: string | null
}

// ============================================
// 詞彙系統
// ============================================

export interface Vocabulary {
  id: string
  word_ja: string
  reading_hiragana: string | null
  reading_romaji: string | null
  word_zh: string
  word_en: string
  part_of_speech: PartOfSpeech | null
  cefr_level: CEFRLevel | null
  jlpt_level: JLPTLevel | null
  audio_url: string | null
  image_url: string | null
  mnemonic_zh: string | null
  mnemonic_image_url: string | null
  frequency_rank: number
  tags: string[]
  notes: string | null
  is_active: boolean
}

export interface VocabularyJapaneseData {
  id: string
  vocabulary_id: string
  word_ja: string
  reading_hiragana: string | null
  reading_katakana: string | null
  reading_romaji: string | null
  kanji_components: Record<string, unknown> | null
  kanji_stroke_order_url: string | null
  jlpt_level: JLPTLevel | null
  politeness_level: FormalityLevel | null
  verb_group: string | null
  verb_conjugations: VerbConjugations | null
  adjective_type: string | null
  adjective_conjugations: Record<string, string> | null
  pitch_accent_pattern: number | null
  pitch_accent_diagram: string | null
}

export interface VerbConjugations {
  dictionary: string
  masu: string
  te: string
  ta: string
  nai: string
  potential: string
  passive: string
  causative: string
  imperative: string
  volitional: string
}

export interface VocabularyContext {
  id: string
  vocabulary_id: string
  scenario_id: string | null
  topic_id: string | null
  usage_frequency: number
  example_sentence_ja: string | null
  example_sentence_zh: string | null
  example_sentence_en: string | null
  example_audio_url: string | null
  context_note: string | null
  formality_level: FormalityLevel | null
}

export interface UserVocabularyProgress {
  id: string
  user_id: string
  vocabulary_id: string
  vocabulary?: Vocabulary
  status: VocabularyStatus
  stability: number
  difficulty: number
  elapsed_days: number
  scheduled_days: number
  reps: number
  lapses: number
  due_date: string | null
  last_review: string | null
  correct_count: number
  incorrect_count: number
  learned_in_scenario_id: string | null
  first_seen_at: string
  mastered_at: string | null
}

// ============================================
// 句型與對話
// ============================================

export interface FillSlot {
  slot: string
  type: string
  examples: string[]
}

export interface SentencePattern {
  id: string
  scenario_id: string | null
  topic_id: string | null
  pattern_ja: string
  pattern_structure: string | null
  pattern_zh: string
  pattern_en: string
  cefr_level: CEFRLevel | null
  formality_level: FormalityLevel | null
  fill_slots: FillSlot[]
  variations: PatternVariation[]
  grammar_point: string | null
  grammar_explanation_zh: string | null
  audio_url: string | null
  tags: string[]
  sort_order: number
  is_active: boolean
}

export interface PatternVariation {
  formality: FormalityLevel
  pattern_ja: string
}

export interface DialogueTurn {
  turn: number
  speaker: string
  text_ja: string
  text_zh: string
  text_en: string
  audio_url?: string
  key_phrase?: boolean
  grammar_point?: string
  practice_slots?: string[]
}

export interface Dialogue {
  id: string
  scenario_id: string
  topic_id: string | null
  title_zh: string
  title_en: string | null
  title_ja: string | null
  role_a: string
  role_b: string
  difficulty: CEFRLevel
  context_zh: string | null
  context_en: string | null
  context_ja: string | null
  conversation: DialogueTurn[]
  variations: DialogueTurn[][]
  full_audio_url: string | null
  duration_seconds: number | null
  sort_order: number
  is_active: boolean
}

export interface UserDialogueProgress {
  id: string
  user_id: string
  dialogue_id: string
  dialogue?: Dialogue
  status: DialogueStatus
  listen_count: number
  practice_count: number
  best_score: number | null
  best_pronunciation_score: number | null
  first_practiced_at: string | null
  last_practiced_at: string | null
  completed_at: string | null
}

// ============================================
// 練習與評估
// ============================================

export type ExerciseType =
  | 'vocabulary_recall'
  | 'vocabulary_recognize'
  | 'pattern_fill'
  | 'listening_comprehension'
  | 'speaking_response'
  | 'role_play'
  | 'creative_scenario'
  | 'shadowing'

export interface Exercise {
  id: string
  scenario_id: string | null
  topic_id: string | null
  exercise_type: ExerciseType
  question_data: Record<string, unknown>
  correct_answer: Record<string, unknown> | null
  acceptable_answers: Record<string, unknown>[]
  difficulty: number
  points: number
  tags: string[]
  sort_order: number
  is_active: boolean
}

export interface PronunciationAssessment {
  accuracy_score: number
  fluency_score: number
  prosody_score: number
  words: {
    word: string
    accuracy: number
    error_type: string | null
  }[]
}

export interface ExerciseResult {
  id: string
  user_id: string
  exercise_id: string
  session_id: string | null
  user_answer: Record<string, unknown> | null
  is_correct: boolean | null
  score: number | null
  pronunciation_assessment: PronunciationAssessment | null
  feedback_given: string | null
  time_spent_seconds: number | null
  attempt_number: number
  created_at: string
}

// ============================================
// 遊戲化
// ============================================

export type BadgeType = 'streak' | 'vocabulary' | 'scenario' | 'special' | 'seasonal'
export type BadgeRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'

export interface Badge {
  id: string
  code: string
  name_zh: string
  name_en: string | null
  name_ja: string | null
  description_zh: string | null
  description_en: string | null
  badge_type: BadgeType
  rarity: BadgeRarity
  icon_url: string | null
  criteria: {
    type: string
    [key: string]: unknown
  }
  xp_reward: number
  sort_order: number
  is_active: boolean
}

export interface UserBadge {
  id: string
  user_id: string
  badge_id: string
  badge?: Badge
  earned_at: string
  is_displayed: boolean
  display_order: number | null
}

export interface LearningSession {
  id: string
  user_id: string
  goal_id: string | null
  scenario_id: string | null
  session_type: SessionType | null
  started_at: string
  ended_at: string | null
  duration_seconds: number | null
  xp_earned: number
  vocabulary_reviewed: number
  vocabulary_learned: number
  exercises_completed: number
  correct_count: number
  incorrect_count: number
  device_type: string | null
  app_version: string | null
}

// ============================================
// 每日任務
// ============================================

export interface DailyTask {
  id: string
  task_type: string
  name_zh: string
  name_en: string | null
  description_zh: string | null
  description_en: string | null
  target_value: number
  xp_reward: number
  difficulty: 'easy' | 'normal' | 'hard'
  weight: number
  prerequisites: Record<string, unknown>
  is_active: boolean
}

export interface UserDailyTask {
  id: string
  user_id: string
  task_id: string
  task?: DailyTask
  task_date: string
  current_value: number
  target_value: number
  status: 'active' | 'completed' | 'expired'
  completed_at: string | null
  reward_claimed: boolean
  reward_claimed_at: string | null
}

// ============================================
// 統計
// ============================================

export interface TodayStats {
  xp_earned: number
  minutes_studied: number
  words_learned: number
  words_reviewed: number
  streak_maintained: boolean
  goal_achieved: boolean
}

export interface UserLearningStats {
  total_xp: number
  current_streak: number
  longest_streak: number
  words_learned: number
  words_reviewing: number
  words_mastered: number
  due_today: number
}

// ============================================
// API 請求/回應類型
// ============================================

export interface CreateProfileRequest {
  display_name?: string
  gender?: string
  role_id?: string
  target_language: TargetLanguage
  daily_goal_minutes?: number
  daily_goal_xp?: number
  reminder_enabled?: boolean
  reminder_time?: string
}

export interface CreateGoalRequest {
  scenario_id: string
  target_date: string
  priority?: number
  trip_id?: string
}

export interface RecordReviewRequest {
  vocabulary_id: string
  rating: FSRSRating
}

export interface StartSessionRequest {
  session_type: SessionType
  goal_id?: string
  scenario_id?: string
}

// ============================================
// 完整詞彙項目 (含進度)
// ============================================

export interface VocabularyWithProgress extends Vocabulary {
  progress?: UserVocabularyProgress
  japanese_data?: VocabularyJapaneseData
  contexts?: VocabularyContext[]
}

// ============================================
// 學習卡片 (用於複習介面)
// ============================================

export interface ReviewCard {
  vocabulary: VocabularyWithProgress
  showAnswer: boolean
}
