import React, { useEffect, useState } from "react";
import { getAllCoupons, toggleCouponStatus, chooseCouponGame, deleteCoupon } from "../../../../service/voucher";
import { Table, Button, Space, Tooltip, Tag, Input, Select, Modal, Radio } from "antd";
import { PlusOutlined, GiftOutlined, SearchOutlined, FilterOutlined, CheckCircleOutlined, CloseCircleOutlined, InboxOutlined, DeleteOutlined } from "@ant-design/icons";
import AddCoupon from "./AddCoupon";
import MultiSwitch from "../../Movie/Switch";
import { toast } from "react-toastify";

const { Search } = Input;

const Coupon = ({ addModalVisible, setAddModalVisible }) => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [discountTypeFilter, setDiscountTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [gameFilter, setGameFilter] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [switchLoadingId, setSwitchLoadingId] = useState(null);
  const [gameCouponId, setGameCouponId] = useState(null);
  const [selectingGameId, setSelectingGameId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Pagination state
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 8,
    total: 0,
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    setLoading(true);
    const res = await getAllCoupons();
    if (res.status === 200) {
      setCoupons(res.result);
      setPagination((prev) => ({
        ...prev,
        total: res.result.length,
      }));
    } else {
      setCoupons([]);
      setPagination((prev) => ({
        ...prev,
        total: 0,
      }));
      toast.error(res.message || "Không lấy được danh sách khuyến mãi");
    }
    setLoading(false);
  };

  const handleTableChange = (newPagination) => {
    setPagination({
      ...pagination,
      current: newPagination.current,
      pageSize: newPagination.pageSize,
    });
  };

  const handleToggleStatus = async (coupon) => {
    setSwitchLoadingId(coupon.id);
    try {
      const res = await toggleCouponStatus(coupon.id);
      if (res.status === 200) {
        toast.success(res.message || "Đã thay đổi trạng thái!");
        fetchCoupons();
      } else {
        toast.error(res.message || "Không thể thay đổi trạng thái!");
      }
    } finally {
      setSwitchLoadingId(null);
    }
  };

  // Xử lý xóa coupon
  const handleDeleteCoupon = async () => {
    if (!selectedCoupon) return;
    setDeleting(true);
    const res = await deleteCoupon(selectedCoupon.id);
    setDeleting(false);
    setDeleteModalVisible(false);
    setSelectedCoupon(null);
    if (res.status === 200) {
      toast.success(res.message || "Xóa thành công!");
      fetchCoupons();
    } else {
      toast.error(res.message || "Xóa thất bại!");
    }
  };

  // Filter
  const filteredCoupons = coupons.filter((coupon) => {
    const matchSearch =
      coupon.name?.toLowerCase().includes(searchText.toLowerCase()) ||
      coupon.code?.toLowerCase().includes(searchText.toLowerCase());
    const matchDiscountType =
      !discountTypeFilter ||
      (discountTypeFilter === "FIXED_AMOUNT" && coupon.discountType === "FIXED_AMOUNT") ||
      (discountTypeFilter === "PERCENTAGE" && coupon.discountType === "PERCENTAGE");
    const matchStatus =
      !statusFilter ||
      (statusFilter === "ACTIVE" && coupon.isActive) ||
      (statusFilter === "INACTIVE" && !coupon.isActive);
    const matchGame = !gameFilter || coupon.isGame;
    return matchSearch && matchDiscountType && matchStatus && matchGame;
  });

  // Pagination data
  const pagedCoupons = filteredCoupons.slice(
    (pagination.current - 1) * pagination.pageSize,
    pagination.current * pagination.pageSize
  );

  // Thống kê
  const totalCoupons = coupons.length;
  const activeCoupons = coupons.filter((c) => c.isActive).length;
  const inactiveCoupons = coupons.filter((c) => !c.isActive).length;
  const gameCoupons = coupons.filter((c) => c.isGame).length;

  return (
    <>


      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
        <div 
          className={`bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-3 border-2 transition-all duration-300 cursor-pointer hover:shadow-lg hover:scale-[1.02] relative ${
            statusFilter === "" && !gameFilter
              ? 'border-blue-500 shadow-lg scale-[1.02] z-10' 
              : 'border-gray-200 hover:border-blue-300 hover:z-10'
          }`}
          onClick={() => {
            setStatusFilter("");
            setGameFilter(false);
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Tổng khuyến mãi</p>
              <p className="text-lg font-bold text-blue-900">{totalCoupons}</p>
            </div>
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
              <GiftOutlined className="text-white text-sm" />
            </div>
          </div>
        </div>
        <div 
          className={`bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-3 border-2 transition-all duration-300 cursor-pointer hover:shadow-lg hover:scale-[1.02] relative ${
            statusFilter === "ACTIVE" && !gameFilter
              ? 'border-green-500 shadow-lg scale-[1.02] z-10' 
              : 'border-gray-200 hover:border-green-300 hover:z-10'
          }`}
          onClick={() => {
            setStatusFilter(statusFilter === "ACTIVE" ? "" : "ACTIVE");
            setGameFilter(false);
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Hoạt động</p>
              <p className="text-lg font-bold text-green-700">{activeCoupons}</p>
            </div>
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-md">
              <CheckCircleOutlined className="text-white text-sm" />
            </div>
          </div>
        </div>
        <div 
          className={`bg-gradient-to-br from-red-50 to-rose-50 rounded-lg p-3 border-2 transition-all duration-300 cursor-pointer hover:shadow-lg hover:scale-[1.02] relative ${
            statusFilter === "INACTIVE" && !gameFilter
              ? 'border-red-500 shadow-lg scale-[1.02] z-10' 
              : 'border-gray-200 hover:border-red-300 hover:z-10'
          }`}
          onClick={() => {
            setStatusFilter(statusFilter === "INACTIVE" ? "" : "INACTIVE");
            setGameFilter(false);
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Ngừng hoạt động</p>
              <p className="text-lg font-bold text-red-700">{inactiveCoupons}</p>
            </div>
            <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-rose-600 rounded-lg flex items-center justify-center shadow-md">
              <CloseCircleOutlined className="text-white text-sm" />
            </div>
          </div>
        </div>
        <div 
          className={`bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg p-3 border-2 transition-all duration-300 cursor-pointer hover:shadow-lg hover:scale-[1.02] relative ${
            gameFilter 
              ? 'border-purple-500 shadow-lg scale-[1.02] z-10' 
              : 'border-gray-200 hover:border-purple-300 hover:z-10'
          }`}
          onClick={() => setGameFilter(!gameFilter)}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Coupon Game</p>
              <p className="text-lg font-bold text-purple-700">{gameCoupons}</p>
            </div>
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg flex items-center justify-center shadow-md">
              <GiftOutlined className="text-white text-sm" />
            </div>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="flex items-center justify-between gap-4 mb-4 p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg border border-gray-200">
        <div className="flex items-center gap-3 ml-auto">
          <div className="relative">
            <SearchOutlined className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />
            <input
              placeholder="Tìm kiếm tên hoặc mã khuyến mãi..."
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              className="pl-10 w-64 h-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:outline-none text-sm shadow-sm"
              style={{
                paddingLeft: '40px',
                color: 'black',
                backgroundColor: 'white',
              }}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 font-medium whitespace-nowrap">Loại giảm:</span>
            <select
              value={discountTypeFilter}
              onChange={e => setDiscountTypeFilter(e.target.value)}
              className="w-48 h-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:outline-none text-sm shadow-sm"
              style={{
                color: 'black',
                backgroundColor: 'white',
              }}
            >
              <option value="">Tất cả loại</option>
              <option value="FIXED_AMOUNT">Giảm giá cố định</option>
              <option value="PERCENTAGE">Giảm giá phần trăm</option>
            </select>
          </div>
        </div>
      </div>

      {/* Coupon Cards */}
      {pagedCoupons.length === 0 ? (
        <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-12 text-center border border-gray-200">
          <InboxOutlined className="text-6xl text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy khuyến mãi nào</h3>
          <p className="text-gray-500">Thử thay đổi bộ lọc hoặc thêm khuyến mãi mới</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {pagedCoupons.map((coupon) => (
            <div
              key={coupon.id}
              className="bg-gradient-to-br from-white via-blue-50 to-indigo-100 rounded-xl border-2 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] relative overflow-hidden border-gray-200 hover:border-blue-300"
            >
              {/* Header */}
              <div className="p-3 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-100 to-indigo-100">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-blue-700">{coupon.code}</span>
                  {coupon.isGame && (
                    <Tag color="green" className="text-xs">Game</Tag>
                  )}
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  coupon.isActive 
                    ? 'bg-gradient-to-r from-green-200 to-emerald-200 text-green-800 border border-green-300 shadow-sm' 
                    : 'bg-gradient-to-r from-red-200 to-rose-200 text-red-800 border border-red-300 shadow-sm'
                }`}>
                  {coupon.isActive ? 'Hoạt động' : 'Ngừng'}
                </div>
              </div>

              {/* Content */}
              <div className="p-3 bg-gradient-to-br from-white to-blue-50">
                {/* Coupon Info */}
                <div className="mb-2">
                  <h3 className="font-semibold text-gray-900 line-clamp-1 mb-1 text-sm">{coupon.name}</h3>
                  <p className="text-xs text-gray-500 line-clamp-1">{coupon.description || "Không có mô tả"}</p>
                </div>

                {/* Compact Details Grid */}
                <div className="grid grid-cols-2 gap-1 mb-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Loại:</span>
                    <span className="text-gray-900 font-medium">{coupon.discountType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Giá trị:</span>
                    <span className="text-gray-900 font-medium">{coupon.discountValue}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Giới hạn:</span>
                    <span className="text-gray-900 font-medium">{coupon.usageLimit || "∞"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Đã dùng:</span>
                    <span className="text-gray-900 font-medium">{coupon.usedCount || 0}</span>
                  </div>
                </div>

                {/* Compact Expiration */}
                <div className="mb-2 text-xs">
                  <span className="text-gray-500">Hết hạn: </span>
                  <span className="text-gray-700 font-medium">
                    {coupon.expirationDate ? new Date(coupon.expirationDate).toLocaleDateString() : "Không có"}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-1 mb-2">
                  <Tooltip title="Chọn làm game">
                    <Button
                      size="small"
                      icon={<GiftOutlined className="text-purple-600" />}
                      onClick={async () => {
                        setSelectingGameId(coupon.id);
                        const res = await chooseCouponGame(coupon.id);
                        if (res.status === 200) {
                          toast.success(res.message || "Đã chọn/bỏ chọn coupon game!");
                          fetchCoupons();
                        } else {
                          toast.error(res.message || "Không thể chọn/bỏ chọn coupon game!");
                        }
                        setSelectingGameId(null);
                      }}
                      loading={selectingGameId === coupon.id}
                      className="flex-1 border-purple-300 text-purple-700 hover:border-purple-400 hover:text-purple-800 shadow-sm bg-gradient-to-r from-purple-100 to-violet-100"
                    />
                  </Tooltip>
                  <Tooltip title="Xóa">
                    <Button
                      size="small"
                      icon={<DeleteOutlined className="text-red-600" />}
                      onClick={() => {
                        setSelectedCoupon(coupon);
                        setDeleteModalVisible(true);
                      }}
                      className="flex-1 border-red-300 text-red-700 hover:border-red-400 hover:text-red-800 shadow-sm bg-gradient-to-r from-red-100 to-rose-100"
                    />
                  </Tooltip>
                </div>

                {/* Status Toggle */}
                <div className="pt-2 border-t border-gray-200 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg p-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Trạng thái:</span>
          <MultiSwitch
                      checked={coupon.isActive}
            checkedChildren="Bật"
            unCheckedChildren="Tắt"
                      loading={switchLoadingId === coupon.id}
                      onChange={() => handleToggleStatus(coupon)}
        />
      </div>
                </div>
              </div>
            </div>
          ))}
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
              setPagination(prev => ({ ...prev, current: prev.current - 1 }));
            }
          }}
        >
          &lt;
        </button>
        {Array.from({ length: Math.ceil(filteredCoupons.length / pagination.pageSize) }, (_, i) => i + 1).map(page => (
          <button
            key={page}
            className={`w-9 h-9 rounded-xl font-bold shadow transition flex items-center justify-center
              ${pagination.current === page
                ? 'bg-gradient-to-br from-blue-500 to-indigo-700 text-white scale-105'
                : 'bg-white text-blue-700 hover:bg-blue-100'}
            `}
            onClick={() => setPagination(prev => ({ ...prev, current: page }))}
          >
            {page}
          </button>
        ))}
        <button
          className={`w-9 h-9 rounded-xl font-bold shadow transition flex items-center justify-center
            ${pagination.current === Math.ceil(filteredCoupons.length / pagination.pageSize) || filteredCoupons.length === 0
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-white text-blue-700 hover:bg-blue-100'}
          `}
          disabled={pagination.current === Math.ceil(filteredCoupons.length / pagination.pageSize) || filteredCoupons.length === 0}
          onClick={() => {
            if (pagination.current < Math.ceil(filteredCoupons.length / pagination.pageSize)) {
              setPagination(prev => ({ ...prev, current: prev.current + 1 }));
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
            setPagination(prev => ({ ...prev, pageSize: newSize, current: 1 }));
          }}
        >
          {[8, 16, 32].map(size => (
            <option key={size} value={size}>{size} / page</option>
          ))}
        </select>
      </div>

      {/* Modals */}
      <Modal
        title="Xác nhận xóa"
        open={deleteModalVisible}
        onOk={handleDeleteCoupon}
        onCancel={() => {
          setDeleteModalVisible(false);
          setSelectedCoupon(null);
        }}
        okText="Xóa"
        cancelText="Hủy"
        okButtonProps={{ danger: true, loading: deleting }}
      >
        <p>
          Bạn có chắc chắn muốn xóa khuyến mãi "{selectedCoupon?.name}"?
        </p>
        <p className="text-red-500 font-medium">
          Hành động này không thể hoàn tác.
        </p>
      </Modal>
      
      <Modal
        open={addModalVisible}
        onCancel={() => setAddModalVisible(false)}
        footer={null}
        destroyOnHidden
      >
        <AddCoupon
          onSuccess={() => {
            setAddModalVisible(false);
            fetchCoupons();
          }}
          onCancel={() => setAddModalVisible(false)}
        />
      </Modal>
    </>
  );
};

export default Coupon;