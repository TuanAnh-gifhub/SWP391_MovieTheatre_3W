import React, { useEffect, useState } from "react";
import { Table, Tag, Input, Modal, Button } from "antd";
import { getAllBookings } from "../../../service/ticket";
import ScanQrCode from "./ScanQrCode";
import { InboxOutlined, SearchOutlined, QrcodeOutlined, ShoppingCartOutlined, CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined, CalendarOutlined } from "@ant-design/icons";
import { showSuccessToast, showErrorToast } from "../../../utils/toast";

const TicketManagement = () => {
  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 8,
    total: 0,
  });
  const [search, setSearch] = useState("");
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [statusQuickFilter, setStatusQuickFilter] = useState(null);
  const [dateFilter, setDateFilter] = useState("newest"); // "newest", "oldest", "custom"
  const [customDateFrom, setCustomDateFrom] = useState("");
  const [customDateTo, setCustomDateTo] = useState("");

  const normalize = s => s ? s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').trim() : '';

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await getAllBookings();
      if (res.data && res.data.status === 200) {
        setAllBookings(Array.isArray(res.data.result) ? res.data.result : []);
      } else {
        setAllBookings([]);
        showErrorToast(res?.data?.message || "Mất kết nối server");
      }
    } catch (err) {
      setAllBookings([]);
      showErrorToast("Mất kết nối server");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const filterAndPaginate = (page = 1, pageSize = pagination.pageSize) => {
    let filtered = allBookings;
    
    // Filter theo search
    if (search) {
      filtered = filtered.filter(
        (b) =>
          b.bookingId?.toString().includes(search.trim()) ||
          b.movieTitle?.toLowerCase().includes(search.trim().toLowerCase())
      );
    }
    
    // Filter theo status
    if (statusQuickFilter) {
      filtered = filtered.filter(b => {
        const st = normalize(b.status || '');
        if (statusQuickFilter === 'cancelled') return ['cancelled', 'da huy', 'that bai', 'failed', 'huy', 'cancel'].includes(st);
        if (statusQuickFilter === 'success') return ['paid', 'payed', 'da thanh toan', 'success', 'thanh cong', 'thanh toan', 'hoan thanh'].includes(st);
        if (statusQuickFilter === 'pending') return ['pending', 'unpaid', 'chua thanh toan', 'cho thanh toan'].includes(st);
        return true;
      });
    }
    
    // Filter theo ngày
    if (dateFilter === "custom" && (customDateFrom || customDateTo)) {
      filtered = filtered.filter(b => {
        const bookingDate = new Date(b.bookingDate || 0);
        const fromDate = customDateFrom ? new Date(customDateFrom) : null;
        const toDate = customDateTo ? new Date(customDateTo + 'T23:59:59') : null;
        
        if (fromDate && toDate) {
          return bookingDate >= fromDate && bookingDate <= toDate;
        } else if (fromDate) {
          return bookingDate >= fromDate;
        } else if (toDate) {
          return bookingDate <= toDate;
        }
        return true;
      });
    }
    
    // Sắp xếp theo ngày
    filtered.sort((a, b) => {
      const dateA = new Date(a.bookingDate || 0);
      const dateB = new Date(b.bookingDate || 0);
      return dateFilter === "oldest" ? dateA - dateB : dateB - dateA; // newest mặc định
    });
    
    setPagination(prev => ({ ...prev, total: filtered.length, current: page, pageSize }));
    setBookings(filtered.slice((page - 1) * pageSize, page * pageSize));
  };

  useEffect(() => {
    filterAndPaginate(1, pagination.pageSize);
  }, [allBookings, search, statusQuickFilter, dateFilter, customDateFrom, customDateTo]);

  const handleTableChange = (newPagination) => {
    filterAndPaginate(newPagination.current, newPagination.pageSize);
  };

  const totalSold = allBookings.length;
  const countCancelled = allBookings.filter(b => typeof b.status === 'string' && ['cancelled', 'da huy', 'that bai', 'failed', 'huy', 'cancel'].includes(normalize(b.status))).length;
  const countSuccess = allBookings.filter(b => typeof b.status === 'string' && ['paid', 'payed', 'da thanh toan', 'success', 'thanh cong', 'thanh toan', 'hoan thanh'].includes(normalize(b.status))).length;
  const countPending = allBookings.filter(b => typeof b.status === 'string' && ['pending', 'unpaid', 'chưa thanh toán'].includes(normalize(b.status))).length;

  return (
    <>
      {/* Header Section */}
      <div className="bg-blue-50 rounded-xl shadow-lg border border-blue-200 p-4 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <ShoppingCartOutlined className="text-xl text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Quản lý vé đã đặt</h1>
              <p className="text-sm text-gray-600">Quản lý và theo dõi trạng thái vé</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              type="primary"
              icon={<QrcodeOutlined />}
              onClick={() => setQrModalVisible(true)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 border-0 h-10 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Quét QR mã vé
            </Button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
        <div 
          className={`bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-3 border-2 transition-all duration-300 cursor-pointer hover:shadow-lg hover:scale-[1.02] relative ${
            statusQuickFilter === null 
              ? 'border-blue-500 shadow-lg scale-[1.02] z-10' 
              : 'border-gray-200 hover:border-blue-300 hover:z-10'
          }`}
          onClick={() => setStatusQuickFilter(null)}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Tổng vé đã bán</p>
              <p className="text-lg font-bold text-blue-900">{totalSold}</p>
            </div>
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
              <ShoppingCartOutlined className="text-white text-sm" />
            </div>
          </div>
        </div>
        <div 
          className={`bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-3 border-2 transition-all duration-300 cursor-pointer hover:shadow-lg hover:scale-[1.02] relative ${
            statusQuickFilter === 'success' 
              ? 'border-green-500 shadow-lg scale-[1.02] z-10' 
              : 'border-gray-200 hover:border-green-300 hover:z-10'
          }`}
          onClick={() => setStatusQuickFilter(statusQuickFilter === 'success' ? null : 'success')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Đã thanh toán</p>
              <p className="text-lg font-bold text-green-700">{countSuccess}</p>
            </div>
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-md">
              <CheckCircleOutlined className="text-white text-sm" />
            </div>
          </div>
        </div>
        <div 
          className={`bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg p-3 border-2 transition-all duration-300 cursor-pointer hover:shadow-lg hover:scale-[1.02] relative ${
            statusQuickFilter === 'pending' 
              ? 'border-orange-500 shadow-lg scale-[1.02] z-10' 
              : 'border-gray-200 hover:border-orange-300 hover:z-10'
          }`}
          onClick={() => setStatusQuickFilter(statusQuickFilter === 'pending' ? null : 'pending')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Đang thanh toán</p>
              <p className="text-lg font-bold text-orange-700">{countPending}</p>
            </div>
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg flex items-center justify-center shadow-md">
              <ClockCircleOutlined className="text-white text-sm" />
            </div>
          </div>
        </div>
        <div 
          className={`bg-gradient-to-br from-red-50 to-rose-50 rounded-lg p-3 border-2 transition-all duration-300 cursor-pointer hover:shadow-lg hover:scale-[1.02] relative ${
            statusQuickFilter === 'cancelled' 
              ? 'border-red-500 shadow-lg scale-[1.02] z-10' 
              : 'border-gray-200 hover:border-red-300 hover:z-10'
          }`}
          onClick={() => setStatusQuickFilter(statusQuickFilter === 'cancelled' ? null : 'cancelled')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Đã hủy</p>
              <p className="text-lg font-bold text-red-700">{countCancelled}</p>
            </div>
            <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-rose-600 rounded-lg flex items-center justify-center shadow-md">
              <CloseCircleOutlined className="text-white text-sm" />
            </div>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="flex items-center justify-between gap-4 mb-4 p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg border border-gray-200">
        {/* Date Filter */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 font-medium whitespace-nowrap">Sắp xếp theo ngày:</span>
            <select
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
              className="w-32 h-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:outline-none text-sm shadow-sm"
              style={{
                color: 'black',
                backgroundColor: 'white',
              }}
            >
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
              <option value="custom">Tùy chọn</option>
            </select>
          </div>
          
          {dateFilter === "custom" && (
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={customDateFrom}
                onChange={e => setCustomDateFrom(e.target.value)}
                className="h-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:outline-none text-sm shadow-sm"
                style={{
                  color: 'black',
                  backgroundColor: 'white',
                }}
              />
              <span className="text-sm text-gray-500">đến</span>
              <input
                type="date"
                value={customDateTo}
                onChange={e => setCustomDateTo(e.target.value)}
                className="h-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:outline-none text-sm shadow-sm"
                style={{
                  color: 'black',
                  backgroundColor: 'white',
                }}
              />
            </div>
          )}
        </div>
        
        {/* Search */}
        <div className="relative">
          <SearchOutlined className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />
          <input
            placeholder="Tìm kiếm mã vé hoặc tên phim..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 w-64 h-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:outline-none text-sm shadow-sm"
            style={{
              paddingLeft: '40px',
              color: 'black',
              backgroundColor: 'white',
            }}
          />
        </div>
      </div>

      {/* Ticket Cards */}
      {bookings.length === 0 ? (
        <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-12 text-center border border-gray-200">
          <InboxOutlined className="text-6xl text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy vé nào</h3>
          <p className="text-gray-500">Thử thay đổi bộ lọc hoặc tìm kiếm khác</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {bookings.map((b) => {
            let statusColor = "bg-gray-200 text-gray-500 border-gray-300";
            let statusText = b.status;
            
            // Xử lý trạng thái với normalize
            const normalizedStatus = normalize(b.status || '');
            
            if (['cancelled', 'da huy', 'that bai', 'failed', 'huy', 'cancel'].includes(normalizedStatus)) {
              statusColor = "bg-red-200 text-red-800 border-red-300 shadow-sm";
              statusText = "Đã hủy";
            } else if (['paid', 'payed', 'da thanh toan', 'success', 'thanh cong', 'thanh toan', 'hoan thanh'].includes(normalizedStatus)) {
              statusColor = "bg-green-200 text-green-800 border-green-300 shadow-sm";
              statusText = "Đã thanh toán";
            } else if (['pending', 'unpaid', 'chua thanh toan', 'cho thanh toan'].includes(normalizedStatus)) {
              statusColor = "bg-orange-200 text-orange-800 border-orange-300 shadow-sm";
              statusText = "Đang thanh toán";
            }

            return (
              <div
                key={b.bookingId}
                className="bg-gradient-to-br from-white via-blue-50 to-indigo-100 rounded-xl border-2 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] relative overflow-hidden"
              >
                {/* Header */}
                <div className="p-3 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-100 to-indigo-100">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-blue-700">#{b.bookingId}</span>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}>
                    {statusText || "Không có"}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 bg-gradient-to-br from-white to-blue-50">
                  {/* Movie Info */}
                  <div className="flex items-center gap-3 mb-3">
                    {b.poster ? (
                      <img src={b.poster} alt="poster" className="w-12 h-12 rounded-lg object-cover border-2 border-gray-200 shadow-md" />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
                        <span className="text-lg font-bold text-white">{b.movieTitle?.[0] || '?'}</span>
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900 line-clamp-1">{b.movieTitle || "Không có tên phim"}</h3>
                      <p className="text-sm text-gray-500">{b.cinemaRoom || "Không có phòng"}</p>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Suất chiếu:</span>
                      <span className="text-gray-900 font-medium">
                        {b.showDate && b.showTime ? `${b.showDate} ${b.showTime}` : "Không có"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Ngày đặt:</span>
                      <span className="text-gray-900 font-medium">
                        {b.bookingDate ? new Date(b.bookingDate).toLocaleDateString("vi-VN") : "Không có"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Số ghế:</span>
                      <span className="text-gray-900 font-medium">
                        {Array.isArray(b.seats) ? b.seats.length : 0} ghế
                      </span>
                    </div>
                  </div>

                  {/* Seats */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {Array.isArray(b.seats) && b.seats.length > 0 ? (
                        b.seats.map((s, i) => (
                          <span 
                            key={i} 
                            className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                              s.seatType === "VIP" 
                                ? "bg-yellow-100 text-yellow-700 border border-yellow-200" 
                                : "bg-blue-100 text-blue-700 border border-blue-200"
                            }`}
                          >
                            {s.seatName}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-400 text-xs">Không có ghế</span>
                      )}
                    </div>
                  </div>

                  {/* Payment Info */}
                  <div className="bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg p-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-gray-500 text-xs block">Tổng tiền:</span>
                        <span className="font-bold text-sm text-blue-700">
                          {b.totalPrice !== undefined && b.totalPrice !== null 
                            ? Number(b.totalPrice).toLocaleString("vi-VN") + "₫" 
                            : "Không có"
                          }
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 text-xs block">Điểm:</span>
                        <span className="font-bold text-sm text-blue-700">
                          {b.convertedScore !== undefined && b.convertedScore !== null 
                            ? b.convertedScore 
                            : "0"
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Custom Pagination */}
      <div className="flex flex-wrap justify-end items-center gap-2 mt-4">
        <button
          className={`w-9 h-9 rounded-xl font-bold shadow transition flex items-center justify-center
            ${pagination.current === 1
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-white text-blue-700 hover:bg-blue-100'}
          `}
          disabled={pagination.current === 1}
          onClick={() => {
            if (pagination.current > 1) {
              filterAndPaginate(pagination.current - 1, pagination.pageSize);
            }
          }}
        >
          &lt;
        </button>
        {Array.from({ length: Math.ceil(pagination.total / pagination.pageSize) }, (_, i) => i + 1).map(page => (
          <button
            key={page}
            className={`w-9 h-9 rounded-xl font-bold shadow transition flex items-center justify-center
              ${pagination.current === page
                ? 'bg-gradient-to-br from-blue-500 to-indigo-700 text-white scale-105'
                : 'bg-white text-blue-700 hover:bg-blue-100'}
            `}
            onClick={() => {
              filterAndPaginate(page, pagination.pageSize);
            }}
          >
            {page}
          </button>
        ))}
        <button
          className={`w-9 h-9 rounded-xl font-bold shadow transition flex items-center justify-center
            ${pagination.current === Math.ceil(pagination.total / pagination.pageSize) || pagination.total === 0
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-white text-blue-700 hover:bg-blue-100'}
          `}
          disabled={pagination.current === Math.ceil(pagination.total / pagination.pageSize) || pagination.total === 0}
          onClick={() => {
            if (pagination.current < Math.ceil(pagination.total / pagination.pageSize)) {
              filterAndPaginate(pagination.current + 1, pagination.pageSize);
            }
          }}
        >
          &gt;
        </button>
        <select
          className="ml-4 rounded-lg border px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition bg-white text-blue-700 border-blue-200"
          value={pagination.pageSize}
          onChange={e => {
            const newSize = Number(e.target.value);
            filterAndPaginate(1, newSize);
          }}
        >
          {[8, 16, 32].map(size => (
            <option key={size} value={size}>{size} / page</option>
          ))}
        </select>
      </div>

      {/* QR Modal */}
      <Modal
        open={qrModalVisible}
        onCancel={() => setQrModalVisible(false)}
        footer={null}
        title={
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
              <QrcodeOutlined className="text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Quét mã QR để tìm vé</span>
          </div>
        }
        width={600}
        centered
        className="!rounded-xl"
      >
        <ScanQrCode
          onScan={(data) => {
            try {
              const obj = JSON.parse(data);
              if (obj.bookingId) {
                setSearch(obj.bookingId.toString());
              } else {
                setSearch(data);
              }
            } catch {
              setSearch(data);
            }
          }}
          onClose={() => setQrModalVisible(false)}
        />
      </Modal>
    </>
  );
};

export default TicketManagement;