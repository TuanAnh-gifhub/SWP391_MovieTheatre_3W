import React from "react";
import { Bar } from "react-chartjs-2";

const RevenueChart = ({ chartData, options }) => {
  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default RevenueChart;

