import { instance } from "../instance";

const getAdminToken = () => {
  const adminUser = JSON.parse(localStorage.getItem("adminUser") || "{}");
  return adminUser.token || localStorage.getItem("token") || "";
};


 // Lấy tất cả phòng chiếu trong hệ thống
export const getAllCinemaRooms = async () => {
  const token = getAdminToken();
  try {
    const response = await instance.get("/admin/cinema-rooms", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return {
      success: response.data.success,
      data: response.data.data,
      message: response.data.message,
    };
  } catch (error) {
    return {
      success: false,
      data: [],
      message: error.response?.data?.message || "Không thể lấy danh sách phòng chiếu",
    };
  }
};

// Bật/tắt trạng thái phòng chiếu
export const setActiveCinemaRoom = async (cinemaRoomId, active) => {
  const token = getAdminToken();
  try {
    const response = await instance.put(
      `/admin/cinema-rooms/${cinemaRoomId}/set-active?active=${active}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return {
      success: response.data.success,
      message: response.data.message,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Không thể cập nhật trạng thái phòng chiếu",
    };
  }
};

// Tạo phòng chiếu mới
export const createCinemaRoom = async ({ roomName, seatQuantity, cinemaId }) => {
  const token = getAdminToken();
  try {
    const response = await instance.post(
      "/admin/cinema-rooms",
      { roomName, seatQuantity, cinemaId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return {
      success: response.data.success,
      data: response.data.data,
      message: response.data.message,
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      message: error.response?.data?.message || "Không thể tạo phòng chiếu",
    };
  }
};

// Xóa phòng chiếu
export const deleteCinemaRoom = async (cinemaRoomId) => {
  const token = getAdminToken();
  try {
    const response = await instance.delete(
      `/admin/cinema-rooms/${cinemaRoomId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return {
      success: response.data.success,
      message: response.data.message,
      data: response.data.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Không thể xóa phòng chiếu",
      data: null,
    };
  }
};

// Chỉnh sửa phòng chiếu
export const updateCinemaRoom = async (cinemaRoomId, { roomName, seatQuantity, cinemaId }) => {
  const token = getAdminToken();
  try {
    const response = await instance.put(
      `/admin/cinema-rooms/${cinemaRoomId}`,
      { roomName, seatQuantity, cinemaId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return {
      success: response.data.success,
      data: response.data.data,
      message: response.data.message,
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      message: error.response?.data?.message || "Không thể cập nhật phòng chiếu",
    };
  }
};