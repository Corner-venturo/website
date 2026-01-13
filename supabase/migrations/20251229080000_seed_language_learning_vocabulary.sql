-- ============================================
-- Language Learning System - Seed Data
-- Migration: 009 - Initial Vocabulary for Core Scenarios
-- ============================================

-- ============================================
-- 餐廳訂位情境詞彙
-- ============================================
DO $$
DECLARE
    v_scenario_id UUID;
    v_vocab_id UUID;
BEGIN
    -- 取得餐廳訂位情境 ID
    SELECT id INTO v_scenario_id FROM learning_scenarios WHERE code = 'restaurant_booking';

    -- 如果情境存在，插入詞彙
    IF v_scenario_id IS NOT NULL THEN
        -- 1. 預約
        INSERT INTO vocabulary (word_ja, reading_hiragana, reading_romaji, word_zh, word_en, part_of_speech, jlpt_level, cefr_level, mnemonic_zh, frequency_rank)
        VALUES ('予約', 'よやく', 'yoyaku', '預約', 'reservation', 'noun', 'N4', 'A2', '預（よ）約（やく）- 發音接近「要訂約」', 5)
        RETURNING id INTO v_vocab_id;

        INSERT INTO vocabulary_contexts (vocabulary_id, scenario_id, example_sentence_ja, example_sentence_zh, formality_level)
        VALUES (v_vocab_id, v_scenario_id, '予約をお願いしたいのですが。', '我想要預約。', 'polite');

        INSERT INTO vocabulary_japanese_data (vocabulary_id, word_ja, reading_hiragana, jlpt_level, politeness_level)
        VALUES (v_vocab_id, '予約', 'よやく', 'N4', 'polite');

        -- 2. 名様/位
        INSERT INTO vocabulary (word_ja, reading_hiragana, reading_romaji, word_zh, word_en, part_of_speech, jlpt_level, cefr_level, mnemonic_zh, frequency_rank)
        VALUES ('名様', 'めいさま', 'meisama', '位（敬語）', 'person (honorific)', 'counter', 'N3', 'A2', '名（めい）樣（さま）- 對客人的尊稱', 5)
        RETURNING id INTO v_vocab_id;

        INSERT INTO vocabulary_contexts (vocabulary_id, scenario_id, example_sentence_ja, example_sentence_zh, formality_level)
        VALUES (v_vocab_id, v_scenario_id, '何名様ですか？', '請問幾位？', 'formal');

        -- 3. 席
        INSERT INTO vocabulary (word_ja, reading_hiragana, reading_romaji, word_zh, word_en, part_of_speech, jlpt_level, cefr_level, frequency_rank)
        VALUES ('席', 'せき', 'seki', '座位', 'seat', 'noun', 'N4', 'A2', 5)
        RETURNING id INTO v_vocab_id;

        INSERT INTO vocabulary_contexts (vocabulary_id, scenario_id, example_sentence_ja, example_sentence_zh, formality_level)
        VALUES (v_vocab_id, v_scenario_id, '窓際の席をお願いできますか？', '可以給我靠窗的座位嗎？', 'polite');

        -- 4. 時間
        INSERT INTO vocabulary (word_ja, reading_hiragana, reading_romaji, word_zh, word_en, part_of_speech, jlpt_level, cefr_level, frequency_rank)
        VALUES ('時間', 'じかん', 'jikan', '時間', 'time', 'noun', 'N5', 'A1', 5)
        RETURNING id INTO v_vocab_id;

        INSERT INTO vocabulary_contexts (vocabulary_id, scenario_id, example_sentence_ja, example_sentence_zh, formality_level)
        VALUES (v_vocab_id, v_scenario_id, '何時に予約したいですか？', '您想預約幾點？', 'polite');

        -- 5. 満席
        INSERT INTO vocabulary (word_ja, reading_hiragana, reading_romaji, word_zh, word_en, part_of_speech, jlpt_level, cefr_level, mnemonic_zh, frequency_rank)
        VALUES ('満席', 'まんせき', 'manseki', '客滿', 'fully booked', 'noun', 'N3', 'B1', '滿（まん）席（せき）- 座位都滿了', 4)
        RETURNING id INTO v_vocab_id;

        INSERT INTO vocabulary_contexts (vocabulary_id, scenario_id, example_sentence_ja, example_sentence_zh, formality_level)
        VALUES (v_vocab_id, v_scenario_id, '申し訳ございませんが、満席です。', '非常抱歉，已經客滿了。', 'formal');

        -- 6. アレルギー
        INSERT INTO vocabulary (word_ja, reading_hiragana, reading_romaji, word_zh, word_en, part_of_speech, jlpt_level, cefr_level, mnemonic_zh, frequency_rank)
        VALUES ('アレルギー', 'あれるぎー', 'arerugii', '過敏', 'allergy', 'noun', 'N3', 'A2', '發音接近英文 allergy', 4)
        RETURNING id INTO v_vocab_id;

        INSERT INTO vocabulary_contexts (vocabulary_id, scenario_id, example_sentence_ja, example_sentence_zh, formality_level)
        VALUES (v_vocab_id, v_scenario_id, '甲殻類のアレルギーがあります。', '我對甲殼類過敏。', 'polite');

        -- 7. ベジタリアン
        INSERT INTO vocabulary (word_ja, reading_hiragana, reading_romaji, word_zh, word_en, part_of_speech, jlpt_level, cefr_level, frequency_rank)
        VALUES ('ベジタリアン', 'べじたりあん', 'bejitarian', '素食者', 'vegetarian', 'noun', 'N2', 'A2', 4)
        RETURNING id INTO v_vocab_id;

        INSERT INTO vocabulary_contexts (vocabulary_id, scenario_id, example_sentence_ja, example_sentence_zh, formality_level)
        VALUES (v_vocab_id, v_scenario_id, 'ベジタリアンメニューはありますか？', '有素食菜單嗎？', 'polite');

        -- 8. メニュー
        INSERT INTO vocabulary (word_ja, reading_hiragana, reading_romaji, word_zh, word_en, part_of_speech, jlpt_level, cefr_level, frequency_rank)
        VALUES ('メニュー', 'めにゅー', 'menyuu', '菜單', 'menu', 'noun', 'N4', 'A1', 5)
        RETURNING id INTO v_vocab_id;

        INSERT INTO vocabulary_contexts (vocabulary_id, scenario_id, example_sentence_ja, example_sentence_zh, formality_level)
        VALUES (v_vocab_id, v_scenario_id, 'メニューをお願いします。', '請給我菜單。', 'polite');

        -- 9. 注文
        INSERT INTO vocabulary (word_ja, reading_hiragana, reading_romaji, word_zh, word_en, part_of_speech, jlpt_level, cefr_level, frequency_rank)
        VALUES ('注文', 'ちゅうもん', 'chuumon', '點餐', 'order', 'noun', 'N4', 'A2', 5)
        RETURNING id INTO v_vocab_id;

        INSERT INTO vocabulary_contexts (vocabulary_id, scenario_id, example_sentence_ja, example_sentence_zh, formality_level)
        VALUES (v_vocab_id, v_scenario_id, 'ご注文はお決まりですか？', '您決定好要點什麼了嗎？', 'formal');

        INSERT INTO vocabulary_japanese_data (vocabulary_id, word_ja, reading_hiragana, jlpt_level, verb_group, verb_conjugations)
        VALUES (v_vocab_id, '注文する', 'ちゅうもんする', 'N4', 'irregular',
            '{"dictionary": "注文する", "masu": "注文します", "te": "注文して", "ta": "注文した", "nai": "注文しない"}'::jsonb);

        -- 10. おすすめ
        INSERT INTO vocabulary (word_ja, reading_hiragana, reading_romaji, word_zh, word_en, part_of_speech, jlpt_level, cefr_level, frequency_rank)
        VALUES ('おすすめ', 'おすすめ', 'osusume', '推薦', 'recommendation', 'noun', 'N3', 'A2', 5)
        RETURNING id INTO v_vocab_id;

        INSERT INTO vocabulary_contexts (vocabulary_id, scenario_id, example_sentence_ja, example_sentence_zh, formality_level)
        VALUES (v_vocab_id, v_scenario_id, '今日のおすすめは何ですか？', '今天的推薦是什麼？', 'polite');

        -- 11-20: 更多餐廳相關詞彙
        INSERT INTO vocabulary (word_ja, reading_hiragana, reading_romaji, word_zh, word_en, part_of_speech, jlpt_level, cefr_level, frequency_rank) VALUES
        ('お会計', 'おかいけい', 'okaikei', '結帳', 'bill/check', 'noun', 'N3', 'A2', 5),
        ('個室', 'こしつ', 'koshitsu', '包廂', 'private room', 'noun', 'N2', 'B1', 4),
        ('禁煙', 'きんえん', 'kinen', '禁菸', 'non-smoking', 'noun', 'N3', 'A2', 4),
        ('喫煙', 'きつえん', 'kitsuen', '吸菸', 'smoking', 'noun', 'N3', 'A2', 4),
        ('飲み物', 'のみもの', 'nomimono', '飲料', 'beverage', 'noun', 'N4', 'A1', 5),
        ('デザート', 'でざーと', 'dezaato', '甜點', 'dessert', 'noun', 'N4', 'A1', 5),
        ('お水', 'おみず', 'omizu', '水', 'water', 'noun', 'N5', 'A1', 5),
        ('お箸', 'おはし', 'ohashi', '筷子', 'chopsticks', 'noun', 'N4', 'A1', 5),
        ('フォーク', 'ふぉーく', 'fooku', '叉子', 'fork', 'noun', 'N4', 'A1', 5),
        ('ナイフ', 'ないふ', 'naifu', '刀子', 'knife', 'noun', 'N4', 'A1', 5);

        -- 更新情境的詞彙數量
        UPDATE learning_scenarios
        SET total_vocabulary = (SELECT COUNT(*) FROM vocabulary_contexts WHERE scenario_id = v_scenario_id)
        WHERE id = v_scenario_id;
    END IF;
END $$;

-- ============================================
-- 基本購物情境詞彙
-- ============================================
DO $$
DECLARE
    v_scenario_id UUID;
    v_vocab_id UUID;
BEGIN
    SELECT id INTO v_scenario_id FROM learning_scenarios WHERE code = 'basic_shopping';

    IF v_scenario_id IS NOT NULL THEN
        INSERT INTO vocabulary (word_ja, reading_hiragana, reading_romaji, word_zh, word_en, part_of_speech, jlpt_level, cefr_level, frequency_rank) VALUES
        ('いくら', 'いくら', 'ikura', '多少錢', 'how much', 'adverb', 'N5', 'A1', 5),
        ('値段', 'ねだん', 'nedan', '價格', 'price', 'noun', 'N4', 'A1', 5),
        ('高い', 'たかい', 'takai', '貴的/高的', 'expensive/high', 'adjective', 'N5', 'A1', 5),
        ('安い', 'やすい', 'yasui', '便宜的', 'cheap', 'adjective', 'N5', 'A1', 5),
        ('買う', 'かう', 'kau', '買', 'to buy', 'verb', 'N5', 'A1', 5),
        ('売る', 'うる', 'uru', '賣', 'to sell', 'verb', 'N4', 'A2', 5),
        ('サイズ', 'さいず', 'saizu', '尺寸', 'size', 'noun', 'N4', 'A1', 5),
        ('色', 'いろ', 'iro', '顏色', 'color', 'noun', 'N5', 'A1', 5),
        ('試着', 'しちゃく', 'shichaku', '試穿', 'fitting/trying on', 'noun', 'N2', 'A2', 4),
        ('現金', 'げんきん', 'genkin', '現金', 'cash', 'noun', 'N3', 'A2', 5),
        ('クレジットカード', 'くれじっとかーど', 'kurejitto kaado', '信用卡', 'credit card', 'noun', 'N3', 'A2', 5),
        ('レシート', 'れしーと', 'reshiito', '收據', 'receipt', 'noun', 'N4', 'A1', 5),
        ('袋', 'ふくろ', 'fukuro', '袋子', 'bag', 'noun', 'N4', 'A1', 5),
        ('お釣り', 'おつり', 'otsuri', '找零', 'change', 'noun', 'N4', 'A2', 5),
        ('割引', 'わりびき', 'waribiki', '折扣', 'discount', 'noun', 'N3', 'A2', 4);

        UPDATE learning_scenarios
        SET total_vocabulary = 15
        WHERE id = v_scenario_id;
    END IF;
END $$;

-- ============================================
-- 問路情境詞彙
-- ============================================
DO $$
DECLARE
    v_scenario_id UUID;
BEGIN
    SELECT id INTO v_scenario_id FROM learning_scenarios WHERE code = 'asking_directions';

    IF v_scenario_id IS NOT NULL THEN
        INSERT INTO vocabulary (word_ja, reading_hiragana, reading_romaji, word_zh, word_en, part_of_speech, jlpt_level, cefr_level, frequency_rank) VALUES
        ('道', 'みち', 'michi', '路/道路', 'road/way', 'noun', 'N4', 'A1', 5),
        ('駅', 'えき', 'eki', '車站', 'station', 'noun', 'N5', 'A1', 5),
        ('右', 'みぎ', 'migi', '右邊', 'right', 'noun', 'N5', 'A1', 5),
        ('左', 'ひだり', 'hidari', '左邊', 'left', 'noun', 'N5', 'A1', 5),
        ('まっすぐ', 'まっすぐ', 'massugu', '直走', 'straight', 'adverb', 'N4', 'A1', 5),
        ('曲がる', 'まがる', 'magaru', '轉彎', 'to turn', 'verb', 'N4', 'A2', 5),
        ('交差点', 'こうさてん', 'kousaten', '十字路口', 'intersection', 'noun', 'N3', 'A2', 4),
        ('信号', 'しんごう', 'shingou', '紅綠燈', 'traffic light', 'noun', 'N3', 'A2', 4),
        ('近く', 'ちかく', 'chikaku', '附近', 'nearby', 'noun', 'N4', 'A1', 5),
        ('遠い', 'とおい', 'tooi', '遠的', 'far', 'adjective', 'N5', 'A1', 5),
        ('歩く', 'あるく', 'aruku', '走路', 'to walk', 'verb', 'N4', 'A1', 5),
        ('地図', 'ちず', 'chizu', '地圖', 'map', 'noun', 'N4', 'A1', 5);

        UPDATE learning_scenarios
        SET total_vocabulary = 12
        WHERE id = v_scenario_id;
    END IF;
END $$;

-- ============================================
-- 插入句型範例
-- ============================================
DO $$
DECLARE
    v_scenario_id UUID;
BEGIN
    SELECT id INTO v_scenario_id FROM learning_scenarios WHERE code = 'restaurant_booking';

    IF v_scenario_id IS NOT NULL THEN
        INSERT INTO sentence_patterns (scenario_id, pattern_ja, pattern_zh, pattern_en, pattern_structure, cefr_level, formality_level, grammar_point, fill_slots) VALUES
        (v_scenario_id, '【日期】の【時間】に【人数】名で予約をお願いします。', '我想預約【日期】【時間】【人數】位。', 'I would like to make a reservation for [number] people on [date] at [time].', 'Date + Time + Number + reservation request', 'A2', 'polite', 'お願いします pattern', '[{"slot": "date", "type": "date", "examples": ["明日", "今週の土曜日"]}, {"slot": "time", "type": "time", "examples": ["7時", "19時"]}, {"slot": "number", "type": "number", "examples": ["2", "4"]}]'::jsonb),
        (v_scenario_id, 'アレルギーがあるのですが、対応できますか？', '我有過敏，可以處理嗎？', 'I have allergies, can you accommodate?', 'Condition + possibility question', 'B1', 'polite', 'のですが pattern', '[]'::jsonb),
        (v_scenario_id, '窓際の席をお願いできますか？', '可以給我靠窗的座位嗎？', 'Could I have a window seat please?', 'Location preference request', 'A2', 'polite', 'お願いできますか pattern', '[]'::jsonb),
        (v_scenario_id, '今日のおすすめは何ですか？', '今天的推薦是什麼？', 'What is today''s recommendation?', 'Today + recommendation question', 'A2', 'polite', 'は何ですか pattern', '[]'::jsonb),
        (v_scenario_id, 'お会計をお願いします。', '請結帳。', 'Check please.', 'Bill request', 'A2', 'polite', 'をお願いします pattern', '[]'::jsonb);

        UPDATE learning_scenarios
        SET total_patterns = 5
        WHERE id = v_scenario_id;
    END IF;
END $$;

-- ============================================
-- 插入對話範例
-- ============================================
DO $$
DECLARE
    v_scenario_id UUID;
BEGIN
    SELECT id INTO v_scenario_id FROM learning_scenarios WHERE code = 'restaurant_booking';

    IF v_scenario_id IS NOT NULL THEN
        INSERT INTO dialogues (scenario_id, title_zh, title_ja, role_a, role_b, difficulty, context_zh, conversation) VALUES
        (v_scenario_id, '電話預約餐廳', '電話でレストランを予約する', 'customer', 'staff', 'A2', '旅客打電話預約明天晚上的餐廳',
        '[
            {"turn": 1, "speaker": "staff", "text_ja": "はい、レストラン花月です。", "text_zh": "您好，這裡是花月餐廳。", "text_en": "Yes, this is Restaurant Kagetsu."},
            {"turn": 2, "speaker": "customer", "text_ja": "予約をお願いしたいのですが。", "text_zh": "我想要預約。", "text_en": "I would like to make a reservation.", "key_phrase": true},
            {"turn": 3, "speaker": "staff", "text_ja": "はい、ありがとうございます。何日のご予約ですか？", "text_zh": "好的，謝謝您。請問預約哪一天？", "text_en": "Yes, thank you. What day would you like to book?"},
            {"turn": 4, "speaker": "customer", "text_ja": "明日の夜7時に4名でお願いします。", "text_zh": "明天晚上7點，4位。", "text_en": "Tomorrow at 7 PM for 4 people please.", "key_phrase": true, "practice_slots": ["date", "time", "number"]},
            {"turn": 5, "speaker": "staff", "text_ja": "かしこまりました。お名前をお願いします。", "text_zh": "好的，請問貴姓大名？", "text_en": "Understood. May I have your name please?"},
            {"turn": 6, "speaker": "customer", "text_ja": "田中です。", "text_zh": "我姓田中。", "text_en": "It is Tanaka."},
            {"turn": 7, "speaker": "staff", "text_ja": "田中様、明日の19時に4名様でご予約承りました。", "text_zh": "田中先生/小姐，已為您預約明天19時4位。", "text_en": "Mr./Ms. Tanaka, I have your reservation for 4 people at 7 PM tomorrow."}
        ]'::jsonb);

        UPDATE learning_scenarios
        SET total_dialogues = 1
        WHERE id = v_scenario_id;
    END IF;
END $$;
