import React, { useEffect, useState, useMemo } from "react";
import { Card, Tag, Typography, Spin, Alert, Tooltip, Modal, Button, Select, Input, Row, Col, Statistic, Popconfirm } from "antd";
import { getAllRoles, getAllPermissions } from "../../../service/permission/index";
import { UserOutlined, PlusOutlined, CloseOutlined, DeleteOutlined, EditOutlined, SearchOutlined, InboxOutlined, KeyOutlined, TeamOutlined, CheckCircleOutlined, CloseCircleOutlined, EyeOutlined } from "@ant-design/icons";
import { addPermissionsToRole } from "../../../service/permission/index";
import { handleRemovePermissionsFromRole } from "./RemovePermission";
import RemoveRole from "./RemoveRole";
import UpdateRole from "./UpdateRole";
import AddRole from "./AddRole";
import { showSuccessToast, showErrorToast } from "../../../utils/toast";

const { Title, Text } = Typography;
const { Option } = Select;

const RoleManagement = ({ refreshTrigger, hideHeader = false }) => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [allPermissions, setAllPermissions] = useState([]);
  const [search, setSearch] = useState("");
  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [addPermissionIds, setAddPermissionIds] = useState([]);
  const [addLoading, setAddLoading] = useState(false);
  // Remove role modal state
  const [removeModalVisible, setRemoveModalVisible] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState(null);
  // Update role modal state
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [roleToUpdate, setRoleToUpdate] = useState(null);
  const [addRoleVisible, setAddRoleVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedRoleForDetail, setSelectedRoleForDetail] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 8,
    total: 0,
  });

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, []);

  // Refresh roles when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger) {
      fetchRoles();
    }
  }, [refreshTrigger]);

  const fetchRoles = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAllRoles();
      if (!response.error) {
        setRoles(response.result || []);
        setPagination(prev => ({
          ...prev,
          total: (response.result || []).length,
        }));
      } else {
        setError(response.message || "Không thể lấy danh sách roles");
        setPagination(prev => ({ ...prev, total: 0 }));
      }
    } catch (error) {
      setError("Có lỗi xảy ra khi tải danh sách roles");
      setPagination(prev => ({ ...prev, total: 0 }));
    } finally {
      setLoading(false);
    }
  };

  const fetchPermissions = async () => {
    const res = await getAllPermissions();
    if (!res.error) setAllPermissions(res.result || []);
    else setAllPermissions([]);
  };

  // Filter roles theo search
  const filteredRoles = useMemo(() => {
    if (!search) return roles;
    return roles.filter(
      (role) =>
        role.roleName.toLowerCase().includes(search.toLowerCase()) ||
        role.roleCode.toLowerCase().includes(search.toLowerCase())
    );
  }, [roles, search]);

  const pagedRoles = filteredRoles.slice(
    (pagination.current - 1) * pagination.pageSize,
    pagination.current * pagination.pageSize
  );

  // Thống kê
  const totalRoles = roles.length;
  const totalPermissions = useMemo(() => {
    const set = new Set();
    roles.forEach((r) => r.permissions?.forEach((p) => set.add(p.id)));
    return set.size;
  }, [roles]);

  // Mở modal thêm quyền cho role
  const openAddPermissionModal = (role) => {
    setSelectedRole(role);
    setModalVisible(true);
    setAddPermissionIds([]);
  };

  // Xác nhận thêm quyền
  const handleAddPermission = async () => {
    if (!selectedRole || addPermissionIds.length === 0) {
      showErrorToast("Vui lòng chọn ít nhất một quyền!");
      return;
    }
    setAddLoading(true);
            const res = await addPermissionsToRole(selectedRole.roleId, addPermissionIds);
    setAddLoading(false);
    if (!res.error) {
      showSuccessToast(res.message);
      setModalVisible(false);
      fetchRoles();
    } else {
      showErrorToast(res.message);
    }
  };

  // Xóa từng quyền trực tiếp trên tag
  const handleRemoveSinglePermission = async (roleId, permissionId) => {
    const res = await handleRemovePermissionsFromRole(roleId, [permissionId]);
    if (!res.error) {
      showSuccessToast(res.message);
      fetchRoles();
    } else {
      showErrorToast(res.message);
    }
  };

  // Mở modal xóa role
  const openRemoveRoleModal = (role) => {
    setRoleToDelete(role);
    setRemoveModalVisible(true);
  };

  // Xử lý xóa role thành công
  const handleRemoveRoleSuccess = () => {
    fetchRoles();
  };

  // Xử lý cập nhật role thành công
  const handleUpdateRoleSuccess = () => {
    fetchRoles();
  };

  // Quyền chưa có trong role
  const getAvailablePermissions = (role) => {
    const currentIds = new Set(role.permissions?.map((p) => p.id));
    return allPermissions.filter((perm) => !currentIds.has(perm.id));
  };

  // Mở modal xem chi tiết permissions
  const openDetailModal = (role) => {
    setSelectedRoleForDetail(role);
    setDetailModalVisible(true);
  };

  return (
    <>
      {/* Header Section */}
      {!hideHeader && (
        <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl shadow-lg border border-pink-200 p-4 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg">
                <TeamOutlined className="text-xl text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Quản lý vai trò</h1>
                <p className="text-sm text-gray-600">Quản lý vai trò và phân quyền người dùng</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setAddRoleVisible(true)}
                className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 border-0 h-10 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Thêm Role
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-3 border-2 border-indigo-200 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Tổng vai trò</p>
              <p className="text-lg font-bold text-indigo-900">{totalRoles}</p>
            </div>
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
              <TeamOutlined className="text-white text-sm" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-3 border-2 border-green-200 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Quyền đang sử dụng</p>
              <p className="text-lg font-bold text-green-700">{totalPermissions}</p>
            </div>
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-md">
              <KeyOutlined className="text-white text-sm" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-3 border-2 border-blue-200 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Tổng quyền hệ thống</p>
              <p className="text-lg font-bold text-blue-700">{allPermissions.length}</p>
            </div>
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center shadow-md">
              <CheckCircleOutlined className="text-white text-sm" />
            </div>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="flex items-center justify-between gap-4 mb-4 p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg border border-gray-200">
        <div className="flex items-center gap-4 ml-auto">
          <div className="relative">
            <SearchOutlined className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />
            <input
              placeholder="Tìm kiếm theo tên hoặc mã role..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10 w-64 h-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 focus:outline-none text-sm shadow-sm"
              style={{ color: 'black', backgroundColor: 'white' }}
            />
          </div>
        </div>
      </div>

      {error && (
        <Alert
          message="Lỗi"
          description={error}
          type="error"
          showIcon
          className="mb-4"
        />
      )}

      {/* Role Cards */}
      <Spin spinning={loading}>
        {pagedRoles.length === 0 ? (
          <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-12 text-center border border-gray-200">
            <InboxOutlined className="text-6xl text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy vai trò nào</h3>
            <p className="text-gray-500">Thử thay đổi bộ lọc hoặc thêm vai trò mới</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {pagedRoles.map((role) => (
              <div
                key={role.roleId}
                className="bg-gradient-to-br from-white via-pink-50 to-rose-100 rounded-xl border-2 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] relative overflow-hidden border-gray-200 hover:border-pink-300"
              >
                {/* Header */}
                <div className="p-3 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-pink-100 to-rose-100">
                  <div className="flex items-center gap-2">
                    <UserOutlined className="text-pink-600" />
                    <span className="font-bold text-pink-700 line-clamp-1">{role.roleName}</span>
                  </div>
                  <div className="px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-green-200 to-emerald-200 text-green-800 border border-green-300 shadow-sm">
                    Hoạt động
                  </div>
                </div>

                {/* Content */}
                <div className="p-3 bg-gradient-to-br from-white to-pink-50">
                  {/* Role Info */}
                  <div className="space-y-2 mb-3">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Mã:</span>
                      <span className="text-pink-700 font-bold">{role.roleCode}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Mô tả:</span>
                      <span className="text-gray-700 font-medium line-clamp-2">{role.description || "Không có mô tả"}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Quyền:</span>
                      <span className="text-pink-700 font-bold">{role.permissions?.length || 0}</span>
                    </div>
                  </div>



                  {/* Actions */}
                  <div className="flex gap-1 mb-2">
                    <Tooltip title="Xem chi tiết">
                      <Button
                        size="small"
                        icon={<EyeOutlined className="text-blue-600" />}
                        onClick={() => openDetailModal(role)}
                        className="flex-1 border-blue-300 text-blue-700 hover:border-blue-400 hover:text-blue-800 shadow-sm bg-gradient-to-r from-blue-100 to-indigo-100"
                      />
                    </Tooltip>
                    <Tooltip title="Thêm quyền">
                      <Button
                        size="small"
                        icon={<PlusOutlined className="text-green-600" />}
                        onClick={() => openAddPermissionModal(role)}
                        className="flex-1 border-green-300 text-green-700 hover:border-green-400 hover:text-green-800 shadow-sm bg-gradient-to-r from-green-100 to-emerald-100"
                      />
                    </Tooltip>
                    <Tooltip title="Chỉnh sửa">
                      <Button
                        size="small"
                        icon={<EditOutlined className="text-purple-600" />}
                        onClick={() => {
                          setRoleToUpdate(role);
                          setUpdateModalVisible(true);
                        }}
                        className="flex-1 border-purple-300 text-purple-700 hover:border-purple-400 hover:text-purple-800 shadow-sm bg-gradient-to-r from-purple-100 to-violet-100"
                      />
                    </Tooltip>
                    <Tooltip title="Xóa">
                      <Button
                        size="small"
                        icon={<DeleteOutlined className="text-red-600" />}
                        onClick={() => openRemoveRoleModal(role)}
                        className="flex-1 border-red-300 text-red-700 hover:border-red-400 hover:text-red-800 shadow-sm bg-gradient-to-r from-red-100 to-rose-100"
                      />
                    </Tooltip>
                  </div>


                </div>
              </div>
            ))}
          </div>
        )}
      </Spin>
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
        {Array.from({ length: Math.ceil(filteredRoles.length / pagination.pageSize) }, (_, i) => i + 1).map(page => (
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
            ${pagination.current === Math.ceil(filteredRoles.length / pagination.pageSize) || filteredRoles.length === 0
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-white text-pink-700 hover:bg-pink-100'}
          `}
          disabled={pagination.current === Math.ceil(filteredRoles.length / pagination.pageSize) || filteredRoles.length === 0}
          onClick={() => {
            if (pagination.current < Math.ceil(filteredRoles.length / pagination.pageSize)) {
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

      {/* Modal thêm quyền */}
      <Modal
        title={
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
              <KeyOutlined className="text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">
              Thêm quyền cho role: {selectedRole?.roleName || ""}
            </span>
          </div>
        }
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleAddPermission}
        okText="Thêm quyền"
        cancelText="Hủy"
        confirmLoading={addLoading}
        width={700}
        className="!rounded-xl"
        okButtonProps={{
          className: "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 border-0 shadow-lg"
        }}
        cancelButtonProps={{
          className: "border-gray-300 text-gray-700 hover:border-gray-400 hover:text-gray-800"
        }}
      >
        <div className="mt-4 space-y-4">
          {/* Role Info Section */}
          <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <TeamOutlined className="text-white text-sm" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Thông tin vai trò</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Tên vai trò:</span>
                <span className="text-blue-700 font-medium">{selectedRole?.roleName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Mã vai trò:</span>
                <span className="text-blue-700 font-medium">{selectedRole?.roleCode}</span>
              </div>
            </div>
          </div>

          {/* Permissions Selection Section */}
          <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <KeyOutlined className="text-white text-sm" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Chọn quyền hạn</h3>
            </div>
            
            <div className="space-y-3">
              <p className="text-sm text-gray-600 mb-3">
                Chọn các quyền hạn bạn muốn thêm vào vai trò này. Có thể chọn nhiều quyền cùng lúc.
              </p>
              
              <Select
                mode="multiple"
                style={{ width: "100%" }}
                placeholder="Chọn quyền để thêm..."
                value={addPermissionIds}
                onChange={setAddPermissionIds}
                optionFilterProp="children"
                filterOption={(input, option) =>
                  String(option.children).toLowerCase().includes(input.toLowerCase())
                }
                className="rounded-lg"
                size="large"
                showSearch
                allowClear
              >
                {(selectedRole ? getAvailablePermissions(selectedRole) : []).map((perm) => (
                  <Option key={perm.id} value={perm.id}>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">{perm.code}</span>
                      <span className="text-gray-500 text-sm">{perm.description}</span>
                    </div>
                  </Option>
                ))}
              </Select>
              
              {addPermissionIds.length > 0 && (
                <div className="mt-3 p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircleOutlined className="text-green-600" />
                    <span className="text-sm font-medium text-green-800">
                      Đã chọn {addPermissionIds.length} quyền hạn
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {addPermissionIds.map(id => {
                      const perm = (selectedRole ? getAvailablePermissions(selectedRole) : []).find(p => p.id === id);
                      return perm ? (
                        <span key={id} className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full border border-green-200">
                          {perm.code}
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Modal>

      {/* Modal xóa role */}
      <RemoveRole
        visible={removeModalVisible}
        onCancel={() => setRemoveModalVisible(false)}
        onSuccess={handleRemoveRoleSuccess}
        roleData={roleToDelete}
      />

      {/* Modal sửa role */}
      <UpdateRole
        visible={updateModalVisible}
        onCancel={() => setUpdateModalVisible(false)}
        onSuccess={handleUpdateRoleSuccess}
        roleData={roleToUpdate}
      />

      {/* Modal thêm role */}
      <AddRole
        visible={addRoleVisible}
        onCancel={() => setAddRoleVisible(false)}
        onSuccess={() => {
          setAddRoleVisible(false);
          fetchRoles();
        }}
      />

      {/* Modal xem chi tiết permissions */}
      <Modal
        title={
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center shadow-lg">
              <EyeOutlined className="text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">
              Chi tiết quyền hạn - {selectedRoleForDetail?.roleName}
            </span>
          </div>
        }
        open={detailModalVisible}
        onCancel={() => {
          setDetailModalVisible(false);
          setSelectedRoleForDetail(null);
        }}
        footer={null}
        width={800}
        className="!rounded-xl"
      >
        {selectedRoleForDetail && (
          <div className="space-y-4">
            {/* Role Info */}
            <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-200">
              <div className="flex items-center gap-3 mb-3">
                <UserOutlined className="text-indigo-600 text-lg" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{selectedRoleForDetail.roleName}</h3>
                  <p className="text-sm text-gray-600">Mã: {selectedRoleForDetail.roleCode}</p>
                  {selectedRoleForDetail.description && (
                    <p className="text-sm text-gray-600 mt-1">{selectedRoleForDetail.description}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Permissions List */}
            <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
              <div className="flex items-center gap-2 mb-4">
                <KeyOutlined className="text-blue-600" />
                <h4 className="text-lg font-semibold text-gray-900">
                  Danh sách quyền hạn ({selectedRoleForDetail.permissions?.length || 0})
                </h4>
              </div>
              
              {selectedRoleForDetail.permissions && selectedRoleForDetail.permissions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedRoleForDetail.permissions.map((perm) => (
                    <div
                      key={perm.id}
                      className="p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-blue-700 text-sm">{perm.code}</span>
                            <Tooltip title="Xóa quyền này">
                              <Popconfirm
                                title="Xóa quyền này khỏi role?"
                                onConfirm={() => {
                                  handleRemoveSinglePermission(selectedRoleForDetail.roleId, perm.id);
                                  setDetailModalVisible(false);
                                }}
                                okText="Xóa"
                                cancelText="Hủy"
                              >
                                <Button
                                  size="small"
                                  type="text"
                                  icon={<CloseOutlined className="text-red-500" />}
                                  className="p-1 h-6 w-6 flex items-center justify-center hover:bg-red-50 rounded"
                                />
                              </Popconfirm>
                            </Tooltip>
                          </div>
                          <p className="text-xs text-gray-600 line-clamp-2">
                            {perm.description || "Không có mô tả"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <InboxOutlined className="text-4xl text-gray-300 mb-2" />
                  <p className="text-gray-500">Chưa có quyền hạn nào được gán</p>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default RoleManagement;
