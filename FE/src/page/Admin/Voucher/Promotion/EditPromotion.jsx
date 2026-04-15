import React, { useEffect, useState } from "react";
import { Form, Input, InputNumber, DatePicker, Select, Button, Checkbox, Spin } from "antd";
import { updatePromotion, getPromotionConditions } from "../../../../service/voucher";
import { getAllRoles } from "../../../../service/permission";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import { GiftOutlined, SaveOutlined, CloseOutlined } from "@ant-design/icons";

const { Option } = Select;
const { RangePicker } = DatePicker;

const PROMOTION_TYPES = [
  { value: "PERCENTAGE", label: "Phần trăm (%)" },
  { value: "FIXED_AMOUNT", label: "Số tiền cố định" },
  { value: "COMBO", label: "Combo" },
];

const EditPromotion = ({ promotion, onSuccess, onCancel }) => {
  const [form] = Form.useForm();
  const [conditions, setConditions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [promotionType, setPromotionType] = useState("PERCENTAGE");
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    fetchConditions();
    fetchRoles();
    // eslint-disable-next-line
  }, [promotion]);

  useEffect(() => {
    if (promotion && roles.length > 0) {
      // applicableRoles sẽ được giữ nguyên là role names
      let conditionValues = { ...promotion.condition };
      
      // Đảm bảo applicableRoles là array
      if (!conditionValues.applicableRoles) {
        conditionValues.applicableRoles = [];
      }

      // Set initial form values
      form.setFieldsValue({
        ...promotion,
        timeRange: [
          dayjs(promotion.startTime),
          dayjs(promotion.endTime),
        ],
        ...conditionValues,
      });
      setPromotionType(promotion.promotionType);
    }
    // eslint-disable-next-line
  }, [promotion, roles]);

  const fetchConditions = async () => {
    setLoading(true);
    const res = await getPromotionConditions();
    if (res.status === 200) {
      setConditions(res.result);
    }
    setLoading(false);
  };

  const fetchRoles = async () => {
    try {
      const res = await getAllRoles();
      if (!res.error) {
        setRoles(res.result || []);
      } else {
        console.error("Error fetching roles:", res.message);
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  };

  const handleFinish = async (values) => {
    setLoading(true);
    try {
      const [start, end] = values.timeRange;
      let condition = {};
      conditions.forEach((cond) => {
        if (values[cond.key] !== undefined && values[cond.key] !== null && values[cond.key] !== "") {
          if (cond.inputType === "multi-select") {
            // applicableRoles đã là role names, không cần chuyển đổi
            if (cond.key === "applicableRoles") {
              condition[cond.key] = values[cond.key];
            } else {
              condition[cond.key] = values[cond.key];
            }
          } else if (cond.inputType === "select") {
            condition[cond.key] = Array.isArray(values[cond.key]) ? values[cond.key] : [values[cond.key]];
          } else {
            condition[cond.key] = values[cond.key];
          }
        }
      });

      const payload = {
        promotionId: promotion.promotionId,
        title: values.title,
        startTime: start.set("second", 0).set("millisecond", 0).toISOString(),
        endTime: end.set("second", 0).set("millisecond", 0).toISOString(),
        detail: values.detail,
        value: values.value,
        image: values.image || "",
        isExclusive: values.isExclusive || false,
        promotionType: values.promotionType,
        maxDiscountAmount: values.maxDiscountAmount,
        condition,
        status: values.status || promotion.status,
      };

      const res = await updatePromotion(payload);
      if (res.status === 200) {
        toast.success(res.message || "Cập nhật khuyến mãi thành công!");
        onSuccess && onSuccess();
      } else {
        toast.error(res.message || "Cập nhật khuyến mãi thất bại!");
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
          <h2 className="text-xl font-bold text-gray-900">Chỉnh sửa promotion</h2>
          <p className="text-sm text-gray-600">Cập nhật thông tin chương trình khuyến mãi</p>
        </div>
      </div>

      {/* Form */}
      <Spin spinning={loading}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
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
                    // Nếu là applicableRoles, hiển thị danh sách roles từ API
                    if (cond.key === "applicableRoles") {
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
                            {roles.filter(role => role && role.roleId && role.roleName).map((role) => (
                              <Option key={role.roleId} value={role.roleName}>
                                {role.roleName}
                              </Option>
                            ))}
                          </Select>
                        </Form.Item>
                      );
                    } else {
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
              Lưu thay đổi
            </Button>
          </div>
        </Form>
      </Spin>
    </div>
  );
};

export default EditPromotion;