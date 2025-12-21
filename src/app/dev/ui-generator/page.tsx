"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

interface SavedItem {
  id: string;
  name: string;
  prompt: string;
  page_type: string;
  created_at: string;
  updated_at: string;
}

export default function UIGeneratorPage() {
  const [prompt, setPrompt] = useState("");
  const [pageType, setPageType] = useState("page");
  const [generatedCode, setGeneratedCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [currentItemId, setCurrentItemId] = useState<string | null>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [showHistory, setShowHistory] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const pageTypes = [
    { id: "page", label: "完整頁面", icon: "web" },
    { id: "component", label: "組件", icon: "widgets" },
    { id: "form", label: "表單", icon: "edit_note" },
    { id: "list", label: "列表", icon: "list" },
    { id: "card", label: "卡片", icon: "credit_card" },
  ];

  const examplePrompts = [
    "建立一個旅遊景點詳情頁面，包含大圖、標題、評分、描述、開放時間和門票資訊",
    "建立一個旅伴邀請頁面，可以輸入手機號碼或掃 QR Code",
    "建立一個行程回顧頁面，用時間軸顯示旅行照片和備註",
    "建立一個費用統計卡片，顯示圓餅圖和分類支出",
  ];

  // 載入歷史記錄
  useEffect(() => {
    fetchSavedItems();
  }, []);

  const fetchSavedItems = async () => {
    try {
      const response = await fetch("/api/generated-ui");
      const data = await response.json();
      if (data.success) {
        setSavedItems(data.items || []);
      }
    } catch {
      console.error("Failed to fetch saved items");
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("請輸入頁面需求");
      return;
    }

    setIsLoading(true);
    setError("");
    setGeneratedCode("");
    setShowPreview(false);
    setCurrentItemId(null);

    try {
      const response = await fetch("/api/generate-ui", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, pageType }),
      });

      const data = await response.json();

      if (data.success) {
        setGeneratedCode(data.code);
        await handlePreview(data.code);
      } else {
        setError(data.error || "生成失敗");
      }
    } catch {
      setError("系統錯誤，請稍後再試");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreview = async (code?: string) => {
    const codeToPreview = code || generatedCode;
    if (!codeToPreview) return;

    setIsSaving(true);
    try {
      const response = await fetch("/api/preview-ui", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: codeToPreview }),
      });

      const data = await response.json();
      if (data.success) {
        setShowPreview(true);
        setPreviewKey((prev) => prev + 1);
      } else {
        setError(data.error || "預覽失敗");
      }
    } catch {
      setError("預覽儲存失敗");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async () => {
    if (!saveName.trim() || !generatedCode) return;

    setIsSaving(true);
    try {
      const url = currentItemId
        ? `/api/generated-ui/${currentItemId}`
        : "/api/generated-ui";
      const method = currentItemId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: saveName,
          code: generatedCode,
          prompt,
          pageType,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setCurrentItemId(data.item.id);
        setShowSaveDialog(false);
        fetchSavedItems();
        alert("儲存成功！");
      } else {
        setError(data.error || "儲存失敗");
      }
    } catch {
      setError("儲存失敗");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoad = async (item: SavedItem) => {
    try {
      const response = await fetch(`/api/generated-ui/${item.id}`);
      const data = await response.json();
      if (data.success) {
        setGeneratedCode(data.item.code);
        setPrompt(data.item.prompt || "");
        setPageType(data.item.page_type || "page");
        setCurrentItemId(data.item.id);
        setSaveName(data.item.name);
        await handlePreview(data.item.code);
      }
    } catch {
      setError("載入失敗");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("確定要刪除嗎？")) return;

    try {
      const response = await fetch(`/api/generated-ui/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (data.success) {
        if (currentItemId === id) {
          setCurrentItemId(null);
          setSaveName("");
        }
        fetchSavedItems();
      }
    } catch {
      setError("刪除失敗");
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCode);
    alert("已複製到剪貼簿！");
  };

  const handleRefine = async (refinement: string) => {
    if (!generatedCode || !refinement) return;

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/generate-ui", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `基於以下現有代碼進行修改：\n\n${generatedCode}\n\n修改需求：${refinement}`,
          pageType,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setGeneratedCode(data.code);
        await handlePreview(data.code);
      } else {
        setError(data.error || "修改失敗");
      }
    } catch {
      setError("系統錯誤，請稍後再試");
    } finally {
      setIsLoading(false);
    }
  };

  const [refinementPrompt, setRefinementPrompt] = useState("");

  return (
    <div className="min-h-screen bg-[#F0EEE6] font-sans">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-[#F0EEE6]/95 backdrop-blur-sm px-5 py-4 border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <Link
            href="/"
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm"
          >
            <span className="material-icons-round text-gray-600">arrow_back</span>
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-[#5C5C5C]">UI 生成器</h1>
            <p className="text-xs text-[#949494]">
              {currentItemId ? `編輯中: ${saveName}` : "用 AI 生成符合 Venturo 風格的頁面"}
            </p>
          </div>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              showHistory ? "bg-[#cfb9a5] text-white" : "bg-white text-gray-600"
            }`}
          >
            <span className="material-icons-round text-sm align-middle mr-1">history</span>
            歷史記錄
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-5 py-6">
        <div className="flex gap-6">
          {/* 左側：歷史記錄 */}
          {showHistory && (
            <div className="w-64 shrink-0">
              <div className="bg-white rounded-2xl shadow-sm p-4 sticky top-24">
                <h2 className="text-sm font-bold text-gray-600 mb-3 flex items-center">
                  <span className="material-icons-round text-lg mr-2">folder</span>
                  已儲存的 UI
                </h2>
                {savedItems.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-4">尚無儲存記錄</p>
                ) : (
                  <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                    {savedItems.map((item) => (
                      <div
                        key={item.id}
                        className={`p-3 rounded-xl cursor-pointer transition-all ${
                          currentItemId === item.id
                            ? "bg-[#cfb9a5]/20 border border-[#cfb9a5]"
                            : "bg-gray-50 hover:bg-gray-100"
                        }`}
                        onClick={() => handleLoad(item)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-700 truncate">
                              {item.name}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(item.updated_at).toLocaleDateString("zh-TW")}
                            </p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(item.id);
                            }}
                            className="text-gray-400 hover:text-red-500 ml-2"
                          >
                            <span className="material-icons-round text-sm">delete</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 中間：輸入和代碼 */}
          <div className="flex-1 space-y-6">
            {/* 頁面類型選擇 */}
            <div>
              <label className="text-sm font-bold text-gray-600 mb-3 block">生成類型</label>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {pageTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setPageType(type.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full shrink-0 transition-all ${
                      pageType === type.id
                        ? "bg-[#cfb9a5] text-white"
                        : "bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <span className="material-icons-round text-lg">{type.icon}</span>
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 需求輸入 */}
            <div>
              <label className="text-sm font-bold text-gray-600 mb-2 block">描述你的需求</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="例如：建立一個旅遊景點詳情頁面，包含大圖、標題、評分..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:border-[#cfb9a5] focus:ring-2 focus:ring-[#cfb9a5]/20 outline-none transition-all resize-none"
              />
            </div>

            {/* 範例提示 */}
            <div>
              <p className="text-xs text-gray-500 mb-2">點擊使用範例：</p>
              <div className="flex flex-wrap gap-2">
                {examplePrompts.map((example, i) => (
                  <button
                    key={i}
                    onClick={() => setPrompt(example)}
                    className="text-xs px-3 py-1.5 rounded-full bg-white border border-gray-200 text-gray-600 hover:border-[#cfb9a5] hover:text-[#cfb9a5] transition-colors"
                  >
                    {example.slice(0, 20)}...
                  </button>
                ))}
              </div>
            </div>

            {/* 生成按鈕 */}
            <button
              onClick={handleGenerate}
              disabled={isLoading || !prompt.trim()}
              className="w-full py-4 bg-[#cfb9a5] hover:bg-[#b09b88] disabled:bg-gray-300 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-[#cfb9a5]/30 disabled:shadow-none"
            >
              {isLoading ? (
                <>
                  <span className="material-icons-round animate-spin">sync</span>
                  AI 生成中...
                </>
              ) : (
                <>
                  <span className="material-icons-round">auto_awesome</span>
                  生成 UI
                </>
              )}
            </button>

            {/* 錯誤訊息 */}
            {error && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
                {error}
              </div>
            )}

            {/* 修改區塊 */}
            {generatedCode && (
              <div className="space-y-3 p-4 bg-white rounded-2xl shadow-sm">
                <label className="text-sm font-bold text-gray-600 block">
                  <span className="material-icons-round text-sm align-middle mr-1">edit</span>
                  繼續修改
                </label>
                <textarea
                  value={refinementPrompt}
                  onChange={(e) => setRefinementPrompt(e.target.value)}
                  placeholder="例如：把按鈕改成圓角、加入動畫效果、更換配色..."
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:border-[#cfb9a5] focus:ring-2 focus:ring-[#cfb9a5]/20 outline-none transition-all resize-none text-sm"
                />
                <button
                  onClick={() => {
                    handleRefine(refinementPrompt);
                    setRefinementPrompt("");
                  }}
                  disabled={isLoading || !refinementPrompt.trim()}
                  className="w-full py-3 bg-[#a5bccf] hover:bg-[#8fa8bd] disabled:bg-gray-300 text-white font-medium rounded-xl flex items-center justify-center gap-2 transition-all text-sm"
                >
                  <span className="material-icons-round text-sm">refresh</span>
                  套用修改
                </button>
              </div>
            )}

            {/* 生成結果 - 代碼 */}
            {generatedCode && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-gray-600">生成的代碼</h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSaveName(saveName || prompt.slice(0, 20) || "未命名");
                        setShowSaveDialog(true);
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#a8bfa6] text-white text-xs font-medium"
                    >
                      <span className="material-icons-round text-sm">save</span>
                      {currentItemId ? "更新" : "儲存"}
                    </button>
                    <button
                      onClick={() => handlePreview()}
                      disabled={isSaving}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#a5bccf] text-white text-xs font-medium"
                    >
                      <span className="material-icons-round text-sm">visibility</span>
                      預覽
                    </button>
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#cfb9a5] text-white text-xs font-medium"
                    >
                      <span className="material-icons-round text-sm">content_copy</span>
                      複製
                    </button>
                  </div>
                </div>
                <div className="relative">
                  <pre className="p-4 rounded-xl bg-gray-900 text-gray-100 text-xs overflow-x-auto max-h-[400px] overflow-y-auto">
                    <code>{generatedCode}</code>
                  </pre>
                </div>
              </div>
            )}
          </div>

          {/* 右側：預覽 */}
          <div className="w-[420px] shrink-0 sticky top-24 h-[calc(100vh-120px)]">
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden h-full flex flex-col">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-sm font-bold text-gray-600 flex items-center gap-2">
                  <span className="material-icons-round text-lg">phone_iphone</span>
                  即時預覽
                </h2>
                {showPreview && (
                  <a
                    href="/dev/ui-generator/preview"
                    target="_blank"
                    className="text-xs text-[#cfb9a5] flex items-center gap-1"
                  >
                    <span className="material-icons-round text-sm">open_in_new</span>
                    新視窗開啟
                  </a>
                )}
              </div>
              <div className="flex-1 bg-gray-100 flex items-center justify-center p-4">
                {showPreview ? (
                  <div className="w-[375px] h-[667px] bg-white rounded-[40px] shadow-xl overflow-hidden border-8 border-gray-800 relative">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-800 rounded-b-2xl z-10" />
                    <iframe
                      key={previewKey}
                      ref={iframeRef}
                      src={`/dev/ui-generator/preview?t=${previewKey}`}
                      className="w-full h-full"
                      title="UI Preview"
                    />
                  </div>
                ) : (
                  <div className="text-center text-gray-400">
                    <span className="material-icons-round text-6xl mb-2 block">preview</span>
                    <p className="text-sm">生成 UI 後將在此顯示預覽</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 儲存對話框 */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              {currentItemId ? "更新儲存" : "儲存 UI"}
            </h3>
            <input
              type="text"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              placeholder="輸入名稱..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#cfb9a5] focus:ring-2 focus:ring-[#cfb9a5]/20 outline-none mb-4"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowSaveDialog(false)}
                className="flex-1 py-3 bg-gray-100 text-gray-600 font-medium rounded-xl"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                disabled={!saveName.trim() || isSaving}
                className="flex-1 py-3 bg-[#cfb9a5] text-white font-medium rounded-xl disabled:bg-gray-300"
              >
                {isSaving ? "儲存中..." : "確認儲存"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
