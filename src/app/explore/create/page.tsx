'use client';

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import BadgeNotification, { BADGES } from '@/components/BadgeNotification';
import { useGroupStore, CreateGroupData } from '@/stores/group-store';
import { useAuthStore } from '@/stores/auth-store';

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
  { id: 'all', label: '不限' },
  { id: 'male', label: '限男生' },
  { id: 'female', label: '限女生' },
];

// Form Data Interface
interface FormData {
  title: string;
  description: string;
  category: string;
  coverImage: File | null;
  coverImagePreview: string;
  locationName: string;
  locationAddress: string;
  startDateTime: Date;
  endDateTime: Date;
  memberCount: number;
  genderLimit: string;
  requireApproval: boolean;
  isPrivate: boolean;
  estimatedCost: string;
  tags: string[];
}

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

interface BasicInfoStepProps {
  formData: FormData;
  onChange: (data: Partial<FormData>) => void;
}

function BasicInfoStep({ formData, onChange }: BasicInfoStepProps) {
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange({
          coverImage: file,
          coverImagePreview: reader.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. 活動名稱 - 最上面 */}
      <div>
        <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">活動名稱</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="例如：週五晚間爵士音樂會"
          className="w-full rounded-2xl border-none bg-white py-3.5 px-4 text-sm shadow-sm placeholder-gray-300 focus:ring-2 focus:ring-[rgba(207,185,165,0.5)] text-gray-800"
        />
      </div>

      {/* 2. 活動類別 */}
      <div>
        <label className="block text-xs font-bold text-gray-500 mb-2 ml-1">活動類別</label>
        <div className="flex flex-wrap gap-2.5">
          {categories.map((category) => {
            const isSelected = formData.category === category.id;
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => onChange({ category: category.id })}
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
        <label className="block cursor-pointer">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
          <div
            className="w-full h-52 rounded-2xl bg-white border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 transition-colors relative overflow-hidden group shadow-sm hover:border-[#Cfb9a5] hover:text-[#Cfb9a5]"
            style={{ borderColor: formData.coverImagePreview ? 'transparent' : 'rgba(207,185,165,0.5)' }}
          >
            {formData.coverImagePreview ? (
              <>
                <img src={formData.coverImagePreview} alt="封面預覽" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white text-sm font-medium">點擊更換照片</span>
                </div>
              </>
            ) : (
              <>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: 'rgba(207,185,165,0.05)' }} />
                <span className="material-icons-round text-4xl mb-2 group-hover:scale-110 transition-transform">add_photo_alternate</span>
                <span className="text-xs font-medium tracking-wide">點擊上傳精彩照片</span>
              </>
            )}
          </div>
        </label>
      </div>

      {/* 4. 活動描述 */}
      <div>
        <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">活動描述</label>
        <textarea
          rows={4}
          value={formData.description}
          onChange={(e) => onChange({ description: e.target.value })}
          placeholder="請簡單介紹活動內容、行程安排與注意事項..."
          className="w-full rounded-2xl border-none bg-white py-3.5 px-4 text-sm shadow-sm placeholder-gray-300 focus:ring-2 focus:ring-[rgba(207,185,165,0.5)] text-gray-800 resize-none leading-relaxed"
        />
      </div>
    </div>
  );
}

interface TimeLocationStepProps {
  formData: FormData;
  onChange: (data: Partial<FormData>) => void;
}

function TimeLocationStep({ formData, onChange }: TimeLocationStepProps) {
  // 格式化日期時間給 input
  const formatForInput = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const mins = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${mins}`;
  };

  // 格式化顯示
  const formatDisplay = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekdays = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'];
    const weekday = weekdays[date.getDay()];
    const hours = date.getHours();
    const mins = String(date.getMinutes()).padStart(2, '0');
    const period = hours < 12 ? '上午' : '下午';
    const displayHour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;

    return {
      date: `${year}年 ${month}月 ${day}日`,
      time: `${weekday}${period} ${displayHour}:${mins}`,
    };
  };

  // 取得現在的最小值
  const getMinDateTime = () => {
    const now = new Date();
    return formatForInput(now);
  };

  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStart = new Date(e.target.value);
    onChange({ startDateTime: newStart });
    // 如果開始時間超過結束時間，自動調整結束時間
    if (newStart >= formData.endDateTime) {
      const newEnd = new Date(newStart);
      newEnd.setHours(newEnd.getHours() + 3);
      onChange({ endDateTime: newEnd });
    }
  };

  const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEnd = new Date(e.target.value);
    if (newEnd > formData.startDateTime) {
      onChange({ endDateTime: newEnd });
    }
  };

  const startDisplay = formatDisplay(formData.startDateTime);
  const endDisplay = formatDisplay(formData.endDateTime);

  return (
    <>
      <div className="mb-8 animate-[fadeIn_0.5s_ease-out]">
        <h2 className="text-sm font-bold text-gray-800 mb-4 px-1 flex items-center gap-2">
          <span className="material-icons-round text-morandi-blue">schedule</span>
          活動時間
        </h2>
        <div className="bg-white rounded-3xl p-5 shadow-sm space-y-6 relative overflow-hidden">
          <div className="absolute left-[29px] top-[45px] bottom-[45px] w-0.5 bg-gray-100" />

          {/* 開始時間 */}
          <div className="relative z-10">
            <label className="text-xs font-medium text-gray-400 mb-1.5 block ml-10">開始時間</label>
            <div className="flex items-center gap-4">
              <div className="w-3 h-3 rounded-full bg-morandi-green ring-4 ring-white shadow-sm shrink-0" />
              <label className="relative flex-1 cursor-pointer">
                <input
                  type="datetime-local"
                  value={formatForInput(formData.startDateTime)}
                  min={getMinDateTime()}
                  onChange={handleStartChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  style={{ colorScheme: 'light' }}
                />
                <div className="w-full text-left rounded-2xl p-3 flex items-center justify-between group transition-all" style={{ backgroundColor: '#F7F5F2' }}>
                  <div>
                    <div className="text-sm font-bold text-gray-800 tracking-wide">{startDisplay.date}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{startDisplay.time}</div>
                  </div>
                  <span className="material-icons-round text-gray-400 group-hover:text-[var(--primary)] transition-colors">edit_calendar</span>
                </div>
              </label>
            </div>
          </div>

          {/* 結束時間 */}
          <div className="relative z-10">
            <label className="text-xs font-medium text-gray-400 mb-1.5 block ml-10">結束時間</label>
            <div className="flex items-center gap-4">
              <div className="w-3 h-3 rounded-full bg-morandi-pink ring-4 ring-white shadow-sm shrink-0" />
              <label className="relative flex-1 cursor-pointer">
                <input
                  type="datetime-local"
                  value={formatForInput(formData.endDateTime)}
                  min={formatForInput(formData.startDateTime)}
                  onChange={handleEndChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  style={{ colorScheme: 'light' }}
                />
                <div className="w-full text-left rounded-2xl p-3 flex items-center justify-between group transition-all" style={{ backgroundColor: '#F7F5F2' }}>
                  <div>
                    <div className="text-sm font-bold text-gray-800 tracking-wide">{endDisplay.date}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{endDisplay.time}</div>
                  </div>
                  <span className="material-icons-round text-gray-400 group-hover:text-[var(--primary)] transition-colors">edit_calendar</span>
                </div>
              </label>
            </div>
          </div>
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
                value={formData.locationName}
                onChange={(e) => onChange({ locationName: e.target.value })}
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
                value={formData.locationAddress}
                onChange={(e) => onChange({ locationAddress: e.target.value })}
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

interface AdvancedSettingsStepProps {
  formData: FormData;
  onChange: (data: Partial<FormData>) => void;
}

function AdvancedSettingsStep({ formData, onChange }: AdvancedSettingsStepProps) {
  const [showPrivateWarning, setShowPrivateWarning] = useState(false);

  // TODO: 從用戶資料取得實名狀態
  const isVerified = false; // 假設目前未實名

  const handlePrivateToggle = () => {
    if (!isVerified && !formData.isPrivate) {
      setShowPrivateWarning(true);
      setTimeout(() => setShowPrivateWarning(false), 3000);
    } else {
      onChange({ isPrivate: !formData.isPrivate });
    }
  };

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
                onClick={() => onChange({ memberCount: Math.max(2, formData.memberCount - 1) })}
                className="w-8 h-8 rounded-lg bg-white shadow-sm text-gray-600 flex items-center justify-center hover:text-[#Cfb9a5] active:scale-95 transition-all"
              >
                <span className="material-icons-round text-sm">remove</span>
              </button>
              <span className="text-base font-bold text-gray-800 w-6 text-center">{formData.memberCount}</span>
              <button
                type="button"
                onClick={() => onChange({ memberCount: Math.min(50, formData.memberCount + 1) })}
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
                  onClick={() => onChange({ genderLimit: option.id })}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                    formData.genderLimit === option.id
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
                onClick={() => onChange({ requireApproval: !formData.requireApproval })}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  formData.requireApproval ? 'bg-[#Cfb9a5]' : 'bg-gray-200'
                }`}
              >
                <div
                  className={`absolute top-[2px] left-[2px] w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    formData.requireApproval ? 'translate-x-5' : 'translate-x-0'
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
                onClick={handlePrivateToggle}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  formData.isPrivate ? 'bg-[#Cfb9a5]' : 'bg-gray-200'
                }`}
              >
                <div
                  className={`absolute top-[2px] left-[2px] w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    formData.isPrivate ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
            {/* 實名認證提示 */}
            {showPrivateWarning && (
              <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2 animate-[fadeIn_0.2s_ease-out]">
                <span className="material-icons-round text-amber-500 text-lg mt-0.5">warning</span>
                <div>
                  <p className="text-sm font-medium text-amber-700">需要實名認證</p>
                  <p className="text-xs text-amber-600 mt-0.5">只有實名會員才能創立私密活動</p>
                </div>
              </div>
            )}
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
                value={formData.estimatedCost}
                onChange={(e) => onChange({ estimatedCost: e.target.value })}
                placeholder="0"
                className="w-full bg-[#F7F5F2] rounded-2xl py-3 pl-8 pr-12 text-sm font-bold text-gray-800 border-none focus:ring-2 focus:ring-[rgba(207,185,165,0.5)] transition-all placeholder-gray-300"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">TWD</span>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-400 mb-2 block ml-1">活動標籤</label>
            <div className="flex flex-wrap gap-2">
              {['#美食探店', '#攝影', '#新手友善'].map((tag) => {
                const isSelected = formData.tags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        onChange({ tags: formData.tags.filter(t => t !== tag) });
                      } else {
                        onChange({ tags: [...formData.tags, tag] });
                      }
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-[rgba(207,185,165,0.1)] text-[#Cfb9a5] border border-[rgba(207,185,165,0.2)]'
                        : 'bg-[#F7F5F2] text-gray-500 border border-transparent hover:border-gray-200'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function CreateExplorePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { createGroup, isLoading: isCreating } = useGroupStore();

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showBadge, setShowBadge] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // 初始化預設日期時間
  const getDefaultDateTime = (hoursOffset: number) => {
    const d = new Date();
    d.setHours(d.getHours() + hoursOffset, 0, 0, 0);
    return d;
  };

  // 表單資料狀態
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    category: 'food',
    coverImage: null,
    coverImagePreview: '',
    locationName: '',
    locationAddress: '',
    startDateTime: getDefaultDateTime(2),
    endDateTime: getDefaultDateTime(5),
    memberCount: 4,
    genderLimit: 'all',
    requireApproval: true,
    isPrivate: false,
    estimatedCost: '',
    tags: [],
  });

  const updateFormData = (data: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  // 檢查用戶登入狀態
  useEffect(() => {
    if (!user) {
      router.push('/login?redirect=/explore/create');
    }
  }, [user, router]);

  // 取得預設的今天日期和時間（用於手機版預覽）
  const getDefaultPreview = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = now.getHours() + 2;
    const displayHour = hours > 12 ? hours - 12 : hours;
    const period = hours < 12 ? '上午' : '下午';
    return {
      date: `${year}/${month}/${day}`,
      time: `${period} ${displayHour}:00`,
    };
  }, []);

  const isFirstStep = step === 1;
  const isLastStep = step === 3;

  const nextLabel = useMemo(() => {
    if (step === 1) return '下一步：時間地點';
    if (step === 2) return '下一步：進階設定';
    return '確認發布';
  }, [step]);

  const handleNext = async () => {
    if (isLastStep) {
      // 驗證必填欄位
      if (!formData.title.trim()) {
        setSubmitError('請輸入活動名稱');
        setStep(1);
        return;
      }

      if (!user) {
        setSubmitError('請先登入');
        return;
      }

      setIsSubmitting(true);
      setSubmitError(null);

      try {
        // 格式化日期
        const eventDate = formData.startDateTime.toISOString().split('T')[0];
        const startTime = formData.startDateTime.toTimeString().slice(0, 5);
        const endTime = formData.endDateTime.toTimeString().slice(0, 5);

        console.log('Creating group with user:', user.id);

        const groupData: CreateGroupData = {
          title: formData.title,
          description: formData.description || undefined,
          category: formData.category,
          location_name: formData.locationName || undefined,
          location_address: formData.locationAddress || undefined,
          event_date: eventDate,
          start_time: startTime,
          end_time: endTime,
          max_members: formData.memberCount,
          gender_limit: formData.genderLimit,
          require_approval: formData.requireApproval,
          is_private: formData.isPrivate,
          estimated_cost: formData.estimatedCost ? parseFloat(formData.estimatedCost) : undefined,
          tags: formData.tags,
        };

        // TODO: 如果有封面圖片，先上傳到 storage
        // if (formData.coverImage) {
        //   const coverUrl = await uploadCoverImage(formData.coverImage);
        //   groupData.cover_image = coverUrl;
        // }

        const result = await createGroup(user.id, groupData);

        if (result.success) {
          setShowBadge(true);
        } else {
          setSubmitError(result.error || '創建失敗，請稍後再試');
        }
      } catch (error) {
        console.error('Create group error:', error);
        setSubmitError('創建失敗，請稍後再試');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setStep((prev) => Math.min(prev + 1, 3));
    }
  };

  const handleBadgeClose = () => {
    setShowBadge(false);
    router.push('/explore');
  };

  const stepContent = useMemo(() => {
    if (step === 1) return <BasicInfoStep formData={formData} onChange={updateFormData} />;
    if (step === 2) return <TimeLocationStep formData={formData} onChange={updateFormData} />;
    return <AdvancedSettingsStep formData={formData} onChange={updateFormData} />;
  }, [step, formData]);

  // 如果沒登入，顯示載入中
  if (!user) {
    return (
      <div className="min-h-screen bg-[#F0EEE6] flex items-center justify-center">
        <div className="text-gray-500">載入中...</div>
      </div>
    );
  }

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
            </div>
          </div>

          {/* 右側 - 表單內容 */}
          <div className="col-span-8">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-lg border border-white/50 min-h-[calc(100vh-180px)]">
              <div className="max-w-2xl mx-auto">
                {stepContent}
              </div>

              {/* 錯誤提示 */}
              {submitError && (
                <div className="max-w-2xl mx-auto mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-600">
                  <span className="material-icons-round text-lg">error</span>
                  <span className="text-sm">{submitError}</span>
                </div>
              )}

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
                  disabled={isSubmitting || isCreating}
                  className="px-8 py-3 bg-[#Cfb9a5] text-white font-bold rounded-xl shadow-lg shadow-[#Cfb9a5]/30 flex items-center gap-2 hover:bg-[#b09b88] transition disabled:opacity-50"
                >
                  {isSubmitting || isCreating ? '發布中...' : nextLabel}
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
            <div className="w-10" />
          </div>
          <StepIndicator step={step} onChange={setStep} />
        </header>

        <main className="relative z-10 flex-1 overflow-y-auto hide-scrollbar pb-32 px-5 pt-2">
          {stepContent}

          {/* 錯誤提示 */}
          {submitError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-600">
              <span className="material-icons-round text-lg">error</span>
              <span className="text-sm">{submitError}</span>
            </div>
          )}

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
                        <div className="text-sm font-bold text-gray-700">{getDefaultPreview.date}</div>
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
                        <div className="text-sm font-bold text-gray-700">{getDefaultPreview.time}</div>
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
                        value={formData.locationName}
                        onChange={(e) => updateFormData({ locationName: e.target.value })}
                        placeholder="地點名稱（如：台北車站）"
                        className="w-full pl-10 pr-4 py-3 rounded-2xl border-none bg-white text-sm shadow-sm placeholder-gray-300 focus:ring-2 focus:ring-[rgba(207,185,165,0.5)]"
                      />
                    </div>
                    <div className="relative">
                      <span className="material-icons-round absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">location_on</span>
                      <input
                        type="text"
                        value={formData.locationAddress}
                        onChange={(e) => updateFormData({ locationAddress: e.target.value })}
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
                        value={formData.estimatedCost}
                        onChange={(e) => updateFormData({ estimatedCost: e.target.value })}
                        placeholder="0"
                        className="w-full rounded-2xl border-none bg-white py-3 pl-8 pr-4 text-sm font-bold shadow-sm focus:ring-2 focus:ring-[rgba(207,185,165,0.5)] text-gray-800"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">預計人數</label>
                    <div className="flex items-center bg-white rounded-2xl p-1 shadow-sm h-[46px]">
                      <button
                        type="button"
                        onClick={() => updateFormData({ memberCount: Math.max(2, formData.memberCount - 1) })}
                        className="w-10 h-full flex items-center justify-center text-primary hover:bg-gray-100 rounded-xl transition-colors"
                      >
                        <span className="material-icons-round">remove</span>
                      </button>
                      <input
                        type="text"
                        value={formData.memberCount}
                        readOnly
                        className="flex-1 w-full bg-transparent border-none text-center p-0 text-gray-700 font-bold focus:ring-0 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => updateFormData({ memberCount: Math.min(50, formData.memberCount + 1) })}
                        className="w-10 h-full flex items-center justify-center text-primary hover:bg-gray-100 rounded-xl transition-colors"
                      >
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
            disabled={isSubmitting || isCreating}
            className="w-full bg-[#Cfb9a5] text-white font-bold py-4 rounded-3xl shadow-[0_12px_30px_rgba(207,185,165,0.3)] flex items-center justify-center gap-2 active:scale-95 transition-transform hover:bg-[#b09b88] disabled:opacity-50"
          >
            {isSubmitting || isCreating ? '發布中...' : nextLabel}
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
