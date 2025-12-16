'use client';

import { useEffect, useMemo, useState } from 'react';

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
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-gray-200 dark:bg-gray-700 -z-10" />
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
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-4 border-[#F0EEE6] dark:border-[#232323] shadow-lg ${isActive ? 'scale-110' : ''} ${
                  isActive || isComplete ? '' : 'bg-white dark:bg-[var(--card-dark)] border-2 border-gray-200 dark:border-gray-600 text-gray-400'
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
                      : 'text-gray-500 dark:text-gray-400'
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
  return (
    <>
      <div className="mb-8">
        <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-200 mb-3 px-1">
          <span className="material-icons-round text-primary text-base">image</span>
          活動封面
        </label>
        <div className="w-full h-52 rounded-2xl bg-white dark:bg-[rgba(30,30,30,0.5)] border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center text-gray-400 transition-colors cursor-pointer relative overflow-hidden group shadow-sm"
          style={{ borderColor: 'rgba(207,185,165,0.5)' }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = palette.primary;
            (e.currentTarget as HTMLElement).style.color = palette.primary;
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(207,185,165,0.5)';
            (e.currentTarget as HTMLElement).style.color = 'inherit';
          }}
        >
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: 'rgba(207,185,165,0.05)' }} />
          <span className="material-icons-round text-4xl mb-2 group-hover:scale-110 transition-transform">add_photo_alternate</span>
          <span className="text-xs font-medium tracking-wide">點擊上傳精彩照片</span>
        </div>
      </div>

      <div className="space-y-5">
        <div className="input-clean">
          <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 ml-1">活動名稱</label>
          <input
            type="text"
            placeholder="例如：週五晚間爵士音樂會"
            className="w-full rounded-2xl border-none bg-white dark:bg-[var(--card-dark)] py-3.5 px-4 text-sm shadow-sm placeholder-gray-300 dark:placeholder-gray-600 focus:ring-2 focus:ring-[rgba(207,185,165,0.5)] text-gray-800 dark:text-gray-100"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 ml-1">活動類別</label>
          <div className="flex flex-wrap gap-2.5">
            {categories.map((category, index) => (
              <label key={category.id} className="cursor-pointer">
                <input type="radio" name="category" defaultChecked={index === 0} className="peer sr-only" />
                <div
                  className="px-4 py-2 rounded-xl bg-white dark:bg-[var(--card-dark)] text-gray-500 dark:text-gray-400 text-xs font-medium border border-transparent shadow-sm transition-all flex items-center gap-1.5 peer-checked:bg-primary peer-checked:text-white peer-checked:shadow-primary-soft"
                >
                  <span className="material-icons-round text-sm">{category.icon}</span> {category.label}
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="input-clean">
          <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 ml-1">活動描述</label>
          <textarea
            rows={4}
            placeholder="請簡單介紹活動內容、行程安排與注意事項..."
            className="w-full rounded-2xl border-none bg-white dark:bg-[var(--card-dark)] py-3.5 px-4 text-sm shadow-sm placeholder-gray-300 dark:placeholder-gray-600 focus:ring-2 focus:ring-[rgba(207,185,165,0.5)] text-gray-800 dark:text-gray-100 resize-none leading-relaxed"
          />
        </div>
      </div>
    </>
  );
}

function TimeLocationStep() {
  return (
    <>
      <div className="mb-8 animate-[fadeIn_0.5s_ease-out]">
        <h2 className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-4 px-1 flex items-center gap-2">
          <span className="material-icons-round text-morandi-blue">schedule</span>
          活動時間
        </h2>
        <div className="bg-white dark:bg-[var(--card-dark)] rounded-3xl p-5 shadow-sm space-y-6 relative overflow-hidden">
          <div className="absolute left-[29px] top-[45px] bottom-[45px] w-0.5 bg-gray-100 dark:bg-gray-700" />

          {[{ label: '開始時間', tagColor: 'bg-morandi-green' }, { label: '結束時間', tagColor: 'bg-morandi-pink' }].map((item) => (
            <div className="relative z-10" key={item.label}>
              <label className="text-xs font-medium text-gray-400 mb-1.5 block ml-10">{item.label}</label>
              <div className="flex items-center gap-4">
                <div className={`w-3 h-3 rounded-full ${item.tagColor} ring-4 ring-white dark:ring-[var(--card-dark)] shadow-sm shrink-0`} />
                <div className="relative flex-1">
                  <input type="datetime-local" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                  <div className="w-full text-left rounded-2xl p-3 flex items-center justify-between group transition-all cursor-pointer" style={{ backgroundColor: '#F7F5F2' }}>
                    <div>
                      <div className="text-sm font-bold text-gray-800 dark:text-gray-200 tracking-wide">2023年 11月 12日</div>
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
        <h2 className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-4 px-1 flex items-center gap-2">
          <span className="material-icons-round text-morandi-green">place</span>
          活動地點
        </h2>
        <div className="space-y-4">
          <div className="relative group">
            <div className="absolute inset-0 bg-white dark:bg-[var(--card-dark)] rounded-2xl shadow-sm transition-transform group-focus-within:-translate-y-1 group-focus-within:shadow-md" />
            <div className="relative flex items-center">
              <span className="material-icons-round absolute left-4 text-gray-400">search</span>
              <input
                type="text"
                placeholder="輸入地址或搜尋地標"
                className="w-full pl-11 pr-4 py-4 rounded-2xl border-none bg-transparent text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:ring-0"
              />
              <button className="absolute right-3 p-1 text-gray-400 hover:text-[var(--primary)] transition-colors">
                <span className="material-icons-round text-xl">my_location</span>
              </button>
            </div>
          </div>

          <div className="w-full aspect-[4/3] rounded-3xl bg-[#E5E0D8] dark:bg-gray-800 bg-map-pattern relative overflow-hidden shadow-sm group cursor-pointer border-2 border-white dark:border-[var(--card-dark)] hover:border-[rgba(207,185,165,0.5)] transition-colors">
            <div className="absolute top-0 right-0 p-4 z-10">
              <div className="bg-white/80 dark:bg-[rgba(30,30,30,0.8)] backdrop-blur-sm p-2 rounded-xl shadow-sm text-gray-600 dark:text-gray-300">
                <span className="material-icons-round text-xl block">layers</span>
              </div>
            </div>

            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10 pointer-events-none">
              <div className="w-20 h-20 rounded-full animate-ping absolute" style={{ backgroundColor: 'rgba(207,185,165,0.2)' }} />
              <div className="relative z-10 transform -translate-y-1/2 transition-transform group-hover:-translate-y-3 duration-300 ease-out">
                <span className="material-icons-round text-5xl drop-shadow-xl filter" style={{ color: palette.primary }}>location_on</span>
              </div>
              <div className="w-4 h-2 bg-black/20 rounded-[50%] blur-[2px] mt-[-10px] group-hover:scale-75 group-hover:opacity-50 transition-all duration-300" />
              <div className="mt-2 bg-white dark:bg-[var(--card-dark)] px-4 py-2 rounded-xl shadow-lg flex flex-col items-center">
                <span className="text-xs font-bold text-gray-700 dark:text-gray-200">台北 101</span>
                <span className="text-[10px] text-gray-400">點擊地圖以更改</span>
              </div>
            </div>

            <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/10 to-transparent">
              <button className="w-full bg-white/95 dark:bg-[rgba(30,30,30,0.95)] backdrop-blur text-primary font-bold py-3.5 rounded-2xl shadow-lg flex items-center justify-center gap-2 hover:bg-[var(--primary)] hover:text-white transition-all active:scale-95">
                <span className="material-icons-round">map</span>
                開啟全螢幕地圖
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function AdvancedSettingsStep() {
  return (
    <>
      <div className="mb-6 animate-[fadeIn_0.5s_ease-out]">
        <h2 className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-4 px-1 flex items-center gap-2">
          <span className="material-icons-round text-morandi-blue">group</span>
          參加設定
        </h2>
        <div className="bg-white dark:bg-[var(--card-dark)] rounded-3xl p-5 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-bold text-gray-800 dark:text-gray-200">活動人數</label>
              <p className="text-xs text-gray-400 mt-1">包含主辦人</p>
            </div>
            <div className="flex items-center gap-4 bg-[#F7F5F2] dark:bg-[rgba(18,18,18,0.5)] p-1.5 rounded-xl">
              <button className="w-8 h-8 rounded-lg bg-white dark:bg-[var(--card-dark)] shadow-sm text-gray-600 dark:text-gray-300 flex items-center justify-center hover:text-[var(--primary)] active:scale-95 transition-all">
                <span className="material-icons-round text-sm">remove</span>
              </button>
              <span className="text-base font-bold text-gray-800 dark:text-gray-100 w-6 text-center">4</span>
              <button className="w-8 h-8 rounded-lg bg-white dark:bg-[var(--card-dark)] shadow-sm text-gray-600 dark:text-gray-300 flex items-center justify-center hover:text-[var(--primary)] active:scale-95 transition-all">
                <span className="material-icons-round text-sm">add</span>
              </button>
            </div>
          </div>
          <div className="h-px bg-gray-100 dark:bg-gray-700/50 w-full" />
          <div className="flex flex-col gap-3">
            <label className="text-sm font-bold text-gray-800 dark:text-gray-200">性別限制</label>
            <div className="flex bg-[#F7F5F2] dark:bg-[rgba(18,18,18,0.5)] p-1 rounded-xl">
              {genderOptions.map((option) => (
                <button
                  key={option.id}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                    option.default
                      ? 'bg-white dark:bg-[var(--card-dark)] shadow-sm text-primary'
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
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
        <h2 className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-4 px-1 flex items-center gap-2">
          <span className="material-icons-round text-morandi-pink">verified_user</span>
          權限管理
        </h2>
        <div className="bg-white dark:bg-[var(--card-dark)] rounded-3xl p-5 shadow-sm space-y-6">
          {[{ label: '加入審核', desc: '需經主辦人同意才可加入', defaultChecked: true }, { label: '私密活動', desc: '活動將不會顯示在雷達地圖上' }].map((item) => (
            <div key={item.label}>
              <div className="flex items-center justify-between">
                <div className="pr-4">
                  <label className="text-sm font-bold text-gray-800 dark:text-gray-200">{item.label}</label>
                  <p className="text-xs text-gray-400 mt-1">{item.desc}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input type="checkbox" defaultChecked={item.defaultChecked} className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary)]" />
                </label>
              </div>
              {item.label === '加入審核' ? <div className="h-px bg-gray-100 dark:bg-gray-700/50 w-full mt-6" /> : null}
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6 animate-[fadeIn_0.7s_ease-out]">
        <h2 className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-4 px-1 flex items-center gap-2">
          <span className="material-icons-round text-morandi-yellow">payments</span>
          費用與標籤
        </h2>
        <div className="bg-white dark:bg-[var(--card-dark)] rounded-3xl p-5 shadow-sm space-y-5">
          <div>
            <label className="text-xs font-medium text-gray-400 mb-2 block ml-1">預估每人費用</label>
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
              <input
                type="number"
                placeholder="0"
                className="w-full bg-[#F7F5F2] dark:bg-[rgba(18,18,18,0.5)] rounded-2xl py-3 pl-8 pr-12 text-sm font-bold text-gray-800 dark:text-gray-100 border-none focus:ring-2 focus:ring-[rgba(207,185,165,0.5)] transition-all placeholder-gray-300"
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
                      : 'bg-[#F7F5F2] dark:bg-[rgba(18,18,18,0.5)] text-gray-500 dark:text-gray-400 border border-transparent hover:border-gray-200 dark:hover:border-gray-700'
                  }`}
                >
                  {tag}
                </span>
              ))}
              <button className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-400 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
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

  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const isFirstStep = step === 1;
  const nextLabel = useMemo(() => {
    if (step === 1) return '下一步：時間地點';
    if (step === 2) return '下一步：進階設定';
    return '確認發布';
  }, [step]);

  const stepContent = useMemo(() => {
    if (step === 1) return <BasicInfoStep />;
    if (step === 2) return <TimeLocationStep />;
    return <AdvancedSettingsStep />;
  }, [step]);

  return (
    <div className="bg-[#F0EEE6] dark:bg-[#1a1a1a] font-sans antialiased text-gray-900 dark:text-white transition-colors duration-300 h-screen overflow-hidden flex flex-col relative">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[#EFEFE8] dark:bg-[#232323]" />
        <div className="absolute top-[-10%] left-[20%] w-40 h-[120%] bg-white dark:bg-[#2c2c2c] -rotate-12 opacity-60" />
        <div className="absolute top-[10%] left-[5%] w-64 h-64 rounded-full blur-3xl" style={{ backgroundColor: 'rgba(168,191,166,0.2)' }} />
        <div className="absolute bottom-[20%] right-[10%] w-80 h-80 rounded-full blur-3xl" style={{ backgroundColor: 'rgba(165,188,207,0.2)' }} />
        <div className="absolute top-[40%] left-[-10%] w-56 h-56 rounded-full blur-3xl" style={{ backgroundColor: 'rgba(224,214,168,0.2)' }} />
      </div>

      <header className="relative z-50 px-5 pt-12 pb-2">
        <div className="flex items-center justify-between mb-4">
          <button className="w-10 h-10 rounded-full glass dark:glass-dark flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-[var(--primary)] transition-colors shadow-sm">
            <span className="material-icons-round">arrow_back_ios_new</span>
          </button>
          <h1 className="text-lg font-bold text-gray-800 dark:text-white tracking-wide">創立活動</h1>
          <button className="px-4 py-1.5 rounded-full bg-transparent border border-[rgba(207,185,165,0.3)] text-primary text-sm font-medium transition-colors" style={{ backgroundColor: 'transparent' }}>
            存草稿
          </button>
        </div>
        <StepIndicator step={step} onChange={setStep} />
      </header>

      <main className="relative z-10 flex-1 overflow-y-auto hide-scrollbar pb-32 px-5 pt-2">
        {stepContent}
        {isFirstStep ? (
          <>
            <div className="relative py-8 flex items-center justify-center">
              <div className="w-full h-px bg-gray-200 dark:bg-gray-700" />
              <span className="absolute bg-[#F0EEE6] dark:bg-[#232323] px-3 text-xs text-gray-400 font-medium">接下來</span>
            </div>
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 ml-1">時間設定</label>
                <div className="grid grid-cols-2 gap-3">
                  <button className="flex items-center gap-3 bg-white dark:bg-[var(--card-dark)] p-3 rounded-2xl shadow-sm text-left hover:ring-2 hover:ring-[rgba(207,185,165,0.3)] transition-all">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-morandi-yellow shrink-0"
                      style={{ backgroundColor: 'rgba(224,214,168,0.2)' }}
                    >
                      <span className="material-icons-round">calendar_today</span>
                    </div>
                    <div>
                      <div className="text-[10px] text-gray-400">日期</div>
                      <div className="text-sm font-bold text-gray-700 dark:text-gray-200">2023/10/28</div>
                    </div>
                  </button>
                  <button className="flex items-center gap-3 bg-white dark:bg-[var(--card-dark)] p-3 rounded-2xl shadow-sm text-left hover:ring-2 hover:ring-[rgba(207,185,165,0.3)] transition-all">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-morandi-blue shrink-0"
                      style={{ backgroundColor: 'rgba(165,188,207,0.2)' }}
                    >
                      <span className="material-icons-round">schedule</span>
                    </div>
                    <div>
                      <div className="text-[10px] text-gray-400">時間</div>
                      <div className="text-sm font-bold text-gray-700 dark:text-gray-200">14:30</div>
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2 px-1">
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400">集合地點</label>
                  <button className="text-xs text-primary font-bold flex items-center">
                    <span className="material-icons-round text-sm mr-0.5">my_location</span> 使用目前位置
                  </button>
                </div>
                <div className="w-full h-36 rounded-2xl bg-[#E5E0D8] dark:bg-gray-800 bg-map-pattern relative overflow-hidden shadow-inner group cursor-pointer border-2 border-transparent hover:border-[rgba(207,185,165,0.5)] transition-colors">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full animate-ping absolute" style={{ backgroundColor: 'rgba(207,185,165,0.2)' }} />
                    <span className="material-icons-round text-4xl drop-shadow-md relative z-10" style={{ color: palette.primary }}>location_on</span>
                    <div className="w-3 h-1.5 bg-black/20 rounded-[50%] blur-[1px] mt-[-4px]" />
                  </div>
                  <button className="absolute bottom-3 right-3 bg-white dark:bg-[var(--card-dark)] text-gray-700 dark:text-gray-200 text-xs font-bold px-4 py-2 rounded-xl shadow-lg flex items-center gap-1">
                    開啟地圖選擇
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 ml-1">每人費用</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-serif italic text-lg">$</span>
                    <input
                      type="number"
                      placeholder="0"
                      className="w-full rounded-2xl border-none bg-white dark:bg-[var(--card-dark)] py-3 pl-8 pr-4 text-sm font-bold shadow-sm focus:ring-2 focus:ring-[rgba(207,185,165,0.5)] text-gray-800 dark:text-gray-100"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 ml-1">預計人數</label>
                  <div className="flex items-center bg-white dark:bg-[var(--card-dark)] rounded-2xl p-1 shadow-sm h-[46px]">
                    <button className="w-10 h-full flex items-center justify-center text-primary hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-colors">
                      <span className="material-icons-round">remove</span>
                    </button>
                    <input
                      type="text"
                      defaultValue="4"
                      className="flex-1 w-full bg-transparent border-none text-center p-0 text-gray-700 dark:text-gray-200 font-bold focus:ring-0 text-sm"
                    />
                    <button className="w-10 h-full flex items-center justify-center text-primary hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-colors">
                      <span className="material-icons-round">add</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </main>

      <div className="fixed bottom-0 inset-x-0 p-5 bg-gradient-to-t from-[#F0EEE6] via-[#F0EEE6] to-transparent dark:from-[#1a1a1a] dark:via-[#1a1a1a] z-50 pt-10">
        <button
          onClick={() => setStep((prev) => Math.min(prev + 1, 3))}
          className="w-full bg-primary text-white font-bold py-4 rounded-3xl shadow-[0_12px_30px_rgba(207,185,165,0.3)] flex items-center justify-center gap-2 active:scale-95 transition-transform hover:bg-[var(--primary-dark)]"
        >
          {nextLabel}
          <span className="material-icons-round text-sm">{step === 3 ? 'check_circle' : 'arrow_forward'}</span>
        </button>
      </div>
    </div>
  );
}
