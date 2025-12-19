"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase";

type MainTab = "flight" | "stay";
type FlightTab = "outbound" | "return";

interface TripFlight {
  id: string;
  flight_type: "outbound" | "return";
  airline: string;
  flight_no: string;
  aircraft: string | null;
  departure_time: string;
  departure_date: string;
  departure_airport: string;
  departure_code: string;
  departure_terminal: string | null;
  arrival_time: string;
  arrival_date: string;
  arrival_airport: string;
  arrival_code: string;
  arrival_terminal: string | null;
  pnr: string | null;
  ticket_number: string | null;
  baggage_allowance: string | null;
  carry_on_allowance: string | null;
  meal_type: string | null;
  cabin_class: string | null;
  meeting_time: string | null;
  meeting_location: string | null;
  status: string;
  gate: string | null;
}

interface TripAccommodation {
  id: string;
  name: string;
  name_en: string | null;
  address: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  map_url: string | null;
  check_in_date: string;
  check_out_date: string;
  check_in_time: string;
  check_out_time: string;
  room_type: string | null;
  room_count: number;
  guests_count: number | null;
  confirmation_number: string | null;
  booking_platform: string | null;
  cover_image: string | null;
  notes: string | null;
}

function formatFlightDate(dateStr: string): string {
  const date = new Date(dateStr);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}月${day}日`;
}

function formatCheckDate(dateStr: string): string {
  const date = new Date(dateStr);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}/${day}`;
}

function calculateDuration(depTime: string, arrTime: string, depDate: string, arrDate: string): string {
  const dep = new Date(`${depDate}T${depTime}`);
  const arr = new Date(`${arrDate}T${arrTime}`);
  const diffMs = arr.getTime() - dep.getTime();
  const diffMins = Math.round(diffMs / 60000);
  const hours = Math.floor(diffMins / 60);
  const mins = diffMins % 60;
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
}

function calculateNights(checkIn: string, checkOut: string): number {
  const inDate = new Date(checkIn);
  const outDate = new Date(checkOut);
  const diffMs = outDate.getTime() - inDate.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

export default function FlightInfoPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const orderId = params.id as string;

  // 從 URL 參數讀取初始 tab
  const initialTab = searchParams.get("tab") === "stay" ? "stay" : "flight";
  const [mainTab, setMainTab] = useState<MainTab>(initialTab as MainTab);
  const [flightTab, setFlightTab] = useState<FlightTab>("outbound");

  // 資料庫資料
  const [flights, setFlights] = useState<TripFlight[]>([]);
  const [accommodation, setAccommodation] = useState<TripAccommodation | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 當 URL 參數改變時更新 tab
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "stay") {
      setMainTab("stay");
    }
  }, [searchParams]);

  // 載入資料
  useEffect(() => {
    async function loadData() {
      const supabase = createClient();
      setIsLoading(true);

      // 載入航班資料
      const { data: flightsData } = await supabase
        .from("trip_flights")
        .select("*")
        .eq("trip_id", orderId)
        .order("departure_date", { ascending: true });

      if (flightsData) {
        setFlights(flightsData);
      }

      // 載入住宿資料
      const { data: accommodationData } = await supabase
        .from("trip_accommodations")
        .select("*")
        .eq("trip_id", orderId)
        .single();

      if (accommodationData) {
        setAccommodation(accommodationData);
      }

      setIsLoading(false);
    }

    if (orderId) {
      loadData();
    }
  }, [orderId]);

  // 取得當前航班
  const outboundFlight = useMemo(() => flights.find(f => f.flight_type === "outbound"), [flights]);
  const returnFlight = useMemo(() => flights.find(f => f.flight_type === "return"), [flights]);
  const currentFlightData = flightTab === "outbound" ? outboundFlight : returnFlight;

  // 轉換為顯示格式
  const currentFlight = useMemo(() => {
    if (!currentFlightData) return null;
    return {
      airline: currentFlightData.airline,
      flightNo: currentFlightData.flight_no,
      aircraft: currentFlightData.aircraft || "---",
      status: currentFlightData.status === "confirmed" ? "準時起飛" : currentFlightData.status,
      departureTime: currentFlightData.departure_time.slice(0, 5),
      arrivalTime: currentFlightData.arrival_time.slice(0, 5),
      departureCode: currentFlightData.departure_code,
      arrivalCode: currentFlightData.arrival_code,
      departureAirport: `${currentFlightData.departure_airport}${currentFlightData.departure_terminal ? ` ${currentFlightData.departure_terminal}` : ""}`,
      arrivalAirport: `${currentFlightData.arrival_airport}${currentFlightData.arrival_terminal ? ` ${currentFlightData.arrival_terminal}` : ""}`,
      duration: calculateDuration(
        currentFlightData.departure_time,
        currentFlightData.arrival_time,
        currentFlightData.departure_date,
        currentFlightData.arrival_date
      ),
      date: formatFlightDate(currentFlightData.departure_date),
      gate: currentFlightData.gate || "--",
      seat: "--",
      pnr: currentFlightData.pnr || "------",
      baggage: currentFlightData.baggage_allowance || "--",
      carryOn: currentFlightData.carry_on_allowance || "--",
      meal: currentFlightData.meal_type || "--",
      cabin: currentFlightData.cabin_class || "--",
      meetingInfo: currentFlightData.meeting_time && currentFlightData.meeting_location
        ? `${currentFlightData.meeting_time.slice(0, 5)} ${currentFlightData.meeting_location}`
        : null,
    };
  }, [currentFlightData]);

  // 轉換住宿資料
  const stayInfo = useMemo(() => {
    if (!accommodation) return null;
    return {
      name: accommodation.name,
      nameEn: accommodation.name_en || "",
      address: accommodation.address,
      phone: accommodation.phone || "",
      checkIn: formatCheckDate(accommodation.check_in_date),
      checkOut: formatCheckDate(accommodation.check_out_date),
      nights: calculateNights(accommodation.check_in_date, accommodation.check_out_date),
      roomType: accommodation.room_type || "標準房",
      guests: accommodation.guests_count ? `${accommodation.guests_count} 位` : "--",
      confirmNo: accommodation.confirmation_number || "------",
      mapUrl: accommodation.map_url || "",
      image: accommodation.cover_image || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
    };
  }, [accommodation]);

  return (
    <div className="bg-[#F0EEE6] font-sans antialiased text-gray-900 min-h-screen flex flex-col">
      {/* 背景光暈 */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-[#A5BCCF]/20 rounded-full blur-3xl" />
        <div className="absolute bottom-[20%] left-[-10%] w-80 h-80 bg-[#Cfb9a5]/20 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-50 px-6 pt-12 pb-4 flex items-center justify-between">
        <Link
          href={`/orders/${orderId}`}
          className="bg-white/70 backdrop-blur-xl border border-white/60 w-10 h-10 flex items-center justify-center rounded-full shadow-sm text-gray-600 hover:text-[#Cfb9a5] transition-colors"
        >
          <span className="material-icons-round text-xl">arrow_back</span>
        </Link>

        {/* 中間切換按鈕 */}
        <div className="bg-white/70 backdrop-blur-xl border border-white/60 rounded-full p-1.5 flex gap-1 shadow-sm">
          <button
            onClick={() => setMainTab("flight")}
            className={`w-12 h-10 flex items-center justify-center rounded-full transition-all ${
              mainTab === "flight"
                ? "bg-[#A5BCCF] text-white shadow-md"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <span className="material-icons-round text-xl">flight</span>
          </button>
          <button
            onClick={() => setMainTab("stay")}
            className={`w-12 h-10 flex items-center justify-center rounded-full transition-all ${
              mainTab === "stay"
                ? "bg-[#A8BFA6] text-white shadow-md"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <span className="material-icons-round text-xl">hotel</span>
          </button>
        </div>

        <div className="w-10" />
      </header>

      {/* 航班子標籤：去程 / 回程 */}
      {mainTab === "flight" && (
        <div className="relative z-10 px-6 mb-4">
          <div className="bg-white/30 backdrop-blur rounded-xl p-1 flex border border-white/30">
            <button
              onClick={() => setFlightTab("outbound")}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                flightTab === "outbound"
                  ? "bg-white text-[#A5BCCF] shadow-sm"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <span className="material-icons-round text-sm">flight_takeoff</span>
              去程
            </button>
            <button
              onClick={() => setFlightTab("return")}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                flightTab === "return"
                  ? "bg-white text-[#Cfb9a5] shadow-sm"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <span className="material-icons-round text-sm">flight_land</span>
              回程
            </button>
          </div>
        </div>
      )}

      {/* 主要內容 */}
      <main className="relative z-10 flex-1 w-full overflow-y-auto pb-8 px-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-10 h-10 border-3 border-[#Cfb9a5]/30 border-t-[#Cfb9a5] rounded-full animate-spin mb-4" />
            <p className="text-sm text-gray-500">載入中...</p>
          </div>
        ) : mainTab === "flight" && !currentFlight ? (
          <div className="flex flex-col items-center justify-center py-16">
            <span className="material-icons-round text-5xl text-gray-300 mb-4">flight_takeoff</span>
            <p className="text-sm text-gray-500">尚無航班資訊</p>
          </div>
        ) : mainTab === "stay" && !stayInfo ? (
          <div className="flex flex-col items-center justify-center py-16">
            <span className="material-icons-round text-5xl text-gray-300 mb-4">hotel</span>
            <p className="text-sm text-gray-500">尚無住宿資訊</p>
          </div>
        ) : mainTab === "flight" && currentFlight ? (
          <>
            {/* ===== 航班內容 ===== */}
            {/* 航班主卡片 */}
            <div className="bg-white/60 backdrop-blur-xl border border-white/50 rounded-3xl p-6 mb-5 relative overflow-hidden shadow-lg">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#A5BCCF]/10 rounded-full blur-2xl pointer-events-none" />

              {/* 航空公司資訊 */}
              <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm">
                    <span className="material-symbols-outlined text-gray-800 text-2xl">airlines</span>
                  </div>
                  <div>
                    <h2 className="font-bold text-lg text-gray-800">{currentFlight.airline}</h2>
                    <div className="text-xs font-medium text-gray-500">{currentFlight.flightNo} · {currentFlight.aircraft}</div>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-[#E8F5E9] text-green-700 text-xs font-bold flex items-center gap-1 border border-green-100">
                  <span className="material-icons-round text-sm">check_circle</span>
                  {currentFlight.status}
                </span>
              </div>

              {/* 起降時間 */}
              <div className="flex justify-between items-center text-center mb-6 relative z-10">
                <div className="text-left w-1/3">
                  <div className="text-4xl font-bold text-gray-800 mb-1 tracking-tight">{currentFlight.departureTime}</div>
                  <div className="text-xl font-bold text-[#Cfb9a5]">{currentFlight.departureCode}</div>
                  <div className="text-xs text-gray-400 mt-1">{currentFlight.departureAirport}</div>
                </div>
                <div className="flex-1 px-2 flex flex-col items-center">
                  <div className="text-[10px] text-gray-400 font-medium mb-1 uppercase tracking-wide">{currentFlight.duration}</div>
                  <div className="w-full h-[2px] bg-gray-200 relative flex items-center justify-between">
                    <div className="w-2 h-2 rounded-full bg-gray-400 border-2 border-white" />
                    <span className="material-icons-round text-[#Cfb9a5] text-xl absolute left-1/2 transform -translate-x-1/2 rotate-90 bg-white/50 backdrop-blur-sm px-1 rounded-full">flight</span>
                    <div className="w-2 h-2 rounded-full bg-gray-400 border-2 border-white" />
                  </div>
                  <div className="text-[10px] text-[#Cfb9a5] font-bold mt-1 bg-[#Cfb9a5]/10 px-2 py-0.5 rounded-md">{currentFlight.date}</div>
                </div>
                <div className="text-right w-1/3">
                  <div className="text-4xl font-bold text-gray-800 mb-1 tracking-tight">{currentFlight.arrivalTime}</div>
                  <div className="text-xl font-bold text-[#Cfb9a5]">{currentFlight.arrivalCode}</div>
                  <div className="text-xs text-gray-400 mt-1">{currentFlight.arrivalAirport}</div>
                </div>
              </div>

              {/* 登機門和座位 */}
              <div className="grid grid-cols-2 gap-3 relative z-10">
                <div className="bg-white/50 border border-white/50 rounded-2xl py-3 px-4 flex justify-between items-center">
                  <span className="text-xs text-gray-500">登機門</span>
                  <span className="text-xl font-bold text-gray-800">{currentFlight.gate}</span>
                </div>
                <div className="bg-white/50 border border-white/50 rounded-2xl py-3 px-4 flex justify-between items-center">
                  <span className="text-xs text-gray-500">座位</span>
                  <span className="text-xl font-bold text-gray-800">{currentFlight.seat}</span>
                </div>
              </div>
            </div>

            {/* 訂位代號卡片 */}
            <div className="bg-white rounded-2xl shadow-sm mb-6 border border-gray-100 relative overflow-hidden">
              <div className="p-5 relative z-10">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-[10px] text-gray-400 mb-1 uppercase tracking-wider font-bold">訂位代號 (PNR)</div>
                    <div className="flex items-center gap-2">
                      <span className="text-3xl font-mono font-bold text-gray-800 tracking-widest">{currentFlight.pnr}</span>
                      <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 text-gray-400 hover:text-[#Cfb9a5] transition-colors">
                        <span className="material-icons-round text-base">content_copy</span>
                      </button>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="material-icons-round text-2xl text-gray-400">qr_code_2</span>
                  </div>
                </div>
              </div>

              <div className="relative flex items-center justify-center px-2">
                <div className="absolute left-0 w-4 h-8 bg-[#F0EEE6] rounded-r-full -ml-2" />
                <div className="absolute right-0 w-4 h-8 bg-[#F0EEE6] rounded-l-full -mr-2" />
                <div className="w-full border-t-2 border-dashed border-gray-200 h-px" />
              </div>

              <button className="w-full p-4 flex justify-between items-center hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#Cfb9a5]/10 flex items-center justify-center text-[#Cfb9a5]">
                    <span className="material-icons-round text-sm">confirmation_number</span>
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-gray-700">電子機票</div>
                    <div className="text-[10px] text-gray-400">點擊查看或下載 PDF</div>
                  </div>
                </div>
                <span className="material-icons-round text-gray-300 text-lg">chevron_right</span>
              </button>
            </div>

            {/* 詳細資訊 */}
            <div className="flex items-center justify-between mb-3 px-1">
              <h3 className="text-sm font-bold text-gray-800">詳細資訊</h3>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white/60 backdrop-blur-xl border border-white/50 p-4 rounded-2xl flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#A5BCCF]/20 flex items-center justify-center shrink-0">
                  <span className="material-icons-round text-[#A5BCCF] text-sm">luggage</span>
                </div>
                <div>
                  <div className="text-[10px] text-gray-500 mb-0.5">托運行李</div>
                  <div className="text-sm font-bold text-gray-800">{currentFlight.baggage}</div>
                </div>
              </div>
              <div className="bg-white/60 backdrop-blur-xl border border-white/50 p-4 rounded-2xl flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#A8BFA6]/20 flex items-center justify-center shrink-0">
                  <span className="material-icons-round text-[#A8BFA6] text-sm">backpack</span>
                </div>
                <div>
                  <div className="text-[10px] text-gray-500 mb-0.5">手提行李</div>
                  <div className="text-sm font-bold text-gray-800">{currentFlight.carryOn}</div>
                </div>
              </div>
              <div className="bg-white/60 backdrop-blur-xl border border-white/50 p-4 rounded-2xl flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#CFA5A5]/20 flex items-center justify-center shrink-0">
                  <span className="material-icons-round text-[#CFA5A5] text-sm">restaurant</span>
                </div>
                <div>
                  <div className="text-[10px] text-gray-500 mb-0.5">機上餐點</div>
                  <div className="text-sm font-bold text-gray-800">{currentFlight.meal}</div>
                </div>
              </div>
              <div className="bg-white/60 backdrop-blur-xl border border-white/50 p-4 rounded-2xl flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#E0D6A8]/20 flex items-center justify-center shrink-0">
                  <span className="material-icons-round text-yellow-600 text-sm">airline_seat_recline_extra</span>
                </div>
                <div>
                  <div className="text-[10px] text-gray-500 mb-0.5">艙等</div>
                  <div className="text-sm font-bold text-gray-800">{currentFlight.cabin}</div>
                </div>
              </div>
            </div>

            {/* 重要提示 */}
            <div className="bg-[#FDFCF8] p-5 rounded-2xl border border-[#Cfb9a5]/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-[#E0D6A8]/10 rounded-bl-full -mr-4 -mt-4" />
              <div className="flex items-center gap-2 mb-3 relative z-10">
                <span className="material-icons-round text-[#Cfb9a5]">tips_and_updates</span>
                <span className="font-bold text-sm text-gray-700">重要提示</span>
              </div>
              <ul className="text-xs text-gray-500 space-y-2.5 list-none relative z-10">
                {flightTab === "outbound" && currentFlight.meetingInfo && (
                  <li className="flex gap-2">
                    <span className="w-1 h-1 rounded-full bg-[#CFA5A5] mt-1.5 shrink-0" />
                    <span className="text-[#CFA5A5] font-medium">{currentFlight.meetingInfo}</span>
                  </li>
                )}
                <li className="flex gap-2">
                  <span className="w-1 h-1 rounded-full bg-[#Cfb9a5] mt-1.5 shrink-0" />
                  請於起飛前 2 小時抵達機場辦理登機手續。
                </li>
                <li className="flex gap-2">
                  <span className="w-1 h-1 rounded-full bg-[#Cfb9a5] mt-1.5 shrink-0" />
                  您的登機門可能會臨時變更，請隨時留意機場廣播。
                </li>
              </ul>
            </div>
          </>
        ) : stayInfo ? (
          <>
            {/* ===== 住宿內容 ===== */}
            {/* 飯店封面圖 */}
            <div className="relative w-full h-48 rounded-3xl overflow-hidden shadow-lg mb-5">
              <Image
                src={stayInfo.image}
                alt={stayInfo.name}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <span className="px-3 py-1 rounded-full bg-[#A8BFA6] text-white text-xs font-bold mb-2 inline-flex items-center gap-1">
                  <span className="material-icons-round text-sm">verified</span>
                  已確認
                </span>
                <h2 className="text-xl font-bold text-white">{stayInfo.name}</h2>
                <p className="text-xs text-white/80">{stayInfo.nameEn}</p>
              </div>
            </div>

            {/* 入住資訊主卡片 */}
            <div className="bg-white/60 backdrop-blur-xl border border-white/50 rounded-3xl p-6 mb-5 relative overflow-hidden shadow-lg">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#A8BFA6]/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex justify-between items-center text-center mb-6 relative z-10">
                <div className="text-left w-1/3">
                  <div className="text-[10px] text-gray-400 mb-1">入住</div>
                  <div className="text-3xl font-bold text-gray-800 tracking-tight">{stayInfo.checkIn}</div>
                  <div className="text-xs text-[#A8BFA6] font-medium mt-1">15:00 後</div>
                </div>
                <div className="flex-1 px-2 flex flex-col items-center">
                  <div className="px-4 py-1.5 bg-[#A8BFA6]/10 rounded-full">
                    <span className="text-sm font-bold text-[#A8BFA6]">{stayInfo.nights} 晚</span>
                  </div>
                  <div className="w-full h-[2px] bg-gray-200 relative flex items-center justify-between mt-2">
                    <div className="w-2 h-2 rounded-full bg-[#A8BFA6] border-2 border-white" />
                    <span className="material-icons-round text-[#A8BFA6] text-xl absolute left-1/2 transform -translate-x-1/2 bg-white/50 backdrop-blur-sm px-1 rounded-full">hotel</span>
                    <div className="w-2 h-2 rounded-full bg-[#A8BFA6] border-2 border-white" />
                  </div>
                </div>
                <div className="text-right w-1/3">
                  <div className="text-[10px] text-gray-400 mb-1">退房</div>
                  <div className="text-3xl font-bold text-gray-800 tracking-tight">{stayInfo.checkOut}</div>
                  <div className="text-xs text-[#CFA5A5] font-medium mt-1">11:00 前</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 relative z-10">
                <div className="bg-white/50 border border-white/50 rounded-2xl py-3 px-4 flex justify-between items-center">
                  <span className="text-xs text-gray-500">房型</span>
                  <span className="text-sm font-bold text-gray-800">{stayInfo.roomType}</span>
                </div>
                <div className="bg-white/50 border border-white/50 rounded-2xl py-3 px-4 flex justify-between items-center">
                  <span className="text-xs text-gray-500">入住</span>
                  <span className="text-sm font-bold text-gray-800">{stayInfo.guests}</span>
                </div>
              </div>
            </div>

            {/* 訂房確認卡片 */}
            <div className="bg-white rounded-2xl shadow-sm mb-6 border border-gray-100 relative overflow-hidden">
              <div className="p-5 relative z-10">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-[10px] text-gray-400 mb-1 uppercase tracking-wider font-bold">訂房確認號</div>
                    <div className="flex items-center gap-2">
                      <span className="text-3xl font-mono font-bold text-gray-800 tracking-widest">{stayInfo.confirmNo}</span>
                      <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 text-gray-400 hover:text-[#Cfb9a5] transition-colors">
                        <span className="material-icons-round text-base">content_copy</span>
                      </button>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="material-icons-round text-2xl text-gray-400">qr_code_2</span>
                  </div>
                </div>
              </div>

              <div className="relative flex items-center justify-center px-2">
                <div className="absolute left-0 w-4 h-8 bg-[#F0EEE6] rounded-r-full -ml-2" />
                <div className="absolute right-0 w-4 h-8 bg-[#F0EEE6] rounded-l-full -mr-2" />
                <div className="w-full border-t-2 border-dashed border-gray-200 h-px" />
              </div>

              <button className="w-full p-4 flex justify-between items-center hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#A8BFA6]/10 flex items-center justify-center text-[#A8BFA6]">
                    <span className="material-icons-round text-sm">description</span>
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-gray-700">訂房確認信</div>
                    <div className="text-[10px] text-gray-400">點擊查看詳細內容</div>
                  </div>
                </div>
                <span className="material-icons-round text-gray-300 text-lg">chevron_right</span>
              </button>
            </div>

            {/* 聯絡資訊 */}
            <div className="flex items-center justify-between mb-3 px-1">
              <h3 className="text-sm font-bold text-gray-800">聯絡資訊</h3>
            </div>

            <div className="space-y-3 mb-6">
              <div className="bg-white/60 backdrop-blur-xl border border-white/50 p-4 rounded-2xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#A5BCCF]/20 flex items-center justify-center shrink-0">
                  <span className="material-icons-round text-[#A5BCCF]">location_on</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] text-gray-500 mb-0.5">地址</div>
                  <div className="text-sm font-medium text-gray-800 truncate">{stayInfo.address}</div>
                </div>
                <a
                  href={stayInfo.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-[#A5BCCF] flex items-center justify-center text-white shrink-0 shadow-md active:scale-95 transition-transform"
                >
                  <span className="material-icons-round text-lg">map</span>
                </a>
              </div>

              <div className="bg-white/60 backdrop-blur-xl border border-white/50 p-4 rounded-2xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#Cfb9a5]/20 flex items-center justify-center shrink-0">
                  <span className="material-icons-round text-[#Cfb9a5]">phone</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] text-gray-500 mb-0.5">電話</div>
                  <div className="text-sm font-medium text-gray-800">{stayInfo.phone}</div>
                </div>
                <a
                  href={`tel:${stayInfo.phone}`}
                  className="w-10 h-10 rounded-full bg-[#Cfb9a5] flex items-center justify-center text-white shrink-0 shadow-md active:scale-95 transition-transform"
                >
                  <span className="material-icons-round text-lg">call</span>
                </a>
              </div>
            </div>

            {/* 入住須知 */}
            <div className="bg-[#FDFCF8] p-5 rounded-2xl border border-[#A8BFA6]/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-[#A8BFA6]/10 rounded-bl-full -mr-4 -mt-4" />
              <div className="flex items-center gap-2 mb-3 relative z-10">
                <span className="material-icons-round text-[#A8BFA6]">tips_and_updates</span>
                <span className="font-bold text-sm text-gray-700">入住須知</span>
              </div>
              <ul className="text-xs text-gray-500 space-y-2.5 list-none relative z-10">
                <li className="flex gap-2">
                  <span className="w-1 h-1 rounded-full bg-[#A8BFA6] mt-1.5 shrink-0" />
                  入住時間為 15:00 以後，退房時間為 11:00 以前。
                </li>
                <li className="flex gap-2">
                  <span className="w-1 h-1 rounded-full bg-[#A8BFA6] mt-1.5 shrink-0" />
                  請出示訂房確認信及護照辦理入住手續。
                </li>
                <li className="flex gap-2">
                  <span className="w-1 h-1 rounded-full bg-[#A8BFA6] mt-1.5 shrink-0" />
                  飯店位於國際通步行約 3 分鐘，交通便利。
                </li>
              </ul>
            </div>
          </>
        ) : null}
      </main>

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
