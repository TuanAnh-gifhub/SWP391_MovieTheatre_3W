import React, { useEffect, useState } from "react";
import { Button, Form, Input, InputNumber, Modal, Table, Tag } from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import {
  createSeatType,
  deleteSeatType,
  getAllSeatTypes,
  updateSeatType,
} from "../../../service/seat";
import { showErrorToast, showSuccessToast } from "../../../utils/toast";

const SeatTypeManagement = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  const fetchSeatTypes = async () => {
    setLoading(true);
    try {
      const res = await getAllSeatTypes();
      if (res.success) {
        setData(Array.isArray(res.data) ? res.data : []);
      } else {
        setData([]);
        showErrorToast(res.message || "Không thể tải danh sách loại ghế");
      }
    } catch (error) {
      setData([]);
      showErrorToast("Không thể tải danh sách loại ghế");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeatTypes();
  }, []);

  const openCreateModal = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ active: true, sortOrder: 0, basePrice: 0 });
    setModalOpen(true);
  };

  const openEditModal = (record) => {
    setEditing(record);
    form.setFieldsValue(record);
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        code: values.code,
        name: values.name,
        description: values.description,
        basePrice: Number(values.basePrice || 0),
        active: values.active !== false,
        sortOrder: Number(values.sortOrder || 0),
      };

      const res = editing
        ? await updateSeatType(editing.seatTypeID, payload)
        : await createSeatType(payload);

      if (res.success) {
        showSuccessToast(res.message || (editing ? "Cập nhật loại ghế thành công" : "Tạo loại ghế thành công"));
        setModalOpen(false);
        setEditing(null);
        form.resetFields();
        fetchSeatTypes();
      } else {
        showErrorToast(res.message || "Thao tác thất bại");
      }
    } catch (error) {
      showErrorToast(error?.message || "Vui lòng kiểm tra lại dữ liệu");
    }
  };

  const handleDelete = (record) => {
    Modal.confirm({
      title: "Xóa loại ghế",
      content: `Bạn có chắc muốn xóa loại ghế \"${record.name}\" không?`,
      okText: "Xóa",
      okButtonProps: { danger: true },
      cancelText: "Hủy",
      onOk: async () => {
        const res = await deleteSeatType(record.seatTypeID);
        if (res.success) {
          showSuccessToast(res.message || "Xóa loại ghế thành công");
          fetchSeatTypes();
        } else {
          showErrorToast(res.message || "Không thể xóa loại ghế");
        }
      },
    });
  };

  const columns = [
    { title: "Mã", dataIndex: "code", key: "code" },
    { title: "Tên", dataIndex: "name", key: "name" },
    { title: "Mô tả", dataIndex: "description", key: "description" },
    {
      title: "Giá cơ bản",
      dataIndex: "basePrice",
      key: "basePrice",
      render: (value) => Number(value || 0).toLocaleString("vi-VN") + " đ",
    },
    {
      title: "Trạng thái",
      dataIndex: "active",
      key: "active",
      render: (value) => (value ? <Tag color="green">Đang hoạt động</Tag> : <Tag color="red">Ngừng</Tag>),
    },
    { title: "Số ghế", dataIndex: "seatCount", key: "seatCount" },
    { title: "Thứ tự", dataIndex: "sortOrder", key: "sortOrder" },
    {
      title: "Thao tác",
      key: "actions",
      render: (_, record) => (
        <div className="flex gap-2">
          <Button icon={<EditOutlined />} onClick={() => openEditModal(record)}>
            Sửa
          </Button>
          <Button danger icon={<DeleteOutlined />} onClick={() => handleDelete(record)}>
            Xóa
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-4 bg-white rounded-xl shadow">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Quản lý loại ghế</h2>
          <p className="text-gray-500">Thêm, sửa, xoá loại ghế và giá cơ bản</p>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
          Thêm loại ghế
        </Button>
      </div>

      <Table
        rowKey="seatTypeID"
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={{ pageSize: 8 }}
      />

      <Modal
        title={editing ? "Chỉnh sửa loại ghế" : "Thêm loại ghế"}
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        onOk={handleSubmit}
        okText={editing ? "Cập nhật" : "Tạo mới"}
        cancelText="Hủy"
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item name="code" label="Mã loại ghế" rules={[{ required: true, message: "Vui lòng nhập mã loại ghế" }]}>
            <Input placeholder="VIP, STANDARD, DOUBLE..." />
          </Form.Item>
          <Form.Item name="name" label="Tên loại ghế" rules={[{ required: true, message: "Vui lòng nhập tên loại ghế" }]}>
            <Input placeholder="Ghế VIP" />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={3} placeholder="Mô tả ngắn" />
          </Form.Item>
          <Form.Item name="basePrice" label="Giá cơ bản" rules={[{ required: true, message: "Vui lòng nhập giá cơ bản" }]}>
            <InputNumber min={0} className="w-full" style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="sortOrder" label="Thứ tự hiển thị">
            <InputNumber min={0} className="w-full" style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SeatTypeManagement;

