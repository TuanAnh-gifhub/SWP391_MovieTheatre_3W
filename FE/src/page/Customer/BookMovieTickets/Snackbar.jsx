import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { bookingConfirmation } from "../../../service/bookmovieticket";
import { toast } from "react-toastify";

const Snackbar = ({
  movieId,
  movieTitle,
  cinemaName,
  cityName,
  selectedSeats = [],
  totalPrice,
  date,
  time,
  showtime,
  disabled,
  onError,
  selectedFoods = [],
}) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      const errorMsg = "Vui lòng đăng nhập để đặt vé!";
      onError?.(errorMsg);
      toast.error(errorMsg);
      return;
    }

    if (
      !showtime ||
      !time ||
      selectedSeats.length === 0 ||
      !showtime.cinemaRoomId ||
      !showtime.showDate ||
      !showtime.showTime
    ) {
      const errorMsg = "Vui lòng chọn đầy đủ thông tin và ghế!";
      onError?.(errorMsg);
      toast.error(errorMsg);
      return;
    }

    setLoading(true);
    onError?.("");

    try {
      const customerId = Number(localStorage.getItem("id"));
      const req = {
        customerId: Number(customerId),
        movieId: Number(movieId),
        cinemaRoomId: Number(showtime.cinemaRoomId || showtime.cinemaRoomID),
        showDate: String(showtime.showDate),
        showTime: String(showtime.showTime),
        seatIds: selectedSeats.map(s => Number(s.seatID)),
        seatNames: selectedSeats.map(s => String(s.seatName)),
        promotionIds: [],
        foodAndDrinks: selectedFoods.map(f => ({ id: f.id, quantity: f.quantity })),
      };

      const res = await bookingConfirmation(req);
      
      navigate("/booking/confirm", {
        state: {
          confirmInfo: res.data.data,
          bookingRequest: req,
          selectedFoods, // truyền sang trang xác nhận
        },
      });
    } catch (err) {
      const errorMsg = "Không thể xác nhận thông tin đặt vé!";
      onError?.(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const foodsTotal = selectedFoods.reduce((sum, f) => sum + (f.price * f.quantity), 0);

  return (
    <div
      className="sticky bottom-0 left-0 w-full z-[101] transition-all duration-200"
      style={{
        background: "#1a1a1a",
        borderTop: "1px solid #e0e0e0",
        boxShadow: "0 -2px 16px 0 rgba(0,0,0,0.12)",
        padding: "16px 0",
        pointerEvents: "auto",
      }}
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 px-4">
        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6 flex-1 w-full">
          <div className="font-bold text-lg text-orange-500 uppercase break-words">
            {movieTitle}
          </div>
          <div className="text-white text-base break-words">
            {cinemaName}
            {cityName && (
              <span className="text-gray-400"> ({cityName})</span>
            )}
          </div>
          {date && time && (
            <div className="text-white text-sm break-words">
              {date} - {time}
            </div>
          )}
          <div className="bg-black/30 rounded-lg p-3 border border-orange-200 w-full mb-2">
            <div className="mb-1">
              <span className="font-bold text-orange-400">Ghế đã chọn:</span>
              <span className="ml-2 flex flex-wrap gap-x-2 gap-y-1">
                {selectedSeats.length > 0 ? (
                  selectedSeats.map((seat) => (
                    <span key={seat.seatID} className="inline-block">
                      <span className="font-bold text-orange-400">{seat.seatName}</span>
                      <span className="ml-1 text-gray-300">({seat.price?.toLocaleString("vi-VN") || 75000}đ)</span>
                    </span>
                  ))
                ) : (
                  <span className="text-gray-400">Chưa chọn</span>
                )}
              </span>
            </div>
            {selectedFoods.length > 0 && (
              <div className="mt-2">
                <span className="font-bold text-orange-400">Đồ ăn & Đồ uống đã chọn:</span>
                <div className="flex flex-col gap-1 mt-1 ml-2">
                  {selectedFoods.map((food) => (
                    <div key={food.id} className="flex items-center gap-2">
                      <span className="font-bold text-orange-300">{food.name}</span>
                      <span className="text-gray-300">x{food.quantity}</span>
                      <span className="text-orange-200">{Number(food.price).toLocaleString()}đ</span>
                      
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6">
          <span className="bg-orange-500 text-white font-bold px-3 py-1 rounded text-base">
            Tạm tính: {(Number(totalPrice) + foodsTotal).toLocaleString("vi-VN")} VNĐ
          </span>
          <button
            className={`ml-4 px-8 py-2 rounded font-bold text-lg transition ${
              disabled || loading
                ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                : "bg-orange-500 hover:bg-orange-400 text-white"
            }`}
            onClick={handleConfirm}
            disabled={disabled || loading}
          >
            {loading ? "ĐANG XỬ LÝ..." : "XÁC NHẬN"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Snackbar;