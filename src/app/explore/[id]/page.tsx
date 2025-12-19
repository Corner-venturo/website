'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth-store';
import { useGroupStore, Group } from '@/stores/group-store';
import { getSupabaseClient } from '@/lib/supabase';
import { mockTrips } from '../constants';
import { getCategoryColor, getCategoryTextColor, formatDate } from '../TripCard';

// 類別中文名稱
const categoryNames: Record<string, string> = {
  food: '美食',
  photo: '攝影',
  outdoor: '戶外',
  music: '音樂',
  coffee: '咖啡',
  party: '派對',
  other: '其他',
};

// 成員介面
interface Member {
  id: string;
  user_id: string;
  role: 'organizer' | 'member';
  status: string;
  profile?: {
    display_name: string | null;
    avatar_url: string | null;
  };
}

export default function GroupDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, initialize, isInitialized } = useAuthStore();
  const { groups, joinGroup, isLoading } = useGroupStore();
  const [group, setGroup] = useState<Group | null>(null);
  const [mockGroup, setMockGroup] = useState<typeof mockTrips[0] | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const groupId = params.id as string;

  // 顯示提示
  const showNotification = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  // 初始化
  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [initialize, isInitialized]);

  // 載入揪團資料
  useEffect(() => {
    // 先從真實資料找
    const realGroup = groups.find(g => g.id === groupId);
    if (realGroup) {
      setGroup(realGroup);
      return;
    }

    // 否則從 mock 資料找
    const mock = mockTrips.find(t => t.id === groupId);
    if (mock) {
      setMockGroup(mock);
    }
  }, [groupId, groups]);

  // 載入成員列表
  useEffect(() => {
    const fetchMembers = async () => {
      if (!group) return;

      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('group_members')
        .select(`
          id,
          user_id,
          role,
          status,
          profile:profiles(display_name, avatar_url)
        `)
        .eq('group_id', group.id)
        .eq('status', 'approved')
        .order('role', { ascending: true }); // organizer 先顯示

      if (!error && data) {
        setMembers(data as Member[]);
      }
    };

    fetchMembers();
  }, [group]);

  // 處理加入
  const handleJoin = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (group) {
      const result = await joinGroup(group.id, user.id);
      if (result.success) {
        showNotification('已送出申請！');
      } else {
        showNotification(result.error || '加入失敗');
      }
    } else {
      // Mock 資料
      showNotification('這是展示用的假資料');
    }
  };

  // 處理聊聊
  const handleChat = () => {
    showNotification('此功能尚未開放');
  };

  // 處理分享
  const handleShare = () => {
    showNotification('此功能尚未開放');
  };

  // Toast 元件
  const Toast = () => (
    showToast ? (
      <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 bg-black/80 text-white text-sm rounded-full backdrop-blur-sm animate-fade-in">
        {toastMessage}
      </div>
    ) : null
  );

  // Mock 資料顯示
  if (mockGroup) {
    return (
      <div className="min-h-screen bg-[#F0EEE6]">
        <Toast />

        {/* 封面圖 */}
        <div className="relative h-[280px]">
          <Image
            src={mockGroup.image}
            alt={mockGroup.title}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

          {/* 返回按鈕 - 使用 top-12 確保不被狀態列遮擋 */}
          <button
            onClick={() => router.back()}
            className="absolute top-12 left-4 w-10 h-10 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center text-white"
          >
            <span className="material-icons-round">arrow_back</span>
          </button>

          {/* 分享按鈕 */}
          <button
            onClick={handleShare}
            className="absolute top-12 right-4 w-10 h-10 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center text-white"
          >
            <span className="material-icons-round">share</span>
          </button>

          {/* 類別標籤 */}
          <div className="absolute bottom-4 left-4">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(mockGroup.category)} ${getCategoryTextColor(mockGroup.category)}`}>
              {categoryNames[mockGroup.category] || mockGroup.category}
            </span>
          </div>
        </div>

        {/* 內容區 */}
        <div className="px-5 py-6 -mt-4 bg-[#F0EEE6] rounded-t-3xl relative">
          {/* 標題 */}
          <h1 className="text-2xl font-bold text-[#5C5C5C] mb-3">{mockGroup.title}</h1>

          {/* 時間地點 */}
          <div className="flex flex-col gap-2 mb-6">
            <div className="flex items-center gap-3 text-[#5C5C5C]">
              <span className="material-icons-round text-[#a5bccf]">calendar_today</span>
              <span className="text-sm">{formatDate(mockGroup.event_date)} · {mockGroup.event_date}</span>
            </div>
            <div className="flex items-center gap-3 text-[#5C5C5C]">
              <span className="material-icons-round text-[#cfa5a5]">location_on</span>
              <span className="text-sm">{mockGroup.location}</span>
            </div>
            <div className="flex items-center gap-3 text-[#5C5C5C]">
              <span className="material-icons-round text-[#a8bfa6]">group</span>
              <span className="text-sm">{mockGroup.member_count}/{mockGroup.max_members} 人</span>
            </div>
          </div>

          {/* 主辦人 */}
          <div className="flex items-center gap-3 p-4 bg-white rounded-2xl shadow-sm mb-6">
            <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-[#cfb9a5]">
              <Image
                src={mockGroup.organizer_avatar}
                alt={mockGroup.organizer_name}
                width={48}
                height={48}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <p className="text-sm text-[#949494]">主辦人</p>
              <p className="font-semibold text-[#5C5C5C]">{mockGroup.organizer_name}</p>
            </div>
            <button
              onClick={handleChat}
              className="px-4 py-2 bg-[#F7F5F2] text-[#5C5C5C] text-sm rounded-xl active:scale-95 transition"
            >
              聊聊
            </button>
          </div>

          {/* 簡介 */}
          <div className="mb-6">
            <h2 className="font-bold text-[#5C5C5C] mb-2">活動簡介</h2>
            <p className="text-sm text-[#949494] leading-relaxed">
              一起來探索城市中的美好角落！無論你是咖啡愛好者、攝影迷還是喜歡戶外活動的朋友，都歡迎加入我們的行列。
            </p>
          </div>

          {/* 參加者 */}
          <div className="mb-24">
            <h2 className="font-bold text-[#5C5C5C] mb-3">參加者 ({mockGroup.member_count})</h2>
            <div className="flex flex-wrap gap-3">
              {/* 主辦人 */}
              <div className="flex flex-col items-center gap-1">
                <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-[#cfb9a5]">
                  <Image src={mockGroup.organizer_avatar} alt="" width={48} height={48} className="w-full h-full object-cover" />
                </div>
                <span className="text-xs text-[#949494]">{mockGroup.organizer_name}</span>
              </div>
              {/* 其他假成員 */}
              {mockGroup.member_count > 1 && Array.from({ length: Math.min(mockGroup.member_count - 1, 5) }).map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div className="w-12 h-12 rounded-full bg-[#D6CDC8] ring-2 ring-white flex items-center justify-center text-white font-medium">
                    {String.fromCharCode(65 + i)}
                  </div>
                  <span className="text-xs text-[#949494]">成員 {i + 1}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 底部按鈕 */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-xl border-t border-gray-100">
          <div className="flex gap-3">
            <button
              onClick={handleJoin}
              className="flex-1 py-3.5 bg-[#cfb9a5] text-white font-bold rounded-2xl shadow-lg shadow-[#cfb9a5]/30 active:scale-95 transition"
            >
              我要參加
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 真實資料顯示
  if (group) {
    return (
      <div className="min-h-screen bg-[#F0EEE6]">
        <Toast />

        {/* 封面圖 */}
        <div className="relative h-[280px]">
          <Image
            src={group.cover_image || 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&h=600&fit=crop'}
            alt={group.title}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

          {/* 返回按鈕 - 使用 top-12 確保不被狀態列遮擋 */}
          <button
            onClick={() => router.back()}
            className="absolute top-12 left-4 w-10 h-10 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center text-white"
          >
            <span className="material-icons-round">arrow_back</span>
          </button>

          {/* 分享按鈕 */}
          <button
            onClick={handleShare}
            className="absolute top-12 right-4 w-10 h-10 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center text-white"
          >
            <span className="material-icons-round">share</span>
          </button>

          {/* 類別標籤 */}
          <div className="absolute bottom-4 left-4">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(group.category)} ${getCategoryTextColor(group.category)}`}>
              {categoryNames[group.category] || group.category}
            </span>
          </div>
        </div>

        {/* 內容區 */}
        <div className="px-5 py-6 -mt-4 bg-[#F0EEE6] rounded-t-3xl relative">
          {/* 標題 */}
          <h1 className="text-2xl font-bold text-[#5C5C5C] mb-3">{group.title}</h1>

          {/* 時間地點 */}
          <div className="flex flex-col gap-2 mb-6">
            <div className="flex items-center gap-3 text-[#5C5C5C]">
              <span className="material-icons-round text-[#a5bccf]">calendar_today</span>
              <span className="text-sm">{formatDate(group.event_date)} · {group.event_date}</span>
            </div>
            {group.location_name && (
              <div className="flex items-center gap-3 text-[#5C5C5C]">
                <span className="material-icons-round text-[#cfa5a5]">location_on</span>
                <span className="text-sm">{group.location_name}</span>
              </div>
            )}
            <div className="flex items-center gap-3 text-[#5C5C5C]">
              <span className="material-icons-round text-[#a8bfa6]">group</span>
              <span className="text-sm">{group.current_members}/{group.max_members} 人</span>
            </div>
            {group.estimated_cost && (
              <div className="flex items-center gap-3 text-[#5C5C5C]">
                <span className="material-icons-round text-[#e0d6a8]">payments</span>
                <span className="text-sm">預估 ${group.estimated_cost}</span>
              </div>
            )}
          </div>

          {/* 主辦人 */}
          <div className="flex items-center gap-3 p-4 bg-white rounded-2xl shadow-sm mb-6">
            <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-[#cfb9a5]">
              <Image
                src={group.creator?.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop'}
                alt={group.creator?.display_name || '主辦人'}
                width={48}
                height={48}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <p className="text-sm text-[#949494]">主辦人</p>
              <p className="font-semibold text-[#5C5C5C]">{group.creator?.display_name || '主辦人'}</p>
            </div>
            <button
              onClick={handleChat}
              className="px-4 py-2 bg-[#F7F5F2] text-[#5C5C5C] text-sm rounded-xl active:scale-95 transition"
            >
              聊聊
            </button>
          </div>

          {/* 簡介 */}
          {group.description && (
            <div className="mb-6">
              <h2 className="font-bold text-[#5C5C5C] mb-2">活動簡介</h2>
              <p className="text-sm text-[#949494] leading-relaxed">
                {group.description}
              </p>
            </div>
          )}

          {/* 參加者 */}
          <div className="mb-24">
            <h2 className="font-bold text-[#5C5C5C] mb-3">參加者 ({members.length || group.current_members})</h2>
            <div className="flex flex-wrap gap-3">
              {members.length > 0 ? (
                members.map((member) => (
                  <div key={member.id} className="flex flex-col items-center gap-1">
                    <div className={`w-12 h-12 rounded-full overflow-hidden ring-2 ${member.role === 'organizer' ? 'ring-[#cfb9a5]' : 'ring-white'}`}>
                      {member.profile?.avatar_url ? (
                        <Image
                          src={member.profile.avatar_url}
                          alt={member.profile.display_name || ''}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-[#D6CDC8] flex items-center justify-center text-white font-medium">
                          {(member.profile?.display_name || '?')[0].toUpperCase()}
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-[#949494]">
                      {member.profile?.display_name || '匿名'}
                      {member.role === 'organizer' && <span className="text-[#cfb9a5]"> (主辦)</span>}
                    </span>
                  </div>
                ))
              ) : (
                // 載入中或無資料時顯示主辦人
                <div className="flex flex-col items-center gap-1">
                  <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-[#cfb9a5]">
                    <Image
                      src={group.creator?.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop'}
                      alt=""
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-xs text-[#949494]">{group.creator?.display_name || '主辦人'}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 底部按鈕 */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-xl border-t border-gray-100">
          <div className="flex gap-3">
            <button
              onClick={handleJoin}
              disabled={isLoading || group.current_members >= group.max_members}
              className="flex-1 py-3.5 bg-[#cfb9a5] text-white font-bold rounded-2xl shadow-lg shadow-[#cfb9a5]/30 active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {group.current_members >= group.max_members ? '已額滿' : '我要參加'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 載入中或找不到
  return (
    <div className="min-h-screen bg-[#F0EEE6] flex items-center justify-center">
      <div className="text-center">
        <span className="material-icons-round text-4xl text-[#949494] mb-2">search_off</span>
        <p className="text-[#949494]">找不到此揪團</p>
        <Link href="/explore" className="text-[#cfb9a5] text-sm mt-2 inline-block">
          返回探索
        </Link>
      </div>
    </div>
  );
}
