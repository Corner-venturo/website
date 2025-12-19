import { Achievement, QuickAction } from "./types";

export const demoAchievements: Achievement[] = [
  { icon: "hiking", label: "百岳挑戰", color: "bg-[#A8BCA1]", rotate: "rotate-3" },
  { icon: "photo_camera", label: "攝影師", color: "bg-[#94A3B8]", rotate: "-rotate-2" },
  { icon: "restaurant", label: "美食家", color: "bg-[#C5B6AF]", rotate: "rotate-6" },
  { icon: "flight_takeoff", label: "飛行常客", color: "bg-[#D4C4A8]", rotate: "-rotate-3" },
];

export const demoQuickActions: QuickAction[] = [
  {
    title: "進行中訂單",
    subtitle: "2 個即將出發",
    icon: "confirmation_number",
    color: "text-[#94A3B8]",
    accent: "bg-[#94A3B8]/10",
    href: "/orders",
  },
  {
    title: "歷史訂單",
    subtitle: "查看過往回憶",
    icon: "history_edu",
    color: "text-[#949494]",
    accent: "bg-[#E8E2DD]",
    href: "/orders",
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
    title: "進行中訂單",
    subtitle: "暫無訂單",
    icon: "confirmation_number",
    color: "text-[#94A3B8]",
    accent: "bg-[#94A3B8]/10",
    href: "/orders",
  },
  {
    title: "歷史訂單",
    subtitle: "查看過往回憶",
    icon: "history_edu",
    color: "text-[#949494]",
    accent: "bg-[#E8E2DD]",
    href: "/orders",
  },
];
