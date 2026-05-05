import React, { useState, useEffect } from "react";
import { Form, InputNumber, Select } from "antd";
import { createSeats, getAllSeatTypes } from "../../../service/seat";
import { getAllCinemaRooms } from "../../../service/cinemaroom";
import { showSuccessToast, showErrorToast } from "../../../utils/toast";
import { HomeOutlined, UserOutlined, DollarOutlined } from "@ant-design/icons";

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const seatNumbers = Array.from({ length: 10 }, (_, i) => i + 1); // 1-10

const generateSeatNames = () => {
  const seats = [];
  alphabet.forEach(letter => {
    seatNumbers.forEach(num => {
      seats.push(`${letter}${num}`);
    });
  });
  return seats;
};

const AddSeat = ({ onSuccess, onClose, selectedRoom }) => {
  const [form] = Form.useForm();
  const [cinemaRooms, setCinemaRooms] = useState([]);
  const [seatTypes, setSeatTypes] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getAllCinemaRooms().then(res => {
      if (res.success && Array.isArray(res.data)) {
        // Lấy danh sách phòng chiếu duy nhất
        const uniqueRooms = [];
        const roomMap = {};
        res.data.forEach(room => {
          const roomId = room.cinemaRoomID || room.cinemaRoomId;
          if (roomId && room.roomName && !roomMap[roomId]) {
            roomMap[roomId] = true;
            uniqueRooms.push({ id: roomId, name: room.roomName });
          }
        });

        setCinemaRooms(uniqueRooms);
      }
    });
    getAllSeatTypes().then(res => {
      if (res.success && Array.isArray(res.data)) {
        setSeatTypes(res.data);
        const firstType = res.data[0];
        if (firstType) {
          form.setFieldsValue({
            seatTypeId: firstType.seatTypeID,
            price: firstType.basePrice,
          });
        }
      }
    });
  }, []);

  const allSeatNames = generateSeatNames();

  const handleSeatToggle = seatName => {
    setSelectedSeats(prev =>
      prev.includes(seatName)
        ? prev.filter(s => s !== seatName)
        : [...prev, seatName]
    );
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (selectedSeats.length === 0) {
        showErrorToast("Vui lòng chọn ít nhất một ghế!");
        return;
      }

      setLoading(true);
      const seats = selectedSeats.map(seatName => ({
        seatName,
        seatTypeId: values.seatTypeId,
        seatType: seatTypes.find(t => t.seatTypeID === values.seatTypeId)?.code || seatTypes.find(t => t.seatTypeID === values.seatTypeId)?.name,
        price: Number(values.price),
      }));

      const res = await createSeats({ 
        cinemaRoomId: Number(values.cinemaRoomId), 
        seats 
      });

      if (res?.success) {
        showSuccessToast(res.message || "Tạo ghế thành công!");
        form.resetFields();
        setSelectedSeats([]);
        onSuccess && onSuccess();
      } else {
        showErrorToast(res.message || "Tạo ghế thất bại!");
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Tạo ghế thất bại!";
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
          cinemaRoomId: (() => {
            // Ưu tiên tìm theo ID trước
            if (selectedRoom?.cinemaRoomID) {
              const matchingRoomById = cinemaRooms.find(r => r.id === selectedRoom.cinemaRoomID);
              if (matchingRoomById) {
                return selectedRoom.cinemaRoomID;
              }
            }
            
            // Nếu không tìm được theo ID, tìm theo tên
            if (selectedRoom?.roomName) {
              const matchingRoomByName = cinemaRooms.find(r => r.name === selectedRoom.roomName);
              if (matchingRoomByName) {
                return matchingRoomByName.id;
              }
            }
            
            return selectedRoom?.cinemaRoomID || selectedRoom?.cinemaRoomId || "";
          })(),
          seatTypeId: seatTypes[0]?.seatTypeID,
          price: seatTypes[0]?.basePrice || 10000,
        }}
        className="space-y-4"
      >
        {/* Room Selection Section */}
        <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <HomeOutlined className="text-white text-sm" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Chọn phòng chiếu</h3>
          </div>
          
          <Form.Item
            label="Phòng chiếu"
            name="cinemaRoomId"
            rules={[{ required: true, message: "Vui lòng chọn phòng chiếu" }]}
            className="mb-2"
          >
            <Select 
              placeholder="Chọn phòng chiếu"
              className="rounded-lg"
              options={cinemaRooms.map(r => ({ label: r.name, value: r.id }))}
              disabled={!!selectedRoom}
            />
          </Form.Item>
        </div>

        {/* Seat Selection Section */}
        <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <UserOutlined className="text-white text-sm" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Chọn ghế</h3>
          </div>
          
          <div className="mb-3">
            <p className="text-sm text-gray-600 mb-2">Tích vào ghế muốn thêm:</p>
            <div className="grid grid-cols-10 gap-1 max-h-64 overflow-y-auto border rounded-lg p-3 bg-gray-50">
              {allSeatNames.map(seatName => (
                <button
                  type="button"
                  key={seatName}
                  className={`border rounded px-2 py-1 text-xs transition-all duration-200
                    ${selectedSeats.includes(seatName)
                      ? "bg-blue-600 text-white border-blue-600 shadow-md"
                      : "bg-white text-gray-800 border-gray-300 hover:bg-blue-50 hover:border-blue-400"}
                  `}
                  onClick={() => handleSeatToggle(seatName)}
                >
                  {seatName}
                </button>
              ))}
            </div>
            {selectedSeats.length > 0 && (
              <p className="text-sm text-green-600 mt-2">
                Đã chọn {selectedSeats.length} ghế: {selectedSeats.join(", ")}
              </p>
            )}
          </div>
        </div>

        {/* Seat Configuration Section */}
        <div className="p-4 bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl border border-purple-200">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg flex items-center justify-center">
              <DollarOutlined className="text-white text-sm" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Cấu hình ghế</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Form.Item
              label="Loại ghế"
              name="seatTypeId"
              rules={[{ required: true, message: "Vui lòng chọn loại ghế" }]}
              className="mb-2"
            >
              <Select 
                placeholder="Chọn loại ghế"
                className="rounded-lg"
                options={seatTypes.map(type => ({
                  label: `${type.name} (${Number(type.basePrice || 0).toLocaleString("vi-VN")}đ)`,
                  value: type.seatTypeID,
                }))}
                onChange={seatTypeId => {
                  const selectedType = seatTypes.find(type => type.seatTypeID === seatTypeId);
                  if (selectedType) {
                    form.setFieldsValue({ price: selectedType.basePrice });
                  }
                }}
              />
            </Form.Item>
            
            <Form.Item
              label="Giá ghế"
              name="price"
              rules={[
                { required: true, message: "Vui lòng nhập giá ghế" },
                { type: "number", min: 0, message: "Giá phải lớn hơn 0" }
              ]}
              className="mb-2"
            >
              <InputNumber 
                min={0}
                placeholder="Nhập giá ghế"
                className="w-full rounded-lg"
                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => value.replace(/\$\s?|(,*)/g, '')}
                style={{ width: "100%" }}
              />
            </Form.Item>
          </div>
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
            {loading ? "Đang thêm..." : "Thêm ghế"}
          </button>
        </div>
      </Form>
    </div>
  );
};

export default AddSeat;