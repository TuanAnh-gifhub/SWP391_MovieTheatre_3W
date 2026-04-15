import axios from "axios";

export const payWithVNPay = async ({
  bookingId,
  totalMoney,
  cinemaRoomId,
  seats
}) => {
  try {
    const token = localStorage.getItem("token");
    const res = await axios.post(`${import.meta.env.VITE_API_URL}/payment`, {
      bookingId,
      totalMoney,
      paymentId: 1, // mặc định
      ipAddress: "13.160.92.202", // mặc định
      cinemaRoomId,
      seats,
      success: true // mặc định
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const confirmVNPayStatus = async ({
  bookingId,
  totalMoney,
  cinemaRoomId,
  seats,
  vnp_ResponseCode,
  vnp_TransactionStatus,
  selectedPromotionIds = []
}) => {
  try {
    const token = localStorage.getItem("token");
    const couponCode = localStorage.getItem("couponCode"); // Lấy couponCode từ localStorage
    
    const requestData = {
      bookingId,
      totalMoney,
      cinemaRoomId,
      seats,
      vnp_ResponseCode,
      vnp_TransactionStatus,
      selectedPromotionIds: Array.isArray(selectedPromotionIds) ? selectedPromotionIds : [],
    };
    
    // Thêm couponCode vào request nếu có
    if (couponCode) {
      requestData.couponCode = couponCode;
    }
    
    const res = await axios.post(`${import.meta.env.VITE_API_URL}/payment/payment-status`, requestData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const checkPaymentByPoints = async ({ point, totalMoney }) => {
  try {
    const token = localStorage.getItem("token");
    const res = await axios.post(`${import.meta.env.VITE_API_URL}/payment/pay-by-point-show`, {
      point,
      totalMoney
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const payByPoints = async ({ point, bookingId }) => {
  try {
    const token = localStorage.getItem("token");
    const res = await axios.post(`${import.meta.env.VITE_API_URL}/payment/result-pay-by-point`, {
      point,
      bookingId
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const updateMemberScore = async (customerID) => {
  try {
    const token = localStorage.getItem("token");
    const res = await axios.post(
      `${import.meta.env.VITE_API_URL}/member/get-score-member?customerID=${customerID}`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return res.data;
  } catch (error) {
    throw error;
  }
};