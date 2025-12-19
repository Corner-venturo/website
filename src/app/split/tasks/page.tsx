"use client";

import Link from "next/link";

// 任務資料
const beginnerTasks = [
  {
    id: "profile",
    icon: "face",
    iconBg: "bg-[#A5BCCF]/20",
    iconColor: "text-[#A5BCCF]",
    title: "完善個人檔案",
    description: "上傳頭像並填寫簡介",
    points: 50,
    status: "todo", // todo, claimable, completed
    href: "/my/profile",
  },
  {
    id: "first-expense",
    icon: "account_balance_wallet",
    iconBg: "bg-[#A8BFA6]/20",
    iconColor: "text-[#A8BFA6]",
    title: "記錄第一筆支出",
    description: "體驗記帳功能",
    points: 50,
    status: "todo",
    href: "/split/record",
  },
  {
    id: "add-friend",
    icon: "person_add",
    iconBg: "bg-[#CFA5A5]/20",
    iconColor: "text-[#CFA5A5]",
    title: "新增第一位旅伴",
    description: "邀請好友一起旅行",
    points: 30,
    status: "todo",
    href: "/my/friends",
  },
];

const exploreTasks = [
  {
    id: "create-trip",
    icon: "flight",
    iconBg: "bg-[#E0D6A8]/20",
    iconColor: "text-[#C5B078]",
    title: "建立一個新旅程",
    description: "規劃你的下一次冒險",
    points: 100,
    status: "todo",
    href: "/explore/create",
  },
  {
    id: "join-trip",
    icon: "group_add",
    iconBg: "bg-[#A5BCCF]/20",
    iconColor: "text-[#A5BCCF]",
    title: "加入一個揪團",
    description: "探索並加入有趣的行程",
    points: 80,
    status: "todo",
    href: "/explore",
  },
  {
    id: "first-login",
    icon: "check_circle",
    iconBg: "bg-gray-100",
    iconColor: "text-gray-400",
    title: "首次登入應用程式",
    description: "歡迎來到 Venturo",
    points: 10,
    status: "completed",
    href: null,
  },
];

const advancedTasks = [
  {
    id: "share-trip",
    icon: "share",
    iconBg: "bg-[#CFA5A5]/20",
    iconColor: "text-[#CFA5A5]",
    title: "分享你的旅程",
    description: "將回憶分享到社群媒體",
    points: 80,
    status: "todo",
    href: null,
  },
  {
    id: "ai-planner",
    icon: "auto_awesome",
    iconBg: "bg-[#E0D6A8]/20",
    iconColor: "text-[#C5B078]",
    title: "使用 AI 規劃行程",
    description: "讓 AI 幫你規劃完美旅程",
    points: 100,
    status: "todo",
    href: "/ai-planner",
  },
  {
    id: "complete-trip",
    icon: "verified",
    iconBg: "bg-[#A8BFA6]/20",
    iconColor: "text-[#A8BFA6]",
    title: "完成一趟旅程",
    description: "從出發到結束的完整體驗",
    points: 200,
    status: "todo",
    href: null,
  },
];

interface Task {
  id: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  title: string;
  description: string;
  points: number;
  status: string;
  href: string | null;
}

function TaskCard({ task }: { task: Task }) {
  const isCompleted = task.status === "completed";
  const isClaimable = task.status === "claimable";

  const content = (
    <div
      className={`bg-white/60 backdrop-blur-xl border rounded-2xl p-4 flex items-center gap-4 relative overflow-hidden ${
        isClaimable
          ? "border-[#Cfb9a5]/50 ring-2 ring-[#Cfb9a5]/30"
          : "border-white/50"
      } ${isCompleted ? "opacity-70" : ""}`}
    >
      {isClaimable && (
        <div className="absolute top-0 right-0 bg-[#Cfb9a5] text-white text-[10px] px-2 py-0.5 rounded-bl-lg font-medium">
          可領取
        </div>
      )}
      <div
        className={`w-12 h-12 rounded-xl ${task.iconBg} flex items-center justify-center ${task.iconColor} shrink-0`}
      >
        <span className="material-icons-round text-2xl">{task.icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <h4
          className={`font-bold text-sm truncate ${
            isCompleted
              ? "text-[#949494] line-through decoration-[#949494]"
              : "text-[#5C5C5C]"
          }`}
        >
          {task.title}
        </h4>
        <p className="text-xs text-[#949494] mt-0.5 truncate">
          {task.description}
        </p>
        <div
          className={`flex items-center gap-1 mt-2 ${
            isCompleted ? "opacity-50" : ""
          }`}
        >
          <span className="material-icons-round text-[10px] text-[#Cfb9a5]">
            monetization_on
          </span>
          <span className="text-xs font-bold text-[#Cfb9a5]">
            +{task.points}點
          </span>
        </div>
      </div>
      {isClaimable ? (
        <button className="bg-gradient-to-r from-[#E0D6A8] to-[#Cfb9a5] text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition-all active:scale-95 shrink-0 animate-pulse">
          領取獎勵
        </button>
      ) : isCompleted ? (
        <button
          className="bg-transparent text-[#949494] text-xs font-bold px-4 py-2 rounded-full border border-[#E8E2DD] shrink-0 cursor-not-allowed"
          disabled
        >
          已完成
        </button>
      ) : (
        <button className="bg-[#Cfb9a5] text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg shadow-[#Cfb9a5]/30 hover:bg-[#c0aa96] transition-all active:scale-95 shrink-0">
          去完成
        </button>
      )}
    </div>
  );

  // 只有「去完成」狀態才有連結，「領取獎勵」和「已完成」不需要連結
  if (task.href && !isCompleted && !isClaimable) {
    return <Link href={task.href}>{content}</Link>;
  }

  return content;
}

export default function TasksPage() {
  const currentPoints = 150;
  const targetPoints = 500;
  const progress = (currentPoints / targetPoints) * 100;

  return (
    <div className="bg-[#F5F4F0] min-h-screen font-sans">
      {/* 背景 */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute -top-[5%] -left-[15%] w-[500px] h-[500px] bg-[#D8D0C9] opacity-40 blur-[90px] rounded-full" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[450px] h-[450px] bg-[#C8D6D3] opacity-40 blur-[90px] rounded-full" />
        <div className="absolute top-[40%] right-[20%] w-[300px] h-[300px] bg-[#CFA5A5]/15 rounded-full blur-[70px]" />
      </div>

      {/* Header */}
      <header className="relative z-50 px-5 pt-12 pb-4 flex items-center justify-between">
        <Link
          href="/my"
          className="w-10 h-10 rounded-full flex items-center justify-center text-[#5C5C5C] hover:bg-black/5 transition-colors"
        >
          <span className="material-icons-round">arrow_back_ios_new</span>
        </Link>
        <h1 className="text-lg font-bold text-[#5C5C5C] tracking-tight">
          新手任務
        </h1>
        <button className="w-10 h-10 rounded-full flex items-center justify-center text-[#5C5C5C] hover:bg-black/5 transition-colors">
          <span className="material-icons-round">help_outline</span>
        </button>
      </header>

      {/* 主要內容 */}
      <main className="relative z-10 px-5 pb-10 space-y-6">
        {/* 進度卡片 */}
        <div className="w-full relative rounded-3xl overflow-hidden shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-br from-[#DBCBB9] to-[#Cfb9a5]" />
          <div className="absolute top-0 right-0 p-4 opacity-20">
            <span className="material-icons-round text-8xl text-white transform rotate-12">
              emoji_events
            </span>
          </div>
          <div className="relative z-10 p-6 text-white">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium bg-white/20 px-2 py-0.5 rounded-full border border-white/20">
                  新手旅人
                </span>
                <span className="text-xs opacity-80">Lv.1</span>
              </div>
              <Link
                href="/split/shop"
                className="flex items-center gap-1 text-xs font-medium bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-full border border-white/20 transition-colors"
              >
                <span className="material-icons-round text-sm">storefront</span>
                點數商店
              </Link>
            </div>
            <h2 className="text-2xl font-bold mb-4 tracking-wide">
              完成任務，開啟旅程
            </h2>
            <div className="flex items-end gap-2 mb-2">
              <span className="text-4xl font-bold">{currentPoints}</span>
              <span className="text-sm font-medium opacity-80 mb-1.5">
                / {targetPoints} 點數
              </span>
            </div>
            <div className="w-full bg-black/10 rounded-full h-2 mb-2 overflow-hidden backdrop-blur-sm">
              <div
                className="bg-white h-full rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs opacity-70">
              再獲得 {targetPoints - currentPoints} 點即可升級為「探索者」
            </p>
          </div>
        </div>

        {/* 新手必做 */}
        <section>
          <h3 className="font-bold text-[#5C5C5C] text-base mb-3 flex items-center gap-2">
            <span className="material-icons-round text-[#CFA5A5]">
              local_fire_department
            </span>
            新手必做
          </h3>
          <div className="space-y-4">
            {beginnerTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </section>

        {/* 探索旅程 */}
        <section>
          <h3 className="font-bold text-[#5C5C5C] text-base mb-3 flex items-center gap-2">
            <span className="material-icons-round text-[#A5BCCF]">explore</span>
            探索旅程
          </h3>
          <div className="space-y-4">
            {exploreTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </section>

        {/* 進階挑戰 */}
        <section>
          <h3 className="font-bold text-[#5C5C5C] text-base mb-3 flex items-center gap-2">
            <span className="material-icons-round text-[#Cfb9a5]">
              military_tech
            </span>
            進階挑戰
          </h3>
          <div className="space-y-4">
            {advancedTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
