import React, { useEffect, useState } from "react";
import { Table, Tag, Image, Spin, Input, Select, Button, Modal, Tooltip, Space } from "antd";
import { GiftOutlined, EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined, CheckCircleOutlined, CloseCircleOutlined, InboxOutlined } from "@ant-design/icons";
import { getAllPromotions, togglePromotionStatus } from "../../../../service/voucher";
import AddPromotionManagement from "./AddPromotion";
import EditPromotion from "./EditPromotion";
import DeletePromotion from "./DeletePromotion";
import { toast } from "react-toastify";
import MultiSwitch from "../../Movie/Switch";

const { Search } = Input;

const PromotionManagement = ({ addModalVisible, setAddModalVisible }) => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [discountTypeFilter, setDiscountTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [exclusiveFilter, setExclusiveFilter] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 8,
    total: 0,
  });
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState(null);
  const [deletePromotionId, setDeletePromotionId] = useState(null);
  const [switchLoading, setSwitchLoading] = useState(false);

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    setLoading(true);
    const res = await getAllPromotions();
    if (res.status === 200 && Array.isArray(res.result)) {
      setPromotions(res.result);
      setPagination((prev) => ({
        ...prev,
        total: res.result.length,
      }));
    } else {
      setPromotions([]);
      setPagination((prev) => ({
        ...prev,
        total: 0,
      }));
      toast.error(res.message || "Không lấy được danh sách promotion");
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

  // Filter & search
  const filteredPromotions = promotions.filter((promotion) => {
    const matchSearch =
      promotion.title?.toLowerCase().includes(searchText.toLowerCase()) ||
      promotion.detail?.toLowerCase().includes(searchText.toLowerCase());
    const matchDiscountType =
      !discountTypeFilter ||
      (discountTypeFilter === "FIXED_AMOUNT" && promotion.promotionType === "FIXED_AMOUNT") ||
      (discountTypeFilter === "PERCENTAGE" && promotion.promotionType === "PERCENTAGE");
    const matchStatus =
      !statusFilter ||
      (statusFilter === "ACTIVE" && promotion.status === "ACTIVE") ||
      (statusFilter === "INACTIVE" && promotion.status === "INACTIVE");
    const matchExclusive = !exclusiveFilter || promotion.isExclusive;
    return matchSearch && matchDiscountType && matchStatus && matchExclusive;
  });

  const pagedPromotions = filteredPromotions.slice(
    (pagination.current - 1) * pagination.pageSize,
    pagination.current * pagination.pageSize
  );

  // Thống kê
  const totalPromotions = promotions.length;
  const activePromotions = promotions.filter((p) => p.status === "ACTIVE").length;
  const inactivePromotions = promotions.filter((p) => p.status === "INACTIVE").length;
  const exclusivePromotions = promotions.filter((p) => p.isExclusive).length;

  return (
    <>


      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
        <div 
          className={`bg-gradient-to-br from-pink-50 to-rose-50 rounded-lg p-3 border-2 transition-all duration-300 cursor-pointer hover:shadow-lg hover:scale-[1.02] relative ${
            statusFilter === "" && !exclusiveFilter
              ? 'border-pink-500 shadow-lg scale-[1.02] z-10' 
              : 'border-gray-200 hover:border-pink-300 hover:z-10'
          }`}
          onClick={() => {
            setStatusFilter("");
            setExclusiveFilter(false);
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Tổng promotion</p>
              <p className="text-lg font-bold text-pink-900">{totalPromotions}</p>
            </div>
            <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-rose-600 rounded-lg flex items-center justify-center shadow-md">
              <GiftOutlined className="text-white text-sm" />
            </div>
          </div>
        </div>
        <div 
          className={`bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-3 border-2 transition-all duration-300 cursor-pointer hover:shadow-lg hover:scale-[1.02] relative ${
            statusFilter === "ACTIVE" && !exclusiveFilter
              ? 'border-green-500 shadow-lg scale-[1.02] z-10' 
              : 'border-gray-200 hover:border-green-300 hover:z-10'
          }`}
          onClick={() => {
            setStatusFilter(statusFilter === "ACTIVE" ? "" : "ACTIVE");
            setExclusiveFilter(false);
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Hoạt động</p>
              <p className="text-lg font-bold text-green-700">{activePromotions}</p>
            </div>
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-md">
              <CheckCircleOutlined className="text-white text-sm" />
            </div>
          </div>
        </div>
        <div 
          className={`bg-gradient-to-br from-red-50 to-rose-50 rounded-lg p-3 border-2 transition-all duration-300 cursor-pointer hover:shadow-lg hover:scale-[1.02] relative ${
            statusFilter === "INACTIVE" && !exclusiveFilter
              ? 'border-red-500 shadow-lg scale-[1.02] z-10' 
              : 'border-gray-200 hover:border-red-300 hover:z-10'
          }`}
              onClick={() => {
            setStatusFilter(statusFilter === "INACTIVE" ? "" : "INACTIVE");
            setExclusiveFilter(false);
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Ngừng hoạt động</p>
              <p className="text-lg font-bold text-red-700">{inactivePromotions}</p>
            </div>
            <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-rose-600 rounded-lg flex items-center justify-center shadow-md">
              <CloseCircleOutlined className="text-white text-sm" />
            </div>
          </div>
        </div>
        <div 
          className={`bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg p-3 border-2 transition-all duration-300 cursor-pointer hover:shadow-lg hover:scale-[1.02] relative ${
            exclusiveFilter 
              ? 'border-purple-500 shadow-lg scale-[1.02] z-10' 
              : 'border-gray-200 hover:border-purple-300 hover:z-10'
          }`}
          onClick={() => setExclusiveFilter(!exclusiveFilter)}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Độc quyền</p>
              <p className="text-lg font-bold text-purple-700">{exclusivePromotions}</p>
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
              placeholder="Tìm kiếm tiêu đề hoặc chi tiết..."
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              className="pl-10 w-64 h-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400 focus:border-pink-400 focus:outline-none text-sm shadow-sm"
              style={{
                paddingLeft: '40px',
                color: 'black',
                backgroundColor: 'white',
              }}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 font-medium whitespace-nowrap">Loại giảm giá:</span>
            <select
              value={discountTypeFilter}
              onChange={e => setDiscountTypeFilter(e.target.value)}
              className="w-48 h-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400 focus:border-pink-400 focus:outline-none text-sm shadow-sm"
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

      {/* Promotion Cards */}
      {pagedPromotions.length === 0 ? (
        <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-12 text-center border border-gray-200">
          <InboxOutlined className="text-6xl text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy promotion nào</h3>
          <p className="text-gray-500">Thử thay đổi bộ lọc hoặc thêm promotion mới</p>
          </div>
        ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {pagedPromotions.map((promotion) => (
            <div
              key={promotion.promotionId}
              className="bg-gradient-to-br from-white via-pink-50 to-rose-100 rounded-xl border-2 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] relative overflow-hidden border-gray-200 hover:border-pink-300"
            >
              {/* Header */}
              <div className="p-3 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-pink-100 to-rose-100">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-pink-700 line-clamp-1">{promotion.title}</span>
                  {promotion.isExclusive && (
                    <Tag color="purple" className="text-xs">Độc quyền</Tag>
                  )}
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  promotion.status === "ACTIVE"
                    ? 'bg-gradient-to-r from-green-200 to-emerald-200 text-green-800 border border-green-300 shadow-sm' 
                    : 'bg-gradient-to-r from-red-200 to-rose-200 text-red-800 border border-red-300 shadow-sm'
                }`}>
                  {promotion.status === "ACTIVE" ? 'Hoạt động' : 'Ngừng'}
                </div>
              </div>

              {/* Content */}
              <div className="p-3 bg-gradient-to-br from-white to-pink-50">
                {/* Promotion Info */}
                <div className="mb-2">
                  <p className="text-xs text-gray-600 line-clamp-1">{promotion.detail || "Không có chi tiết"}</p>
                </div>

                {/* Compact Details Grid */}
                <div className="grid grid-cols-2 gap-1 mb-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Loại:</span>
                    <span className="text-gray-900 font-medium">{promotion.promotionType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Giá trị:</span>
                    <span className="text-gray-900 font-medium">{promotion.value}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Tối đa:</span>
                    <span className="text-gray-900 font-medium">{promotion.maxDiscountAmount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Nhóm:</span>
                    <span className="text-gray-900 font-medium">{promotion.groupCode || "-"}</span>
                  </div>
                </div>

                {/* Compact Time & Usage Info */}
                <div className="grid grid-cols-2 gap-1 mb-2 text-xs">
                  <div>
                    <span className="text-gray-500">Bắt đầu: </span>
                    <span className="text-gray-700">{promotion.startTime ? new Date(promotion.startTime).toLocaleDateString() : "-"}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Kết thúc: </span>
                    <span className="text-gray-700">{promotion.endTime ? new Date(promotion.endTime).toLocaleDateString() : "-"}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Hệ thống: </span>
                    <span className="text-gray-700">{promotion.maxTotalUsage || "∞"}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Khách hàng: </span>
                    <span className="text-gray-700">{promotion.maxUsagePerCustomer || "∞"}</span>
                  </div>
                </div>

                {/* Image - Smaller */}
                {promotion.image && (
                  <div className="mb-2 flex justify-center">
                    <img src={promotion.image} alt="promotion" className="w-12 h-12 object-cover rounded-lg border" />
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-1 mb-2">
                  <Tooltip title="Chỉnh sửa">
                    <Button
                      size="small"
                      icon={<EditOutlined className="text-green-600" />}
                      onClick={() => {
                        setSelectedPromotion(promotion);
                        setEditModalVisible(true);
                      }}
                      className="flex-1 border-green-300 text-green-700 hover:border-green-400 hover:text-green-800 shadow-sm bg-gradient-to-r from-green-100 to-emerald-100"
                    />
                  </Tooltip>
                  <Tooltip title="Xóa">
                    <Button
                      size="small"
                      icon={<DeleteOutlined className="text-red-600" />}
                      onClick={() => {
                        setDeletePromotionId(promotion.promotionId);
                        setDeleteModalVisible(true);
                      }}
                      className="flex-1 border-red-300 text-red-700 hover:border-red-400 hover:text-red-800 shadow-sm bg-gradient-to-r from-red-100 to-rose-100"
                    />
                  </Tooltip>
                </div>

                {/* Status Toggle */}
                <div className="pt-2 border-t border-gray-200 bg-gradient-to-r from-pink-100 to-rose-100 rounded-lg p-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Trạng thái:</span>
                    <MultiSwitch
                      checked={promotion.status === "ACTIVE"}
                      checkedChildren="Bật"
                      unCheckedChildren="Tắt"
                      loading={switchLoading}
                      onChange={async (checked) => {
                        setSwitchLoading(true);
                        try {
                          const res = await togglePromotionStatus(promotion.promotionId);
                          if (res?.success) {
                            setPromotions(prevPromotions => 
                              prevPromotions.map(p => 
                                p.promotionId === promotion.promotionId 
                                  ? { ...p, status: checked ? "ACTIVE" : "INACTIVE" }
                                  : p
                              )
                            );
                            toast.success(res.message || "Cập nhật trạng thái thành công!");
                          } else {
                            toast.error(res?.message || "Mất kết nối server");
                          }
                        } catch (error) {
                          toast.error(error?.message || "Có lỗi khi cập nhật trạng thái!");
                        } finally {
                          setSwitchLoading(false);
                        }
                      }}
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
              : 'bg-white text-pink-700 hover:bg-pink-100'}
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
        {Array.from({ length: Math.ceil(filteredPromotions.length / pagination.pageSize) }, (_, i) => i + 1).map(page => (
          <button
            key={page}
            className={`w-9 h-9 rounded-xl font-bold shadow transition flex items-center justify-center
              ${pagination.current === page
                ? 'bg-gradient-to-br from-pink-500 to-rose-700 text-white scale-105'
                : 'bg-white text-pink-700 hover:bg-pink-100'}
            `}
            onClick={() => setPagination(prev => ({ ...prev, current: page }))}
          >
            {page}
          </button>
        ))}
        <button
          className={`w-9 h-9 rounded-xl font-bold shadow transition flex items-center justify-center
            ${pagination.current === Math.ceil(filteredPromotions.length / pagination.pageSize) || filteredPromotions.length === 0
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-white text-pink-700 hover:bg-pink-100'}
          `}
          disabled={pagination.current === Math.ceil(filteredPromotions.length / pagination.pageSize) || filteredPromotions.length === 0}
                  onClick={() => {
            if (pagination.current < Math.ceil(filteredPromotions.length / pagination.pageSize)) {
              setPagination(prev => ({ ...prev, current: prev.current + 1 }));
            }
          }}
        >
          &gt;
        </button>
        <select
          className="ml-4 rounded-lg border px-2 py-1 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition bg-white text-pink-700 border-pink-200"
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
        open={addModalVisible}
        footer={null}
        onCancel={() => setAddModalVisible(false)}
        destroyOnHidden
        width={600}
        className="!rounded-2xl"
      >
        <AddPromotionManagement
          onSuccess={() => {
            setAddModalVisible(false);
            fetchPromotions();
          }}
          onCancel={() => setAddModalVisible(false)}
        />
      </Modal>
      
      <Modal
        open={editModalVisible}
        footer={null}
        onCancel={() => setEditModalVisible(false)}
        destroyOnHidden
        width={600}
        className="!rounded-2xl"
      >
        {selectedPromotion && (
          <EditPromotion
            promotion={selectedPromotion}
            onSuccess={() => {
              setEditModalVisible(false);
              fetchPromotions();
            }}
            onCancel={() => setEditModalVisible(false)}
          />
        )}
      </Modal>
      
      <DeletePromotion
        promotionId={deletePromotionId}
        open={deleteModalVisible}
        onClose={() => setDeleteModalVisible(false)}
        onSuccess={() => {
          setDeleteModalVisible(false);
          fetchPromotions();
        }}
      />
    </>
  );
};

export default PromotionManagement;