import React, { useState, useMemo, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { confirmBooking } from "../../../service/bookmovieticket";
// payment service imports for pay-by-points removed
import { toast } from "react-toastify";
import QRCode from "react-qr-code";
import PaymentMethod from "../Payment/PaymentMethod";
import CouponApply from "./CouponApply";
import PromotionApply from "./PromotionApply";
import ParallaxBackground from '../LandingPage/ParallaxBackground';
import { CiSun } from 'react-icons/ci';

const ConfirmBooking = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const confirmInfo = location.state?.confirmInfo;
  const bookingRequest = location.state?.bookingRequest;
  const selectedFoods = location.state?.selectedFoods || []; // Lấy thông tin món ăn đã chọn
  const [loading, setLoading] = useState(false);
  const [apiMessage, setApiMessage] = useState("");
  const [successInfo, setSuccessInfo] = useState(null);
  const [selectPayment, setSelectPayment] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState("");
  const [discountInfo, setDiscountInfo] = useState(null);
  // pay-by-points feature removed: related state removed
  const [selectedPromotionIds, setSelectedPromotionIds] = useState([]);
  const [promotionDiscount, setPromotionDiscount] = useState(0);
  // Dark mode state synced with localStorage (like LandingPage)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const stored = localStorage.getItem('landing_dark_mode');
    return stored === 'true';
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!confirmInfo)
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
        <div className="relative z-10 flex flex-col items-center py-8">
          <div className="text-red-500 font-semibold mb-2">Không có thông tin xác nhận đặt vé.</div>
          <button onClick={() => navigate(-1)} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition">
            Quay lại
          </button>
        </div>
      </div>
    );

  const handleConfirm = async () => {
    setLoading(true);
    setApiMessage("");
    try {
      // Tạo request mới giống bookingConfirmation, thêm foodAndDrinks
      const req = {
        ...bookingRequest,
        foodAndDrinks: selectedFoods.map(f => ({ id: f.id, quantity: f.quantity })),
        promotionIds: selectedPromotionIds,
      };
      const res = await confirmBooking(req);
      const bookingData = res.data.data;
      
      // pay-by-points removed — always proceed with normal payment flow
      
      // Thanh toán thường - giữ nguyên logic cũ
      setSuccessInfo(bookingData);
      localStorage.setItem("movieTitle", bookingData.movieTitle || bookingRequest.movieName || "");
      
      // Lưu dữ liệu cần thiết vào localStorage để PaymentSuccess có thể truy cập
      localStorage.setItem("bookingId", bookingData.bookingId);
      localStorage.setItem("cinemaRoomId", bookingData.cinemaRoomId || bookingRequest.cinemaRoomId);
      localStorage.setItem("seats", JSON.stringify((bookingData.seats || []).map(s => s.seatId)));
      // Lưu tổng tiền đã tính ở FE (finalTotal)
              localStorage.setItem("totalMoney", finalTotal);
      
              navigate("/payment-method", {
                state: {
                  bookingId: bookingData.bookingId,
                  totalMoney: finalTotal, // truyền giá cuối cùng vào đây
                  cinemaRoomId: bookingData.cinemaRoomId || bookingRequest.cinemaRoomId,
                  seats: (bookingData.seats || []).map(s => s.seatId),
                },
              });
    } catch (err) {
      let msg =
        err?.response?.data?.message ||
        err?.message ||
        "Đặt vé thất bại!";
      if (
        msg.toLowerCase().includes("seat") ||
        msg.toLowerCase().includes("ghế") ||
        msg.toLowerCase().includes("not available") ||
        msg.toLowerCase().includes("pending")
      ) {
        msg = "Ghế hiện tại không có sẵn";
      }
      if (msg.includes("Cannot read properties of null") && msg.includes("movieTitle")) {
        msg = "Ghế hiện tại không có sẵn! Vui lòng thử lại sau 5 phút";
      }
      setApiMessage(msg);
      toast.error(msg);
    }
    setLoading(false);
  };

  // pay-by-points UI/logic removed

  // Helper để chuẩn hóa showTime về HH:mm:ss
  const normalizeShowTime = (timeStr) => {
    if (!timeStr) return "";
    if (/^\d{2}:\d{2}$/.test(timeStr)) return timeStr + ":00";
    if (/^\d{2}:\d{2}:\d{2}$/.test(timeStr)) return timeStr;
    return timeStr;
  };

  // Lấy dữ liệu từ confirmInfo để truyền vào PromotionApply
  const validShowDate = confirmInfo?.date;
  const validShowTime = normalizeShowTime(confirmInfo?.time);
  const validSeatIds = confirmInfo?.seats?.map(s => s.seatId || s.seatID).filter(Boolean);

  // Lấy discountVip từ confirmInfo
  const discountVip = confirmInfo?.discountVip || 0;

  const handleRemoveCoupon = () => {
    setDiscountInfo(null);
    localStorage.removeItem("couponCode");
  };

  // Memo hóa orderInfo để tránh tạo object mới mỗi lần render
  const orderInfo = useMemo(() => ({
    customerId: Number(localStorage.getItem("id")),
    movieId: bookingRequest?.movieId || bookingRequest?.movieID || confirmInfo?.movieId || confirmInfo?.movieID,
    cinemaRoomId: bookingRequest?.cinemaRoomId || bookingRequest?.cinemaRoomID || confirmInfo?.cinemaRoomId || confirmInfo?.cinemaRoomID,
    showDate: confirmInfo?.date || bookingRequest?.date,
    showTime: normalizeShowTime(confirmInfo?.time || bookingRequest?.time),
    seatIds: (
      confirmInfo?.seats && confirmInfo.seats[0]?.seatId
        ? confirmInfo.seats.map(s => s.seatId)
        : bookingRequest?.seatIds
    ) || [],
  }), [bookingRequest, confirmInfo]);

  if (successInfo) {
    return (
      <div className="flex flex-col items-center py-10 min-h-screen bg-gradient-to-br from-gray-700/90 via-yellow-800/40 to-gray-700/90">
        <div className="bg-white shadow-xl rounded-xl p-8 max-w-lg w-full border border-gray-200">
          {successInfo.poster && (
            <div className="flex justify-center mb-4">
              <img src={successInfo.poster} alt="poster" className="w-40 h-56 object-cover rounded-lg shadow" />
            </div>
          )}
          <div className="text-3xl font-extrabold text-center text-gray-800 mb-2 uppercase tracking-wide">
            {successInfo.movieTitle || <span className="text-gray-400">Không có</span>}
          </div>
          <div className="flex flex-col items-center mb-4">
            <span className="inline-block bg-yellow-200 text-yellow-800 px-3 py-1 rounded text-1xl font-semibold mb-1">
              Phòng chiếu: {successInfo.cinemaRoom || <span className="text-gray-400">Không có</span>}
            </span>
            <span className="text-blue-700 underline text-sm font-medium">
              {successInfo.cinemaName || ""}
            </span>
            <span className="text-blue-500 text-xs underline mt-1">
              {successInfo.city || ""}
            </span>
          </div>
          <div className="flex flex-col items-center mb-6">
            <div className="text-gray-600 font-semibold mb-1">MÃ VÉ</div>
            <div className="text-2xl font-bold text-red-600 mb-2 tracking-widest">{successInfo.bookingId}</div>
            <div className="bg-gray-100 p-2 rounded-lg">
              <QRCode
                value={JSON.stringify({
                  bookingId: successInfo.bookingId,
                  movieTitle: successInfo.movieTitle,
                  showDate: successInfo.showDate,
                  showTime: successInfo.showTime,
                  cinemaRoom: successInfo.cinemaRoom,
                  seats: successInfo.seats,
                })}
                size={120}
                bgColor="#fff"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mb-4">
            <div className="font-medium text-gray-600">Suất chiếu:</div>
            <div className="font-semibold">{successInfo.showDate || <span className="text-gray-400">Không có</span>} - {successInfo.showTime || <span className="text-gray-400">Không có</span>}</div>
            <div className="font-medium text-gray-600">Ghế:</div>
            <div className="font-semibold">
              {Array.isArray(successInfo.seats) && successInfo.seats.length > 0
                ? successInfo.seats.map((seat, i) => (
                    <div key={i}>
                      {seat.seatName} ({seat.seatType}, {Number(seat.price).toLocaleString()} đ)
                    </div>
                  ))
                : <span className="text-gray-400">Không có</span>
              }
            </div>
            <div className="font-medium text-gray-600">Thanh toán:</div>
            <div className="font-semibold">
              {successInfo.bookingDate
                ? new Date(successInfo.bookingDate).toLocaleString("vi-VN")
                : "Không có"}
            </div>
            <div className="font-medium text-gray-600">Tổng tiền:</div>
            <div className="font-bold text-red-600">
              {successInfo.totalPrice !== undefined && successInfo.totalPrice !== null
                ? Number(successInfo.totalPrice).toLocaleString("vi-VN") + " VNĐ"
                : "Không có"}
            </div>
            <div className="font-medium text-gray-600">Trạng thái:</div>
            <div className="font-semibold capitalize">{successInfo.status || "Không có"}</div>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded p-3 text-xs text-gray-700 mb-4">
            <strong>Lưu ý/Note:</strong>
            <br />
            Vé đã mua không thể huỷ, đổi hoặc trả lại. Vui lòng liên hệ Ban Quản Lý rạp hoặc tra cứu thông tin tại mục{" "}
            <a href="#" className="text-blue-600 underline">Điều khoản mua và sử dụng vé xem phim</a> để biết thêm chi tiết.
            Cảm ơn bạn đã lựa chọn mua vé! Chúc bạn xem phim vui vẻ!
          </div>
          <button
            onClick={() => navigate("/")}
            className="w-full py-2 bg-black text-white rounded font-semibold hover:bg-gray-800 transition"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  // Giao diện xác nhận trước khi đặt vé
  const { movieName, screen, date, time, seats, totalPrice, fullName, email, identityCard, phoneNumber, poster } = confirmInfo;

  // Giao diện chọn phương thức thanh toán
  if (selectPayment) {
    return (
      <PaymentMethod
        onSelect={setSelectedPayment}
        defaultMethod={selectedPayment}
      />
    );
  }

  // Tính tổng tiền ghế và tổng tiền foodAndDrink
  const seatTotal = seats?.reduce((sum, s) => sum + (Number(s.price) || 0), 0) || 0;
  const foodTotal = selectedFoods?.reduce((sum, f) => sum + (f.price * f.quantity), 0) || 0;

  // Tính số tiền giảm giá VIP (chỉ áp dụng cho ghế)
  const vipDiscountAmount = Math.round((seatTotal * discountVip) / 100);

  // Tính tổng tiền cuối cùng
  let finalTotal = seatTotal + foodTotal;
  let discountAmount = 0;
  let finalSeatTotal = seatTotal;

  // Áp dụng giảm giá VIP trước
  if (discountVip > 0) {
    finalSeatTotal = seatTotal - vipDiscountAmount;
    if (finalSeatTotal < 0) finalSeatTotal = 0;
  }


  if ((discountInfo?.discountAmount || promotionDiscount)) {
    discountAmount = (discountInfo?.discountAmount || 0) + (promotionDiscount || 0);
    finalSeatTotal = finalSeatTotal - discountAmount;
    if (finalSeatTotal < 0) finalSeatTotal = 0;
    finalTotal = finalSeatTotal + foodTotal;
  } else {
    finalTotal = finalSeatTotal + foodTotal;
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
      <div className="relative z-10 flex flex-col items-center py-10">
        <div className="bg-white shadow-xl rounded-xl p-8 max-w-lg w-full border border-gray-200">
          {poster && (
            <div className="flex justify-center mb-4">
              <img src={poster} alt="poster" className="w-40 h-56 object-cover rounded-lg shadow" />
            </div>
          )}
          <h2 className="text-2xl font-bold text-orange-600 mb-6 text-center tracking-wide">Xác nhận đặt vé</h2>
          {/* Thông tin phim & vé */}
          <div className="mb-6">
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm overflow-x-auto">
              <div className="font-medium text-gray-600">Phim:</div>
              <div className="font-semibold text-gray-900 break-all">{movieName}</div>
              <div className="font-medium text-gray-600">Phòng chiếu:</div>
              <div className="font-semibold text-blue-700 break-all">{screen}</div>
              <div className="font-medium text-gray-600">Ngày:</div>
              <div className="font-semibold break-all">{date}</div>
              <div className="font-medium text-gray-600">Giờ:</div>
              <div className="font-semibold break-all">{time}</div>
              <div className="font-medium text-gray-600">Ghế:</div>
              <div className="font-semibold break-all">{seats?.map(s => s.seatName).join(", ")}</div>
              <div className="font-medium text-gray-600">Loại ghế & Giá:</div>
              <div className="font-semibold text-gray-800 break-all">{seats?.map(s => `${s.seatType} (${Number(s.price).toLocaleString()}đ)`).join(", ")}</div>
              <div className="font-medium text-gray-600">Khách hàng:</div>
              <div className="font-semibold break-all">{fullName}</div>
              <div className="font-medium text-gray-600">Email:</div>
              <div className="font-semibold break-all">{email}</div>
            </div>
          </div>
         
          {/* Mã khuyến mãi */}
          <div className="mb-4 flex items-center gap-2">
            <CouponApply
              orderTotal={totalPrice}
              customerId={localStorage.getItem("id")}
              onApplySuccess={(discount) => {
                setDiscountInfo(discount);
                if (discount?.couponCode || discount?.code) {
                  localStorage.setItem("couponCode", discount.couponCode || discount.code);
                }
              }}
              onRemoveCoupon={handleRemoveCoupon}
            />
            {discountInfo && (
              <button
                type="button"
                className="px-3 py-2 bg-red-100 text-red-600 rounded hover:bg-red-200 text-xs font-semibold"
                onClick={handleRemoveCoupon}
              >
                Bỏ áp dụng coupon
              </button>
            )}
          </div>
          {/* Khuyến mãi hệ thống */}
          {(
            (confirmInfo?.date || bookingRequest?.date) &&
            (confirmInfo?.time || bookingRequest?.time) &&
            ((confirmInfo?.seats && confirmInfo?.seats.length > 0) || (bookingRequest?.seatIds && bookingRequest?.seatIds.length > 0))
          ) && (
            <PromotionApply
              orderInfo={orderInfo}
              selectedPromotionIds={selectedPromotionIds}
              setSelectedPromotionIds={setSelectedPromotionIds}
              seatTotal={seatTotal}
              onDiscountChange={(discount, ids) => {
                setPromotionDiscount(discount);
                setSelectedPromotionIds(ids);
              }}
            />
          )}
          {/* Pay-by-points removed */}
          {apiMessage && (
            <div className="text-center text-red-500 my-2">
              {apiMessage === "Cannot read properties of null (reading 'movieTitle')"
                ? "Ghế hiện tại không có sẵn! Vui lòng thử lại sau 5 phút!"
                : apiMessage}
            </div>
          )}

          {/* Tổng kết thanh toán - chuyển xuống cuối cùng */}
          <div className="mb-6 bg-gray-50 rounded-xl p-4 border border-gray-200">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-gray-700">Tổng tiền ghế:</span>
              <span className="font-bold text-blue-700">{seatTotal.toLocaleString()}đ</span>
            </div>
            {discountVip > 0 && (
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-gray-700">
                  Giảm giá VIP ({discountVip}%):
                </span>
                <span className="font-bold text-purple-600">- {vipDiscountAmount.toLocaleString()}đ</span>
              </div>
            )}
            {discountAmount > 0 && (
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-gray-700">Giảm giá khuyến mãi:</span>
                <span className="font-bold text-green-600">- {discountAmount.toLocaleString()}đ</span>
              </div>
            )}
            <div className="flex flex-wrap items-center gap-x-2 mb-2">
              <span className="font-semibold text-gray-700">Tổng đồ ăn & nước uống:</span>
              <span className="text-gray-800">
                {selectedFoods && selectedFoods.length > 0 && selectedFoods.map((food, idx) => (
                  <span key={food.id}>
                    {idx > 0 && ', '}
                    <span className="font-medium">{food.name}</span>
                    <span className="text-gray-500"> x{food.quantity}</span>
                    <span className="text-green-700 font-semibold"> ({Number(food.price * food.quantity).toLocaleString()}đ)</span>
                  </span>
                ))}
              </span>
              <span className="font-bold text-green-700 ml-auto">{foodTotal.toLocaleString()}đ</span>
            </div>
            <div className="flex justify-between items-center border-t pt-2 mt-2">
              <span className="font-bold text-lg text-gray-900">Tổng cộng:</span>
                <span className="font-extrabold text-lg text-red-600">{finalTotal.toLocaleString()}đ</span>
            </div>
            {discountAmount > 0 && discountInfo?.message && (
              <div className="text-blue-600 text-xs mt-1">{discountInfo?.message}</div>
            )}
          </div>

          <div className="flex flex-col gap-3 justify-center mt-6">
            <button
              className="w-full py-2 bg-gradient-to-r from-orange-600 to-yellow-500 hover:from-orange-500 hover:to-yellow-400 text-white text-sm rounded font-bold"
              onClick={handleConfirm}
              disabled={loading}
            >
              {loading ? "Đang xác nhận..." : "Thanh toán"}
            </button>
            <button
              className="w-full py-2 bg-gray-300 hover:bg-gray-500 text-black rounded font-bold"
              onClick={() => navigate(-1)}
              disabled={loading}
            >
              Hủy đặt vé
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmBooking;
