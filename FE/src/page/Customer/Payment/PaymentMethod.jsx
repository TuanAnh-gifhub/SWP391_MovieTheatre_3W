import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { payWithVNPay } from "../../../service/payment";
import vnpayLogo from "../../../assets/img/vnpay.png";
// import momoLogo from "../../../assets/img/momo.png";
// import viettelpayLogo from "../../../assets/img/viettelpay.png";
// import zalopayLogo from "../../../assets/img/zalo.png";
import ParallaxBackground from '../LandingPage/ParallaxBackground';
import { CiSun } from 'react-icons/ci';

const localPaymentMethods = [
  { key: "vnpay", name: "VNPay", img: vnpayLogo },
  // { key: "momo", name: "Momo", img: momoLogo },
  // { key: "viettelpay", name: "ViettelPay", img: viettelpayLogo },
  // { key: "zalopay", name: "ZaloPay", img: zalopayLogo }
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
    
    if (selected === "vnpay") {
      try {
        const res = await payWithVNPay(paymentData);
        if (res && res.result) {
          window.location.href = res.result;
        } else {
          alert("Không nhận được đường dẫn thanh toán!");
        }
      } catch (err) {
        alert(err?.response?.data?.message || "Thanh toán thất bại!");
      }
      return;
    }
    // ...xử lý các phương thức khác nếu có...
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
          <h3>Thanh toán nội địa:</h3>
          <div className="grid grid-cols-2 gap-4 mb-6 items-start">
            {localPaymentMethods.map((method) => (
              <React.Fragment key={method.key}>
                <button
                  className={`flex flex-col items-center border rounded-lg p-4 transition 
                  ${selected === method.key ? "border-blue-600 ring-2 ring-blue-200" : "border-gray-300"}
                  hover:border-blue-400`}
                  onClick={() => handleSelect(method.key)}
                  type="button"
                >
                  <img src={method.img} alt={method.name} className="h-12 mb-2 object-contain" />
                  <span className="font-medium">{method.name}</span>
                  {selected === method.key && (
                    <span className="mt-2 text-blue-600 font-semibold text-sm">Đã chọn</span>
                  )}
                </button>
                {/* Hiển thị box thông tin test VNPay - chỉ hiển thị trong môi trường development */}
                {method.key === 'vnpay' && process.env.NODE_ENV === 'development' && (
                  <div className="ml-2 bg-yellow-50 border border-yellow-400 rounded-lg text-sm shadow max-w-xs leading-tight">
                    <div className="text-yellow-700 mb-1">Thông tin test VNPay:</div>
                    <div><span>Số thẻ:</span> <span className="select-all">9704198526191432198</span></div>
                    <div><span>Hết hạn:</span> 07/15</div>
                    <div><span>Tên:</span> NGUYEN VAN A</div>
                    <div><span>OTP:</span> 123456</div>
                  </div>
                )}
              </React.Fragment>
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
        </div>
      </div>
    </div>
  );
};

export default PaymentMethod;

