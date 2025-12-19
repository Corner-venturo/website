"use client";

import { useEffect } from "react";
import MobileNav from "@/components/MobileNav";
import { useAuthStore } from "@/stores/auth-store";
import { useProfileStore, getDisplayAvatar } from "@/stores/profile-store";
import {
  ProfileHeader,
  AchievementBadges,
  TravelBuddies,
  QuickActions,
  TravelManager,
  SettingsLink,
  Achievement,
  demoAchievements,
  demoQuickActions,
  realQuickActions,
} from "./components";

export default function ProfilePage() {
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

  // 取得用戶資料
  const isLoggedIn = !!user;
  const userName = isLoggedIn
    ? profile?.display_name ||
      profile?.full_name ||
      user?.user_metadata?.name ||
      user?.email?.split("@")[0] ||
      "訪客"
    : "旅人（展示）";
  const avatarUrl = isLoggedIn ? getDisplayAvatar(profile, user?.user_metadata) : null;

  // 根據登入狀態選擇資料
  const quickActions = isLoggedIn ? realQuickActions : demoQuickActions;
  const achievements: Achievement[] = isLoggedIn
    ? profile?.is_founding_member
      ? [
          {
            icon: "workspace_premium",
            label: "創始會員",
            color: "bg-gradient-to-r from-[#FFD700] to-[#FFA500]",
            rotate: "rotate-0",
            isFounder: true,
          },
        ]
      : []
    : demoAchievements;

  return (
    <div className="bg-[#F5F4F0] font-sans antialiased text-[#5C5C5C] transition-colors duration-300 min-h-screen flex flex-col overflow-hidden">
      {/* 背景光暈 */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute -top-[5%] -left-[15%] w-[500px] h-[500px] bg-[#D8D0C9] opacity-40 blur-[90px] rounded-full" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[450px] h-[450px] bg-[#C8D6D3] opacity-40 blur-[90px] rounded-full" />
        <div className="absolute top-[40%] left-[20%] w-[300px] h-[300px] bg-[#E6DFDA] opacity-30 blur-[70px] rounded-full" />
      </div>

      {/* 主要內容 */}
      <div className="relative z-10 flex flex-col flex-1">
        <main className="flex-1 w-full h-full overflow-y-auto hide-scrollbar pb-32 pt-5">
          <ProfileHeader
            userName={userName}
            avatarUrl={avatarUrl}
            isFoundingMember={profile?.is_founding_member}
            memberNumber={profile?.member_number}
          />

          <AchievementBadges achievements={achievements} />

          <div className="px-5 space-y-4">
            <TravelBuddies isLoggedIn={isLoggedIn} />
            <QuickActions actions={quickActions} />
            <TravelManager isLoggedIn={isLoggedIn} />
            <SettingsLink />
          </div>
        </main>

        <MobileNav />
      </div>

      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
