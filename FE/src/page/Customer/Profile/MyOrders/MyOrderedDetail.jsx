import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getOrderHistory } from "../../../../service/profile";
import QRCode from "react-qr-code";
import { handleDownloadTicket } from "./DownLoadOrdered"; // Thêm dòng này
import ParallaxBackground from '../../LandingPage/ParallaxBackground';


const decodeId = (str) => {
  try {
    return atob(str);
  } catch {
    return "";
  }
};

const normalizeSeatType = (seatType) => String(seatType || "").toLowerCase();
const seatTypeBadgeClass = (seatType) => {
  if (normalizeSeatType(seatType).includes("vip")) return "bg-yellow-100 text-yellow-700 border border-yellow-200";
  if (normalizeSeatType(seatType).includes("double") || normalizeSeatType(seatType).includes("doi")) return "bg-purple-100 text-purple-700 border border-purple-200";
  return "bg-blue-100 text-blue-700 border border-blue-200";
};

const MyOrderedDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const cardRef = useRef(null); // Thêm dòng này

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      try {
        const response = await getOrderHistory();
        let data = response.data?.data;
        if (data && !Array.isArray(data)) {
          data = [data];
        }
        const normalize = (str) =>
          String(str || "")
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/\s+/g, "_");
        // Tách mã đã mã hóa và slug
        const [encodedId, ...slugParts] = slug.split("-");
        const ticketId = decodeId(encodedId);
        const movieSlug = slugParts.join("-");
        const found = data?.find(
          (item) =>
            (String(item.ticketId || item.bookingId) === ticketId || String(item.bookingId) === ticketId) &&
            normalize(item.movieTitle) === movieSlug
        );
        setOrder(found || null);
      } catch (err) {
        setOrder(null);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [slug]);

  if (loading) return <div className="flex justify-center items-center min-h-screen text-lg">Đang tải chi tiết vé...</div>;
  if (!order)
    return (
      <div className="flex flex-col items-center py-8">
        <div className="text-red-500 font-semibold mb-2">Không tìm thấy đơn hàng!</div>
        <button onClick={() => navigate(-1)} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition">
          Quay lại
        </button>
      </div>
    );
  return (
    <div className="relative min-h-screen w-full">
      {/* Background effect giống các trang khác */}
      <ParallaxBackground />
      {/* Main content */}
      <div
        className="relative z-10 flex flex-col items-center py-2"
        style={{ paddingTop: "20px", paddingBottom: "20px" }}
      >
        {/* Card */}
        <div
          ref={cardRef}
          className="bg-white shadow-xl rounded-xl p-2 max-w-lg w-full border border-gray-200"
        >
          {/* Poster phim */}
          {order.poster && (
            <div className="flex justify-center mb-2">
              <img src={order.poster} alt="poster" className="w-40 h-56 object-cover rounded-lg shadow" />
            </div>
          )}
          {/* Tên phim */}
          <div className="text-3xl font-extrabold text-center text-gray-800 mb-1 uppercase tracking-wide">
            {order.movieTitle || <span className="text-gray-400">Không có</span>}
          </div>
          {/* Rạp và địa chỉ */}
          <div className="flex flex-col items-center mb-2">
            <span className="inline-block bg-orange-300 text-orange-700 px-3 py-1 rounded text-1xl font-semibold mb-1">
              Phòng chiếu: {order.cinemaRoom || <span className="text-gray-400">Không có</span>}
            </span>
            <span className="text-blue-700 underline text-sm font-medium">
              {order.cinemaName || "Tên rạp không có"} - {order.city || "Thành phố không có"}
            </span>
            <a
              href="#"
              className="text-blue-500 text-xs underline mt-1"
            >
              địa chỉ chi tiết
            </a>
          </div>
          {/* QR code và mã vé */}
          <div className="flex flex-col items-center mb-4">
            <div className="text-gray-600 font-semibold mb-1">MÃ VÉ</div>
            <div className="text-2xl font-bold text-red-600 mb-1 tracking-widest">{order.ticketId || order.bookingId}</div>
            <div className="bg-gray-100 p-2 rounded-lg">
              <QRCode
                value={JSON.stringify({
                  ticketId: order.ticketId || order.bookingId,
                  bookingId: order.bookingId,
                  movieTitle: order.movieTitle,
                  showDate: order.showDate,
                  showTime: order.showTime,
                  cinemaRoom: order.cinemaRoom,
                  seats: order.seats,
                })}
                size={120}
                bgColor="#fff"
              />
            </div>
          </div>
          {/* Thông tin vé */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mb-2">
            <div className="font-medium text-gray-600">Suất chiếu:</div>
            <div className="font-semibold">{order.showDate || <span className="text-gray-400">Không có</span>} - {order.showTime || <span className="text-gray-400">Không có</span>}</div>
            <div className="font-medium text-gray-600">Ghế:</div>
            <div className="font-semibold">
              {Array.isArray(order.seats) && order.seats.length > 0
                ? order.seats.map((seat, i) => (
                    <div key={i} className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium mr-2 mb-2 ${seatTypeBadgeClass(seat.seatType)}`}>
                      {seat.seatName} ({seat.seatType}, {Number(seat.price).toLocaleString("vi-VN")} VNĐ)
                    </div>
                  ))
                : <span className="text-gray-400">Không có</span>
              }
            </div>
            {/* Đồ ăn & nước uống */}
            {Array.isArray(order.foodAndDrinks) && order.foodAndDrinks.length > 0 && (
              <>
                <div className="col-span-2">
                  <div className="font-medium text-gray-600 mb-1 mt-2">Đồ ăn & Nước uống:</div>
                  <div className="flex flex-col gap-2">
                    {order.foodAndDrinks.map((item, idx) => (
                      <div key={item.id || idx} className="flex items-center gap-3 border rounded-lg p-2 bg-gray-50">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-12 h-12 object-cover rounded shadow"
                            style={{ minWidth: 48 }}
                          />
                        )}
                        <div className="flex-1">
                          <div className="font-semibold text-gray-800">{item.name}</div>
                          <div className="text-xs text-gray-500">{item.type}</div>
                          <div className="text-xs text-gray-500">Giá: {Number(item.price).toLocaleString("vi-VN")} VNĐ</div>
                          <div className="text-xs text-gray-500">Số lượng: {item.quantity}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
            <div className="font-medium text-gray-600">Tổng tiền:</div>
            <div className="font-bold text-red-600">
              {order.totalPrice !== undefined && order.totalPrice !== null
                ? Number(order.totalPrice).toLocaleString("vi-VN") + " VNĐ"
                : "Không có"}
            </div>
            <div className="font-medium text-gray-600">Trạng thái:</div>
            <div className="font-semibold capitalize">{order.status || "Không có"}</div>
            <div className="font-medium text-gray-600">Ngày đặt vé:</div>
            <div className="font-semibold">
              {order.bookingDate
                ? new Date(order.bookingDate).toLocaleString("vi-VN")
                : "Không có"}
            </div>

          </div>
          {/* Lưu ý */}
          <div className="bg-gray-50 border border-gray-200 rounded p-2 text-xs text-gray-700 mb-2">
            <strong>Lưu ý/Note:</strong>
            <br />
            Vé đã mua không thể huỷ, đổi hoặc trả lại. Vui lòng liên hệ Ban Quản Lý rạp hoặc tra cứu thông tin tại mục{" "}
            <a href="#" className="text-blue-600 underline">Điều khoản mua và sử dụng vé xem phim</a> để biết thêm chi tiết.
            Cảm ơn bạn đã lựa chọn mua vé! Chúc bạn xem phim vui vẻ!
          </div>
          <button
            onClick={() => handleDownloadTicket(cardRef.current, `ve_xem_phim_${order.ticketId || order.bookingId}.png`)}
            className="w-full py-2 bg-gradient-to-r from-orange-600 to-yellow-500 hover:from-orange-500 hover:to-yellow-400 text-black rounded font-semibold transition"
          >
            Lưu vé
          </button>

          <button
            onClick={() => navigate("/profile")}
            className="w-full mt-2 py-2 bg-black text-white rounded font-semibold hover:bg-gray-800 transition mb-2"
          >
            Quay lại
          </button>
          
        </div>
      </div>
    </div>
  );
};

export default MyOrderedDetail;

