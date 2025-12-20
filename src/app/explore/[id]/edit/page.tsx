'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import LocationPicker, { LocationData } from '@/components/LocationPicker';
import { useGroupStore, CreateGroupData } from '@/stores/group-store';
import { useAuthStore } from '@/stores/auth-store';
import { getSupabaseClient } from '@/lib/supabase';

const categories = [
  { id: 'food', label: '美食', icon: 'local_dining', color: '#Cfb9a5' },
  { id: 'photo', label: '攝影', icon: 'photo_camera', color: '#A5BCCF' },
  { id: 'outdoor', label: '戶外', icon: 'hiking', color: '#A8BFA6' },
  { id: 'party', label: '派對', icon: 'celebration', color: '#CFA5A5' },
];

interface FormData {
  title: string;
  description: string;
  category: string;
  coverImage: File | null;
  coverImagePreview: string;
  locationName: string;
  locationAddress: string;
  latitude: number | null;
  longitude: number | null;
  startDateTime: Date;
  endDateTime: Date;
  memberCount: number;
  genderLimit: string;
  requireApproval: boolean;
  isPrivate: boolean;
  estimatedCost: string;
  tags: string[];
}


export default function EditGroupPage() {
  const router = useRouter();
  const params = useParams();
  const groupId = params.id as string;

  const { user } = useAuthStore();
  const { updateGroup, deleteGroup, isLoading: isUpdating } = useGroupStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoadingGroup, setIsLoadingGroup] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [errorModal, setErrorModal] = useState<{ show: boolean; title: string; message: string }>({
    show: false,
    title: '',
    message: '',
  });

  const getDefaultDateTime = (hoursOffset: number) => {
    const d = new Date();
    d.setHours(d.getHours() + hoursOffset, 0, 0, 0);
    return d;
  };

  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    category: 'food',
    coverImage: null,
    coverImagePreview: '',
    locationName: '',
    locationAddress: '',
    latitude: null,
    longitude: null,
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

  const showError = (title: string, message: string) => {
    setErrorModal({ show: true, title, message });
  };

  // 載入現有活動資料
  useEffect(() => {
    const fetchGroupData = async () => {
      if (!groupId) return;

      setIsLoadingGroup(true);
      const supabase = getSupabaseClient();

      try {
        const { data, error } = await supabase
          .from('groups')
          .select('*')
          .eq('id', groupId)
          .single();

        if (error || !data) {
          showError('找不到活動', '該活動可能已被刪除');
          router.push('/explore');
          return;
        }

        // 確認是主辦人
        if (user && data.created_by !== user.id) {
          showError('無權限', '只有主辦人可以編輯活動');
          router.push(`/explore/${groupId}`);
          return;
        }

        // 解析日期時間
        const eventDate = data.event_date ? new Date(data.event_date) : new Date();
        const startDateTime = new Date(eventDate);
        const endDateTime = new Date(eventDate);

        if (data.start_time) {
          const [startHours, startMins] = data.start_time.split(':');
          startDateTime.setHours(parseInt(startHours), parseInt(startMins), 0, 0);
        }
        if (data.end_time) {
          const [endHours, endMins] = data.end_time.split(':');
          endDateTime.setHours(parseInt(endHours), parseInt(endMins), 0, 0);
        }

        // 填入表單
        setFormData({
          title: data.title || '',
          description: data.description || '',
          category: data.category || 'food',
          coverImage: null,
          coverImagePreview: data.cover_image || '',
          locationName: data.location_name || '',
          locationAddress: data.location_address || '',
          latitude: data.latitude || null,
          longitude: data.longitude || null,
          startDateTime,
          endDateTime,
          memberCount: data.max_members || 4,
          genderLimit: data.gender_limit || 'all',
          requireApproval: data.require_approval ?? true,
          isPrivate: data.is_private ?? false,
          estimatedCost: data.estimated_cost?.toString() || '',
          tags: data.tags || [],
        });
      } catch (err) {
        console.error('Failed to fetch group:', err);
        showError('載入失敗', '無法載入活動資料');
      } finally {
        setIsLoadingGroup(false);
      }
    };

    fetchGroupData();
  }, [groupId, user, router]);

  // 檢查用戶登入狀態
  useEffect(() => {
    if (!user) {
      router.push(`/login?redirect=/explore/${groupId}/edit`);
    }
  }, [user, router, groupId]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateFormData({
          coverImage: file,
          coverImagePreview: reader.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // 格式化日期時間
  const formatForInput = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const mins = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${mins}`;
  };

  const formatDisplay = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = String(date.getHours()).padStart(2, '0');
    const mins = String(date.getMinutes()).padStart(2, '0');
    return `${year}/${month}/${day} ${hours}:${mins}`;
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      showError('缺少必填欄位', '請輸入活動名稱');
      return;
    }

    if (!user) {
      showError('需要登入', '請先登入後再編輯活動');
      return;
    }

    setIsSubmitting(true);

    try {
      const eventDate = formData.startDateTime.toISOString().split('T')[0];
      const startTime = formData.startDateTime.toTimeString().slice(0, 5);
      const endTime = formData.endDateTime.toTimeString().slice(0, 5);

      // 注意：不傳 undefined，改用 null 或省略
      const groupData: Record<string, unknown> = {
        title: formData.title,
        description: formData.description || null,
        category: formData.category,
        location_name: formData.locationName || null,
        location_address: formData.locationAddress || null,
        latitude: formData.latitude || null,
        longitude: formData.longitude || null,
        event_date: eventDate,
        start_time: startTime,
        end_time: endTime,
        max_members: formData.memberCount,
        gender_limit: formData.genderLimit,
        require_approval: formData.requireApproval,
        is_private: formData.isPrivate,
        estimated_cost: formData.estimatedCost ? parseFloat(formData.estimatedCost) : null,
        // tags 是獨立的表，不在這裡更新
      };

      const result = await updateGroup(groupId, groupData);

      if (result.success) {
        router.push(`/explore/${groupId}`);
      } else {
        showError('更新失敗', result.error || '請稍後再試');
      }
    } catch (error) {
      console.error('Update group error:', error);
      showError('更新失敗', '發生未知錯誤，請稍後再試');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteGroup(groupId);
      if (result.success) {
        router.push('/explore');
      } else {
        showError('刪除失敗', result.error || '請稍後再試');
      }
    } catch (error) {
      console.error('Delete group error:', error);
      showError('刪除失敗', '發生未知錯誤，請稍後再試');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };


  if (!user || isLoadingGroup) {
    return (
      <div className="min-h-screen bg-[#F0EEE6] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-[#cfb9a5] border-t-transparent rounded-full animate-spin" />
          <div className="text-gray-500">{isLoadingGroup ? '載入活動資料...' : '載入中...'}</div>
        </div>
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

      {/* 手機版佈局 */}
      <div className="h-[100dvh] overflow-hidden flex flex-col relative z-10">
        <header className="relative z-50 px-5 pt-12 pb-2">
          <div className="flex items-center justify-between mb-4">
            <Link
              href={`/explore/${groupId}`}
              className="w-10 h-10 bg-white/70 backdrop-blur-xl border border-white/60 rounded-full shadow-sm text-gray-600 hover:text-[#Cfb9a5] transition-colors flex items-center justify-center"
            >
              <span className="material-icons-round text-xl">arrow_back_ios_new</span>
            </Link>
            <h1 className="text-lg font-bold text-gray-800 tracking-wide">修改活動</h1>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-1.5 rounded-full bg-transparent border border-rose-300/50 text-rose-400 text-sm font-medium hover:bg-rose-50 transition-colors flex items-center gap-1"
            >
              <span className="material-icons-round text-base">delete_outline</span>
              刪除
            </button>
          </div>
        </header>

        <main className="relative z-10 flex-1 overflow-y-auto hide-scrollbar pb-32 px-5 pt-2">
          <div className="space-y-6">
              {/* 活動封面 */}
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
                  <div className="w-full h-52 rounded-2xl bg-white flex flex-col items-center justify-center text-gray-400 transition-colors relative overflow-hidden group shadow-md">
                    {formData.coverImagePreview ? (
                      <>
                        <img src={formData.coverImagePreview} alt="封面預覽" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white backdrop-blur-[2px]">
                          <span className="material-icons-round text-3xl mb-1">edit</span>
                          <span className="text-xs font-medium tracking-wide">更換封面照片</span>
                        </div>
                        <div className="absolute bottom-3 right-3 bg-white/90 text-gray-800 text-[10px] font-bold px-2 py-1 rounded-lg shadow-sm backdrop-blur-md">
                          編輯
                        </div>
                      </>
                    ) : (
                      <>
                        <span className="material-icons-round text-4xl mb-2 group-hover:scale-110 transition-transform">add_photo_alternate</span>
                        <span className="text-xs font-medium tracking-wide">點擊上傳精彩照片</span>
                      </>
                    )}
                  </div>
                </label>
              </div>

              {/* 活動名稱 */}
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">活動名稱</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => updateFormData({ title: e.target.value })}
                  placeholder="例如：週五晚間爵士音樂會"
                  className="w-full rounded-2xl border-none bg-white py-3.5 px-4 text-sm shadow-sm placeholder-gray-300 focus:ring-2 focus:ring-[rgba(207,185,165,0.5)] text-gray-800 font-medium"
                />
              </div>

              {/* 活動類別 */}
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2 ml-1">活動類別</label>
                <div className="flex flex-wrap gap-2.5">
                  {categories.map((category) => {
                    const isSelected = formData.category === category.id;
                    return (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => updateFormData({ category: category.id })}
                        className={`px-4 py-2 rounded-xl text-xs font-medium border shadow-sm transition-all flex items-center gap-1.5`}
                        style={{
                          backgroundColor: isSelected ? category.color : 'white',
                          color: isSelected ? 'white' : '#6b7280',
                          borderColor: isSelected ? category.color : 'transparent',
                          boxShadow: isSelected ? `0 4px 12px ${category.color}30` : undefined,
                        }}
                      >
                        <span className="material-icons-round text-sm">{category.icon}</span>
                        {category.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 活動描述 */}
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">活動描述</label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => updateFormData({ description: e.target.value })}
                  placeholder="請簡單介紹活動內容、行程安排與注意事項..."
                  className="w-full rounded-2xl border-none bg-white py-3.5 px-4 text-sm shadow-sm placeholder-gray-300 focus:ring-2 focus:ring-[rgba(207,185,165,0.5)] text-gray-800 resize-none leading-relaxed"
                />
              </div>

              {/* 時間設定 */}
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2 ml-1">時間設定</label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="relative cursor-pointer">
                    <input
                      type="datetime-local"
                      value={formatForInput(formData.startDateTime)}
                      onChange={(e) => {
                        const newStart = new Date(e.target.value);
                        updateFormData({ startDateTime: newStart });
                        if (newStart >= formData.endDateTime) {
                          const newEnd = new Date(newStart);
                          newEnd.setHours(newEnd.getHours() + 3);
                          updateFormData({ endDateTime: newEnd });
                        }
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex items-center gap-3 bg-white p-3 rounded-2xl shadow-sm text-left hover:ring-2 hover:ring-[rgba(207,185,165,0.3)] transition-all border border-[rgba(207,185,165,0.2)]">
                      <div className="w-10 h-10 rounded-xl bg-[rgba(224,214,168,0.2)] flex items-center justify-center text-[#E0D6A8] shrink-0">
                        <span className="material-icons-round">calendar_today</span>
                      </div>
                      <div>
                        <div className="text-[10px] text-gray-400">開始時間</div>
                        <div className="text-sm font-bold text-gray-700">{formatDisplay(formData.startDateTime)}</div>
                      </div>
                    </div>
                  </label>
                  <label className="relative cursor-pointer">
                    <input
                      type="datetime-local"
                      value={formatForInput(formData.endDateTime)}
                      min={formatForInput(formData.startDateTime)}
                      onChange={(e) => {
                        const newEnd = new Date(e.target.value);
                        if (newEnd > formData.startDateTime) {
                          updateFormData({ endDateTime: newEnd });
                        }
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex items-center gap-3 bg-white p-3 rounded-2xl shadow-sm text-left hover:ring-2 hover:ring-[rgba(207,185,165,0.3)] transition-all border border-[rgba(207,185,165,0.2)]">
                      <div className="w-10 h-10 rounded-xl bg-[rgba(165,188,207,0.2)] flex items-center justify-center text-[#A5BCCF] shrink-0">
                        <span className="material-icons-round">schedule</span>
                      </div>
                      <div>
                        <div className="text-[10px] text-gray-400">結束時間</div>
                        <div className="text-sm font-bold text-gray-700">{formatDisplay(formData.endDateTime)}</div>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* 集合地點 */}
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2 px-1">集合地點</label>
                <LocationPicker
                  value={formData.locationName && formData.latitude ? {
                    name: formData.locationName,
                    address: formData.locationAddress,
                    latitude: formData.latitude,
                    longitude: formData.longitude || 0,
                  } : null}
                  onChange={(location: LocationData) => {
                    updateFormData({
                      locationName: location.name,
                      locationAddress: location.address,
                      latitude: location.latitude,
                      longitude: location.longitude,
                    });
                  }}
                  placeholder="搜尋地點（如：台北車站）"
                />
              </div>

              {/* 費用與人數 */}
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
                      className="w-10 h-full flex items-center justify-center text-[#Cfb9a5] hover:bg-gray-100 rounded-xl transition-colors"
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
                      className="w-10 h-full flex items-center justify-center text-[#Cfb9a5] hover:bg-gray-100 rounded-xl transition-colors"
                    >
                      <span className="material-icons-round">add</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 參加設定 */}
              <div className="bg-white rounded-3xl p-5 shadow-sm space-y-5">
                <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                  <span className="material-icons-round text-[#A5BCCF]">group</span>
                  參加設定
                </h3>

                {/* 性別限制 */}
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-2 block">性別限制</label>
                  <div className="flex bg-[#F7F5F2] p-1 rounded-xl">
                    {[
                      { id: 'all', label: '不限' },
                      { id: 'male', label: '限男生' },
                      { id: 'female', label: '限女生' },
                    ].map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => updateFormData({ genderLimit: option.id })}
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

                {/* 加入審核 */}
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">加入審核</label>
                    <p className="text-xs text-gray-400 mt-0.5">需經主辦人同意才可加入</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateFormData({ requireApproval: !formData.requireApproval })}
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

                {/* 私密活動 */}
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">私密活動</label>
                    <p className="text-xs text-gray-400 mt-0.5">活動將不會顯示在探索頁面</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateFormData({ isPrivate: !formData.isPrivate })}
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
              </div>
          </div>
        </main>

        {/* 底部按鈕 */}
        <div className="fixed bottom-0 inset-x-0 p-5 bg-gradient-to-t from-[#F0EEE6] via-[#F0EEE6] to-transparent z-50 pt-10">
          <button
            onClick={handleSave}
            disabled={isSubmitting || isUpdating}
            className="w-full bg-[#Cfb9a5] text-white font-bold py-4 rounded-3xl shadow-[0_12px_30px_rgba(207,185,165,0.3)] flex items-center justify-center gap-2 active:scale-95 transition-transform hover:bg-[#b09b88] disabled:opacity-50"
          >
            {isSubmitting || isUpdating ? '儲存中...' : '儲存修改'}
            <span className="material-icons-round text-sm">save</span>
          </button>
        </div>
      </div>

      {/* 刪除確認彈窗 */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 mx-4 max-w-sm w-full shadow-2xl">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-rose-100 rounded-full flex items-center justify-center">
                <span className="material-icons-round text-3xl text-rose-500">delete_forever</span>
              </div>
              <h3 className="text-lg font-bold text-[#5C5C5C] mb-2">確定要刪除活動？</h3>
              <p className="text-sm text-[#949494] mb-6">刪除後將無法復原，所有參與者將收到通知。</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-3 px-4 bg-gray-100 text-[#5C5C5C] rounded-xl font-medium hover:bg-gray-200 transition"
                >
                  取消
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 py-3 px-4 bg-rose-500 text-white rounded-xl font-medium hover:bg-rose-600 transition disabled:opacity-50"
                >
                  {isDeleting ? '刪除中...' : '確定刪除'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 錯誤彈窗 */}
      {errorModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 mx-4 max-w-sm w-full shadow-2xl">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-[#5C5C5C] mb-2">{errorModal.title}</h3>
              <p className="text-sm text-[#949494] mb-6">{errorModal.message}</p>
              <button
                onClick={() => setErrorModal({ ...errorModal, show: false })}
                className="w-full py-3 px-4 bg-gray-100 text-[#5C5C5C] rounded-xl font-medium hover:bg-gray-200 transition"
              >
                我知道了
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
