
export const HARDCODE_DATA = {
  // ===== KPI Data (không có API phù hợp) =====
  kpi: {
    todayRevenue: 55900000,
    todayTickets: 894,
    activeMovies: 14,
    occupancyRate: 87.4,
    revenueDelta: 4.2,
    ticketsDelta: 3.8,
    moviesDelta: 0,
    occupancyDelta: 1.3
  },

  // ===== Revenue Trend (không có API) =====
  revenueTrend: [
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
  ],

  // ===== Tickets by Hour =====
  ticketsByHour: [
    { hour: "09:00", tickets: 52 }, { hour: "10:00", tickets: 74 },
    { hour: "11:00", tickets: 91 }, { hour: "12:00", tickets: 108 },
    { hour: "13:00", tickets: 119 }, { hour: "14:00", tickets: 133 },
    { hour: "15:00", tickets: 149 }, { hour: "16:00", tickets: 171 },
    { hour: "17:00", tickets: 194 }, { hour: "18:00", tickets: 236 },
    { hour: "19:00", tickets: 268 }, { hour: "20:00", tickets: 251 },
    { hour: "21:00", tickets: 206 }, { hour: "22:00", tickets: 164 },
  ],

  // ===== Top Movies =====
  topMovies: [
    { name: "Dune: Phần Hai", tickets: 1420, revenue: 365800000, occupancy: 89.2 },
    { name: "Kung Fu Panda 4", tickets: 1305, revenue: 318700000, occupancy: 84.8 },
    { name: "Godzilla x Kong", tickets: 1282, revenue: 311900000, occupancy: 83.6 },
    { name: "Cuộc Nội Chiến", tickets: 1148, revenue: 286400000, occupancy: 79.1 },
    { name: "Điềm Báo Đầu Tiên", tickets: 1040, revenue: 249300000, occupancy: 77.3 },
  ],

  // ===== Movie Performance =====
  moviePerformance: [
    { name: "Dune: Phần Hai", tickets: 1420, revenue: 365800000, occupancy: 89.2 },
    { name: "Kung Fu Panda 4", tickets: 1305, revenue: 318700000, occupancy: 84.8 },
    { name: "Godzilla x Kong", tickets: 1282, revenue: 311900000, occupancy: 83.6 },
    { name: "Cuộc Nội Chiến", tickets: 1148, revenue: 286400000, occupancy: 79.1 },
    { name: "Điềm Báo Đầu Tiên", tickets: 1040, revenue: 249300000, occupancy: 77.3 },
    { name: "Inside Out 2", tickets: 990, revenue: 228100000, occupancy: 75.8 },
    { name: "Người Khỉ", tickets: 870, revenue: 201600000, occupancy: 72.4 },
    { name: "Abigail", tickets: 802, revenue: 184900000, occupancy: 69.9 },
  ],

  // ===== Showtime Analytics =====
  showtimeAnalytics: [
    { time: "09:15", room: "A1", movie: "Dune: Phần Hai", seatsBooked: 92, capacity: 120 },
    { time: "10:00", room: "B2", movie: "Kung Fu Panda 4", seatsBooked: 76, capacity: 100 },
    { time: "11:20", room: "C1", movie: "Cuộc Nội Chiến", seatsBooked: 61, capacity: 90 },
    { time: "13:00", room: "A2", movie: "Godzilla x Kong", seatsBooked: 108, capacity: 120 },
    { time: "14:30", room: "D1", movie: "Inside Out 2", seatsBooked: 69, capacity: 100 },
    { time: "16:10", room: "B1", movie: "Điềm Báo Đầu Tiên", seatsBooked: 82, capacity: 110 },
    { time: "18:40", room: "A3", movie: "Dune: Phần Hai", seatsBooked: 116, capacity: 120 },
    { time: "20:15", room: "C2", movie: "Godzilla x Kong", seatsBooked: 98, capacity: 110 },
  ],

  // ===== Revenue Breakdown (Vé vs F&B) =====
  revenueBreakdown: [
    { period: "Thứ 2", ticketRevenue: 58500000, foodRevenue: 15100000 },
    { period: "Thứ 3", ticketRevenue: 60200000, foodRevenue: 16400000 },
    { period: "Thứ 4", ticketRevenue: 61800000, foodRevenue: 17300000 },
    { period: "Thứ 5", ticketRevenue: 63900000, foodRevenue: 18100000 },
    { period: "Thứ 6", ticketRevenue: 68900000, foodRevenue: 22200000 },
    { period: "Thứ 7", ticketRevenue: 73400000, foodRevenue: 25500000 },
    { period: "CN", ticketRevenue: 70700000, foodRevenue: 24300000 },
  ],

  // ===== Combo Analytics =====
  comboAnalytics: {
    conversionRate: 31.7,
    totalComboOrders: 1794,
    comboOrders: [
      { combo: "Combo Đôi", orders: 530 },
      { combo: "Bữa Tiệc Gia Đình", orders: 420 },
      { combo: "Tiết Kiệm Cá Nhân", orders: 388 },
      { combo: "Bữa Tiệc Trẻ Em", orders: 246 },
      { combo: "Bộ Đôi Đêm Khuya", orders: 210 },
    ]
  },

  // ===== System Health =====
  systemHealth: {
    paymentSuccessRate: 98.4,
    failedBookings: 14,
    seatConflicts: 3,
  },

  // ===== Age Distribution =====
  ageDistribution: [
    { ageGroup: "13-17", customers: 240 },
    { ageGroup: "18-24", customers: 960 },
    { ageGroup: "25-34", customers: 1230 },
    { ageGroup: "35-44", customers: 740 },
    { ageGroup: "45-54", customers: 380 },
    { ageGroup: "55+", customers: 190 },
  ],

  // ===== Customer Mix (fallback) =====
  customerMix: [
    { name: "Khách mới", value: 38 },
    { name: "Khách quay lại", value: 62 }
  ]
};