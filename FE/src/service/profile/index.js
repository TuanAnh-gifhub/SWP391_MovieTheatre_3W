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

    let result;
    try {
      result = await response.json();
    } catch {
      result = null;
    }

    if (!response.ok) {
      return {
        success: false,
        message: result?.message || "Cập nhật thông tin thất bại",
      };
    }

    return {
      success: result?.success === true,
      message: result?.message || (result?.success ? "Cập nhật thông tin thành công" : "Cập nhật thông tin thất bại"),
      data: result?.data,
    };
  } catch (error) {
    console.error("Error updating profile:", error);
    return {
      success: false,
      message: "Không thể kết nối máy chủ",
    };
  }
};

const buildSeatLevelTickets = (rawOrders) => {
  const orders = Array.isArray(rawOrders) ? rawOrders : rawOrders ? [rawOrders] : [];

  return orders.flatMap((order) => {
    const seats = Array.isArray(order?.seats) ? order.seats : [];

    if (seats.length === 0) {
      return [
        {
          ...order,
          ticketId: String(order?.bookingId ?? ""),
        },
      ];
    }

    return seats.map((seat, index) => {
      const seatKey = seat?.seatId ?? seat?.seatName ?? index;
      return {
        ...order,
        // Unique ticket identity for profile page actions (detail/share/download)
        ticketId: `${order?.bookingId ?? "booking"}-${seatKey}`,
        bookingTotalPrice: order?.totalPrice,
        totalPrice: seat?.price ?? order?.totalPrice,
        seats: seat ? [seat] : [],
      };
    });
  });
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

    const normalizedTickets = buildSeatLevelTickets(response.data?.data);

    return {
      data: {
        ...response.data,
        data: normalizedTickets,
      },
    };
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

