"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useTripStore } from "@/stores/trip-store";
import { useAuthStore } from "@/stores/auth-store";
import ConfirmModal from "@/components/ConfirmModal";
import Toast from "@/components/Toast";

// Settlement type
interface Settlement {
  id: string;
  from_user: string;
  to_user: string;
  amount: number;
  status: 'pending' | 'completed' | 'cancelled';
  created_at: string;
  completed_at: string | null;
  from_profile?: {
    id: string;
    display_name: string | null;
    avatar_url: string | null;
  };
  to_profile?: {
    id: string;
    display_name: string | null;
    avatar_url: string | null;
  };
}

export default function SplitGroupDetailPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params.groupId as string;

  const { currentSplitGroup, fetchSplitGroupById, clearSplitGroup, isLoading } = useTripStore();
  const { user, initialize, isInitialized } = useAuthStore();

  const [activeTab, setActiveTab] = useState<"expenses" | "members" | "settle">("expenses");

  // Settlement states
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [loadingSettlements, setLoadingSettlements] = useState(false);

  // Modal states
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: 'pay' | 'confirm';
    debt?: { from: string; fromName: string; to: string; toName: string; amount: number };
    settlementId?: string;
  }>({ isOpen: false, type: 'pay' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Toast state
  const [toast, setToast] = useState<{ isOpen: boolean; message: string; variant: 'success' | 'info' }>({
    isOpen: false,
    message: '',
    variant: 'success'
  });

  // Celebration state
  const [showCelebration, setShowCelebration] = useState(false);

  // Member management states
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [availableMembers, setAvailableMembers] = useState<Array<{
    user_id: string;
    profile?: { display_name: string | null; avatar_url: string | null };
  }>>([]);
  const [selectedNewMembers, setSelectedNewMembers] = useState<string[]>([]);
  const [isAddingMembers, setIsAddingMembers] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<{ userId: string; name: string } | null>(null);
  const [addMemberTab, setAddMemberTab] = useState<'trip' | 'virtual'>('trip');
  const [virtualMemberName, setVirtualMemberName] = useState('');

  // 初始化 auth
  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [initialize, isInitialized]);

  const userId = user?.id || "";

  useEffect(() => {
    if (groupId && userId) {
      fetchSplitGroupById(groupId, userId);
    }
    return () => clearSplitGroup();
  }, [groupId, userId, fetchSplitGroupById, clearSplitGroup]);

  // Fetch settlements
  const fetchSettlements = useCallback(async () => {
    if (!groupId) return;
    setLoadingSettlements(true);
    try {
      const res = await fetch(`/api/settlements?groupId=${groupId}`);
      const data = await res.json();
      if (data.success) {
        setSettlements(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch settlements:', error);
    } finally {
      setLoadingSettlements(false);
    }
  }, [groupId]);

  useEffect(() => {
    if (groupId) {
      fetchSettlements();
    }
  }, [groupId, fetchSettlements]);

  // Check if a debt has a pending/completed settlement
  const getSettlementForDebt = (fromUser: string, toUser: string) => {
    return settlements.find(
      s => s.from_user === fromUser && s.to_user === toUser && s.status !== 'cancelled'
    );
  };

  // Handle "我已付款" click
  const handlePayClick = (debt: { from: string; fromName: string; to: string; toName: string; amount: number }) => {
    setConfirmModal({
      isOpen: true,
      type: 'pay',
      debt
    });
  };

  // Handle "確認已收款" click
  const handleConfirmReceiveClick = (settlementId: string) => {
    setConfirmModal({
      isOpen: true,
      type: 'confirm',
      settlementId
    });
  };

  // Submit payment (create settlement with pending status)
  const handleSubmitPayment = async () => {
    if (!confirmModal.debt) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/settlements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupId,
          fromUser: confirmModal.debt.from,
          toUser: confirmModal.debt.to,
          amount: confirmModal.debt.amount,
          note: '分帳結算'
        })
      });
      const data = await res.json();
      if (data.success) {
        await fetchSettlements();
        setToast({ isOpen: true, message: '已通知對方確認收款', variant: 'info' });
      }
    } catch (error) {
      console.error('Submit payment error:', error);
    } finally {
      setIsSubmitting(false);
      setConfirmModal({ isOpen: false, type: 'pay' });
    }
  };

  // Confirm receipt (update settlement to completed)
  const handleConfirmReceipt = async () => {
    if (!confirmModal.settlementId) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/settlements', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settlementId: confirmModal.settlementId,
          status: 'completed'
        })
      });
      const data = await res.json();
      if (data.success) {
        await fetchSettlements();

        // Check if all debts are settled
        const updatedSettlements = [...settlements];
        const settledCount = updatedSettlements.filter(s => s.status === 'completed' || s.id === confirmModal.settlementId).length;
        const totalDebts = currentSplitGroup?.debts?.length || 0;

        if (settledCount >= totalDebts && totalDebts > 0) {
          setShowCelebration(true);
        } else {
          setToast({ isOpen: true, message: '已確認收款，結算完成！', variant: 'success' });
        }
      }
    } catch (error) {
      console.error('Confirm receipt error:', error);
    } finally {
      setIsSubmitting(false);
      setConfirmModal({ isOpen: false, type: 'confirm' });
    }
  };

  // Check if all debts are settled
  const allSettled = currentSplitGroup?.debts?.every(debt => {
    const settlement = getSettlementForDebt(debt.from, debt.to);
    return settlement?.status === 'completed';
  }) && (currentSplitGroup?.debts?.length || 0) > 0;

  // Fetch available members from trip (if linked) when opening add member modal
  const fetchAvailableMembersFromTrip = useCallback(async () => {
    if (!currentSplitGroup?.trip_id) {
      setAvailableMembers([]);
      return;
    }

    try {
      const res = await fetch(`/api/trips/${currentSplitGroup.trip_id}/members`);
      const data = await res.json();
      if (data.success) {
        // Filter out existing split group members
        const existingIds = currentSplitGroup.memberBalances?.map(m => m.userId) || [];
        const available = (data.data || []).filter(
          (m: { user_id: string }) => !existingIds.includes(m.user_id)
        );
        setAvailableMembers(available);
      }
    } catch (error) {
      console.error('Failed to fetch trip members:', error);
    }
  }, [currentSplitGroup?.trip_id, currentSplitGroup?.memberBalances]);

  // Open add member modal
  const handleOpenAddMember = async () => {
    setSelectedNewMembers([]);
    await fetchAvailableMembersFromTrip();
    setShowAddMemberModal(true);
  };

  // Toggle member selection
  const toggleNewMember = (memberId: string) => {
    setSelectedNewMembers(prev =>
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  // Add selected members
  const handleAddMembers = async () => {
    if (selectedNewMembers.length === 0) return;

    setIsAddingMembers(true);
    try {
      const res = await fetch(`/api/split-groups/${groupId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userIds: selectedNewMembers }),
      });
      const data = await res.json();

      if (data.success) {
        setToast({ isOpen: true, message: `已新增 ${selectedNewMembers.length} 位成員`, variant: 'success' });
        setShowAddMemberModal(false);
        // Refresh the group data
        if (userId) {
          fetchSplitGroupById(groupId, userId);
        }
      } else {
        setToast({ isOpen: true, message: data.error || '新增失敗', variant: 'info' });
      }
    } catch (error) {
      console.error('Add members error:', error);
      setToast({ isOpen: true, message: '新增成員失敗', variant: 'info' });
    } finally {
      setIsAddingMembers(false);
    }
  };

  // Add virtual member (for friends who don't use the app)
  const handleAddVirtualMember = async () => {
    if (!virtualMemberName.trim()) return;

    setIsAddingMembers(true);
    try {
      const res = await fetch(`/api/split-groups/${groupId}/virtual-members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: virtualMemberName.trim() }),
      });
      const data = await res.json();

      if (data.success) {
        setToast({ isOpen: true, message: `已新增虛擬成員：${virtualMemberName}`, variant: 'success' });
        setVirtualMemberName('');
        setShowAddMemberModal(false);
        // Refresh the group data
        if (userId) {
          fetchSplitGroupById(groupId, userId);
        }
      } else {
        setToast({ isOpen: true, message: data.error || '新增失敗', variant: 'info' });
      }
    } catch (error) {
      console.error('Add virtual member error:', error);
      setToast({ isOpen: true, message: '新增虛擬成員失敗', variant: 'info' });
    } finally {
      setIsAddingMembers(false);
    }
  };

  // Remove member
  const handleRemoveMember = async () => {
    if (!memberToRemove) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/split-groups/${groupId}/members?userId=${memberToRemove.userId}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (data.success) {
        setToast({ isOpen: true, message: '已移除成員', variant: 'success' });
        setMemberToRemove(null);
        // Refresh the group data
        if (userId) {
          fetchSplitGroupById(groupId, userId);
        }
      } else {
        setToast({ isOpen: true, message: data.error || '移除失敗', variant: 'info' });
      }
    } catch (error) {
      console.error('Remove member error:', error);
      setToast({ isOpen: true, message: '移除成員失敗', variant: 'info' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if current user is owner
  const isOwner = currentSplitGroup?.memberBalances?.some(
    m => m.userId === userId && m.role === 'owner'
  );

  // 只有在沒有任何快取資料時才顯示完整載入畫面
  // 如果有快取（即使 ID 不同），先顯示舊資料，背景刷新
  const showFullLoading = isLoading && !currentSplitGroup;

  if (showFullLoading) {
    return (
      <div className="min-h-[100dvh] bg-[#F0EEE6] flex items-center justify-center">
        <div className="text-center">
          <span className="material-icons-round text-4xl text-[#Cfb9a5] animate-spin">
            sync
          </span>
          <p className="mt-2 text-gray-500">載入中...</p>
        </div>
      </div>
    );
  }

  // 如果有快取但 ID 不匹配，仍然顯示快取，等待背景刷新
  if (!currentSplitGroup) {
    return (
      <div className="min-h-[100dvh] bg-[#F0EEE6] flex items-center justify-center">
        <div className="text-center">
          <span className="material-icons-round text-4xl text-[#Cfb9a5] animate-spin">
            sync
          </span>
          <p className="mt-2 text-gray-500">載入中...</p>
        </div>
      </div>
    );
  }

  const group = currentSplitGroup;
  const myBalance = group.myBalance || 0;

  return (
    <div className="min-h-[100dvh] bg-[#F0EEE6] font-sans pb-32">
      {/* 背景刷新指示器 */}
      {isLoading && currentSplitGroup && (
        <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-[#Cfb9a5]/20">
          <div className="h-full bg-[#Cfb9a5] animate-pulse" style={{ width: '100%' }} />
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-20 bg-[#F0EEE6]/95 backdrop-blur-sm px-5 py-4 flex items-center gap-4 border-b border-gray-200/50">
        <Link
          href="/split"
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm active:scale-95 transition-transform"
        >
          <span className="material-icons-round text-gray-600">arrow_back</span>
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-[#5C5C5C]">{group.name}</h1>
          {group.trip && (
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <span className="material-icons-round text-xs">flight</span>
              {group.trip.title}
            </p>
          )}
        </div>
        <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm">
          <span className="material-icons-round text-gray-600">more_vert</span>
        </button>
      </header>

      {/* 餘額總覽 */}
      <div className="px-5 py-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500">我的餘額</span>
            <span className="text-xs text-gray-400">
              總支出 ${group.totalExpenses?.toLocaleString() || 0}
            </span>
          </div>
          <div className={`text-3xl font-bold ${myBalance >= 0 ? "text-green-600" : "text-red-500"}`}>
            {myBalance >= 0 ? "+" : "-"}${Math.abs(myBalance).toLocaleString()}
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {myBalance > 0
              ? "別人欠你這麼多"
              : myBalance < 0
              ? "你欠別人這麼多"
              : "已結清"}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-5 mb-4">
        <div className="flex bg-white rounded-xl p-1 shadow-sm">
          {[
            { id: "expenses", label: "費用記錄", icon: "receipt_long" },
            { id: "members", label: "成員", icon: "group" },
            { id: "settle", label: "結算", icon: "payments" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-[#Cfb9a5] text-white"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <span className="material-icons-round text-lg">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-5">
        {/* 費用記錄 */}
        {activeTab === "expenses" && (
          <div className="space-y-3">
            {group.expenses?.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <span className="material-icons-round text-5xl text-gray-300 mb-2">
                  receipt_long
                </span>
                <p>還沒有任何費用記錄</p>
                <p className="text-sm">點擊下方按鈕新增第一筆</p>
              </div>
            ) : (
              group.expenses?.map((expense) => (
                <Link
                  key={expense.id}
                  href={`/split/record?groupId=${groupId}&expenseId=${expense.id}`}
                  className="block bg-white rounded-xl p-4 shadow-sm active:scale-[0.98] transition-transform"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#Cfb9a5] to-[#B8A090] flex items-center justify-center">
                      <span className="material-icons-round text-white text-lg">
                        {expense.category === "food"
                          ? "restaurant"
                          : expense.category === "transport"
                          ? "directions_car"
                          : expense.category === "accommodation"
                          ? "hotel"
                          : expense.category === "shopping"
                          ? "shopping_bag"
                          : "receipt"}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-bold text-gray-800">{expense.title}</p>
                          <p className="text-xs text-gray-500">
                            {(expense as { paid_by_profile?: { display_name: string } }).paid_by_profile?.display_name || "某人"} 付款
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-800">
                            ${expense.amount.toLocaleString()}
                          </p>
                          <span className="material-icons-round text-gray-300 text-sm">edit</span>
                        </div>
                      </div>
                      {expense.description && (
                        <p className="text-sm text-gray-500 mt-1">
                          {expense.description}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        {expense.expense_date}
                      </p>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}

        {/* 成員餘額 */}
        {activeTab === "members" && (
          <div className="space-y-3">
            {/* 新增成員按鈕 */}
            {group.trip_id && (
              <button
                onClick={handleOpenAddMember}
                className="w-full p-4 rounded-xl border-2 border-dashed border-gray-300 hover:border-[#Cfb9a5] text-gray-400 hover:text-[#Cfb9a5] flex items-center justify-center gap-2 transition-colors active:scale-[0.98]"
              >
                <span className="material-icons-round">person_add</span>
                <span className="font-medium">新增成員</span>
              </button>
            )}

            {group.memberBalances?.map((member) => {
              const canRemove = member.userId !== userId && member.role !== 'owner';

              return (
                <div
                  key={member.userId}
                  className="bg-white rounded-xl p-4 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#Cfb9a5] to-[#B8A090] flex items-center justify-center overflow-hidden">
                      {member.avatarUrl ? (
                        <img
                          src={member.avatarUrl}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="material-icons-round text-white">person</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-800 flex items-center gap-1 flex-wrap">
                        {member.displayName || "成員"}
                        {member.userId === userId && (
                          <span className="text-xs text-[#Cfb9a5]">（你）</span>
                        )}
                        {member.role === 'owner' && (
                          <span className="text-xs bg-[#Cfb9a5]/20 text-[#Cfb9a5] px-1.5 py-0.5 rounded">建立者</span>
                        )}
                        {(member as { isVirtual?: boolean }).isVirtual && (
                          <span className="text-xs bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded">虛擬</span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500">
                        已付 ${member.totalPaid.toLocaleString()} / 應付 ${member.totalOwed.toLocaleString()}
                      </p>
                    </div>
                    <div className={`text-right ${member.balance >= 0 ? "text-green-600" : "text-red-500"}`}>
                      <p className="font-bold">
                        {member.balance >= 0 ? "+" : "-"}${Math.abs(member.balance).toLocaleString()}
                      </p>
                      <p className="text-xs">
                        {member.balance > 0 ? "可收" : member.balance < 0 ? "應付" : "已清"}
                      </p>
                    </div>
                  </div>

                  {/* 移除按鈕（只有 owner 可以移除其他人，且不能移除自己或其他 owner） */}
                  {isOwner && canRemove && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <button
                        onClick={() => setMemberToRemove({ userId: member.userId, name: member.displayName || '成員' })}
                        className="text-sm text-red-400 hover:text-red-500 flex items-center gap-1"
                      >
                        <span className="material-icons-round text-sm">person_remove</span>
                        移除成員
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* 結算 */}
        {activeTab === "settle" && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="material-icons-round text-[#Cfb9a5]">swap_horiz</span>
                最簡化的結算方式
              </h3>

              {group.debts?.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-3 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="material-icons-round text-3xl text-green-600">celebration</span>
                  </div>
                  <p className="text-gray-800 font-bold">太棒了！</p>
                  <p className="text-gray-500 text-sm">大家都結清了</p>
                </div>
              ) : allSettled ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-3 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="material-icons-round text-3xl text-green-600">check_circle</span>
                  </div>
                  <p className="text-gray-800 font-bold">全部結算完成！</p>
                  <p className="text-gray-500 text-sm">所有款項都已確認收訖</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {group.debts?.map((debt, index) => {
                    const settlement = getSettlementForDebt(debt.from, debt.to);
                    const isSettled = settlement?.status === 'completed';
                    const isPending = settlement?.status === 'pending';
                    const isMyDebt = debt.from === userId; // 我欠別人
                    const isMyCredit = debt.to === userId; // 別人欠我

                    return (
                      <div
                        key={index}
                        className={`p-4 rounded-xl border transition-all ${
                          isSettled
                            ? 'bg-gray-50 border-gray-200'
                            : 'bg-white border-gray-100'
                        }`}
                      >
                        {/* Debt info row */}
                        <div className="flex items-center gap-3 mb-3">
                          {/* From avatar */}
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center overflow-hidden ${
                            isSettled ? 'grayscale opacity-60' : 'bg-gradient-to-br from-[#CFA5A5] to-[#B89090]'
                          }`}>
                            <span className="material-icons-round text-white">person</span>
                          </div>

                          <div className="flex-1 flex items-center gap-2">
                            <span className={`font-medium ${isSettled ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                              {debt.fromName}
                              {debt.from === userId && <span className="text-xs text-[#CFA5A5]">（你）</span>}
                            </span>
                            <span className={`material-icons-round text-sm ${isSettled ? 'text-gray-300' : 'text-gray-400'}`}>
                              arrow_forward
                            </span>
                            <span className={`font-medium ${isSettled ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                              {debt.toName}
                              {debt.to === userId && <span className="text-xs text-[#A5BCCF]">（你）</span>}
                            </span>
                          </div>

                          {/* Amount */}
                          <div className="text-right">
                            {isSettled ? (
                              <div className="flex items-center gap-1">
                                <span className="text-gray-400 line-through text-sm">${debt.amount.toLocaleString()}</span>
                                <span className="material-icons-round text-green-500 text-lg">check_circle</span>
                              </div>
                            ) : (
                              <span className="font-bold text-[#Cfb9a5]">${debt.amount.toLocaleString()}</span>
                            )}
                          </div>
                        </div>

                        {/* Action buttons */}
                        {!isSettled && (
                          <div className="pt-2 border-t border-gray-100">
                            {isMyDebt && !isPending && (
                              <button
                                onClick={() => handlePayClick(debt)}
                                className="w-full py-2.5 bg-[#CFA5A5] hover:bg-[#C49898] text-white rounded-xl font-bold text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                              >
                                <span className="material-icons-round text-lg">payment</span>
                                我已付款
                              </button>
                            )}

                            {isMyDebt && isPending && (
                              <div className="text-center py-2">
                                <span className="text-sm text-gray-500 flex items-center justify-center gap-2">
                                  <span className="material-icons-round text-lg text-yellow-500">schedule</span>
                                  等待對方確認收款中...
                                </span>
                              </div>
                            )}

                            {isMyCredit && isPending && settlement && (
                              <button
                                onClick={() => handleConfirmReceiveClick(settlement.id)}
                                className="w-full py-2.5 bg-[#A5BCCF] hover:bg-[#96ADC0] text-white rounded-xl font-bold text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                              >
                                <span className="material-icons-round text-lg">verified</span>
                                確認已收款
                              </button>
                            )}

                            {isMyCredit && !isPending && (
                              <div className="text-center py-2">
                                <span className="text-sm text-gray-500">
                                  等待 {debt.fromName} 標記已付款
                                </span>
                              </div>
                            )}

                            {!isMyDebt && !isMyCredit && (
                              <div className="text-center py-2">
                                <span className="text-sm text-gray-400">
                                  {isPending ? '等待確認中' : '其他人的款項'}
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <p className="text-xs text-gray-500 text-center">
              按照上方建議的方式結算，可以最少次數完成所有分帳
            </p>
          </div>
        )}
      </div>

      {/* 底部新增按鈕 */}
      <div className="fixed bottom-0 left-0 right-0 p-5 bg-[#F0EEE6]/95 backdrop-blur-sm border-t border-gray-200/50">
        <Link
          href={`/split/record?groupId=${groupId}`}
          className="w-full py-4 bg-[#Cfb9a5] hover:bg-[#c0a996] text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-[#Cfb9a5]/30"
        >
          <span className="material-icons-round">add</span>
          新增費用
        </Link>
      </div>

      {/* Confirm Modal - Payment */}
      <ConfirmModal
        isOpen={confirmModal.isOpen && confirmModal.type === 'pay'}
        onClose={() => setConfirmModal({ isOpen: false, type: 'pay' })}
        onConfirm={handleSubmitPayment}
        title="確認已付款？"
        description={confirmModal.debt
          ? `你要確認已支付 $${confirmModal.debt.amount.toLocaleString()} 給 ${confirmModal.debt.toName} 嗎？確認後將通知對方確認收款。`
          : ''
        }
        confirmText="確認已付款"
        cancelText="取消"
        isLoading={isSubmitting}
        variant="warning"
        icon={
          <span className="material-icons-round text-3xl text-[#Cfb9a5]">payment</span>
        }
      />

      {/* Confirm Modal - Receive */}
      <ConfirmModal
        isOpen={confirmModal.isOpen && confirmModal.type === 'confirm'}
        onClose={() => setConfirmModal({ isOpen: false, type: 'confirm' })}
        onConfirm={handleConfirmReceipt}
        title="確認已收款？"
        description="確認收到款項後，此筆帳款將標記為已結清。"
        confirmText="確認收款"
        cancelText="取消"
        isLoading={isSubmitting}
        variant="info"
        icon={
          <span className="material-icons-round text-3xl text-[#A5BCCF]">verified</span>
        }
      />

      {/* Toast */}
      <Toast
        isOpen={toast.isOpen}
        onClose={() => setToast({ ...toast, isOpen: false })}
        message={toast.message}
        variant={toast.variant}
      />

      {/* Celebration Modal */}
      {showCelebration && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 mx-5 max-w-sm w-full shadow-2xl text-center animate-bounce-in">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">全部結清！</h2>
            <p className="text-gray-500 mb-6">恭喜！所有款項都已結算完成</p>
            <button
              onClick={() => setShowCelebration(false)}
              className="w-full py-3.5 bg-[#Cfb9a5] hover:bg-[#c0a996] text-white rounded-xl font-bold transition-all active:scale-[0.98]"
            >
              太棒了！
            </button>
          </div>
          <style jsx>{`
            @keyframes bounce-in {
              0% { transform: scale(0.5); opacity: 0; }
              50% { transform: scale(1.05); }
              100% { transform: scale(1); opacity: 1; }
            }
            .animate-bounce-in {
              animation: bounce-in 0.4s ease-out;
            }
          `}</style>
        </div>
      )}

      {/* Add Member Modal - 浮動置中 */}
      {showAddMemberModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowAddMemberModal(false)}
          />
          <div className="relative w-full max-w-md bg-white rounded-2xl overflow-hidden shadow-2xl animate-fade-in">
            {/* Header */}
            <div className="p-5 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-800">新增成員</h3>
                <button
                  onClick={() => setShowAddMemberModal(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
                >
                  <span className="material-icons-round text-gray-600">close</span>
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setAddMemberTab('trip')}
                  className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${
                    addMemberTab === 'trip'
                      ? 'bg-[#Cfb9a5] text-white'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  從行程選擇
                </button>
                <button
                  onClick={() => setAddMemberTab('virtual')}
                  className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${
                    addMemberTab === 'virtual'
                      ? 'bg-[#Cfb9a5] text-white'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  新增虛擬成員
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="max-h-[50vh] overflow-y-auto">
              {addMemberTab === 'trip' ? (
                <div className="p-5 space-y-3">
                  {availableMembers.length === 0 ? (
                    <div className="text-center py-8">
                      <span className="material-icons-round text-4xl text-gray-300 mb-2">group</span>
                      <p className="text-gray-500">沒有可新增的成員</p>
                      <p className="text-sm text-gray-400">所有行程成員都已加入</p>
                    </div>
                  ) : (
                    availableMembers.map((member) => (
                      <button
                        key={member.user_id}
                        onClick={() => toggleNewMember(member.user_id)}
                        className={`w-full p-4 rounded-xl border flex items-center gap-3 transition-all ${
                          selectedNewMembers.includes(member.user_id)
                            ? "border-[#Cfb9a5] bg-[#Cfb9a5]/10"
                            : "border-gray-200 bg-white"
                        }`}
                      >
                        <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
                          {member.profile?.avatar_url ? (
                            <img
                              src={member.profile.avatar_url}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#Cfb9a5] to-[#B8A090]">
                              <span className="material-icons-round text-white">person</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 text-left">
                          <p className="font-bold text-gray-800">
                            {member.profile?.display_name || "成員"}
                          </p>
                        </div>
                        <span
                          className={`material-icons-round text-2xl ${
                            selectedNewMembers.includes(member.user_id)
                              ? "text-[#Cfb9a5]"
                              : "text-gray-300"
                          }`}
                        >
                          {selectedNewMembers.includes(member.user_id)
                            ? "check_circle"
                            : "radio_button_unchecked"}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              ) : (
                <div className="p-5">
                  <p className="text-sm text-gray-500 mb-4">
                    為不使用 App 的朋友建立虛擬帳號，方便記帳分攤
                  </p>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">成員名稱</label>
                      <input
                        type="text"
                        value={virtualMemberName}
                        onChange={(e) => setVirtualMemberName(e.target.value)}
                        placeholder="例如：小明"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#Cfb9a5] focus:ring-2 focus:ring-[#Cfb9a5]/20 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-gray-100">
              {addMemberTab === 'trip' ? (
                <button
                  onClick={handleAddMembers}
                  disabled={selectedNewMembers.length === 0 || isAddingMembers}
                  className="w-full py-3.5 bg-[#Cfb9a5] hover:bg-[#c0a996] disabled:bg-gray-300 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                >
                  {isAddingMembers ? (
                    <>
                      <span className="material-icons-round animate-spin">sync</span>
                      新增中...
                    </>
                  ) : (
                    <>
                      <span className="material-icons-round">person_add</span>
                      新增 {selectedNewMembers.length > 0 ? `(${selectedNewMembers.length} 人)` : ''}
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleAddVirtualMember}
                  disabled={!virtualMemberName.trim() || isAddingMembers}
                  className="w-full py-3.5 bg-[#Cfb9a5] hover:bg-[#c0a996] disabled:bg-gray-300 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                >
                  {isAddingMembers ? (
                    <>
                      <span className="material-icons-round animate-spin">sync</span>
                      新增中...
                    </>
                  ) : (
                    <>
                      <span className="material-icons-round">person_add</span>
                      新增虛擬成員
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
          <style jsx>{`
            @keyframes slide-up {
              from { transform: translateY(100%); }
              to { transform: translateY(0); }
            }
            .animate-slide-up {
              animation: slide-up 0.3s ease-out;
            }
          `}</style>
        </div>
      )}

      {/* Remove Member Confirm Modal */}
      <ConfirmModal
        isOpen={!!memberToRemove}
        onClose={() => setMemberToRemove(null)}
        onConfirm={handleRemoveMember}
        title="移除成員？"
        description={`確定要將「${memberToRemove?.name}」從分帳群組中移除嗎？移除後對方將無法看到此群組的分帳記錄。`}
        confirmText="移除"
        cancelText="取消"
        isLoading={isSubmitting}
        variant="danger"
        icon={
          <span className="material-icons-round text-3xl text-red-500">person_remove</span>
        }
      />
    </div>
  );
}
