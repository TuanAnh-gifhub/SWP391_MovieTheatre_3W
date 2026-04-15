import React, { useEffect, useState } from "react";
import { Button, Space, Tooltip, Modal, Input, Tag, Spin } from "antd";
import { PlusOutlined, EditOutlined, TrophyOutlined, InboxOutlined, SearchOutlined, CheckCircleOutlined, CloseCircleOutlined, CrownOutlined, GiftOutlined, DeleteOutlined } from "@ant-design/icons";
import { getAllLoyaltyTiers, toggleLoyaltyStatus, getAllLoyaltyRules, toggleLoyaltyRuleStatus, deleteLoyaltyTier, deleteLoyaltyRule } from "../../../service/loyalty";
import AddLoyalty from "./AddLoyalty";
import EditLoyalty from "./EditLoyalty";
import MultiSwitch from "../Movie/Switch";
import { showSuccessToast, showErrorToast } from "../../../utils/toast";
import AddLoyaltySetPrice from "./AddLoyaltySetPrice";
import EditLoyaltySetPrice from "./EditLoyaltySetPrice";

const { Search } = Input;

const LoyaltyManagement = () => {
  const [tiers, setTiers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [switchLoading, setSwitchLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedTier, setSelectedTier] = useState(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editTier, setEditTier] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 8,
    total: 0,
  });
  const [rules, setRules] = useState([]);
  const [loadingRules, setLoadingRules] = useState(false);
  const [addRuleVisible, setAddRuleVisible] = useState(false);
  const [switchRuleLoading, setSwitchRuleLoading] = useState(false);
  const [editRuleVisible, setEditRuleVisible] = useState(false);
  const [editRule, setEditRule] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const [allTiers, setAllTiers] = useState([]);
  const [loadingTierId, setLoadingTierId] = useState(null);
  const [loadingRuleId, setLoadingRuleId] = useState(null);
  const [activeTab, setActiveTab] = useState("tiers");
  const [rulesPagination, setRulesPagination] = useState({
    current: 1,
    pageSize: 8,
    total: 0,
  });

  // Fetch loyalty tiers
  const fetchTiers = async ({ page = 1, pageSize = 8, search = searchText, status = statusFilter } = {}) => {
    setLoading(true);
    try {
    const res = await getAllLoyaltyTiers();
      if (res && res.status === 200 && Array.isArray(res.result)) {
        let all = res.result;
        setAllTiers(all);
        
        // Filter by search
        if (search) {
          all = all.filter(tier => 
            tier.name?.toLowerCase().includes(search.toLowerCase())
          );
        }
        
        // Filter by status
        if (typeof status === "boolean") {
          all = all.filter(tier => tier.isActive === status);
        }
        
        setPagination({
          current: page,
          pageSize: pageSize,
          total: all.length,
        });
        
        const startIdx = (page - 1) * pageSize;
        const endIdx = startIdx + pageSize;
        setTiers(all.slice(startIdx, endIdx));
    } else {
        if (res?.message) showErrorToast(res.message);
        else showErrorToast("Mất kết nối server");
        setTiers([]);
        setPagination(prev => ({ ...prev, total: 0 }));
      }
    } catch (err) {
      showErrorToast(err?.response?.data?.message || err?.message || "Mất kết nối server");
      setTiers([]);
      setPagination(prev => ({ ...prev, total: 0 }));
    }
    setLoading(false);
  };

  // Fetch loyalty rules
  const fetchRules = async ({ page = 1, pageSize = 8 } = {}) => {
    setLoadingRules(true);
    try {
    const res = await getAllLoyaltyRules();
      if (res && res.status === 200 && Array.isArray(res.result)) {
        let all = res.result;
        
        setRulesPagination({
          current: page,
          pageSize: pageSize,
          total: all.length,
        });
        
        const startIdx = (page - 1) * pageSize;
        const endIdx = startIdx + pageSize;
        setRules(all.slice(startIdx, endIdx));
    } else {
        if (res?.message) showErrorToast(res.message);
        else showErrorToast("Mất kết nối server");
        setRules([]);
        setRulesPagination(prev => ({ ...prev, total: 0 }));
      }
    } catch (err) {
      showErrorToast(err?.response?.data?.message || err?.message || "Mất kết nối server");
      setRules([]);
      setRulesPagination(prev => ({ ...prev, total: 0 }));
    }
    setLoadingRules(false);
  };

  useEffect(() => {
    fetchTiers();
    fetchRules();
  }, []);

  useEffect(() => {
    fetchTiers({
      page: pagination.current,
      pageSize: pagination.pageSize,
      search: searchText,
      status: statusFilter
    });
  }, [pagination.current, pagination.pageSize]);

  useEffect(() => {
    fetchRules({ page: rulesPagination.current, pageSize: rulesPagination.pageSize });
  }, [rulesPagination.current, rulesPagination.pageSize]);

  // Handle switch toggle
  const handleSwitch = async (tier) => {
    setLoadingTierId(tier.id);
    try {
    const res = await toggleLoyaltyStatus([tier.id]);
      if (res && res.status === 200) {
        showSuccessToast(res.message || "Cập nhật trạng thái thành công!");
        fetchTiers({ page: pagination.current, pageSize: pagination.pageSize });
    } else {
        showErrorToast(res.message || "Cập nhật trạng thái thất bại!");
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Cập nhật trạng thái thất bại";
      showErrorToast(msg);
    } finally {
      setLoadingTierId(null);
    }
  };

  // Xử lý bật/tắt trạng thái quy tắc tích điểm & đổi điểm
  const handleSwitchRule = async (rule) => {
    setLoadingRuleId(rule.id);
    try {
      // Nếu đang bật quy tắc này, thì tắt tất cả quy tắc khác trước
      if (!rule.isActive) {
        // Tắt tất cả quy tắc khác
        const otherRules = rules.filter(r => r.id !== rule.id);
        const turnOffPromises = otherRules.map(async (otherRule) => {
          if (otherRule.isActive) {
            return await toggleLoyaltyRuleStatus(otherRule.id);
          }
          return null;
        });
        
        // Chờ tất cả quy tắc khác tắt xong
        await Promise.all(turnOffPromises.filter(p => p !== null));
      }
      
      // Sau đó bật/tắt quy tắc hiện tại
    const res = await toggleLoyaltyRuleStatus(rule.id);
      
              if (res && res.status === 200) {
          showSuccessToast(res.message || "Cập nhật trạng thái thành công!");
          fetchRules({ page: rulesPagination.current, pageSize: rulesPagination.pageSize });
    } else {
          showErrorToast(res.message || "Cập nhật trạng thái thất bại!");
        }
    } catch (error) {
      const msg = error?.response?.data?.message || error?.message || "Có lỗi khi cập nhật trạng thái quy tắc";
      showErrorToast(msg);
    } finally {
      setLoadingRuleId(null);
    }
  };

  // Xử lý xóa tier
  const [deleting, setDeleting] = useState(false);
  const handleDeleteTier = async () => {
    if (!selectedTier) return;
    setDeleting(true);
    const res = await deleteLoyaltyTier(selectedTier.id);
    setDeleting(false);
    setDeleteModalVisible(false);
    if (res.status === 200) {
      showSuccessToast(res.message || "Xóa thành công!");
      fetchTiers({ page: pagination.current, pageSize: pagination.pageSize });
    } else {
      showErrorToast(res.message || "Xóa thất bại!");
    }
  }; 
  // Xử lý xóa rule
  const [deletingRule, setDeletingRule] = useState(false);
  const [selectedRule, setSelectedRule] = useState(null);
  const [deleteRuleModalVisible, setDeleteRuleModalVisible] = useState(false);

  const handleDeleteRule = async () => {
    if (!selectedRule) return;
    setDeletingRule(true);
    const res = await deleteLoyaltyRule(selectedRule.id);
    setDeletingRule(false);
    setDeleteRuleModalVisible(false);
    setSelectedRule(null);
    if (res.status === 200) {
      showSuccessToast(res.message || "Xóa thành công!");
      fetchRules({ page: rulesPagination.current, pageSize: rulesPagination.pageSize });
    } else {
      showErrorToast(res.message || "Xóa thất bại!");
    }
  };

  // Statistics
  const totalTiers = allTiers.length;
  const activeTiers = allTiers.filter(t => t.isActive).length;
  const inactiveTiers = allTiers.filter(t => !t.isActive).length;

  // Tabs configuration
  const tabs = [
    {
      key: "tiers",
      label: "Quản lý xếp hạng thành viên",
      icon: <TrophyOutlined className="text-xl text-white" />,
      header: {
        title: "Quản lý xếp hạng thành viên",
        subtitle: "Quản lý hạng thành viên và quy tắc tích điểm",
        bgColor: "from-blue-500 to-indigo-600",
        headerBg: "bg-blue-50",
        borderColor: "border-blue-200",
        buttonColor: "from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700",
        activeRingColor: "ring-blue-500",
        activeBorderColor: "border-blue-400"
      }
    },
    {
      key: "rules",
      label: "Quy tắc tích điểm & đổi điểm",
      icon: <GiftOutlined className="text-xl text-white" />,
      header: {
        title: "Quy tắc tích điểm & đổi điểm",
        subtitle: "Quản lý quy tắc tích điểm và đổi điểm (chỉ 1 quy tắc được bật tại một thời điểm)",
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

  // Function to handle add button clicks
  const handleAddClick = (e, tabKey) => {
    e.stopPropagation();
    
    // Switch to the tab first, then open modal
    setActiveTab(tabKey);
    
    // Small delay to ensure tab switch completes
    setTimeout(() => {
      switch (tabKey) {
        case "tiers":
          setAddModalVisible(true);
          break;
        case "rules":
          setAddRuleVisible(true);
          break;
        default:
          break;
      }
    }, 100);
  };

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

              <div className="flex-shrink-0">
          <Button
            type="primary"
            icon={<PlusOutlined />}
                  size="small"
                  onClick={(e) => handleAddClick(e, tab.key)}
                  className={`bg-gradient-to-r ${tab.header.buttonColor} border-0 shadow-md hover:shadow-lg transition-all duration-300`}
                />
              </div>
        </div>
          </div>
        ))}
      </div>

      {/* Content Area */}
      <div>
        {activeTab === "tiers" && (
          <>
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
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
                    <p className="text-xs font-medium text-gray-600">Tổng hạng thành viên</p>
                    <p className="text-lg font-bold text-blue-900">{totalTiers}</p>
                  </div>
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                    <TrophyOutlined className="text-white text-sm" />
                  </div>
                </div>
              </div>
              
              <div 
                className={`bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-3 border-2 transition-all duration-300 cursor-pointer hover:shadow-lg hover:scale-[1.02] relative ${
                  statusFilter === true 
                    ? 'border-green-500 shadow-lg scale-[1.02] z-10' 
                    : 'border-gray-200 hover:border-green-300 hover:z-10'
                }`}
                onClick={() => setStatusFilter(statusFilter === true ? null : true)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-600">Hoạt động</p>
                    <p className="text-lg font-bold text-green-700">{activeTiers}</p>
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
                onClick={() => setStatusFilter(statusFilter === false ? null : false)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-600">Ngừng hoạt động</p>
                    <p className="text-lg font-bold text-red-700">{inactiveTiers}</p>
                  </div>
                  <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-rose-600 rounded-lg flex items-center justify-center shadow-md">
                    <CloseCircleOutlined className="text-white text-sm" />
                  </div>
                </div>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="flex items-center justify-between gap-4 mb-4 p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-4 ml-auto">
                <div className="relative">
                  <SearchOutlined className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />
                  <input
                    placeholder="Tìm kiếm tên hạng..."
                    value={searchText}
                    onChange={e => setSearchText(e.target.value)}
                    className="pl-10 w-64 h-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:outline-none text-sm shadow-sm"
                    style={{ color: 'black', backgroundColor: 'white' }}
                  />
                </div>
              </div>
            </div>

            {/* Tiers Cards */}
            {tiers.length === 0 ? (
              <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-12 text-center border border-gray-200">
                <InboxOutlined className="text-6xl text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy hạng thành viên nào</h3>
                <p className="text-gray-500">Thêm hạng thành viên mới để bắt đầu</p>
          </div>
        ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {tiers.map((tier) => (
                  <div
                    key={tier.id}
                    className="bg-gradient-to-br from-white via-blue-50 to-indigo-100 rounded-xl border-2 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] relative overflow-hidden border-gray-200 hover:border-blue-300"
                  >
                    {/* Header */}
                    <div className="p-3 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-100 to-indigo-100">
                      <div className="flex items-center gap-2">
                        <CrownOutlined className="text-blue-600" />
                        <span className="font-bold text-blue-700">{tier.name}</span>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        tier.isActive 
                          ? 'bg-gradient-to-r from-green-200 to-emerald-200 text-green-800 border border-green-300 shadow-sm' 
                          : 'bg-gradient-to-r from-red-200 to-rose-200 text-red-800 border border-red-300 shadow-sm'
                      }`}>
                        {tier.isActive ? 'Hoạt động' : 'Ngừng'}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-3 bg-gradient-to-br from-white to-blue-50">
                      {/* Tier Info */}
                      <div className="space-y-2 mb-3">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">Điểm đạt:</span>
                          <span className="text-blue-700 font-bold">{tier.pointThreshold?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">Giảm giá:</span>
                          <span className="text-green-700 font-bold">{tier.discountPercent}%</span>
                        </div>
                        {tier.rankLink && (
                          <div className="flex justify-center mt-2">
                            <img 
                              src={tier.rankLink} 
                              alt={tier.name}
                              className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                              onError={e => {
                                e.target.src = "https://via.placeholder.com/48x48?text=Rank";
                              }}
                            />
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-1 mb-2">
                        <Tooltip title="Chỉnh sửa">
                          <Button
                            size="small"
                            icon={<EditOutlined className="text-blue-600" />}
                            onClick={() => {
                              setEditTier(tier);
                              setEditModalVisible(true);
                            }}
                            className="flex-1 border-blue-300 text-blue-700 hover:border-blue-400 hover:text-blue-800 shadow-sm bg-gradient-to-r from-blue-100 to-indigo-100"
                          />
                        </Tooltip>
                        <Tooltip title="Xóa">
                          <Button
                            size="small"
                            icon={<DeleteOutlined className="text-red-600" />}
                            onClick={() => {
                              setSelectedTier(tier);
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
                            checked={tier.isActive}
                            checkedChildren="Bật"
                            unCheckedChildren="Tắt"
                            loading={loadingTierId === tier.id}
                            onChange={() => handleSwitch(tier)}
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
              {Array.from({ length: Math.ceil(allTiers.length / pagination.pageSize) }, (_, i) => i + 1).map(page => (
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
                  ${pagination.current === Math.ceil(allTiers.length / pagination.pageSize) || allTiers.length === 0
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-blue-700 hover:bg-blue-100'}
                `}
                disabled={pagination.current === Math.ceil(allTiers.length / pagination.pageSize) || allTiers.length === 0}
                onClick={() => {
                  if (pagination.current < Math.ceil(allTiers.length / pagination.pageSize)) {
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
          </>
        )}

        {activeTab === "rules" && (
          <>
            {/* Rules Cards */}
            <div className="mb-3 p-3 bg-gradient-to-br from-pink-50 to-rose-50 rounded-lg border border-pink-200">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-4 h-4 bg-gradient-to-br from-pink-500 to-rose-600 rounded-lg flex items-center justify-center">
                  <TrophyOutlined className="text-white text-xs" />
                </div>
                <p className="text-xs font-medium text-gray-700">Lưu ý: Chỉ 1 quy tắc được bật tại một thời điểm. Khi bật quy tắc mới, tất cả quy tắc khác sẽ tự động tắt.</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {rules.map((rule) => (
                <div
                  key={rule.id}
                  className="bg-gradient-to-br from-white via-pink-50 to-rose-100 rounded-xl border-2 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] relative overflow-hidden border-gray-200 hover:border-pink-300"
                >
                  {/* Header */}
                  <div className="p-3 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-pink-100 to-rose-100">
                    <div className="flex items-center gap-2">
                      <TrophyOutlined className="text-pink-600" />
                      <span className="font-bold text-pink-700">Quy tắc #{rule.id}</span>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      rule.isActive 
                        ? 'bg-gradient-to-r from-green-200 to-emerald-200 text-green-800 border border-green-300 shadow-sm' 
                        : 'bg-gradient-to-r from-red-200 to-rose-200 text-red-800 border border-red-300 shadow-sm'
                    }`}>
                      {rule.isActive ? 'Hoạt động' : 'Ngừng'}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-3 bg-gradient-to-br from-white to-pink-50">
                    {/* Rule Info */}
                    <div className="space-y-2 mb-3">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Số tiền / vé:</span>
                        <span className="text-pink-700 font-bold">{rule.amountMoney?.toLocaleString()} đ</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Điểm tích / vé:</span>
                        <span className="text-green-700 font-bold">{rule.pointsEarn}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Tiền quy đổi / điểm:</span>
                        <span className="text-purple-700 font-bold">{rule.returnMoney?.toLocaleString()} đ</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1 mb-2">
                      <Tooltip title="Chỉnh sửa">
                        <Button
                          size="small"
                          icon={<EditOutlined className="text-pink-600" />}
                          onClick={() => {
                            setEditRule(rule);
                            setEditRuleVisible(true);
                          }}
                          className="flex-1 border-pink-300 text-pink-700 hover:border-pink-400 hover:text-pink-800 shadow-sm bg-gradient-to-r from-pink-100 to-rose-100"
                        />
                      </Tooltip>
                      <Tooltip title="Xóa">
                        <Button
                          size="small"
                          icon={<DeleteOutlined className="text-red-600" />}
                          onClick={() => {
                            setSelectedRule(rule);
                            setDeleteRuleModalVisible(true);
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
                          checked={rule.isActive}
                          checkedChildren="Bật"
                          unCheckedChildren="Tắt"
                          loading={loadingRuleId === rule.id}
                          onChange={() => handleSwitchRule(rule)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {rules.length === 0 && (
              <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-12 text-center border border-gray-200">
                <InboxOutlined className="text-6xl text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy quy tắc nào</h3>
                <p className="text-gray-500">Thêm quy tắc mới để bắt đầu</p>
              </div>
            )}

            {/* Custom Pagination for Rules */}
            <div className="flex flex-wrap justify-end items-center gap-2 mt-4">
              <button
                className={`w-9 h-9 rounded-xl font-bold shadow transition flex items-center justify-center
                  ${rulesPagination.current === 1
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-pink-700 hover:bg-pink-100'}
                `}
                disabled={rulesPagination.current === 1}
                onClick={() => {
                  if (rulesPagination.current > 1) {
                    setRulesPagination(prev => ({ ...prev, current: prev.current - 1 }));
                  }
                }}
              >
                &lt;
              </button>
              {Array.from({ length: Math.ceil(rulesPagination.total / rulesPagination.pageSize) }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  className={`w-9 h-9 rounded-xl font-bold shadow transition flex items-center justify-center
                    ${rulesPagination.current === page
                      ? 'bg-gradient-to-br from-pink-500 to-rose-700 text-white scale-105'
                      : 'bg-white text-pink-700 hover:bg-pink-100'}
                  `}
                  onClick={() => setRulesPagination(prev => ({ ...prev, current: page }))}
                >
                  {page}
                </button>
              ))}
              <button
                className={`w-9 h-9 rounded-xl font-bold shadow transition flex items-center justify-center
                  ${rulesPagination.current === Math.ceil(rulesPagination.total / rulesPagination.pageSize) || rulesPagination.total === 0
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-pink-700 hover:bg-pink-100'}
                `}
                disabled={rulesPagination.current === Math.ceil(rulesPagination.total / rulesPagination.pageSize) || rulesPagination.total === 0}
                onClick={() => {
                  if (rulesPagination.current < Math.ceil(rulesPagination.total / rulesPagination.pageSize)) {
                    setRulesPagination(prev => ({ ...prev, current: prev.current + 1 }));
                  }
                }}
              >
                &gt;
              </button>
              <select
                className="ml-4 rounded-lg border px-2 py-1 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition bg-white text-pink-700 border-pink-200"
                value={rulesPagination.pageSize}
                onChange={e => {
                  const newSize = Number(e.target.value);
                  setRulesPagination(prev => ({ ...prev, pageSize: newSize, current: 1 }));
                }}
              >
                {[8, 16, 32].map(size => (
                  <option key={size} value={size}>{size} / page</option>
                ))}
              </select>
            </div>
          </>
        )}
      </div>

      {/* Modals */}
        <AddLoyalty
        visible={addModalVisible}
          onSuccess={() => {
            setAddModalVisible(false);
          fetchTiers({ page: pagination.current, pageSize: pagination.pageSize });
          }}
          onClose={() => setAddModalVisible(false)}
        />
      
      <Modal
        title="Xác nhận xóa"
        open={deleteModalVisible}
        onOk={handleDeleteTier}
        onCancel={() => setDeleteModalVisible(false)}
        okText="Xóa"
        cancelText="Hủy"
        okButtonProps={{ danger: true, loading: deleting }}
        className="!rounded-2xl"
      >
        <p>
          Bạn có chắc chắn muốn xóa hạng "{selectedTier?.name}"?
        </p>
        <p className="text-red-500 font-medium">
          Hành động này không thể hoàn tác.
        </p>
      </Modal>
      
      <EditLoyalty
        visible={editModalVisible}
        tier={editTier}
        onSuccess={() => {
          setEditModalVisible(false);
          fetchTiers({ page: pagination.current, pageSize: pagination.pageSize });
        }}
        onClose={() => setEditModalVisible(false)}
      />

      <AddLoyaltySetPrice
        visible={addRuleVisible}
        onSuccess={() => {
          setAddRuleVisible(false);
          fetchRules({ page: rulesPagination.current, pageSize: rulesPagination.pageSize });
        }}
        onClose={() => setAddRuleVisible(false)}
      />
      
      <EditLoyaltySetPrice
        visible={editRuleVisible}
        rule={editRule}
        onSuccess={() => {
          setEditRuleVisible(false);
          fetchRules({ page: rulesPagination.current, pageSize: rulesPagination.pageSize });
        }}
        onClose={() => setEditRuleVisible(false)}
      />

      <Modal
        title="Xác nhận xóa"
        open={deleteRuleModalVisible}
        onOk={handleDeleteRule}
        onCancel={() => {
          setDeleteRuleModalVisible(false);
          setSelectedRule(null);
        }}
        okText="Xóa"
        cancelText="Hủy"
        okButtonProps={{ danger: true, loading: deletingRule }}
        className="!rounded-2xl"
      >
        <p>
          Bạn có chắc chắn muốn xóa quy tắc tích điểm & đổi điểm #{selectedRule?.id}?
        </p>
        <p className="text-red-500 font-medium">
          Hành động này không thể hoàn tác.
        </p>
      </Modal>
    </>
  );
};

export default LoyaltyManagement;