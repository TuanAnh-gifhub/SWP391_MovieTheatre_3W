import React, { useEffect, useState, useRef } from "react";
import { getOrderHistory } from "../../../../service/profile";
import { FiDownload, FiSearch, FiFilter, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { handleDownloadTicket } from "./DownLoadOrdered";
import { useNavigate } from "react-router-dom";
import { mockSuccessPayment } from "../../../../service/payment";

const encodeId = (id) => btoa(String(id));
const normalize = (str) =>
  str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "_");

// Component thẻ vé ẩn để xuất file
const TicketCard = React.forwardRef(({ order }, ref) => (
  <div
    ref={ref}
    style={{
      width: 350,
      background: "#fff",
      borderRadius: 16,
      border: "1px solid #e5e7eb",
      padding: 16,
      fontFamily: "sans-serif",
      color: "#222",
      margin: 0,
    }}
  >
    {order.poster && (
      <div style={{ textAlign: "center", marginBottom: 8 }}>
        <img
          src={order.poster}
          alt="poster"
          style={{
            width: 120,
            height: 170,
            objectFit: "cover",
            borderRadius: 8,
            margin: "auto",
          }}
        />
      </div>
    )}
    <div style={{ fontWeight: 700, fontSize: 22, textAlign: "center", marginBottom: 4 }}>
      {order.movieTitle}
    </div>
    <div style={{ textAlign: "center", marginBottom: 8 }}>
      <span style={{ background: "#fde68a", color: "#b45309", padding: "2px 8px", borderRadius: 6, fontWeight: 600, fontSize: 14 }}>
        Phòng chiếu: {order.cinemaRoom}
      </span>
    </div>
    <div style={{ textAlign: "center", color: "#2563eb", fontSize: 13, marginBottom: 2 }}>
      {order.cinemaName} - {order.city}
    </div>
    <div style={{ textAlign: "center", fontSize: 11, color: "#2563eb", textDecoration: "underline", marginBottom: 8 }}>
      địa chỉ chi tiết
    </div>
    <div style={{ textAlign: "center", fontWeight: 600, fontSize: 13, marginBottom: 2 }}>MÃ VÉ</div>
    <div style={{ textAlign: "center", color: "#dc2626", fontWeight: 700, fontSize: 22, marginBottom: 8 }}>
      {order.bookingId}
    </div>
    <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
      <div style={{ background: "#f3f4f6", padding: 8, borderRadius: 8 }}>
        <img
          src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(
            JSON.stringify({
              bookingId: order.bookingId,
              movieTitle: order.movieTitle,
              showDate: order.showDate,
              showTime: order.showTime,
              cinemaRoom: order.cinemaRoom,
              seats: order.seats,
            })
          )}`}
          alt="QR"
          width={100}
          height={100}
        />
      </div>
    </div>
    <div style={{ fontSize: 13, marginBottom: 2 }}>
      <b>Suất chiếu:</b> {order.showDate} - {order.showTime}
    </div>
    <div style={{ fontSize: 13, marginBottom: 2 }}>
      <b>Ghế:</b>{" "}
      {Array.isArray(order.seats) && order.seats.length > 0
        ? order.seats.map((seat) => seat.seatName).join(", ")
        : "Không có"}
    </div>
    <div style={{ fontSize: 13, marginBottom: 2 }}>
      <b>Tổng tiền:</b>{" "}
      <span style={{ color: "#dc2626", fontWeight: 600 }}>
        {order.totalPrice
          ? Number(order.totalPrice).toLocaleString("vi-VN") + " VNĐ"
          : "Không có"}
      </span>
    </div>
    <div style={{ fontSize: 13, marginBottom: 2 }}>
      <b>Trạng thái:</b> {order.status}
    </div>
    <div style={{ fontSize: 13, marginBottom: 2 }}>
      <b>Ngày đặt vé:</b>{" "}
      {order.bookingDate
        ? new Date(order.bookingDate).toLocaleString("vi-VN")
        : "Không có"}
    </div>
    <div style={{ fontSize: 13, marginBottom: 8 }}>
      <b>Điểm quy đổi:</b> {order.convertedScore ?? 0}
    </div>
    <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8, padding: 8, fontSize: 11 }}>
      <b>Lưu ý/Note:</b>
      <br />
      Vé đã mua không thể huỷ, đổi hoặc trả lại. Vui lòng liên hệ Ban Quản Lý rạp hoặc tra cứu thông tin tại mục Điều khoản mua và sử dụng vé xem phim để biết thêm chi tiết.
    </div>
  </div>
));

const PAGE_SIZE_OPTIONS = [10, 25, 50];

const MyOrdered = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloadOrder, setDownloadOrder] = useState(null);
  const [payingBookingId, setPayingBookingId] = useState(null);
  const ticketRef = useRef(null);
  const navigate = useNavigate();

  // Filter, search, pagination state
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(""); // "Success", "Cancelled", ""
  const [dateFilter, setDateFilter] = useState(""); // yyyy-mm-dd
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);

  useEffect(() => { setPage(1); }, [search, statusFilter, dateFilter, pageSize]);

  const fetchOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getOrderHistory();
      let data = response.data?.data;
      if (data && !Array.isArray(data)) {
        data = [data];
      }
      setOrders(data || []);
    } catch (err) {
      setError("Không có thông tin lịch sử đặt vé để hiển thị.");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMockPayment = async (bookingId) => {
    const customerId = Number(localStorage.getItem("id"));
    if (!customerId) {
      setError("Không xác định được tài khoản. Vui lòng đăng nhập lại.");
      return;
    }

    try {
      setPayingBookingId(bookingId);
      await mockSuccessPayment({ bookingId, customerId });
      await fetchOrders();
    } catch (err) {
      const message = err?.response?.data?.message || "Thanh toán thử thất bại.";
      setError(message);
    } finally {
      setPayingBookingId(null);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Khi downloadOrder thay đổi, render xong thì xuất file
  useEffect(() => {
    if (downloadOrder && ticketRef.current) {
      setTimeout(async () => {
        await handleDownloadTicket(ticketRef.current, `ve_xem_phim_${downloadOrder.bookingId}.png`);
        setDownloadOrder(null); // Ẩn component sau khi tải xong
      }, 100); // Đợi DOM render
    }
  }, [downloadOrder]);

  // Pagination logic
  const filtered = orders.filter(order => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      (order.movieTitle && order.movieTitle.toLowerCase().includes(q)) ||
      (order.bookingId && String(order.bookingId).toLowerCase().includes(q));
    const matchStatus =
      !statusFilter || String(order.status || "").toLowerCase() === statusFilter.toLowerCase();
    const matchDate =
      !dateFilter || (order.bookingDate && new Date(order.bookingDate).toISOString().slice(0,10) === dateFilter);
    return matchSearch && matchStatus && matchDate;
  });
  const total = filtered.length;
  const totalPages = Math.ceil(total / pageSize);
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  // Khi đổi pageSize, nếu page hiện tại > tổng số trang mới, set page về tổng số trang mới
  useEffect(() => {
    if (page > totalPages) setPage(totalPages || 1);
  }, [pageSize, totalPages]);

  if (loading) return <div>Đang tải dữ liệu...</div>;
  if (error) return <div className="text-gray-500">{error}</div>;

  return (
    <div className="p-4">
      {/* Render thẻ vé ẩn để xuất file */}
      <div style={{ position: "absolute", left: -9999, top: 0 }}>
        {downloadOrder && <TicketCard ref={ticketRef} order={downloadOrder} />}
      </div>
      {/* Filter bar tối giản, nhỏ gọn */}
      <div className="flex flex-col md:flex-row md:items-end md:gap-6 gap-3 mb-4">
        {/* Tìm kiếm */}
        <div className="flex flex-col flex-1 min-w-[140px]">
          <label className="text-gray-700 font-medium mb-1 flex items-center gap-1 text-sm" htmlFor="order-search">
            <FiSearch className="inline" size={16} /> Tìm kiếm
          </label>
          <input
            id="order-search"
            type="text"
            className="border px-2 py-1 text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition placeholder:text-gray-400 rounded-xl"
            placeholder="Tên phim, mã vé..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        {/* Trạng thái */}
        <div className="flex flex-col min-w-[110px]">
          <label className="text-gray-700 font-medium mb-1 flex items-center gap-1 text-sm" htmlFor="order-status">
            <FiFilter className="inline" size={16} /> Trạng thái
          </label>
          <select
            id="order-status"
            className="border px-2 py-1 text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition rounded-xl"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="">Tất cả</option>
            <option value="Success">Thành công</option>
            <option value="Cancelled">Đã hủy</option>
            <option value="pending">Chờ thanh toán</option>
          </select>
        </div>
        {/* Ngày đặt vé */}
        <div className="flex flex-col min-w-[130px]">
          <label className="text-gray-700 font-medium mb-1 flex items-center gap-1 text-sm" htmlFor="order-date">
            <svg xmlns='http://www.w3.org/2000/svg' className='inline w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' /></svg> Ngày đặt vé
          </label>
          <input
            id="order-date"
            type="date"
            className="border px-2 py-1 text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition rounded-xl"
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value)}
            pattern="(0[1-9]|1[0-2])/[0-3][0-9]/[0-9]{4}"
          />
        </div>
      </div>
      {paged.length === 0 ? (
        <div className="text-gray-500">Không tìm thấy vé phù hợp.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-slide">
          {paged.map((order, idx) => (
            <div
              key={order.bookingId || idx}
              className="bg-white rounded-xl shadow-lg border border-blue-100 p-4 flex flex-col gap-3 hover:shadow-2xl transition cursor-pointer group"
              onClick={e => {
                if (e.target.closest("button")) return;
                navigate(`/my-orders/${encodeId(order.bookingId)}-${normalize(order.movieTitle)}`);
              }}
            >
              <div className="flex gap-3 items-center">
                <img
                  src={order.poster || 'https://via.placeholder.com/80x120?text=No+Poster'}
                  alt="poster"
                  className="w-20 h-28 object-cover rounded-lg border"
                />
                <div className="flex-1">
                  <div
                    className="font-bold text-lg text-blue-700 break-words line-clamp-2 max-h-[2.8em] overflow-hidden"
                    title={order.movieTitle}
                    style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                  >
                    {order.movieTitle}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Mã vé: <span className="font-mono">{order.bookingId}</span></div>
                  <div className="text-xs text-gray-500 mt-1">Ngày chiếu: <span className="font-semibold">{order.showDate}</span></div>
                  <div className="text-xs text-gray-500">Giờ: <span className="font-semibold">{order.showTime}</span></div>
                  <div className="text-xs text-gray-500">Ghế: <span className="font-semibold">{Array.isArray(order.seats) && order.seats.length > 0 ? order.seats.map(seat => seat.seatName).join(", ") : "-"}</span></div>
                </div>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${order.status === "Success" ? "bg-green-100 text-green-700" : order.status === "Cancelled" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>
                  {order.status}
                </span>
                <div className="flex items-center gap-2">
                  {String(order.status || "").toLowerCase() === "pending" && (
                    <button
                      title="Thanh toán thử thành công"
                      className="px-2 py-1 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold transition disabled:opacity-60"
                      disabled={payingBookingId === order.bookingId}
                      onClick={e => {
                        e.stopPropagation();
                        handleMockPayment(order.bookingId);
                      }}
                    >
                      {payingBookingId === order.bookingId ? "Đang xử lý..." : "Thanh toán thử"}
                    </button>
                  )}
                  <button
                    title="Lưu vé"
                    className="p-2 rounded-full bg-yellow-50 hover:bg-yellow-200 text-yellow-600 transition"
                    onClick={e => {
                      e.stopPropagation();
                      setDownloadOrder(order);
                    }}
                  >
                    <FiDownload size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Pagination + PageSize select nhỏ gọn, nằm trong container, không fixed */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-6 gap-2 bg-white rounded-xl border border-blue-100 shadow-sm px-2 py-2">
        <div className="flex justify-center sm:justify-start gap-1">
          <button
            className="px-2 py-1 rounded-md border bg-white hover:bg-blue-50 disabled:opacity-50 flex items-center justify-center text-sm"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            aria-label="Trang trước"
          >
            <FiChevronLeft size={16} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              className={`px-2 py-1 rounded-md border flex items-center justify-center text-sm font-medium ${page === i + 1 ? 'bg-blue-500 text-white border-blue-500' : 'bg-white hover:bg-blue-50'}`}
              onClick={() => setPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
          <button
            className="px-2 py-1 rounded-md border bg-white hover:bg-blue-50 disabled:opacity-50 flex items-center justify-center text-sm"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            aria-label="Trang sau"
          >
            <FiChevronRight size={16} />
          </button>
        </div>
        <div className="flex justify-center sm:justify-end">
          <select
            className="border rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-blue-400"
            value={pageSize}
            onChange={e => setPageSize(Number(e.target.value))}
          >
            {PAGE_SIZE_OPTIONS.map(opt => (
              <option key={opt} value={opt}>{opt} / page</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default MyOrdered;