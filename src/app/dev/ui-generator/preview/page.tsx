"use client";
import React from 'react';

export default function ExpenseStatisticsPage() {
  const expenses = [
    { category: '旅遊', amount: 1250, color: '#a5bccf' }, // Morandi blue
    { category: '住宿', amount: 800, color: '#cfa5a5' }, // Morandi pink
    { category: '美食', amount: 650, color: '#e0d6a8' }, // Morandi yellow
    { category: '購物', amount: 400, color: '#a8bfa6' }, // Morandi green
    { category: '交通', amount: 200, color: '#cfb9a5' }, // Primary morandi brown
  ];

  const totalExpense = expenses.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="min-h-[100dvh] bg-[#F0EEE6] font-sans text-[#5C5C5C]">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-[#F0EEE6]/95 backdrop-blur-sm px-5 py-4 flex items-center justify-between">
        <button className="w-10 h-10 rounded-full bg-white/60 flex items-center justify-center shadow-sm active:scale-95 transition-transform text-[#5C5C5C]">
          <span className="material-icons-round">arrow_back</span>
        </button>
        <h1 className="text-xl font-bold text-[#5C5C5C]">費用統計</h1>
        <button className="w-10 h-10 rounded-full bg-white/60 flex items-center justify-center shadow-sm active:scale-95 transition-transform text-[#5C5C5C]">
          <span className="material-icons-round">more_vert</span>
        </button>
      </header>

      {/* Content Area */}
      <main className="px-5 pb-32 pt-4"> {/* pt-4 for spacing below header */}
        {/* Total Expense Card */}
        <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/50 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] p-5 mb-6">
          <h2 className="text-lg font-bold text-[#5C5C5C] mb-2">本月總支出</h2>
          <p className="text-3xl font-extrabold text-[#cfb9a5]">NT$ {totalExpense.toLocaleString()}</p>
        </div>

        {/* Expense Breakdown Card */}
        <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/50 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] p-5">
          <h2 className="text-lg font-bold text-[#5C5C5C] mb-4">支出明細</h2>
          
          {/* Pie Chart Placeholder */}
          <div className="flex justify-center items-center mb-6">
            <img 
              src="https://images.unsplash.com/photo-1551288259-f26df8015560?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0NTQxNXwwfDF8c2VhcmNofDEzfHxkYXRhJTIwdmlzdWFsaXphdGlvbiUyMHBpZSUyMGchYXJ0fGVufDB8fHx8MTY5OTc5MTI3MHww&ixlib=rb-4.0.3&q=80&w=400" 
              alt="Expense Pie Chart" 
              className="w-48 h-48 rounded-full object-cover shadow-md"
            />
          </div>

          {/* Categorized Spending List */}
          <div className="space-y-3">
            {expenses.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: item.color }}></div>
                  <span className="text-base text-[#5C5C5C]">{item.category}</span>
                </div>
                <span className="text-base font-medium text-[#5C5C5C]">NT$ {item.amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}