import React, { useEffect, useState } from "react";
import { Modal, Form, InputNumber, Divider } from "antd";
import { updateLoyaltyRule } from "../../../service/loyalty";
import { showSuccessToast, showErrorToast } from "../../../utils/toast";
import { TrophyOutlined, DollarOutlined, GiftOutlined, SwapOutlined } from "@ant-design/icons";

const EditLoyaltySetPrice = ({ visible = true, onSuccess, onClose, rule }) => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    if (rule) {
      form.setFieldsValue({
        amountMoney: rule.amountMoney,
        pointsEarn: rule.pointsEarn,
        returnMoney: rule.returnMoney,
      });
    }
  }, [rule, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      const res = await updateLoyaltyRule(rule.id, {
        amountMoney: Number(values.amountMoney),
        pointsEarn: Number(values.pointsEarn),
        returnMoney: Number(values.returnMoney),
      });

      if (res && res.status === 200) {
        showSuccessToast(res.message || "Cập nhật quy tắc tích điểm thành công!");
        form.resetFields();
        onSuccess && onSuccess();
        onClose && onClose();
      } else {
        showErrorToast(res.message || "Cập nhật quy tắc tích điểm thất bại!");
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Cập nhật quy tắc tích điểm thất bại!";
      showErrorToast(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
            <TrophyOutlined className="text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">Chỉnh sửa quy tắc tích điểm & đổi điểm</span>
        </div>
      }
      open={visible}
      onOk={handleOk}
      onCancel={() => {
        form.resetFields();
        onClose && onClose();
      }}
      confirmLoading={loading}
      okText="Cập nhật"
      cancelText="Hủy"
      destroyOnHidden
      width={600}
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
          amountMoney: rule?.amountMoney || 0,
          pointsEarn: rule?.pointsEarn || 0,
          returnMoney: rule?.returnMoney || 0,
        }}
        className="mt-2"
      >
        {/* Money Input Section */}
        <div className="mb-3 p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-5 h-5 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <DollarOutlined className="text-white text-xs" />
            </div>
            <h3 className="text-base font-semibold text-gray-900">Thông tin tiền vé</h3>
          </div>
          
          <Form.Item
            label="Số tiền (VNĐ) / 1 vé"
            name="amountMoney"
            rules={[
              { required: true, message: "Vui lòng nhập số tiền" },
              { type: "number", min: 1, message: "Số tiền phải > 0" },
            ]}
            className="mb-1"
          >
            <InputNumber 
              min={1} 
              style={{ width: "100%", color: "black" }} 
              placeholder="Nhập số tiền, ví dụ: 50000"
              className="rounded-lg border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-500 text-black"
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\$\s?|(,*)/g, '')}
            />
          </Form.Item>
        </div>

        <Divider className="my-3" />

        {/* Points Earn Section */}
        <div className="mb-3 p-3 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-5 h-5 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
              <GiftOutlined className="text-white text-xs" />
            </div>
            <h3 className="text-base font-semibold text-gray-900">Thông tin tích điểm</h3>
          </div>
          
          <Form.Item
            label="Điểm tích được / 1 vé"
            name="pointsEarn"
            rules={[
              { required: true, message: "Vui lòng nhập số điểm tích được" },
              { type: "number", min: 1, message: "Điểm phải > 0" },
            ]}
            className="mb-1"
          >
            <InputNumber 
              min={1} 
              style={{ width: "100%", color: "black" }} 
              placeholder="Nhập điểm tích được, ví dụ: 1000"
              className="rounded-lg border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500 text-black"
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\$\s?|(,*)/g, '')}
            />
          </Form.Item>
        </div>

        <Divider className="my-3" />

        {/* Return Money Section */}
        <div className="mb-3 p-3 bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl border border-purple-200">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-5 h-5 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg flex items-center justify-center">
              <SwapOutlined className="text-white text-xs" />
            </div>
            <h3 className="text-base font-semibold text-gray-900">Thông tin quy đổi</h3>
          </div>
          
          <Form.Item
            label="Số tiền quy đổi / 1 điểm"
            name="returnMoney"
            rules={[
              { required: true, message: "Vui lòng nhập số tiền quy đổi" },
              { type: "number", min: 1, message: "Số tiền quy đổi phải > 0" },
            ]}
            className="mb-1"
          >
            <InputNumber 
              min={1} 
              style={{ width: "100%", color: "black" }} 
              placeholder="Nhập số tiền quy đổi, ví dụ: 2000"
              className="rounded-lg border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-500 text-black"
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\$\s?|(,*)/g, '')}
            />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
};

export default EditLoyaltySetPrice;