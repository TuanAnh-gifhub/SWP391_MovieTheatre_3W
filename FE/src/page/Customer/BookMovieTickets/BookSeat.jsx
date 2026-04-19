import React, { useState } from "react";
import Cinema3DView from "./Cinema3DView";
import BookFoodAndDrink from "./BookFoodAndDrink";

const BookSeat = ({
  movie,
  availableSeats = [],
  selectedSeats,
  handleSelectSeat,
  handleBack,
  setBookingInfo, // nhận props này
  bookingInfo,
  selectedFoods = [],
  setSelectedFoods = () => {},
}) => {
  const [show3D, setShow3D] = useState(false);

  const seatRows = Array.from(
    new Set(availableSeats.map((s) => s.seatName[0]))
  ).sort();

  const maxCol = Math.max(
    ...availableSeats.map((s) => parseInt(s.seatName.slice(1), 10))
  );

  const isSelected = (seat) =>
    selectedSeats.some((s) => s.seatName === seat.seatName);

  // Đưa renderSeat vào trong component để dùng được isSelected
  function renderSeat(seat) {
    // Nếu ghế không khả dụng, hiển thị dấu X đỏ bên trong khung xám
    if (seat.isAvailable === false) {
      return (
        <div
          className="w-8 h-8 rounded bg-gray-300 border flex items-center justify-center text-xs font-bold cursor-not-allowed opacity-50"
          title="Ghế không khả dụng"
        >
          <span style={{ color: "red", fontWeight: "bold", fontSize: "1.2em" }}>X</span>
        </div>
      );
    }
    // ...logic cũ giữ nguyên...
    let color =
      seat.seatType === "VIP"
        ? "bg-yellow-200"
        : "bg-gray-200";
    let disabled = false;

    if (seat.status === "Occupied") {
      color = "bg-red-200"; // màu đỏ nhạt cho ghế đã bán
      disabled = true;
    } else if (seat.status === "Blank") {
      disabled = false;
    } else {
      disabled = true;
    }

    if (isSelected(seat)) color = "bg-gray-900 text-white";
    return (
      <button
        type="button"
        className={`w-8 h-8 rounded ${color} border flex items-center justify-center text-xs font-bold ${
          disabled
            ? "cursor-not-allowed opacity-50"
            : "hover:ring-2 hover:ring-orange-400"
        }`}
        disabled={disabled}
        onClick={() => handleSelectSeat(seat)}
      >
        {seat.seatName}
      </button>
    );
  }

  const renderSeats = () => (
    <div className="flex flex-col items-center">
      <div className="mb-2 text-center text-orange-500 font-semibold text-2xl">
        Màn hình
      </div>
      <div className="w-full flex justify-center mb-2">
        <svg
          viewBox="0 0 600 60"
          width="100%"
          height="60"
          className="mb-4"
          style={{ display: "block" }}
        >
          <path
            d="M20,50 Q300,-35 580,50"
            stroke="#fff"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <div className="flex flex-row gap-2 mb-2">
        <span className="flex items-center mr-4 text-gray-700">
          <span className="bg-gray-100 px-2 py-1 rounded text-orange-700 font-semibold text-sm">Thường</span>
        </span>
        <span className="flex items-center mr-4 text-orange-600">
          <span className="bg-yellow-200 px-2 py-1 rounded text-orange-700 font-semibold text-sm">Ghế Vip</span>
        </span>
        <span className="flex items-center mr-4 text-gray-900">
          <span className="bg-gray-900 px-2 py-1 rounded text-orange-700 font-semibold text-sm">Ghế đang chọn</span>
        </span>
        <span className="flex items-center mr-4 text-red-400">
          <span className="bg-red-200 px-2 py-1 rounded text-orange-700 font-semibold text-sm">Ghế đã bán</span>
        </span>
      </div>
      <div className="inline-block bg-white rounded-lg p-4 shadow">
        <table>
          <tbody>
            {seatRows.map((row) => (
              <tr key={row}>
                <td className="pr-2 font-semibold text-gray-600">{row}</td>
                {Array.from({ length: maxCol }, (_, idx) => {
                  const seat = availableSeats.find(
                    (s) =>
                      s.seatName === `${row}${idx + 1}`
                  );
                  if (!seat) {
                    return <td key={idx}></td>;
                  }
                  return (
                    <td key={idx} className="p-1">
                      {renderSeat(seat)}
                    </td>
                  );
                })}
                <td className="pl-2 font-semibold text-gray-600">{row}</td>
              </tr>
            ))}
            <tr>
              <td></td>
              {Array.from({ length: maxCol }, (_, idx) => (
                <td key={idx} className="text-xs text-gray-600 text-center pt-1">
                  {idx + 1}
                </td>
              ))}
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );


  const room = { width: 10, height: 5, depth: 15 };
  const screen = { x: room.width / 2, y: 2, z: -room.depth / 2 + 0.1, width: 8, height: 2 };

  
  const seat = selectedSeats[0];
 
  let seatPos = { x: 0, y: 0.5, z: 0 };
  if (seat) {
    const row = seat.seatName[0].toUpperCase().charCodeAt(0) - 65;
    const col = parseInt(seat.seatName.slice(1), 10) - 1;
    seatPos = {
      x: 1 + col * 0.8, 
      y: 0.5,
      z: -room.depth / 2 + 2 + row * 1.1,
    };
  }

  // Khi selectedSeats thay đổi, cập nhật bookingInfo
  React.useEffect(() => {
    if (setBookingInfo) {
      const totalPrice = selectedSeats.reduce((sum, seat) => sum + (seat.price || 75000), 0);
      setBookingInfo(prev => ({
        ...prev,
        selectedSeats,
        totalPrice,
      }));
    }
  }, [selectedSeats, setBookingInfo]);

  return (
    <div className="md:col-span-2 flex flex-col">
      <div className="flex-1 flex flex-col justify-center">
        {show3D && seat ? (
          <div>
            <button
              className="mb-2 px-4 py-2 bg-red-400 hover:bg-red-600 text-white rounded"
              onClick={() => setShow3D(false)}
            >
              Thoát 3D
            </button>
            <Cinema3DView seatPos={seatPos} screen={screen} room={room} movie={movie} />
          </div>
        ) : (
          <>
            {renderSeats()}
            {selectedSeats.length === 1 && (
              <button
                className="mt-10 px-3 py-1 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded w-30 mx-auto block"
                onClick={() => setShow3D(true)}
              >
                Xem 3D vị trí ghế
              </button>
            )}
          </>
        )}
      </div>
      {/* Thêm chọn food & drink bên dưới */}
      <BookFoodAndDrink
        selectedFoods={selectedFoods}
        setSelectedFoods={setSelectedFoods}
      />
    </div>
  );
};

export default BookSeat;