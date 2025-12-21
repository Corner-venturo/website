'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useTripStore, SplitGroupMember } from '@/stores/trip-store';

export default function SplitRecordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const groupId = searchParams.get('groupId');

  const { currentSplitGroup, fetchSplitGroupById, isLoading } = useTripStore();

  const [amount, setAmount] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<string>('other');
  const [paidBy, setPaidBy] = useState<string>('');
  const [splitWith, setSplitWith] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 模擬用戶 ID
  const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') || '' : '';

  // 載入群組資料
  useEffect(() => {
    if (groupId && userId) {
      fetchSplitGroupById(groupId, userId);
    }
  }, [groupId, userId, fetchSplitGroupById]);

  // 設定預設值
  useEffect(() => {
    if (currentSplitGroup && userId) {
      setPaidBy(userId);
      // 預設分帳給所有成員
      const allMemberIds = currentSplitGroup.members?.map(m => m.user_id) || [];
      setSplitWith(allMemberIds);
    }
  }, [currentSplitGroup, userId]);

  const members = currentSplitGroup?.members || [];

  const toggleSplitWith = (memberId: string) => {
    setSplitWith(prev =>
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleSubmit = async () => {
    if (!amount || !title || !paidBy || splitWith.length === 0) {
      alert('請填寫必要欄位');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupId,
          title,
          description,
          category,
          amount: parseFloat(amount),
          paidBy,
          splitWith,
        }),
      });

      const result = await response.json();

      if (result.success) {
        router.push(`/split/${groupId}`);
      } else {
        alert(result.error || '新增失敗');
      }
    } catch {
      alert('系統錯誤');
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = [
    { id: 'food', icon: 'restaurant', label: '餐飲' },
    { id: 'transport', icon: 'directions_car', label: '交通' },
    { id: 'accommodation', icon: 'hotel', label: '住宿' },
    { id: 'shopping', icon: 'shopping_bag', label: '購物' },
    { id: 'ticket', icon: 'confirmation_number', label: '門票' },
    { id: 'other', icon: 'more_horiz', label: '其他' },
  ];

  if (!groupId) {
    return (
      <div className="min-h-[100dvh] bg-[#F0EEE6] flex items-center justify-center">
        <p className="text-gray-500">請從分帳群組進入此頁面</p>
      </div>
    );
  }

  return (
    <main className="bg-[#F0EEE6] text-gray-900 min-h-screen font-sans relative overflow-hidden">
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[#F0EEE6]" />
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-[#A5BCCF]/20 rounded-full blur-[80px]" />
        <div className="absolute bottom-[10%] left-[-10%] w-80 h-80 bg-[#CFA5A5]/20 rounded-full blur-[80px]" />
      </div>

      <div className="relative z-10 max-w-xl mx-auto flex flex-col min-h-screen">
        {/* Header */}
        <header className="px-6 pt-14 pb-4 flex items-center justify-between">
          <Link
            href={`/split/${groupId}`}
            className="w-10 h-10 rounded-full bg-white/60 backdrop-blur-xl border border-white/50 flex items-center justify-center text-[#5C5C5C] shadow-sm"
          >
            <span className="material-icons-round text-xl">close</span>
          </Link>
          <h1 className="text-lg font-bold text-[#5C5C5C]">
            {currentSplitGroup?.name || '新增費用'}
          </h1>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !amount || !title}
            className="w-10 h-10 rounded-full bg-[#Cfb9a5] flex items-center justify-center text-white shadow-sm disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="material-icons-round animate-spin text-xl">sync</span>
            ) : (
              <span className="material-icons-round text-xl">check</span>
            )}
          </button>
        </header>

        <div className="flex-1 px-5 pb-32 space-y-6 overflow-y-auto">
          {/* 金額輸入 */}
          <section className="bg-white/60 backdrop-blur-xl border border-white/50 rounded-[2rem] p-6 flex flex-col items-center space-y-4">
            <div className="flex flex-col items-center w-full">
              <label className="text-xs font-semibold text-[#Cfb9a5] uppercase tracking-wider mb-1">
                金額
              </label>
              <div className="flex items-baseline gap-2 relative">
                <span className="text-3xl font-medium text-[#949494] absolute -left-6 top-2">$</span>
                <input
                  className="bg-transparent border-none p-0 text-6xl font-bold text-center w-64 focus:ring-0 placeholder-gray-200 text-[#5C5C5C]"
                  placeholder="0"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
            </div>
            <input
              className="w-full bg-white/50 border-none rounded-2xl py-4 px-4 text-center text-base font-medium placeholder-[#949494] text-[#5C5C5C] focus:ring-2 focus:ring-[#Cfb9a5]/30"
              placeholder="輸入項目名稱 (例如: 晚餐)"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </section>

          {/* 類別選擇 */}
          <section>
            <h2 className="text-sm font-bold text-[#5C5C5C] mb-3 px-2 flex items-center gap-2">
              <span className="w-1 h-5 rounded-full bg-[#A5BCCF] block" />
              類別
            </h2>
            <div className="flex gap-2 overflow-x-auto pb-2 px-1">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`flex flex-col items-center gap-1 px-4 py-3 rounded-xl shrink-0 transition-all ${
                    category === cat.id
                      ? 'bg-[#Cfb9a5] text-white'
                      : 'bg-white/60 text-gray-600'
                  }`}
                >
                  <span className="material-icons-round">{cat.icon}</span>
                  <span className="text-xs font-medium">{cat.label}</span>
                </button>
              ))}
            </div>
          </section>

          {/* 付款人選擇 */}
          <section>
            <h2 className="text-sm font-bold text-[#5C5C5C] mb-3 px-2 flex items-center gap-2">
              <span className="w-1 h-5 rounded-full bg-[#Cfb9a5] block" />
              誰付的錢?
            </h2>
            <div className="bg-white/60 backdrop-blur-xl border border-white/50 rounded-[2rem] p-5">
              <div className="flex gap-4 overflow-x-auto pb-2 px-1">
                {members.map((member) => {
                  const isPayer = paidBy === member.user_id;
                  return (
                    <button
                      key={member.user_id}
                      onClick={() => setPaidBy(member.user_id)}
                      className={`flex flex-col items-center gap-2 shrink-0 ${
                        isPayer ? '' : 'opacity-60 hover:opacity-100'
                      }`}
                    >
                      <div
                        className={`relative w-16 h-16 rounded-full p-1 border-2 transition-all ${
                          isPayer
                            ? 'border-[#Cfb9a5] shadow-lg shadow-[#Cfb9a5]/20 bg-white'
                            : 'border-transparent'
                        }`}
                      >
                        {member.user?.avatar_url ? (
                          <img
                            src={member.user.avatar_url}
                            alt=""
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full rounded-full bg-gradient-to-br from-[#Cfb9a5] to-[#B8A090] flex items-center justify-center">
                            <span className="material-icons-round text-white text-2xl">person</span>
                          </div>
                        )}
                        {isPayer && (
                          <div className="absolute -top-1 -right-1 bg-[#Cfb9a5] text-white rounded-full p-1 border-2 border-white">
                            <span className="material-icons-round text-xs">credit_card</span>
                          </div>
                        )}
                      </div>
                      <span className={isPayer ? 'text-sm font-bold text-[#5C5C5C]' : 'text-sm text-[#949494]'}>
                        {member.user_id === userId ? '我' : member.user?.display_name || '成員'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* 分帳成員 */}
          <section>
            <h2 className="text-sm font-bold text-[#5C5C5C] mb-3 px-2 flex items-center gap-2">
              <span className="w-1 h-5 rounded-full bg-[#A5BCCF] block" />
              分帳給誰?
            </h2>
            <div className="bg-white/60 backdrop-blur-xl border border-white/50 rounded-[2rem] p-5 space-y-3">
              {members.map((member) => {
                const isSelected = splitWith.includes(member.user_id);
                return (
                  <button
                    key={member.user_id}
                    onClick={() => toggleSplitWith(member.user_id)}
                    className={`w-full p-3 rounded-xl border flex items-center gap-3 transition-all ${
                      isSelected
                        ? 'border-[#A5BCCF] bg-[#A5BCCF]/10'
                        : 'border-gray-200 bg-white/50'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full overflow-hidden">
                      {member.user?.avatar_url ? (
                        <img src={member.user.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#Cfb9a5] to-[#B8A090] flex items-center justify-center">
                          <span className="material-icons-round text-white">person</span>
                        </div>
                      )}
                    </div>
                    <span className="flex-1 text-left font-medium text-gray-800">
                      {member.user_id === userId ? '我' : member.user?.display_name || '成員'}
                    </span>
                    <span className={`material-icons-round ${isSelected ? 'text-[#A5BCCF]' : 'text-gray-300'}`}>
                      {isSelected ? 'check_circle' : 'radio_button_unchecked'}
                    </span>
                  </button>
                );
              })}
              {splitWith.length > 0 && (
                <p className="text-xs text-gray-500 text-center pt-2">
                  每人分攤: ${amount ? (parseFloat(amount) / splitWith.length).toFixed(0) : 0}
                </p>
              )}
            </div>
          </section>

          {/* 備註 */}
          <section>
            <div className="bg-white/60 backdrop-blur-xl border border-white/50 rounded-2xl p-4">
              <label className="block text-xs font-semibold text-[#949494] mb-2 uppercase">
                備註
              </label>
              <textarea
                className="w-full bg-white/50 border-none rounded-xl p-3 text-sm text-[#5C5C5C] placeholder-[#949494] focus:ring-1 focus:ring-[#Cfb9a5]/50 resize-none"
                placeholder="添加備註..."
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
