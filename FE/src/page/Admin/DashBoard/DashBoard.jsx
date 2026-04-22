import React, { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  LineChart,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
  Line,
  Area,
} from "recharts";
import { Film, Ticket, Users, Wallet } from "lucide-react";
import { getDashboardAnalyticsOverview } from "../../../service/dashboard";

const SURFACE_CLASS =
  "bg-white rounded-2xl border border-slate-200 p-4 shadow-[0_10px_30px_-12px_rgba(15,23,42,0.35)] transition-all duration-300 hover:shadow-[0_18px_35px_-12px_rgba(37,99,235,0.25)]";

const AXIS_TICK = { fill: "#475569", fontSize: 12, fontWeight: 600 };
const GRID_STROKE = "#e2e8f0";
const LEGEND_STYLE = { color: "#334155", fontSize: 12, fontWeight: 600 };

const TOOLTIP_STYLE = {
  borderRadius: 12,
  border: "1px solid #cbd5e1",
  background: "rgba(255,255,255,0.98)",
  boxShadow: "0 12px 28px -12px rgba(15,23,42,0.35)",
  color: "#0f172a",
};

const DashBoard = () => {
  const today = new Date();
  const toDateDefault = today.toISOString().slice(0, 10);
  const fromDateDefault = new Date(today.getTime() - 29 * 24 * 3600 * 1000).toISOString().slice(0, 10);

  const [filters, setFilters] = useState({
    start: fromDateDefault,
    end: toDateDefault,
    groupBy: "day",
    focusDate: toDateDefault,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [analytics, setAnalytics] = useState(null);
  const [activeBreakdown, setActiveBreakdown] = useState("revenueByGenre");
  const [theme, setTheme] = useState(document.body.getAttribute("data-theme") || "light");

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setTheme(document.body.getAttribute("data-theme") || "light");
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      const res = await getDashboardAnalyticsOverview(filters);
      if (res.success) {
        setAnalytics(res.data);
      } else {
        setError(res.message || "Không thể tải dữ liệu dashboard");
      }
      setLoading(false);
    };

    fetchData();
  }, [filters]);

  const revenueTrendData = useMemo(() => analytics?.revenueTrend || [], [analytics]);
  const genreData = useMemo(() => analytics?.genreAnalysis || [], [analytics]);
  const timeSlotData = useMemo(() => analytics?.timeSlotAnalysis || [], [analytics]);
  const timeSlotDisplayData = useMemo(() => (timeSlotData || []).map((d) => ({ ...d, slotLabel: mapTimeSlotLabel(d.slot) })), [timeSlotData]);
  const ageData = useMemo(() => analytics?.ageGroups || [], [analytics]);
  const seatAreaData = useMemo(() => analytics?.seatAnalysis?.areaOccupancy || [], [analytics]);
  const seatAreaDisplayData = useMemo(() => (seatAreaData || []).map((d) => ({ ...d, areaLabel: mapAreaLabel(d.area) })), [seatAreaData]);
  const occupancyCinemaData = useMemo(() => analytics?.occupancyByCinema || [], [analytics]);
  const dailyFillRateData = useMemo(() => analytics?.dailyFillRate || [], [analytics]);

  const breakdownType = [
    { key: "revenueByGenre", label: "Doanh thu theo thể loại" },
    { key: "revenueByTicketVolume", label: "Doanh thu theo số vé" },
    { key: "revenueByCustomer", label: "Doanh thu theo khách hàng" },
  ];

  const breakdownData = useMemo(() => analytics?.[activeBreakdown] || [], [analytics, activeBreakdown]);

  const summaryCards = useMemo(
    () => [
      {
        title: "Tổng doanh thu",
        value: analytics?.kpi?.totalRevenue,
        suffix: "VNĐ",
        bg: "bg-blue-50",
        icon: <Wallet className="w-5 h-5 text-blue-600" />,
      },
      {
        title: "Tổng vé đã bán",
        value: analytics?.kpi?.totalTicketsSold,
        bg: "bg-green-50",
        icon: <Ticket className="w-5 h-5 text-green-600" />,
      },
      {
        title: "Khách hàng",
        value: analytics?.kpi?.totalCustomers,
        bg: "bg-purple-50",
        icon: <Users className="w-5 h-5 text-purple-600" />,
      },
      {
        title: "Phim đang chiếu",
        value: analytics?.kpi?.nowShowingMovies,
        bg: "bg-orange-50",
        icon: <Film className="w-5 h-5 text-orange-600" />,
      },
    ],
    [analytics]
  );

  function mapAreaLabel(label) {
    if (!label) return label;
    const raw = label.toString().trim();
    // normalize: replace underscores with spaces, remove diacritics, uppercase for matching
    const normalized = raw.replace(/_/g, " ").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
    const map = {
      VIP: "Vip",
      "HANG GIUA": "Hàng giữa",
      GOC: "Góc",
      SANG: "Sáng",
      CHIEU: "Chiều",
      TOI: "Tối",
    };
    if (map[normalized]) return map[normalized];
    // fallback: title case the cleaned label
    const cleaned = raw.replace(/_/g, " ").toLowerCase();
    return cleaned
      .split(" ")
      .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1) : w))
      .join(" ");
  }

  function mapTimeSlotLabel(label) {
    if (!label) return label;
    const raw = label.toString().trim();
    const normalized = raw.replace(/_/g, " ").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
    const map = {
      SANG: "Sáng",
      CHIEU: "Chiều",
      TOI: "Tối",
    };
    if (map[normalized]) return map[normalized];
    // fallback: title case
    const cleaned = raw.replace(/_/g, " ").toLowerCase();
    return cleaned
      .split(" ")
      .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1) : w))
      .join(" ");
  }

  const quickRevenueCards = useMemo(
    () => [
      { title: "Doanh thu vé", value: analytics?.kpi?.ticketRevenue, tone: "text-blue-700" },
      { title: "Doanh thu F&B", value: analytics?.kpi?.foodRevenue, tone: "text-green-700" },
      {
        title: "Ghế đặt nhiều nhất",
        value: mapAreaLabel(analytics?.seatAnalysis?.mostBookedSeat?.seatName) || "-",
        isText: true,
        tone: "text-orange-700",
      },
      {
        title: "Khu vực lấp đầy cao nhất",
        value: mapAreaLabel(seatAreaData[0]?.area) || "-",
        isText: true,
        tone: "text-red-700",
      },
    ],
    [analytics, seatAreaData]
  );

  const salesSummaryRows = useMemo(() => {
    const labels = {
      revenueByGenre: "Thể loại",
      // make label clearer for ticket-volume buckets
      revenueByTicketVolume: "Nhóm vé (số ghế/đơn đặt)",
      revenueByCustomer: "Khách hàng",
    };
    return {
      firstColName: labels[activeBreakdown],
      rows: breakdownData.slice(0, 10),
    };
  }, [breakdownData, activeBreakdown]);

  const densityRequestedDate = analytics?.requestedFocusDate || filters.focusDate;
  const densityEffectiveDate = analytics?.effectiveFocusDate || densityRequestedDate;
  const densityFallbackApplied = Boolean(analytics?.focusDateFallbackApplied);

  const pageBg = theme === "dark" ? "bg-transparent" : "bg-slate-100";

  return (
    <div
      className={`max-w-7xl mx-auto px-4 md:px-6 py-6 space-y-5 min-h-screen text-gray-900 [&_th]:text-gray-900 [&_td]:text-gray-800 ${pageBg}`}
    >
      <div className="bg-blue-50 rounded-xl shadow-lg border border-blue-200 p-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Wallet className="w-5 h-5 text-white" />
            </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Bảng thống kê</h1>
                <p className="text-sm text-gray-600">Tổng quan dữ liệu bán vé và vận hành rạp</p>
              </div>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-pink-500 text-white self-start lg:self-auto">Dữ liệu thời gian thực</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm">
          <label className="text-sm text-gray-600">Từ ngày</label>
          <input
            type="date"
            value={filters.start}
            onChange={(e) => setFilters((p) => ({ ...p, start: e.target.value }))}
            className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white"
          />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm">
          <label className="text-sm text-gray-600">Đến ngày</label>
          <input
            type="date"
            value={filters.end}
            onChange={(e) => setFilters((p) => ({ ...p, end: e.target.value }))}
            className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white"
          />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm">
          <label className="text-sm text-gray-600">Nhóm doanh thu</label>
          <select
            value={filters.groupBy}
            onChange={(e) => setFilters((p) => ({ ...p, groupBy: e.target.value }))}
            className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white"
          >
            <option value="day">Ngày</option>
            <option value="week">Tuần</option>
            <option value="month">Tháng</option>
          </select>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm">
          <label className="text-sm text-gray-600">Ngày phân tích mật độ phim</label>
          <input
            type="date"
            value={filters.focusDate}
            onChange={(e) => setFilters((p) => ({ ...p, focusDate: e.target.value }))}
            className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white"
          />
        </div>
      </div>

      {loading && <div className="text-blue-600 font-semibold">Đang tải dữ liệu dashboard...</div>}
      {error && <div className="text-red-600 font-semibold">{error}</div>}

      {analytics && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {summaryCards.map((card) => (
              <SummaryCard key={card.title} {...card} />
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickRevenueCards.map((card) => (
              <MiniMetricCard key={card.title} {...card} />
            ))}
          </div>

          <Section title="Phân tích doanh thu">
            <div className={`${SURFACE_CLASS} h-80`}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueTrendData}>
                  <CartesianGrid stroke={GRID_STROKE} strokeDasharray="4 4" vertical={false} />
                  <XAxis dataKey="label" tick={AXIS_TICK} axisLine={{ stroke: "#cbd5e1" }} tickLine={{ stroke: "#cbd5e1" }} />
                  <YAxis tickFormatter={(v) => formatCompactNumber(v)} tick={AXIS_TICK} axisLine={{ stroke: "#cbd5e1" }} tickLine={{ stroke: "#cbd5e1" }} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => formatCurrency(v)} />
                  <Legend wrapperStyle={LEGEND_STYLE} />
                  <Line type="monotone" dataKey="ticketRevenue" stroke="#3b82f6" strokeWidth={2.5} name="Doanh thu vé" dot={false} />
                  <Line type="monotone" dataKey="foodRevenue" stroke="#16a34a" strokeWidth={2.5} name="Doanh thu F&B" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Section>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Section title="Phân tích khung giờ">
              <div className={`${SURFACE_CLASS} h-72`}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={timeSlotDisplayData}>
                    <CartesianGrid stroke={GRID_STROKE} strokeDasharray="4 4" vertical={false} />
                    <XAxis dataKey="slotLabel" tick={AXIS_TICK} axisLine={{ stroke: "#cbd5e1" }} tickLine={{ stroke: "#cbd5e1" }} />
                    <YAxis tick={AXIS_TICK} axisLine={{ stroke: "#cbd5e1" }} tickLine={{ stroke: "#cbd5e1" }} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => Number(v).toLocaleString("vi-VN")} />
                    <Legend wrapperStyle={LEGEND_STYLE} />
                    <Bar dataKey="ticketsSold" name="Số vé" fill="#ec4899" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Section>

            <Section title="Thống kê theo thể loại">
              <div className={`${SURFACE_CLASS} h-72`}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={genreData}>
                    <CartesianGrid stroke={GRID_STROKE} strokeDasharray="4 4" vertical={false} />
                    <XAxis dataKey="genre" tick={AXIS_TICK} axisLine={{ stroke: "#cbd5e1" }} tickLine={{ stroke: "#cbd5e1" }} />
                    <YAxis tick={AXIS_TICK} axisLine={{ stroke: "#cbd5e1" }} tickLine={{ stroke: "#cbd5e1" }} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => Number(v).toLocaleString("vi-VN")} />
                    <Legend wrapperStyle={LEGEND_STYLE} />
                    <Bar dataKey="ticketsSold" name="Số vé" fill="#6366f1" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Section>
          </div>

              <Section title="Tỉ lệ lấp đầy theo ngày">
                <div className={`${SURFACE_CLASS} h-72`}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dailyFillRateData}>
                      <CartesianGrid stroke={GRID_STROKE} strokeDasharray="4 4" vertical={false} />
                      <XAxis dataKey="date" tick={AXIS_TICK} axisLine={{ stroke: "#cbd5e1" }} tickLine={{ stroke: "#cbd5e1" }} />
                      <YAxis tickFormatter={(v) => `${Number(v).toFixed(0)}%`} tick={AXIS_TICK} axisLine={{ stroke: "#cbd5e1" }} tickLine={{ stroke: "#cbd5e1" }} />
                      <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => `${Number(v).toFixed(1)}%`} />
                      <Legend wrapperStyle={LEGEND_STYLE} />
                      <Line type="monotone" dataKey="fillRate" stroke="#ef4444" strokeWidth={2.5} name="Tỉ lệ lấp đầy" dot={{ r: 2 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Section>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Section title="Phân tích độ tuổi khách hàng">
              <div className={`${SURFACE_CLASS} h-72`}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={ageData}>
                    <defs>
                      <linearGradient id="ageArea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.45} />
                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.08} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke={GRID_STROKE} strokeDasharray="4 4" vertical={false} />
                    <XAxis dataKey="ageGroup" tick={AXIS_TICK} axisLine={{ stroke: "#cbd5e1" }} tickLine={{ stroke: "#cbd5e1" }} />
                    <YAxis tick={AXIS_TICK} axisLine={{ stroke: "#cbd5e1" }} tickLine={{ stroke: "#cbd5e1" }} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => Number(v).toLocaleString("vi-VN")} />
                    <Legend wrapperStyle={LEGEND_STYLE} />
                    <Area type="monotone" dataKey="customers" stroke="#8b5cf6" fill="url(#ageArea)" strokeWidth={2.5} name="Khách hàng" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Section>

            <Section title="Tỷ lệ lấp đầy theo khu vực ghế">
              <div className={`${SURFACE_CLASS} h-72`}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={seatAreaDisplayData}>
                    <CartesianGrid stroke={GRID_STROKE} strokeDasharray="4 4" vertical={false} />
                    <XAxis dataKey="areaLabel" tick={AXIS_TICK} axisLine={{ stroke: "#cbd5e1" }} tickLine={{ stroke: "#cbd5e1" }} />
                    <YAxis tickFormatter={(v) => `${Number(v).toFixed(0)}%`} tick={AXIS_TICK} axisLine={{ stroke: "#cbd5e1" }} tickLine={{ stroke: "#cbd5e1" }} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => `${Number(v).toFixed(1)}%`} />
                    <Legend wrapperStyle={LEGEND_STYLE} />
                    <Bar dataKey="occupancyRate" name="Lấp đầy" fill="#f97316" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Section>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Section title="Tỉ lệ lấp đầy theo rạp">
              <div className={`${SURFACE_CLASS} h-72`}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={occupancyCinemaData}>
                    <CartesianGrid stroke={GRID_STROKE} strokeDasharray="4 4" vertical={false} />
                    <XAxis dataKey="cinemaName" interval={0} angle={-15} textAnchor="end" height={70} tick={AXIS_TICK} axisLine={{ stroke: "#cbd5e1" }} tickLine={{ stroke: "#cbd5e1" }} />
                    <YAxis tickFormatter={(v) => `${Number(v).toFixed(0)}%`} tick={AXIS_TICK} axisLine={{ stroke: "#cbd5e1" }} tickLine={{ stroke: "#cbd5e1" }} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => `${Number(v).toFixed(1)}%`} />
                    <Legend wrapperStyle={LEGEND_STYLE} />
                    <Bar dataKey="occupancyRate" name="Tỉ lệ lấp đầy" fill="#ef4444" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Section>

            <Section title="Mật độ khai thác phim trong ngày">
              <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm overflow-x-auto">
                <div className="mb-3 text-xs text-gray-600">
                  <span>Ngày yêu cầu: </span>
                  <span className="font-semibold text-gray-800">{densityRequestedDate}</span>
                  <span className="mx-2">|</span>
                  <span>Ngày hiển thị: </span>
                  <span className="font-semibold text-blue-700">{densityEffectiveDate}</span>
                  {densityFallbackApplied && (
                    <span className="ml-2 text-orange-600">(đã tự động fallback về ngày gần nhất có suất chiếu)</span>
                  )}
                </div>
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2 text-left">Phim</th>
                      <th className="py-2 text-left">Số suất</th>
                      <th className="py-2 text-left">Khung giờ cao nhất</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(analytics.movieDensity || []).length > 0 ? (
                      (analytics.movieDensity || []).map((row) => (
                        <tr key={row.movieId} className="border-b">
                          <td className="py-2">{row.movieTitle}</td>
                          <td className="py-2">{row.showCount}</td>
                          <td className="py-2">{mapTimeSlotLabel(row.peakTimeSlot)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="py-6 text-center text-sm text-gray-500">
                          Không có dữ liệu mật độ phim cho ngày đã chọn
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Section>
          </div>

          <Section title="Báo cáo phân tích (lọc)">
            <div className="flex gap-2 mb-4 flex-wrap">
              {breakdownType.map((item) => (
                <button
                  key={item.key}
                  onClick={() => setActiveBreakdown(item.key)}
                  className={`px-3 py-1 rounded-lg text-sm ${
                    activeBreakdown === item.key ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={breakdownData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" interval={0} angle={-15} textAnchor="end" height={70} />
                  <YAxis tickFormatter={(v) => formatCompactNumber(v)} />
                  <Tooltip formatter={(v) => formatCurrency(v)} />
                  <Legend />
                  <Bar dataKey="revenue" name="Doanh thu" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Section>

          <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
            <Section title="Báo cáo Sales Summary">
              <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm overflow-x-auto">
                {activeBreakdown === 'revenueByTicketVolume' && (
                  <div className="mb-2 text-xs text-gray-500">Nhóm vé = số ghế trong 1 đơn đặt vé (ví dụ: 2 vé = 2 ghế trong 1 đơn)</div>
                )}
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2 text-left">{salesSummaryRows.firstColName}</th>
                      <th className="py-2 text-left">Số vé</th>
                      <th className="py-2 text-left">Doanh thu</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salesSummaryRows.rows.map((row) => (
                      <tr key={`${activeBreakdown}-${row.label}`} className="border-b">
                        <td className="py-2">
                          {activeBreakdown === 'revenueByTicketVolume' ? mapTicketBucketLabel(row.label) : row.label}
                        </td>
                        <td className="py-2">{Number(row.ticketCount || 0).toLocaleString("vi-VN")}</td>
                        <td className="py-2 text-blue-600 font-semibold">{formatCurrency(row.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>
          </div>

        </>
      )}
    </div>
  );
};

function SummaryCard({ title, value, suffix = "", bg, icon }) {
  return (
    <div className={`${bg} rounded-2xl border border-gray-200 p-4 shadow-[0_10px_28px_-14px_rgba(15,23,42,0.35)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_16px_32px_-14px_rgba(59,130,246,0.35)]`}>
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600 font-medium">{title}</p>
        <span>{icon}</span>
      </div>
      <p className="text-2xl font-bold text-gray-900 mt-2 tracking-tight">{formatMetric(value, suffix)}</p>
    </div>
  );
}

function MiniMetricCard({ title, value, isText = false, tone = "text-gray-900" }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-[0_10px_24px_-14px_rgba(15,23,42,0.35)] transition-all duration-300 hover:scale-[1.02] hover:border-blue-200">
      <div className="text-sm text-slate-500 font-medium">{title}</div>
      <div className={`text-xl font-bold mt-2 ${tone} tracking-tight`}>
        {isText ? value : formatCurrency(value)}
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-slate-800 tracking-tight">{title}</h3>
      {children}
    </div>
  );
}

function formatCurrency(value) {
  return `${Number(value || 0).toLocaleString("vi-VN")} VNĐ`;
}

function formatMetric(value, suffix) {
  if (suffix) {
    return `${Number(value || 0).toLocaleString("vi-VN")} ${suffix}`;
  }
  return Number(value || 0).toLocaleString("vi-VN");
}

function formatCompactNumber(value) {
  const num = Number(value || 0);
  if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1)}B`;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toString();
}

function mapTicketBucketLabel(label) {
  if (!label) return label;
  // normalize common backend labels like "1 VE", "5+ VE"
  const l = label.toString();
  // 5+ case
  if (/^5\+\s*VE$/i.test(l) || /^5\+$/i.test(l)) {
    return `5+ vé`;
  }
  // numeric case like "1 VE" or "2VE"
  const m = l.match(/^(\d+)/);
  if (m) {
    return `${m[1]} vé`;
  }
  // fallback: replace VE -> vé
  return l.replace(/VE/i, "vé").replace(/\s+/g, " ");
}

export default DashBoard;

