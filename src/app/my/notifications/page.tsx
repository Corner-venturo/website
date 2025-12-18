'use client';

import { useState } from 'react';
import Link from 'next/link';

interface ToggleProps {
  enabled: boolean;
  onChange: (value: boolean) => void;
}

function Toggle({ enabled, onChange }: ToggleProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      className={`relative w-12 h-7 rounded-full transition-colors ${
        enabled ? 'bg-[#94A3B8]' : 'bg-[#E8E2DD]'
      }`}
    >
      <div
        className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

export default function NotificationSettingsPage() {
  const [pushEnabled, setPushEnabled] = useState(true);
  const [tripReminders, setTripReminders] = useState(true);
  const [paymentReminders, setPaymentReminders] = useState(true);
  const [groupUpdates, setGroupUpdates] = useState(true);
  const [friendRequests, setFriendRequests] = useState(true);
  const [promotions, setPromotions] = useState(false);
  const [emailEnabled, setEmailEnabled] = useState(true);

  return (
    <div className="bg-[#F5F4F0] font-sans antialiased text-[#5C5C5C] min-h-screen flex flex-col">
      {/* 背景光暈 */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute -top-[5%] -left-[15%] w-[500px] h-[500px] bg-[#D8D0C9] opacity-40 blur-[90px] rounded-full" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[450px] h-[450px] bg-[#C8D6D3] opacity-40 blur-[90px] rounded-full" />
      </div>

      {/* Header */}
      <header className="px-6 pt-12 pb-4 flex items-center gap-4">
        <Link
          href="/my/settings"
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white/60 backdrop-blur-xl border border-white/50 shadow-sm text-[#5C5C5C] hover:text-[#94A3B8] transition-colors"
        >
          <span className="material-icons-round text-xl">arrow_back</span>
        </Link>
        <h1 className="text-xl font-bold text-[#5C5C5C]">通知設定</h1>
      </header>

      {/* Notification Settings */}
      <main className="flex-1 px-6 pb-8 overflow-y-auto">
        {/* Push Notifications Section */}
        <div className="mb-6">
          <h2 className="text-xs text-[#949494] font-bold uppercase tracking-wider mb-3">
            推播通知
          </h2>
          <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/50 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-[#E8E2DD]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#94A3B8]/10 flex items-center justify-center text-[#94A3B8]">
                  <span className="material-icons-round">notifications_active</span>
                </div>
                <div>
                  <div className="font-bold text-[#5C5C5C] text-sm">啟用推播通知</div>
                  <div className="text-xs text-[#949494]">接收即時通知</div>
                </div>
              </div>
              <Toggle enabled={pushEnabled} onChange={setPushEnabled} />
            </div>

            {pushEnabled && (
              <>
                <div className="flex items-center justify-between p-4 border-b border-[#E8E2DD]">
                  <div>
                    <div className="font-medium text-[#5C5C5C] text-sm">行程提醒</div>
                    <div className="text-xs text-[#949494]">出發前、Check-in 提醒</div>
                  </div>
                  <Toggle enabled={tripReminders} onChange={setTripReminders} />
                </div>

                <div className="flex items-center justify-between p-4 border-b border-[#E8E2DD]">
                  <div>
                    <div className="font-medium text-[#5C5C5C] text-sm">付款提醒</div>
                    <div className="text-xs text-[#949494]">付款期限、分帳通知</div>
                  </div>
                  <Toggle enabled={paymentReminders} onChange={setPaymentReminders} />
                </div>

                <div className="flex items-center justify-between p-4 border-b border-[#E8E2DD]">
                  <div>
                    <div className="font-medium text-[#5C5C5C] text-sm">揪團動態</div>
                    <div className="text-xs text-[#949494]">新成員加入、留言回覆</div>
                  </div>
                  <Toggle enabled={groupUpdates} onChange={setGroupUpdates} />
                </div>

                <div className="flex items-center justify-between p-4 border-b border-[#E8E2DD]">
                  <div>
                    <div className="font-medium text-[#5C5C5C] text-sm">好友邀請</div>
                    <div className="text-xs text-[#949494]">新的好友請求</div>
                  </div>
                  <Toggle enabled={friendRequests} onChange={setFriendRequests} />
                </div>

                <div className="flex items-center justify-between p-4">
                  <div>
                    <div className="font-medium text-[#5C5C5C] text-sm">優惠活動</div>
                    <div className="text-xs text-[#949494]">限時優惠與特價資訊</div>
                  </div>
                  <Toggle enabled={promotions} onChange={setPromotions} />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Email Notifications Section */}
        <div>
          <h2 className="text-xs text-[#949494] font-bold uppercase tracking-wider mb-3">
            電子郵件
          </h2>
          <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/50 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#A8BCA1]/10 flex items-center justify-center text-[#A8BCA1]">
                  <span className="material-icons-round">email</span>
                </div>
                <div>
                  <div className="font-bold text-[#5C5C5C] text-sm">電子郵件通知</div>
                  <div className="text-xs text-[#949494]">接收重要資訊至信箱</div>
                </div>
              </div>
              <Toggle enabled={emailEnabled} onChange={setEmailEnabled} />
            </div>
          </div>
        </div>

        {/* Note */}
        <p className="mt-6 text-xs text-[#949494] text-center">
          關閉推播通知後，你仍會在 App 內收到重要訊息
        </p>
      </main>
    </div>
  );
}
