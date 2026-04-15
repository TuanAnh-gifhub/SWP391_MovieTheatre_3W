import React, { useState } from "react";
import { applyCoupon } from "../../../service/voucher";
import { toast } from "react-toastify";

const CouponApply = ({ orderTotal, customerId, onApplySuccess }) => {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleApply = async () => {
    if (!code) {
      toast.error("Vui lòng nhập mã khuyến mãi!");
      return;
    }
    setLoading(true);
    try {
      const res = await applyCoupon({ code, orderTotal, customerId });
      if (res.status === 200) {
        toast.success(res.message || "Áp dụng mã thành công!");
        // Trả về cả code để ConfirmBooking lưu vào localStorage
        onApplySuccess && onApplySuccess({ ...res.result, couponCode: code });
      } else {
        toast.error(res.message || "Áp dụng mã thất bại!");
      }
    } catch (err) {
      toast.error("Có lỗi xảy ra khi áp dụng mã!");
    }
    setLoading(false);
  };

  return (
    <div className="flex gap-2 items-center mt-2">
      <input
        type="text"
        className="border rounded px-3 py-1 flex-1"
        placeholder="Nhập mã khuyến mãi"
        value={code}
        onChange={e => setCode(e.target.value)}
        disabled={loading}
      />
      <button
        className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-1 rounded"
        onClick={handleApply}
        disabled={loading}
      >
        {loading ? "Đang áp dụng..." : "Áp dụng"}
      </button>
    </div>
  );
};

export default React.memo(CouponApply);