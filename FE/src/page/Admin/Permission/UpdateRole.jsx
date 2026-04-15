import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Divider } from "antd";
import { updateRole } from "../../../service/permission/index";
import { showSuccessToast, showErrorToast } from "../../../utils/toast";
import { UserOutlined, KeyOutlined, FileTextOutlined, TeamOutlined } from "@ant-design/icons";

const { TextArea } = Input;

const UpdateRole = ({ visible, onCancel, onSuccess, roleData }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Reset form when modal opens with role data
  useEffect(() => {
    if (visible && roleData) {
      form.setFieldsValue({
        roleName: roleData.roleName,
        roleCode: roleData.roleCode,
        description: roleData.description || "",
      });
    }
  }, [visible, roleData, form]);

  const handleOk = async () => {
    if (!roleData?.roleId) {
      showErrorToast("Không tìm thấy thông tin role!");
      return;
    }

    try {
      const values = await form.validateFields();
      setLoading(true);

      const response = await updateRole(roleData.roleId, {
        roleName: values.roleName,
        roleCode: values.roleCode,
        description: values.description || "",
      });

      if (!response.error) {
        showSuccessToast(response.message || "Cập nhật role thành công!");
        form.resetFields();
        onSuccess && onSuccess(response.result);
        onCancel();
      } else {
        showErrorToast(response.message || "Cập nhật role thất bại!");
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Cập nhật role thất bại!";
      showErrorToast(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
            <TeamOutlined className="text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">Cập nhật vai trò</span>
        </div>
      }
      open={visible}
      onOk={handleOk}
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
      confirmLoading={loading}
      okText="Cập nhật vai trò"
      cancelText="Hủy"
      destroyOnHidden
      width={700}
      className="!rounded-xl"
      okButtonProps={{
        className: "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 border-0 shadow-lg"
      }}
      cancelButtonProps={{
        className: "border-gray-300 text-gray-700 hover:border-gray-400 hover:text-gray-800"
      }}
    >
      <Form
        form={form}
        layout="vertical"
        className="mt-2"
      >
        {/* Basic Information Section */}
        <div className="mb-4 p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-200">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <UserOutlined className="text-white text-sm" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Thông tin cơ bản</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Form.Item
              label="Tên vai trò"
              name="roleName"
              rules={[
                { required: true, message: "Vui lòng nhập tên vai trò" },
                { min: 2, message: "Tên vai trò phải có ít nhất 2 ký tự" },
                { max: 50, message: "Tên vai trò không được quá 50 ký tự" },
              ]}
              className="mb-2"
            >
              <Input 
                placeholder="Nhập tên vai trò (VD: Quản lý rạp chiếu phim)"
                className="rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
              />
            </Form.Item>
            
            <Form.Item
              label="Mã vai trò"
              name="roleCode"
              rules={[
                { required: true, message: "Vui lòng nhập mã vai trò" },
                { 
                  pattern: /^[A-Z_]+$/, 
                  message: "Mã vai trò chỉ được chứa chữ hoa và dấu gạch dưới" 
                },
                { min: 2, message: "Mã vai trò phải có ít nhất 2 ký tự" },
                { max: 20, message: "Mã vai trò không được quá 20 ký tự" },
              ]}
              className="mb-2"
            >
              <Input 
                placeholder="Nhập mã vai trò (VD: CINEMA_MANAGER)"
                className="rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
              />
            </Form.Item>
          </div>
        </div>

        <Divider className="my-4" />

        {/* Description Section */}
        <div className="mb-4 p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
              <FileTextOutlined className="text-white text-sm" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Mô tả chi tiết</h3>
          </div>
          
          <Form.Item
            label="Mô tả vai trò"
            name="description"
            rules={[
              { max: 200, message: "Mô tả không được quá 200 ký tự" },
            ]}
            className="mb-2"
          >
            <TextArea
              placeholder="Nhập mô tả chi tiết cho vai trò này (không bắt buộc)"
              rows={4}
              className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
};

export default UpdateRole;
