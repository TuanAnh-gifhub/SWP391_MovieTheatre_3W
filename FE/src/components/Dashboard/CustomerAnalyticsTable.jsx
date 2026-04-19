import React from 'react';

export default function CustomerAnalyticsTable({ customers }) {
  return (
    <div className="bg-white rounded-2xl shadow p-4 overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-left text-gray-600">
            <th className="p-3">Tên khách hàng</th>
            <th className="p-3">Số đơn</th>
            <th className="p-3">Tổng chi tiêu</th>
          </tr>
        </thead>
        <tbody>
          {customers && customers.map((c) => (
            <tr key={c.customerId} className="border-t hover:bg-purple-50">
              <td className="p-3 text-blue-600 font-semibold">{c.fullName}</td>
              <td className="p-3">{c.totalOrders}</td>
              <td className="p-3 font-bold text-green-600">{(c.totalSpent || 0).toLocaleString('vi-VN')} VNĐ</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

