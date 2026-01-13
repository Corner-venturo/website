'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth-store';
import {
  useTravelCardsStore,
  CATEGORY_LABELS,
  CATEGORY_ICONS,
  CATEGORY_ORDER,
  TravelCardTemplate,
} from '@/stores/travel-cards-store';

export default function TravelCardsPage() {
  const { user, initialize, isInitialized } = useAuthStore();
  const {
    templates,
    templatesLoading,
    myCards,
    myCardsLoading,
    displayLanguage,
    fetchTemplates,
    fetchMyCards,
    addCard,
    removeCard,
    setDisplayLanguage,
  } = useTravelCardsStore();

  const [activeCategory, setActiveCategory] = useState<string>('dietary');
  const [isAdding, setIsAdding] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 初始化
  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [initialize, isInitialized]);

  // 載入資料
  useEffect(() => {
    fetchTemplates();
    if (user?.id) {
      fetchMyCards(user.id);
    }
  }, [fetchTemplates, fetchMyCards, user?.id]);

  // 已選擇的模板 ID 集合
  const selectedTemplateIds = useMemo(() => {
    return new Set(myCards.map(c => c.template_id).filter(Boolean));
  }, [myCards]);

  // 按類別分組的模板
  const templatesByCategory = useMemo(() => {
    const grouped: Record<string, TravelCardTemplate[]> = {};
    for (const template of templates) {
      if (!grouped[template.category]) {
        grouped[template.category] = [];
      }
      grouped[template.category].push(template);
    }
    return grouped;
  }, [templates]);

  // 當前類別的模板
  const currentTemplates = templatesByCategory[activeCategory] || [];

  // 處理添加/移除小卡
  const handleToggleCard = async (template: TravelCardTemplate) => {
    if (!user?.id) return;

    setIsAdding(template.id);

    if (selectedTemplateIds.has(template.id)) {
      // 找到對應的 card 並移除
      const card = myCards.find(c => c.template_id === template.id);
      if (card) {
        const result = await removeCard(card.id);
        if (!result.success) {
          setMessage({ type: 'error', text: result.error || '移除失敗' });
        }
      }
    } else {
      // 添加
      const result = await addCard(user.id, template.id);
      if (!result.success) {
        setMessage({ type: 'error', text: result.error || '新增失敗' });
      } else {
        setMessage({ type: 'success', text: '已加入我的小卡' });
      }
    }

    setIsAdding(null);

    // 清除訊息
    if (message) {
      setTimeout(() => setMessage(null), 2000);
    }
  };

  const languages = [
    { code: 'ja' as const, label: '日本語', flag: '🇯🇵' },
    { code: 'en' as const, label: 'English', flag: '🇺🇸' },
    { code: 'ko' as const, label: '한국어', flag: '🇰🇷' },
    { code: 'th' as const, label: 'ไทย', flag: '🇹🇭' },
  ];

  return (
    <div className="bg-[#F0EEE6] font-sans antialiased text-[#5C5C5C] min-h-screen flex flex-col">
      {/* 背景光暈 */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute -top-[5%] -left-[15%] w-[500px] h-[500px] bg-[#D8D0C9] opacity-40 blur-[90px] rounded-full" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[450px] h-[450px] bg-[#C8D6D3] opacity-40 blur-[90px] rounded-full" />
      </div>

      {/* Header */}
      <header className="px-5 pt-4 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/my/settings"
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/60 backdrop-blur-xl border border-white/50 shadow-sm text-[#5C5C5C] hover:text-[#94A3B8] transition-colors"
          >
            <span className="material-icons-round text-xl">arrow_back</span>
          </Link>
          <h1 className="text-xl font-bold text-[#5C5C5C]">旅遊便利小卡</h1>
        </div>

        {/* 展示按鈕 */}
        {myCards.length > 0 && (
          <Link
            href="/my/travel-cards/show"
            className="px-4 py-2 rounded-full bg-[#94A3B8] text-white text-sm font-bold shadow-lg shadow-[#94A3B8]/30 hover:shadow-xl transition-shadow flex items-center gap-2"
          >
            <span className="material-icons-round text-sm">visibility</span>
            展示 ({myCards.length})
          </Link>
        )}
      </header>

      {/* Message Toast */}
      {message && (
        <div className={`mx-5 mb-4 p-3 rounded-xl text-sm text-center transition-all ${
          message.type === 'success'
            ? 'bg-green-100 text-green-700'
            : 'bg-red-100 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      {/* 語言選擇 */}
      <div className="px-5 mb-4">
        <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/50 shadow-sm p-4">
          <div className="text-xs text-[#949494] mb-3">翻譯語言</div>
          <div className="flex gap-2">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setDisplayLanguage(lang.code)}
                className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-all ${
                  displayLanguage === lang.code
                    ? 'bg-[#94A3B8] text-white shadow-md'
                    : 'bg-white/60 text-[#5C5C5C] hover:bg-white/80'
                }`}
              >
                <span className="mr-1">{lang.flag}</span>
                {lang.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 類別選擇 */}
      <div className="px-5 mb-4 overflow-x-auto no-scrollbar">
        <div className="flex gap-2 pb-2">
          {CATEGORY_ORDER.map((cat) => {
            const count = templatesByCategory[cat]?.length || 0;
            if (count === 0) return null;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                  activeCategory === cat
                    ? 'bg-[#5C5C5C] text-white shadow-md'
                    : 'bg-white/60 text-[#5C5C5C] hover:bg-white/80 border border-white/50'
                }`}
              >
                {CATEGORY_ICONS[cat]} {CATEGORY_LABELS[cat]}
                <span className="ml-1 text-xs opacity-60">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 模板列表 */}
      <main className="flex-1 px-5 pb-8 overflow-y-auto">
        {templatesLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#94A3B8]"></div>
          </div>
        ) : (
          <div className="space-y-3">
            {currentTemplates.map((template) => {
              const isSelected = selectedTemplateIds.has(template.id);
              const isProcessing = isAdding === template.id;
              const translation = template.translations[displayLanguage] || template.translations.en || '';

              return (
                <button
                  key={template.id}
                  onClick={() => handleToggleCard(template)}
                  disabled={isProcessing || myCardsLoading}
                  className={`w-full p-4 rounded-2xl border transition-all text-left ${
                    isSelected
                      ? 'bg-[#94A3B8]/10 border-[#94A3B8]/30'
                      : 'bg-white/60 border-white/50 hover:bg-white/80'
                  } ${isProcessing ? 'opacity-50' : ''}`}
                >
                  <div className="flex items-start gap-4">
                    {/* 圖示 */}
                    <div className="text-3xl flex-shrink-0">{template.icon}</div>

                    {/* 內容 */}
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-[#5C5C5C] text-lg mb-1">
                        {template.label_zh}
                      </div>
                      <div className="text-sm text-[#949494]">
                        {translation}
                      </div>
                    </div>

                    {/* 選取狀態 */}
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isSelected
                        ? 'bg-[#94A3B8] text-white'
                        : 'bg-[#E8E2DD] text-[#949494]'
                    }`}>
                      {isProcessing ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                      ) : isSelected ? (
                        <span className="material-icons-round text-sm">check</span>
                      ) : (
                        <span className="material-icons-round text-sm">add</span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* 已選擇的小卡預覽 */}
        {myCards.length > 0 && (
          <div className="mt-8">
            <div className="text-sm font-bold text-[#5C5C5C] mb-3 flex items-center gap-2">
              <span className="material-icons-round text-lg">bookmark</span>
              我的小卡 ({myCards.length})
            </div>
            <div className="flex flex-wrap gap-2">
              {myCards.map((card) => {
                const icon = card.template?.icon || card.icon || '📌';
                const label = card.template?.label_zh || card.label_zh || '';
                return (
                  <div
                    key={card.id}
                    className="px-3 py-2 rounded-xl bg-[#94A3B8]/10 border border-[#94A3B8]/20 text-sm"
                  >
                    <span className="mr-1">{icon}</span>
                    {label}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 使用說明 */}
        <div className="mt-8 p-4 rounded-2xl bg-[#C8D6D3]/20 border border-[#C8D6D3]/30">
          <div className="text-sm font-bold text-[#5C5C5C] mb-2 flex items-center gap-2">
            <span className="material-icons-round text-lg">help_outline</span>
            使用方式
          </div>
          <ol className="text-sm text-[#949494] space-y-2 list-decimal list-inside">
            <li>選擇你需要的小卡（飲食限制、過敏、需求等）</li>
            <li>點擊右上角「展示」進入展示模式</li>
            <li>向左右滑動切換不同的小卡</li>
            <li>將手機展示給當地人看即可溝通！</li>
          </ol>
        </div>
      </main>

      {/* 底部固定展示按鈕（當沒有小卡時顯示提示） */}
      {myCards.length === 0 && !templatesLoading && (
        <div className="px-5 pb-8">
          <div className="text-center text-sm text-[#949494] py-4">
            請選擇至少一張小卡以開始使用
          </div>
        </div>
      )}
    </div>
  );
}
