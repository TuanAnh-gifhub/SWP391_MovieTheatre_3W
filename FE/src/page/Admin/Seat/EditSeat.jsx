import React, { useState, useEffect } from "react";
import { updateSeat, getAllSeatTypes } from "../../../service/seat";
import { getAllCinemaRooms } from "../../../service/cinemaroom";
import { toast } from "react-toastify";

const EditSeat = ({ seat, onSuccess, onClose }) => {
  const [cinemaRooms, setCinemaRooms] = useState([]);
  const [cinemaRoomId, setCinemaRoomId] = useState(seat?.cinemaRoomID || seat?.cinemaRoomId || "");
  const [seatName, setSeatName] = useState(seat?.seatName || "");
  const [seatTypes, setSeatTypes] = useState([]);
  const [seatTypeId, setSeatTypeId] = useState(seat?.seatTypeId || "");
  const [price, setPrice] = useState(seat?.price || 10000);
  const [loading, setLoading] = useState(false);

  const resolveSeatTypeId = (seatTypeLabel, types) => {
    if (!seatTypeLabel) return "";
    const found = types.find(type =>
      type.code?.toLowerCase() === String(seatTypeLabel).toLowerCase() ||
      type.name?.toLowerCase() === String(seatTypeLabel).toLowerCase()
    );
    return found?.seatTypeID || "";
  };

  useEffect(() => {
    getAllCinemaRooms().then(res => {
      if (res.success && Array.isArray(res.data)) {
        const uniqueRooms = [];
        const roomMap = {};
        res.data.forEach(room => {
          if (room.cinemaRoomId && room.roomName && !roomMap[room.cinemaRoomId]) {
            roomMap[room.cinemaRoomId] = true;
            uniqueRooms.push({ id: room.cinemaRoomId, name: room.roomName });
          }
        });
        setCinemaRooms(uniqueRooms);
      }
    });
    getAllSeatTypes().then(res => {
      if (res.success && Array.isArray(res.data)) {
        setSeatTypes(res.data);
        const matchedId = resolveSeatTypeId(seat?.seatType, res.data);
        const defaultType = res.data.find(type => type.seatTypeID === matchedId) || res.data[0];
        if (defaultType) {
          setSeatTypeId(defaultType.seatTypeID);
          if (!seat?.price) {
            setPrice(defaultType.basePrice);
          }
        }
      }
    });
  }, []);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!cinemaRoomId) {
      toast.error("Vui lòng chọn phòng chiếu!");
      return;
    }
    if (!seatName) {
      toast.error("Vui lòng nhập tên ghế!");
      return;
    }
    setLoading(true);
    const res = await updateSeat({
      cinemaRoomId: Number(cinemaRoomId),
      seatId: seat.seatID || seat.seatId,
      seatName,
      seatTypeId: Number(seatTypeId),
      seatType: seatTypes.find(type => type.seatTypeID === Number(seatTypeId))?.code || seatTypes.find(type => type.seatTypeID === Number(seatTypeId))?.name,
      price: Number(price),
    });
    setLoading(false);
    if (res.success) {
      toast.success(res.message || "Cập nhật ghế thành công!");
      if (onSuccess) onSuccess();
    } else {
      toast.error(res.message || "Cập nhật ghế thất bại!");
    }
  };

  return (
    <div className="p-4 bg-white rounded shadow max-w-xl w-full border border-gray-300">
      <h2 className="text-lg font-semibold mb-4">Chỉnh sửa ghế</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block mb-1">Chọn phòng chiếu</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={cinemaRoomId}
            onChange={e => setCinemaRoomId(e.target.value)}
            required
          >
            <option value="">-- Chọn phòng chiếu --</option>
            {cinemaRooms.map(r => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-1">Tên ghế</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2"
            value={seatName}
            onChange={e => setSeatName(e.target.value)}
            required
          />
        </div>
        <div className="flex gap-4">
          <div>
            <label className="block mb-1">Loại ghế</label>
            <select
              className="border rounded px-3 py-2"
              value={seatTypeId}
              onChange={e => {
                const nextTypeId = Number(e.target.value);
                setSeatTypeId(nextTypeId);
                const selectedType = seatTypes.find(type => type.seatTypeID === nextTypeId);
                if (selectedType) {
                  setPrice(selectedType.basePrice);
                }
              }}
            >
              <option value="">-- Chọn loại ghế --</option>
              {seatTypes.map(type => (
                <option key={type.seatTypeID} value={type.seatTypeID}>
                  {type.name} ({Number(type.basePrice || 0).toLocaleString("vi-VN")}đ)
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-1">Giá ghế</label>
            <input
              type="number"
              min={0}
              className="border rounded px-3 py-2 w-32"
              value={price}
              onChange={e => setPrice(e.target.value)}
              required
            />
          </div>
        </div>
        <button
          type="submit"
          className="w-full bg-black text-white py-2 rounded hover:bg-gray-800"
          disabled={loading}
        >
          {loading ? "Đang lưu..." : "Lưu thay đổi"}
        </button>
      </form>
      <button
        className="mt-4 w-full border border-gray-900 text-gray-900 py-2 rounded hover:bg-gray-900 hover:text-white transition font-semibold"
        onClick={onClose}
        type="button"
      >
        Đóng
      </button>
    </div>
  );
};

export default EditSeat;