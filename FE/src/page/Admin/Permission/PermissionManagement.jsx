import React, { useEffect, useState, useCallback, useRef } from "react";
import { Button, Tooltip, Modal, Input } from "antd";
import { KeyOutlined, PlusOutlined, SearchOutlined, InboxOutlined, CheckCircleOutlined, CloseCircleOutlined, TeamOutlined } from "@ant-design/icons";
import { getAllPermissions } from "../../../service/permission/index";
import RoleManagement from "./RoleManagement";
import AddRole from "./AddRole";
import { showSuccessToast, showErrorToast } from "../../../utils/toast";

const PermissionManagement = () => {
  const [loading, setLoading] = useState(false);
  const [permissions, setPermissions] = useState([]);
  const [allPermissions, setAllPermissions] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [searchText, setSearchText] = useState("");
  const searchTimeoutRef = useRef(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeTab, setActiveTab] = useState("permissions");
  const [showAddRole, setShowAddRole] = useState(false);

  // Fetch permissions
  const fetchPermissions = async ({ page = 1, pageSize = 10, search = "" } = {}) => {
    setLoading(true);
    try {
      const response = await getAllPermissions();
      if (!response.error && Array.isArray(response.result)) {
        let all = response.result;
        setAllPermissions(all);
        
        if (search) {
          all = all.filter((permission) =>
            permission.code?.toLowerCase().includes(search.toLowerCase()) ||
            permission.description?.toLowerCase().includes(search.toLowerCase())
          );
        }
        
        setPagination({
          current: page,
          pageSize: pageSize,
          total: all.length,
        });
        
        const startIdx = (page - 1) * pageSize;
        const endIdx = startIdx + pageSize;
        setPermissions(all.slice(startIdx, endIdx));
      } else {
        setPermissions([]);
        setPagination((prev) => ({ ...prev, total: 0 }));
        showErrorToast(response.message || "Không lấy được danh sách permissions");
      }
    } catch (err) {
      showErrorToast("Mất kết nối server");
      setPermissions([]);
      setPagination((prev) => ({ ...prev, total: 0 }));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  useEffect(() => {
    fetchPermissions({ page: 1, pageSize: pagination.pageSize, search: searchText });
  }, [searchText]);

  // Role management will handle its own add role functionality

  // Debounce search
  const debounceFetch = (params) => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      fetchPermissions(params);
    }, 300);
  };

  const handleSearch = (value) => {
    setSearchText(value);
    debounceFetch({ page: 1, pageSize: pagination.pageSize, search: value });
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchText(value);
    debounceFetch({ page: 1, pageSize: pagination.pageSize, search: value });
  };

  // Statistics
  const totalPermissions = allPermissions.length;
  const activePermissions = allPermissions.filter(p => p.status !== false).length;
  const inactivePermissions = allPermissions.filter(p => p.status === false).length;

  // Tabs configuration
  const tabs = [
    {
      key: "permissions",
      label: "Quản lý quyền hạn",
      icon: <KeyOutlined className="text-xl text-white" />,
      header: {
        title: "Quản lý quyền hạn",
        subtitle: "Quản lý và phân quyền hệ thống",
        bgColor: "from-blue-500 to-indigo-600",
        headerBg: "bg-blue-50",
        borderColor: "border-blue-200",
        buttonColor: "from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700",
        activeRingColor: "ring-blue-500",
        activeBorderColor: "border-blue-400"
      }
    },
    {
      key: "roles",
      label: "Quản lý vai trò",
      icon: <TeamOutlined className="text-xl text-white" />,
      header: {
        title: "Quản lý vai trò",
        subtitle: "Quản lý vai trò và phân quyền người dùng",
        bgColor: "from-pink-500 to-rose-600",
        headerBg: "bg-pink-50",
        borderColor: "border-pink-200",
        buttonColor: "from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700",
        activeRingColor: "ring-pink-500",
        activeBorderColor: "border-pink-400"
      }
    }
  ];

  const currentTab = tabs.find(tab => tab.key === activeTab);

  return (
    <>
      {/* Header Selection Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
        {tabs.map((tab) => (
          <div
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`${tab.header.headerBg} rounded-lg shadow-md border ${tab.header.borderColor} p-4 cursor-pointer transition-all duration-300 hover:shadow-lg relative ${
              activeTab === tab.key
                ? `ring-2 ${tab.header.activeRingColor} ring-opacity-50 ${tab.header.activeBorderColor} transform scale-105 z-10`
                : 'hover:scale-105 hover:z-10'
            }`}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 bg-gradient-to-br ${tab.header.bgColor} rounded-lg flex items-center justify-center shadow-md`}>
                  {tab.icon}
                </div>
                <div>
                  <h1 className="text-sm font-bold text-gray-900 line-clamp-1">{tab.header.title}</h1>
                  <p className="text-xs text-gray-600 line-clamp-1">{tab.header.subtitle}</p>
                </div>
              </div>
              
              {tab.key === "roles" && (
                <div className="flex-shrink-0">
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveTab("roles");
                      // Small delay to ensure tab switch completes
                      setTimeout(() => {
                        setShowAddRole(true);
                      }, 100);
                    }}
                    className={`bg-gradient-to-r ${tab.header.buttonColor} border-0 shadow-md hover:shadow-lg transition-all duration-300`}
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Content Area */}
      <div>
        {activeTab === "permissions" && (
          <>
            {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-3 border-2 border-blue-200 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Tổng quyền hạn</p>
              <p className="text-lg font-bold text-blue-900">{totalPermissions}</p>
            </div>
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
              <KeyOutlined className="text-white text-sm" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-3 border-2 border-green-200 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Đang hoạt động</p>
              <p className="text-lg font-bold text-green-700">{activePermissions}</p>
            </div>
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-md">
              <CheckCircleOutlined className="text-white text-sm" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-lg p-3 border-2 border-red-200 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Ngừng hoạt động</p>
              <p className="text-lg font-bold text-red-700">{inactivePermissions}</p>
            </div>
            <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-rose-600 rounded-lg flex items-center justify-center shadow-md">
              <CloseCircleOutlined className="text-white text-sm" />
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
              placeholder="Tìm kiếm theo code hoặc mô tả..."
              value={searchText}
              onChange={handleSearchChange}
              className="pl-10 w-64 h-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:outline-none text-sm shadow-sm"
              style={{ color: 'black', backgroundColor: 'white' }}
            />
          </div>
          <span className="text-lg font-bold text-blue-600 bg-white border border-blue-200 px-4 py-2 rounded-xl shadow-blue-100">
            Tổng số quyền: <span className="text-blue-500 font-extrabold">{pagination.total}</span>
          </span>
        </div>
      </div>

      {/* Permission List */}
      {permissions.length === 0 ? (
        <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-12 text-center border border-gray-200">
          <InboxOutlined className="text-6xl text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy quyền hạn nào</h3>
          <p className="text-gray-500">Thử thay đổi bộ lọc hoặc tìm kiếm khác</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
          {/* List Header */}
          <div className="bg-gradient-to-r from-blue-100 to-indigo-100 px-6 py-3 border-b border-gray-200">
            <div className="grid grid-cols-12 gap-4 text-sm font-semibold text-gray-700">
              <div className="col-span-1">#</div>
              <div className="col-span-3">Code</div>
              <div className="col-span-6">Mô tả</div>
              <div className="col-span-2">Trạng thái</div>
            </div>
          </div>

          {/* List Items */}
          <div className="divide-y divide-gray-200">
            {permissions.map((permission, index) => (
              <div
                key={permission.id}
                className="px-6 py-4 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200"
              >
                <div className="grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-1 text-sm font-medium text-gray-500">
                    {(pagination.current - 1) * pagination.pageSize + index + 1}
                  </div>
                  <div className="col-span-3">
                    <div className="flex items-center gap-2">
                      <KeyOutlined className="text-blue-600 text-sm" />
                      <span className="font-semibold text-blue-700">{permission.code}</span>
                    </div>
                  </div>
                  <div className="col-span-6">
                    <span className="text-gray-700">{permission.description || "Không có mô tả"}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-green-200 to-emerald-200 text-green-800 border border-green-300 shadow-sm">
                      Hoạt động
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
              const newPage = pagination.current - 1;
              setPagination(prev => ({ ...prev, current: newPage }));
              fetchPermissions({ page: newPage, pageSize: pagination.pageSize, search: searchText });
            }
          }}
        >
          &lt;
        </button>
        {Array.from({ length: Math.ceil(allPermissions.length / pagination.pageSize) }, (_, i) => i + 1).map(page => (
          <button
            key={page}
            className={`w-9 h-9 rounded-xl font-bold shadow transition flex items-center justify-center
              ${pagination.current === page
                ? 'bg-gradient-to-br from-blue-500 to-indigo-700 text-white scale-105'
                : 'bg-white text-blue-700 hover:bg-blue-100'}
            `}
            onClick={() => {
              setPagination(prev => ({ ...prev, current: page }));
              fetchPermissions({ page: page, pageSize: pagination.pageSize, search: searchText });
            }}
          >
            {page}
          </button>
        ))}
        <button
          className={`w-9 h-9 rounded-xl font-bold shadow transition flex items-center justify-center
            ${pagination.current === Math.ceil(allPermissions.length / pagination.pageSize) || allPermissions.length === 0
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-white text-blue-700 hover:bg-blue-100'}
          `}
          disabled={pagination.current === Math.ceil(allPermissions.length / pagination.pageSize) || allPermissions.length === 0}
          onClick={() => {
            if (pagination.current < Math.ceil(allPermissions.length / pagination.pageSize)) {
              const newPage = pagination.current + 1;
              setPagination(prev => ({ ...prev, current: newPage }));
              fetchPermissions({ page: newPage, pageSize: pagination.pageSize, search: searchText });
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
            fetchPermissions({ page: 1, pageSize: newSize, search: searchText });
          }}
        >
          {[10, 20, 50].map(size => (
            <option key={size} value={size}>{size} / page</option>
          ))}
        </select>
      </div>

          </>
        )}

        {activeTab === "roles" && (
          <>
            {/* Role Management Section */}
            <RoleManagement refreshTrigger={refreshTrigger} hideHeader={true} />
          </>
        )}
      </div>

      {/* Add Role Modal */}
      <AddRole
        visible={showAddRole}
        onCancel={() => setShowAddRole(false)}
        onSuccess={() => {
          setShowAddRole(false);
          setRefreshTrigger(prev => prev + 1);
        }}
      />
    </>
  );
};

export default PermissionManagement;
