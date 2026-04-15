import React, { useState, useEffect } from "react";
import { Modal, Form, DatePicker, Button } from "antd";
import { createCalendar } from "../../../service/calendar";
import { showSuccessToast, showErrorToast } from "../../../utils/toast";
import { CalendarOutlined, ClockCircleOutlined, PlusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;

const AddCalendar = ({ visible, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    if (!visible) form.resetFields();
  }, [visible, form]);

  const disabledDate = (current) => {
    // Không cho chọn ngày trước hôm nay
    return current && current < dayjs().startOf("day");
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      const res = await createCalendar(
        values.range[0].format("YYYY-MM-DD"),
        values.range[1].format("YYYY-MM-DD")
      );
      if (res?.data?.status === 405) {
        showErrorToast(
          res.data.message ||
            "Ngày khởi chiếu và ngày dừng chiếu đã tồn tại!"
        );
        setLoading(false);
        return;
      }
      showSuccessToast("Thêm lịch chiếu thành công!");
      form.resetFields();
      onSuccess && onSuccess();
      onClose();
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Thêm lịch chiếu thất bại!";
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
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
              <CalendarOutlined className="text-white text-lg" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Thêm lịch chiếu mới</h2>
              <p className="text-sm text-gray-600">Tạo lịch chiếu phim cho khoảng thời gian mới</p>
            </div>
          </div>
        }
        open={visible}
        onCancel={() => {
          form.resetFields();
          onClose();
        }}
        footer={null}
        width={600}
        className="!rounded-xl"
        destroyOnClose
      >
        <div className="space-y-6">
          {/* Date Range Selection Section */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                <ClockCircleOutlined className="text-white text-sm" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-blue-900">Khoảng thời gian chiếu</h3>
                <p className="text-sm text-blue-700">Chọn ngày bắt đầu và kết thúc lịch chiếu</p>
              </div>
            </div>
            
            <Form form={form} layout="vertical">
              <Form.Item
                name="range"
                rules={[{ required: true, message: "Vui lòng chọn khoảng thời gian!" }]}
              >
                <RangePicker
                  format="DD/MM/YYYY"
                  style={{ width: "100%" }}
                  disabledDate={disabledDate}
                  placeholder={["Ngày bắt đầu", "Ngày kết thúc"]}
                  className="h-12 text-base"
                />
              </Form.Item>
            </Form>
          </div>



          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              size="large"
              onClick={() => {
                form.resetFields();
                onClose();
              }}
              className="px-6 h-10 border-gray-300 text-gray-700 hover:border-gray-400 hover:text-gray-800"
            >
              Hủy
            </Button>
            <Button
              type="primary"
              size="large"
              loading={loading}
              onClick={handleSubmit}
              className="px-6 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 border-0 shadow-md hover:shadow-lg transition-all duration-300"
            >
              Thêm lịch chiếu
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default AddCalendar;