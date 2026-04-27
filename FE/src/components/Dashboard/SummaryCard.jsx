import React from 'react';

export default function SummaryCard({ title, value, subtitle, icon, onClick, colorClass }) {
  return (
    <div
      onClick={onClick}
      className={`cursor-pointer p-5 rounded-2xl shadow transition transform hover:scale-[1.02] bg-white ${colorClass ?? ''}`}
    >
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-gray-600">{title}</div>
        <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-white/10">
          {icon}
        </div>
      </div>
      <div className="mt-4">
        <div className="text-2xl font-bold text-gray-900">{value !== undefined ? Number(value).toLocaleString() : '—'}</div>
        {subtitle && <div className="text-sm text-gray-500 mt-1">{subtitle}</div>}
      </div>
    </div>
  );
}

