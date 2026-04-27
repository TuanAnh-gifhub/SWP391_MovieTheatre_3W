import React, { useEffect, useState } from "react";
import { Table, Spin, Tag, Input, Button, Modal, Checkbox, message, Tooltip } from "antd";
import { getPromotionGroupCodes, getAllPromotions, assignPromotionsToGroup } from "../../../../service/voucher";
import AddGroupCode from "./AddGroupCode";
import { TagOutlined, EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined, InboxOutlined, EyeOutlined } from "@ant-design/icons";
import EditGroupCode from "./EditGroupCode";
import DeleteGroupCode from "./DeleteGroupCode";
import { toast } from "react-toastify";

const { Search } = Input;

const GroupCodeManagement = ({ addModalVisible, setAddModalVisible }) => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [deleteGroupId, setDeleteGroupId] = useState(null);

  // State cho modal gán promotion vào group
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [assignGroup, setAssignGroup] = useState(null);
  const [promotionList, setPromotionList] = useState([]);
  const [selectedPromotionIds, setSelectedPromotionIds] = useState([]);
  const [assignLoading, setAssignLoading] = useState(false);
  const [filterType, setFilterType] = useState(null); // null: tất cả, 'withPromotions': có promotion, 'empty': trống
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedGroupDetail, setSelectedGroupDetail] = useState(null);

  // Pagination state
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 8,
    total: 0,
  });

  useEffect(() => {
    fetchGroups();
  }, []);

  // Reset pagination khi filter thay đổi
  useEffect(() => {
    setPagination(prev => ({ ...prev, current: 1 }));
  }, [searchText, filterType]);

  const fetchGroups = async () => {
    setLoading(true);
    const res = await getPromotionGroupCodes();
    if (res.status === 200) {
      setGroups(res.result);
    } else {
      toast.error(res.message || "Không lấy được danh sách group code");
    }
    setLoading(false);
  };

  // Filter theo tên nhóm hoặc mô tả và trạng thái promotion
  const filteredGroups = groups.filter(
    (group) => {
      const matchSearch = 
        group.groupCode?.toLowerCase().includes(searchText.toLowerCase()) ||
        group.description?.toLowerCase().includes(searchText.toLowerCase());
      
      const matchFilter = 
        !filterType ||
        (filterType === 'withPromotions' && group.promotions && group.promotions.length > 0) ||
        (filterType === 'empty' && (!group.promotions || group.promotions.length === 0));
      
      return matchSearch && matchFilter;
    }
  );

  // Pagination data
  const pagedGroups = filteredGroups.slice(
    (pagination.current - 1) * pagination.pageSize,
    pagination.current * pagination.pageSize
  );

  // Mở modal chọn promotion để gán vào group
  const openAssignModal = async (group) => {
    setAssignGroup(group);
    setAssignModalVisible(true);
    setAssignLoading(true);
    const res = await getAllPromotions();
    if (res.status === 200) {
      setPromotionList(res.result || []);
      // Set selected promotion IDs từ group hiện tại
      const currentPromotionIds = group.promotions?.map(p => p.promotionId) || [];
      setSelectedPromotionIds(currentPromotionIds);
    } else {
      setPromotionList([]);
      setSelectedPromotionIds([]);
    }
    setAssignLoading(false);
  };

  // Mở modal xem chi tiết group
  const openDetailModal = (group) => {
    setSelectedGroupDetail(group);
    setDetailModalVisible(true);
  };

  // Gán promotion vào group
  const handleAssignPromotions = async () => {
    if (!assignGroup || selectedPromotionIds.length === 0) {
      toast.warning("Vui lòng chọn ít nhất một promotion!");
      return;
    }
    setAssignLoading(true);
    const res = await assignPromotionsToGroup({
      promotionIds: selectedPromotionIds,
      groupId: assignGroup.id,
    });
    setAssignLoading(false);
    if (res.status === 200) {
      toast.success(res.message || "Gán promotion vào group thành công!");
      setAssignModalVisible(false);
      fetchGroups();
    } else {
      toast.error(res.message || "Gán promotion vào group thất bại!");
    }
  };

  // Thống kê
  const totalGroups = groups.length;
  const groupsWithPromotions = groups.filter(g => g.promotions && g.promotions.length > 0).length;
  const emptyGroups = groups.filter(g => !g.promotions || g.promotions.length === 0).length;

  return (
    <>


      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <div 
          className={`bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-3 border-2 transition-all duration-300 cursor-pointer hover:shadow-lg hover:scale-[1.02] relative ${
            filterType === null
              ? 'border-green-500 shadow-lg scale-[1.02] z-10' 
              : 'border-gray-200 hover:border-green-300 hover:z-10'
          }`}
          onClick={() => setFilterType(null)}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Tổng group code</p>
              <p className="text-lg font-bold text-green-900">{totalGroups}</p>
            </div>
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-md">
              <TagOutlined className="text-white text-sm" />
            </div>
          </div>
        </div>
        <div 
          className={`bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-3 border-2 transition-all duration-300 cursor-pointer hover:shadow-lg hover:scale-[1.02] relative ${
            filterType === 'withPromotions'
              ? 'border-blue-500 shadow-lg scale-[1.02] z-10' 
              : 'border-gray-200 hover:border-blue-300 hover:z-10'
          }`}
          onClick={() => setFilterType(filterType === 'withPromotions' ? null : 'withPromotions')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Có promotion</p>
              <p className="text-lg font-bold text-blue-700">{groupsWithPromotions}</p>
            </div>
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
              <TagOutlined className="text-white text-sm" />
            </div>
          </div>
        </div>
        <div 
          className={`bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg p-3 border-2 transition-all duration-300 cursor-pointer hover:shadow-lg hover:scale-[1.02] relative ${
            filterType === 'empty'
              ? 'border-orange-500 shadow-lg scale-[1.02] z-10' 
              : 'border-gray-200 hover:border-orange-300 hover:z-10'
          }`}
          onClick={() => setFilterType(filterType === 'empty' ? null : 'empty')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Trống</p>
              <p className="text-lg font-bold text-orange-700">{emptyGroups}</p>
            </div>
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg flex items-center justify-center shadow-md">
              <TagOutlined className="text-white text-sm" />
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
              placeholder="Tìm kiếm tên nhóm hoặc mô tả..."
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              className="pl-10 w-64 h-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-green-400 focus:outline-none text-sm shadow-sm"
              style={{
                paddingLeft: '40px',
                color: 'black',
                backgroundColor: 'white',
              }}
            />
          </div>
        </div>
      </div>

      {/* Group Code Cards */}
      {pagedGroups.length === 0 ? (
        <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-12 text-center border border-gray-200">
          <InboxOutlined className="text-6xl text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy group code nào</h3>
          <p className="text-gray-500">Thử thay đổi bộ lọc hoặc thêm group code mới</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {pagedGroups.map((group) => (
            <div
              key={group.id}
              className="bg-gradient-to-br from-white via-green-50 to-emerald-100 rounded-xl border-2 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] relative overflow-hidden border-gray-200 hover:border-green-300"
            >
              {/* Header */}
              <div className="p-3 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-green-100 to-emerald-100">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-green-700 cursor-pointer hover:underline" onClick={() => openAssignModal(group)}>
                    {group.groupCode}
                  </span>
                </div>
                <div className="px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-green-200 to-emerald-200 text-green-800 border border-green-300 shadow-sm">
                  {group.promotions?.length || 0} promotion
                </div>
              </div>

              {/* Content */}
              <div className="p-4 bg-gradient-to-br from-white to-green-50">
                {/* Group Info */}
                <div className="mb-3">
                  <p className="text-sm text-gray-600 line-clamp-2">{group.description || "Không có mô tả"}</p>
                </div>

                {/* Promotion Count */}
                <div className="mb-4">
                  <div className="text-xs text-gray-500 mb-1">Số lượng promotion:</div>
                  <div className="text-sm font-medium text-green-700">
                    {group.promotions?.length || 0} promotion
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-1">
                  <Tooltip title="Xem chi tiết">
                    <Button
                      size="small"
                      icon={<EyeOutlined className="text-green-600" />}
                      onClick={() => openDetailModal(group)}
                      className="flex-1 border-green-300 text-green-700 hover:border-green-400 hover:text-green-800 shadow-sm bg-gradient-to-r from-green-100 to-emerald-100"
                    />
                  </Tooltip>
                  <Tooltip title="Chỉnh sửa">
                    <Button
                      size="small"
                      icon={<EditOutlined className="text-blue-600" />}
                      onClick={() => {
                        setSelectedGroup(group);
                        setEditModalVisible(true);
                      }}
                      className="flex-1 border-blue-300 text-blue-700 hover:border-blue-400 hover:text-blue-800 shadow-sm bg-gradient-to-r from-blue-100 to-indigo-100"
                    />
                  </Tooltip>
                  <Tooltip title="Gán promotion">
                    <Button
                      size="small"
                      icon={<PlusOutlined className="text-purple-600" />}
                      onClick={() => openAssignModal(group)}
                      className="flex-1 border-purple-300 text-purple-700 hover:border-purple-400 hover:text-purple-800 shadow-sm bg-gradient-to-r from-purple-100 to-violet-100"
                    />
                  </Tooltip>
                  <Tooltip title="Xóa">
                    <Button
                      size="small"
                      icon={<DeleteOutlined className="text-red-600" />}
                      onClick={() => {
                        setDeleteGroupId(group.id);
                        setDeleteModalVisible(true);
                      }}
                      className="flex-1 border-red-300 text-red-700 hover:border-red-400 hover:text-red-800 shadow-sm bg-gradient-to-r from-red-100 to-rose-100"
                    />
                  </Tooltip>
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
              : 'bg-white text-green-700 hover:bg-green-100'}
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
        {Array.from({ length: Math.ceil(filteredGroups.length / pagination.pageSize) }, (_, i) => i + 1).map(page => (
          <button
            key={page}
            className={`w-9 h-9 rounded-xl font-bold shadow transition flex items-center justify-center
              ${pagination.current === page
                ? 'bg-gradient-to-br from-green-500 to-emerald-700 text-white scale-105'
                : 'bg-white text-green-700 hover:bg-green-100'}
            `}
            onClick={() => setPagination(prev => ({ ...prev, current: page }))}
          >
            {page}
          </button>
        ))}
        <button
          className={`w-9 h-9 rounded-xl font-bold shadow transition flex items-center justify-center
            ${pagination.current === Math.ceil(filteredGroups.length / pagination.pageSize) || filteredGroups.length === 0
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-white text-green-700 hover:bg-green-100'}
          `}
          disabled={pagination.current === Math.ceil(filteredGroups.length / pagination.pageSize) || filteredGroups.length === 0}
          onClick={() => {
            if (pagination.current < Math.ceil(filteredGroups.length / pagination.pageSize)) {
              setPagination(prev => ({ ...prev, current: prev.current + 1 }));
            }
          }}
        >
          &gt;
        </button>
        <select
          className="ml-4 rounded-lg border px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 transition bg-white text-green-700 border-green-200"
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
        width={500}
        className="!rounded-2xl"
      >
        <AddGroupCode
          onSuccess={() => {
            setAddModalVisible(false);
            fetchGroups();
          }}
          onCancel={() => setAddModalVisible(false)}
        />
      </Modal>
      
      <Modal
        open={editModalVisible}
        footer={null}
        onCancel={() => setEditModalVisible(false)}
        destroyOnHidden
        width={500}
        className="!rounded-2xl"
      >
        {selectedGroup && (
          <EditGroupCode
            group={selectedGroup}
            onSuccess={() => {
              setEditModalVisible(false);
              fetchGroups();
            }}
            onCancel={() => setEditModalVisible(false)}
          />
        )}
      </Modal>
      
      <DeleteGroupCode
        groupId={deleteGroupId}
        open={deleteModalVisible}
        onClose={() => setDeleteModalVisible(false)}
        onSuccess={() => {
          setDeleteModalVisible(false);
          fetchGroups();
        }}
      />
      
      <Modal
        open={assignModalVisible}
        footer={null}
        onCancel={() => setAssignModalVisible(false)}
        destroyOnHidden
        width={700}
        className="!rounded-2xl"
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <PlusOutlined className="text-xl text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Chọn promotion cho group</h2>
              <p className="text-sm text-gray-600">Gán promotion vào group: <span className="font-semibold text-blue-700">{assignGroup?.groupCode || ""}</span></p>
            </div>
          </div>

          {/* Content */}
          <Spin spinning={assignLoading}>
            <div className="space-y-4">
              {/* Promotion List */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200 w-full">
                <h3 className="text-lg font-semibold text-green-700 mb-4 flex items-center gap-2">
                  
                  Danh sách promotion ({promotionList.length})
                </h3>
                
                                 <Checkbox.Group
                   value={selectedPromotionIds}
                   onChange={setSelectedPromotionIds}
                   className="w-full"
                 >
                   <div className="max-h-80 overflow-y-auto space-y-3 w-full">
                    {promotionList.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <p>Không có promotion nào khả dụng</p>
                      </div>
                    ) : (
                      promotionList.map((promotion) => {
                        const isExclusive = promotion.isExclusive;
                        const isDisabled = isExclusive;
                        
                        return (
                          <div 
                            key={promotion.promotionId}
                            className={`bg-white rounded-lg p-4 border transition-all duration-200 w-full ${
                              isDisabled 
                                ? 'border-gray-300 bg-gray-50 opacity-60 cursor-not-allowed' 
                                : 'border-gray-200 hover:border-green-300 hover:shadow-md'
                            }`}
                          >
                            <Checkbox 
                              value={promotion.promotionId}
                              className="w-full"
                              disabled={isDisabled}
                            >
                              <div className="ml-2 w-full">
                                <div className="font-semibold text-gray-900 mb-1 w-full flex items-center gap-2">
                                  {promotion.title}
                                  {isExclusive && (
                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-300">
                                      Độc quyền
                                    </span>
                                  )}
                                </div>
                                <div className="text-sm text-gray-600 w-full">{promotion.detail}</div>
                                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 w-full">
                                  <span>Loại: {promotion.promotionType}</span>
                                  <span>Giá trị: {promotion.value}</span>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    promotion.status === "ACTIVE"
                                      ? 'bg-green-100 text-green-800 border border-green-300' 
                                      : 'bg-red-100 text-red-800 border border-red-300'
                                  }`}>
                                    {promotion.status === "ACTIVE" ? 'Hoạt động' : 'Ngừng'}
                                  </span>
                                </div>
                                {isDisabled && (
                                  <div className="mt-2 text-xs text-red-600 font-medium">
                                    ⚠️ Promotion độc quyền không thể gán vào group code
                                  </div>
                                )}
                              </div>
                            </Checkbox>
                          </div>
                        );
                      })
                    )}
                  </div>
                </Checkbox.Group>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  onClick={() => setAssignModalVisible(false)}
                  className="px-6 py-2 h-10 border-gray-300 text-gray-700 hover:border-gray-400 hover:text-gray-800 bg-white shadow-sm"
                >
                  Hủy
                </Button>
                <Button
                  type="primary"
                  onClick={handleAssignPromotions}
                  loading={assignLoading}
                  className="px-6 py-2 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Gán promotion
                </Button>
              </div>
            </div>
          </Spin>
        </div>
      </Modal>

      {/* Detail Modal */}
      <Modal
        open={detailModalVisible}
        footer={null}
        onCancel={() => setDetailModalVisible(false)}
        destroyOnHidden
        width={700}
        className="!rounded-2xl"
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <TagOutlined className="text-xl text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Chi tiết group code</h2>
              <p className="text-sm text-gray-600">Thông tin chi tiết và promotion đã gán</p>
            </div>
          </div>

          {selectedGroupDetail && (
            <div className="space-y-4">
              {/* Group Info */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-700 mb-4 flex items-center gap-2">
                  <TagOutlined className="text-blue-600" />
                  Thông tin group
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Tên group:</span>
                    <span className="text-sm font-semibold text-gray-900">{selectedGroupDetail.groupCode}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Mô tả:</span>
                    <span className="text-sm text-gray-900">{selectedGroupDetail.description || "Không có mô tả"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Số promotion:</span>
                    <span className="text-sm font-semibold text-blue-700">{selectedGroupDetail.promotions?.length || 0}</span>
                  </div>
                </div>
              </div>

              {/* Promotions List */}
              {selectedGroupDetail.promotions && selectedGroupDetail.promotions.length > 0 ? (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                  <h3 className="text-lg font-semibold text-green-700 mb-4 flex items-center gap-2">
                    <TagOutlined className="text-green-600" />
                    Promotion đã gán ({selectedGroupDetail.promotions.length})
                  </h3>
                  <div className="space-y-3">
                    {selectedGroupDetail.promotions.map((promotion) => (
                      <div 
                        key={promotion.promotionId}
                        className="bg-white rounded-lg p-4 border border-gray-200 hover:border-green-300 hover:shadow-md transition-all duration-200"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900 mb-1">{promotion.title}</div>
                            <div className="text-sm text-gray-600 mb-2">{promotion.detail}</div>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span>Loại: {promotion.promotionType}</span>
                              <span>Giá trị: {promotion.value}</span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                promotion.status === "ACTIVE"
                                  ? 'bg-green-100 text-green-800 border border-green-300' 
                                  : 'bg-red-100 text-red-800 border border-red-300'
                              }`}>
                                {promotion.status === "ACTIVE" ? 'Hoạt động' : 'Ngừng'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-8 text-center border border-gray-200">
                  <TagOutlined className="text-4xl text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có promotion nào</h3>
                  <p className="text-gray-500">Group này chưa được gán promotion nào</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  onClick={() => setDetailModalVisible(false)}
                  className="px-6 py-2 h-10 border-gray-300 text-gray-700 hover:border-gray-400 hover:text-gray-800 bg-white shadow-sm"
                >
                  Đóng
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};

export default GroupCodeManagement;