'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import Image from 'next/image';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import MobileNav from '@/components/MobileNav';
import SideDrawer from '@/components/SideDrawer';
import DesktopHeader from '@/components/DesktopHeader';
import { WishlistItem, DrawerItem, Region } from '@/types/wishlist.types';

// Mock regions data
const regions: Region[] = [
  { id: 'all', label: '全部', country: '' },
  { id: 'kyoto', label: '京都', country: 'japan' },
  { id: 'osaka', label: '大阪', country: 'japan' },
  { id: 'tokyo', label: '東京', country: 'japan' },
  { id: 'seoul', label: '首爾', country: 'korea' },
  { id: 'bangkok', label: '曼谷', country: 'thailand' },
];

// Initial timeline items
const initialItems: WishlistItem[] = [
  {
    id: 'item-1',
    time: '09:00',
    title: '嵐山竹林小徑',
    description: '清晨漫步 · 避開人潮',
    badges: ['景點', '1.5 hr'],
    image: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=400&h=300&fit=crop',
    status: 'completed',
    type: 'attraction',
  },
  {
    id: 'item-2',
    time: '11:00',
    title: '渡月橋',
    description: '嵐山地標，欣賞桂川美景',
    badges: ['景點', '30 min'],
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400&h=300&fit=crop',
    status: 'completed',
    type: 'attraction',
  },
  {
    id: 'item-3',
    time: '12:00',
    title: '待安排',
    description: '點擊 + 按鈕加入項目',
    badges: [],
    image: '',
    status: 'pending',
    type: 'restaurant',
  },
  {
    id: 'item-4',
    time: '14:00',
    title: '茶道體驗',
    description: '建仁寺 · 深度文化',
    badges: ['體驗', '1.5 hr'],
    image: 'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=400&h=300&fit=crop',
    status: 'upcoming',
    type: 'activity',
  },
];

// Sortable Timeline Item Component
function SortableTimelineItem({
  item,
  index,
  onEdit,
  onDelete,
}: {
  item: WishlistItem;
  index: number;
  onEdit: (item: WishlistItem) => void;
  onDelete: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 'auto',
  };

  const isPending = item.status === 'pending';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex gap-4 ${index === 0 ? 'mb-2' : 'mt-2 mb-2'} group/item`}
    >
      {/* Left Column: Time + Status Marker */}
      <div className="flex flex-col items-center pt-2 gap-1 shrink-0 w-12 md:w-14">
        <span className="text-[10px] md:text-xs font-bold text-primary font-mono">{item.time}</span>
        {item.status === 'completed' && (
          <div className="w-3 h-3 rounded-full bg-primary ring-4 ring-background-light z-10" />
        )}
        {item.status === 'pending' && (
          <div className="w-4 h-4 rounded-full border-2 border-primary bg-background-light z-10 animate-pulse" />
        )}
        {item.status === 'upcoming' && (
          <div className="w-3 h-3 rounded-full bg-gray-300 ring-4 ring-background-light z-10" />
        )}
      </div>

      {/* Right Column: Content */}
      <div className="flex-1 relative">
        {isPending ? (
          <div className="h-24 md:h-28 border-2 border-dashed border-primary/30 rounded-2xl flex items-center justify-center bg-primary/5 cursor-pointer hover:bg-primary/10 transition-colors">
            <div className="text-center">
              <span className="material-icons-round text-primary text-2xl mb-1 animate-bounce">
                add_circle_outline
              </span>
              <p className="text-xs font-medium text-primary">點擊 + 按鈕加入項目</p>
            </div>
          </div>
        ) : (
          <div
            {...attributes}
            {...listeners}
            className={`bg-white rounded-2xl p-3 md:p-4 shadow-sm border border-gray-100 cursor-grab active:cursor-grabbing ${
              item.status === 'completed' ? 'opacity-80' : 'opacity-90'
            } ${isDragging ? 'shadow-xl ring-2 ring-primary/30' : ''}`}
          >
            <div className="flex gap-3">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden shrink-0 relative">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className={`object-cover ${item.status === 'completed' ? 'grayscale' : ''}`}
                />
              </div>
              <div className="flex flex-col justify-center flex-1 min-w-0">
                <h3 className="font-bold text-gray-800 text-sm md:text-base">{item.title}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                  {item.badges.map((badge) => (
                    <span
                      key={badge}
                      className="px-1.5 py-0.5 rounded bg-gray-100 text-[10px] text-gray-500"
                    >
                      {badge}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Edit/Delete buttons - show on hover */}
            <div className="absolute -right-1 top-2 flex flex-col gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(item);
                }}
                className="w-7 h-7 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
              >
                <span className="material-icons-round text-sm text-gray-600">edit</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(item.id);
                }}
                className="w-7 h-7 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-red-50 transition-colors"
              >
                <span className="material-icons-round text-sm text-red-500">delete</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function WishlistPage() {
  const [timelineItems, setTimelineItems] = useState<WishlistItem[]>(initialItems);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeRegion, setActiveRegion] = useState('all');
  const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);
  const shareMenuRef = useRef<HTMLDivElement>(null);

  // Close share menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target as Node)) {
        setIsShareMenuOpen(false);
      }
    };
    if (isShareMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isShareMenuOpen]);

  // Drag sensors with delay for long-press
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag end
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setTimelineItems((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over?.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }, []);

  // Handle add item from drawer
  const handleAddItem = useCallback((drawerItem: DrawerItem) => {
    const newItem: WishlistItem = {
      id: `item-${Date.now()}`,
      time: '12:00',
      title: drawerItem.name,
      description: drawerItem.description,
      badges: [...drawerItem.tags.slice(0, 2), drawerItem.duration || ''].filter(Boolean),
      image: drawerItem.image,
      status: 'upcoming',
      type: drawerItem.type,
    };

    setTimelineItems((items) => {
      // Find pending item and replace it, or add to end
      const pendingIndex = items.findIndex((i) => i.status === 'pending');
      if (pendingIndex !== -1) {
        const newItems = [...items];
        newItems[pendingIndex] = newItem;
        return newItems;
      }
      return [...items, newItem];
    });

    setIsDrawerOpen(false);
  }, []);

  // Handle edit item
  const handleEditItem = useCallback((item: WishlistItem) => {
    // For now, just log - can be extended to open edit modal
    console.log('Edit item:', item);
  }, []);

  // Handle delete item
  const handleDeleteItem = useCallback((id: string) => {
    setTimelineItems((items) => items.filter((i) => i.id !== id));
  }, []);

  // Timeline items (can add region filtering in the future)
  const displayItems = timelineItems;

  return (
    <div className="bg-[#F5F4F0] min-h-screen">
      {/* ========== Mobile + Tablet (< xl) ========== */}
      <div className="xl:hidden min-h-screen flex flex-col">
        {/* Background */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 bg-[#F5F4F0]" />
          <div className="absolute top-[5%] right-[-15%] w-80 h-80 bg-[#C8D6D3]/25 rounded-full blur-[80px]" />
          <div className="absolute bottom-[30%] left-[-15%] w-72 h-72 bg-[#D8D0C9]/25 rounded-full blur-[80px]" />
        </div>

        {/* Header */}
        <header className="relative z-20 sticky top-0 bg-[#F5F4F0]/95 backdrop-blur-md px-5 pt-5 pb-4">
          {/* Top Row: Region Selector + Share Button */}
          <div className="flex items-center justify-between gap-3">
            {/* Region Selector */}
            <div className="flex overflow-x-auto gap-2 hide-scrollbar flex-1">
              {regions.map((region) => (
                <button
                  key={region.id}
                  onClick={() => setActiveRegion(region.id)}
                  className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-medium transition-all ${
                    activeRegion === region.id
                      ? 'bg-white/80 backdrop-blur-xl text-[#5C5C5C] shadow-lg shadow-black/10 border border-white/60'
                      : 'bg-white/40 backdrop-blur-xl text-[#5C5C5C]/70 border border-white/30 hover:bg-white/60'
                  }`}
                >
                  {region.label}
                </button>
              ))}
            </div>

            {/* Custom Trip Button */}
            <button className="shrink-0 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20 hover:bg-primary/20 transition-colors">
              威廉客製行程
            </button>

            {/* Share Button */}
            <div className="relative shrink-0">
              <button
                onClick={() => setIsShareMenuOpen(!isShareMenuOpen)}
                className="w-10 h-10 rounded-full bg-white/60 backdrop-blur-xl border border-white/50 flex items-center justify-center hover:bg-white/80 transition-colors shadow-sm"
              >
                <span className="material-icons-round text-gray-600 text-xl">ios_share</span>
              </button>

              {/* Share Dropdown */}
              {isShareMenuOpen && (
                <div
                  ref={shareMenuRef}
                  className="absolute top-12 right-0 w-48 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 overflow-hidden z-50"
                >
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      setIsShareMenuOpen(false);
                    }}
                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
                  >
                    <span className="material-icons-round text-gray-500 text-lg">link</span>
                    <span className="text-sm text-gray-700">複製連結</span>
                  </button>
                  <button
                    onClick={() => setIsShareMenuOpen(false)}
                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left border-t border-gray-100"
                  >
                    <span className="material-icons-round text-gray-500 text-lg">person_add</span>
                    <span className="text-sm text-gray-400">分享好友</span>
                    <span className="text-[10px] text-gray-400 ml-auto">即將推出</span>
                  </button>
                  <button
                    onClick={() => setIsShareMenuOpen(false)}
                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left border-t border-gray-100"
                  >
                    <span className="material-icons-round text-gray-500 text-lg">request_quote</span>
                    <span className="text-sm text-gray-700">請求報價</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Timeline */}
        <main className="relative z-10 flex-1 px-5 py-6 pb-40">
          {/* Dashed vertical line */}
          <div
            className="absolute left-[29px] md:left-[32px] top-10 bottom-10 w-0.5 -z-10"
            style={{
              backgroundImage:
                'repeating-linear-gradient(to bottom, rgba(207,185,165,0.5) 0px, rgba(207,185,165,0.5) 6px, transparent 6px, transparent 14px)',
            }}
          />

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={displayItems.map((i) => i.id)}
              strategy={verticalListSortingStrategy}
            >
              {displayItems.map((item, index) => (
                <SortableTimelineItem
                  key={item.id}
                  item={item}
                  index={index}
                  onEdit={handleEditItem}
                  onDelete={handleDeleteItem}
                />
              ))}
            </SortableContext>
          </DndContext>

          {displayItems.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <span className="material-icons-round text-5xl mb-3">event_note</span>
              <p className="text-sm">尚未加入任何行程</p>
              <p className="text-xs mt-1">點擊右下角 + 按鈕開始規劃</p>
            </div>
          )}
        </main>

        {/* Floating Add Button */}
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="fixed bottom-28 right-5 z-30 w-14 h-14 rounded-full bg-primary text-white shadow-xl shadow-primary/40 flex items-center justify-center hover:scale-110 transition-transform active:scale-95"
        >
          <span className="material-icons-round text-2xl">add</span>
        </button>

        <MobileNav />
      </div>

      {/* ========== Desktop (xl+) ========== */}
      <div className="hidden xl:flex flex-col h-screen max-h-screen overflow-hidden">
        {/* Background gradients */}
        <div className="fixed inset-0 -z-10 pointer-events-none">
          <div className="absolute -top-[5%] -left-[15%] w-[500px] h-[500px] bg-[#D8D0C9] opacity-40 blur-[90px] rounded-full" />
          <div className="absolute -bottom-[10%] -right-[10%] w-[450px] h-[450px] bg-[#C8D6D3] opacity-40 blur-[90px] rounded-full" />
          <div className="absolute top-[40%] left-[20%] w-[300px] h-[300px] bg-[#E6DFDA] opacity-30 blur-[70px] rounded-full" />
        </div>

        {/* Header */}
        <div className="flex-shrink-0 px-8 py-6">
          <DesktopHeader />
        </div>

        {/* Main Content */}
        <div className="flex-1 px-8 pb-6 flex gap-6 min-h-0">
          {/* Left Sidebar */}
          <div className="w-[320px] flex flex-col gap-4 min-h-0">
            {/* Region Selector - Vertical */}
            <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/50 shadow-sm p-4">
              <h3 className="text-sm font-bold text-gray-700 mb-3">選擇地區</h3>
              <div className="space-y-2">
                {regions.map((region) => (
                  <button
                    key={region.id}
                    onClick={() => setActiveRegion(region.id)}
                    className={`w-full px-4 py-2.5 rounded-xl text-sm font-medium text-left transition-all ${
                      activeRegion === region.id
                        ? 'bg-[#94A3B8] text-white shadow-md'
                        : 'bg-white/50 text-gray-600 hover:bg-white/80'
                    }`}
                  >
                    {region.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Add Item Button */}
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="flex items-center justify-center gap-2 px-6 py-4 bg-primary text-white rounded-2xl shadow-lg shadow-primary/30 hover:bg-primary/90 transition-colors"
            >
              <span className="material-icons-round">add</span>
              <span className="font-bold">新增項目</span>
            </button>
          </div>

          {/* Right - Timeline */}
          <div className="flex-1 bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/50 p-6 overflow-y-auto min-h-0">
            <h2 className="text-xl font-bold text-gray-800 mb-6">行程時間軸</h2>

            <div className="relative">
              {/* Dashed vertical line */}
              <div
                className="absolute left-[28px] top-4 bottom-4 w-0.5 -z-10"
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(to bottom, rgba(207,185,165,0.5) 0px, rgba(207,185,165,0.5) 6px, transparent 6px, transparent 14px)',
                }}
              />

              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={displayItems.map((i) => i.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {displayItems.map((item, index) => (
                    <SortableTimelineItem
                      key={item.id}
                      item={item}
                      index={index}
                      onEdit={handleEditItem}
                      onDelete={handleDeleteItem}
                    />
                  ))}
                </SortableContext>
              </DndContext>

              {displayItems.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                  <span className="material-icons-round text-5xl mb-3">event_note</span>
                  <p className="text-sm">尚未加入任何行程</p>
                  <p className="text-xs mt-1">點擊左側「新增項目」開始規劃</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Side Drawer */}
      <SideDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSelectItem={handleAddItem}
      />
    </div>
  );
}
