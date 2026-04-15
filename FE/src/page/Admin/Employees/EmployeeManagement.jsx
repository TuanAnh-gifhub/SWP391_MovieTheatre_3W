import React, { useEffect, useState } from "react";
import { Table, Button, Tooltip, Input, Modal, Select } from "antd";
import { PlusOutlined, EditOutlined, UserOutlined, TeamOutlined, EyeOutlined, InboxOutlined, KeyOutlined, DeleteOutlined, SearchOutlined, FilterOutlined, CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { getAllEmployees, setActiveEmployee, deleteEmployee } from "../../../service/employee/index";
import AddEmployee from "./AddEmployee";
import EditEmployee from "./EditEmployee";
import AssignRole from "../Permission/AssignRole";
import { showSuccessToast, showErrorToast } from "../../../utils/toast";
import MultiSwitch from "../Movie/Switch";

const EmployeeManagement = () => {
  const [departmentOptions, setDepartmentOptions] = useState([
    { value: "All", label: "Tất cả phòng ban" }
  ]);
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 8,
    total: 0,
  });
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editEmployee, setEditEmployee] = useState(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [switchLoading, setSwitchLoading] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const [theme, setTheme] = useState(document.body.getAttribute('data-theme') || 'light');
  const [showAssignRole, setShowAssignRole] = useState(false);
  const [employeeToAssignRole, setEmployeeToAssignRole] = useState(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setTheme(document.body.getAttribute('data-theme') || 'light');
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  const fetchEmployees = async ({ page = 1, pageSize = 8, search = searchText, department = departmentFilter, status = statusFilter } = {}) => {
    setLoading(true);
    try {
      const res = await getAllEmployees();
      if (res && Array.isArray(res.result?.data)) {
        let all = res.result.data;
        setAllEmployees(all);
        
        // Tạo danh sách phòng ban động từ dữ liệu thực tế
        const uniqueDepartments = [...new Set(all.map(emp => emp.department).filter(dept => dept))];
        const dynamicDepartmentOptions = [
          { value: "All", label: "Tất cả phòng ban" },
          ...uniqueDepartments.map(dept => ({ value: dept, label: dept }))
        ];
        setDepartmentOptions(dynamicDepartmentOptions);
        
        if (search) {
          const lower = search.toLowerCase();
          all = all.filter(
            (emp) =>
              emp.fullName?.toLowerCase().includes(lower) ||
              emp.phone?.toLowerCase().includes(lower) ||
              emp.identityCard?.toLowerCase().includes(lower)
          );
        }
        if (department && department !== "All") {
          all = all.filter((emp) => emp.department === department);
        }
        if (typeof status === "boolean") {
          all = all.filter(emp => emp.status === status);
        }
        setPagination({
          current: page,
          pageSize: pageSize,
          total: all.length,
        });
        const startIdx = (page - 1) * pageSize;
        const endIdx = startIdx + pageSize;
        setEmployees(all.slice(startIdx, endIdx));
      } else {
        if (res?.message) showErrorToast(res.message);
        else showErrorToast("Mất kết nối server");
      }
    } catch (err) {
      showErrorToast("Mất kết nối server");
    }
    setLoading(false);
  };

  useEffect(() => { fetchEmployees(); }, []);
  useEffect(() => {
    fetchEmployees({ page: 1, pageSize: pagination.pageSize, search: searchText, department: departmentFilter, status: statusFilter });
  }, [searchText, departmentFilter, statusFilter]);

  const handleTableChange = (newPagination) => {
    fetchEmployees({
      page: newPagination.current,
      pageSize: newPagination.pageSize,
    });
  };

  const showDeleteConfirm = (employee) => {
    setEmployeeToDelete(employee);
    setDeleteModalVisible(true);
  };

  const handleDeleteConfirm = async () => {
    if (!employeeToDelete) return;

    try {
      setLoading(true);
      const response = await deleteEmployee(employeeToDelete.employeeID);

      if (response.success) {
        await fetchEmployees({
          page: pagination.current,
          pageSize: pagination.pageSize,
        });
        showSuccessToast(response.message || "Xóa nhân viên thành công!");
      } else {
        showErrorToast(response.message || "Xóa nhân viên thất bại");
      }
    } catch (error) {
      showErrorToast("Xóa nhân viên thất bại");
    } finally {
      setLoading(false);
      setDeleteModalVisible(false);
      setEmployeeToDelete(null);
    }
  };

  const total = allEmployees.length;
  const active = allEmployees.filter(e => e.status).length;
  const inactive = allEmployees.filter(e => !e.status).length;

  const handleMultiSwitch = async () => {
    const employeesToUpdate =
      selectedRowKeys.length === 0
        ? employees
        : employees.filter((e) => selectedRowKeys.includes(e.employeeID));
    if (employeesToUpdate.length === 0) return;
    const ids = employeesToUpdate.map((e) => e.employeeID);
    try {
      setLoading(true);
      const results = await Promise.all(
        ids.map(async (id) => {
          const emp = employees.find((e) => e.employeeID === id);
          return await setActiveEmployee(id, !emp.status);
        })
      );
      
      // Check if all operations were successful
      const allSuccess = results.every(res => res?.success);
      if (allSuccess) {
        showSuccessToast("Cập nhật trạng thái thành công!");
      } else {
        // Show error message from first failed operation
        const failedResult = results.find(res => !res?.success);
        showErrorToast(failedResult?.message || "Có lỗi khi cập nhật trạng thái!");
      }
      
      setSelectedRowKeys([]);
      fetchEmployees(pagination);
    } catch (error) {
      showErrorToast("Có lỗi khi cập nhật trạng thái!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Header Section */}
      <div className="bg-blue-50 rounded-xl shadow-lg border border-blue-200 p-4 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <TeamOutlined className="text-xl text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Quản lý nhân viên</h1>
              <p className="text-sm text-gray-600">Quản lý thông tin và phân quyền nhân viên</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setShowAdd(true)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 border-0 h-10 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Thêm nhân viên
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
              <p className="text-xs font-medium text-gray-600">Tổng nhân viên</p>
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
          onClick={() => setStatusFilter(statusFilter === true ? null : true)}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Đang làm việc</p>
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
          onClick={() => setStatusFilter(statusFilter === false ? null : false)}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Nghỉ việc</p>
              <p className="text-lg font-bold text-red-700">{inactive}</p>
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
            checked={selectedRowKeys.length === 0 ? employees.every(e => e.status) : employees.filter(e => selectedRowKeys.includes(e.employeeID)).every(e => e.status)}
            onChange={handleMultiSwitch}
            loading={loading}
            checkedChildren="Bật"
            unCheckedChildren="Tắt"
          />
          <span className="text-sm text-gray-600">
            {selectedRowKeys.length === 0
              ? "Bật/Tắt kích hoạt tất cả nhân viên"
              : `Bật/Tắt ${selectedRowKeys.length} nhân viên đã chọn`}
          </span>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              checked={employees.length > 0 && employees.every(e => selectedRowKeys.includes(e.employeeID))}
              ref={el => {
                if (el) {
                  el.indeterminate = employees.length > 0 && selectedRowKeys.length > 0 && selectedRowKeys.length < employees.length;
                }
              }}
              onChange={e => {
                if (e.target.checked) {
                  setSelectedRowKeys(employees.map(e => e.employeeID));
                } else {
                  setSelectedRowKeys([]);
                }
              }}
              disabled={loading || employees.length === 0}
            />
            <span className="text-sm text-gray-600">Chọn tất cả</span>
          </label>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <SearchOutlined className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />
            <input
              placeholder="Tìm kiếm nhân viên..."
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
            <span className="text-sm text-gray-600 font-medium whitespace-nowrap">Phòng ban:</span>
            <select
              value={departmentFilter}
              onChange={e => setDepartmentFilter(e.target.value)}
              className="w-48 h-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:outline-none text-sm shadow-sm"
              style={{
                color: 'black',
                backgroundColor: 'white',
              }}
            >
              {departmentOptions.map((option) => (
                <option key={option.value} value={option.value} style={{ color: 'black', backgroundColor: 'white' }}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Employee Cards */}
      {employees.length === 0 ? (
        <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-12 text-center border border-gray-200">
          <InboxOutlined className="text-6xl text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy nhân viên nào</h3>
          <p className="text-gray-500">Thử thay đổi bộ lọc hoặc thêm nhân viên mới</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {employees.map((emp) => {
            const isSelected = selectedRowKeys.includes(emp.employeeID);
            return (
              <div
                key={emp.employeeID}
                className={`bg-gradient-to-br from-white via-blue-50 to-indigo-100 rounded-xl border-2 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] relative overflow-hidden ${
                  isSelected ? 'border-blue-500 shadow-lg scale-[1.02] bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 z-10' : 'border-gray-200 hover:border-blue-300 hover:z-10'
                }`}
                onClick={() => {
                  if (!loading) {
                    setSelectedRowKeys(prev =>
                      prev.includes(emp.employeeID)
                        ? prev.filter(id => id !== emp.employeeID)
                        : [...prev, emp.employeeID]
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
                        prev.includes(emp.employeeID)
                          ? prev.filter(id => id !== emp.employeeID)
                          : [...prev, emp.employeeID]
                      );
                    }}
                    onClick={e => e.stopPropagation()}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 pointer-events-auto z-10 relative"
                    disabled={loading}
                  />
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    emp.status 
                      ? 'bg-gradient-to-r from-green-200 to-emerald-200 text-green-800 border border-green-300 shadow-sm' 
                      : 'bg-gradient-to-r from-red-200 to-rose-200 text-red-800 border border-red-300 shadow-sm'
                  }`}>
                    {emp.status ? 'Đang làm' : 'Nghỉ việc'}
                  </div>
                </div>

                {/* Employee Info */}
                <div className="p-4 bg-gradient-to-br from-white to-blue-50">
                  {/* Avatar */}
                  <div className="flex items-center gap-3 mb-3">
                    {emp.image ? (
                      <img src={emp.image} alt="avatar" className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 shadow-md" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
                        <span className="text-lg font-bold text-white">{emp.fullName?.[0]}</span>
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900 line-clamp-1">{emp.fullName}</h3>
                      <p className="text-sm text-gray-500">{emp.email}</p>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">SĐT:</span>
                      <span className="text-gray-900 font-medium">{emp.phone}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Phòng ban:</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        emp.department === 'Quản lý' 
                          ? 'bg-gradient-to-r from-purple-200 to-violet-200 text-purple-800 border border-purple-300 shadow-sm' 
                          : 'bg-gradient-to-r from-blue-200 to-indigo-200 text-blue-800 border border-blue-300 shadow-sm'
                      }`}>
                        {emp.department || '-'}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1">
                    <Tooltip title="Xem chi tiết">
                      <Button
                        size="small"
                        icon={<EyeOutlined className="text-blue-600" />}
                        onClick={e => { e.stopPropagation(); setSelectedEmployee(emp); setShowDetail(true); }}
                        className="flex-1 border-blue-300 text-blue-700 hover:border-blue-400 hover:text-blue-800 shadow-sm bg-gradient-to-r from-blue-100 to-indigo-100"
                      />
                    </Tooltip>
                    <Tooltip title="Chỉnh sửa">
                      <Button
                        size="small"
                        icon={<EditOutlined className="text-green-600" />}
                        onClick={e => { e.stopPropagation(); setEditEmployee(emp); setShowEdit(true); }}
                        className="flex-1 border-green-300 text-green-700 hover:border-green-400 hover:text-green-800 shadow-sm bg-gradient-to-r from-green-100 to-emerald-100"
                      />
                    </Tooltip>
                    <Tooltip title="Phân quyền">
                      <Button
                        size="small"
                        icon={<KeyOutlined className="text-purple-600" />}
                        onClick={e => { e.stopPropagation(); setEmployeeToAssignRole(emp); setShowAssignRole(true); }}
                        className="flex-1 border-purple-300 text-purple-700 hover:border-purple-400 hover:text-purple-800 shadow-sm bg-gradient-to-r from-purple-100 to-violet-100"
                      />
                    </Tooltip>
                    <Tooltip title="Xóa">
                      <Button
                        size="small"
                        icon={<DeleteOutlined className="text-red-600" />}
                        onClick={e => { e.stopPropagation(); showDeleteConfirm(emp); }}
                        className="flex-1 border-red-300 text-red-700 hover:border-red-400 hover:text-red-800 shadow-sm bg-gradient-to-r from-red-100 to-rose-100"
                      />
                    </Tooltip>
                  </div>

                  {/* Status Toggle */}
                  <div className="mt-3 pt-3 border-t border-gray-200 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg p-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">Trạng thái:</span>
                      <MultiSwitch
                        checked={emp.status}
                        checkedChildren="Bật"
                        unCheckedChildren="Tắt"
                        loading={switchLoading}
                        onChange={async (checked) => {
                          setSwitchLoading(true);
                          const res = await setActiveEmployee(emp.employeeID, checked);
                          if (res?.success) {
                            showSuccessToast(res.message || "Cập nhật trạng thái thành công!");
                            fetchEmployees(pagination);
                          } else {
                            showErrorToast(res?.message || "Cập nhật thất bại");
                          }
                          setSwitchLoading(false);
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
              fetchEmployees({ page: pagination.current - 1, pageSize: pagination.pageSize });
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
              fetchEmployees({ page, pageSize: pagination.pageSize });
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
              fetchEmployees({ page: pagination.current + 1, pageSize: pagination.pageSize });
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
            fetchEmployees({ page: 1, pageSize: Number(e.target.value) });
          }}
        >
          {[8, 16, 32].map(size => (
            <option key={size} value={size}>{size} / page</option>
          ))}
        </select>
      </div>

      {/* Modals */}
      <AddEmployee
        visible={showAdd}
        onCancel={() => setShowAdd(false)}
        onSuccess={() => {
          setShowAdd(false);
          fetchEmployees(pagination);
        }}
      />
      <EditEmployee
        visible={showEdit}
        onCancel={() => {
          setShowEdit(false);
          setEditEmployee(null);
        }}
        onSuccess={() => {
          setShowEdit(false);
          setEditEmployee(null);
          fetchEmployees(pagination);
        }}
        employee={editEmployee}
      />
      
      {/* Detail Modal */}
      <Modal
        open={showDetail && !!selectedEmployee}
        onCancel={() => setShowDetail(false)}
        footer={null}
        centered
        width={600}
        title="Chi tiết nhân viên"
      >
        {selectedEmployee && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              {selectedEmployee.image ? (
                <img src={selectedEmployee.image} alt="avatar" className="w-16 h-16 rounded-full object-cover" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-2xl font-bold text-blue-600">{selectedEmployee.fullName?.[0]}</span>
                </div>
              )}
              <div>
                <h3 className="text-xl font-bold text-gray-900">{selectedEmployee.fullName}</h3>
                <p className="text-gray-600">{selectedEmployee.email}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <InfoRow label="Số điện thoại" value={selectedEmployee.phone} />
              <InfoRow label="CMND/CCCD" value={selectedEmployee.identityCard} />
              <InfoRow label="Phòng ban" value={selectedEmployee.department} />
              <InfoRow label="Trạng thái" value={selectedEmployee.status ? "Đang làm việc" : "Nghỉ việc"} />
              <InfoRow label="Địa chỉ" value={selectedEmployee.address} />
              <InfoRow label="Giới tính" value={selectedEmployee.sex === "MALE" ? "Nam" : selectedEmployee.sex === "FEMALE" ? "Nữ" : "-"} />
              <InfoRow label="Ngày sinh" value={selectedEmployee.dob ? new Date(selectedEmployee.dob).toLocaleDateString() : "-"} />
              <InfoRow label="Ngày tạo" value={selectedEmployee.createdDate ? new Date(selectedEmployee.createdDate).toLocaleString() : "-"} />
            </div>
          </div>
        )}
      </Modal>

      {/* Assign Role Modal */}
      <AssignRole
        visible={showAssignRole}
        onCancel={() => {
          setShowAssignRole(false);
          setEmployeeToAssignRole(null);
        }}
        onSuccess={() => {
          setShowAssignRole(false);
          setEmployeeToAssignRole(null);
          fetchEmployees(pagination);
        }}
        employeeData={employeeToAssignRole}
      />
      
      {/* Delete Confirmation Modal */}
      <Modal
        title="Xác nhận xóa"
        open={deleteModalVisible}
        onOk={handleDeleteConfirm}
        onCancel={() => {
          setDeleteModalVisible(false);
          setEmployeeToDelete(null);
        }}
        okText="Xóa"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
      >
        <p>Bạn có chắc chắn muốn xóa nhân viên "{employeeToDelete?.fullName}"?</p>
        <p className="text-red-500 font-medium">Hành động này không thể hoàn tác.</p>
      </Modal>
    </>
  );
};

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-100">
      <span className="text-sm font-medium text-gray-600">{label}:</span>
      <span className="text-sm text-gray-900 font-medium">{value || "-"}</span>
    </div>
  );
}

export default EmployeeManagement;