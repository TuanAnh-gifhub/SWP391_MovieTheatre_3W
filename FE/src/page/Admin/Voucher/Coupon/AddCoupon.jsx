import React, { useState } from "react";
import { Form, Input, InputNumber, DatePicker, Select, Button } from "antd";
import { createCoupon } from "../../../../service/voucher";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import { GiftOutlined, PlusOutlined, CloseOutlined } from "@ant-design/icons";

const { Option } = Select;

const AddCoupon = ({ onSuccess, onCancel }) => {
  const [form] = Form.useForm();
  const [discountType, setDiscountType] = useState("PERCENTAGE");

  const handleFinish = async (values) => {
    const date = values.expirationDate
      .set("second", 0)
      .set("millisecond", 0)
      .toISOString();
    const payload = {
      ...values,
      expirationDate: date,
    };
    const res = await createCoupon(payload);
    if (res.status === 200) {
      toast.success(res.message || "Tạo khuyến mãi thành công!");
      form.resetFields();
      onSuccess && onSuccess();
    } else {
      toast.error(res.message || "Tạo khuyến mãi thất bại!");
    }
  };

  const handleDiscountTypeChange = (value) => {
    setDiscountType(value);
    form.setFieldsValue({ discountValue: undefined });
  };

  const formatDisplayValue = (value) => {
    if (!value) return "";
    if (discountType === "PERCENTAGE") {
      return `${value}%`;
    } else {
      return `${value.toLocaleString()} VNĐ`;
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
          <GiftOutlined className="text-xl text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Thêm khuyến mãi mới</h2>
          <p className="text-sm text-gray-600">Tạo mã giảm giá và khuyến mãi mới</p>
        </div>
      </div>

      {/* Form */}
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{
          discountType: "PERCENTAGE",
          discountValue: 1,
          usageLimit: 1,
        }}
        className="space-y-4"
      >
        {/* Basic Info Section */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-700 mb-4 flex items-center gap-2">
            <GiftOutlined className="text-blue-600" />
            Thông tin cơ bản
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              label={<span className="text-sm font-medium text-gray-700">Tên khuyến mãi</span>}
              name="name"
              rules={[{ required: true, message: "Vui lòng nhập tên khuyến mãi" }]}
            >
              <Input 
                placeholder="Nhập tên khuyến mãi"
                className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </Form.Item>
            
            <Form.Item
              label={<span className="text-sm font-medium text-gray-700">Mã khuyến mãi</span>}
              name="code"
              rules={[{ required: true, message: "Vui lòng nhập mã khuyến mãi" }]}
            >
              <Input 
                placeholder="Nhập mã khuyến mãi"
                className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </Form.Item>
          </div>
        </div>

        {/* Discount Info Section */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
          <h3 className="text-lg font-semibold text-green-700 mb-4 flex items-center gap-2">
            <GiftOutlined className="text-green-600" />
            Thông tin giảm giá
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              label={<span className="text-sm font-medium text-gray-700">Loại giảm</span>}
              name="discountType"
              rules={[{ required: true, message: "Chọn loại giảm" }]}
            >
              <Select 
                placeholder="Chọn loại giảm"
                className="rounded-lg"
                onChange={handleDiscountTypeChange}
              >
                <Option value="PERCENTAGE">Phần trăm (%)</Option>
                <Option value="FIXED_AMOUNT">Số tiền cố định</Option>
              </Select>
            </Form.Item>
            
            <Form.Item
              label={<span className="text-sm font-medium text-gray-700">
                Giá trị giảm {discountType === "PERCENTAGE" ? "(%)" : "(VNĐ)"}
              </span>}
              name="discountValue"
              rules={[{ required: true, message: "Nhập giá trị giảm" }]}
            >
              <InputNumber 
                min={1} 
                placeholder={discountType === "PERCENTAGE" ? "Nhập phần trăm (VD: 20)" : "Nhập số tiền (VD: 20000)"}
                className="w-full rounded-lg border-gray-300 focus:border-green-500 focus:ring-green-500"
                formatter={formatDisplayValue}
                parser={(value) => {
                  if (!value) return "";
                  const numValue = value.replace(/[^\d]/g, "");
                  return numValue ? parseInt(numValue) : "";
                }}
              />
            </Form.Item>
          </div>
        </div>

        {/* Usage Info Section */}
        <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-4 border border-purple-200">
          <h3 className="text-lg font-semibold text-purple-700 mb-4 flex items-center gap-2">
            <GiftOutlined className="text-purple-600" />
            Thông tin sử dụng
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              label={<span className="text-sm font-medium text-gray-700">Giới hạn sử dụng</span>}
              name="usageLimit"
              rules={[{ required: true, message: "Nhập giới hạn sử dụng" }]}
            >
              <InputNumber 
                min={1} 
                placeholder="Nhập giới hạn"
                className="w-full rounded-lg border-gray-300 focus:border-purple-500 focus:ring-purple-500"
              />
            </Form.Item>
            
            <Form.Item
              label={<span className="text-sm font-medium text-gray-700">Ngày hết hạn</span>}
              name="expirationDate"
              rules={[{ required: true, message: "Chọn ngày hết hạn" }]}
            >
              <DatePicker
                showTime={{ format: "HH:mm", defaultValue: dayjs("00:00", "HH:mm") }}
                format="YYYY-MM-DD HH:mm"
                placeholder="Chọn ngày hết hạn"
                className="w-full rounded-lg border-gray-300 focus:border-purple-500 focus:ring-purple-500"
              />
            </Form.Item>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4">
          <Button
            onClick={onCancel}
            
            className="px-6 py-2 h-10 border-gray-300 text-gray-700 hover:border-gray-400 hover:text-gray-800 bg-white shadow-sm"
          >
            Hủy
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            className="px-6 py-2 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 border-0 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Tạo khuyến mãi
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default AddCoupon;