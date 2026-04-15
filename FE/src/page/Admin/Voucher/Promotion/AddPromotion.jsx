import React, { useEffect, useState } from "react";
import { Form, Input, InputNumber, DatePicker, Select, Button, Checkbox, Spin } from "antd";
import { createPromotion, getPromotionConditions } from "../../../../service/voucher";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import { GiftOutlined, PlusOutlined, CloseOutlined } from "@ant-design/icons";

const { Option } = Select;
const { RangePicker } = DatePicker;

const PROMOTION_TYPES = [
  { value: "PERCENTAGE", label: "Phần trăm (%)" },
  { value: "FIXED_AMOUNT", label: "Số tiền cố định" },
  { value: "COMBO", label: "Combo" },
];

const AddPromotion = ({ onSuccess, onCancel }) => {
  const [form] = Form.useForm();
  const [conditions, setConditions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [promotionType, setPromotionType] = useState("PERCENTAGE");

  useEffect(() => {
    fetchConditions();
  }, []);

  const fetchConditions = async () => {
    setLoading(true);
    const res = await getPromotionConditions();
    if (res.status === 200) {
      setConditions(res.result);
    }
    setLoading(false);
  };

  const handleFinish = async (values) => {
    setLoading(true);
    try {
      const [start, end] = values.timeRange;
      // Build condition object động từ conditions
      let condition = {};
      conditions.forEach((cond) => {
        let val = values[cond.key];
        // Nếu là applicableRoles, map value sang label
        if (cond.key === "applicableRoles" && Array.isArray(val)) {
          const options = cond.options || [];
          val = val
            .map((v) => {
              const found = options.find((opt) => opt.value === v);
              return found ? found.label : v;
            })
            .filter(Boolean);
        }
        // Nếu là firstBooking, chỉ add nếu true
        if (cond.key === "firstBooking") {
          if (val === true) {
            condition[cond.key] = true;
          }
          return;
        }
        // Chỉ add key nếu value hợp lệ (mảng length > 0 hoặc giá trị không rỗng)
        if (
          val !== undefined &&
          val !== null &&
          ((Array.isArray(val) && val.length > 0) || (!Array.isArray(val) && val !== ""))
        ) {
          condition[cond.key] = val;
        }
      });

      const payload = {
        title: values.title,
        startTime: start.format("YYYY-MM-DDTHH:mm:ss.SSS"),
        endTime: end.format("YYYY-MM-DDTHH:mm:ss.SSS"),
        detail: values.detail,
        value: values.value,
        image: values.image || "",
        isExclusive: values.isExclusive || false,
        groupCode: null, // hoặc values.groupCode nếu có
        promotionType: values.promotionType,
        maxDiscountAmount: values.maxDiscountAmount,
        maxTotalUsage: values.maxTotalUsage,
        maxUsagePerCustomer: values.maxUsagePerCustomer || null,
        condition: Object.keys(condition).length > 0 ? condition : null,
        status: "ACTIVE",
      };

      const res = await createPromotion(payload);
      if (res.status === 200) {
        toast.success(res.message || "Tạo khuyến mãi thành công!");
        form.resetFields();
        onSuccess && onSuccess();
      } else {
        toast.error(res.message || "Tạo khuyến mãi thất bại!");
      }
    } catch (err) {
      toast.error(err?.message || "Có lỗi xảy ra!");
    }
    setLoading(false);
  };

  const handlePromotionTypeChange = (value) => {
    setPromotionType(value);
    form.setFieldsValue({ value: undefined, maxDiscountAmount: undefined });
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg">
          <GiftOutlined className="text-xl text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Thêm promotion mới</h2>
          <p className="text-sm text-gray-600">Tạo chương trình khuyến mãi và ưu đãi mới</p>
        </div>
      </div>

      {/* Form */}
      <Spin spinning={loading}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          initialValues={{
            promotionType: "PERCENTAGE",
            value: 1,
            isExclusive: false,
            maxTotalUsage: 1,
            maxUsagePerCustomer: 1,
          }}
          className="space-y-4"
        >
          {/* Basic Info Section */}
          <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl p-4 border border-pink-200">
            <h3 className="text-lg font-semibold text-pink-700 mb-4 flex items-center gap-2">
              <GiftOutlined className="text-pink-600" />
              Thông tin cơ bản
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                label={<span className="text-sm font-medium text-gray-700">Tiêu đề</span>}
                name="title"
                rules={[{ required: true, message: "Vui lòng nhập tiêu đề" }]}
              >
                <Input 
                  placeholder="Nhập tiêu đề promotion"
                  className="rounded-lg border-gray-300 focus:border-pink-500 focus:ring-pink-500"
                />
              </Form.Item>
              
              <Form.Item
                label={<span className="text-sm font-medium text-gray-700">Loại khuyến mãi</span>}
                name="promotionType"
                rules={[{ required: true, message: "Chọn loại khuyến mãi" }]}
              >
                <Select 
                  placeholder="Chọn loại khuyến mãi"
                  className="rounded-lg"
                  onChange={handlePromotionTypeChange}
                >
                  {PROMOTION_TYPES.map((type) => (
                    <Option key={type.value} value={type.value}>
                      {type.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </div>
            
            <Form.Item
              label={<span className="text-sm font-medium text-gray-700">Chi tiết</span>}
              name="detail"
              rules={[{ required: true, message: "Vui lòng nhập chi tiết" }]}
            >
              <Input.TextArea 
                rows={3}
                placeholder="Mô tả chi tiết về promotion"
                className="rounded-lg border-gray-300 focus:border-pink-500 focus:ring-pink-500"
              />
            </Form.Item>
          </div>

          {/* Time Section */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-700 mb-4 flex items-center gap-2">
              <GiftOutlined className="text-blue-600" />
              Thời gian áp dụng
            </h3>
            
            <Form.Item
              label={<span className="text-sm font-medium text-gray-700">Thời gian áp dụng</span>}
              name="timeRange"
              rules={[{ required: true, message: "Chọn thời gian áp dụng" }]}
            >
              <RangePicker
                showTime={{ format: "HH:mm", defaultValue: [dayjs("00:00", "HH:mm"), dayjs("23:59", "HH:mm")] }}
                format="YYYY-MM-DD HH:mm"
                placeholder={["Bắt đầu", "Kết thúc"]}
                className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </Form.Item>
          </div>

          {/* Discount Info Section */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
            <h3 className="text-lg font-semibold text-green-700 mb-4 flex items-center gap-2">
              <GiftOutlined className="text-green-600" />
              Thông tin giảm giá
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                label={<span className="text-sm font-medium text-gray-700">
                  Giá trị {promotionType === "PERCENTAGE" ? "(%)" : "(VNĐ)"}
                </span>}
                name="value"
                rules={[{ required: true, message: "Nhập giá trị" }]}
              >
                <InputNumber 
                  min={1} 
                  placeholder={promotionType === "PERCENTAGE" ? "Nhập phần trăm (VD: 20)" : "Nhập số tiền (VD: 20000)"}
                  className="w-full rounded-lg border-gray-300 focus:border-green-500 focus:ring-green-500"
                />
              </Form.Item>
              
              {promotionType === "PERCENTAGE" && (
                <Form.Item
                  label={<span className="text-sm font-medium text-gray-700">Tối đa giảm (VNĐ)</span>}
                  name="maxDiscountAmount"
                  rules={[{ required: true, message: "Nhập số tiền giảm tối đa" }]}
                >
                  <InputNumber 
                    min={1} 
                    placeholder="Nhập số tiền tối đa"
                    className="w-full rounded-lg border-gray-300 focus:border-green-500 focus:ring-green-500"
                  />
                </Form.Item>
              )}
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
                label={<span className="text-sm font-medium text-gray-700">Số lần sử dụng tối đa (toàn hệ thống)</span>}
                name="maxTotalUsage"
                rules={[{ required: true, message: "Nhập số lần sử dụng tối đa" }]}
              >
                <InputNumber 
                  min={1} 
                  placeholder="Nhập số lần sử dụng"
                  className="w-full rounded-lg border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                />
              </Form.Item>
              
              <Form.Item
                label={<span className="text-sm font-medium text-gray-700">Số lần sử dụng tối đa mỗi khách hàng</span>}
                name="maxUsagePerCustomer"
                rules={[{ required: true, message: "Nhập số lần sử dụng tối đa mỗi khách hàng" }]}
              >
                <InputNumber 
                  min={1} 
                  placeholder="Nhập số lần sử dụng"
                  className="w-full rounded-lg border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                />
              </Form.Item>
            </div>
          </div>

          {/* Additional Info Section */}
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-200">
            <h3 className="text-lg font-semibold text-orange-700 mb-4 flex items-center gap-2">
              <GiftOutlined className="text-orange-600" />
              Thông tin bổ sung
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                label={<span className="text-sm font-medium text-gray-700">Ảnh (URL)</span>}
                name="image"
                rules={[{ required: false }]}
              >
                <Input 
                  placeholder="Nhập đường dẫn ảnh"
                  className="rounded-lg border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                />
              </Form.Item>
              
              <Form.Item
                name="isExclusive"
                valuePropName="checked"
                className="flex items-center"
              >
                <Checkbox className="text-sm font-medium text-gray-700">Độc quyền</Checkbox>
              </Form.Item>
            </div>
          </div>

          {/* Dynamic Conditions Section */}
          {conditions.length > 0 && (
            <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-4 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <GiftOutlined className="text-gray-600" />
                Điều kiện áp dụng
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {conditions.map((cond) => {
                  if (cond.inputType === "number") {
                    return (
                      <Form.Item
                        key={cond.key}
                        label={<span className="text-sm font-medium text-gray-700">{cond.displayName}</span>}
                        name={cond.key}
                        rules={[{ required: false }]}
                      >
                        <InputNumber 
                          min={0} 
                          placeholder={`Nhập ${cond.displayName.toLowerCase()}`}
                          className="w-full rounded-lg border-gray-300 focus:border-gray-500 focus:ring-gray-500"
                        />
                      </Form.Item>
                    );
                  }
                  if (cond.inputType === "select" || cond.inputType === "multi-select") {
                    return (
                      <Form.Item
                        key={cond.key}
                        label={<span className="text-sm font-medium text-gray-700">{cond.displayName}</span>}
                        name={cond.key}
                        rules={[{ required: false }]}
                      >
                        <Select
                          mode="multiple"
                          allowClear
                          placeholder={`Chọn ${cond.displayName.toLowerCase()}`}
                          className="rounded-lg"
                        >
                          {(cond.options || []).map((opt) => (
                            <Option key={opt.value} value={opt.value}>
                              {opt.label}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    );
                  }
                  if (cond.inputType === "checkbox") {
                    return (
                      <Form.Item
                        key={cond.key}
                        name={cond.key}
                        valuePropName="checked"
                        rules={[{ required: false }]}
                        className="flex items-center"
                      >
                        <Checkbox className="text-sm font-medium text-gray-700">{cond.displayName}</Checkbox>
                      </Form.Item>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          )}

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
              className="px-6 py-2 h-10 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 border-0 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Thêm promotion
            </Button>
          </div>
        </Form>
      </Spin>
    </div>
  );
};

export default AddPromotion;