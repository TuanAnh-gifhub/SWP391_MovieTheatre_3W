import React from "react";
import { Modal } from "antd";

const AddEmployee = ({ visible, onCancel }) => {
  return (
    <>
      <Modal
        title="Thêm nhân viên mới"
        open={visible}
        onCancel={onCancel}
        footer={null}
        width={700}
        className="!rounded-xl"
      >
        {/* Nội dung thêm nhân viên sẽ được thêm vào đây */}
      </Modal>
    </>
  );
};

export default AddEmployee;