import React from "react";

const DashboardHeader = () => {
  return (
    <div className="dashboard-header flex items-center justify-between py-4 px-6 bg-white rounded-lg shadow mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard Analytics</h1>
        <p className="text-sm text-gray-500 mt-1">Hệ thống quản lý suất chiếu, doanh thu, phòng, nhân sự</p>
      </div>
      {/* Nút xuất báo cáo hoặc avatar admin nếu cần */}
      {/* <button className="btn btn-primary">Xuất báo cáo</button> */}
    </div>
  );
};

export default DashboardHeader;

