import React from "react";
import { Modal } from "antd";
import { deleteFoodAndDrink } from "../../../service/foodanddrink";
import { showSuccessToast, showErrorToast } from "../../../utils/toast";

const DeleteFoodAndDrink = ({ visible, food, onSuccess, onClose }) => {
  const handleDelete = async () => {
    const res = await deleteFoodAndDrink(food.id);
    if (res.status === 200) {
      showSuccessToast(res.message);
      onSuccess && onSuccess();
      onClose && onClose();
    } else {
      showErrorToast(res.message);
    }
  };

  return (
    <Modal
      open={visible}
      title="Xác nhận xóa"
      onOk={handleDelete}
      onCancel={onClose}
      okText="Xóa"
      cancelText="Hủy"
      okButtonProps={{ danger: true }}
      destroyOnHidden
    >
      <p>Bạn có chắc chắn muốn xóa <b>{food?.name}</b>?</p>
    </Modal>
  );
};

export default DeleteFoodAndDrink;