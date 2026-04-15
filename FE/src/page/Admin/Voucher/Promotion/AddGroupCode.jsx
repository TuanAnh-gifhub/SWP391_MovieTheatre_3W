import React from "react";
import { Form, Input, Button, Spin } from "antd";
import { createPromotionGroupCode } from "../../../../service/voucher";
import { toast } from "react-toastify";
import { TagOutlined, PlusOutlined, CloseOutlined } from "@ant-design/icons";

const AddGroupCode = ({ onSuccess, onCancel }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(false);

  const handleFinish = async (values) => {
    setLoading(true);
    const res = await createPromotionGroupCode(values);
    setLoading(false);
    if (res.status === 200) {
      toast.success(res.message || "Tạo group thành công!");
      form.resetFields();
      onSuccess && onSuccess();
    } else {
      toast.error(res.message || "Tạo group thất bại!");
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
          <TagOutlined className="text-xl text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Thêm group code mới</h2>
          <p className="text-sm text-gray-600">Tạo nhóm mã khuyến mãi và phân loại mới</p>
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
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-700 mb-4 flex items-center gap-2">
              <TagOutlined className="text-blue-600" />
              Thông tin cơ bản
            </h3>
            
            <div className="space-y-4">
              <Form.Item
                label={<span className="text-sm font-medium text-gray-700">Tên group code</span>}
                name="groupCode"
                rules={[{ required: true, message: "Vui lòng nhập tên group code" }]}
              >
                <Input 
                  placeholder="Nhập tên group code (VD: VIP, NEW_USER, etc.)"
                  className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </Form.Item>
              
              <Form.Item
                label={<span className="text-sm font-medium text-gray-700">Mô tả</span>}
                name="description"
                rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
              >
                <Input.TextArea 
                  rows={3}
                  placeholder="Mô tả chi tiết về group code và mục đích sử dụng"
                  className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </Form.Item>
            </div>
          </div>

          {/* Usage Info Section */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
            <h3 className="text-lg font-semibold text-green-700 mb-4 flex items-center gap-2">
              <TagOutlined className="text-green-600" />
              Hướng dẫn sử dụng
            </h3>
            
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <p>Group code sẽ được sử dụng để phân loại và quản lý các promotion</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <p>Sau khi tạo, bạn có thể gán các promotion vào group này</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <p>Tên group code nên ngắn gọn và dễ nhớ</p>
              </div>
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
              className="px-6 py-2 h-10 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 border-0 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Thêm group code
            </Button>
          </div>
        </Form>
      </Spin>
    </div>
  );
};

export default AddGroupCode;