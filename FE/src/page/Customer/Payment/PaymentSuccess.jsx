import React, { useEffect, useState, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { confirmPayOSStatus, confirmVNPayStatus } from "../../../service/payment";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { LoginVersionContext } from "../../../layout/RootLayout";
import ParallaxBackground from '../LandingPage/ParallaxBackground';
import { CiSun } from 'react-icons/ci';

function getQueryParams(search) {
  return Object.fromEntries(new URLSearchParams(search));
}


function formatPayDate(payDate) {
  if (!payDate) return "Không có";
  // Nếu là dạng số chuỗi từ VNPay: YYYYMMDDhhmmss
  if (/^\d{14}$/.test(payDate)) {
    return `${payDate.slice(0,4)}-${payDate.slice(4,6)}-${payDate.slice(6,8)} ${payDate.slice(8,10)}:${payDate.slice(10,12)}:${payDate.slice(12,14)}`;
  }
  // Nếu là ISO string
  const d = new Date(payDate);
  if (!isNaN(d.getTime())) {
    const pad = n => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  }
  return payDate;
}


const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");
  const [orderInfo, setOrderInfo] = useState(null);
  const { setLoginVersion } = useContext(LoginVersionContext);

  // Dark mode state synced với localStorage (giống các trang khác)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const stored = localStorage.getItem('landing_dark_mode');
    return stored === 'true';
  });

  const clearPaymentStorage = () => {
    localStorage.removeItem("bookingId");
    localStorage.removeItem("cinemaRoomId");
    localStorage.removeItem("seats");
    localStorage.removeItem("totalMoney");
    localStorage.removeItem("couponCode");
  };

  const isSuccessText = (value) => {
    const normalized = (value || "").toLowerCase();
    return normalized.includes("thành công")
      || normalized.includes("thanh toan thanh cong")
      || normalized.includes("success");
  };

  const isFailureStatus = (value) => {
    const normalized = (value || "").trim().toLowerCase();
    return ["cancel", "cancelled", "canceled", "fail", "failed", "error"].includes(normalized);
  };

  useEffect(() => {
    const params = getQueryParams(location.search);
    const bookingId = Number(params.orderId || params.vnp_TxnRef);
    const totalMoney = Number(params.vnp_Amount) / 100;
    const vnp_ResponseCode = params.vnp_ResponseCode;
    const vnp_TransactionStatus = params.vnp_TransactionStatus;
    const payosOrderCode = params.orderCode;
    const payosStatus = params.status;
    const payosCode = params.code;
    const isMockFlow = (params.mock || "").toLowerCase() === "1" || (params.mock || "").toLowerCase() === "true";
    const payosCancel = (params.cancel || "").toLowerCase() === "true";
    const isVNPayFlow = Boolean(vnp_ResponseCode || vnp_TransactionStatus || params.vnp_TxnRef);
    const isPayOSFlow = !isVNPayFlow && (
      Boolean(payosOrderCode)
      || (location.pathname || "").toLowerCase() === "/wallet/deposit/result"
      || (params.paymentGateway || "").toLowerCase() === "payos"
    );

    // Lấy dữ liệu từ localStorage thay vì chỉ dựa vào query params
    const storedBookingId = Number(localStorage.getItem("bookingId")) || bookingId;
    const storedTotalMoney = Number(localStorage.getItem("totalMoney")) || totalMoney;
    const cinemaRoomId = Number(localStorage.getItem("cinemaRoomId")) || 0;
    const seats = JSON.parse(localStorage.getItem("seats") || "[]");
    const customerID = Number(localStorage.getItem("id")) || 0;
    
    // Read optional pay-by-points flags from localStorage if present (guard against undefined)
    const usePointsPayment = (localStorage.getItem("usePointsPayment") || "false") === "true";
    const pointsUsed = Number(localStorage.getItem("pointsUsed") || 0);
    console.log("🔍 DEBUG - PaymentSuccess - localStorage data:", {
      storedBookingId,
      storedTotalMoney,
      cinemaRoomId,
      seats,
      usePointsPayment,
      pointsUsed,
      customerID,
    });

    // pay-by-points removed; fallback to normal payment flows

    if (isMockFlow && storedBookingId > 0) {
      setOrderInfo({
        bookingId: storedBookingId,
        totalMoney: storedTotalMoney,
        cinemaRoomId,
        seats,
        payDate: new Date().toISOString(),
        orderInfo: `MOCK-${storedBookingId}`,
        bankCode: "Mock",
        cardType: "Mock",
        status: "Success",
      });
      setStatus("success");
      setMessage("Thanh toán thử thành công!");
      clearPaymentStorage();
      return;
    }

    // Validation dữ liệu cho thanh toán qua PayOS
    if (isPayOSFlow) {
      let selectedPromotionIds = [];
      try {
        const promo = localStorage.getItem("selectedPromotionIds");
        if (promo) selectedPromotionIds = JSON.parse(promo);
      } catch {}

      const requestData = {
        bookingId: storedBookingId > 0 ? storedBookingId : undefined,
        totalMoney: storedTotalMoney > 0 ? storedTotalMoney : undefined,
        cinemaRoomId,
        seats,
        payosOrderCode,
        payosStatus,
        payosCode,
        selectedPromotionIds,
      };

      confirmPayOSStatus(requestData)
        .then((res) => {
          const apiMessage = res?.result || res?.message || "";
          const payosSuccess = !payosCancel
            && !isFailureStatus(payosStatus)
            && (
              isSuccessStatus(payosStatus)
              || payosCode === "00"
              || isSuccessText(apiMessage)
            );

          setOrderInfo({
            bookingId: storedBookingId > 0 ? storedBookingId : payosOrderCode,
            totalMoney: storedTotalMoney,
            cinemaRoomId,
            seats,
            payDate: new Date().toISOString(),
            orderInfo: `PAYOS-${payosOrderCode}`,
            bankCode: "PayOS",
            cardType: "QR",
            status: payosSuccess ? "Success" : "Fail",
          });

          if (payosSuccess) {
            setStatus("success");
            setMessage("Thanh toán thành công!");
            clearPaymentStorage();
            localStorage.removeItem("selectedPromotionIds");
          } else {
            setStatus("fail");
            setMessage("Thanh toán thất bại hoặc bị hủy!");
          }
        })
        .catch((err) => {
          console.error("PayOS confirmation error:", err);
          setStatus("fail");
          setMessage("Lỗi xác nhận thanh toán PayOS!");
        });

      return;
    }

    // Validation dữ liệu cho thanh toán thường (VNPay)
    if (
      isVNPayFlow &&
      storedBookingId && storedBookingId > 0 &&
      storedTotalMoney && storedTotalMoney > 0 &&
      vnp_ResponseCode &&
      vnp_TransactionStatus
    ) {
      // Lấy selectedPromotionIds từ localStorage nếu có, hoặc []
      let selectedPromotionIds = [];
      try {
        const promo = localStorage.getItem("selectedPromotionIds");
        if (promo) selectedPromotionIds = JSON.parse(promo);
      } catch {}
      const requestData = {
        bookingId: storedBookingId,
        totalMoney: storedTotalMoney,
        cinemaRoomId,
        seats,
        vnp_ResponseCode,
        vnp_TransactionStatus,
        selectedPromotionIds
      };
      confirmVNPayStatus(requestData)
        .then((res) => {
          setOrderInfo({
            bookingId: storedBookingId,
            totalMoney: storedTotalMoney,
            cinemaRoomId,
            seats,
            payDate: params.vnp_PayDate,
            orderInfo: params.vnp_OrderInfo,
            bankCode: params.vnp_BankCode,
            cardType: params.vnp_CardType,
            status:
              vnp_ResponseCode === "00" && vnp_TransactionStatus === "00"
                ? "Success"
                : "Fail",
          });
          if (vnp_ResponseCode === "00" && vnp_TransactionStatus === "00") {
            setStatus("success");
            setMessage("Thanh toán thành công!");
            // Xóa dữ liệu localStorage sau khi thanh toán thành công
            clearPaymentStorage();
            localStorage.removeItem("selectedPromotionIds");
          } else {
            setStatus("fail");
            setMessage("Thanh toán thất bại hoặc bị hủy!");
          }
        })
        .catch((err) => {
          console.error("Payment confirmation error:", err);
          setStatus("fail");
          setMessage("Lỗi xác nhận thanh toán!");
        });
    } else {
      console.error("Invalid payment data:", {
        storedBookingId,
        storedTotalMoney,
        cinemaRoomId,
        seats,
        payosOrderCode,
        vnp_ResponseCode,
        vnp_TransactionStatus
      });
      setStatus("fail");
      setMessage("Thiếu thông tin xác nhận thanh toán hoặc dữ liệu không hợp lệ!");
    }
  }, [location.search, location.pathname]);

  // Trigger Header refresh after successful payment
  useEffect(() => {
    if (status === "success") {
      setLoginVersion(v => v + 1);
    }
  }, [status, setLoginVersion]);

  // Hàm normalize giống MyOrdered.jsx
  const normalize = (str) =>
    (str || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "_");

  // Hàm encodeId giống MyOrdered.jsx
  const encodeId = (id) => btoa(String(id));

  // Lấy movieTitle từ orderInfo hoặc localStorage
  const movieTitle = orderInfo?.movieTitle || localStorage.getItem("movieTitle") || "";

  function isSuccessStatus(value) {
    const normalized = (value || "").trim().toLowerCase();
    return ["success", "succes", "paid", "succeeded"].includes(normalized);
  }

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
      {/* Nội dung chính */}
      <div className="relative z-10 flex flex-col items-center py-10 min-h-screen">
        <div className="bg-white shadow-xl rounded-xl p-8 max-w-lg w-full border border-gray-200">
          <div className="flex flex-col items-center mb-6">
            {status === "success" ? (
              <FaCheckCircle className="text-green-500 text-6xl mb-2" />
            ) : (
              <FaTimesCircle className="text-red-500 text-6xl mb-2" />
            )}
            <h2
              className={`text-3xl font-extrabold text-center mb-2 uppercase tracking-wide ${
                status === "success" ? "text-green-700" : "text-red-700"
              }`}
            >
              {status === "success" ? "Thanh toán thành công" : "Thanh toán thất bại"}
            </h2>
          </div>
          {orderInfo && (
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mb-4">
              <div className="font-medium text-gray-600">Mã đơn hàng:</div>
              <div className="font-bold text-red-600">{orderInfo.bookingId}</div>
              
                 <>
                   <div className="font-medium text-gray-600">Số tiền:</div>
                   <div className="font-semibold">{Number(orderInfo.totalMoney).toLocaleString()} đ</div>
                   <div className="font-medium text-gray-600">Ngân hàng:</div>
                   <div className="font-semibold">{orderInfo.bankCode || <span className="text-gray-400">Không có</span>}</div>
                   <div className="font-medium text-gray-600">Loại thẻ:</div>
                   <div className="font-semibold">{orderInfo.cardType || <span className="text-gray-400">Không có</span>}</div>
                 </>
              
              <div className="font-medium text-gray-600">Thời gian thanh toán:</div>
              <div className="font-semibold">
                {orderInfo.payDate
                  ? formatPayDate(orderInfo.payDate)
                  : <span className="text-gray-400">Không có</span>}
              </div>
              <div className="font-medium text-gray-600">Trạng thái:</div>
              <div className="font-semibold capitalize">
                {orderInfo.status === "Success" ? (
                  <span className="text-green-600">Thành công</span>
                ) : (
                  <span className="text-red-600">Thất bại</span>
                )}
              </div>
            </div>
          )}
          <div className="bg-gray-50 border border-gray-200 rounded p-3 text-xs text-gray-700 mb-4">
            <strong>Lưu ý/Note:</strong>
            <br />
            {status === "success" ? (
              <>
                Vé đã mua không thể huỷ, đổi hoặc trả lại. Vui lòng liên hệ Ban Quản Lý rạp hoặc tra cứu thông tin tại mục{" "}
                <a href="#" className="text-blue-600 underline">Điều khoản mua và sử dụng vé xem phim</a> để biết thêm chi tiết.
                Cảm ơn bạn đã lựa chọn mua vé! Chúc bạn xem phim vui vẻ!
              </>
            ) : (
              <>
                Thanh toán không thành công. Vui lòng thử lại hoặc liên hệ hỗ trợ nếu vấn đề vẫn tiếp tục.
                Bạn có thể quay lại trang chi tiết phim để thử đặt vé lại.
              </>
            )}
          </div>
          
          {/* Button tùy theo trạng thái thanh toán */}
          {status === "success" ? (
            <button
              onClick={() => {
                if (orderInfo?.bookingId && movieTitle) {
                  navigate(`/my-orders/${encodeId(orderInfo.bookingId)}-${normalize(movieTitle)}`);
                } else {
                  alert("Không tìm thấy thông tin vé để xem chi tiết!");
                }
              }}
              className="w-full py-2 bg-gradient-to-r from-orange-600 to-yellow-500 hover:from-orange-500 hover:to-yellow-400 text-white rounded font-semibold transition"
            >
              Xem chi tiết vé
            </button>
          ) : (
            <button
              onClick={() => {
                // Quay về trang MovieDetail của phim vừa đặt thất bại
                if (movieTitle) {
                  navigate(`/movies/${normalize(movieTitle)}`);
                } else {
                  navigate("/"); // Nếu không có movieTitle thì về trang chủ
                }
              }}
              className="w-full py-2 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white rounded font-semibold transition"
            >
              Quay lại
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
