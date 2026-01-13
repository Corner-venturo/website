import { Achievement, QuickAction } from "./types";

export const demoAchievements: Achievement[] = [
  { icon: "hiking", label: "百岳挑戰", color: "bg-[#A8BCA1]", rotate: "rotate-3" },
  { icon: "photo_camera", label: "攝影師", color: "bg-[#94A3B8]", rotate: "-rotate-2" },
  { icon: "restaurant", label: "美食家", color: "bg-[#C5B6AF]", rotate: "rotate-6" },
  { icon: "flight_takeoff", label: "飛行常客", color: "bg-[#D4C4A8]", rotate: "-rotate-3" },
];

export const demoQuickActions: QuickAction[] = [
  {
    title: "分帳管理",
    subtitle: "管理旅途花費",
    icon: "account_balance_wallet",
    color: "text-[#A8BFA6]",
    accent: "bg-[#A8BFA6]/10",
    href: "/split",
  },
  {
    title: "新手任務",
    subtitle: "完成任務領點數",
    icon: "emoji_events",
    color: "text-[#Cfb9a5]",
    accent: "bg-[#Cfb9a5]/10",
    href: "/split/tasks",
  },
];

export const demoFriends: string[] = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBvF2J-hlJIbdIC1Zhk3h66lPKdCASqxoUNDT5DR9he5w1MfhJDXI1O_frJyo2uYhLobQ0_u1nLH0eQeEifXxnEQb0cz5wn2MJRTHFXe0Pkfa3JepHynrlVFLiyd66xSfjKz5z8Jxk2DzcoYdfFA2cCeba_l5jqRdopIxaedRspIjNrtHf3-Nyhhetfd2kO4xkzRwcxejVimNu5QbVu4NZz99d1uv1N4LpbDeXDMwpo0GHzix50XR4ZAGUWfcon0Ci41_X8fWT8xn16",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCBqTUmBLXZhqnZPcQe1nIwGuRohyZdFc47OG_sWdrh-8saBlb34Y3uBw_YSd3Ydp2nV6EPktexnXTw9wPF6eb36Rn8uQRi2rpc1GaDxQWmwktHbyyAER_xn5iJHi57wdMmjPJMAPOHV6gWVqxjjPN6x3WoQ896n7YFsHWPU3QML6BZE7hdafcgPI1Fec6SXhNEWVo_t1Q8zw0I0CXTZmbO0cZY5vS3xQ7FdyX36K86T9W5NsNVF5QEMEo3e6tavseKbCcuFdaXTaUQ",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBvF2J-hlJIbdIC1Zhk3h66lPKdCASqxoUNDT5DR9he5w1MfhJDXI1O_frJyo2uYhLobQ0_u1nLH0eQeEifXxnEQb0cz5wn2MJRTHFXe0Pkfa3JepHynrlVFLiyd66xSfjKz5z8Jxk2DzcoYdfFA2cCeba_l5jqRdopIxaedRspIjNrtHf3-Nyhhetfd2kO4xkzRwcxejVimNu5QbVu4NZz99d1uv1N4LpbDeXDMwpo0GHzix50XR4ZAGUWfcon0Ci41_X8fWT8xn16",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuD5_eWkWytRxj_z3ImVOFNOGbw-3gTjLrh0gJUyGKU2a4p-6Qw9h1Xya8DMPdQmIxwaNeXwgbjRF0271JMx8c8VVhLbPt1sXs9O2X6Z0wm3EdnU3D19GIYooQrZr1uqMCA1l0i9tM-EbMy30MIkmPHUSGd_2FWG8X10WUtwAeJ581lKAdLchWnRl1aMuDSwCXQbIe8kYx0vIGYxhlLHY-8_d-wmc_Rpacqcuy3JoV4hOo0GtBeZ1mZT-_1i3OFfeWdrxu3Gxsbnwvjk",
];

export const realQuickActions: QuickAction[] = [
  {
    title: "記帳",
    subtitle: "記錄收支",
    icon: "account_balance_wallet",
    color: "text-[#10B981]",
    accent: "bg-[#10B981]/10",
    href: "/expense",
  },
  {
    title: "成長總覽",
    subtitle: "追蹤學習與健身",
    icon: "trending_up",
    color: "text-[#8B5CF6]",
    accent: "bg-[#8B5CF6]/10",
    href: "/my/growth",
  },
  {
    title: "分帳管理",
    subtitle: "多人分帳",
    icon: "group",
    color: "text-[#A8BFA6]",
    accent: "bg-[#A8BFA6]/10",
    href: "/split",
  },
  {
    title: "語言學習",
    subtitle: "為旅行做準備",
    icon: "translate",
    color: "text-[#7C9EB2]",
    accent: "bg-[#7C9EB2]/10",
    href: "/learn",
  },
  {
    title: "健身記錄",
    subtitle: "記錄訓練進度",
    icon: "fitness_center",
    color: "text-[#E8A87C]",
    accent: "bg-[#E8A87C]/10",
    href: "/fitness",
  },
  {
    title: "週報",
    subtitle: "查看本週成果",
    icon: "calendar_month",
    color: "text-[#6366F1]",
    accent: "bg-[#6366F1]/10",
    href: "/my/weekly-report",
  },
];
