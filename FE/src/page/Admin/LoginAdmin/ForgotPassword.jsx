import React, { useState } from "react";
import { Modal, Input, Button, Form } from "antd";
import { toast } from "react-toastify";
import { resetPasswordAdmin } from "../../../service/login";

const ForgotPassword = ({ visible, onCancel }) => {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!email || !newPassword || !confirmPassword) {
      toast.error("Vui lòng nhập đầy đủ thông tin!");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp!");
      return;
    }
    setLoading(true);
    const res = await resetPasswordAdmin({
      email,
      newPassword,
      confirmPassword,
    });
    setLoading(false);
    if (res?.success) {
      toast.success(res.message || "Đổi mật khẩu thành công!");
      onCancel();
    } else {
      toast.error(res.message || "Đổi mật khẩu thất bại!");
    }
  };

  return (
    <Modal
      open={visible}
      onCancel={onCancel}
      footer={null}
      title="Quên mật khẩu"
      destroyOnHidden
    >
      <Form layout="vertical" onFinish={handleResetPassword}>
        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: "Vui lòng nhập email!" },
            { type: "email", message: "Email không hợp lệ!" },
          ]}
        >
          <Input
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Nhập email"
          />
        </Form.Item>
        <Form.Item
          label="Mật khẩu mới"
          name="newPassword"
          rules={[{ required: true, message: "Vui lòng nhập mật khẩu mới!" }]}
        >
          <Input.Password
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            placeholder="Nhập mật khẩu mới"
          />
        </Form.Item>
        <Form.Item
          label="Xác nhận mật khẩu"
          name="confirmPassword"
          dependencies={["newPassword"]}
          rules={[
            { required: true, message: "Vui lòng xác nhận mật khẩu!" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || value === newPassword) {
                  return Promise.resolve();
                }
                return Promise.reject("Mật khẩu xác nhận không khớp!");
              },
            }),
          ]}
        >
          <Input.Password
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            placeholder="Nhập lại mật khẩu mới"
          />
        </Form.Item>
        <Button type="primary" htmlType="submit" loading={loading} block>
          Đổi mật khẩu
        </Button>
      </Form>
    </Modal>
  );
};

export default ForgotPassword;