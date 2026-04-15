import React, { useState, useEffect } from "react";
import { Modal, Form, Select, Button, Typography, Avatar, Divider } from "antd";
import { UserOutlined, TeamOutlined, KeyOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { assignRoleToAccount, getAllRoles, getAccountIdFromEmployee } from "../../../service/permission/index";
import { showSuccessToast, showErrorToast } from "../../../utils/toast";

const { Title, Text } = Typography;
const { Option } = Select;

const AssignRole = ({ visible, onCancel, onSuccess, employeeData }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(false);

  // Fetch roles when modal opens
  useEffect(() => {
    if (visible) {
      fetchRoles();
    }
  }, [visible]);

  const fetchRoles = async () => {
    setRolesLoading(true);
    try {
      const response = await getAllRoles();
      if (!response.error) {
        // Filter out ADMIN and CUSTOMER roles
        const filteredRoles = (response.result || []).filter(role => 
          role.roleCode !== 'ADMIN' && role.roleCode !== 'CUSTOMER'
        );
        setRoles(filteredRoles);
      } else {
        showErrorToast(response.message);
      }
    } catch (error) {
      showErrorToast("Không thể tải danh sách roles!");
    } finally {
      setRolesLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    // Sử dụng employeeID nếu không có accountId
    let accountId = employeeData?.accountId || employeeData?.employeeID;
    
    // Nếu có employeeID nhưng không có accountId, thử lấy accountId
    if (employeeData?.employeeID && !employeeData?.accountId) {
      try {
        const accountResponse = await getAccountIdFromEmployee(employeeData.employeeID);
        if (!accountResponse.error) {
          accountId = accountResponse.result?.accountId || accountResponse.result;
        } else {
          // Fallback: sử dụng employeeID trực tiếp
          accountId = employeeData.employeeID;
        }
      } catch (error) {
        // Fallback: sử dụng employeeID trực tiếp
        accountId = employeeData.employeeID;
      }
    }
    
    if (!accountId) {
      showErrorToast("Không tìm thấy thông tin tài khoản nhân viên!");
      return;
    }

    if (!values.roleId) {
      showErrorToast("Vui lòng chọn role!");
      return;
    }

    setLoading(true);
    try {
      const response = await assignRoleToAccount(accountId, values.roleId);

      if (!response.error) {
        showSuccessToast(response.message);
        form.resetFields();
        onSuccess && onSuccess(response.result);
        onCancel();
      } else {
        showErrorToast(response.message);
      }
    } catch (error) {
      showErrorToast("Có lỗi xảy ra khi gán role!");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
            <KeyOutlined className="text-purple-600" />
          </div>
          <span className="text-xl font-bold text-gray-900">Phân quyền cho nhân viên</span>
        </div>
      }
      open={visible}
      onOk={() => form.submit()}
      onCancel={handleCancel}
      confirmLoading={loading}
      okText="Gán Role"
      cancelText="Hủy"
      width={600}
      centered
      className="!rounded-xl"
    >
      <div className="mt-4">
        {/* Employee Info */}
        {employeeData && (
          <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <div className="flex items-center gap-4">
              <Avatar
                size={56}
                src={employeeData.image}
                icon={<UserOutlined />}
                className="border-2 border-gray-300"
              />
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  {employeeData.fullName}
                </h3>
                <p className="text-gray-600 mb-1">{employeeData.email}</p>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Phòng ban:</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    employeeData.department === 'Quản lý' 
                      ? 'bg-purple-100 text-purple-700' 
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {employeeData.department}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        <Divider />

        {/* Role Selection */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <TeamOutlined className="text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Chọn quyền hạn</h3>
          </div>
          
          {/* Notice about disabled roles */}
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-yellow-600 text-sm">
                <strong>Lưu ý:</strong> Role ADMIN và CUSTOMER không khả dụng cho nhân viên
              </span>
            </div>
          </div>
          
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Form.Item
              name="roleId"
              label="Role"
              rules={[
                { required: true, message: "Vui lòng chọn role!" },
              ]}
              className="mb-4"
            >
              <Select
                placeholder="Chọn role cho nhân viên"
                loading={rolesLoading}
                className="rounded-lg"
                size="large"
                showSearch
                filterOption={(input, option) =>
                  String(option.children).toLowerCase().includes(input.toLowerCase())
                }
                optionLabelProp="label"
              >
                {roles.map((role) => (
                  <Option 
                    key={role.roleId} 
                    value={role.roleId}
                    label={role.roleName}
                  >
                    <div className="py-1">
                      <div className="font-semibold text-gray-900">{role.roleName}</div>
                      <div className="text-xs text-gray-500">
                        {role.roleCode} - {role.description || "Không có mô tả"}
                      </div>
                    </div>
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Form>
        </div>

        {/* Information Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <InfoCircleOutlined className="text-blue-500 text-lg mt-0.5" />
            <div>
              <h4 className="text-blue-700 font-semibold mb-2">Lưu ý quan trọng</h4>
              <ul className="text-blue-600 text-sm space-y-1">
                <li>• Role mới sẽ thay thế role hiện tại của nhân viên</li>
                <li>• Nhân viên sẽ có tất cả quyền hạn của role được chọn</li>
                <li>• Thay đổi này sẽ có hiệu lực ngay lập tức</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default AssignRole; 