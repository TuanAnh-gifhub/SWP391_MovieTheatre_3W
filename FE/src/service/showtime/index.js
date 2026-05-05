import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL;

// Lấy tất cả cụm rạp/phòng chiếu
export const fetchAllRooms = async () => {
  try {
    const adminUser = JSON.parse(localStorage.getItem("adminUser") || "{}");
    const token = adminUser.token;

    if (!token) return { error: true, message: "No token found, please login again." };

    console.log("API_BASE_URL:", API_BASE_URL);
    console.log("Fetching from:", `${API_BASE_URL}/showtime/view-all-room`);
    
    const response = await axios.get(`${API_BASE_URL}/showtime/view-all-room`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    
    console.log("Raw response:", response);
    
    return {
      error: false,
      result: response.data.result,
      message: response.data.message,
    };
  } catch (error) {
    console.error("Detailed error info:", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      headers: error.response?.headers,
    });
    
    return {
      error: true,
      message: error.response?.data?.message || error.response?.statusText || error.message || "Failed to fetch rooms",
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

