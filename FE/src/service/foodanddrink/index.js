import axios from "axios";

const API_BASE_URL = `${import.meta.env.VITE_API_URL}/food-and-drink`;

/**
 * Lấy tất cả danh sách đồ ăn & nước uống
 */
export const getAllFoodAndDrinks = async () => {
  try {
    const res = await axios.get(API_BASE_URL);
    return Array.isArray(res.data) ? res.data : [];
  } catch (error) {
    return [];
  }
};

/**
 * Tạo mới đồ ăn & nước uống (yêu cầu quyền admin)
 * @param {Object} data
 * @returns {Promise<{status: number, message: string, result?: any}>}
 */
export const createFoodAndDrink = async (data) => {
  try {
    const adminUser = JSON.parse(localStorage.getItem("adminUser") || "{}");
    const token = adminUser.token;
    const res = await axios.post(API_BASE_URL, data, {
      headers: token
        ? { Authorization: `Bearer ${token}` }
        : undefined,
    });
    return {
      status: 200,
      message: "Thêm đồ ăn/uống thành công",
      result: res.data,
    };
  } catch (error) {
    return {
      status: error.response?.status || 500,
      message: error.response?.data?.message || "Thêm đồ ăn/uống thất bại",
    };
  }
};

/**
 * Cập nhật trạng thái active của food & drink (yêu cầu quyền admin)
 * @param {number} id
 * @param {boolean} value
 * @returns {Promise<{status: number, message: string}>}
 */
export const setActiveFoodAndDrink = async (id, value) => {
  try {
    const adminUser = JSON.parse(localStorage.getItem("adminUser") || "{}");
    const token = adminUser.token;
    const res = await axios.put(
      `${API_BASE_URL}/${id}/set-active?value=${value}`,
      {},
      {
        headers: token
          ? { Authorization: `Bearer ${token}` }
          : undefined,
      }
    );
    return {
      status: 200,
      message: res.data?.message || "Cập nhật trạng thái thành công",
    };
  } catch (error) {
    return {
      status: error.response?.status || 500,
      message: error.response?.data?.message || "Cập nhật trạng thái thất bại",
    };
  }
};

/**
 * Cập nhật thông tin đồ ăn & nước uống (yêu cầu quyền admin)
 * @param {number} id
 * @param {Object} data
 * @returns {Promise<{status: number, message: string, result?: any}>}
 */
export const updateFoodAndDrink = async (id, data) => {
  try {
    const adminUser = JSON.parse(localStorage.getItem("adminUser") || "{}");
    const token = adminUser.token;
    const res = await axios.put(
      `${API_BASE_URL}/${id}`,
      data,
      {
        headers: token
          ? { Authorization: `Bearer ${token}` }
          : undefined,
      }
    );
    return {
      status: 200,
      message: res.data?.message || "Cập nhật thành công",
      result: res.data,
    };
  } catch (error) {
    return {
      status: error.response?.status || 500,
      message: error.response?.data?.message || "Cập nhật thất bại",
    };
  }
};

/**
 * Xóa đồ ăn & nước uống (yêu cầu quyền admin)
 * @param {number} id
 * @returns {Promise<{status: number, message: string}>}
 */
export const deleteFoodAndDrink = async (id) => {
  try {
    const adminUser = JSON.parse(localStorage.getItem("adminUser") || "{}");
    const token = adminUser.token;
    const res = await axios.delete(`${API_BASE_URL}/${id}`, {
      headers: token
        ? { Authorization: `Bearer ${token}` }
        : undefined,
    });
    return {
      status: 200,
      message: res.data?.message || "Xóa thành công",
    };
  } catch (error) {
    return {
      status: error.response?.status || 500,
      message: error.response?.data?.message || "Xóa thất bại",
    };
  }
};