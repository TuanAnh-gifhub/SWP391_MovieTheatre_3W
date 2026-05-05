import { instance } from "../instance";

const getAuthToken = () => {
  const adminUser = JSON.parse(localStorage.getItem("adminUser") || "{}");
  const customerToken = localStorage.getItem("token") || "";
  // For admin screens, prefer admin token to avoid sending a customer token by mistake.
  if (adminUser?.token && adminUser?.role !== "CUSTOMER") {
    return adminUser.token;
  }
  return customerToken;
};

// Lấy tất cả ghế trong hệ thống (yêu cầu quyền admin)
export const getAllSeats = async () => {
  const token = getAuthToken();
  try {
    const response = await instance.get("/seats/get-all-seats", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return {
      success: response.data.status === 200,
      data: response.data.result,
      message: response.data.message,
    };
  } catch (error) {
    return {
      success: false,
      data: [],
      message: error.response?.data?.message || "Không thể lấy danh sách ghế",
    };
  }
};

// Tạo ghế mới cho phòng chiếu
export const createSeats = async ({ cinemaRoomId, seats }) => {
  const token = getAuthToken();
  try {
    const response = await instance.post(
      "/seats/create-seats",
      { cinemaRoomId, seats },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return {
      success: response.data.status === 200,
      data: response.data.result,
      message: response.data.message,
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      message: error.response?.data?.message || "Không thể tạo ghế",
    };
  }
};

// Chỉnh sửa ghế
export const updateSeat = async ({ cinemaRoomId, seatId, seatName, seatTypeId, seatType, price }) => {
  const token = getAuthToken();
  try {
    const response = await instance.put(
      "/seats/update-seat",
      { cinemaRoomId, seatId, seatName, seatTypeId, seatType, price },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return {
      success: response.data.status === 200,
      data: response.data.result,
      message: response.data.message,
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      message: error.response?.data?.message || "Không thể cập nhật ghế",
    };
  }
};

// Chỉnh sửa loại ghế hàng loạt
export const updateSeatTypeBatch = async ({ cinemaRoomId, seatIds, seatTypeId, seatType, price }) => {
  const token = getAuthToken();
  try {
    const response = await instance.put(
      "/seats/update-seat-type-batch",
      { cinemaRoomId, seatIds, seatTypeId, seatType, price },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return {
      success: response.data.status === 200,
      data: response.data.result,
      message: response.data.message,
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      message: error.response?.data?.message || "Không thể cập nhật ghế",
    };
  }
};

// API bật/tắt trạng thái hoạt động của ghế
export const toggleSeatAvailability = async (seatIds) => {
  const token = getAuthToken();
  try {
    const response = await instance.put(
      "/seats/toggle-availability",
      seatIds,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return {
      success: response.data.status === 200,
      data: response.data.result,
      message: response.data.message,
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      message: error.response?.data?.message || "Không thể cập nhật trạng thái ghế",
    };
  }
};

// Lấy danh sách loại ghế
export const getAllSeatTypes = async () => {
  const token = getAuthToken();
  try {
    const response = await instance.get("/seat-types", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return {
      success: response.data.status === 200,
      data: response.data.result,
      message: response.data.message,
    };
  } catch (error) {
    return {
      success: false,
      data: [],
      message: error.response?.data?.message || "Không thể lấy danh sách loại ghế",
    };
  }
};

export const createSeatType = async (payload) => {
  const token = getAuthToken();
  try {
    const response = await instance.post("/seat-types", payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return {
      success: response.data.status === 200,
      data: response.data.result,
      message: response.data.message,
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      message: error.response?.data?.message || "Không thể tạo loại ghế",
    };
  }
};

export const updateSeatType = async (seatTypeId, payload) => {
  const token = getAuthToken();
  try {
    const response = await instance.put(`/seat-types/${seatTypeId}`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return {
      success: response.data.status === 200,
      data: response.data.result,
      message: response.data.message,
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      message: error.response?.data?.message || "Không thể cập nhật loại ghế",
    };
  }
};

export const deleteSeatType = async (seatTypeId) => {
  const token = getAuthToken();
  try {
    const response = await instance.delete(`/seat-types/${seatTypeId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return {
      success: response.data.status === 200,
      data: response.data.result,
      message: response.data.message,
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      message: error.response?.data?.message || "Không thể xóa loại ghế",
    };
  }
};

