import React, { useState } from "react";
import { Modal, Button, Typography } from "antd";
import { DeleteOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import { deleteRole } from "../../../service/permission/index";
import { toast } from "react-toastify";

const { Text } = Typography;

const RemoveRole = ({ visible, onCancel, onSuccess, roleData }) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!roleData?.roleId) {
      toast.error("Không tìm thấy thông tin role!");
      return;
    }

    setLoading(true);
    try {
      const response = await deleteRole(roleData.roleId);

      if (!response.error) {
        toast.success(response.message);
        onSuccess && onSuccess();
        onCancel();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi xóa role!");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    onCancel();
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-3">
          <ExclamationCircleOutlined className="text-red-500 text-xl" />
          <span className="text-xl font-bold text-red-600">Xác nhận xóa Role</span>
        </div>
      }
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={500}
      centered
      className="remove-role-modal"
    >
      <div className="p-4">
        <div className="mb-6">
          <Text className="text-lg">
            Bạn có chắc chắn muốn xóa role <strong>"{roleData?.roleName}"</strong> không?
          </Text>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <ExclamationCircleOutlined className="text-red-500 text-lg mt-1" />
            <div>
              <Text className="text-red-700 font-semibold block mb-2">
                Lưu ý quan trọng:
              </Text>
              <ul className="text-red-600 text-sm space-y-1">
                <li>• Hành động này không thể hoàn tác</li>
                <li>• Tất cả quyền hạn của role sẽ bị xóa</li>
                <li>• Người dùng có role này sẽ bị ảnh hưởng</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button
            onClick={handleCancel}
            size="large"
            className="border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-700"
          >
            Hủy
          </Button>
          <Button
            type="primary"
            danger
            loading={loading}
            size="large"
            className="bg-red-500 border-red-500 hover:bg-red-600 hover:border-red-600"
            icon={<DeleteOutlined />}
            onClick={handleDelete}
          >
            Xóa Role
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default RemoveRole;
