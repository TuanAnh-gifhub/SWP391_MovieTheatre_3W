import { instance } from "../instance";

/**
 * Lấy lịch sử điểm thưởng của khách hàng theo customerID
 * @param {string|number} customerID
 * @returns {Promise<{status: number, message: string, result: Array}>}
 */
export const getScoreHistories = async (customerID) => {
  try {
    const token = localStorage.getItem("token");
    const response = await instance.get(
      `/member/get-score-histories/${customerID}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    return {
      status: error.response?.status || 500,
      message: error.response?.data?.message || "Không thể lấy lịch sử điểm thưởng",
      result: [],
    };
  }
};

/**
 * Lấy tất cả danh sách khuyến mãi
 * @returns {Promise<{status: number, message: string, result: Array}>}
 */
export const getAllCoupons = async () => {
  try {
    const adminUser = JSON.parse(localStorage.getItem("adminUser") || "{}");
    const token = adminUser.token;
    // Nếu API không yêu cầu token thì bỏ phần headers đi:
    const response = await instance.get("/coupon/view-all", {
      headers: token
        ? { Authorization: `Bearer ${token}` }
        : undefined,
    });
    return response.data;
  } catch (error) {
    return {
      status: error.response?.status || 500,
      message: error.response?.data?.message || "Không thể lấy danh sách khuyến mãi",
      result: [],
    };
  }
};

/**
 * Bật/tắt trạng thái hoạt động của khuyến mãi
 * @param {number} couponId
 * @returns {Promise<{status: number, message: string}>}
 */
export const toggleCouponStatus = async (couponId) => {
  try {
    const adminUser = JSON.parse(localStorage.getItem("adminUser") || "{}");
    const token = adminUser.token;
    const response = await instance.put(
      "/coupon/on-off-coupon",
      [couponId],
      {
        headers: token
          ? { Authorization: `Bearer ${token}` }
          : undefined,
      }
    );
    return response.data;
  } catch (error) {
    return {
      status: error.response?.status || 500,
      message: error.response?.data?.message || "Không thể thay đổi trạng thái khuyến mãi",
    };
  }
};

/**
 * Tạo mới khuyến mãi
 * @param {Object} data
 * @returns {Promise<{status: number, message: string}>}
 */
export const createCoupon = async (data) => {
  try {
    const adminUser = JSON.parse(localStorage.getItem("adminUser") || "{}");
    const token = adminUser.token;
    const response = await instance.post(
      "/coupon/create-coupon",
      data,
      {
        headers: token
          ? { Authorization: `Bearer ${token}` }
          : undefined,
      }
    );
    return response.data;
  } catch (error) {
    return {
      status: error.response?.status || 500,
      message: error.response?.data?.message || "Không thể tạo khuyến mãi",
    };
  }
};

/**
 * Áp dụng mã khuyến mãi cho đơn hàng
 * @param {Object} data { code, orderTotal, customerId }
 * @returns {Promise<{status: number, message: string, result?: any}>}
 */
export const applyCoupon = async (data) => {
  try {
    const token = localStorage.getItem("token");
    const response = await instance.post(
      "/coupon/apply",
      data,
      {
        headers: token
          ? { Authorization: `Bearer ${token}` }
          : undefined,
      }
    );
    return response.data;
  } catch (error) {
    return {
      status: error.response?.status || 500,
      message: error.response?.data?.message || "Không thể áp dụng mã khuyến mãi",
    };
  }
};

/**
 * Lấy tất cả danh sách promotion (cho admin, cần token admin)
 */
export const getAllPromotions = async () => {
  try {
    const adminUser = JSON.parse(localStorage.getItem("adminUser") || "{}");
    const token = adminUser.token;
    const response = await instance.get("/promotions/get-all-promotions", {
      headers: token
        ? { Authorization: `Bearer ${token}` }
        : undefined,
    });
    return {
      status: 200,
      message: "Lấy danh sách promotion thành công",
      result: response.data,
    };
  } catch (error) {
    return {
      status: error.response?.status || 500,
      message: error.response?.data?.message || "Không thể lấy danh sách promotion",
      result: [],
    };
  }
};

/**
 * Lấy tất cả danh sách promotion cho customer (cần token user)
 */
export const getAllPromotionsForCustomer = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await instance.get("/promotions/get-all-promotions", {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    return {
      status: 200,
      message: "Lấy danh sách promotion thành công",
      result: response.data,
    };
  } catch (error) {
    return {
      status: error.response?.status || 500,
      message: error.response?.data?.message || "Không thể lấy danh sách promotion",
      result: [],
    };
  }
};

/**
 * Lấy tất cả danh sách promotion cho guest (không cần token)
 */
export const getAllPromotionsForGuest = async () => {
  try {
    const response = await instance.get("/promotions/get-all-promotions-guest");
    return {
      status: 200,
      message: "Lấy danh sách promotion thành công",
      result: response.data,
    };
  } catch (error) {
    return {
      status: error.response?.status || 500,
      message: error.response?.data?.message || "Không thể lấy danh sách promotion",
      result: [],
    };
  }
};

/**
 * Lấy các điều kiện promotion
 */
export const getPromotionConditions = async () => {
  try {
    const adminUser = JSON.parse(localStorage.getItem("adminUser") || "{}");
    const token = adminUser.token;
    const response = await instance.get("/promotions/conditions", {
      headers: token
        ? { Authorization: `Bearer ${token}` }
        : undefined,
    });
    return {
      status: 200,
      message: "Lấy điều kiện promotion thành công",
      result: response.data,
    };
  } catch (error) {
    return {
      status: error.response?.status || 500,
      message: error.response?.data?.message || "Không thể lấy điều kiện promotion",
      result: [],
    };
  }
};

/**
 * Tạo mới promotion
 * @param {Object} data
 * @returns {Promise<{status: number, message: string, result?: any}>}
 */
export const createPromotion = async (data) => {
  try {
    const adminUser = JSON.parse(localStorage.getItem("adminUser") || "{}");
    const token = adminUser.token;
    const response = await instance.post(
      "/promotions/create-promotion",
      data,
      {
        headers: token
          ? { Authorization: `Bearer ${token}` }
          : undefined,
      }
    );
    return {
      status: 200,
      message: "Tạo promotion thành công",
      result: response.data,
    };
  } catch (error) {
    return {
      status: error.response?.status || 500,
      message: error.response?.data?.message || "Không thể tạo promotion",
      result: null,
    };
  }
};

/**
 * Cập nhật promotion
 * @param {Object} data
 * @returns {Promise<{status: number, message: string, result?: any}>}
 */
export const updatePromotion = async (data) => {
  try {
    const adminUser = JSON.parse(localStorage.getItem("adminUser") || "{}");
    const token = adminUser.token;
    const response = await instance.put(
      "/promotions/update",
      data,
      {
        headers: token
          ? { Authorization: `Bearer ${token}` }
          : undefined,
      }
    );
    return {
      status: 200,
      message: "Cập nhật promotion thành công",
      result: response.data,
    };
  } catch (error) {
    return {
      status: error.response?.status || 500,
      message: error.response?.data?.message || "Không thể cập nhật promotion",
      result: null,
    };
  }
};

/**
 * Bật/tắt trạng thái hoạt động của promotion
 * @param {number} promotionId
 * @returns {Promise<{status: number, message: string, success: boolean}>}
 */
export const togglePromotionStatus = async (promotionId) => {
  try {
    const adminUser = JSON.parse(localStorage.getItem("adminUser") || "{}");
    const token = adminUser.token;
    const response = await instance.put(
      `/promotions/deactivate/${promotionId}`,
      {},
      {
        headers: token
          ? { Authorization: `Bearer ${token}` }
          : undefined,
      }
    );
    return response.data;
  } catch (error) {
    return {
      status: error.response?.status || 500,
      message: error.response?.data?.message || "Không thể thay đổi trạng thái promotion",
      success: false,
    };
  }
};

/**
 * Xóa promotion
 * @param {number} id
 * @returns {Promise<{status: number, message: string}>}
 */
export const deletePromotion = async (id) => {
  try {
    const adminUser = JSON.parse(localStorage.getItem("adminUser") || "{}");
    const token = adminUser.token;
    const response = await instance.delete(`/promotions/delete/${id}`, {
      headers: token
        ? { Authorization: `Bearer ${token}` }
        : undefined,
    });
    return {
      status: 200,
      message: "Xóa promotion thành công",
    };
  } catch (error) {
    return {
      status: error.response?.status || 500,
      message: error.response?.data?.message || "Không thể xóa promotion",
    };
  }
};

/**
 * Lấy danh sách group code promotion
 * @returns {Promise<{status: number, message: string, result: Array}>}
 */
export const getPromotionGroupCodes = async () => {
  try {
    const adminUser = JSON.parse(localStorage.getItem("adminUser") || "{}");
    const token = adminUser.token;
    const response = await instance.get("/promotions/group/list", {
      headers: token
        ? { Authorization: `Bearer ${token}` }
        : undefined,
    });
    return {
      status: 200,
      message: response.data.message || "Lấy danh sách group code thành công",
      result: response.data.data || [],
    };
  } catch (error) {
    return {
      status: error.response?.status || 500,
      message: error.response?.data?.message || "Không thể lấy danh sách group code",
      result: [],
    };
  }
};

/**
 * Tạo mới group code promotion
 * @param {Object} data { groupCode, description }
 * @returns {Promise<{status: number, message: string}>}
 */
export const createPromotionGroupCode = async ({ groupCode, description }) => {
  try {
    const adminUser = JSON.parse(localStorage.getItem("adminUser") || "{}");
    const token = adminUser.token;
    const params = new URLSearchParams({
      groupCode,
      description,
    }).toString();
    const response = await instance.post(
      `/promotions/group/create-group?${params}`,
      {},
      {
        headers: token
          ? { Authorization: `Bearer ${token}` }
          : undefined,
      }
    );
    return {
      status: 200,
      message: response.data.message || "Tạo group thành công",
    };
  } catch (error) {
    return {
      status: error.response?.status || 500,
      message: error.response?.data?.message || "Không thể tạo group",
    };
  }
};

/**
 * Cập nhật group code promotion
 * @param {Object} data { id, groupCode, description }
 * @returns {Promise<{status: number, message: string}>}
 */
export const updatePromotionGroupCode = async ({ id, groupCode, description }) => {
  try {
    const adminUser = JSON.parse(localStorage.getItem("adminUser") || "{}");
    const token = adminUser.token;
    const params = new URLSearchParams({
      groupCode,
      description,
    }).toString();
    const response = await instance.put(
      `/promotions/group/update/${id}?${params}`,
      {},
      {
        headers: token
          ? { Authorization: `Bearer ${token}` }
          : undefined,
      }
    );
    return {
      status: 200,
      message: response.data.message || "Cập nhật group thành công",
    };
  } catch (error) {
    return {
      status: error.response?.status || 500,
      message: error.response?.data?.message || "Không thể cập nhật group",
    };
  }
};

/**
 * Xóa group code promotion
 * @param {number} id
 * @returns {Promise<{status: number, message: string}>}
 */
export const deletePromotionGroupCode = async (id) => {
  try {
    const adminUser = JSON.parse(localStorage.getItem("adminUser") || "{}");
    const token = adminUser.token;
    const response = await instance.delete(`/promotions/group/delete/${id}`, {
      headers: token
        ? { Authorization: `Bearer ${token}` }
        : undefined,
    });
    return {
      status: 200,
      message: response.data.message || "Xóa group code thành công",
    };
  } catch (error) {
    return {
      status: error.response?.status || 500,
      message: error.response?.data?.message || "Không thể xóa group code",
    };
  }
};

/**
 * Gán promotion vào group code
 * @param {Object} data { promotionIds: Array<number>, groupId: number }
 * @returns {Promise<{status: number, message: string}>}
 */
export const assignPromotionsToGroup = async ({ promotionIds, groupId }) => {
  try {
    const adminUser = JSON.parse(localStorage.getItem("adminUser") || "{}");
    const token = adminUser.token;
    const response = await instance.post(
      "/promotions/group/assign",
      { promotionIds, groupId },
      {
        headers: token
          ? { Authorization: `Bearer ${token}` }
          : undefined,
      }
    );
    return {
      status: 200,
      message: response.data.message || "Gán promotion vào group thành công",
    };
  } catch (error) {
    return {
      status: error.response?.status || 500,
      message: error.response?.data?.message || "Không thể gán promotion vào group",
    };
  }
};

/**
 * Lấy danh sách promotion hợp lệ cho đơn hàng
 * @param {Object} data { customerId, movieId, cinemaRoomId, showDate, showTime, seatIds }
 * @returns {Promise<{message: string, success: boolean, data: Array}>}
 */
export const getPreviewPromotions = async (data) => {
  try {
    const token = localStorage.getItem("token");
    
    const response = await instance.post(
      "/customer/preview-promotions",
      data,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      }
    );
    return response.data;
  } catch (error) {
    return {
      message: error.response?.data?.message || "Không thể lấy danh sách promotion",
      success: false,
      data: [],
    };
  }
};

/**
 * Chọn coupon game (dùng cho admin để chọn coupon sẽ hiển thị cho customer game)
 * @param {number} couponId
 * @returns {Promise<{status: number, message: string}>}
 */
export const chooseCouponGame = async (couponId) => {
  try {
    const adminUser = JSON.parse(localStorage.getItem("adminUser") || "{}");
    const token = adminUser.token;
    const response = await instance.put(
      "/coupon/choose-coupon-game",
      JSON.stringify(couponId), // ép thành JSON string
      {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          "Content-Type": "application/json", // BẮT BUỘC
        },
      }
    );
    return response.data;
  } catch (error) {
    return {
      status: error.response?.status || 500,
      message: error.response?.data?.message || "Không thể chọn coupon game",
    };
  }
};

/**
 * Lấy danh sách coupon minigame mà customer đã nhận
 * @param {number|string} customerId
 * @returns {Promise<{status: number, message: string, result: Array}>}
 */
export const getMyGameCoupons = async (customerId) => {
  try {
    const token = localStorage.getItem("token");
    const response = await instance.get(`/coupon/my-game-coupons/${customerId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    return response.data;
  } catch (error) {
    return {
      status: error.response?.status || 500,
      message: error.response?.data?.message || "Không thể lấy voucher minigame",
      result: [],
    };
  }
};

/**
 * Xóa coupon (admin)
 * @param {number} couponId
 * @returns {Promise<{status: number, message: string}>}
 */
export const deleteCoupon = async (couponId) => {
  try {
    const adminUser = JSON.parse(localStorage.getItem("adminUser") || "{}");
    const token = adminUser.token;
    const response = await instance.delete(`/coupon/delete/${couponId}`, {
      headers: token
        ? { Authorization: `Bearer ${token}` }
        : undefined,
    });
    return response.data; // { status, message }
  } catch (error) {
    return {
      status: error.response?.status || 500,
      message: error.response?.data?.message || "Không thể xóa khuyến mãi",
    };
  }
};