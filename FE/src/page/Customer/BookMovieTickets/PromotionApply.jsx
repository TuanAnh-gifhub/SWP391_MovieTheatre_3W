import React, { useEffect, useState } from "react";
import { getPreviewPromotions } from "../../../service/voucher";

const PromotionApply = ({ orderInfo, selectedPromotionIds, setSelectedPromotionIds, seatTotal, onDiscountChange }) => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [discount, setDiscount] = useState(0);
  const [showPromos, setShowPromos] = useState(false);

  // Chỉ gửi request một lần khi component mount
  useEffect(() => {
    if (!orderInfo) return;
    setLoading(true);
    getPreviewPromotions(orderInfo)
      .then(res => {
        if (res.success) {
          setPromotions(res.data || []);
        } else {
          setPromotions([]);
          setError(res.message || "Không có promotion khả dụng");
        }
      })
      .catch(() => setError("Không thể lấy promotion"))
      .finally(() => setLoading(false));
  }, [orderInfo]);

  // Tính tổng giảm giá dựa trên selectedPromotionIds - không gửi request
  useEffect(() => {
    let totalDiscount = 0;
    selectedPromotionIds.forEach(id => {
      const promo = promotions.find(p => p.promotionId === id);
      if (!promo) return;
      if (promo.promotionType === "PERCENTAGE") {
        let discount = (seatTotal * promo.value) / 100;
        if (promo.maxDiscountAmount && discount > promo.maxDiscountAmount) {
          discount = promo.maxDiscountAmount;
        }
        totalDiscount += discount;
      } else if (promo.promotionType === "FIXED_AMOUNT") {
        totalDiscount += promo.value;
      }
    });
    setDiscount(totalDiscount);
    if (onDiscountChange) onDiscountChange(totalDiscount, selectedPromotionIds);
  }, [selectedPromotionIds, promotions, seatTotal, onDiscountChange]);

  // Xác định trạng thái disable của từng promotion
  const selectedPromos = selectedPromotionIds.map(id => promotions.find(p => p.promotionId === id)).filter(Boolean);
  const selectedGroupCodes = selectedPromos.map(p => p.groupCode);
  const hasExclusive = selectedGroupCodes.includes(null);
  const selectedGroupCode = selectedGroupCodes.find(g => g !== null);

  const isPromoDisabled = (promo) => {
    if (hasExclusive) {
      // Nếu đã chọn 1 exclusive (groupCode=null), disable tất cả còn lại
      return !selectedPromotionIds.includes(promo.promotionId);
    }
    if (selectedGroupCode) {
      // Nếu đã chọn 1 groupCode cụ thể, chỉ cho chọn cùng groupCode
      return promo.groupCode !== selectedGroupCode && !selectedPromotionIds.includes(promo.promotionId);
    }
    return false;
  };

  const handleToggle = (id) => {
    const promo = promotions.find(p => p.promotionId === id);
    if (!promo) return;
    if (isPromoDisabled(promo)) return; // Không cho chọn nếu bị disable
    
    // Chỉ cập nhật state local, không gửi request
    if (selectedPromotionIds.includes(id)) {
      setSelectedPromotionIds(selectedPromotionIds.filter(pid => pid !== id));
    } else {
      // Nếu chọn exclusive, bỏ hết các khuyến mãi khác
      if (promo.groupCode === null) {
        setSelectedPromotionIds([id]);
      } else {
        // Nếu đang chọn groupCode khác, chỉ cho chọn cùng groupCode
        const groupCode = promo.groupCode;
        const newSelected = promotions
          .filter(p => selectedPromotionIds.includes(p.promotionId) && p.groupCode === groupCode)
          .map(p => p.promotionId);
        setSelectedPromotionIds([...newSelected, id]);
      }
    }
  };

  if (loading) return <div>Đang tải khuyến mãi...</div>;
  if (error) return <div className="text-red-500 text-sm">{error}</div>;
  if (!promotions.length) return <div className="text-gray-400 text-sm">Không có khuyến mãi khả dụng</div>;

  return (
    <div className="space-y-2">
      <button
        type="button"
        className="font-semibold text-orange-700 mb-1 flex items-center gap-2 focus:outline-none"
        onClick={() => setShowPromos(v => !v)}
      >
        <span>Chọn khuyến mãi áp dụng:</span>
        <svg
          className={`w-4 h-4 transition-transform ${showPromos ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {showPromos && (
        <div className="space-y-2">
          {promotions.map(promo => (
            <label
              key={promo.promotionId}
              className={`flex items-center gap-2 border rounded p-2 bg-gray-50 cursor-pointer transition-all duration-200 hover:bg-gray-100 ${isPromoDisabled(promo) ? 'opacity-50 pointer-events-none' : ''}`}
            >
              <input
                type="checkbox"
                checked={selectedPromotionIds.includes(promo.promotionId)}
                onChange={() => handleToggle(promo.promotionId)}
                className="accent-orange-500"
                disabled={isPromoDisabled(promo)}
              />
              <div className="flex-1">
                <div className="font-bold text-sm text-gray-800">{promo.title}</div>
                <div className="text-xs text-gray-500">{promo.detail}</div>
                <div className="text-xs text-gray-500">
                  {promo.promotionType === "PERCENTAGE"
                    ? `Giảm ${promo.value}%${promo.maxDiscountAmount ? ` (tối đa ${promo.maxDiscountAmount.toLocaleString()}đ)` : ""}`
                    : `Giảm thẳng ${promo.value.toLocaleString()}đ`}
                </div>
                {promo.condition?.minOrderAmount && (
                  <div className="text-xs text-blue-600">Đơn tối thiểu: {promo.condition.minOrderAmount.toLocaleString()}đ</div>
                )}
                {promo.condition?.applicableRanks && (
                  <div className="text-xs text-green-700">Hạng áp dụng: {promo.condition.applicableRanks.join(", ")}</div>
                )}
                {promo.groupCode && (
                  <div className="text-xs text-purple-700">Group: {promo.groupCode}</div>
                )}
                {promo.groupCode === null && (
                  <div className="text-xs text-red-700 font-semibold">Chỉ được chọn duy nhất</div>
                )}
              </div>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

export default PromotionApply;
