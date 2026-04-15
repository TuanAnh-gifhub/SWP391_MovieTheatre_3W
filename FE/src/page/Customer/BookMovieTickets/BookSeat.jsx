import React, { useState } from "react";
import Cinema3DView from "./Cinema3DView";
import BookFoodAndDrink from "./BookFoodAndDrink";

// Modal hiển thị thông báo lỗi với nút đóng và đếm ngược
function ErrorModal({ message, onClose, seconds }) {
  const [count, setCount] = React.useState(seconds);

  React.useEffect(() => {
    if (!message) return;
    setCount(seconds); // reset khi message thay đổi
  }, [message, seconds]);

  React.useEffect(() => {
    if (!message) return;
    if (count <= 0) {
      onClose();
      return;
    }
    const timer = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [count, message, onClose]);

  if (!message) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-gradient-to-r from-orange-800 to-orange-600 rounded-xl shadow-2xl px-10 py-8 min-w-[400px] max-w-[60vw]">
        <div className="text-white text-3xl font-extrabold text-center mb-4 drop-shadow">LƯU Ý !</div>
        <div className="text-center text-white text-lg mb-8">
          {message ? (
            <>
              {message.split(/(1 ghế ở bên trái, giữa hoặc bên phải trên cùng)/).map((part, idx) =>
                part === '1 ghế ở bên trái, giữa hoặc bên phải trên cùng' ? (
                  <span key={idx} className="text-yellow-300 font-bold">{part}</span>
                ) : (
                  <span key={idx}>{part}</span>
                )
              )}
            </>
          ) : null}
        </div>
        <div className="flex justify-center items-center gap-4">
          <button
            className="border text-xl border-yellow-300 text-yellow-300 font-bold px-12 py-2 rounded-lg hover:bg-yellow-300 hover:text-black transition"
            onClick={onClose}
          >
            OK ({count}s)
          </button>
        </div>
      </div>
    </div>
  );
}

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
  const [errorMessage, setErrorMessage] = useState("");

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
        onClick={() => handleSelectSeatWithRule(seat)}
      >
        {seat.seatName}
      </button>
    );
  }

  // Hàm kiểm tra quy tắc không để lại một ghế trống lẻ
  function violatesSingleEmptySeatRule(rowSeats, newSelectedSeats) {
    const n = rowSeats.length;
    // 0 = trống, 1 = đã chọn, 2 = đã bán/khóa
    const statusArr = rowSeats.map(seat => {
      if (seat.isAvailable === false) return 2;
      if (seat.status === "Occupied") return 2;
      if (newSelectedSeats.includes(seat.seatName)) return 1;
      return 0;
    });
    // Tách thành các block liên tục không bị ngăn cách bởi ghế đã bán/khóa
    let blocks = [];
    let current = [];
    for (let i = 0; i < n; i++) {
      if (statusArr[i] === 2) {
        if (current.length > 0) blocks.push({start: i - current.length, arr: current});
        current = [];
      } else {
        current.push({idx: i, status: statusArr[i]});
      }
    }
    if (current.length > 0) blocks.push({start: n - current.length, arr: current});

    // Kiểm tra từng block
    for (const block of blocks) {
      const arr = block.arr;
      const m = arr.length;
      // Nếu block chỉ còn 1 hoặc 2 ghế, luôn hợp lệ
      if (m <= 2) continue;
      // Quy tắc đặc biệt cho block 3 ghế
      if (m === 3) {
        const selectedIdx = arr.map((s, i) => s.status === 1 ? i : -1).filter(i => i !== -1);
        if (selectedIdx.length === 1) {
          // Chỉ cho phép chọn đầu hoặc cuối
          if (selectedIdx[0] === 1) return true; // Nếu chỉ chọn ghế giữa (B2), không hợp lệ
        }
        if (selectedIdx.length === 2) {
          // Nếu chọn 2 ghế không liền kề (tức là chọn ghế 0 và 2), không hợp lệ
          if (selectedIdx[0] === 0 && selectedIdx[1] === 2) return true;
        }
        // Các trường hợp còn lại (chọn 3 ghế, hoặc 2 ghế liền kề) đều hợp lệ
        continue;
      }
      // Nếu block không có ghế nào được chọn thì hợp lệ
      if (arr.every(s => s.status !== 1)) continue;
      // Nếu tất cả các ghế trong block đều đã được chọn (không còn ghế trống), luôn hợp lệ
      if (arr.every(s => s.status === 1)) continue;
      // Kiểm tra ghế lẻ ở đầu block
      if (m > 1 && arr[0].status === 0 && (arr[1].status === 1)) {
        let firstChosen = arr.findIndex(s => s.status === 1);
        let lastChosen = arr.map(s => s.status).lastIndexOf(1);
        const consecutive = lastChosen - firstChosen + 1;
        if (consecutive <= 2) return true;
      }
      // Kiểm tra ghế lẻ ở cuối block
      if (m > 1 && arr[m-1].status === 0 && (arr[m-2].status === 1)) {
        let firstChosen = arr.findIndex(s => s.status === 1);
        let lastChosen = arr.map(s => s.status).lastIndexOf(1);
        const consecutive = lastChosen - firstChosen + 1;
        if (consecutive <= 2) return true;
      }
      // Kiểm tra ghế lẻ ở giữa block
      for (let i = 1; i < m - 1; i++) {
        if (arr[i].status === 0 && arr[i-1].status === 1 && arr[i+1].status === 1) {
          return true;
        }
      }
    }
    return false;
  }

  function handleSelectSeatWithRule(seat) {
    setErrorMessage("");
    // Lấy tất cả ghế cùng hàng
    const row = seat.seatName[0];
    const rowSeats = availableSeats
      .filter(s => s.seatName[0] === row)
      .sort((a, b) => parseInt(a.seatName.slice(1)) - parseInt(b.seatName.slice(1)));
    // Xác định trạng thái mới nếu thao tác này thành công
    const isAlreadySelected = selectedSeats.some(s => s.seatName === seat.seatName);
    let newSelectedSeats;
    if (isAlreadySelected) {
      newSelectedSeats = selectedSeats.filter(s => s.seatName !== seat.seatName).map(s => s.seatName);
    } else {
      newSelectedSeats = [...selectedSeats.map(s => s.seatName), seat.seatName];
    }
    // Luôn kiểm tra quy tắc, cả khi chọn và bỏ chọn
    if (violatesSingleEmptySeatRule(rowSeats, newSelectedSeats)) {
      setErrorMessage("Không được để lại duy nhất một ghế trống giữa các ghế đã chọn hoặc đã bán trong hàng. Vui lòng chọn lại!");
      return;
    }
    handleSelectSeat(seat);
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
      {/* Hiển thị thông báo lỗi nếu có */}
      {/* {errorMessage && (
        <div className="text-red-600 text-center font-semibold mt-2">{errorMessage}</div>
      )} */}
      <ErrorModal message={errorMessage} onClose={() => setErrorMessage("")} seconds={15} />
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