'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import MobileNav from '@/components/MobileNav';
import { useAuthStore } from '@/stores/auth-store';
import { useProfileStore } from '@/stores/profile-store';

export default function AchievementsPage() {
  const { user, initialize, isInitialized } = useAuthStore();
  const { profile, fetchProfile } = useProfileStore();

  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [initialize, isInitialized]);

  useEffect(() => {
    if (user?.id) {
      fetchProfile(user.id);
    }
  }, [user?.id, fetchProfile]);

  // 真實獲得的徽章
  const earnedAchievements = [];

  // 如果是創始會員，加入徽章
  if (profile?.is_founding_member) {
    earnedAchievements.push({
      icon: 'workspace_premium',
      label: '創始會員',
      color: 'bg-gradient-to-br from-[#FFD700] to-[#FFA500]',
      rotate: 'rotate-0',
      description: '早期加入的珍貴夥伴',
      memberNumber: profile.member_number,
      date: profile.created_at ? new Date(profile.created_at).toLocaleDateString('zh-TW') : '',
    });
  }

  // 未來可獲得的徽章（尚未開放）
  const lockedAchievements = [
    { icon: 'diversity_3', label: '揪團小白', description: '成功發起第一次揪團' },
    { icon: 'emoji_events', label: '揪團達人', description: '成功完成 5 次揪團' },
    { icon: 'star', label: '人氣王', description: '揪團滿員達 3 次' },
    { icon: 'hiking', label: '百岳挑戰', description: '參加 10 次戶外活動' },
    { icon: 'photo_camera', label: '攝影大師', description: '參加 5 次攝影揪團' },
    { icon: 'restaurant', label: '在地美食家', description: '參加 10 次美食揪團' },
  ];

  const totalAchievements = earnedAchievements.length + lockedAchievements.length;
  const progressPercent = totalAchievements > 0 ? Math.round((earnedAchievements.length / totalAchievements) * 100) : 0;

  return (
    <div className="bg-[#F0EEE6] font-sans antialiased text-gray-900 min-h-screen flex flex-col overflow-hidden">
      {/* 背景光暈 */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-96 h-96 bg-[#A5BCCF]/20 rounded-full blur-3xl" />
        <div className="absolute bottom-[20%] -right-[10%] w-80 h-80 bg-[#Cfb9a5]/20 rounded-full blur-3xl" />
        <div className="absolute top-[30%] left-[40%] w-64 h-64 bg-[#CFA5A5]/15 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-50 px-6 pt-12 pb-2 flex items-center justify-between">
        <Link
          href="/my"
          className="bg-white/70 backdrop-blur-xl border border-white/60 p-2.5 rounded-full shadow-sm text-gray-600 hover:text-[#Cfb9a5] transition-colors"
        >
          <span className="material-icons-round text-xl">arrow_back</span>
        </Link>
        <h1 className="text-lg font-bold text-gray-800 tracking-wide">成就勳章</h1>
        <div className="w-10" /> {/* Spacer */}
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 w-full h-full overflow-y-auto pb-32">
        {/* 總覽卡片 */}
        <div className="px-6 mt-4">
          <div className="bg-white/50 backdrop-blur-xl border border-white/40 p-6 rounded-3xl flex items-center gap-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <span className="material-icons-round text-6xl">emoji_events</span>
            </div>
            {/* 進度圓環 */}
            <div className="relative w-20 h-20 flex-shrink-0">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  className="text-gray-200"
                  cx="40"
                  cy="40"
                  fill="transparent"
                  r="36"
                  stroke="currentColor"
                  strokeWidth="6"
                />
                <circle
                  className="text-[#Cfb9a5]"
                  cx="40"
                  cy="40"
                  fill="transparent"
                  r="36"
                  stroke="currentColor"
                  strokeDasharray="226"
                  strokeDashoffset={226 - (226 * progressPercent) / 100}
                  strokeLinecap="round"
                  strokeWidth="6"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xs text-gray-400 font-medium">進度</span>
                <span className="text-lg font-bold text-gray-800">{progressPercent}%</span>
              </div>
            </div>
            <div className="flex-1 relative z-10">
              <h2 className="text-xl font-bold text-gray-800 mb-1">
                {profile?.display_name || profile?.full_name || '探險家'}
              </h2>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#A5BCCF] text-white">
                  {earnedAchievements.length} / {totalAchievements} 徽章
                </span>
              </div>
              <p className="text-xs text-gray-400 leading-tight">持續探索，解鎖更多專屬徽章！</p>
            </div>
          </div>
        </div>

        <div className="px-6 pb-20">
          {/* 已獲得徽章 */}
          <div className="flex items-center gap-2 mb-4 mt-6">
            <span className="w-1 h-4 bg-[#FFD700] rounded-full" />
            <h3 className="text-sm font-bold text-gray-700">已獲得 ({earnedAchievements.length})</h3>
          </div>

          {earnedAchievements.length > 0 ? (
            <div className="grid grid-cols-3 gap-y-8 gap-x-4 mb-8">
              {earnedAchievements.map((item) => (
                <div key={item.label} className="flex flex-col items-center gap-2 group cursor-pointer">
                  <div
                    className={`relative w-20 h-20 rounded-full ${item.color} shadow-[2px_4px_6px_rgba(0,0,0,0.15),inset_0_0_0_2px_rgba(255,255,255,0.3)] flex items-center justify-center transform group-hover:scale-105 transition-transform border-2 border-dashed border-white/40 ${item.rotate}`}
                  >
                    <span className="material-icons-round text-white text-3xl drop-shadow-md">{item.icon}</span>
                    {item.memberNumber && (
                      <div className="absolute -bottom-1 bg-white px-2 py-0.5 rounded-full text-[10px] font-bold shadow-sm border border-amber-200 text-amber-600">
                        #{item.memberNumber}
                      </div>
                    )}
                  </div>
                  <div className="text-center">
                    <div className="text-xs font-bold text-gray-700">{item.label}</div>
                    <div className="text-[10px] text-gray-400 mt-0.5">{item.date}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400 text-sm mb-8">
              尚未獲得任何徽章，快去參加揪團吧！
            </div>
          )}

          {/* 尚未開放的徽章 */}
          <div className="flex items-center gap-2 mb-4 mt-2">
            <span className="w-1 h-4 bg-gray-300 rounded-full" />
            <h3 className="text-sm font-bold text-gray-500">尚未獲得</h3>
          </div>

          <div className="grid grid-cols-3 gap-y-8 gap-x-4">
            {lockedAchievements.map((item) => (
              <div key={item.label} className="flex flex-col items-center gap-2 group opacity-50">
                <div className="relative w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] border border-white/20">
                  <span className="material-icons-round text-gray-400 text-3xl">{item.icon}</span>
                  <div className="absolute inset-0 flex items-center justify-center bg-black/10 rounded-full">
                    <span className="material-icons-round text-gray-500 text-lg">lock</span>
                  </div>
                </div>
                <div className="text-center w-full px-1">
                  <div className="text-xs font-bold text-gray-500 mb-0.5">{item.label}</div>
                  <div className="text-[9px] text-gray-400 leading-tight">{item.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* 底部導航 */}
      <MobileNav />
    </div>
  );
}
