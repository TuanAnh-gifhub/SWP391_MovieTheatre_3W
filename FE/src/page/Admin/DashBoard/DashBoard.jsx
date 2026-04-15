import React, { useEffect, useState } from "react";
import { Bar, Pie, Line, Doughnut } from "react-chartjs-2";
import { getSummaryByDate, getSalesSummary, downloadSalesSummaryPdf, downloadSalesSummaryCsv, downloadDashboardRevenuePdf, getCustomerUsageReport, downloadCustomerReportPdf } from "../../../service/dashboard";
import { getAllUsers } from "../../../service/user-management";
import { getAllEmployees } from "../../../service/employee";
import { getAllCinemaRooms } from "../../../service/cinemaroom";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { 
  Users, 
  UserCheck, 
  User, 
  Building2, 
  Film, 
  BarChart3, 
  Download,
  Calendar,
  Clock,
  TrendingUp,
  DollarSign,
  Ticket,
  Popcorn,
  Gift,
  Target,
  FileText,
  FileSpreadsheet
} from "lucide-react";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, LineElement, PointElement, Title, Tooltip, Legend, Filler);

const GRADIENTS = [
  ["#3b82f6", "#60a5fa"], // Tổng doanh thu - Blue
  ["#10b981", "#34d399"], // Vé - Green
  ["#f59e0b", "#fbbf24"], // Đồ ăn - Orange
  ["#ef4444", "#f87171"], // Giảm giá - Red
  ["#8b5cf6", "#a78bfa"], // Mua bằng điểm - Purple
];

const timeRanges = [
  { label: "7 ngày", value: 7 },
  { label: "30 ngày", value: 30 },
  { label: "Tất cả", value: 0 },
];

const DashBoard = () => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEmployees: 0,
    totalCustomers: 0,
    totalCinemas: 0,
    totalRooms: 0,
    roomsPerCinema: {},
    userTypeStats: { admin: 0, employee: 0, customer: 0 },
    cinemaList: [],
  });
  const [timeRange, setTimeRange] = useState(7);
  const [barRoomsData, setBarRoomsData] = useState(null);
  const [pieUserTypeData, setPieUserTypeData] = useState(null);
  const [movieList, setMovieList] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState('ALL');
  const [salesSummary, setSalesSummary] = useState([]);
  const [salesBarData, setSalesBarData] = useState(null);
  const [fromDate, setFromDate] = useState("2025-07-10");
  const [toDate, setToDate] = useState("2025-07-25");
  const navigate = useNavigate();

  // State cho báo cáo khách hàng sử dụng nhiều
  const [customerReport, setCustomerReport] = useState([]);
  const [customerReportLoading, setCustomerReportLoading] = useState(false);
  const [customerReportDownloadLoading, setCustomerReportDownloadLoading] = useState(false);
  const [customerReportDateRange, setCustomerReportDateRange] = useState({
    start: "2025-07-01",
    end: "2025-07-30"
  });
  const [customerReportSortBy, setCustomerReportSortBy] = useState("totalSpent");
  const [customerReportDirection, setCustomerReportDirection] = useState("desc");

  useEffect(() => {
    // Lấy số liệu tổng quan
    const fetchStats = async () => {
      // Users
      const users = await getAllUsers();
      let totalUsers = users.length;
      let totalEmployees = 0;
      let totalCustomers = 0;
      let totalAdmins = 0;
      users.forEach(u => {
        if (u.role === "ADMIN" || u.role === "admin") totalAdmins++;
        else if (u.role === "EMPLOYEE" || u.role === "employee") totalEmployees++;
        else if (u.role === "CUSTOMER" || u.role === "customer") totalCustomers++;
      });
      // Nếu không có role, lấy từ API employee
      if (totalEmployees === 0) {
        const empRes = await getAllEmployees();
        totalEmployees = Array.isArray(empRes.result) ? empRes.result.length : 0;
      }
      if (totalCustomers === 0) totalCustomers = totalUsers - totalEmployees - totalAdmins;

      // CinemaRooms
      const roomRes = await getAllCinemaRooms();
      const rooms = Array.isArray(roomRes.data) ? roomRes.data : [];
      let totalRooms = rooms.length;
      // Group by cinemaId or cinemaName
      const roomsPerCinema = {};
      const cinemaList = [];
      rooms.forEach(r => {
        const cinema = r.cinemaName || r.cinemaId || "Khác";
        if (!roomsPerCinema[cinema]) roomsPerCinema[cinema] = 0;
        roomsPerCinema[cinema]++;
        if (!cinemaList.find(c => c.cinemaName === r.cinemaName)) {
          cinemaList.push({ cinemaName: r.cinemaName, cinemaId: r.cinemaId });
        }
      });
      const totalCinemas = Object.keys(roomsPerCinema).length;

      setStats({
        totalUsers,
        totalEmployees,
        totalCustomers,
        totalCinemas,
        totalRooms,
        roomsPerCinema,
        userTypeStats: { admin: totalAdmins, employee: totalEmployees, customer: totalCustomers },
        cinemaList,
      });
      // Pie chart user type
      setPieUserTypeData({
        labels: ["Admin", "Nhân viên", "Khách hàng"],
        datasets: [
          {
            data: [totalAdmins, totalEmployees, totalCustomers],
            backgroundColor: ["#6366f1", "#22c55e", "#f59e42"],
            borderWidth: 2,
          },
        ],
      });
      // Bar chart rooms per cinema
      setBarRoomsData({
        labels: Object.keys(roomsPerCinema),
        datasets: [
          {
            label: "Số phòng",
            data: Object.values(roomsPerCinema),
            backgroundColor: "#a855f7",
            borderRadius: 8,
          },
        ],
      });
    };
    fetchStats();
  }, []);

  useEffect(() => {
    getSummaryByDate().then((data) => {
      if (data.status === 200 && Array.isArray(data.result)) {
        let filtered = data.result;
        if (timeRange > 0) {
          filtered = data.result.slice(-timeRange);
        }
        filtered = filtered.reverse();
        // Lấy danh sách phim duy nhất từ tất cả ngày
        const allMovies = filtered.flatMap(day => day.movies.map(mv => mv.movieTitle)).filter(Boolean);
        const uniqueMovies = Array.from(new Set(allMovies));
        setMovieList(uniqueMovies);
        const dates = [];
        const totalMoney = [];
        const totalMoneyWithoutFoodAndDiscount = [];
        const totalMoneyFood = [];
        const totalMoneyDiscount = [];
        const buyByScore = [];

        filtered.forEach((day) => {
          let sumTotalMoneyWithoutFoodAndDiscount = 0;
          let sumTotalMoneyFood = 0;
          let sumTotalMoneyDiscount = 0;
          let sumBuyByScore = 0;
          // Nếu chọn ALL thì cộng tất cả phim, nếu chọn 1 phim thì chỉ cộng phim đó
          const movies = selectedMovie === 'ALL'
            ? day.movies
            : day.movies.filter(mv => mv.movieTitle === selectedMovie);
          movies.forEach((mv) => {
            sumTotalMoneyWithoutFoodAndDiscount += mv.totalMoneyWithoutFoodAndDiscount || 0;
            sumTotalMoneyFood += mv.totalMoneyFood || 0;
            sumTotalMoneyDiscount += mv.totalMoneyDiscount || 0;
            sumBuyByScore += mv.buyByScore || 0;
          });
          // Công thức tổng doanh thu
          const sumTotalMoney = sumTotalMoneyWithoutFoodAndDiscount + sumTotalMoneyFood - sumTotalMoneyDiscount;
          dates.push(day.exportDate);
          totalMoney.push(sumTotalMoney);
          totalMoneyWithoutFoodAndDiscount.push(sumTotalMoneyWithoutFoodAndDiscount);
          totalMoneyFood.push(sumTotalMoneyFood);
          totalMoneyDiscount.push(sumTotalMoneyDiscount);
          buyByScore.push(sumBuyByScore);
        });

       
        setChartData({
          labels: dates,
          datasets: [
            {
              label: "Tổng doanh thu",
              data: totalMoney,
              backgroundColor: GRADIENTS[0][0],
              borderColor: GRADIENTS[0][1],
              borderWidth: 2,
              borderRadius: 8,
              hoverBackgroundColor: GRADIENTS[0][1],
            },
            {
              label: "Vé bán ra",
              data: totalMoneyWithoutFoodAndDiscount,
              backgroundColor: GRADIENTS[1][0],
              borderColor: GRADIENTS[1][1],
              borderWidth: 2,
              borderRadius: 8,
              hoverBackgroundColor: GRADIENTS[1][1],
            },
            {
              label: "Đồ ăn & đồ uống",
              data: totalMoneyFood,
              backgroundColor: GRADIENTS[2][0],
              borderColor: GRADIENTS[2][1],
              borderWidth: 2,
              borderRadius: 8,
              hoverBackgroundColor: GRADIENTS[2][1],
            },
            {
              label: "Giảm giá & khuyến mãi",
              data: totalMoneyDiscount,
              backgroundColor: GRADIENTS[3][0],
              borderColor: GRADIENTS[3][1],
              borderWidth: 2,
              borderRadius: 8,
              hoverBackgroundColor: GRADIENTS[3][1],
            },
            {
              label: "Mua bằng điểm thưởng",
              data: buyByScore,
              backgroundColor: GRADIENTS[4][0],
              borderColor: GRADIENTS[4][1],
              borderWidth: 2,
              borderRadius: 8,
              hoverBackgroundColor: GRADIENTS[4][1],
            },
          ],
        });
      }
      setLoading(false);
    });
  }, [timeRange, selectedMovie]);

  useEffect(() => {
    // Lấy sales summary (demo: lấy tuần 28-29/2025)
    getSalesSummary({ from: fromDate, to: toDate }).then((data) => {
      setSalesSummary(data);
      // Chuẩn bị dữ liệu cho biểu đồ cột: group theo timeSlot, cộng revenue
      const slotMap = {};
      data.forEach(item => {
        if (!slotMap[item.timeSlot]) slotMap[item.timeSlot] = 0;
        slotMap[item.timeSlot] += item.revenue || 0;
      });
      setSalesBarData({
        labels: Object.keys(slotMap),
        datasets: [
          {
            label: "Tổng doanh thu (theo ngày)",
            data: Object.values(slotMap),
            backgroundColor: "#1890ff",
            borderRadius: 8,
          },
        ],
      });
    });
  }, [fromDate, toDate]);

  // Fetch báo cáo khách hàng sử dụng nhiều
  useEffect(() => {
    const fetchCustomerReport = async () => {
      setCustomerReportLoading(true);
      try {
        const response = await getCustomerUsageReport({
          start: customerReportDateRange.start,
          end: customerReportDateRange.end,
          sortBy: customerReportSortBy,
          direction: customerReportDirection
        });
        
        if (response.success) {
          setCustomerReport(response.data);
        } else {
          toast.error(`Lỗi khi tải báo cáo khách hàng: ${response.message}`, { autoClose: 5000 });
          
          // Fallback data cho testing
          if (process.env.NODE_ENV === 'development') {
            setCustomerReport([
              {
                customerId: 5,
                fullName: "Tuấn Anh",
                totalOrders: 50,
                averageOrderValue: 99902.24,
                totalSpent: 4995112,
                lastOrderDate: "2025-07-30T15:33:44.531456"
              },
              {
                customerId: 63,
                fullName: "Lâm Thành Ý",
                totalOrders: 2,
                averageOrderValue: 415000,
                totalSpent: 830000,
                lastOrderDate: "2025-07-30T16:32:27.455885"
              }
            ]);
          }
        }
      } catch (error) {
        toast.error("Lỗi không xác định khi tải báo cáo khách hàng", { autoClose: 5000 });
      } finally {
        setCustomerReportLoading(false);
      }
    };

    fetchCustomerReport();
  }, [customerReportDateRange, customerReportSortBy, customerReportDirection]);

  return (
    <>
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-100 via-indigo-100 to-purple-100 backdrop-blur-xl border-b border-blue-300/50 rounded-b-3xl shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
                <BarChart3 className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Dashboard Analytics
                </h1>
                <p className="text-sm text-gray-700 font-medium">Quản lý và theo dõi hiệu suất hệ thống</p>
              </div>
            </div>
            <button
              className="px-8 py-4 bg-gradient-to-r from-red-500 via-pink-500 to-red-600 text-white rounded-2xl hover:from-red-600 hover:via-pink-600 hover:to-red-700 font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 backdrop-blur-sm border border-red-200"
              onClick={async () => {
                toast.info("Đang chuẩn bị file PDF...");
                try {
                  const blob = await downloadDashboardRevenuePdf();
                  if (blob) {
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `dashboard-revenue-report.pdf`;
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                    window.URL.revokeObjectURL(url);
                    
                    // Toast hiển thị sau khi download hoàn tất
                    setTimeout(() => {
                      toast.success('Tải file thành công!', { 
                        autoClose: 3000,
                        position: "top-right"
                      });
                    }, 100);
                  } else {
                    toast.error('Không thể tải file PDF tổng hợp.', { 
                      autoClose: 5000,
                      position: "top-right"
                    });
                  }
                } catch (error) {
                  toast.error('Lỗi khi tải file PDF.', { 
                    autoClose: 5000,
                    position: "top-right"
                  });
                }
              }}
            >
              <Download className="w-5 h-5 mr-2" />
              Download PDF
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <StatCard 
            icon="users" 
            title="Tổng tài khoản" 
            value={stats.totalUsers} 
            trend="+12%" 
            color="blue"
            onClick={() => navigate('/admin/user')}
          />
          <StatCard 
            icon="user-group" 
            title="Nhân viên" 
            value={stats.totalEmployees} 
            trend="+5%" 
            color="green"
            onClick={() => navigate('/admin/employees')}
          />
          <StatCard 
            icon="user" 
            title="Khách hàng" 
            value={stats.totalCustomers} 
            trend="+18%" 
            color="purple"
            onClick={() => navigate('/admin/user')}
          />
          <StatCard 
            icon="building" 
            title="Rạp chiếu" 
            value={stats.totalCinemas} 
            trend="+2" 
            color="orange"
          />
          <StatCard 
            icon="film" 
            title="Phòng chiếu" 
            value={stats.totalRooms} 
            trend="+8" 
            color="pink"
            onClick={() => navigate('/admin/theater')}
          />
        </div>
                
        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-12 gap-8">
          {/* Revenue Analytics - Large Chart */}
          <div className="col-span-12 lg:col-span-8">
            <div className="bg-gradient-to-br from-white via-blue-100 to-indigo-100 rounded-3xl shadow-2xl border border-blue-300 p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">📈 Phân tích doanh thu</h2>
                  <p className="text-gray-700">Theo dõi hiệu suất kinh doanh theo thời gian</p>
                </div>
                <div className="flex items-center space-x-4">
                  {/* Time Range Selector */}
                  <div className="bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl p-1 shadow-lg">
                    {timeRanges.map(opt => (
                      <button
                        key={opt.value}
                        className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300 ${
                          timeRange === opt.value 
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg' 
                            : 'text-gray-700 hover:text-gray-900 hover:bg-white/50'
                        }`}
                        onClick={() => setTimeRange(opt.value)}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  
                  {/* Movie Selector */}
                  <div className="relative">
                    <select
                      className="appearance-none bg-gradient-to-r from-white to-gray-100 border border-gray-300 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 pr-8 text-gray-900 shadow-lg"
                      value={selectedMovie}
                      onChange={e => setSelectedMovie(e.target.value)}
                    >
                      <option value="ALL">Tất cả phim</option>
                      {movieList.map(title => (
                        <option key={title} value={title}>{title}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Revenue Summary Cards */}
              {chartData && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                  <RevenueCard 
                    title="Tổng doanh thu" 
                    value={chartData.datasets[0].data.reduce((a, b) => a + b, 0)} 
                    icon="💰" 
                    color="blue"
                    period={`${chartData.labels.length} ngày`}
                  />
                  <RevenueCard 
                    title="Doanh thu vé" 
                    value={chartData.datasets[1].data.reduce((a, b) => a + b, 0)} 
                    icon="🎫" 
                    color="green"
                  />
                  <RevenueCard 
                    title="Doanh thu F&B" 
                    value={chartData.datasets[2].data.reduce((a, b) => a + b, 0)} 
                    icon="🍿" 
                    color="orange"
                  />
                  <RevenueCard 
                    title="Giảm giá" 
                    value={chartData.datasets[3].data.reduce((a, b) => a + b, 0)} 
                    icon="🎁" 
                    color="red"
                  />
                </div>
              )}
              
              {/* Main Chart */}
              <div className="h-[28rem]">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-gray-700 font-medium">Đang tải dữ liệu biểu đồ...</p>
                    </div>
                  </div>
                ) : (
                  chartData && (
                    <Bar
                      data={chartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: "top",
                            align: "start",
                            labels: {
                              boxWidth: 20,
                              boxHeight: 20,
                              font: { size: 12, weight: "600" },
                              color: "#374151",
                              padding: 15,
                              usePointStyle: true,
                              pointStyle: 'rect',
                              borderRadius: 4,
                            },
                          },
                        },
                        scales: {
                          x: { 
                            grid: { display: false }, 
                            ticks: { 
                              font: { size: 11 },
                              maxRotation: 45,
                              minRotation: 45
                            } 
                          },
                          y: { 
                            ticks: { 
                              callback: (v) => `${(v / 1e6).toFixed(1)}M`,
                              font: { size: 11 }
                            } 
                          }
                        },
                        interaction: { 
                          intersect: false, 
                          mode: 'index' 
                        },
                        tooltip: {
                          backgroundColor: "rgba(255, 255, 255, 0.98)",
                          titleColor: "#111827",
                          bodyColor: "#374151",
                          borderColor: "#e5e7eb",
                          borderWidth: 1,
                          padding: 12,
                          cornerRadius: 8,
                          callbacks: {
                            label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y.toLocaleString('vi-VN')} VNĐ`,
                            title: (ctx) => `📅 Ngày: ${ctx[0].label}`
                          }
                        }
                      }}
                    />
                  )
                )}
              </div>
            </div>
          </div>
            
          {/* Sidebar Analytics */}
          <div className="col-span-12 lg:col-span-4 space-y-8">
            {/* User Distribution */}
            <div className="bg-gradient-to-br from-white via-purple-100 to-pink-100 rounded-3xl shadow-2xl border border-purple-300 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">👥 Phân bố người dùng</h3>
              {pieUserTypeData && (
                <div className="relative">
                <Pie
                  data={pieUserTypeData}
                  options={{
                    plugins: {
                        legend: { 
                          position: "bottom", 
                          labels: { 
                            font: { size: 12 }, 
                            color: "#374151",
                            padding: 16,
                            usePointStyle: true,
                            pointStyle: 'circle'
                          } 
                        },
                    },
                    aspectRatio: 1.2,
                  }}
                    height={200}
                />
                </div>
              )}
          </div>

            {/* Cinema Rooms */}
            <div className="bg-gradient-to-br from-white via-green-100 to-emerald-100 rounded-3xl shadow-2xl border border-green-300 p-6">
                             <h3 className="text-lg font-bold text-gray-900 mb-4">🏢 Phòng theo rạp</h3>
            {barRoomsData && (
              <div className="w-full overflow-x-auto">
                  <div style={{ minWidth: Math.max(400, (barRoomsData?.labels?.length || 1) * 60) }}>
                  <Bar
                    data={barRoomsData}
                    options={{
                      responsive: false,
                      plugins: {
                        legend: { display: false },
                        title: { display: false },
                      },
                      layout: { padding: { left: 8, right: 8, top: 8, bottom: 8 } },
                      scales: {
                        x: {
                            title: { display: true, text: "Rạp", font: { size: 12, weight: "bold" }, color: "#374151" },
                          grid: { display: false },
                            ticks: { font: { size: 10, weight: "bold" }, color: "#6b7280" },
                        },
                        y: {
                            title: { display: true, text: "Số phòng", font: { size: 12, weight: "bold" }, color: "#374151" },
                            grid: { color: "rgba(0,0,0,0.05)" },
                            ticks: { font: { size: 10, weight: "bold" }, color: "#6b7280", stepSize: 1 },
                          },
                        },
                        barThickness: 24,
                        borderRadius: 6,
                        aspectRatio: 1.5,
                      }}
                      height={150}
                  />
                </div>
              </div>
            )}
          </div>
              </div>
              </div>

        {/* Additional Analytics Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          {/* Sales Summary */}
          <div className="bg-gradient-to-br from-white via-blue-100 to-indigo-100 rounded-3xl shadow-2xl border border-blue-300 p-6">
            <div className="flex items-center justify-between mb-6">
                             <h3 className="text-lg font-bold text-gray-900">📊 Báo cáo Sales Summary</h3>
              <div className="flex space-x-2">
              <button
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 text-sm flex items-center shadow-lg"
                onClick={async () => {
                  const blob = await downloadSalesSummaryPdf({ from: fromDate, to: toDate });
                  if (blob) {
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `sales-summary-${fromDate}-to-${toDate}.pdf`;
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                    window.URL.revokeObjectURL(url);
                  }
                }}
              >
                <FileText className="w-4 h-4 mr-1" />
                PDF
              </button>
              <button
                  className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-300 text-sm flex items-center shadow-lg"
                onClick={async () => {
                  const blob = await downloadSalesSummaryCsv({ from: fromDate, to: toDate });
                  if (blob) {
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `sales-summary-${fromDate}-to-${toDate}.csv`;
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                    window.URL.revokeObjectURL(url);
                  }
                }}
              >
                <FileSpreadsheet className="w-4 h-4 mr-1" />
                CSV
              </button>
              </div>
            </div>
            
            <div className="flex space-x-4 mb-6">
                             <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">Từ ngày</label>
                 <input 
                   type="date" 
                   value={fromDate} 
                   onChange={e => setFromDate(e.target.value)} 
                   className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-gray-900 bg-white shadow-sm" 
                 />
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">Đến ngày</label>
                                 <input 
                   type="date" 
                   value={toDate} 
                   onChange={e => setToDate(e.target.value)} 
                   className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-gray-900 bg-white shadow-sm" 
                 />
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                                         <th className="px-4 py-3 text-left font-semibold text-gray-900">Time Slot</th>
                     <th className="px-4 py-3 text-left font-semibold text-gray-900">Category</th>
                     <th className="px-4 py-3 text-left font-semibold text-gray-900">Order Volume</th>
                     <th className="px-4 py-3 text-left font-semibold text-gray-900">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {salesSummary.map((item, idx) => (
                    <tr key={idx} className="border-b border-gray-100 hover:bg-blue-100 transition-colors">
                      <td className="px-4 py-3 text-gray-900">{item.timeSlot}</td>
                      <td className="px-4 py-3 text-gray-900">{item.category}</td>
                      <td className="px-4 py-3 text-gray-900">{item.orderVolume}</td>
                      <td className="px-4 py-3 font-semibold text-gray-900">{item.revenue.toLocaleString('vi-VN') + ' VNĐ'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Customer Analytics */}
          <div className="bg-gradient-to-br from-white via-purple-100 to-pink-100 rounded-3xl shadow-2xl border border-purple-300 p-6">
            <div className="flex items-center justify-between mb-6">
                              <h3 className="text-lg font-bold text-gray-900">👥 Phân tích khách hàng</h3>
                             <button
                 className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg hover:from-red-600 hover:to-pink-600 transition-all duration-300 text-sm flex items-center shadow-lg"
                 onClick={async () => {
                   setCustomerReportDownloadLoading(true);
                   try {
                     const blob = await downloadCustomerReportPdf({
                       start: customerReportDateRange.start,
                       end: customerReportDateRange.end,
                       sortBy: customerReportSortBy,
                       direction: customerReportDirection
                     });
                     
                     if (blob) {
                       const url = window.URL.createObjectURL(blob);
                       const a = document.createElement('a');
                       a.href = url;
                       a.download = `customer-report-${customerReportDateRange.start}-to-${customerReportDateRange.end}.pdf`;
                       document.body.appendChild(a);
                       a.click();
                       a.remove();
                       window.URL.revokeObjectURL(url);
                       
                       // Toast hiển thị sau khi download hoàn tất
                       setTimeout(() => {
                         toast.success('Tải xuống báo cáo khách hàng thành công!', { 
                           autoClose: 3000,
                           position: "top-right"
                         });
                       }, 100);
                     } else {
                       toast.error('Không thể tải xuống báo cáo khách hàng', { 
                         autoClose: 5000,
                         position: "top-right"
                       });
                     }
                   } catch (error) {
                     toast.error('Lỗi khi tải xuống báo cáo khách hàng', { 
                       autoClose: 5000,
                       position: "top-right"
                     });
                   } finally {
                     setCustomerReportDownloadLoading(false);
                   }
                 }}
                 disabled={customerReportLoading || customerReportDownloadLoading}
               >
                 {customerReportDownloadLoading ? (
                   <>
                     <Clock className="w-4 h-4 mr-1 animate-spin" />
                     Đang tải...
                   </>
                 ) : (
                   <>
                     <FileText className="w-4 h-4 mr-1" />
                     Tải PDF
                   </>
                 )}
               </button>
            </div>

            <div className="flex space-x-4 mb-6">
              <div>
                                 <label className="block text-sm font-medium text-gray-700 mb-2">Từ ngày</label>
                                    <input 
                     type="date" 
                     value={customerReportDateRange.start} 
                     onChange={e => setCustomerReportDateRange(prev => ({ ...prev, start: e.target.value }))} 
                     className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 text-gray-900 bg-white shadow-sm" 
                   />
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">Đến ngày</label>
                                   <input 
                     type="date" 
                     value={customerReportDateRange.end} 
                     onChange={e => setCustomerReportDateRange(prev => ({ ...prev, end: e.target.value }))} 
                     className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 text-gray-900 bg-white shadow-sm" 
                   />
                      </div>
                    </div>

            {customerReportLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                                               <th className="px-4 py-3 text-left font-semibold text-gray-900">Tên khách hàng</th>
                       <th className="px-4 py-3 text-left font-semibold text-gray-900">Số đơn</th>
                       <th className="px-4 py-3 text-left font-semibold text-gray-900">Tổng chi tiêu</th>
                      </tr>
                    </thead>
                    <tbody>
                    {customerReport.slice(0, 5).map((customer, idx) => (
                      <tr key={customer.customerId} className="border-b border-gray-100 hover:bg-purple-100 transition-colors">
                          <td className="px-4 py-3 font-semibold text-blue-600">{customer.fullName}</td>
                          <td className="px-4 py-3 text-gray-900">{customer.totalOrders}</td>
                          <td className="px-4 py-3 font-bold text-green-600">{customer.totalSpent.toLocaleString('vi-VN')} VNĐ</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

// Stat Card Component
function StatCard({ icon, title, value, trend, color, onClick }) {
  const colors = {
    blue: "from-blue-500 via-blue-600 to-indigo-600",
    green: "from-green-500 via-green-600 to-emerald-600", 
    purple: "from-purple-500 via-purple-600 to-violet-600",
    orange: "from-orange-500 via-orange-600 to-amber-600",
    pink: "from-pink-500 via-pink-600 to-rose-600"
  };

  const icons = {
    users: <Users className="w-6 h-6 text-white" />,
    "user-group": <UserCheck className="w-6 h-6 text-white" />,
    user: <User className="w-6 h-6 text-white" />,
    building: <Building2 className="w-6 h-6 text-white" />,
    film: <Film className="w-6 h-6 text-white" />
  };
  
  return (
    <div
      className={`bg-gradient-to-br from-white via-blue-100 to-indigo-100 rounded-2xl shadow-xl border border-blue-200 p-6 hover:shadow-2xl transition-all duration-300 cursor-pointer group ${
        onClick ? 'hover:scale-105' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 bg-gradient-to-br ${colors[color]} rounded-xl flex items-center justify-center shadow-lg`}>
        {icons[icon]}
      </div>
      </div>
      <div>
        <p className="text-sm font-medium text-gray-700 mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</p>
      </div>
    </div>
  );
}

// Revenue Card Component
function RevenueCard({ title, value, icon, color, period }) {
  const colors = {
    blue: "from-blue-500 via-blue-600 to-indigo-600",
    green: "from-green-500 via-green-600 to-emerald-600",
    orange: "from-orange-500 via-orange-600 to-amber-600",
    red: "from-red-500 via-red-600 to-rose-600"
  };

  const icons = {
    "💰": <DollarSign className="w-5 h-5 text-white" />,
    "🎫": <Ticket className="w-5 h-5 text-white" />,
    "🍿": <Popcorn className="w-5 h-5 text-white" />,
    "🎁": <Gift className="w-5 h-5 text-white" />
  };

  return (
    <div className="bg-gradient-to-br from-white via-blue-100 to-indigo-100 rounded-2xl p-4 border border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 bg-gradient-to-br ${colors[color]} rounded-xl flex items-center justify-center shadow-lg`}>
          {icons[icon] || <span className="text-lg">{icon}</span>}
        </div>
        {period && (
                  <span className="text-xs font-medium text-gray-700 bg-gradient-to-r from-white to-gray-100 px-3 py-1 rounded-full border border-gray-200">
          {period}
        </span>
        )}
      </div>
      <div>
        <p className="text-xs font-medium text-gray-700 mb-1">{title}</p>
        <p className="text-lg font-bold text-gray-900">
          {(value / 1000000).toFixed(1)}M VNĐ
        </p>
      </div>
    </div>
  );
}

export default DashBoard;

