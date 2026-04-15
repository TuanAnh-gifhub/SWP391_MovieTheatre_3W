import { useState, useEffect } from "react";
import { getScoreHistories, getAllPromotionsForCustomer } from "../../../../service/voucher/index";
import { FiSearch, FiFilter } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Lấy customerID từ token hoặc localStorage (giả sử lưu ở user.customerID)
 */
function getCustomerID() {
  return localStorage.getItem("id");
}

const MyVoucher = (props) => {
  const [scoreHistories, setScoreHistories] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(props.defaultTab || "score"); // "score" hoặc "voucher"
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState(""); // "plus", "minus", ""
  const [dateFilter, setDateFilter] = useState(""); // yyyy-mm-dd
  const PAGE_SIZE_OPTIONS = [10, 25, 50];
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [showModal, setShowModal] = useState(false);
  useEffect(() => { setPage(1); }, [search, typeFilter, dateFilter, pageSize]);

  useEffect(() => {
    const customerID = getCustomerID();
    if (!customerID) {
      setLoading(false);
      return;
    }
    const fetchData = async () => {
      setLoading(true);
      try {
        const scoreRes = await getScoreHistories(customerID);
        setScoreHistories(Array.isArray(scoreRes.result) ? scoreRes.result : []);
        if (activeTab === "voucher") {
          const promoRes = await getAllPromotionsForCustomer();
          setVouchers(Array.isArray(promoRes.result) ? promoRes.result : []);
        }
      } catch (error) {
        setScoreHistories([]);
        setVouchers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [activeTab]);

  // Filtered histories
  const filteredScores = scoreHistories.filter(item => {
    const q = search.toLowerCase();
    const matchSearch = !q || (item.movieName && item.movieName.toLowerCase().includes(q));
    const matchType = !typeFilter || item.actionType === typeFilter;
    const matchDate = !dateFilter || (item.dateCreate && new Date(item.dateCreate).toISOString().slice(0,10) === dateFilter);
    return matchSearch && matchType && matchDate;
  });

  const total = filteredScores.length;
  const totalPages = Math.ceil(total / pageSize);
  const pagedScores = filteredScores.slice((page - 1) * pageSize, page * pageSize);

  // Khi đổi pageSize, nếu page hiện tại > tổng số trang mới, set page về tổng số trang mới
  useEffect(() => {
    const totalPages = Math.ceil(filteredScores.length / pageSize);
    if (page > totalPages) setPage(totalPages || 1);
  }, [pageSize, filteredScores.length]);

  if (loading) {
    return <div className="text-center py-4">Đang tải dữ liệu...</div>;
  }

  return (
    <>
      {/* Modal chi tiết voucher - render ngoài cùng để không bị giới hạn max-w */}
      {showModal && selectedVoucher && (
        <div className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-auto px-2">
          <div className="bg-white rounded-2xl py-5 px-6 max-w-full w-[450px] shadow-2xl relative border-2 border-orange-300 flex flex-col items-center gap-3">
            <button
              className="absolute top-3 right-4 text-gray-500 hover:text-orange-500 text-3xl font-bold"
              onClick={() => setShowModal(false)}
            >
              &times;
            </button>
            <img src={selectedVoucher.image} alt={selectedVoucher.title} className="w-40 h-28 object-contain rounded-xl border bg-white mb-2" />
            <h2 className="text-2xl font-bold text-orange-600 mb-1 text-center line-clamp-2">{selectedVoucher.title}</h2>
            <div className="flex items-center gap-2 mb-2 justify-center">
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold tracking-wide shadow-sm ${selectedVoucher.promotionType === 'PERCENTAGE' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>{selectedVoucher.promotionType === 'PERCENTAGE' ? 'Giảm %' : 'Giảm giá'}</span>
              <span className="text-lg font-extrabold text-orange-500">{selectedVoucher.value}{selectedVoucher.promotionType === "PERCENTAGE" ? "%" : "đ"}</span>
              {selectedVoucher.maxDiscountAmount && (
                <span className="text-xs text-gray-500">(Tối đa {selectedVoucher.maxDiscountAmount.toLocaleString()}đ)</span>
              )}
            </div>
            <div className="text-base text-gray-700 mb-2 text-center line-clamp-3">{selectedVoucher.detail}</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1 text-sm w-full">
              <div><span className="font-semibold">Thời gian:</span> {selectedVoucher.startTime ? new Date(selectedVoucher.startTime).toLocaleString("vi-VN") : ""} - {selectedVoucher.endTime ? new Date(selectedVoucher.endTime).toLocaleString("vi-VN") : ""}</div>
              {selectedVoucher.condition?.minOrderAmount && (
                <div><span className="font-semibold">Đơn tối thiểu:</span> {selectedVoucher.condition.minOrderAmount.toLocaleString()}đ</div>
              )}
              {selectedVoucher.groupCode && (
                <div><span className="font-semibold">Group code:</span> {selectedVoucher.groupCode}</div>
              )}
              {selectedVoucher.isExclusive !== undefined && (
                <div><span className="font-semibold">Độc quyền:</span> {selectedVoucher.isExclusive ? "Có" : "Không"}</div>
              )}
              {selectedVoucher.maxTotalUsage && (
                <div><span className="font-semibold">Tổng số lượt sử dụng tối đa:</span> {selectedVoucher.maxTotalUsage}</div>
              )}
              {selectedVoucher.maxUsagePerCustomer && (
                <div><span className="font-semibold">Số lượt sử dụng tối đa mỗi khách:</span> {selectedVoucher.maxUsagePerCustomer}</div>
              )}
              {selectedVoucher.condition?.applicableRoles && selectedVoucher.condition.applicableRoles.length > 0 && (
                <div><span className="font-semibold">Áp dụng cho vai trò:</span> {selectedVoucher.condition.applicableRoles.join(", ")}</div>
              )}
              {selectedVoucher.condition?.applicableRanks && selectedVoucher.condition.applicableRanks.length > 0 && (
                <div><span className="font-semibold">Áp dụng cho hạng:</span> {selectedVoucher.condition.applicableRanks.join(", ")}</div>
              )}
              {selectedVoucher.condition?.dayOfWeek && selectedVoucher.condition.dayOfWeek.length > 0 && (
                <div><span className="font-semibold">Áp dụng các ngày:</span> {selectedVoucher.condition.dayOfWeek.join(", ")}</div>
              )}
            </div>
            <div className="mt-6 flex justify-end">
              <button
                className="px-5 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-semibold shadow"
                onClick={() => setShowModal(false)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="max-w-2xl mx-auto mt-8 space-y-10">
        {/* Tabs */}
        <div className="flex justify-center mb-8 gap-4">
          <button
            className={`px-6 py-2 rounded-lg font-semibold border transition focus:outline-none ${
              activeTab === "voucher"
                ? "bg-orange-500 text-white border-orange-500 shadow"
                : "bg-white text-orange-500 border-orange-300 hover:bg-orange-50"
            }`}
            onClick={() => setActiveTab("voucher")}
          >
            Voucher của tôi
          </button>
          <button
            className={`px-6 py-2 rounded-lg font-semibold border transition focus:outline-none ${
              activeTab === "score"
                ? "bg-blue-600 text-white border-blue-600 shadow"
                : "bg-white text-blue-600 border-blue-300 hover:bg-blue-50"
            }`}
            onClick={() => setActiveTab("score")}
          >
            Lịch sử điểm
          </button>
        </div>

        {/* Nội dung bảng tương ứng */}
        <div key={activeTab} className="transition-all duration-500 ease-out animate-fade-in-slide">
          {activeTab === "score" && (
            <div>
              <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
                Lịch sử nhận điểm khi mua vé
              </h2>
              {/* Filter bar nhỏ gọn */}
              <div className="flex flex-col sm:flex-row sm:items-end sm:gap-4 gap-2 mb-4">
                {/* Search phim */}
                <div className="flex flex-col flex-1 min-w-[120px]">
                  <label className="text-gray-700 font-medium mb-1 flex items-center gap-1 text-sm" htmlFor="score-search">
                    <FiSearch className="inline" size={14} /> Tìm phim
                  </label>
                  <input
                    id="score-search"
                    type="text"
                    className="border px-2 py-1 text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition placeholder:text-gray-400 rounded-xl"
                    placeholder="Tên phim..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>
                {/* Filter loại */}
                <div className="flex flex-col min-w-[100px]">
                  <label className="text-gray-700 font-medium mb-1 flex items-center gap-1 text-sm" htmlFor="score-type">
                    <FiFilter className="inline" size={14} /> Loại
                  </label>
                  <select
                    id="score-type"
                    className="border px-2 py-1 text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition rounded-xl"
                    value={typeFilter}
                    onChange={e => setTypeFilter(e.target.value)}
                  >
                    <option value="">Tất cả</option>
                    <option value="plus">Cộng</option>
                    <option value="minus">Trừ</option>
                  </select>
                </div>
                {/* Filter ngày */}
                <div className="flex flex-col min-w-[120px]">
                  <label className="text-gray-700 font-medium mb-1 flex items-center gap-1 text-sm" htmlFor="score-date">
                    <svg xmlns='http://www.w3.org/2000/svg' className='inline w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' /></svg> Ngày
                  </label>
                  <input
                    id="score-date"
                    type="date"
                    className="border px-2 py-1 text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition rounded-xl"
                    value={dateFilter}
                    onChange={e => setDateFilter(e.target.value)}
                    pattern="(0[1-9]|1[0-2])/[0-3][0-9]/[0-9]{4}"
                  />
                </div>
              </div>
              {pagedScores.length === 0 ? (
                <div className="text-gray-600 text-center py-8 bg-gray-50 rounded-lg shadow">
                  Bạn chưa có lịch sử nhận điểm nào.
                </div>
              ) : (
                <div className="w-full">
                  <ul className="flex flex-col gap-1">
                    {/* Header row */}
                    
                    {pagedScores.map((item) => (
                      <li
                        key={item.scoreID}
                        className="flex items-center px-2 py-2 rounded-xl hover:bg-blue-50 transition text-base group border border-gray-100"
                      >
                        {/* Icon loại điểm */}
                        <span className={`inline-flex items-center justify-center rounded-full w-7 h-7 text-base font-bold mr-2 ${item.actionType === 'plus' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>{item.actionType === 'plus' ? '+' : '-'}</span>
                        {/* Ngày */}
                        <span className="min-w-[100px] w-[100px] text-gray-500 text-sm tabular-nums">
                          {item.dateCreate ? new Date(item.dateCreate).toLocaleDateString("vi-VN") : ""}
                        </span>
                        {/* Tên phim */}
                        <span className="flex-1 font-medium text-gray-800 truncate max-w-[180px]" title={item.movieName}>
                          {item.movieName}
                        </span>
                        {/* Loại */}
                        <span className="w-[70px] flex justify-center items-center flex-shrink-0">
                          <span className={`inline-flex items-center justify-center rounded-full px-3 py-0.5 text-sm font-semibold min-w-[48px] ${item.actionType === 'plus' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>{item.actionType === 'plus' ? 'Cộng' : 'Trừ'}</span>
                        </span>
                        {/* Số điểm */}
                        <span className={`w-[90px] text-right font-bold tabular-nums flex-shrink-0 ${item.actionType === 'plus' ? 'text-green-600' : 'text-red-600'}`}>
                          <span className="text-lg align-middle">{item.actionType === 'plus' ? '+' : '-'}</span>
                          <span className="align-middle">{item.amount}</span>
                          <span className="text-xs font-normal text-gray-400 ml-0.5 align-middle">đ</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                  {/* Pagination + PageSize select nhỏ gọn, nằm trong container, không fixed */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-6 gap-2 bg-white rounded-xl border border-blue-100 shadow-sm px-2 py-2">
                    <div className="flex justify-center sm:justify-start gap-1">
                      <button
                        className="px-2 py-1 rounded-md border bg-white hover:bg-blue-50 disabled:opacity-50 flex items-center justify-center text-sm"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        aria-label="Trang trước"
                      >
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
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
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
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
              )}
            </div>
          )}

          {activeTab === "voucher" && (
            <div>
              <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
                Danh sách voucher của bạn
              </h2>
              {vouchers.length === 0 ? (
                <div className="text-gray-600 text-center py-8 bg-gray-50 rounded-lg shadow">
                  Bạn chưa có voucher nào.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <AnimatePresence>
                    {vouchers.map((voucher, idx) => (
                      <motion.div
                        key={voucher.promotionId}
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 40 }}
                        transition={{ duration: 0.5, delay: idx * 0.08 }}
                        className="relative flex flex-col bg-orange-50 hover:bg-white rounded-2xl shadow-lg border-2 border-transparent hover:border-orange-400 transition-all duration-300 p-2 overflow-hidden group min-h-[100px] cursor-pointer"
                        onClick={() => {
                          setSelectedVoucher(voucher);
                          setShowModal(true);
                        }}
                      >
                        {/* Ảnh voucher */}
                        {voucher.image && (
                          <img
                            src={voucher.image}
                            alt={voucher.title}
                            className="w-full h-24 object-contain rounded-lg mb-1 border bg-white"
                          />
                        )}
                        {/* Badge loại voucher */}
                        <span className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-bold tracking-wide shadow-sm
                          ${voucher.promotionType === 'PERCENTAGE' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}
                        >
                          {voucher.promotionType === 'PERCENTAGE' ? 'Giảm %' : 'Giảm giá'}
                        </span>
                        {/* Giá trị giảm giá nổi bật */}
                        <div className="flex items-center gap-2 mb-1">
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            className="text-2xl font-extrabold text-orange-500 drop-shadow-lg group-hover:scale-105 transition-transform duration-200"
                          >
                            {voucher.value}{voucher.promotionType === "PERCENTAGE" ? "%" : "đ"}
                          </motion.div>
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-gray-800 line-clamp-1">{voucher.title}</span>
                            <span className="text-xs text-gray-400">Từ: {voucher.startTime ? new Date(voucher.startTime).toLocaleDateString("vi-VN") : ""} - Đến: {voucher.endTime ? new Date(voucher.endTime).toLocaleDateString("vi-VN") : ""}</span>
                          </div>
                        </div>
                        {/* Chi tiết */}
                        <div className="text-xs text-gray-600 mb-1 line-clamp-2">{voucher.detail}</div>
                        {/* Thông tin bổ sung */}
                        {voucher.condition?.minOrderAmount && (
                          <div className="text-xs text-gray-500 italic mb-1">Áp dụng cho đơn từ {voucher.condition.minOrderAmount.toLocaleString()}đ</div>
                        )}
                        {/* Trạng thái */}
                        <div className="mt-auto flex items-center gap-1">
                          <span className={`inline-block w-2 h-2 rounded-full ${voucher.status === 'ACTIVE' ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                          <span className={`text-xs font-semibold ${voucher.status === 'ACTIVE' ? 'text-green-600' : 'text-gray-500'}`}>{voucher.status === 'ACTIVE' ? 'Đang khả dụng' : 'Không khả dụng'}</span>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MyVoucher;