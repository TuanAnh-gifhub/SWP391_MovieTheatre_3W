import React, { useState, useEffect } from "react";
import { Modal, Form, Select, Button, Card, Typography, Avatar } from "antd";
import { UserOutlined, TeamOutlined, KeyOutlined } from "@ant-design/icons";
import { assignRoleToAccount, getAllRoles } from "../../../service/permission/index";
import { showSuccessToast, showErrorToast } from "../../../utils/toast";

const { Title, Text } = Typography;
const { Option } = Select;

const AssignUserRole = ({ visible, onCancel, onSuccess, userData }) => {
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
    const accountId = userData?.accountID;
    
    if (!accountId) {
      showErrorToast("Không tìm thấy thông tin tài khoản!");
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
          <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg flex items-center justify-center shadow-lg">
            <KeyOutlined className="text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">Phân quyền cho người dùng</span>
        </div>
      }
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={600}
      centered
      className="!rounded-xl"
    >
      <div className="mt-4">
        {/* User Info */}
        {userData && (
          <div className="mb-6 p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-200">
            <div className="flex items-center gap-4">
              <Avatar
                size={56}
                src={userData.avatar}
                icon={<UserOutlined />}
                className="border-2 border-orange-300"
              />
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  {userData.fullName}
                </h3>
                <p className="text-gray-600 mb-1">{userData.email}</p>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Vai trò hiện tại:</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    userData.role === "ADMIN" 
                      ? 'bg-red-100 text-red-700' 
                      : userData.role === "CUSTOMER"
                      ? 'bg-green-100 text-green-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {userData.role === "ADMIN" ? "Admin" : 
                     userData.role === "CUSTOMER" ? "Khách hàng" : 
                     userData.role === "EMPLOYEE" ? "Nhân viên" : userData.role}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-gray-500">Xếp hạng:</span>
                  <span className="px-2 py-1 rounded text-xs font-medium bg-orange-100 text-orange-700">
                    {userData.rank && userData.rank !== "No rank" ? userData.rank : "Không có"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Role Selection */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <TeamOutlined className="text-orange-600" />
            <h3 className="text-lg font-semibold text-gray-900">Chọn quyền hạn</h3>
          </div>
          
          {/* Notice about disabled roles */}
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-yellow-600 text-sm">
                <strong>Lưu ý:</strong> Role ADMIN và CUSTOMER không khả dụng cho người dùng
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
                placeholder="Chọn role cho người dùng"
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
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <KeyOutlined className="text-orange-500 text-lg mt-0.5" />
            <div>
              <h4 className="text-orange-700 font-semibold mb-2">Lưu ý quan trọng</h4>
              <ul className="text-orange-600 text-sm space-y-1">
                <li>• Role mới sẽ thay thế role hiện tại của người dùng</li>
                <li>• Người dùng sẽ có tất cả quyền hạn của role được chọn</li>
                <li>• Thay đổi này sẽ có hiệu lực ngay lập tức</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4">
          <Button
            onClick={handleCancel}
            size="large"
            className="border-orange-300 text-orange-600 hover:border-orange-500 hover:text-orange-700"
          >
            Hủy
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            size="large"
            className="bg-gradient-to-r from-orange-500 to-amber-600 border-0 hover:from-orange-600 hover:to-amber-700"
            icon={<TeamOutlined />}
            onClick={() => form.submit()}
          >
            Gán Role
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default AssignUserRole; 