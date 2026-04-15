import React, { useState, useEffect } from "react";
import { Form, Input, InputNumber, Select } from "antd";
import { updateCinemaRoom, getAllCinemaRooms } from "../../../service/cinemaroom";
import { showSuccessToast, showErrorToast } from "../../../utils/toast";
import { VideoCameraOutlined, HomeOutlined } from "@ant-design/icons";

const EditCinemaRoom = ({ room, onSuccess, onClose }) => {
  const [form] = Form.useForm();
  const [cinemas, setCinemas] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getAllCinemaRooms().then(res => {
      if (res.success && Array.isArray(res.data)) {
        const uniqueCinemas = [];
        const cinemaMap = {};
        res.data.forEach(r => {
          if (r.cinemaId && r.name && !cinemaMap[r.cinemaId]) {
            cinemaMap[r.cinemaId] = true;
            uniqueCinemas.push({ id: r.cinemaId, name: r.name });
          }
        });
        setCinemas(uniqueCinemas);
      }
    });
  }, []);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const payload = {
        roomName: [values.roomName],
        seatQuantity: Number(values.seatQuantity),
        cinemaId: Number(values.cinemaId),
      };

      const res = await updateCinemaRoom(room.cinemaRoomId, payload);

      if (res?.success) {
        showSuccessToast(res.message || "Cập nhật phòng chiếu thành công!");
        form.resetFields();
        onSuccess && onSuccess();
      } else {
        showErrorToast(res.message || "Cập nhật phòng chiếu thất bại!");
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Cập nhật phòng chiếu thất bại!";
      showErrorToast(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4">
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          roomName: room?.roomName || "",
          seatQuantity: room?.seatQuantity || 1,
          cinemaId: room?.cinemaId || "",
        }}
        className="space-y-4"
      >
        {/* Room Information Section */}
        <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <VideoCameraOutlined className="text-white text-sm" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Thông tin phòng chiếu</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Form.Item
              label="Tên phòng"
              name="roomName"
              rules={[{ required: true, message: "Vui lòng nhập tên phòng" }]}
              className="mb-2"
            >
              <Input 
                placeholder="Nhập tên phòng chiếu"
                className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              />
            </Form.Item>
            
            <Form.Item
              label="Số lượng ghế"
              name="seatQuantity"
              rules={[
                { required: true, message: "Vui lòng nhập số lượng ghế" },
                { type: "number", min: 1, message: "Số lượng ghế phải lớn hơn 0" }
              ]}
              className="mb-2"
            >
              <InputNumber 
                min={1}
                placeholder="Nhập số lượng ghế"
                className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                style={{ width: "100%" }}
              />
            </Form.Item>
          </div>
        </div>

        {/* Cinema Selection Section */}
        <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <HomeOutlined className="text-white text-sm" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Chọn rạp chiếu</h3>
          </div>
          
          <Form.Item
            label="Rạp chiếu"
            name="cinemaId"
            rules={[{ required: true, message: "Vui lòng chọn rạp chiếu" }]}
            className="mb-2"
          >
            <Select 
              placeholder="Chọn rạp chiếu"
              className="rounded-lg"
              options={cinemas.map(c => ({ label: c.name, value: c.id }))}
            />
          </Form.Item>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 px-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </Form>
    </div>
  );
};

export default EditCinemaRoom;