import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function RevenueChart({ data }) {
  if (!data) return <div className="h-96 flex items-center justify-center">Loading chart...</div>;

  const labels = data.map(d => d.date);
  const values = data.map(d => d.revenue);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Doanh thu',
        data: values,
        backgroundColor: 'rgba(99,102,241,0.8)',
        borderRadius: 8,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { maxRotation: 45, minRotation: 45 } },
      y: { ticks: { callback: (val) => `${Number(val).toLocaleString('vi-VN')} ` } }
    }
  };

  return <div className="h-96 p-4 bg-white rounded-2xl shadow"><Bar data={chartData} options={options} /></div>;
}

