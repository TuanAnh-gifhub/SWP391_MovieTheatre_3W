import React, { useState, useEffect } from "react";
import { Modal, Form, Input, InputNumber, Switch, Button, Divider, Select } from "antd";
import { CoffeeOutlined, PlusOutlined, CloseOutlined } from "@ant-design/icons";
import { updateFoodAndDrink } from "../../../service/foodanddrink";
import { showSuccessToast, showErrorToast } from "../../../utils/toast";

const EditFoodAndDrink = ({ visible = true, onSuccess, onClose, food }) => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    if (food) {
      form.setFieldsValue({
        name: food.name,
        description: food.description,
        price: food.price,
        type: food.type,
        image: food.image,
        active: food.active,
      });
    }
  }, [food, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      const res = await updateFoodAndDrink(food.id, {
        id: food.id,
        name: values.name.trim(),
        description: values.description?.trim() || "",
        price: Number(values.price),
        type: values.type?.trim() || "",
        image: values.image?.trim() || "",
        active: values.active,
      });
      setLoading(false);
      if (res.status === 200) {
        showSuccessToast(res.message);
        form.resetFields();
        onSuccess && onSuccess();
        onClose && onClose();
      } else {
        showErrorToast(res.message);
      }
    } catch (err) {
      showErrorToast("Vui lòng nhập đầy đủ và hợp lệ thông tin!");
      setLoading(false);
    }
  };

  return (
    <Modal
      open={visible}
      title={null}
      onCancel={() => {
        form.resetFields();
        onClose && onClose();
      }}
      footer={null}
      destroyOnHidden
      width={600}
      className="!rounded-xl"
    >
      <div className="p-0">
        {/* Header Section */}
        <div className="rounded-t-xl p-3 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
              <CoffeeOutlined className="text-sm text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Chỉnh sửa đồ ăn/đồ uống</h2>
              <p className="text-xs text-gray-600">Cập nhật thông tin đồ ăn và đồ uống</p>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className="p-3">
          <Form
            form={form}
            layout="vertical"
            initialValues={{
              name: food?.name || "",
              description: food?.description || "",
              price: food?.price || 0,
              type: food?.type || "",
              image: food?.image || "",
              active: food?.active ?? true,
            }}
            className="space-y-3"
          >
            {/* Basic Information Section */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-2 border border-blue-200">
              <h3 className="text-sm font-semibold text-blue-700 mb-2 flex items-center gap-2">
                <CoffeeOutlined className="text-blue-600" />
                Thông tin cơ bản
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <Form.Item
                  label={<span className="text-sm font-medium text-gray-700">Tên đồ ăn/uống</span>}
                  name="name"
                  rules={[{ required: true, message: "Vui lòng nhập tên" }]}
                >
                  <Input 
                    placeholder="Nhập tên đồ ăn/uống" 
                    className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  />
                </Form.Item>
                
                <Form.Item
                  label={<span className="text-sm font-medium text-gray-700">Loại</span>}
                  name="type"
                  rules={[{ required: true, message: "Vui lòng chọn loại" }]}
                >
                  <Select
                    placeholder="Chọn loại đồ ăn/uống"
                    className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    options={[
                      { value: "Đồ ăn", label: "Đồ ăn" },
                      { value: "Nước uống", label: "Nước uống" },
                      { value: "Combo", label: "Combo" },
                      { value: "Khác", label: "Khác" },
                    ]}
                  />
                </Form.Item>
              </div>
            </div>

            <Divider className="my-2" />

            {/* Description Section */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-2 border border-green-200">
              <h3 className="text-sm font-semibold text-green-700 mb-2 flex items-center gap-2">
                <CoffeeOutlined className="text-green-600" />
                Mô tả chi tiết
              </h3>
              
              <Form.Item
                label={<span className="text-sm font-medium text-gray-700">Mô tả</span>}
                name="description"
              >
                <Input.TextArea 
                  placeholder="Nhập mô tả chi tiết về đồ ăn/uống..." 
                  rows={3}
                  className="rounded-lg border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-500"
                />
              </Form.Item>
            </div>

            <Divider className="my-2" />

            {/* Price Section */}
            <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg p-2 border border-purple-200">
              <h3 className="text-sm font-semibold text-purple-700 mb-2 flex items-center gap-2">
                <CoffeeOutlined className="text-purple-600" />
                Thông tin giá
              </h3>
              
              <Form.Item
                label={<span className="text-sm font-medium text-gray-700">Giá (VNĐ)</span>}
                name="price"
                rules={[
                  { required: true, message: "Vui lòng nhập giá" },
                  { type: "number", min: 0, message: "Giá phải >= 0" },
                ]}
              >
                <InputNumber 
                  min={0} 
                  style={{ width: "100%" }} 
                  placeholder="Nhập giá" 
                  className="rounded-lg border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-500"
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>
            </div>

            <Divider className="my-2" />

            {/* Image Section */}
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg p-2 border border-orange-200">
              <h3 className="text-sm font-semibold text-orange-700 mb-2 flex items-center gap-2">
                <CoffeeOutlined className="text-orange-600" />
                Hình ảnh
              </h3>
              
              <Form.Item
                label={<span className="text-sm font-medium text-gray-700">Link ảnh</span>}
                name="image"
              >
                <Input 
                  placeholder="Dán link ảnh (nếu có)" 
                  className="rounded-lg border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500"
                />
              </Form.Item>
            </div>

            <Divider className="my-2" />

            {/* Status Section */}
            <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-lg p-2 border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <CoffeeOutlined className="text-gray-600" />
                Trạng thái
              </h3>
              
              <Form.Item
                label={<span className="text-sm font-medium text-gray-700">Đang bán</span>}
                name="active"
                valuePropName="checked"
              >
                <Switch 
                  className="bg-gray-200"
                  checkedChildren="Bật"
                  unCheckedChildren="Tắt"
                />
              </Form.Item>
            </div>
          </Form>
        </div>

        {/* Actions Section */}
        <div className="flex justify-end gap-2 p-3 rounded-b-xl">
          <Button
            onClick={() => {
              form.resetFields();
              onClose && onClose();
            }}
            className="px-3 py-1 h-8 border-gray-300 text-gray-700 hover:border-gray-400 hover:text-gray-800 bg-white shadow-sm rounded-lg text-sm"
            
          >
            Hủy
          </Button>
          <Button
            type="primary"
            onClick={handleOk}
            loading={loading}
            className="px-3 py-1 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg text-sm"
            
          >
            Cập nhật
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default EditFoodAndDrink;