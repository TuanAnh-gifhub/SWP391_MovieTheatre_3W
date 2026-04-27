import axios from "axios";

const API_BASE = `${import.meta.env.VITE_API_URL}/payment`;

const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const createPaymentLink = async ({
  bookingId,
  totalMoney,
  cinemaRoomId,
  seats,
  paymentGateway,
  paymentId,
  ipAddress = "13.160.92.202",
}) => {
  const requestData = {
    bookingId,
    totalMoney,
    cinemaRoomId,
    seats,
    paymentGateway,
    paymentId,
    ipAddress,
    success: true,
  };
  const res = await axios.post(API_BASE, requestData, {
    headers: getAuthHeader(),
  });
  return res.data;
};

export const payWithVNPay = async ({
  bookingId,
  totalMoney,
  cinemaRoomId,
  seats
}) => {
  try {
    return await createPaymentLink({
      bookingId,
      totalMoney,
      cinemaRoomId,
      seats,
      paymentGateway: "VNPay",
      paymentId: 1,
    });
  } catch (error) {
    throw error;
  }
};

export const payWithPayOS = async ({
  bookingId,
  totalMoney,
  cinemaRoomId,
  seats,
}) => {
  try {
    return await createPaymentLink({
      bookingId,
      totalMoney,
      cinemaRoomId,
      seats,
      paymentGateway: "PayOS",
    });
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
    const couponCode = localStorage.getItem("couponCode"); // Lấy couponCode từ localStorage
    
    const requestData = {
      bookingId,
      totalMoney,
      cinemaRoomId,
      seats,
      paymentGateway: "VNPay",
      vnp_ResponseCode,
      vnp_TransactionStatus,
      selectedPromotionIds: Array.isArray(selectedPromotionIds) ? selectedPromotionIds : [],
    };
    
    // Thêm couponCode vào request nếu có
    if (couponCode) {
      requestData.couponCode = couponCode;
    }
    
    const res = await axios.post(`${API_BASE}/payment-status`, requestData, {
      headers: getAuthHeader(),
    });
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const confirmPayOSStatus = async ({
  payosOrderCode,
  payosStatus,
  payosCode,
  bookingId,
  totalMoney,
  cinemaRoomId,
  seats,
  selectedPromotionIds = [],
}) => {
  try {
    const couponCode = localStorage.getItem("couponCode");
    const requestData = {
      bookingId,
      totalMoney,
      cinemaRoomId,
      seats,
      paymentGateway: "PayOS",
      payosOrderCode,
      payosStatus,
      payosCode,
      selectedPromotionIds: Array.isArray(selectedPromotionIds) ? selectedPromotionIds : [],
    };

    if (couponCode) {
      requestData.couponCode = couponCode;
    }

    const res = await axios.post(`${API_BASE}/payment-status`, requestData, {
      headers: getAuthHeader(),
    });
    return res.data;
  } catch (error) {
    throw error;
  }
};

// Pay-by-points functions removed - feature deleted

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