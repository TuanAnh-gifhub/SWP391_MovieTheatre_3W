import React from "react";

const RevenueCard = ({ revenueData }) => {
  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      <div className="revenue-card bg-blue-50 rounded-lg p-4 flex flex-col items-center">
        <span className="text-blue-600 font-bold text-lg">Doanh thu</span>
        <span className="text-xl font-bold">{revenueData?.revenue?.toLocaleString() || 0} VND</span>
      </div>
      <div className="revenue-card bg-green-50 rounded-lg p-4 flex flex-col items-center">
        <span className="text-green-600 font-bold text-lg">Vé</span>
        <span className="text-xl font-bold">{revenueData?.ticket?.toLocaleString() || 0} VND</span>
      </div>
      <div className="revenue-card bg-orange-50 rounded-lg p-4 flex flex-col items-center">
        <span className="text-orange-600 font-bold text-lg">F&B</span>
        <span className="text-xl font-bold">{revenueData?.food?.toLocaleString() || 0} VND</span>
      </div>
      <div className="revenue-card bg-red-50 rounded-lg p-4 flex flex-col items-center">
        <span className="text-red-600 font-bold text-lg">Giảm giá</span>
        <span className="text-xl font-bold">{revenueData?.discount?.toLocaleString() || 0} VND</span>
      </div>
    </div>
  );
};

export default RevenueCard;

