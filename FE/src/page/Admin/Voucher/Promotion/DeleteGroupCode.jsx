import React, { useState } from "react";
import { Modal } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { deletePromotionGroupCode } from "../../../../service/voucher";
import { toast } from "react-toastify";

const DeleteGroupCode = ({ groupId, open, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    const res = await deletePromotionGroupCode(groupId);
    setLoading(false);
    if (res.status === 200) {
      toast.success(res.message || "Xóa group code thành công!");
      onSuccess && onSuccess();
      onClose && onClose();
    } else {
      toast.error(res.message || "Xóa group code thất bại!");
    }
  };

  return (
    <Modal
      open={open}
      title="Xác nhận xóa group code"
      onCancel={onClose}
      onOk={handleDelete}
      confirmLoading={loading}
      okText="Xóa"
      okType="danger"
      cancelText="Hủy"
      centered
    >
      <ExclamationCircleOutlined style={{ color: "#faad14", fontSize: 22, marginRight: 8 }} />
      Bạn có chắc chắn muốn xóa group code này không?
    </Modal>
  );
};

export default DeleteGroupCode;