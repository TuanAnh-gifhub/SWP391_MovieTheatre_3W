import React, { useEffect, useState, useCallback } from "react";
import { Button, Tooltip, Modal, Switch } from "antd";
import { EyeOutlined, KeyOutlined, InboxOutlined, SearchOutlined, UserOutlined, TrophyOutlined, CrownOutlined, TeamOutlined, CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { getAllUsers, setAccountActive } from "../../../service/user-management";
import { toast } from "react-toastify";
import MultiSwitch from "../Movie/Switch";
import { showSuccessToast, showErrorToast } from "../../../utils/toast";

const UserManagement = () => {
  const [roles, setRoles] = useState(["All"]);
  const [users, setUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 8, total: 0 });
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [selectedUser, setSelectedUser] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [ranks, setRanks] = useState([]);
  const [rankCounts, setRankCounts] = useState({});
  const [selectedRankFilter, setSelectedRankFilter] = useState(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [theme, setTheme] = useState(document.body.getAttribute('data-theme') || 'light');
  // Permission feature removed: assign-role modal/state removed to avoid dependency on permission components
  const [statusFilter, setStatusFilter] = useState(null);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setTheme(document.body.getAttribute('data-theme') || 'light');
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  // Loyalty ranks removed; ranks will be populated from user data only

  // Đếm số user theo từng rank và tạo danh sách roles động
  useEffect(() => {
    if (!allUsers || allUsers.length === 0) {
      setRankCounts({});
      setRoles(["All"]);
      return;
    }
    
    // Tạo danh sách roles động từ dữ liệu thực tế
    const uniqueRoles = [...new Set(allUsers.map(user => user.role).filter(role => role))];
    setRoles(["All", ...uniqueRoles]);
    
    // Đếm số user theo từng rank
    if (ranks.length > 0) {
      const counts = {};
      ranks.forEach(rank => {
        counts[rank] = allUsers.filter(u => (u.rank || "").trim() === rank).length;
      });
      const noRankCount = allUsers.filter(u => !ranks.includes((u.rank || "").trim()) || !u.rank || u.rank === "No rank").length;
      counts["Không có"] = noRankCount;
      setRankCounts(counts);
    }
  }, [allUsers, ranks]);

  const fetchUsers = useCallback(async ({ page = 1, pageSize = 8 } = {}) => {
    setLoading(true);
    try {
      const all = await getAllUsers();
      setAllUsers(Array.isArray(all) ? all : []);
      let filtered = Array.isArray(all) ? all : [];
      filtered = filtered.filter((user) => {
        const matchesSearch =
          user.username?.toLowerCase().includes(search.toLowerCase()) ||
          user.fullName?.toLowerCase().includes(search.toLowerCase()) ||
          user.email?.toLowerCase().includes(search.toLowerCase());
        const matchesRole =
          roleFilter === "All" || (user.role && user.role.toUpperCase() === roleFilter);
        let matchesRank = true;
        if (selectedRankFilter) {
          if (selectedRankFilter === "Không có") {
            matchesRank = !ranks.includes((user.rank || "").trim()) || !user.rank || user.rank === "No rank";
          } else {
            matchesRank = (user.rank || "").trim() === selectedRankFilter;
          }
        }
        let matchesStatus = true;
        if (typeof statusFilter === "boolean") {
          matchesStatus = user.active === statusFilter;
        }
        return matchesSearch && matchesRole && matchesRank && matchesStatus;
      });
      setPagination({ current: page, pageSize: pageSize, total: filtered.length });
      const startIdx = (page - 1) * pageSize;
      const endIdx = startIdx + pageSize;
      setUsers(filtered.slice(startIdx, endIdx));
    } catch (err) {
      showErrorToast("Mất kết nối server");
    }
    setLoading(false);
  }, [search, roleFilter, selectedRankFilter, statusFilter, ranks]);

  useEffect(() => { 
    fetchUsers({ page: 1, pageSize: pagination.pageSize }); 
  }, [fetchUsers, pagination.pageSize]);

  const handleTableChange = (newPagination) => {
    fetchUsers({ page: newPagination.current, pageSize: newPagination.pageSize });
  };

  const showDetail = (user) => {
    setSelectedUser(user);
    setDetailModalVisible(true);
  };

  // Hàm đảo kích hoạt hàng loạt
  const handleMultiSwitch = async () => {
    const usersToUpdate =
      selectedRowKeys.length === 0
        ? users
        : users.filter((u) => selectedRowKeys.includes(u.accountID));
    if (usersToUpdate.length === 0) return;
    const ids = usersToUpdate.map((u) => u.accountID);
    try {
      setLoading(true);
      await Promise.all(
        ids.map(async (id) => {
          const user = users.find((u) => u.accountID === id);
          await setAccountActive(id, !user.active);
        })
      );
      showSuccessToast(
        `Đã đảo trạng thái kích hoạt ${
          usersToUpdate.length === users.length ? "tất cả tài khoản" : "các tài khoản đã chọn"
        } thành công!`
      );
      setSelectedRowKeys([]);
      fetchUsers({ page: pagination.current, pageSize: pagination.pageSize });
    } catch {
      showErrorToast("Có lỗi khi cập nhật trạng thái!");
    } finally {
      setLoading(false);
    }
  };

  const total = allUsers.length;
  const active = allUsers.filter(u => u.active).length;
  const inactive = allUsers.filter(u => !u.active).length;

  return (
    <>
      {/* Header Section */}
      <div className="bg-blue-50 rounded-xl shadow-lg border border-blue-200 p-4 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <UserOutlined className="text-xl text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Quản lý người dùng</h1>
              <p className="text-sm text-gray-600">Quản lý thông tin và phân quyền người dùng</p>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
        <div 
          className={`bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-3 border-2 transition-all duration-300 cursor-pointer hover:shadow-lg hover:scale-[1.02] relative ${
            statusFilter === null 
              ? 'border-blue-500 shadow-lg scale-[1.02] z-10' 
              : 'border-gray-200 hover:border-blue-300 hover:z-10'
          }`}
          onClick={() => setStatusFilter(null)}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Tổng tài khoản</p>
              <p className="text-lg font-bold text-blue-900">{total}</p>
            </div>
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
              <TeamOutlined className="text-white text-sm" />
            </div>
          </div>
        </div>
        <div 
          className={`bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-3 border-2 transition-all duration-300 cursor-pointer hover:shadow-lg hover:scale-[1.02] relative ${
            statusFilter === true 
              ? 'border-green-500 shadow-lg scale-[1.02] z-10' 
              : 'border-gray-200 hover:border-green-300 hover:z-10'
          }`}
          onClick={() => {
            // Khi chọn status filter thì bỏ chọn rank filter
            setSelectedRankFilter(null);
            setStatusFilter(statusFilter === true ? null : true);
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Đã kích hoạt</p>
              <p className="text-lg font-bold text-green-700">{active}</p>
            </div>
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-md">
              <CheckCircleOutlined className="text-white text-sm" />
            </div>
          </div>
        </div>
        <div 
          className={`bg-gradient-to-br from-red-50 to-rose-50 rounded-lg p-3 border-2 transition-all duration-300 cursor-pointer hover:shadow-lg hover:scale-[1.02] relative ${
            statusFilter === false 
              ? 'border-red-500 shadow-lg scale-[1.02] z-10' 
              : 'border-gray-200 hover:border-red-300 hover:z-10'
          }`}
          onClick={() => {
            // Khi chọn status filter thì bỏ chọn rank filter
            setSelectedRankFilter(null);
            setStatusFilter(statusFilter === false ? null : false);
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Chưa kích hoạt</p>
              <p className="text-lg font-bold text-red-700">{inactive}</p>
            </div>
            <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-rose-600 rounded-lg flex items-center justify-center shadow-md">
              <CloseCircleOutlined className="text-white text-sm" />
            </div>
          </div>
        </div>
        <div 
          className={`bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg p-3 border-2 transition-all duration-300 cursor-pointer hover:shadow-lg hover:scale-[1.02] relative ${
            selectedRankFilter 
              ? 'border-purple-500 shadow-lg scale-[1.02] z-10' 
              : 'border-gray-200 hover:border-purple-300 hover:z-10'
          }`}
          onClick={() => {
            // Khi chọn rank filter thì bỏ chọn status filter
            setStatusFilter(null);
            setSelectedRankFilter(selectedRankFilter ? null : "All");
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Xếp hạng</p>
              <p className="text-lg font-bold text-purple-700">{ranks.length}</p>
            </div>
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg flex items-center justify-center shadow-md">
              <CrownOutlined className="text-white text-sm" />
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      <div className="flex items-center justify-between gap-4 mb-4 p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg border border-gray-200">
        <div className="flex items-center gap-4">
          <MultiSwitch
            checked={selectedRowKeys.length === 0 ? users.every(u => u.active) : users.filter(u => selectedRowKeys.includes(u.accountID)).every(u => u.active)}
            onChange={handleMultiSwitch}
            loading={loading}
            checkedChildren="Bật"
            unCheckedChildren="Tắt"
          />
          <span className="text-sm text-gray-600">
            {selectedRowKeys.length === 0
              ? "Bật/Tắt kích hoạt tất cả tài khoản"
              : `Bật/Tắt ${selectedRowKeys.length} tài khoản đã chọn`}
          </span>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              checked={users.length > 0 && users.every(u => selectedRowKeys.includes(u.accountID))}
              ref={el => {
                if (el) {
                  el.indeterminate = users.length > 0 && selectedRowKeys.length > 0 && selectedRowKeys.length < users.length;
                }
              }}
              onChange={e => {
                if (e.target.checked) {
                  setSelectedRowKeys(users.map(u => u.accountID));
                } else {
                  setSelectedRowKeys([]);
                }
              }}
              disabled={loading || users.length === 0}
            />
            <span className="text-sm text-gray-600">Chọn tất cả</span>
          </label>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <SearchOutlined className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />
          <input
            placeholder="Tìm kiếm người dùng..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
              className="pl-10 w-48 h-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:outline-none text-sm shadow-sm"
              style={{
                paddingLeft: '40px',
                color: 'black',
                backgroundColor: 'white',
              }}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 font-medium whitespace-nowrap">Vai trò:</span>
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
              className="w-40 h-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:outline-none text-sm shadow-sm"
              style={{
                color: 'black',
                backgroundColor: 'white',
              }}
          >
            {roles.map((role) => (
                <option key={role} value={role} style={{ color: 'black', backgroundColor: 'white' }}>
                {role === "All"
                  ? "Tất cả"
                  : role === "ADMIN"
                  ? "Admin"
                  : role === "CUSTOMER"
                  ? "Khách hàng"
                  : role === "EMPLOYEE"
                  ? "Nhân viên"
                  : role === "MANAGER"
                  ? "Quản lý"
                  : role === "SUPER_ADMIN"
                  ? "Super Admin"
                  : role}
              </option>
            ))}
          </select>
          </div>
        </div>
      </div>

      {/* Rank Filter Buttons */}
              {ranks.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {ranks.map(rank => {
            // Đảm bảo rank là string
            const rankName = typeof rank === 'string' ? rank : (rank?.name || 'Unknown');
            return (
              <button
                key={rankName}
                type="button"
                className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5 border shadow-sm transition-all duration-200
                  ${selectedRankFilter === rankName ? 'bg-blue-100 text-blue-700 border-blue-300' : 'bg-white text-black border-gray-300 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-500'}`}
                onClick={() => {
                  // Nếu đang chọn rank này thì bỏ chọn, nếu không thì chọn rank này
                  setSelectedRankFilter(selectedRankFilter === rankName ? null : rankName);
                }}
              >
                <TrophyOutlined className="text-blue-500 text-xs" />
                {rankName}: <span className="font-bold">{rankCounts[rankName] || 0}</span>
              </button>
            );
          })}
          <button
            type="button"
            className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5 border shadow-sm transition-all duration-200
              ${selectedRankFilter === "Không có" ? 'bg-gray-100 text-gray-600 border-gray-400' : 'bg-white text-black border-gray-300 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-500'}`}
            onClick={() => {
              // Nếu đang chọn "Không có" thì bỏ chọn, nếu không thì chọn "Không có"
              setSelectedRankFilter(selectedRankFilter === "Không có" ? null : "Không có");
            }}
          >
            <TrophyOutlined className="text-gray-500 text-xs" />
            Không có: <span className="font-bold">{rankCounts["Không có"] || 0}</span>
          </button>
        </div>
      )}

      {/* User Cards */}
        {users.length === 0 ? (
        <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-12 text-center border border-gray-200">
          <InboxOutlined className="text-6xl text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy người dùng nào</h3>
          <p className="text-gray-500">Thử thay đổi bộ lọc hoặc tìm kiếm khác</p>
          </div>
        ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {users.map((user) => {
            const isSelected = selectedRowKeys.includes(user.accountID);
            let rankColor = "bg-gray-100 text-gray-700";
            let rankText = user.rank && user.rank !== "No rank" ? user.rank : "Không có";
            const lower = rankText.toLowerCase();
            if (lower.includes("phổ thông")) rankColor = "bg-gray-200 text-gray-700";
            else if (lower.includes("đồng")) rankColor = "bg-blue-200 text-blue-800";
            else if (lower.includes("bạc")) rankColor = "bg-gray-300 text-gray-800";
            else if (lower.includes("vàng")) rankColor = "bg-yellow-200 text-yellow-800";
            else if (lower.includes("kim cương") || lower.includes("diamond")) rankColor = "bg-blue-200 text-blue-800";
            else if (lower.includes("không có")) rankColor = "bg-gray-100 text-gray-400";
            
            let roleColor = "bg-blue-100 text-blue-700";
            let roleText = user.role;
            if (user.role === "ADMIN") { roleColor = "bg-red-100 text-red-700"; roleText = "Admin"; }
            else if (user.role === "CUSTOMER") { roleColor = "bg-green-100 text-green-700"; roleText = "Khách hàng"; }
            else if (user.role === "EMPLOYEE") { roleColor = "bg-blue-100 text-blue-700"; roleText = "Nhân viên"; }
            else if (user.role === "MANAGER") { roleColor = "bg-purple-100 text-purple-700"; roleText = "Quản lý"; }
            else if (user.role === "SUPER_ADMIN") { roleColor = "bg-orange-100 text-orange-700"; roleText = "Super Admin"; }

            return (
              <div
                key={user.accountID}
                className={`bg-gradient-to-br from-white via-blue-50 to-indigo-100 rounded-xl border-2 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] relative overflow-hidden ${
                  isSelected ? 'border-blue-500 shadow-lg scale-[1.02] bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 z-10' : 'border-gray-200 hover:border-blue-300 hover:z-10'
                }`}
                onClick={() => {
                  if (!loading) {
                    setSelectedRowKeys(prev =>
                      prev.includes(user.accountID)
                        ? prev.filter(id => id !== user.accountID)
                        : [...prev, user.accountID]
                    );
                  }
                }}
              >
                {/* Checkbox and Status */}
                <div className="p-3 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-100 to-indigo-100">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={e => {
                    e.stopPropagation();
                    setSelectedRowKeys(prev =>
                      prev.includes(user.accountID)
                        ? prev.filter(id => id !== user.accountID)
                        : [...prev, user.accountID]
                    );
                  }}
                    onClick={e => e.stopPropagation()}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 pointer-events-auto z-10 relative"
                  disabled={loading}
                />
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user.active 
                      ? 'bg-gradient-to-r from-green-200 to-emerald-200 text-green-800 border border-green-300 shadow-sm' 
                      : 'bg-gradient-to-r from-red-200 to-rose-200 text-red-800 border border-red-300 shadow-sm'
                  }`}>
                    {user.active ? 'Đã kích hoạt' : 'Chưa kích hoạt'}
                  </div>
                </div>

                {/* User Info */}
                <div className="p-4 bg-gradient-to-br from-white to-blue-50">
                {/* Avatar */}
                  <div className="flex items-center gap-3 mb-3">
                  {user.avatar ? (
                      <img src={user.avatar} alt="avatar" className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 shadow-md" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
                        <span className="text-lg font-bold text-white">{user.fullName?.[0] || user.username?.[0]}</span>
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900 line-clamp-1">{user.fullName}</h3>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Username:</span>
                      <span className="text-gray-900 font-medium">{user.username}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Xếp hạng:</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${rankColor}`}>
                        {rankText}
                      </span>
                </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Vai trò:</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${roleColor}`}>
                        {roleText}
                      </span>
                </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Điểm:</span>
                      <span className="text-gray-900 font-medium">{user.score || 0}</span>
                </div>
                </div>

                  {/* Actions */}
                  <div className="flex gap-1">
                    <Tooltip title="Xem chi tiết">
                      <Button
                        size="small"
                        icon={<EyeOutlined className="text-blue-600" />}
                        onClick={e => { e.stopPropagation(); showDetail(user); }}
                        className="flex-1 border-blue-300 text-blue-700 hover:border-blue-400 hover:text-blue-800 shadow-sm bg-gradient-to-r from-blue-100 to-indigo-100"
                      />
                    </Tooltip>
                   
                </div>

                  {/* Status Toggle */}
                  <div className="mt-3 pt-3 border-t border-gray-200 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg p-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">Kích hoạt:</span>
                      <MultiSwitch
                        checked={!!user.active}
                        checkedChildren="Bật"
                        unCheckedChildren="Tắt"
                        loading={loading}
                        onChange={async (checked) => {
                          const toastId = toast.loading("Đang cập nhật...");
                          try {
                            const res = await setAccountActive(user.accountID, checked);
                            toast.dismiss(toastId);
                            if (res && res.success) {
                              showSuccessToast(res.message || "Cập nhật trạng thái thành công!");
                              fetchUsers({ page: pagination.current, pageSize: pagination.pageSize });
                            } else {
                              showErrorToast(res?.message || "Cập nhật trạng thái thất bại");
                            }
                          } catch {
                            toast.dismiss(toastId);
                            showErrorToast("Mất kết nối server");
                          }
                        }}
                      />
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
              : theme === 'dark' ? 'bg-gray-700 text-white hover:bg-blue-700 hover:text-white' : 'bg-white text-blue-700 hover:bg-blue-100'}
          `}
          disabled={pagination.current === 1}
          onClick={() => {
            if (pagination.current > 1) {
              setPagination(prev => ({ ...prev, current: prev.current - 1 }));
              fetchUsers({ page: pagination.current - 1, pageSize: pagination.pageSize });
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
                : theme === 'dark'
                  ? 'bg-gray-700 text-white hover:bg-blue-700 hover:text-white'
                  : 'bg-white text-blue-700 hover:bg-blue-100'}
            `}
            onClick={() => {
              setPagination(prev => ({ ...prev, current: page }));
              fetchUsers({ page, pageSize: pagination.pageSize });
            }}
          >
            {page}
          </button>
        ))}
        <button
          className={`w-9 h-9 rounded-xl font-bold shadow transition flex items-center justify-center
            ${pagination.current === Math.ceil(pagination.total / pagination.pageSize) || pagination.total === 0
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : theme === 'dark' ? 'bg-gray-700 text-white hover:bg-blue-700 hover:text-white' : 'bg-white text-blue-700 hover:bg-blue-100'}
          `}
          disabled={pagination.current === Math.ceil(pagination.total / pagination.pageSize) || pagination.total === 0}
          onClick={() => {
            if (pagination.current < Math.ceil(pagination.total / pagination.pageSize)) {
              setPagination(prev => ({ ...prev, current: prev.current + 1 }));
              fetchUsers({ page: pagination.current + 1, pageSize: pagination.pageSize });
            }
          }}
        >
          &gt;
        </button>
        <select
          className={`ml-4 rounded-lg border px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition
            ${theme === 'dark' ? 'bg-gray-800 text-white border-gray-600' : 'bg-white text-blue-700 border-blue-200'}`}
          value={pagination.pageSize}
          onChange={e => {
            setPagination(prev => ({ ...prev, current: 1, pageSize: Number(e.target.value) }));
            fetchUsers({ page: 1, pageSize: Number(e.target.value) });
          }}
        >
          {[8, 16, 32].map(size => (
            <option key={size} value={size}>{size} / page</option>
          ))}
        </select>
      </div>

      {/* Modal chi tiết tài khoản */}
      <Modal
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        centered
        width={900}
        className="!rounded-2xl !p-0 animate-fade-in"
        styles={{ body: { borderRadius: 24, padding: 0, background: "none" } }}
      >
        {selectedUser && (
          <>
            <div className="p-8 flex flex-col items-center animate-fade-in w-full">
              {/* Avatar lớn */}
              <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center mb-3 border-2 border-blue-300">
                {selectedUser.avatar ? (
                  <img src={selectedUser.avatar} alt="avatar" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <span className="text-4xl font-bold text-blue-600">{selectedUser.fullName?.[0] || selectedUser.username?.[0]}</span>
                )}
              </div>
              <div className="text-2xl font-bold mb-1 text-blue-700 text-center w-full">{selectedUser.fullName}</div>
              <div className="text-gray-500 mb-2 text-center w-full">{selectedUser.username}</div>
              {/* Xếp hạng badge + ảnh */}
              <div className="flex items-center gap-2 mt-2 mb-4">
                {(() => {
                  let color = "bg-gray-100 text-gray-700";
                  let text = selectedUser.rank && selectedUser.rank !== "No rank" ? selectedUser.rank : "Không có";
                  const lower = text.toLowerCase();
                  if (lower.includes("phổ thông")) color = "bg-gray-200 text-gray-700";
                  else if (lower.includes("đồng")) color = "bg-blue-200 text-blue-800";
                  else if (lower.includes("bạc")) color = "bg-gray-300 text-gray-800";
                  else if (lower.includes("vàng")) color = "bg-yellow-200 text-yellow-800";
                  else if (lower.includes("kim cương") || lower.includes("diamond")) color = "bg-blue-200 text-blue-800";
                  else if (lower.includes("không có")) color = "bg-gray-100 text-gray-400";
                  return (
                    <span className={`px-3 py-1 rounded font-semibold text-sm ${color} flex items-center gap-1`}>
                      <TrophyOutlined />
                      {text}
                    </span>
                  );
                })()}
                {selectedUser.rankImage && selectedUser.rankImage !== "No rank image" && (
                  <img src={selectedUser.rankImage} alt="rank" className="w-8 h-8 rounded-lg object-cover border" />
                )}
              </div>
              {/* Thông tin chia 2 cột ngang */}
              <div className="w-full grid grid-cols-2 gap-x-6 gap-y-2 mt-2">
                <InfoRow icon={<UserOutlined />} label="Email" value={selectedUser.email} />
                <InfoRow icon={<UserOutlined />} label="Ngày sinh" value={selectedUser.dob ? new Date(selectedUser.dob).toLocaleDateString() : "-"} />
                <InfoRow icon={<UserOutlined />} label="Giới tính" value={selectedUser.sex === "MALE" ? "Nam" : selectedUser.sex === "FEMALE" ? "Nữ" : "-"} />
                <InfoRow icon={<UserOutlined />} label="CMND/CCCD" value={selectedUser.identityCard} />
                <InfoRow icon={<UserOutlined />} label="SĐT" value={selectedUser.phone} />
                <InfoRow icon={<UserOutlined />} label="Địa chỉ" value={selectedUser.address} />
                <InfoRow icon={<TrophyOutlined />} label="Điểm" value={selectedUser.score} />
                <InfoRow icon={<TrophyOutlined />} label="Điểm cộng" value={selectedUser.plusScore} />
                <InfoRow icon={<TrophyOutlined />} label="Điểm trừ" value={selectedUser.minusScore} />
                <InfoRow icon={<UserOutlined />} label="Cập nhật" value={selectedUser.updatedDate ? new Date(selectedUser.updatedDate).toLocaleString() : "-"} />
                <InfoRow icon={<UserOutlined />} label="Vai trò" value={
                  selectedUser.role === "ADMIN" ? "Admin" 
                  : selectedUser.role === "CUSTOMER" ? "Khách hàng" 
                  : selectedUser.role === "EMPLOYEE" ? "Nhân viên"
                  : selectedUser.role === "MANAGER" ? "Quản lý"
                  : selectedUser.role === "SUPER_ADMIN" ? "Super Admin"
                  : selectedUser.role
                } />
              </div>
            </div>
          </>
        )}
      </Modal>

      {/* Modal phân quyền */}
      {/* AssignUserRole modal removed as permission feature is disabled */}
    </>
  );
};

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-center gap-2 border-b py-1 min-h-[36px]">
      <span className="text-blue-500 text-lg">{icon}</span>
      <span className="text-gray-500 text-sm font-medium w-24 flex-shrink-0">{label}</span>
      <span
        className="text-gray-800 text-base font-semibold text-right max-w-[220px] truncate"
        title={value || "-"}
      >
        {value || "-"}
      </span>
    </div>
  );
}

export default UserManagement;