import axios from "axios";


// Get Profile Member
export const getProfileMember = async (customerID) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/member/get-profile-member?customerID=${customerID}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data?.result || null;
  } catch (error) {
    console.error("Error fetching profile:", error.response || error);
    return null;
  }
};

// update ProfileProfile
export const updateProfile = async (data) => {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${import.meta.env.VITE_API_URL}/member/edit-profile-member`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        Accept: "*/*",
      },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error updating profile:", error);
    return null;
  }
};

// Get Order History
export const getOrderHistory = async () => {
  try {
    const customerId = localStorage.getItem("id");
    const token = localStorage.getItem("token");
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/customer/view-bookinged-ticket`,
      {
        params: { customerId },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return { data: response.data };
  } catch (error) {
    console.error("Error fetching order history:", error.response || error);
    throw error;
  }
};

// Gửi OTP đổi mật khẩu
export const sendOtpResetPassword = async (emailOrUsername) => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/auth/send-otp?emailOrUsername=${encodeURIComponent(emailOrUsername)}`,
      { method: "POST" }
    );
    return await response.json();
  } catch (error) {
    console.error("Error sending OTP:", error);
    return null;
  }
};

// Đổi mật khẩu bằng OTP
export const resetPasswordWithOtp = async ({ token, newPassword, confirmPassword }) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, newPassword, confirmPassword }),
    });
    return await response.json();
  } catch (error) {
    console.error("Error resetting password:", error);
    return null;
  }
};

