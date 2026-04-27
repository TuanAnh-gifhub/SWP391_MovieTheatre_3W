import React, { useState } from "react";
import { Modal, Button } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { deletePromotion } from "../../../../service/voucher";
import { toast } from "react-toastify";

const DeletePromotion = ({ promotionId, open, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    const res = await deletePromotion(promotionId);
    setLoading(false);
    if (res.status === 200) {
      toast.success(res.message || "Xóa thành công!");
      onSuccess && onSuccess();
      onClose && onClose();
    } else {
      toast.error(res.message || "Xóa thất bại!");
    }
  };

  return (
    <Modal
      open={open}
      title="Xác nhận xóa khuyến mãi"
      onCancel={onClose}
      onOk={handleDelete}
      confirmLoading={loading}
      okText="Xóa"
      okType="danger"
      cancelText="Hủy"
      centered
    >
      <ExclamationCircleOutlined style={{ color: "#faad14", fontSize: 22, marginRight: 8 }} />
      Bạn có chắc chắn muốn xóa khuyến mãi này không?
    </Modal>
  );
};

export default DeletePromotion;