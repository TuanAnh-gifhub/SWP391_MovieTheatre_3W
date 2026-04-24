import React, { useCallback, useEffect, useMemo, useState } from "react";
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
  CalendarPlus,
  Clock3,
  DollarSign,
  Film,
  Percent,
  PlusCircle,
  RefreshCcw,
  Settings2,
  Tag,
  Ticket,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  getCustomerUsageReport,
  getSalesSummary,
  getSummaryByDate,
} from "../../../service/dashboard";

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

const shortDateFormatter = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
});

const longDateFormatter = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const formatCurrency = (value) => currencyFormatter.format(Number(value) || 0);
const formatCompact = (value) => compactNumberFormatter.format(Number(value) || 0);
const formatPercent = (value) => `${(Number(value) || 0).toFixed(1)}%`;

const sumBy = (items, selector) =>
  items.reduce((total, item) => total + (Number(selector(item)) || 0), 0);

const truncateLabel = (value, maxLength = 18) => {
  if (!value) return "Khong co";
  return value.length > maxLength ? `${value.slice(0, maxLength - 1)}...` : value;
};

const toIsoDate = (date) => date.toISOString().slice(0, 10);

const createDefaultRange = () => {
  const to = new Date();
  const from = new Date();
  from.setDate(to.getDate() - 13);

  return {
    from: toIsoDate(from),
    to: toIsoDate(to),
  };
};

const parseDate = (value) => {
  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const formatShortDate = (value) => {
  const date = parseDate(value);
  return date ? shortDateFormatter.format(date) : value;
};

const formatLongDate = (value) => {
  const date = parseDate(value);
  return date ? longDateFormatter.format(date) : value;
};

const getTrendMeta = (value) => {
  if ((Number(value) || 0) >= 0) {
    return {
      icon: TrendingUp,
      colorClass: "text-emerald-600 bg-emerald-50 border-emerald-200",
      label: `+${(Number(value) || 0).toFixed(1)}%`,
    };
  }

  return {
    icon: TrendingDown,
    colorClass: "text-rose-600 bg-rose-50 border-rose-200",
    label: `${(Number(value) || 0).toFixed(1)}%`,
  };
};

const calculatePercentChange = (current, previous) => {
  const safeCurrent = Number(current) || 0;
  const safePrevious = Number(previous) || 0;

  if (!safePrevious) {
    return safeCurrent ? 100 : 0;
  }

  return ((safeCurrent - safePrevious) / safePrevious) * 100;
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

const EmptyState = ({ message }) => (
  <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 text-center text-sm text-slate-500">
    {message}
  </div>
);

const DashBoard = () => {
  const navigate = useNavigate();
  const [dateRange] = useState(createDefaultRange);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [summaryRows, setSummaryRows] = useState([]);
  const [salesRows, setSalesRows] = useState([]);
  const [customerRows, setCustomerRows] = useState([]);

  const loadDashboard = useCallback(
    async (manualRefresh = false) => {
      if (manualRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError("");

      try {
        const [summaryResponse, salesResponse, customerResponse] = await Promise.all([
          getSummaryByDate(),
          getSalesSummary({ from: dateRange.from, to: dateRange.to }),
          getCustomerUsageReport({
            start: dateRange.from,
            end: dateRange.to,
            sortBy: "totalSpent",
            direction: "desc",
          }),
        ]);

        const normalizedSummary = Array.isArray(summaryResponse?.result) ? summaryResponse.result : [];
        const normalizedSales = Array.isArray(salesResponse) ? salesResponse : [];
        const normalizedCustomers =
          customerResponse?.success && Array.isArray(customerResponse.data) ? customerResponse.data : [];

        setSummaryRows(normalizedSummary);
        setSalesRows(normalizedSales);
        setCustomerRows(normalizedCustomers);

        if (summaryResponse && summaryResponse.status && summaryResponse.status !== 200) {
          setError(summaryResponse.message || "Khong the tai du lieu tu backend.");
        } else if (!normalizedSummary.length && !normalizedSales.length && !normalizedCustomers.length) {
          setError("Dashboard dang ket noi backend thanh cong, nhung du lieu thuc te hien dang trong.");
        }
      } catch (fetchError) {
        setError(fetchError.message || "Khong the tai du lieu dashboard tu backend.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [dateRange.from, dateRange.to]
  );

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const revenueTrendData = useMemo(() => {
    return [...summaryRows]
      .sort((left, right) => String(left.exportDate).localeCompare(String(right.exportDate)))
      .map((day) => {
        const movies = Array.isArray(day.movies) ? day.movies : [];

        return {
          exportDate: day.exportDate,
          date: formatShortDate(day.exportDate),
          revenue: sumBy(movies, (movie) => movie.totalMoney),
          ticketRevenue: sumBy(movies, (movie) => movie.totalMoneyWithoutFoodAndDiscount),
          foodRevenue: sumBy(movies, (movie) => movie.totalMoneyFood),
          discounts: sumBy(movies, (movie) => movie.totalMoneyDiscount),
          orders: sumBy(movies, (movie) => movie.seller),
          activeMovies: movies.length,
        };
      });
  }, [summaryRows]);

  const topMovies = useMemo(() => {
    const movieMap = new Map();

    summaryRows.forEach((day) => {
      const movies = Array.isArray(day.movies) ? day.movies : [];

      movies.forEach((movie) => {
        const key = movie.movieId ?? movie.movieTitle;
        const current = movieMap.get(key) || {
          movieId: movie.movieId,
          movieTitle: movie.movieTitle || "Khong co ten phim",
          revenue: 0,
          ticketRevenue: 0,
          foodRevenue: 0,
          discounts: 0,
          orders: 0,
        };

        current.revenue += Number(movie.totalMoney) || 0;
        current.ticketRevenue += Number(movie.totalMoneyWithoutFoodAndDiscount) || 0;
        current.foodRevenue += Number(movie.totalMoneyFood) || 0;
        current.discounts += Number(movie.totalMoneyDiscount) || 0;
        current.orders += Number(movie.seller) || 0;

        movieMap.set(key, current);
      });
    });

    return [...movieMap.values()]
      .sort((left, right) => right.revenue - left.revenue)
      .slice(0, 6);
  }, [summaryRows]);

  const categorySalesData = useMemo(() => {
    return [...salesRows]
      .map((row) => ({
        ...row,
        revenue: Number(row.revenue) || 0,
        orderVolume: Number(row.orderVolume) || 0,
        shortCategory: truncateLabel(row.category, 18),
      }))
      .sort((left, right) => right.revenue - left.revenue)
      .slice(0, 8);
  }, [salesRows]);

  const revenueBreakdownData = useMemo(
    () =>
      revenueTrendData.map((row) => ({
        period: row.date,
        ticketRevenue: row.ticketRevenue,
        foodRevenue: row.foodRevenue,
      })),
    [revenueTrendData]
  );

  const topCustomers = useMemo(
    () =>
      [...customerRows]
        .sort((left, right) => (Number(right.totalSpent) || 0) - (Number(left.totalSpent) || 0))
        .slice(0, 8)
        .map((customer) => ({
          ...customer,
          shortName: truncateLabel(customer.fullName, 14),
          totalSpent: Number(customer.totalSpent) || 0,
          totalOrders: Number(customer.totalOrders) || 0,
        })),
    [customerRows]
  );

  const customerMixData = useMemo(() => {
    if (!customerRows.length) {
      return [];
    }

    const newCustomers = customerRows.filter((customer) => (Number(customer.totalOrders) || 0) <= 1).length;
    const returningCustomers = Math.max(customerRows.length - newCustomers, 0);

    return [
      { name: "Khach moi", value: newCustomers },
      { name: "Khach quay lai", value: returningCustomers },
    ];
  }, [customerRows]);

  const summary = useMemo(() => {
    const latestDay = revenueTrendData[revenueTrendData.length - 1] || {
      revenue: 0,
      orders: 0,
      activeMovies: 0,
      foodRevenue: 0,
      ticketRevenue: 0,
    };
    const previousDay = revenueTrendData[revenueTrendData.length - 2] || {
      revenue: 0,
      orders: 0,
      activeMovies: 0,
      foodRevenue: 0,
      ticketRevenue: 0,
    };

    const totalRevenue = sumBy(revenueTrendData, (row) => row.revenue);
    const totalOrders = sumBy(revenueTrendData, (row) => row.orders);
    const totalTicketRevenue = sumBy(revenueTrendData, (row) => row.ticketRevenue);
    const totalFoodRevenue = sumBy(revenueTrendData, (row) => row.foodRevenue);
    const totalDiscounts = sumBy(revenueTrendData, (row) => row.discounts);
    const foodShare = totalRevenue ? (totalFoodRevenue / totalRevenue) * 100 : 0;
    const previousFoodShare =
      (Number(previousDay.ticketRevenue) || 0) + (Number(previousDay.foodRevenue) || 0)
        ? ((Number(previousDay.foodRevenue) || 0) /
            ((Number(previousDay.ticketRevenue) || 0) + (Number(previousDay.foodRevenue) || 0))) *
          100
        : 0;
    const bestRevenueDay = revenueTrendData.reduce(
      (best, current) => (current.revenue > best.revenue ? current : best),
      revenueTrendData[0] || { revenue: 0, date: "--", exportDate: "" }
    );
    const returningCustomers = customerMixData.find((row) => row.name === "Khach quay lai")?.value || 0;

    return {
      totalRevenue,
      totalOrders,
      totalTicketRevenue,
      totalFoodRevenue,
      totalDiscounts,
      activeMovies: topMovies.length,
      averageDailyRevenue: revenueTrendData.length ? totalRevenue / revenueTrendData.length : 0,
      averageOrderValue: totalOrders ? totalRevenue / totalOrders : 0,
      revenueDelta: calculatePercentChange(latestDay.revenue, previousDay.revenue),
      ordersDelta: calculatePercentChange(latestDay.orders, previousDay.orders),
      moviesDelta: calculatePercentChange(latestDay.activeMovies, previousDay.activeMovies),
      foodShare,
      foodShareDelta: foodShare - previousFoodShare,
      returningRate: customerRows.length ? (returningCustomers / customerRows.length) * 100 : 0,
      bestRevenueDay,
      topMovie: topMovies[0] || null,
      topCategory: categorySalesData[0] || null,
    };
  }, [categorySalesData, customerMixData, customerRows.length, revenueTrendData, topMovies]);

  const loadingView = (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500 shadow-sm">
      Dang tai du lieu dashboard tu backend...
    </div>
  );

  return (
    <div className="min-h-full bg-slate-50">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6 p-4 md:p-6">
        <header className="rounded-2xl border border-slate-200 bg-gradient-to-r from-cyan-50 via-white to-amber-50 p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-medium text-cyan-700">Dashboard dang dung du lieu backend that</p>
              <h1 className="mt-1 text-2xl font-bold text-slate-900 md:text-3xl">Bang dieu khien doanh thu</h1>
              <p className="mt-1 text-sm text-slate-600">
                Tong hop doanh thu, booking, phim ban chay va hanh vi khach hang trong giai doan
                {` ${formatLongDate(dateRange.from)} - ${formatLongDate(dateRange.to)}.`}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
                <Clock3 className="h-4 w-4 text-cyan-600" />
                {refreshing ? "Dang lam moi..." : "Da ket noi backend"}
              </div>
              <button
                type="button"
                onClick={() => loadDashboard(true)}
                disabled={refreshing}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-cyan-300 hover:text-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCcw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                Lam moi
              </button>
            </div>
          </div>
        </header>

        {error ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {error}
          </div>
        ) : null}

        {loading ? (
          loadingView
        ) : (
          <>
            <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              <KpiCard
                title="Tong doanh thu"
                value={formatCurrency(summary.totalRevenue)}
                trendValue={summary.revenueDelta}
                helperText="So voi ngay gan nhat truoc do"
                icon={DollarSign}
                iconBgClass="bg-gradient-to-br from-cyan-500 to-cyan-700"
              />
              <KpiCard
                title="Tong booking thanh cong"
                value={Math.round(summary.totalOrders).toLocaleString("en-US")}
                trendValue={summary.ordersDelta}
                helperText="Tong booking trong giai doan"
                icon={Ticket}
                iconBgClass="bg-gradient-to-br from-emerald-500 to-emerald-700"
              />
              <KpiCard
                title="Phim co doanh thu"
                value={summary.activeMovies.toLocaleString("en-US")}
                trendValue={summary.moviesDelta}
                helperText="So phim co phat sinh doanh thu"
                icon={Film}
                iconBgClass="bg-gradient-to-br from-amber-500 to-orange-600"
              />
              <KpiCard
                title="Ty trong F&B"
                value={formatPercent(summary.foodShare)}
                trendValue={summary.foodShareDelta}
                helperText="Doanh thu do an va thuc uong"
                icon={Percent}
                iconBgClass="bg-gradient-to-br from-violet-500 to-fuchsia-600"
              />
            </section>

            <section className="grid grid-cols-1 gap-6 xl:grid-cols-12">
              <div className="xl:col-span-8">
                <DashboardCard
                  title="Xu huong doanh thu theo ngay"
                  subtitle="Tong doanh thu thuc te duoc tong hop tu backend"
                >
                  {revenueTrendData.length ? (
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
                            labelFormatter={(label, payload) => payload?.[0]?.payload?.exportDate || label}
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
                  ) : (
                    <EmptyState message="Chua co du lieu doanh thu de hien thi." />
                  )}
                </DashboardCard>
              </div>

              <div className="xl:col-span-4">
                <DashboardCard
                  title="Booking theo ngay"
                  subtitle="Tong booking thanh cong moi ngay"
                >
                  {revenueTrendData.length ? (
                    <div className="h-80 w-full">
                      <ResponsiveContainer>
                        <BarChart data={revenueTrendData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                          <YAxis />
                          <Tooltip formatter={(value) => `${Math.round(Number(value) || 0)} booking`} />
                          <Bar dataKey="orders" fill="#14b8a6" radius={[8, 8, 0, 0]} name="Booking" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <EmptyState message="Chua co booking thanh cong trong giai doan nay." />
                  )}
                </DashboardCard>
              </div>
            </section>

            <section className="grid grid-cols-1 gap-6 xl:grid-cols-12">
              <div className="xl:col-span-6">
                <DashboardCard
                  title="Top phim theo doanh thu"
                  subtitle="Tong hop theo du lieu xuat doanh thu moi ngay"
                >
                  {topMovies.length ? (
                    <div className="overflow-hidden rounded-xl border border-slate-200">
                      <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                          <tr>
                            <th className="px-3 py-2 font-medium">Phim</th>
                            <th className="px-3 py-2 font-medium">Booking</th>
                            <th className="px-3 py-2 font-medium">Doanh thu ve</th>
                            <th className="px-3 py-2 font-medium">Doanh thu F&B</th>
                            <th className="px-3 py-2 font-medium">Tong doanh thu</th>
                          </tr>
                        </thead>
                        <tbody>
                          {topMovies.map((movie) => (
                            <tr
                              key={movie.movieId ?? movie.movieTitle}
                              className="border-b border-slate-100 last:border-b-0"
                            >
                              <td className="px-3 py-3 font-medium text-slate-800">{movie.movieTitle}</td>
                              <td className="px-3 py-3 text-slate-600">
                                {Math.round(movie.orders).toLocaleString("en-US")}
                              </td>
                              <td className="px-3 py-3 text-slate-600">{formatCurrency(movie.ticketRevenue)}</td>
                              <td className="px-3 py-3 text-slate-600">{formatCurrency(movie.foodRevenue)}</td>
                              <td className="px-3 py-3 font-semibold text-slate-900">
                                {formatCurrency(movie.revenue)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <EmptyState message="Khong co phim nao co doanh thu trong giai doan da chon." />
                  )}
                </DashboardCard>
              </div>

              <div className="xl:col-span-6">
                <DashboardCard
                  title="Doanh thu ve va F&B theo ngay"
                  subtitle="Phan tach nguon doanh thu thay cho du lieu mau"
                >
                  {revenueBreakdownData.length ? (
                    <div className="h-80 w-full">
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
                            name="Doanh thu ve"
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
                  ) : (
                    <EmptyState message="Khong co du lieu tach doanh thu ve va F&B." />
                  )}

                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-cyan-100 bg-cyan-50 p-3">
                      <p className="text-xs uppercase text-cyan-700">Doanh thu ve</p>
                      <p className="mt-1 text-lg font-semibold text-cyan-900">
                        {formatCurrency(summary.totalTicketRevenue)}
                      </p>
                    </div>
                    <div className="rounded-xl border border-amber-100 bg-amber-50 p-3">
                      <p className="text-xs uppercase text-amber-700">Doanh thu F&B</p>
                      <p className="mt-1 text-lg font-semibold text-amber-900">
                        {formatCurrency(summary.totalFoodRevenue)}
                      </p>
                    </div>
                  </div>
                </DashboardCard>
              </div>
            </section>

            <section className="grid grid-cols-1 gap-6 xl:grid-cols-12">
              <div className="xl:col-span-6">
                <DashboardCard
                  title="Khach hang mua nhieu nhat"
                  subtitle="Lay tu bao cao mua hang cua backend"
                >
                  {topCustomers.length ? (
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                      <div className="h-72 w-full">
                        <ResponsiveContainer>
                          <BarChart data={topCustomers}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis dataKey="shortName" tick={{ fontSize: 11 }} />
                            <YAxis tickFormatter={(value) => formatCompact(value)} />
                            <Tooltip
                              formatter={(value) => formatCurrency(value)}
                              labelFormatter={(label, payload) => payload?.[0]?.payload?.fullName || label}
                            />
                            <Bar dataKey="totalSpent" fill="#14b8a6" radius={[8, 8, 0, 0]} name="Tong chi tieu" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="h-72 w-full">
                        {customerMixData.length ? (
                          <ResponsiveContainer>
                            <PieChart>
                              <Tooltip formatter={(value) => `${value} khach`} />
                              <Legend />
                              <Pie
                                data={customerMixData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={88}
                                label={({ name, value }) => `${name}: ${value}`}
                              >
                                {customerMixData.map((entry, index) => (
                                  <Cell key={entry.name} fill={pieColors[index % pieColors.length]} />
                                ))}
                              </Pie>
                            </PieChart>
                          </ResponsiveContainer>
                        ) : (
                          <EmptyState message="Chua du thong tin de phan loai khach moi va khach quay lai." />
                        )}
                      </div>
                    </div>
                  ) : (
                    <EmptyState message="Chua co bao cao khach hang trong giai doan da chon." />
                  )}
                </DashboardCard>
              </div>

              <div className="xl:col-span-6">
                <DashboardCard
                  title="Nhom ban chay theo doanh muc"
                  subtitle="Tong hop tu endpoint sales summary"
                >
                  {categorySalesData.length ? (
                    <div className="h-72 w-full">
                      <ResponsiveContainer>
                        <BarChart data={categorySalesData} layout="vertical" margin={{ left: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis type="number" tickFormatter={(value) => formatCompact(value)} />
                          <YAxis type="category" dataKey="shortCategory" width={110} tick={{ fontSize: 11 }} />
                          <Tooltip
                            formatter={(value, name) =>
                              name === "Doanh thu"
                                ? formatCurrency(value)
                                : `${Math.round(Number(value) || 0)} don`
                            }
                            labelFormatter={(label, payload) => payload?.[0]?.payload?.category || label}
                          />
                          <Legend />
                          <Bar dataKey="revenue" fill="#0ea5e9" radius={[0, 8, 8, 0]} name="Doanh thu" />
                          <Bar dataKey="orderVolume" fill="#f59e0b" radius={[0, 8, 8, 0]} name="So luong" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <EmptyState message="Endpoint sales summary hien chua co du lieu. Toi da loai bo hardcoded data." />
                  )}
                </DashboardCard>
              </div>
            </section>

            <section className="grid grid-cols-1 gap-6 xl:grid-cols-12">
              <div className="xl:col-span-8">
                <DashboardCard
                  title="Tong quan nhanh"
                  subtitle="Tat ca cac chi so ben duoi deu duoc suy ra tu backend thay vi mang du lieu gia"
                >
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                      <Activity className="h-5 w-5 text-cyan-600" />
                      <div>
                        <p className="text-xs text-slate-500">Doanh thu TB / ngay</p>
                        <p className="text-sm font-semibold text-slate-900">
                          {formatCurrency(summary.averageDailyRevenue)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                      <Users className="h-5 w-5 text-emerald-600" />
                      <div>
                        <p className="text-xs text-slate-500">Gia tri TB / booking</p>
                        <p className="text-sm font-semibold text-slate-900">
                          {formatCurrency(summary.averageOrderValue)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                      <Tag className="h-5 w-5 text-amber-600" />
                      <div>
                        <p className="text-xs text-slate-500">Tong giam gia ghi nhan</p>
                        <p className="text-sm font-semibold text-slate-900">
                          {formatCurrency(summary.totalDiscounts)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                      <Percent className="h-5 w-5 text-violet-600" />
                      <div>
                        <p className="text-xs text-slate-500">Khach quay lai</p>
                        <p className="text-sm font-semibold text-slate-900">
                          {formatPercent(summary.returningRate)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="rounded-xl border border-slate-200 p-4">
                      <p className="text-xs uppercase tracking-wide text-slate-500">Ngay doanh thu cao nhat</p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">
                        {summary.bestRevenueDay?.exportDate
                          ? formatLongDate(summary.bestRevenueDay.exportDate)
                          : "Chua co"}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {formatCurrency(summary.bestRevenueDay?.revenue || 0)}
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-200 p-4">
                      <p className="text-xs uppercase tracking-wide text-slate-500">Phim doanh thu cao nhat</p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">
                        {summary.topMovie?.movieTitle || "Chua co"}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {formatCurrency(summary.topMovie?.revenue || 0)}
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-200 p-4">
                      <p className="text-xs uppercase tracking-wide text-slate-500">Danh muc noi bat</p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">
                        {summary.topCategory?.category || "Chua co"}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {formatCurrency(summary.topCategory?.revenue || 0)}
                      </p>
                    </div>
                  </div>
                </DashboardCard>
              </div>

              <div className="xl:col-span-4">
                <DashboardCard
                  title="Thao tac nhanh"
                  subtitle="Di chuyen nhanh den cac man hinh quan tri"
                >
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 xl:grid-cols-1">
                    <button
                      type="button"
                      onClick={() => navigate("/admin/movie")}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-700 px-4 py-3 text-sm font-semibold text-white transition hover:from-cyan-700 hover:to-cyan-800"
                    >
                      <PlusCircle className="h-4 w-4" />
                      Them phim
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate("/admin/showtimes")}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 px-4 py-3 text-sm font-semibold text-white transition hover:from-emerald-700 hover:to-emerald-800"
                    >
                      <CalendarPlus className="h-4 w-4" />
                      Tao suat chieu
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate("/admin/ticket")}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 px-4 py-3 text-sm font-semibold text-white transition hover:from-amber-700 hover:to-orange-700"
                    >
                      <Settings2 className="h-4 w-4" />
                      Quan ly ve
                    </button>
                  </div>
                </DashboardCard>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default DashBoard;
