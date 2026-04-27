import React, { useState, useEffect } from "react";
import { Modal, Form, DatePicker } from "antd";
import dayjs from "dayjs";
import { updateCalendar } from "../../../service/calendar";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const EditCalendar = ({ visible, calendar, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (calendar) {
      form.setFieldsValue({
        fromDate: calendar.fromDate ? dayjs(calendar.fromDate) : null,
        toDate: calendar.toDate ? dayjs(calendar.toDate) : null,
      });
    }
  }, [calendar, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      const res = await updateCalendar(
        calendar.id,
        values.fromDate.format("YYYY-MM-DD"),
        values.toDate.format("YYYY-MM-DD")
      );
      // Kiểm tra response nếu cần
      if (res?.data?.status === 200 || res?.status === 200) {
        toast.success("Cập nhật lịch thành công!");
        onSuccess && onSuccess();
      } else {
        toast.error("Cập nhật lịch thất bại!");
      }
    } catch (err) {
      toast.error("Cập nhật lịch thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Chỉnh sửa lịch chiếu"
      open={visible}
      onOk={handleOk}
      onCancel={onClose}
      confirmLoading={loading}
      okText="Lưu"
      cancelText="Hủy"
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="Từ ngày"
          name="fromDate"
          rules={[{ required: true, message: "Vui lòng chọn ngày bắt đầu!" }]}
        >
          <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item
          label="Đến ngày"
          name="toDate"
          rules={[{ required: true, message: "Vui lòng chọn ngày kết thúc!" }]}
        >
          <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditCalendar;