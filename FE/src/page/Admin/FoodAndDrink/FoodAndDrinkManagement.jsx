import React, { useEffect, useState } from "react";
import { Table, Input, Tag, Image, Button, Switch, Modal, Tooltip } from "antd";
import {
  getAllFoodAndDrinks,
  createFoodAndDrink,
  setActiveFoodAndDrink,
} from "../../../service/foodanddrink";
import { showSuccessToast, showErrorToast } from "../../../utils/toast";
import { EditOutlined, DeleteOutlined, CoffeeOutlined, PlusOutlined, SearchOutlined, InboxOutlined, CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import EditFoodAndDrink from "./EditFoodAndDrink";
import DeleteFoodAndDrink from "./DeleteFoodAndDrink";
import MultiSwitch from "../Movie/Switch";
import AddFoodAndDrink from "./AddFoodAndDrink";

const { Search } = Input;

const FoodAndDrinkManagement = () => {
  const [loading, setLoading] = useState(false);
  const [foods, setFoods] = useState([]);
  const [allFoods, setAllFoods] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [switchLoading, setSwitchLoading] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editFood, setEditFood] = useState(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteFood, setDeleteFood] = useState(null);
  const [typeOptions, setTypeOptions] = useState([{ value: '', label: 'Tất cả loại' }]);

  // Pagination state
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 8,
    total: 0,
  });

  const fetchFoods = async ({ page = 1, pageSize = 8, search = searchText, type = typeFilter, status = statusFilter } = {}) => {
    setLoading(true);
    try {
      const res = await getAllFoodAndDrinks();
      if (Array.isArray(res)) {
        let all = res;
        setAllFoods(all);
        // Tạo typeOptions động
        const uniqueTypes = Array.from(new Set(all.map(f => f.type).filter(Boolean)));
        setTypeOptions([{ value: '', label: 'Tất cả loại' }, ...uniqueTypes.map(type => ({ value: type, label: type }))]);
        if (search) {
          const lower = search.toLowerCase();
          all = all.filter(
            (item) =>
              item.name?.toLowerCase().includes(lower) ||
              item.description?.toLowerCase().includes(lower)
          );
        }
        if (type && type !== "") {
          all = all.filter((item) => item.type === type);
        }
        if (typeof status === "boolean") {
          all = all.filter(item => item.active === status);
        }
        setPagination({
          current: page,
          pageSize: pageSize,
          total: all.length,
        });
        const startIdx = (page - 1) * pageSize;
        const endIdx = startIdx + pageSize;
        setFoods(all.slice(startIdx, endIdx));
      } else if (res.result) {
        let all = res.result;
        setAllFoods(all);
        // Tạo typeOptions động
        const uniqueTypes = Array.from(new Set(all.map(f => f.type).filter(Boolean)));
        setTypeOptions([{ value: '', label: 'Tất cả loại' }, ...uniqueTypes.map(type => ({ value: type, label: type }))]);
        if (search) {
          const lower = search.toLowerCase();
          all = all.filter(
            (item) =>
              item.name?.toLowerCase().includes(lower) ||
              item.description?.toLowerCase().includes(lower)
          );
        }
        if (type && type !== "") {
          all = all.filter((item) => item.type === type);
        }
        if (typeof status === "boolean") {
          all = all.filter(item => item.active === status);
        }
        setPagination({
          current: page,
          pageSize: pageSize,
          total: all.length,
        });
        const startIdx = (page - 1) * pageSize;
        const endIdx = startIdx + pageSize;
        setFoods(all.slice(startIdx, endIdx));
      } else {
        setFoods([]);
        setPagination((prev) => ({
          ...prev,
          total: 0,
        }));
        showErrorToast(res.message || "Không lấy được danh sách đồ ăn/uống!");
      }
    } catch (err) {
      setFoods([]);
      setPagination((prev) => ({
        ...prev,
        total: 0,
      }));
      showErrorToast("Mất kết nối server");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFoods();
  }, []);

  // Sửa: Luôn fetch lại dữ liệu khi thay đổi trang hoặc pageSize
  useEffect(() => {
    fetchFoods({
      page: pagination.current,
      pageSize: pagination.pageSize,
      search: searchText,
      type: typeFilter,
      status: statusFilter,
    });
    // eslint-disable-next-line
  }, [pagination.current, pagination.pageSize]);

  // Giữ lại filter khi search/type/status thay đổi, luôn về trang 1
  useEffect(() => {
    setPagination(prev => ({ ...prev, current: 1 }));
    // eslint-disable-next-line
  }, [searchText, typeFilter, statusFilter]);

  const handleAdd = async (form, resetForm) => {
    setAddLoading(true);
    const res = await createFoodAndDrink(form);
    setAddLoading(false);
    if (res.status === 200) {
      showSuccessToast(res.message);
      setAddModalVisible(false);
      fetchFoods({ page: pagination.current, pageSize: pagination.pageSize });
      resetForm && resetForm();
    } else {
      showErrorToast(res.message);
    }
  };

  const handleSwitchActive = async (record) => {
    setSwitchLoading(true);
    const res = await setActiveFoodAndDrink(record.id, !record.active);
    setSwitchLoading(false);
    if (res.status === 200) {
      showSuccessToast(res.message);
      fetchFoods({ page: pagination.current, pageSize: pagination.pageSize });
    } else {
      showErrorToast(res.message);
    }
  };

  const handleMultiSwitch = async () => {
    const foodsToUpdate =
      selectedRowKeys.length === 0
        ? foods
        : foods.filter((f) => selectedRowKeys.includes(f.id));
    if (foodsToUpdate.length === 0) return;
    
    setSwitchLoading(true);
    try {
      const results = await Promise.all(
        foodsToUpdate.map(async (item) => {
          return await setActiveFoodAndDrink(item.id, !item.active);
        })
      );
      
      const allSuccess = results.every(res => res?.status === 200);
      if (allSuccess) {
        showSuccessToast("Cập nhật trạng thái thành công!");
      } else {
        const failedResult = results.find(res => res?.status !== 200);
        showErrorToast(failedResult?.message || "Có lỗi khi cập nhật trạng thái!");
      }
      
      setSelectedRowKeys([]);
      fetchFoods({ page: pagination.current, pageSize: pagination.pageSize });
    } catch (error) {
      showErrorToast("Có lỗi khi cập nhật trạng thái!");
    } finally {
      setSwitchLoading(false);
    }
  };

  // Type filter options
  // const typeOptions = [
  //   { value: "", label: "Tất cả loại" },
  //   { value: "Đồ ăn", label: "Đồ ăn" },
  //   { value: "Nước uống", label: "Nước uống" },
  //   { value: "Combo", label: "Combo" },
  //   { value: "Khác", label: "Khác" },
  // ];

  // Statistics
  const totalFoods = allFoods.length;
  const activeFoods = allFoods.filter(f => f.active).length;
  const inactiveFoods = allFoods.filter(f => !f.active).length;

  return (
    <>
      {/* Header Section */}
      <div className="bg-blue-50 rounded-xl shadow-lg border border-blue-200 p-4 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <CoffeeOutlined className="text-xl text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Quản lý đồ ăn & nước uống</h1>
              <p className="text-sm text-gray-600">Quản lý thông tin và trạng thái đồ ăn/uống</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setAddModalVisible(true)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 border-0 h-10 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Thêm đồ ăn/uống
            </Button>
          </div>
        </div>
      </div>

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
              <p className="text-xs font-medium text-gray-600">Tổng đồ ăn/uống</p>
              <p className="text-lg font-bold text-blue-900">{totalFoods}</p>
            </div>
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
              <CoffeeOutlined className="text-white text-sm" />
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
              <p className="text-xs font-medium text-gray-600">Đang bán</p>
              <p className="text-lg font-bold text-green-700">{activeFoods}</p>
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
              <p className="text-xs font-medium text-gray-600">Ngừng bán</p>
              <p className="text-lg font-bold text-red-700">{inactiveFoods}</p>
            </div>
            <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-rose-600 rounded-lg flex items-center justify-center shadow-md">
              <CloseCircleOutlined className="text-white text-sm" />
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      <div className="flex items-center justify-between gap-4 mb-4 p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg border border-gray-200">
        <div className="flex items-center gap-4">
          <MultiSwitch
            checked={selectedRowKeys.length === 0 ? foods.every(f => f.active) : foods.filter(f => selectedRowKeys.includes(f.id)).every(f => f.active)}
            onChange={handleMultiSwitch}
            loading={switchLoading}
            checkedChildren="Bật"
            unCheckedChildren="Tắt"
          />
          <span className="text-sm text-gray-600">
            {selectedRowKeys.length === 0
              ? "Bật/Tắt trạng thái tất cả đồ ăn/uống"
              : `Bật/Tắt ${selectedRowKeys.length} đồ ăn/uống đã chọn`}
          </span>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              checked={foods.length > 0 && foods.every(f => selectedRowKeys.includes(f.id))}
              ref={el => {
                if (el) {
                  el.indeterminate = foods.length > 0 && selectedRowKeys.length > 0 && selectedRowKeys.length < foods.length;
                }
              }}
              onChange={e => {
                if (e.target.checked) {
                  setSelectedRowKeys(foods.map(f => f.id));
                } else {
                  setSelectedRowKeys([]);
                }
              }}
              disabled={loading || foods.length === 0}
            />
            <span className="text-sm text-gray-600">Chọn tất cả</span>
          </label>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <SearchOutlined className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />
            <input
              placeholder="Tìm kiếm tên hoặc mô tả..."
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              className="pl-10 w-48 h-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:outline-none text-sm shadow-sm"
              style={{
                paddingLeft: '40px',
                color: 'black',
                backgroundColor: 'white',
              }}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 font-medium whitespace-nowrap">Loại:</span>
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="w-48 h-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:outline-none text-sm shadow-sm"
              style={{
                color: 'black',
                backgroundColor: 'white',
              }}
            >
              {typeOptions.map((option) => (
                <option key={option.value} value={option.value} style={{ color: 'black', backgroundColor: 'white' }}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Food Cards */}
      {foods.length === 0 ? (
        <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-12 text-center border border-gray-200">
          <InboxOutlined className="text-6xl text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy đồ ăn/uống nào</h3>
          <p className="text-gray-500">Thử thay đổi bộ lọc hoặc thêm đồ ăn/uống mới</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {foods.map((item) => {
            const isSelected = selectedRowKeys.includes(item.id);
            return (
              <div
                key={item.id}
                className={`bg-gradient-to-br from-white via-blue-50 to-indigo-100 rounded-lg border-2 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] relative overflow-hidden ${
                  isSelected ? 'border-blue-500 shadow-lg scale-[1.02] bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 z-10' : 'border-gray-200 hover:border-blue-300 hover:z-10'
                }`}
                onClick={() => {
                  if (!loading) {
                    setSelectedRowKeys(prev =>
                      prev.includes(item.id)
                        ? prev.filter(id => id !== item.id)
                        : [...prev, item.id]
                    );
                  }
                }}
              >
                {/* Checkbox and Status */}
                <div className="p-2 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-100 to-indigo-100">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={e => {
                      e.stopPropagation();
                      setSelectedRowKeys(prev =>
                        prev.includes(item.id)
                          ? prev.filter(id => id !== item.id)
                          : [...prev, item.id]
                      );
                    }}
                    onClick={e => e.stopPropagation()}
                    className="w-3 h-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500 pointer-events-auto z-10 relative"
                    disabled={loading}
                  />
                  <div className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${
                    item.active 
                      ? 'bg-gradient-to-r from-green-200 to-emerald-200 text-green-800 border border-green-300 shadow-sm' 
                      : 'bg-gradient-to-r from-red-200 to-rose-200 text-red-800 border border-red-300 shadow-sm'
                  }`}>
                    {item.active ? 'Đang bán' : 'Ngừng bán'}
                  </div>
                </div>

                {/* Food Info */}
                <div className="p-4 bg-gradient-to-br from-white to-blue-50">
                  {/* Image and Name */}
                  <div className="flex items-center gap-3 mb-3">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover border-2 border-gray-200 shadow-md" />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
                        <CoffeeOutlined className="text-white" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900 line-clamp-1">{item.name}</h3>
                      <p className="text-sm text-gray-500">{item.description || "Không có mô tả"}</p>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Loại:</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        item.type?.toLowerCase().includes("nước") 
                          ? 'bg-gradient-to-r from-blue-200 to-indigo-200 text-blue-800 border border-blue-300 shadow-sm' 
                          : item.type?.toLowerCase().includes("ăn")
                          ? 'bg-gradient-to-r from-yellow-200 to-amber-200 text-yellow-800 border border-yellow-300 shadow-sm'
                          : 'bg-gradient-to-r from-orange-200 to-red-200 text-orange-800 border border-orange-300 shadow-sm'
                      }`}>
                        {item.type || "Khác"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Giá:</span>
                      <span className="text-orange-700 font-bold">{item.price ? item.price.toLocaleString() + " đ" : "-"}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1">
                    <Tooltip title="Chỉnh sửa">
                      <Button
                        size="small"
                        icon={<EditOutlined className="text-green-600" />}
                        onClick={e => { e.stopPropagation(); setEditFood(item); setEditModalVisible(true); }}
                        className="flex-1 border-green-300 text-green-700 hover:border-green-400 hover:text-green-800 shadow-sm bg-gradient-to-r from-green-100 to-emerald-100"
                      />
                    </Tooltip>
                    <Tooltip title="Xóa">
                      <Button
                        size="small"
                        icon={<DeleteOutlined className="text-red-600" />}
                        onClick={e => { e.stopPropagation(); setDeleteFood(item); setDeleteModalVisible(true); }}
                        className="flex-1 border-red-300 text-red-700 hover:border-red-400 hover:text-red-800 shadow-sm bg-gradient-to-r from-red-100 to-rose-100"
                      />
                    </Tooltip>
                  </div>

                  {/* Status Toggle */}
                  <div className="mt-3 pt-3 border-t border-gray-200 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg p-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">Trạng thái:</span>
                      <MultiSwitch
                        checked={item.active}
                        checkedChildren="Bật"
                        unCheckedChildren="Tắt"
                        loading={switchLoading}
                        onChange={() => handleSwitchActive(item)}
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
        {Array.from({ length: Math.ceil(pagination.total / pagination.pageSize) }, (_, i) => i + 1).map(page => (
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
            ${pagination.current === Math.ceil(pagination.total / pagination.pageSize) || pagination.total === 0
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-white text-blue-700 hover:bg-blue-100'}
          `}
          disabled={pagination.current === Math.ceil(pagination.total / pagination.pageSize) || pagination.total === 0}
          onClick={() => {
            if (pagination.current < Math.ceil(pagination.total / pagination.pageSize)) {
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
      <AddFoodAndDrink
        visible={addModalVisible}
        onOk={handleAdd}
        onCancel={() => setAddModalVisible(false)}
        confirmLoading={addLoading}
      />
      
      <EditFoodAndDrink
        visible={editModalVisible}
        food={editFood}
        onSuccess={() => fetchFoods({ page: pagination.current, pageSize: pagination.pageSize })}
        onClose={() => setEditModalVisible(false)}
      />
      
      <DeleteFoodAndDrink
        visible={deleteModalVisible}
        food={deleteFood}
        onSuccess={() => fetchFoods({ page: pagination.current, pageSize: pagination.pageSize })}
        onClose={() => setDeleteModalVisible(false)}
      />
      
    </>
  );
};

export default FoodAndDrinkManagement;