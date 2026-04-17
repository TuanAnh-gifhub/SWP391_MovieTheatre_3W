    import React, { useMemo } from "react";
    import { useNavigate } from "react-router-dom";
    import {
      Bar,
      BarChart,
      CartesianGrid,
      Cell,
      Legend,
      Line,
      LineChart,
      Pie,
      PieChart,
      ResponsiveContainer,
      Tooltip,
      XAxis,
      YAxis,
    } from "recharts";
import {
  Activity,
  AlertTriangle,
  Bug,
  CalendarPlus,
  Clock3,
  DollarSign,
  Film,
  Percent,
  PlusCircle,
  Popcorn,
  RefreshCcw,
  Settings2,
  ShieldCheck,
  Ticket,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";

const revenueTrendData = [
  { date: "03/04", revenue: 35200000, tickets: 608, activeMovies: 13, occupancy: 70.5 },
  { date: "04/04", revenue: 36800000, tickets: 624, activeMovies: 13, occupancy: 72.1 },
  { date: "05/04", revenue: 40100000, tickets: 670, activeMovies: 13, occupancy: 74.9 },
  { date: "06/04", revenue: 38900000, tickets: 645, activeMovies: 12, occupancy: 72.8 },
  { date: "07/04", revenue: 42200000, tickets: 701, activeMovies: 12, occupancy: 76.4 },
  { date: "08/04", revenue: 43800000, tickets: 726, activeMovies: 12, occupancy: 78.3 },
  { date: "09/04", revenue: 44700000, tickets: 739, activeMovies: 12, occupancy: 79.6 },
  { date: "10/04", revenue: 46300000, tickets: 758, activeMovies: 13, occupancy: 80.4 },
  { date: "11/04", revenue: 48200000, tickets: 781, activeMovies: 13, occupancy: 82.2 },
  { date: "12/04", revenue: 50100000, tickets: 815, activeMovies: 13, occupancy: 83.7 },
  { date: "13/04", revenue: 49600000, tickets: 802, activeMovies: 13, occupancy: 82.9 },
  { date: "14/04", revenue: 52300000, tickets: 839, activeMovies: 14, occupancy: 85.1 },
  { date: "15/04", revenue: 53800000, tickets: 862, activeMovies: 14, occupancy: 86.0 },
  { date: "16/04", revenue: 55900000, tickets: 894, activeMovies: 14, occupancy: 87.4 },
];

const ticketSalesByHour = [
  { hour: "09:00", tickets: 52 },
  { hour: "10:00", tickets: 74 },
  { hour: "11:00", tickets: 91 },
  { hour: "12:00", tickets: 108 },
  { hour: "13:00", tickets: 119 },
  { hour: "14:00", tickets: 133 },
  { hour: "15:00", tickets: 149 },
  { hour: "16:00", tickets: 171 },
  { hour: "17:00", tickets: 194 },
  { hour: "18:00", tickets: 236 },
  { hour: "19:00", tickets: 268 },
  { hour: "20:00", tickets: 251 },
  { hour: "21:00", tickets: 206 },
  { hour: "22:00", tickets: 164 },
];

const moviePerformanceData = [
  { name: "Dune: Phần Hai", tickets: 1420, revenue: 365800000, occupancy: 89.2 },
  { name: "Kung Fu Panda 4", tickets: 1305, revenue: 318700000, occupancy: 84.8 },
  { name: "Godzilla x Kong", tickets: 1282, revenue: 311900000, occupancy: 83.6 },
  { name: "Cuộc Nội Chiến", tickets: 1148, revenue: 286400000, occupancy: 79.1 },
  { name: "Điềm Báo Đầu Tiên", tickets: 1040, revenue: 249300000, occupancy: 77.3 },
  { name: "Inside Out 2", tickets: 990, revenue: 228100000, occupancy: 75.8 },
  { name: "Người Khỉ", tickets: 870, revenue: 201600000, occupancy: 72.4 },
  { name: "Abigail", tickets: 802, revenue: 184900000, occupancy: 69.9 },
];

const showtimeSeatAnalytics = [
  { time: "09:15", room: "A1", movie: "Dune: Phần Hai", seatsBooked: 92, capacity: 120 },
  { time: "10:00", room: "B2", movie: "Kung Fu Panda 4", seatsBooked: 76, capacity: 100 },
  { time: "11:20", room: "C1", movie: "Cuộc Nội Chiến", seatsBooked: 61, capacity: 90 },
  { time: "13:00", room: "A2", movie: "Godzilla x Kong", seatsBooked: 108, capacity: 120 },
  { time: "14:30", room: "D1", movie: "Inside Out 2", seatsBooked: 69, capacity: 100 },
  { time: "16:10", room: "B1", movie: "Điềm Báo Đầu Tiên", seatsBooked: 82, capacity: 110 },
  { time: "18:40", room: "A3", movie: "Dune: Phần Hai", seatsBooked: 116, capacity: 120 },
  { time: "20:15", room: "C2", movie: "Godzilla x Kong", seatsBooked: 98, capacity: 110 },
];

const ageDistributionData = [
  { ageGroup: "13-17", customers: 240 },
  { ageGroup: "18-24", customers: 960 },
  { ageGroup: "25-34", customers: 1230 },
  { ageGroup: "35-44", customers: 740 },
  { ageGroup: "45-54", customers: 380 },
  { ageGroup: "55+", customers: 190 },
];

const customerMixData = [
  { name: "Khách mới", value: 38 },
  { name: "Khách quay lại", value: 62 },
];

const revenueBreakdownData = [
  { period: "Thứ 2", ticketRevenue: 58500000, foodRevenue: 15100000 },
  { period: "Thứ 3", ticketRevenue: 60200000, foodRevenue: 16400000 },
  { period: "Thứ 4", ticketRevenue: 61800000, foodRevenue: 17300000 },
  { period: "Thứ 5", ticketRevenue: 63900000, foodRevenue: 18100000 },
  { period: "Thứ 6", ticketRevenue: 68900000, foodRevenue: 22200000 },
  { period: "Thứ 7", ticketRevenue: 73400000, foodRevenue: 25500000 },
  { period: "CN", ticketRevenue: 70700000, foodRevenue: 24300000 },
];

const comboOrdersData = [
  { combo: "Combo Đôi", orders: 530 },
  { combo: "Bữa Tiệc Gia Đình", orders: 420 },
  { combo: "Tiết Kiệm Cá Nhân", orders: 388 },
  { combo: "Bữa Tiệc Trẻ Em", orders: 246 },
  { combo: "Bộ Đôi Đêm Khuya", orders: 210 },
];

const systemHealth = {
  paymentSuccessRate: 98.4,
  failedBookings: 14,
  seatConflicts: 3,
};

const pieColors = ["#0ea5e9", "#14b8a6", "#f59e0b", "#ef4444"];

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

const compactNumberFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const formatCurrency = (value) => currencyFormatter.format(value);

const formatCompact = (value) => compactNumberFormatter.format(value);

const formatPercent = (value) => `${value.toFixed(1)}%`;

const getTrendMeta = (value) => {
  if (value >= 0) {
    return {
      icon: TrendingUp,
      colorClass: "text-emerald-600 bg-emerald-50 border-emerald-200",
      label: `+${value.toFixed(1)}%`,
    };
  }

  return {
    icon: TrendingDown,
    colorClass: "text-rose-600 bg-rose-50 border-rose-200",
    label: `${value.toFixed(1)}%`,
  };
};

const DashboardCard = ({ title, subtitle, children, action }) => (
  <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="mb-4 flex items-start justify-between gap-4">
      <div>
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
      </div>
      {action ? <div>{action}</div> : null}
    </div>
    {children}
  </section>
);

const KpiCard = ({ title, value, trendValue, helperText, icon: Icon, iconBgClass }) => {
  const trend = getTrendMeta(trendValue);
  const TrendIcon = trend.icon;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className={`rounded-xl p-2.5 ${iconBgClass}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <span
          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${trend.colorClass}`}
        >
          <TrendIcon className="h-3.5 w-3.5" />
          {trend.label}
        </span>
      </div>
      <p className="text-sm text-slate-500">{title}</p>
      <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{helperText}</p>
    </div>
  );
};

const HealthCard = ({ title, value, unit, icon: Icon, toneClass, helper }) => (
  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
    <div className="mb-3 flex items-center justify-between">
      <div className={`rounded-lg p-2 ${toneClass}`}>
        <Icon className="h-4 w-4 text-white" />
      </div>
    </div>
    <p className="text-xs uppercase tracking-wide text-slate-500">{title}</p>
    <p className="mt-1 text-xl font-bold text-slate-900">
      {value}
      {unit}
    </p>
    <p className="mt-1 text-xs text-slate-500">{helper}</p>
  </div>
);

const DashBoard = () => {
  const navigate = useNavigate();

  const topMovies = useMemo(
    () => [...moviePerformanceData].sort((a, b) => b.revenue - a.revenue).slice(0, 5),
    []
  );

  const summary = useMemo(() => {
    const today = revenueTrendData[revenueTrendData.length - 1];
    const yesterday = revenueTrendData[revenueTrendData.length - 2];

    const revenueDelta = ((today.revenue - yesterday.revenue) / yesterday.revenue) * 100;
    const ticketsDelta = ((today.tickets - yesterday.tickets) / yesterday.tickets) * 100;
    const moviesDelta = ((today.activeMovies - yesterday.activeMovies) / yesterday.activeMovies) * 100;
    const occupancyDelta = today.occupancy - yesterday.occupancy;

    const ticketRevenueTotal = revenueBreakdownData.reduce((sum, row) => sum + row.ticketRevenue, 0);
    const foodRevenueTotal = revenueBreakdownData.reduce((sum, row) => sum + row.foodRevenue, 0);
    const revenueTotal = ticketRevenueTotal + foodRevenueTotal;

    const comboOrdersTotal = comboOrdersData.reduce((sum, row) => sum + row.orders, 0);
    const comboUsersPercent = 31.7;

    return {
      todayRevenue: today.revenue,
      todayTickets: today.tickets,
      activeMovies: today.activeMovies,
      occupancyRate: today.occupancy,
      revenueDelta,
      ticketsDelta,
      moviesDelta,
      occupancyDelta,
      ticketRevenueTotal,
      foodRevenueTotal,
      ticketShare: (ticketRevenueTotal / revenueTotal) * 100,
      foodShare: (foodRevenueTotal / revenueTotal) * 100,
      comboOrdersTotal,
      comboUsersPercent,
    };
  }, []);

  return (
    <div className="min-h-full bg-slate-50">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6 p-4 md:p-6">
        <header className="rounded-2xl border border-slate-200 bg-gradient-to-r from-cyan-50 via-white to-amber-50 p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-medium text-cyan-700">Quản trị đặt vé xem phim</p>
              <h1 className="mt-1 text-2xl font-bold text-slate-900 md:text-3xl">Bảng điều khiển hiệu suất</h1>
              <p className="mt-1 text-sm text-slate-600">
                Góc nhìn tổng hợp về doanh thu, hoạt động suất chiếu, hành vi khách hàng và sức khỏe nền tảng.
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
              <Clock3 className="h-4 w-4 text-cyan-600" />
              Cập nhật 5 phút trước
            </div>
          </div>
        </header>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            title="Tổng doanh thu (Hôm nay)"
            value={formatCurrency(summary.todayRevenue)}
            trendValue={summary.revenueDelta}
            helperText="So với hôm qua"
            icon={DollarSign}
            iconBgClass="bg-gradient-to-br from-cyan-500 to-cyan-700"
          />
          <KpiCard
            title="Tổng vé đã bán"
            value={summary.todayTickets.toLocaleString("en-US")}
            trendValue={summary.ticketsDelta}
            helperText="So với hôm qua"
            icon={Ticket}
            iconBgClass="bg-gradient-to-br from-emerald-500 to-emerald-700"
          />
          <KpiCard
            title="Tổng phim đang chiếu"
            value={summary.activeMovies.toLocaleString("en-US")}
            trendValue={summary.moviesDelta}
            helperText="Số phim đang chiếu"
            icon={Film}
            iconBgClass="bg-gradient-to-br from-amber-500 to-orange-600"
          />
          <KpiCard
            title="Tỷ lệ lấp đầy ghế"
            value={formatPercent(summary.occupancyRate)}
            trendValue={summary.occupancyDelta}
            helperText="So với hôm qua"
            icon={Percent}
            iconBgClass="bg-gradient-to-br from-violet-500 to-fuchsia-600"
          />
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          <div className="xl:col-span-8">
            <DashboardCard
              title="Xu hướng doanh thu"
              subtitle="Biến động doanh thu theo ngày với đường cơ sở so sánh"
            >
              <div className="h-80 w-full">
                <ResponsiveContainer>
                  <LineChart data={revenueTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" tick={{ fill: "#475569", fontSize: 12 }} />
                    <YAxis
                      tick={{ fill: "#475569", fontSize: 12 }}
                      tickFormatter={(value) => formatCompact(value)}
                    />
                    <Tooltip
                      formatter={(value) => formatCurrency(value)}
                      contentStyle={{
                        borderRadius: "0.75rem",
                        border: "1px solid #cbd5e1",
                        backgroundColor: "#ffffff",
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#0891b2"
                      strokeWidth={3}
                      dot={{ r: 3 }}
                      activeDot={{ r: 6 }}
                      name="Doanh thu"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </DashboardCard>
          </div>

          <div className="xl:col-span-4">
            <DashboardCard
              title="Lượng vé bán theo giờ"
              subtitle="Phân bố cao điểm trong ngày"
            >
              <div className="h-80 w-full">
                <ResponsiveContainer>
                  <BarChart data={ticketSalesByHour}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="hour" tick={{ fill: "#475569", fontSize: 11 }} />
                    <YAxis tick={{ fill: "#475569", fontSize: 12 }} />
                    <Tooltip
                      formatter={(value) => `${value} vé`}
                      contentStyle={{
                        borderRadius: "0.75rem",
                        border: "1px solid #cbd5e1",
                        backgroundColor: "#ffffff",
                      }}
                    />
                    <Bar dataKey="tickets" fill="#14b8a6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </DashboardCard>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          <div className="xl:col-span-5">
            <DashboardCard
              title="Top 5 phim theo doanh thu"
              subtitle="Bảng xếp hạng đóng góp doanh thu phòng vé"
            >
              <div className="h-96 w-full">
                <ResponsiveContainer>
                  <BarChart data={topMovies} layout="vertical" margin={{ left: 8, right: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis type="number" tickFormatter={(value) => formatCompact(value)} />
                    <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11 }} />
                    <Tooltip
                      formatter={(value) => formatCurrency(value)}
                      contentStyle={{
                        borderRadius: "0.75rem",
                        border: "1px solid #cbd5e1",
                        backgroundColor: "#ffffff",
                      }}
                    />
                    <Bar dataKey="revenue" fill="#0ea5e9" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </DashboardCard>
          </div>

          <div className="xl:col-span-7">
            <DashboardCard
              title="Hiệu suất phim"
              subtitle="Lượng vé, doanh thu và tỷ lệ lấp đầy theo phim"
            >
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-left text-slate-500">
                      <th className="px-3 py-2 font-medium">Phim</th>
                      <th className="px-3 py-2 font-medium">Vé đã bán</th>
                      <th className="px-3 py-2 font-medium">Doanh thu</th>
                      <th className="px-3 py-2 font-medium">Tỷ lệ lấp đầy</th>
                    </tr>
                  </thead>
                  <tbody>
                    {moviePerformanceData.map((movie) => (
                      <tr key={movie.name} className="border-b border-slate-100 last:border-b-0">
                        <td className="px-3 py-3 font-medium text-slate-800">{movie.name}</td>
                        <td className="px-3 py-3 text-slate-600">{movie.tickets.toLocaleString("en-US")}</td>
                        <td className="px-3 py-3 text-slate-700">{formatCurrency(movie.revenue)}</td>
                        <td className="px-3 py-3">
                          <span className="rounded-full bg-cyan-50 px-2.5 py-1 text-xs font-semibold text-cyan-700">
                            {formatPercent(movie.occupancy)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </DashboardCard>
          </div>
        </section>

        <DashboardCard
          title="Phân tích suất chiếu & ghế ngồi"
          subtitle="Tổng quan tỷ lệ lấp đầy theo suất chiếu và phòng chiếu"
        >
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-500">
                  <th className="px-3 py-2 font-medium">Giờ</th>
                  <th className="px-3 py-2 font-medium">Phòng</th>
                  <th className="px-3 py-2 font-medium">Phim</th>
                  <th className="px-3 py-2 font-medium">Ghế đã đặt</th>
                  <th className="px-3 py-2 font-medium">Tỷ lệ lấp đầy</th>
                </tr>
              </thead>
              <tbody>
                {showtimeSeatAnalytics.map((showtime) => {
                  const occupancy = (showtime.seatsBooked / showtime.capacity) * 100;

                  return (
                    <tr key={`${showtime.time}-${showtime.room}`} className="border-b border-slate-100 last:border-b-0">
                      <td className="px-3 py-3 text-slate-700">{showtime.time}</td>
                      <td className="px-3 py-3 text-slate-700">{showtime.room}</td>
                      <td className="px-3 py-3 font-medium text-slate-800">{showtime.movie}</td>
                      <td className="px-3 py-3 text-slate-600">
                        {showtime.seatsBooked}/{showtime.capacity}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-2.5 w-32 overflow-hidden rounded-full bg-slate-200">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500"
                              style={{ width: `${Math.min(occupancy, 100)}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-slate-700">{formatPercent(occupancy)}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </DashboardCard>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          <div className="xl:col-span-6">
            <DashboardCard
              title="Phân tích khách hàng"
              subtitle="Hồ sơ độ tuổi và vòng đời khách hàng"
            >
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="h-72 w-full">
                  <ResponsiveContainer>
                    <BarChart data={ageDistributionData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="ageGroup" />
                      <YAxis />
                      <Tooltip formatter={(value) => `${value} khách hàng`} />
                      <Bar dataKey="customers" fill="#14b8a6" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="h-72 w-full">
                  <ResponsiveContainer>
                    <PieChart>
                      <Tooltip formatter={(value) => `${value}%`} />
                      <Legend />
                      <Pie
                        data={customerMixData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={88}
                        label={({ name, value }) => `${name}: ${value}%`}
                      >
                        {customerMixData.map((entry, index) => (
                          <Cell key={entry.name} fill={pieColors[index % pieColors.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </DashboardCard>
          </div>

          <div className="xl:col-span-6">
            <DashboardCard
              title="Phân tích doanh thu"
              subtitle="Doanh thu vé so với doanh thu đồ ăn & thức uống"
            >
              <div className="h-72 w-full">
                <ResponsiveContainer>
                  <BarChart data={revenueBreakdownData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="period" />
                    <YAxis tickFormatter={(value) => formatCompact(value)} />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                    <Bar
                      dataKey="ticketRevenue"
                      stackId="revenue"
                      fill="#0ea5e9"
                      name="Doanh thu vé"
                      radius={[6, 6, 0, 0]}
                    />
                    <Bar
                      dataKey="foodRevenue"
                      stackId="revenue"
                      fill="#f59e0b"
                      name="Doanh thu F&B"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-cyan-100 bg-cyan-50 p-3">
                  <p className="text-xs uppercase text-cyan-700">Doanh thu vé</p>
                  <p className="mt-1 text-lg font-semibold text-cyan-900">{formatCurrency(summary.ticketRevenueTotal)}</p>
                  <p className="text-xs text-cyan-700">{formatPercent(summary.ticketShare)} đóng góp</p>
                </div>
                <div className="rounded-xl border border-amber-100 bg-amber-50 p-3">
                  <p className="text-xs uppercase text-amber-700">Doanh thu F&B</p>
                  <p className="mt-1 text-lg font-semibold text-amber-900">{formatCurrency(summary.foodRevenueTotal)}</p>
                  <p className="text-xs text-amber-700">{formatPercent(summary.foodShare)} đóng góp</p>
                </div>
              </div>
            </DashboardCard>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          <div className="xl:col-span-6">
            <DashboardCard
              title="Phân tích Combo / Upsell"
              subtitle="Tỷ lệ chuyển đổi gói đồ ăn và combo hàng đầu"
            >
              <div className="mb-4 rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                <p className="text-sm text-emerald-700">Khách hàng mua combo</p>
                <p className="mt-1 text-2xl font-bold text-emerald-900">{formatPercent(summary.comboUsersPercent)}</p>
                <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-emerald-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500"
                    style={{ width: `${summary.comboUsersPercent}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-emerald-700">
                  {summary.comboOrdersTotal.toLocaleString("en-US")} đơn combo trong kỳ đã chọn
                </p>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer>
                  <BarChart data={comboOrdersData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="combo" tick={{ fontSize: 11 }} />
                    <YAxis />
                    <Tooltip formatter={(value) => `${value} đơn`} />
                    <Bar dataKey="orders" fill="#14b8a6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </DashboardCard>
          </div>

          <div className="xl:col-span-6 space-y-6">
            <DashboardCard
              title="Thông số thanh toán đặt vé"
              subtitle="Độ tin cậy vận hành cho đặt vé và thanh toán"
            >
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <HealthCard
                  title="Thanh toán thành công"
                  value={systemHealth.paymentSuccessRate}
                  unit="%"
                  icon={ShieldCheck}
                  toneClass="bg-gradient-to-br from-emerald-500 to-emerald-700"
                  helper="Cổng thanh toán hoạt động tốt"
                />
                <HealthCard
                  title="Đặt vé thất bại"
                  value={systemHealth.failedBookings}
                  unit=""
                  icon={AlertTriangle}
                  toneClass="bg-gradient-to-br from-amber-500 to-orange-600"
                  helper="Cần theo dõi"
                />

              </div>
            </DashboardCard>

            <DashboardCard
              title="Thao tác nhanh"
              subtitle="Truy cập nhanh các thao tác quản trị quan trọng"
            >
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <button
                  type="button"
                  onClick={() => navigate("/admin/movie")}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-700 px-4 py-3 text-sm font-semibold text-white transition hover:from-cyan-700 hover:to-cyan-800"
                >
                  <PlusCircle className="h-4 w-4" />
                  Thêm phim
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/admin/showtime")}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 px-4 py-3 text-sm font-semibold text-white transition hover:from-emerald-700 hover:to-emerald-800"
                >
                  <CalendarPlus className="h-4 w-4" />
                  Tạo suất chiếu
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/admin/ticket")}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 px-4 py-3 text-sm font-semibold text-white transition hover:from-amber-700 hover:to-orange-700"
                >
                  <Settings2 className="h-4 w-4" />
                  Cập nhật giá vé
                </button>
              </div>
            </DashboardCard>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-4">
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
            <Activity className="h-5 w-5 text-cyan-600" />
            <div>
              <p className="text-xs text-slate-500">Doanh thu TB ngày</p>
              <p className="text-sm font-semibold text-slate-900">
                {formatCurrency(
                  Math.round(
                    revenueTrendData.reduce((sum, row) => sum + row.revenue, 0) / revenueTrendData.length
                  )
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
            <Popcorn className="h-5 w-5 text-amber-600" />
            <div>
              <p className="text-xs text-slate-500">Combo hàng đầu</p>
              <p className="text-sm font-semibold text-slate-900">{comboOrdersData[0].combo}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
            <Users className="h-5 w-5 text-emerald-600" />
            <div>
              <p className="text-xs text-slate-500">Khách hàng mới</p>
              <p className="text-sm font-semibold text-slate-900">{customerMixData[0].value}% tỷ lệ</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
            <RefreshCcw className="h-5 w-5 text-violet-600" />
            <div>
              <p className="text-xs text-slate-500">Khách hàng quay lại</p>
              <p className="text-sm font-semibold text-slate-900">{customerMixData[1].value}% tỷ lệ</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default DashBoard;