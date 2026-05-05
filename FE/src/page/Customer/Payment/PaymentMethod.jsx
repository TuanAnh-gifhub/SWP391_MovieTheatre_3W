import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { mockSuccessPayment, payWithPayOS } from "../../../service/payment";
import ParallaxBackground from '../LandingPage/ParallaxBackground';
import { CiSun } from 'react-icons/ci';

const localPaymentMethods = [
  { key: "payos", name: "PayOS" },
];

const PaymentMethod = ({ onSelect, defaultMethod }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Lấy dữ liệu từ location.state hoặc localStorage
  let stateData = location.state;
  if (!stateData) {
    // Fallback từ localStorage nếu không có location.state
    const bookingId = localStorage.getItem("bookingId");
    const totalMoney = localStorage.getItem("totalMoney");
    const cinemaRoomId = localStorage.getItem("cinemaRoomId");
    const seats = localStorage.getItem("seats");
    
    if (bookingId && totalMoney && cinemaRoomId && seats) {
      stateData = {
        bookingId: parseInt(bookingId),
        totalMoney: parseInt(totalMoney),
        cinemaRoomId: parseInt(cinemaRoomId),
        seats: JSON.parse(seats),
        usePointsPayment: false,
      };
    }
  }
  
  const paymentData = {
    ...stateData,
    cinemaRoomId: stateData?.cinemaRoomId || stateData?.bookingRequest?.cinemaRoomId,
  };
  

  

  const [selected, setSelected] = useState(defaultMethod || "");
  const [mockLoading, setMockLoading] = useState(false);
  const [mockError, setMockError] = useState("");

  // Dark mode state synced với localStorage (giống các trang khác)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const stored = localStorage.getItem('landing_dark_mode');
    return stored === 'true';
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSelect = (method) => {
    setSelected(method);
    if (onSelect) onSelect(method);
  };

  const handleContinue = async () => {
    console.log("🔍 DEBUG - PaymentMethod handleContinue - paymentData:", paymentData);
    console.log("🔍 DEBUG - PaymentMethod handleContinue - localStorage before payment:", {
      bookingId: localStorage.getItem("bookingId"),
      totalMoney: localStorage.getItem("totalMoney"),
      cinemaRoomId: localStorage.getItem("cinemaRoomId"),
      seats: localStorage.getItem("seats")
    });
    
    if (selected === "payos") {
      try {
        const res = await payWithPayOS(paymentData);
        if (res && res.result) {
          window.location.href = res.result;
        } else {
          alert("Không nhận được đường dẫn thanh toán!");
        }
      } catch (err) {
        alert(err?.response?.data?.message || "Thanh toán thất bại!");
      }
    }
    // ...xử lý các phương thức khác nếu có...
  };

  const handleMockPaymentSuccess = async () => {
    const bookingId = paymentData?.bookingId;
    const customerId = Number(localStorage.getItem("id"));

    if (!bookingId || !customerId) {
      setMockError("Thiếu thông tin đặt vé để thanh toán thử.");
      return;
    }

    try {
      setMockError("");
      setMockLoading(true);
      await mockSuccessPayment({ bookingId, customerId });
      navigate(`/payment-success?mock=1&orderId=${bookingId}`);
    } catch (err) {
      setMockError(err?.response?.data?.message || "Thanh toán thử thất bại.");
    } finally {
      setMockLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full">
      {/* Nút chuyển chế độ sáng/tối giống các trang khác */}
      <button
        onClick={() => {
          setIsDarkMode((prev) => {
            localStorage.setItem('landing_dark_mode', !prev);
            return !prev;
          });
        }}
        className="fixed top-20 right-1 z-[10000] w-8 h-8 flex items-center justify-center rounded-full shadow-lg hover:bg-gray-700 transition bg-orange-100 border-gray-600 focus:outline-none"
        aria-label={isDarkMode ? 'Chế độ Sáng' : 'Chế độ Tối'}
        title={isDarkMode ? 'Chế độ Sáng' : 'Chế độ Tối'}
      >
        <CiSun className={`w-7 h-7 transition-colors duration-200 ${isDarkMode ? 'text-black' : 'text-orange-400'}`} />
      </button>
      <ParallaxBackground isDarkMode={isDarkMode} />
      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center py-10 min-h-screen">
        <div className="bg-white shadow-xl rounded-xl p-8 max-w-lg w-full border border-gray-200">
          <h2 className="text-xl mb-4 text-center">Chọn phương thức thanh toán</h2>
          <div
            className={`grid gap-4 mb-6 items-stretch ${
              localPaymentMethods.length === 1
                ? "grid-cols-1 place-items-center"
                : "grid-cols-2"
            }`}
          >
            {localPaymentMethods.map((method) => (
              <button
                key={method.key}
                className={`flex min-h-[150px] ${
                  localPaymentMethods.length === 1 ? "w-full max-w-[240px]" : "w-full"
                } flex-col items-center justify-center border rounded-lg p-4 transition
                  ${selected === method.key ? "border-blue-600 ring-2 ring-blue-200" : "border-gray-300"}
                  hover:border-blue-400`}
                onClick={() => handleSelect(method.key)}
                type="button"
              >
                {method.img ? (
                  <img src={method.img} alt={method.name} className="h-12 mb-2 object-contain" />
                ) : (
                  <div className="h-12 mb-2 flex items-center justify-center text-xl font-bold text-blue-600">
                    {method.name}
                  </div>
                )}
                <span className="font-medium">{method.name}</span>
                {selected === method.key && (
                  <span className="mt-2 text-blue-600 font-semibold text-sm">Đã chọn</span>
                )}
              </button>
            ))}
          </div>
          <div className="mt-6 flex gap-3">
            <button
              className="flex-1 bg-gray-300 text-black py-2 rounded hover:bg-gray-400 transition"
              onClick={() => navigate(-2)}
            >
              Quay về
            </button>
            <button
              className="flex-1 bg-gradient-to-r from-orange-600 to-yellow-500 hover:from-orange-500 hover:to-yellow-400 text-white py-2 rounded transition"
              disabled={!selected}
              onClick={handleContinue}
            >
              Tiếp tục
            </button>
          </div>
          <div className="mt-3">
            <button
              type="button"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition disabled:opacity-60"
              onClick={handleMockPaymentSuccess}
              disabled={mockLoading}
            >
              {mockLoading ? "Đang hoàn tất thanh toán thử..." : "Mock thanh toán thành công"}
            </button>
            {mockError && <p className="text-red-600 text-sm mt-2">{mockError}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethod;

