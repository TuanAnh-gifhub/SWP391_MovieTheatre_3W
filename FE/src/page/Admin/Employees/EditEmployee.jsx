import React from "react";
import { Modal } from "antd";

const EditEmployee = ({ visible, onCancel }) => {
  return (
    <>
      <Modal
        title="Chỉnh sửa nhân viên"
        open={visible}
        onCancel={onCancel}
        footer={null}
        destroyOnClose
        width={700}
        className="!rounded-xl"
      >
        {/* Nội dung chỉnh sửa nhân viên sẽ được thêm vào đây */}
      </Modal>
    </>
  );
};

export default EditEmployee;

