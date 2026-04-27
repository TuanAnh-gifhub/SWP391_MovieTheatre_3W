import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL;

// Lấy tất cả cụm rạp/phòng chiếu
export const fetchAllRooms = async () => {
  try {
    const adminUser = JSON.parse(localStorage.getItem("adminUser") || "{}");
    const token = adminUser.token;

    if (!token) return { error: true, message: "No token found, please login again." };

    const response = await axios.get(`${API_BASE_URL}/showtime/view-all-room`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return {
      error: false,
      result: response.data.result,
      message: response.data.message,
    };
  } catch (error) {
    return {
      error: true,
      message: error.response?.data?.message || "Failed to fetch rooms",
    };
  }
};

// Lấy danh sách ngày chiếu cho phim
export const fetchAvailableDates = async (movieId) => {
  try {
    const adminUser = JSON.parse(localStorage.getItem("adminUser") || "{}");
    const token = adminUser.token;

    if (!token) return { error: true, message: "No token found, please login again." };

    const response = await axios.get(`${API_BASE_URL}/showtime/view-date-create-showtime`, {
      params: { movieId },
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return {
      error: false,
      result: response.data.result,
      message: response.data.message,
    };
  } catch (error) {
    return {
      error: true,
      message: error.response?.data?.message || "Failed to fetch available dates",
    };
  }
};

// Tạo suất chiếu mới
export const createShowtime = async (showtimeData) => {
  try {
    const adminUser = JSON.parse(localStorage.getItem("adminUser") || "{}");
    const token = adminUser.token;

    if (!token) return { error: true, message: "No token found, please login again." };

    const response = await axios.post(`${API_BASE_URL}/showtime/create-showtime`, showtimeData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return {
      error: false,
      result: response.data.result,
      message: response.data.message,
    };
  } catch (error) {
    return {
      error: true,
      message: error.response?.data?.message || "Failed to create showtime",
    };
  }
};

// Lấy danh sách suất chiếu
export const getShowtimes = async () => {
  try {
    const adminUser = JSON.parse(localStorage.getItem("adminUser") || "{}");
    const token = adminUser.token;

    if (!token) return { error: true, message: "No token found, please login again." };

    const response = await axios.get(`${API_BASE_URL}/showtime/view-all-showtime`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return {
      error: false,
      result: response.data.result,
      message: response.data.message,
    };
  } catch (error) {
    return {
      error: true,
      message: error.response?.data?.message || "Failed to fetch showtimes",
    };
  }
};

// Xóa suất chiếu (1 hoặc nhiều)
export const deleteShowtime = async (showtimeIds) => {
  try {
    const adminUser = JSON.parse(localStorage.getItem("adminUser") || "{}");
    const token = adminUser.token;
    if (!token) return { error: true, message: "No token found, please login again." };
    const data = Array.isArray(showtimeIds) ? showtimeIds : [showtimeIds];
    const response = await axios.delete(
      `${API_BASE_URL}/showtime/delete-showtime`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        data, // axios.delete nhận body qua key 'data'
      }
    );
    return {
      error: false,
      status: response.status,
      result: response.data.result,
      message: response.data.message,
    };
  } catch (error) {
    return {
      error: true,
      status: error.response?.status,
      message: error.response?.data?.message || "Failed to delete showtime",
    };
  }
};

export const suggestValidateTime = async ({ date, cinemaRoomId, movieId }) => {
  const adminUser = JSON.parse(localStorage.getItem("adminUser") || "{}");
  const token = adminUser.token;
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/showtime/suggest-validate-time`,
      { date, cinemaRoomId, movieId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return {
      error: false,
      result: response.data.result,
      message: response.data.message,
    };
  } catch (error) {
    return {
      error: true,
      message: error.response?.data?.message || "Không thể gợi ý giờ chiếu",
    };
  }
};

// Bật/tắt kích hoạt (xóa mềm) showtime
export const onOffShowtime = async (showtimeIds) => {
  try {
    const adminUser = JSON.parse(localStorage.getItem("adminUser") || "{}");
    const token = adminUser.token;
    if (!token) return { error: true, message: "No token found, please login again." };
    const data = Array.isArray(showtimeIds) ? showtimeIds : [showtimeIds];
    const response = await axios.put(
      `${import.meta.env.VITE_API_URL}/showtime/on-off-showtime`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return {
      error: false,
      result: response.data.result,
      message: response.data.message,
    };
  } catch (error) {
    return {
      error: true,
      message: error.response?.data?.message || "Không thể bật/tắt kích hoạt suất chiếu",
    };
  }
};

// Chỉnh sửa suất chiếu
export const updateShowtime = async (showtimeData) => {
  try {
    const adminUser = JSON.parse(localStorage.getItem("adminUser") || "{}");
    const token = adminUser.token;
    if (!token) return { error: true, message: "No token found, please login again." };
    const response = await axios.put(
      `${import.meta.env.VITE_API_URL}/showtime/update-showtime`,
      showtimeData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return {
      error: false,
      result: response.data.result,
      message: response.data.message,
    };
  } catch (error) {
    return {
      error: true,
      message: error.response?.data?.message || "Không thể cập nhật suất chiếu",
    };
  }
};

