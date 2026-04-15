import axios from "axios";

export const getAllUsers = async () => {
  try {
    // Lấy token admin từ localStorage
    const adminUser = JSON.parse(localStorage.getItem("adminUser") || "{}");
    const token = adminUser.token;
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/get-accounts`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return Array.isArray(response.data?.result) ? response.data.result : [];
  } catch (error) {
    console.error("Error fetching users:", error.response || error);
    return [];
  }
};

export const setAccountActive = async (accountId, active) => {
  try {
    const adminUser = JSON.parse(localStorage.getItem("adminUser") || "{}");
    const token = adminUser.token;
    const res = await axios.put(
      `${import.meta.env.VITE_API_URL}/admin/accounts/${accountId}/set-active?active=${active}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return res.data;
  } catch (error) {
    return { error: true, message: error?.response?.data?.message || error.message || "Lỗi kết nối server" };
  }
};
