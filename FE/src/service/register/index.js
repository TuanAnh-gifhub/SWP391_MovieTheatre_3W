import axios from "axios";

export const register = async (data) => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/auth/register`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Register error:", error);
    return {
      error: true,
      message: error.response?.data?.message || "Tạo tài khoản thất bại hoặc tài khoản đã tồn tại",
    };
  }
};
