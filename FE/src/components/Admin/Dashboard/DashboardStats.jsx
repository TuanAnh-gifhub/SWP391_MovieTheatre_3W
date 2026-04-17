import React from "react";

const DashboardStats = ({ stats }) => {
  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      <div className="stat-card bg-blue-100 rounded-lg p-4 flex flex-col items-center">
        <span className="text-blue-600 font-bold text-lg">Tổng doanh thu</span>
        <span className="text-2xl font-bold">{stats?.totalRevenue?.toLocaleString() || 0} đ</span>
      </div>
      <div className="stat-card bg-green-100 rounded-lg p-4 flex flex-col items-center">
        <span className="text-green-600 font-bold text-lg">Tổng vé đã bán</span>
        <span className="text-2xl font-bold">{stats?.totalTickets?.toLocaleString() || 0}</span>
      </div>
      <div className="stat-card bg-purple-100 rounded-lg p-4 flex flex-col items-center">
        <span className="text-purple-600 font-bold text-lg">Khách hàng</span>
        <span className="text-2xl font-bold">{stats?.totalCustomers?.toLocaleString() || 0}</span>
      </div>
      <div className="stat-card bg-orange-100 rounded-lg p-4 flex flex-col items-center">
        <span className="text-orange-600 font-bold text-lg">Phòng chiếu</span>
        <span className="text-2xl font-bold">{stats?.totalRooms?.toLocaleString() || 0}</span>
      </div>
    </div>
  );
};

export default DashboardStats;

