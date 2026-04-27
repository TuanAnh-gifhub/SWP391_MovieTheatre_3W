import React, { useState } from "react";
import { Modal, Form, Input, DatePicker, Select, Switch, Divider } from "antd";
import { addEmployee } from "../../../service/employee";
import { showSuccessToast, showErrorToast } from "../../../utils/toast";
import dayjs from "dayjs";
import { UserOutlined, MailOutlined, PhoneOutlined, IdcardOutlined, HomeOutlined, TeamOutlined, LockOutlined } from "@ant-design/icons";

const sexOptions = [
  { label: "Nam", value: "MALE" },
  { label: "Nữ", value: "FEMALE" },
];

const departmentOptions = [
  { label: "Nhân viên", value: "Nhân viên" },
  { label: "Quản lý", value: "Quản lý" },
];

const AddEmployee = ({ visible, onCancel, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const payload = {
        fullName: values.fullName,
        dob: values.dob.format("YYYY-MM-DD"),
        sex: values.sex,
        email: values.email,
        identityCard: values.identityCard,
        phone: values.phone,
        address: values.address,
        department: values.department,
        image: values.image || "",
        active: values.active,
        username: values.username,
        password: values.password,
        confirmPassword: values.confirmPassword,
      };

      const res = await addEmployee(payload);

      if (res?.success) {
        showSuccessToast(res.message || "Thêm nhân viên thành công!");
        form.resetFields();
        onSuccess && onSuccess();
        onCancel();
      } else if (res?.message?.toLowerCase().includes("exist")) {
        showErrorToast(res.message || "Tài khoản đã tồn tại!");
      } else {
        showErrorToast(res.message || "Thêm nhân viên thất bại!");
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Thêm nhân viên thất bại!";
      showErrorToast(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal
        title={
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
              <UserOutlined className="text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Thêm nhân viên mới</span>
          </div>
        }
        open={visible}
        onOk={handleOk}
        onCancel={() => {
          form.resetFields();
          onCancel();
        }}
        confirmLoading={loading}
        okText="Thêm nhân viên"
        cancelText="Hủy"
        destroyOnHidden
        width={700}
        className="!rounded-xl"
        okButtonProps={{
          className: "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 border-0 shadow-lg"
        }}
        cancelButtonProps={{
          className: "border-gray-300 text-gray-700 hover:border-gray-400 hover:text-gray-800"
        }}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            active: true,
            department: "Nhân viên",
            sex: "MALE",
            dob: dayjs(),
          }}
          className="mt-2"
        >
          {/* Personal Information Section */}
          <div className="mb-4 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <UserOutlined className="text-white text-sm" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Thông tin cá nhân</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Form.Item
                label="Họ và tên"
                name="fullName"
                rules={[{ required: true, message: "Vui lòng nhập họ và tên" }]}
                className="mb-2"
              >
                <Input 
                  placeholder="Nhập họ và tên"
                  className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                />
              </Form.Item>
              
              <Form.Item
                label="Ngày sinh"
                name="dob"
                rules={[{ required: true, message: "Vui lòng chọn ngày sinh" }]}
                className="mb-2"
              >
                <DatePicker 
                  format="DD/MM/YYYY" 
                  style={{ width: "100%" }} 
                  className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  placeholder="Chọn ngày sinh"
                />
              </Form.Item>
              
              <Form.Item
                label="Giới tính"
                name="sex"
                rules={[{ required: true, message: "Vui lòng chọn giới tính" }]}
                className="mb-2"
              >
                <Select 
                  options={sexOptions} 
                  placeholder="Chọn giới tính"
                  className="rounded-lg"
                />
              </Form.Item>
              
              <Form.Item
                label="Phòng ban"
                name="department"
                rules={[{ required: true, message: "Vui lòng chọn phòng ban" }]}
                className="mb-2"
              >
                <Select 
                  options={departmentOptions} 
                  placeholder="Chọn phòng ban"
                  className="rounded-lg"
                />
              </Form.Item>
            </div>
          </div>

          <Divider className="my-4" />

          {/* Contact Information Section */}
          <div className="mb-4 p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <MailOutlined className="text-white text-sm" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Thông tin liên hệ</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: "Vui lòng nhập email" },
                  { type: "email", message: "Email không hợp lệ" },
                ]}
                className="mb-2"
              >
                <Input 
                  placeholder="example@email.com"
                  className="rounded-lg border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-500"
                />
              </Form.Item>
              
              <Form.Item
                label="Số điện thoại"
                name="phone"
                rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}
                className="mb-2"
              >
                <Input 
                  placeholder="0123456789"
                  className="rounded-lg border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-500"
                />
              </Form.Item>
              
              <Form.Item
                label="CMND/CCCD"
                name="identityCard"
                rules={[{ required: true, message: "Vui lòng nhập CMND/CCCD" }]}
                className="mb-2"
              >
                <Input 
                  placeholder="Nhập số CMND/CCCD"
                  className="rounded-lg border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-500"
                />
              </Form.Item>
              
              <Form.Item
                label="Địa chỉ"
                name="address"
                rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}
                className="mb-2"
              >
                <Input 
                  placeholder="Nhập địa chỉ"
                  className="rounded-lg border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-500"
                />
              </Form.Item>
            </div>
          </div>

          <Divider className="my-4" />

          {/* Account Information Section */}
          <div className="mb-4 p-4 bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl border border-purple-200">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg flex items-center justify-center">
                <LockOutlined className="text-white text-sm" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Thông tin tài khoản</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Form.Item
                label="Tên tài khoản"
                name="username"
                rules={[{ required: true, message: "Vui lòng nhập tên tài khoản" }]}
                className="mb-2"
              >
                <Input 
                  placeholder="Nhập tên tài khoản"
                  className="rounded-lg border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-500"
                />
              </Form.Item>
              
              <Form.Item
                label="Mật khẩu"
                name="password"
                rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}
                className="mb-2"
              >
                <Input.Password 
                  placeholder="Nhập mật khẩu"
                  className="rounded-lg border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-500"
                />
              </Form.Item>
              
              <Form.Item
                label="Nhập lại mật khẩu"
                name="confirmPassword"
                dependencies={["password"]}
                rules={[
                  { required: true, message: "Vui lòng nhập lại mật khẩu" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("password") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error("Mật khẩu không khớp"));
                    },
                  }),
                ]}
                className="mb-2"
              >
                <Input.Password 
                  placeholder="Nhập lại mật khẩu"
                  className="rounded-lg border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-500"
                />
              </Form.Item>
              
              <Form.Item
                label="Kích hoạt tài khoản"
                name="active"
                valuePropName="checked"
                className="mb-2"
              >
                <Switch 
                  checkedChildren="Bật" 
                  unCheckedChildren="Tắt" 
                />
              </Form.Item>
            </div>
          </div>

          <Divider className="my-4" />

          {/* Optional Information Section */}
          <div className="mb-2 p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border border-orange-200">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg flex items-center justify-center">
                <UserOutlined className="text-white text-sm" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Thông tin bổ sung</h3>
            </div>
            
            <Form.Item
              label="Ảnh đại diện (URL)"
              name="image"
              className="mb-2"
            >
              <Input 
                placeholder="https://example.com/avatar.jpg"
                className="rounded-lg border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500"
              />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </>
  );
};

export default AddEmployee;