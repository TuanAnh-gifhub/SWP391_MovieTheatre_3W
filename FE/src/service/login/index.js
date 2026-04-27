import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL;

export const login = async (username, password) => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/auth/login`,
      {
        username,
        password,
      }
    );

    // Nếu API trả về token trong response.data.result.token
    if (response.data?.token) {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("username", username);
      localStorage.setItem("id", response.data.id || ""); 
    }

    return response.data;
  } catch (error) {
    console.error("Login error:", error);

    return {
      error: true,
      message: error.response?.data?.message || "Login failed!",
    };
  }
};

export const loginAdmin = async (username, password) => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/auth/login`,
      { username, password }
    );
    return response.data;
  } catch (error) {
    console.error("Admin Login error:", error);
    return {
      error: true,
      message: error.response?.data?.message || "Admin login failed!",
    };
  }
};

export const verifyEmailOTP = async (otpToken) => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/auth/verify-email?token=${otpToken}`
    );
    return response.data;
  } catch (error) {
    return {
      error: true,
      message: error.response?.data?.message || "OTP verification failed!",
    };
  }
};

// Gửi OTP về email để quên mật khẩu
export const forgotPassword = async (email) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/forgot-password`, { email });
    return response.data;
  } catch (error) {
    return {
      error: true,
      message: error?.response?.data?.message || "Không thể gửi OTP. Vui lòng thử lại!",
    };
  }
};

// Đặt lại mật khẩu mới bằng email
export const resetPassword = async ({ email, newPassword, confirmPassword }) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/reset-password`, {
      email,
      newPassword,
      confirmPassword,
    });
    return response.data;
  } catch (error) {
    return {
      error: true,
      message: error?.response?.data?.message || "OTP không hợp lệ hoặc có lỗi!",
    };
  }
};

// Gửi OTP về email cho admin
export const forgotPasswordAdmin = async (email) => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/admin/employees/forgot-password?email=${encodeURIComponent(email)}`
    );
    return response.data;
  } catch (error) {
    return {
      error: true,
      message: error?.response?.data?.message || "Không thể gửi OTP. Vui lòng thử lại!",
    };
  }
};

// Gửi OTP để reset password cho admin
export const sendOtpResetPasswordAdmin = async (email) => {
  try {
    // Lấy token admin từ localStorage (hoặc nơi bạn lưu khi đăng nhập)
    const adminUser = JSON.parse(localStorage.getItem("adminUser") || "{}");
    const token = adminUser.token;

    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/admin/employees/send-otp-reset-password?email=${encodeURIComponent(email)}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    return {
      error: true,
      message: error?.response?.data?.message || "Không thể gửi OTP. Vui lòng thử lại!",
    };
  }
};

// Đặt lại mật khẩu mới bằng email cho admin
export const resetPasswordAdmin = async ({ email, newPassword, confirmPassword }) => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/auth/reset-password`,
      { email, newPassword, confirmPassword }
    );
    return response.data;
  } catch (error) {
    return {
      error: true,
      message: error?.response?.data?.message || "OTP không hợp lệ hoặc có lỗi!",
    };
  }
};

export function clearExpiredToken(type) {
}
