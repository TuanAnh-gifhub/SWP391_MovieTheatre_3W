import { useEffect, useState } from "react";
import { getAllPromotionsForGuest } from "../../../service/voucher";

const VoucherHome = () => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPromotion, setSelectedPromotion] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchPromotions = async () => {
      setLoading(true);
      const res = await getAllPromotionsForGuest();
      setPromotions(Array.isArray(res.result) ? res.result : []);
      setLoading(false);
    };
    fetchPromotions();
  }, []);

  return (
    <div className="max-w-4xl mx-auto py-8 px-2 min-h-[60vh]">
      <h1 className="text-3xl font-bold text-orange-600 mb-6 text-center">Danh sách khuyến mãi</h1>
      {loading ? (
        <div className="text-center py-8">Đang tải khuyến mãi...</div>
      ) : promotions.length === 0 ? (
        <div className="text-center text-gray-500 py-8">Hiện chưa có chương trình khuyến mãi nào.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {promotions.map((promo) => (
            <div
              key={promo.promotionId}
              onClick={() => {
                setSelectedPromotion(promo);
                setShowModal(true);
              }}
              className="flex flex-col bg-white rounded-xl shadow-md border border-orange-200 p-2 min-h-[140px] hover:shadow-orange-200 transition-all cursor-pointer"
            >
              {promo.image && (
                <img
                  src={promo.image}
                  alt={promo.title}
                  className="w-full h-20 object-contain rounded-lg mb-2 border bg-white"
                />
              )}
              <div className="flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-bold text-orange-600 line-clamp-1">{promo.title}</span>
                  <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold tracking-wide shadow-sm ml-1 ${promo.promotionType === 'PERCENTAGE' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                    {promo.promotionType === 'PERCENTAGE' ? 'Giảm %' : 'Giảm giá'}
                  </span>
                </div>
                <div className="text-xs text-gray-400 mb-1">Từ: {promo.startTime ? new Date(promo.startTime).toLocaleDateString("vi-VN") : ""} - Đến: {promo.endTime ? new Date(promo.endTime).toLocaleDateString("vi-VN") : ""}</div>
                <div className="text-xs text-gray-700 mb-1 line-clamp-2">{promo.detail}</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-base font-extrabold text-orange-500">{promo.value}{promo.promotionType === "PERCENTAGE" ? "%" : "đ"}</span>
                  {promo.condition?.minOrderAmount && (
                    <span className="text-xs text-gray-500 italic">Đơn từ {promo.condition.minOrderAmount.toLocaleString()}đ</span>
                  )}
                </div>
                <div className="mt-auto flex items-center gap-2 pt-1">
                  <span className={`inline-block w-2 h-2 rounded-full ${promo.status === 'ACTIVE' ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                  <span className={`text-xs font-semibold ${promo.status === 'ACTIVE' ? 'text-green-600' : 'text-gray-500'}`}>{promo.status === 'ACTIVE' ? 'Đang khả dụng' : 'Không khả dụng'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Modal chi tiết khuyến mãi */}
      {showModal && selectedPromotion && (
        <div className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-auto">
          <div className="bg-white rounded-xl p-3 max-w-sm w-full shadow-lg relative border border-orange-200 max-h-100 overflow-y-auto">
            <button
              className="absolute top-1 right-1 text-gray-500 hover:text-orange-500 text-xl"
              onClick={() => setShowModal(false)}
            >
              &times;
            </button>
            <img src={selectedPromotion.image} alt={selectedPromotion.title} className="w-full h-24 object-contain mb-2 rounded" />
            <h2 className="text-lg font-bold text-orange-600 mb-1">{selectedPromotion.title}</h2>
            <div className="text-xs text-gray-700 mb-2">{selectedPromotion.detail}</div>
            <div className="mb-1 text-xs">
              <span className="font-semibold">Thời gian:</span>
              <span> {selectedPromotion.startTime ? new Date(selectedPromotion.startTime).toLocaleDateString("vi-VN") : ""} - {selectedPromotion.endTime ? new Date(selectedPromotion.endTime).toLocaleDateString("vi-VN") : ""}</span>
            </div>
            <div className="mb-1 text-xs">
              <span className="font-semibold">Giá trị:</span>
              <span> {selectedPromotion.value}{selectedPromotion.promotionType === "PERCENTAGE" ? "%" : "đ"}</span>
              {selectedPromotion.maxDiscountAmount && (
                <span> (Tối đa {selectedPromotion.maxDiscountAmount.toLocaleString()}đ)</span>
              )}
            </div>
            {selectedPromotion.condition?.minOrderAmount && (
              <div className="mb-1 text-xs">
                <span className="font-semibold">Đơn tối thiểu:</span>
                <span> {selectedPromotion.condition.minOrderAmount.toLocaleString()}đ</span>
              </div>
            )}
            {selectedPromotion.groupCode && (
              <div className="mb-1 text-xs">
                <span className="font-semibold">Group code:</span> <span>{selectedPromotion.groupCode}</span>
              </div>
            )}
            {selectedPromotion.isExclusive !== undefined && (
              <div className="mb-1 text-xs">
                <span className="font-semibold">Độc quyền:</span> <span>{selectedPromotion.isExclusive ? "Có" : "Không"}</span>
              </div>
            )}
            {selectedPromotion.maxTotalUsage && (
              <div className="mb-1 text-xs">
                <span className="font-semibold">Tổng số lượt sử dụng tối đa:</span> <span>{selectedPromotion.maxTotalUsage}</span>
              </div>
            )}
            {selectedPromotion.maxUsagePerCustomer && (
              <div className="mb-1 text-xs">
                <span className="font-semibold">Số lượt sử dụng tối đa mỗi khách:</span> <span>{selectedPromotion.maxUsagePerCustomer}</span>
              </div>
            )}
            {selectedPromotion.condition?.applicableRoles && selectedPromotion.condition.applicableRoles.length > 0 && (
              <div className="mb-1 text-xs">
                <span className="font-semibold">Áp dụng cho vai trò:</span> <span>{selectedPromotion.condition.applicableRoles.join(", ")}</span>
              </div>
            )}
            {selectedPromotion.condition?.applicableRanks && selectedPromotion.condition.applicableRanks.length > 0 && (
              <div className="mb-1 text-xs">
                <span className="font-semibold">Áp dụng cho hạng:</span> <span>{selectedPromotion.condition.applicableRanks.join(", ")}</span>
              </div>
            )}
            {selectedPromotion.condition?.dayOfWeek && selectedPromotion.condition.dayOfWeek.length > 0 && (
              <div className="mb-1 text-xs">
                <span className="font-semibold">Áp dụng các ngày:</span> <span>{selectedPromotion.condition.dayOfWeek.join(", ")}</span>
              </div>
            )}
            <div className="mt-3 flex justify-end">
              <button
                className="px-3 py-1.5 bg-orange-500 text-white rounded text-sm hover:bg-orange-600"
                onClick={() => setShowModal(false)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoucherHome;
