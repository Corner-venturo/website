import { Trip } from "./types";

export const trips: Trip[] = [
  {
    id: 1,
    title: "京都賞楓五日遊",
    date: "2024/11/25 - 11/29",
    status: "upcoming",
    statusLabel: "即將出發",
    statusColor: "bg-[#94A3B8]",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCBqTUmBLXZhqnZPcQe1nIwGuRohyZdFc47OG_sWdrh-8saBlb34Y3uBw_YSd3Ydp2nV6EPktexnXTw9wPF6eb36Rn8uQRi2rpc1GaDxQWmwktHbyyAER_xn5iJHi57wdMmjPJMAPOHV6gWVqxjjPN6x3WoQ896n7YFsHWPU3QML6BZE7hdafcgPI1Fec6SXhNEWVo_t1Q8zw0I0CXTZmbO0cZY5vS3xQ7FdyX36K86T9W5NsNVF5QEMEo3e6tavseKbCcuFdaXTaUQ",
    members: 4,
    totalSpent: 12450,
    myBalance: -2480,
  },
  {
    id: 2,
    title: "東京跨年之旅",
    date: "2024/12/30 - 2025/1/3",
    status: "planning",
    statusLabel: "規劃中",
    statusColor: "bg-[#A8BCA1]",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD5_eWkWytRxj_z3ImVOFNOGbw-3gTjLrh0gJUyGKU2a4p-6Qw9h1Xya8DMPdQmIxwaNeXwgbjRF0271JMx8c8VVhLbPt1sXs9O2X6Z0wm3EdnU3D19GIYooQrZr1uqMCA1l0i9tM-EbMy30MIkmPHUSGd_2FWG8X10WUtwAeJ581lKAdLchWnRl1aMuDSwCXQbIe8kYx0vIGYxhlLHY-8_d-wmc_Rpacqcuy3JoV4hOo0GtBeZ1mZT-_1i3OFfeWdrxu3Gxsbnwvjk",
    members: 6,
    totalSpent: 3200,
    myBalance: 1600,
  },
  {
    id: 3,
    title: "沖繩夏日潛水",
    date: "2024/08/10 - 08/14",
    status: "completed",
    statusLabel: "已結束",
    statusColor: "bg-[#C5B6AF]",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBvF2J-hlJIbdIC1Zhk3h66lPKdCASqxoUNDT5DR9he5w1MfhJDXI1O_frJyo2uYhLobQ0_u1nLH0eQeEifXxnEQb0cz5wn2MJRTHFXe0Pkfa3JepHynrlVFLiyd66xSfjKz5z8Jxk2DzcoYdfFA2cCeba_l5jqRdopIxaedRspIjNrtHf3-Nyhhetfd2kO4xkzRwcxejVimNu5QbVu4NZz99d1uv1N4LpbDeXDMwpo0GHzix50XR4ZAGUWfcon0Ci41_X8fWT8xn16",
    members: 3,
    totalSpent: 28900,
    myBalance: 0,
  },
];
