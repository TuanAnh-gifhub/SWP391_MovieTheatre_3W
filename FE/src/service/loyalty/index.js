import { instance } from "../instance";
const API_URL = import.meta.env.VITE_API_URL;

// Lấy tất cả các tier xếp hạng thành viên 
export const getAllLoyaltyTiers = async () => {
  // Lấy cả token user và token admin (nếu có)
  const token = localStorage.getItem("token");
  const adminUser = JSON.parse(localStorage.getItem("adminUser") || "{}");
  const adminToken = adminUser.token;

  // Ưu tiên dùng adminToken nếu có, nếu không thì dùng token thường
  const usedToken = adminToken || token;

  try {
    const response = await instance.post(
      `/loyalty-tier/view-all`,
      {},
      {
        headers: {
          Authorization: `Bearer ${usedToken}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    return {
      status: error.response?.status || 500,
      message: error.response?.data?.message || "Lỗi khi lấy dữ liệu xếp hạng!",
      result: [],
    };
  }
};

// API tạo loyalty tier mới (yêu cầu quyền admin)
export const createLoyaltyTier = async ({ name, pointThreshold, discountPercent, rankLink }) => {
  const adminUser = JSON.parse(localStorage.getItem("adminUser") || "{}");
  const token = adminUser.token;
  try {
    const response = await instance.post(
      "/loyalty-tier/create",
      { name, pointThreshold, discountPercent, rankLink },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data; // { status, message, result }
  } catch (error) {
    return {
      status: error.response?.status || 500,
      message: error.response?.data?.message || "Lỗi khi tạo hạng thành viên!",
      result: null,
    };
  }
};

// API bật/tắt trạng thái hoạt động của loyalty tier
export const toggleLoyaltyStatus = async (ids) => {
  const adminUser = JSON.parse(localStorage.getItem("adminUser") || "{}");
  const token = adminUser.token;
  try {
    const response = await instance.put(
      "/loyalty-tier/on-off-loyalty",
      ids,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data; // { status, result }
  } catch (error) {
    return {
      status: error.response?.status || 500,
      result: error.response?.data?.result || "Lỗi khi cập nhật trạng thái!",
    };
  }
};

// API cập nhật loyalty tier (yêu cầu quyền admin)
export const updateLoyaltyTier = async (id, { name, pointThreshold, discountPercent, rankLink }) => {
  const adminUser = JSON.parse(localStorage.getItem("adminUser") || "{}");
  const token = adminUser.token;
  try {
    const response = await instance.put(
      `/loyalty-tier/update/${id}`,
      { name, pointThreshold, discountPercent, rankLink },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data; // { status, message, result }
  } catch (error) {
    return {
      status: error.response?.status || 500,
      message: error.response?.data?.message || "Lỗi khi cập nhật hạng thành viên!",
      result: null,
    };
  }
};

// Lấy tất cả quy tắc tích điểm và đổi điểm (loyalty rule)
export const getAllLoyaltyRules = async () => {
  const adminUser = JSON.parse(localStorage.getItem("adminUser") || "{}");
  const token = adminUser.token;
  try {
    const response = await instance.post(
      "/loyalty-rule/view-all",
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    // { status, message, result: [{ id, amountMoney, pointsEarn, returnMoney, isActive }] }
    return response.data;
  } catch (error) {
    return {
      status: error.response?.status || 500,
      message: error.response?.data?.message || "Lỗi khi lấy dữ liệu quy tắc tích điểm!",
      result: [],
    };
  }
};

// API tạo quy tắc tích điểm & đổi điểm mới (yêu cầu quyền admin)
export const createLoyaltyRule = async ({ amountMoney, pointsEarn, returnMoney }) => {
  const adminUser = JSON.parse(localStorage.getItem("adminUser") || "{}");
  const token = adminUser.token;
  try {
    const response = await instance.post(
      "/loyalty-rule/create",
      { amountMoney, pointsEarn, returnMoney },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data; // { status, message, result }
  } catch (error) {
    return {
      status: error.response?.status || 500,
      message: error.response?.data?.message || "Lỗi khi tạo quy tắc tích điểm!",
      result: null,
    };
  }
};

// API bật/tắt trạng thái hoạt động của loyalty rule
export const toggleLoyaltyRuleStatus = async (id) => {
  const adminUser = JSON.parse(localStorage.getItem("adminUser") || "{}");
  const token = adminUser.token;
  try {
    const response = await instance.put(
      "/loyalty-rule/on-off-rule",
      id, 
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    return {
      status: error.response?.status || 500,
      result: error.response?.data?.result || "Lỗi khi cập nhật trạng thái!",
    };
  }
};

// API cập nhật quy tắc tích điểm (yêu cầu quyền admin)
export const updateLoyaltyRule = async (id, { amountMoney, pointsEarn, returnMoney }) => {
  const adminUser = JSON.parse(localStorage.getItem("adminUser") || "{}");
  const token = adminUser.token;
  try {
    const response = await instance.put(
      `/loyalty-rule/update/${id}`,
      { amountMoney, pointsEarn, returnMoney },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data; // { status, message, result }
  } catch (error) {
    return {
      status: error.response?.status || 500,
      message: error.response?.data?.message || "Lỗi khi cập nhật quy tắc tích điểm!",
      result: null,
    };
  }
};

// API xóa loyalty tier (yêu cầu quyền admin)
export const deleteLoyaltyTier = async (tierId) => {
  const adminUser = JSON.parse(localStorage.getItem("adminUser") || "{}");
  const token = adminUser.token;
  try {
    const response = await instance.delete(
      `/loyalty-tier/delete/${tierId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data; // { status, message }
  } catch (error) {
    return {
      status: error.response?.status || 500,
      message: error.response?.data?.message || "Lỗi khi xóa hạng thành viên!",
    };
  }
};

// API xóa loyalty rule (yêu cầu quyền admin)
export const deleteLoyaltyRule = async (ruleId) => {
  const adminUser = JSON.parse(localStorage.getItem("adminUser") || "{}");
  const token = adminUser.token;
  try {
    const response = await instance.delete(
      `/loyalty-rule/delete/${ruleId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data; // { status, message }
  } catch (error) {
    return {
      status: error.response?.status || 500,
      message: error.response?.data?.message || "Lỗi khi xóa quy tắc tích điểm!",
    };
  }
};