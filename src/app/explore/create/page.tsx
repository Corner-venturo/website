'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import BadgeNotification, { BADGES } from '@/components/BadgeNotification';

// 桌面版 Header 組件
function DesktopHeader() {
  return (
    <header className="flex-shrink-0 flex items-center justify-between py-4 px-8 bg-white/80 backdrop-blur-2xl rounded-2xl border border-white/50 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.06)] mb-6">
      <div className="flex items-center gap-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#D6CDC8] text-white font-bold flex items-center justify-center">V</div>
          <span className="text-xl font-bold text-[#5C5C5C]">VENTURO</span>
        </Link>
        <nav className="flex items-center gap-8 ml-12">
          <Link href="/" className="text-[#949494] hover:text-[#5C5C5C] transition">首頁</Link>
          <Link href="/explore" className="text-[#94A3B8] font-medium border-b-2 border-[#94A3B8] pb-1">探索</Link>
          <Link href="/orders" className="text-[#949494] hover:text-[#5C5C5C] transition">訂單</Link>
          <Link href="/wishlist" className="text-[#949494] hover:text-[#5C5C5C] transition">收藏</Link>
        </nav>
      </div>
      <div className="flex items-center gap-4">
        <Link href="/my" className="flex items-center gap-3 px-4 py-2 bg-white/60 rounded-full border border-white/40 hover:bg-white/80 transition">
          <div className="w-8 h-8 rounded-full bg-[#D6CDC8] text-white font-bold text-sm flex items-center justify-center">
            旅
          </div>
          <span className="text-sm font-medium text-[#5C5C5C]">我的</span>
        </Link>
      </div>
    </header>
  );
}

const palette = {
  primary: '#Cfb9a5',
  primaryDark: '#b09b88',
  primaryLight: '#E8DED4',
  morandiBlue: '#A5BCCF',
  morandiPink: '#CFA5A5',
  morandiGreen: '#A8BFA6',
  morandiYellow: '#E0D6A8',
};

const categories = [
  { id: 'food', label: '美食', icon: 'local_dining' },
  { id: 'photo', label: '攝影', icon: 'photo_camera' },
  { id: 'outdoor', label: '戶外', icon: 'hiking' },
  { id: 'party', label: '派對', icon: 'celebration' },
];

const genderOptions = [
  { id: 'all', label: '不限', default: true },
  { id: 'male', label: '限男生' },
  { id: 'female', label: '限女生' },
];

function StepIndicator({ step, onChange }: { step: number; onChange: (value: number) => void }) {
  const steps = [
    { id: 1, label: '基本資訊' },
    { id: 2, label: '時間地點' },
    { id: 3, label: '進階設定' },
  ];

  return (
    <div className="mx-4 mt-6 mb-2">
      <div className="flex items-center justify-between relative">
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-gray-200 -z-10" />
        {steps.map((item) => {
          const isActive = item.id === step;
          const isComplete = item.id < step;
          const circleStyle = {
            backgroundColor: isComplete
              ? palette.primaryLight
              : isActive
                ? palette.primary
                : undefined,
            borderColor: isComplete || isActive ? palette.primary : undefined,
            color: isActive || isComplete ? '#ffffff' : undefined,
            boxShadow: isActive ? '0 10px 20px rgba(207, 185, 165, 0.3)' : undefined,
          } as const;

          return (
            <button
              type="button"
              key={item.id}
              onClick={() => onChange(item.id)}
              className={`flex flex-col items-center gap-1.5 relative z-10 group cursor-pointer ${
                isActive ? '' : 'opacity-50'
              } ${isComplete ? 'opacity-100' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-4 border-[#F0EEE6] shadow-lg ${isActive ? 'scale-110' : ''} ${
                  isActive || isComplete ? '' : 'bg-white border-2 border-gray-200 text-gray-400'
                }`}
                style={circleStyle}
              >
                {isComplete ? <span className="material-icons-round text-base">check</span> : item.id}
              </div>
              <span
                className={`text-[10px] tracking-wider uppercase ${
                  isActive
                    ? 'font-bold'
                    : isComplete
                      ? ''
                      : 'text-gray-500'
                }`}
                style={{ color: isActive || isComplete ? palette.primary : undefined }}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function BasicInfoStep() {
  const [selectedCategory, setSelectedCategory] = useState<string>('food');

  return (
    <div className="space-y-6">
      {/* 1. 活動名稱 - 最上面 */}
      <div>
        <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">活動名稱</label>
        <input
          type="text"
          placeholder="例如：週五晚間爵士音樂會"
          className="w-full rounded-2xl border-none bg-white py-3.5 px-4 text-sm shadow-sm placeholder-gray-300 focus:ring-2 focus:ring-[rgba(207,185,165,0.5)] text-gray-800"
        />
      </div>

      {/* 2. 活動類別 */}
      <div>
        <label className="block text-xs font-bold text-gray-500 mb-2 ml-1">活動類別</label>
        <div className="flex flex-wrap gap-2.5">
          {categories.map((category) => {
            const isSelected = selectedCategory === category.id;
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-xl text-xs font-medium border shadow-sm transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#Cfb9a5] text-white border-[#Cfb9a5] shadow-[0_4px_12px_rgba(207,185,165,0.3)]'
                    : 'bg-white text-gray-600 border-gray-100 hover:border-[#Cfb9a5]/50'
                }`}
              >
                <span className="material-icons-round text-sm">{category.icon}</span>
                {category.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. 活動封面 */}
      <div>
        <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3 px-1">
          <span className="material-icons-round text-[#Cfb9a5] text-base">image</span>
          活動封面
        </label>
        <div className="w-full h-52 rounded-2xl bg-white border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 transition-colors cursor-pointer relative overflow-hidden group shadow-sm hover:border-[#Cfb9a5] hover:text-[#Cfb9a5]"
          style={{ borderColor: 'rgba(207,185,165,0.5)' }}
        >
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: 'rgba(207,185,165,0.05)' }} />
          <span className="material-icons-round text-4xl mb-2 group-hover:scale-110 transition-transform">add_photo_alternate</span>
          <span className="text-xs font-medium tracking-wide">點擊上傳精彩照片</span>
        </div>
      </div>

      {/* 4. 活動描述 */}
      <div>
        <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">活動描述</label>
        <textarea
          rows={4}
          placeholder="請簡單介紹活動內容、行程安排與注意事項..."
          className="w-full rounded-2xl border-none bg-white py-3.5 px-4 text-sm shadow-sm placeholder-gray-300 focus:ring-2 focus:ring-[rgba(207,185,165,0.5)] text-gray-800 resize-none leading-relaxed"
        />
      </div>
    </div>
  );
}

function TimeLocationStep() {
  return (
    <>
      <div className="mb-8 animate-[fadeIn_0.5s_ease-out]">
        <h2 className="text-sm font-bold text-gray-800 mb-4 px-1 flex items-center gap-2">
          <span className="material-icons-round text-morandi-blue">schedule</span>
          活動時間
        </h2>
        <div className="bg-white rounded-3xl p-5 shadow-sm space-y-6 relative overflow-hidden">
          <div className="absolute left-[29px] top-[45px] bottom-[45px] w-0.5 bg-gray-100" />

          {[{ label: '開始時間', tagColor: 'bg-morandi-green' }, { label: '結束時間', tagColor: 'bg-morandi-pink' }].map((item) => (
            <div className="relative z-10" key={item.label}>
              <label className="text-xs font-medium text-gray-400 mb-1.5 block ml-10">{item.label}</label>
              <div className="flex items-center gap-4">
                <div className={`w-3 h-3 rounded-full ${item.tagColor} ring-4 ring-white shadow-sm shrink-0`} />
                <div className="relative flex-1">
                  <input type="datetime-local" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                  <div className="w-full text-left rounded-2xl p-3 flex items-center justify-between group transition-all cursor-pointer" style={{ backgroundColor: '#F7F5F2' }}>
                    <div>
                      <div className="text-sm font-bold text-gray-800 tracking-wide">2023年 11月 12日</div>
                      <div className="text-xs text-gray-500 mt-0.5">{item.label === '開始時間' ? '週六上午 10:00' : '週六下午 16:00'}</div>
                    </div>
                    <span className="material-icons-round text-gray-400 group-hover:text-[var(--primary)] transition-colors">edit_calendar</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6 animate-[fadeIn_0.6s_ease-out]">
        <h2 className="text-sm font-bold text-gray-800 mb-4 px-1 flex items-center gap-2">
          <span className="material-icons-round text-[#A8BFA6]">place</span>
          活動地點
        </h2>
        <div className="space-y-4">
          {/* 地點名稱 */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5 ml-1">地點名稱</label>
            <div className="relative">
              <span className="material-icons-round absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">store</span>
              <input
                type="text"
                placeholder="例如：台北 101、信義威秀"
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl border-none bg-white text-sm text-gray-800 placeholder-gray-300 shadow-sm focus:ring-2 focus:ring-[rgba(207,185,165,0.5)]"
              />
            </div>
          </div>

          {/* 詳細地址 */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5 ml-1">詳細地址</label>
            <div className="relative">
              <span className="material-icons-round absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">location_on</span>
              <input
                type="text"
                placeholder="例如：台北市信義區信義路五段7號"
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl border-none bg-white text-sm text-gray-800 placeholder-gray-300 shadow-sm focus:ring-2 focus:ring-[rgba(207,185,165,0.5)]"
              />
            </div>
          </div>

          {/* 提示 */}
          <div className="flex items-start gap-2 p-3 bg-[#A8BFA6]/10 rounded-xl">
            <span className="material-icons-round text-[#A8BFA6] text-lg mt-0.5">info</span>
            <p className="text-xs text-gray-500 leading-relaxed">
              請填寫明確的集合地點，方便參加者找到位置。地圖選點功能即將推出！
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

function AdvancedSettingsStep() {
  const [memberCount, setMemberCount] = useState(4);
  const [selectedGender, setSelectedGender] = useState('all');
  const [requireApproval, setRequireApproval] = useState(true);
  const [isPrivate, setIsPrivate] = useState(false);

  return (
    <>
      <div className="mb-6 animate-[fadeIn_0.5s_ease-out]">
        <h2 className="text-sm font-bold text-gray-800 mb-4 px-1 flex items-center gap-2">
          <span className="material-icons-round text-[#A5BCCD]">group</span>
          參加設定
        </h2>
        <div className="bg-white rounded-3xl p-5 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-bold text-gray-800">活動人數</label>
              <p className="text-xs text-gray-400 mt-1">包含主辦人</p>
            </div>
            <div className="flex items-center gap-4 bg-[#F7F5F2] p-1.5 rounded-xl">
              <button
                type="button"
                onClick={() => setMemberCount(Math.max(2, memberCount - 1))}
                className="w-8 h-8 rounded-lg bg-white shadow-sm text-gray-600 flex items-center justify-center hover:text-[#Cfb9a5] active:scale-95 transition-all"
              >
                <span className="material-icons-round text-sm">remove</span>
              </button>
              <span className="text-base font-bold text-gray-800 w-6 text-center">{memberCount}</span>
              <button
                type="button"
                onClick={() => setMemberCount(Math.min(50, memberCount + 1))}
                className="w-8 h-8 rounded-lg bg-white shadow-sm text-gray-600 flex items-center justify-center hover:text-[#Cfb9a5] active:scale-95 transition-all"
              >
                <span className="material-icons-round text-sm">add</span>
              </button>
            </div>
          </div>
          <div className="h-px bg-gray-100 w-full" />
          <div className="flex flex-col gap-3">
            <label className="text-sm font-bold text-gray-800">性別限制</label>
            <div className="flex bg-[#F7F5F2] p-1 rounded-xl">
              {genderOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setSelectedGender(option.id)}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                    selectedGender === option.id
                      ? 'bg-white shadow-sm text-[#Cfb9a5]'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6 animate-[fadeIn_0.6s_ease-out]">
        <h2 className="text-sm font-bold text-gray-800 mb-4 px-1 flex items-center gap-2">
          <span className="material-icons-round text-[#CFA5A5]">verified_user</span>
          權限管理
        </h2>
        <div className="bg-white rounded-3xl p-5 shadow-sm space-y-6">
          {/* 加入審核 */}
          <div>
            <div className="flex items-center justify-between">
              <div className="pr-4">
                <label className="text-sm font-bold text-gray-800">加入審核</label>
                <p className="text-xs text-gray-400 mt-1">需經主辦人同意才可加入</p>
              </div>
              <button
                type="button"
                onClick={() => setRequireApproval(!requireApproval)}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  requireApproval ? 'bg-[#Cfb9a5]' : 'bg-gray-200'
                }`}
              >
                <div
                  className={`absolute top-[2px] left-[2px] w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    requireApproval ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
            <div className="h-px bg-gray-100 w-full mt-6" />
          </div>

          {/* 私密活動 */}
          <div>
            <div className="flex items-center justify-between">
              <div className="pr-4">
                <label className="text-sm font-bold text-gray-800">私密活動</label>
                <p className="text-xs text-gray-400 mt-1">活動將不會顯示在雷達地圖上</p>
              </div>
              <button
                type="button"
                onClick={() => setIsPrivate(!isPrivate)}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  isPrivate ? 'bg-[#Cfb9a5]' : 'bg-gray-200'
                }`}
              >
                <div
                  className={`absolute top-[2px] left-[2px] w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    isPrivate ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6 animate-[fadeIn_0.7s_ease-out]">
        <h2 className="text-sm font-bold text-gray-800 mb-4 px-1 flex items-center gap-2">
          <span className="material-icons-round text-[#E0D6A8]">payments</span>
          費用與標籤
        </h2>
        <div className="bg-white rounded-3xl p-5 shadow-sm space-y-5">
          <div>
            <label className="text-xs font-medium text-gray-400 mb-2 block ml-1">預估每人費用</label>
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
              <input
                type="number"
                placeholder="0"
                className="w-full bg-[#F7F5F2] rounded-2xl py-3 pl-8 pr-12 text-sm font-bold text-gray-800 border-none focus:ring-2 focus:ring-[rgba(207,185,165,0.5)] transition-all placeholder-gray-300"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">TWD</span>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-400 mb-2 block ml-1">活動標籤</label>
            <div className="flex flex-wrap gap-2">
              {['#美食探店', '#攝影', '#新手友善'].map((tag, index) => (
                <span
                  key={tag}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold cursor-pointer transition-colors ${
                    index === 0
                      ? 'bg-[rgba(207,185,165,0.1)] text-[var(--primary)] border border-[rgba(207,185,165,0.2)]'
                      : 'bg-[#F7F5F2] text-gray-500 border border-transparent hover:border-gray-200'
                  }`}
                >
                  {tag}
                </span>
              ))}
              <button className="w-7 h-7 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center hover:bg-gray-200 transition-colors">
                <span className="material-icons-round text-sm">add</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function CreateExplorePage() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [showBadge, setShowBadge] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);

  const isFirstStep = step === 1;
  const isLastStep = step === 3;

  const nextLabel = useMemo(() => {
    if (step === 1) return '下一步：時間地點';
    if (step === 2) return '下一步：進階設定';
    return '確認發布';
  }, [step]);

  const handleSaveDraft = () => {
    setIsSavingDraft(true);
    // TODO: 實際的 API 呼叫儲存草稿
    setTimeout(() => {
      setIsSavingDraft(false);
      setDraftSaved(true);
      setTimeout(() => setDraftSaved(false), 2000);
    }, 800);
  };

  const handleNext = () => {
    if (isLastStep) {
      // 發布活動
      setIsSubmitting(true);
      // TODO: 實際的 API 呼叫
      setTimeout(() => {
        setIsSubmitting(false);
        // 顯示徽章獲得通知
        setShowBadge(true);
      }, 1000);
    } else {
      setStep((prev) => Math.min(prev + 1, 3));
    }
  };

  const handleBadgeClose = () => {
    setShowBadge(false);
    // 之後可以 redirect 到活動頁面
    // router.push('/explore');
  };

  const stepContent = useMemo(() => {
    if (step === 1) return <BasicInfoStep />;
    if (step === 2) return <TimeLocationStep />;
    return <AdvancedSettingsStep />;
  }, [step]);

  return (
    <div className="bg-[#F0EEE6] font-sans antialiased text-gray-900 transition-colors duration-300 min-h-screen relative">
      {/* 背景光暈 */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[#EFEFE8]" />
        <div className="absolute top-[-10%] left-[20%] w-40 h-[120%] bg-white -rotate-12 opacity-60" />
        <div className="absolute top-[10%] left-[5%] w-64 h-64 rounded-full blur-3xl" style={{ backgroundColor: 'rgba(168,191,166,0.2)' }} />
        <div className="absolute bottom-[20%] right-[10%] w-80 h-80 rounded-full blur-3xl" style={{ backgroundColor: 'rgba(165,188,207,0.2)' }} />
        <div className="absolute top-[40%] left-[-10%] w-56 h-56 rounded-full blur-3xl" style={{ backgroundColor: 'rgba(224,214,168,0.2)' }} />
      </div>

      {/* ========== 電腦版佈局 ========== */}
      <div className="hidden xl:flex relative z-10 min-h-screen flex-col p-6">
        <DesktopHeader />

        <div className="flex-1 grid grid-cols-12 gap-6">
          {/* 左側 - 步驟指示 + 預覽 */}
          <div className="col-span-4 space-y-5">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-lg border border-white/50 sticky top-6">
              <div className="flex items-center gap-3 mb-6">
                <Link
                  href="/explore"
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:text-primary transition-colors"
                >
                  <span className="material-icons-round text-xl">arrow_back</span>
                </Link>
                <h1 className="text-2xl font-bold text-gray-800">創立活動</h1>
              </div>

              {/* 步驟指示器 - 垂直版 */}
              <div className="space-y-4 mb-6">
                {[
                  { id: 1, label: '基本資訊', desc: '活動名稱與描述' },
                  { id: 2, label: '時間地點', desc: '設定活動時間與地點' },
                  { id: 3, label: '進階設定', desc: '人數限制與其他設定' },
                ].map((item) => {
                  const isActive = item.id === step;
                  const isComplete = item.id < step;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setStep(item.id)}
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-left ${
                        isActive
                          ? 'bg-primary/10 border-2 border-primary/30'
                          : isComplete
                            ? 'bg-green-50 border border-green-200'
                            : 'bg-gray-50 border border-transparent hover:border-gray-200'
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                          isActive
                            ? 'bg-primary text-white'
                            : isComplete
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-200 text-gray-500'
                        }`}
                      >
                        {isComplete ? <span className="material-icons-round text-lg">check</span> : item.id}
                      </div>
                      <div>
                        <div className={`font-bold ${isActive ? 'text-primary' : isComplete ? 'text-green-700' : 'text-gray-600'}`}>
                          {item.label}
                        </div>
                        <div className="text-xs text-gray-400">{item.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={handleSaveDraft}
                disabled={isSavingDraft}
                className="w-full py-3 rounded-xl bg-white border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span className="material-icons-round text-lg">{draftSaved ? 'check' : 'save'}</span>
                {isSavingDraft ? '儲存中...' : draftSaved ? '已儲存！' : '儲存草稿'}
              </button>
            </div>
          </div>

          {/* 右側 - 表單內容 */}
          <div className="col-span-8">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-lg border border-white/50 min-h-[calc(100vh-180px)]">
              <div className="max-w-2xl mx-auto">
                {stepContent}
              </div>

              {/* 底部按鈕 */}
              <div className="max-w-2xl mx-auto mt-8 pt-6 border-t border-gray-100 flex justify-between items-center">
                <button
                  onClick={() => setStep((prev) => Math.max(prev - 1, 1))}
                  className={`px-6 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition flex items-center gap-2 ${step === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={step === 1}
                >
                  <span className="material-icons-round text-lg">arrow_back</span>
                  上一步
                </button>
                <button
                  onClick={handleNext}
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-[#Cfb9a5] text-white font-bold rounded-xl shadow-lg shadow-[#Cfb9a5]/30 flex items-center gap-2 hover:bg-[#b09b88] transition disabled:opacity-50"
                >
                  {isSubmitting ? '發布中...' : nextLabel}
                  <span className="material-icons-round text-lg">{isLastStep ? 'check_circle' : 'arrow_forward'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========== 手機版佈局 ========== */}
      <div className="xl:hidden h-[100dvh] overflow-hidden flex flex-col relative z-10">
        <header className="relative z-50 px-5 pt-12 pb-2">
          <div className="flex items-center justify-between mb-4">
            <Link href="/explore" className="w-10 h-10 rounded-full glass flex items-center justify-center text-gray-600 hover:text-[var(--primary)] transition-colors shadow-sm">
              <span className="material-icons-round">arrow_back_ios_new</span>
            </Link>
            <h1 className="text-lg font-bold text-gray-800 tracking-wide">創立活動</h1>
            <button
              onClick={handleSaveDraft}
              disabled={isSavingDraft}
              className="px-4 py-1.5 rounded-full border border-[rgba(207,185,165,0.3)] text-[#Cfb9a5] text-sm font-medium transition-colors disabled:opacity-50"
            >
              {isSavingDraft ? '儲存中...' : draftSaved ? '已儲存 ✓' : '存草稿'}
            </button>
          </div>
          <StepIndicator step={step} onChange={setStep} />
        </header>

        <main className="relative z-10 flex-1 overflow-y-auto hide-scrollbar pb-32 px-5 pt-2">
          {stepContent}
          {isFirstStep ? (
            <>
              <div className="relative py-8 flex items-center justify-center">
                <div className="w-full h-px bg-gray-200" />
                <span className="absolute bg-[#F0EEE6] px-3 text-xs text-gray-400 font-medium">接下來</span>
              </div>
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 ml-1">時間設定</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button className="flex items-center gap-3 bg-white p-3 rounded-2xl shadow-sm text-left hover:ring-2 hover:ring-[rgba(207,185,165,0.3)] transition-all">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-morandi-yellow shrink-0"
                        style={{ backgroundColor: 'rgba(224,214,168,0.2)' }}
                      >
                        <span className="material-icons-round">calendar_today</span>
                      </div>
                      <div>
                        <div className="text-[10px] text-gray-400">日期</div>
                        <div className="text-sm font-bold text-gray-700">2023/10/28</div>
                      </div>
                    </button>
                    <button className="flex items-center gap-3 bg-white p-3 rounded-2xl shadow-sm text-left hover:ring-2 hover:ring-[rgba(207,185,165,0.3)] transition-all">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-morandi-blue shrink-0"
                        style={{ backgroundColor: 'rgba(165,188,207,0.2)' }}
                      >
                        <span className="material-icons-round">schedule</span>
                      </div>
                      <div>
                        <div className="text-[10px] text-gray-400">時間</div>
                        <div className="text-sm font-bold text-gray-700">14:30</div>
                      </div>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 px-1">集合地點</label>
                  <div className="space-y-3">
                    <div className="relative">
                      <span className="material-icons-round absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">store</span>
                      <input
                        type="text"
                        placeholder="地點名稱（如：台北車站）"
                        className="w-full pl-10 pr-4 py-3 rounded-2xl border-none bg-white text-sm shadow-sm placeholder-gray-300 focus:ring-2 focus:ring-[rgba(207,185,165,0.5)]"
                      />
                    </div>
                    <div className="relative">
                      <span className="material-icons-round absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">location_on</span>
                      <input
                        type="text"
                        placeholder="詳細地址"
                        className="w-full pl-10 pr-4 py-3 rounded-2xl border-none bg-white text-sm shadow-sm placeholder-gray-300 focus:ring-2 focus:ring-[rgba(207,185,165,0.5)]"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">每人費用</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-serif italic text-lg">$</span>
                      <input
                        type="number"
                        placeholder="0"
                        className="w-full rounded-2xl border-none bg-white py-3 pl-8 pr-4 text-sm font-bold shadow-sm focus:ring-2 focus:ring-[rgba(207,185,165,0.5)] text-gray-800"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">預計人數</label>
                    <div className="flex items-center bg-white rounded-2xl p-1 shadow-sm h-[46px]">
                      <button className="w-10 h-full flex items-center justify-center text-primary hover:bg-gray-100 rounded-xl transition-colors">
                        <span className="material-icons-round">remove</span>
                      </button>
                      <input
                        type="text"
                        defaultValue="4"
                        className="flex-1 w-full bg-transparent border-none text-center p-0 text-gray-700 font-bold focus:ring-0 text-sm"
                      />
                      <button className="w-10 h-full flex items-center justify-center text-primary hover:bg-gray-100 rounded-xl transition-colors">
                        <span className="material-icons-round">add</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </main>

        <div className="fixed bottom-0 inset-x-0 p-5 bg-gradient-to-t from-[#F0EEE6] via-[#F0EEE6] to-transparent z-50 pt-10">
          <button
            onClick={handleNext}
            disabled={isSubmitting}
            className="w-full bg-[#Cfb9a5] text-white font-bold py-4 rounded-3xl shadow-[0_12px_30px_rgba(207,185,165,0.3)] flex items-center justify-center gap-2 active:scale-95 transition-transform hover:bg-[#b09b88] disabled:opacity-50"
          >
            {isSubmitting ? '發布中...' : nextLabel}
            <span className="material-icons-round text-sm">{isLastStep ? 'check_circle' : 'arrow_forward'}</span>
          </button>
        </div>
      </div>

      {/* 徽章獲得通知 */}
      <BadgeNotification
        badge={BADGES.group_newbie}
        isOpen={showBadge}
        onClose={handleBadgeClose}
      />
    </div>
  );
}
