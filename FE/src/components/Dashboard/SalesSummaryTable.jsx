import React from 'react';

export default function SalesSummaryTable({ rows }) {
  return (
    <div className="bg-white rounded-2xl shadow p-4 overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-left text-gray-600">
            <th className="p-3">Category</th>
            <th className="p-3">Order Volume</th>
            <th className="p-3">Revenue</th>
          </tr>
        </thead>
        <tbody>
          {rows && rows.map((r, idx) => (
            <tr key={idx} className="border-t">
              <td className="p-3">{r.category}</td>
              <td className="p-3">{r.orderVolume}</td>
              <td className="p-3 font-semibold">{r.revenue?.toLocaleString('vi-VN')} VNĐ</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

