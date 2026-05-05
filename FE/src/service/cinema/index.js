import { instance } from "../instance";

const getAdminToken = () => {
  const adminUser = JSON.parse(localStorage.getItem("adminUser") || "{}");
  return adminUser.token || localStorage.getItem("token") || "";
};

const authConfig = () => ({
  headers: {
    Authorization: `Bearer ${getAdminToken()}`,
  },
});

export const getAllCinemas = async () => {
  try {
    const response = await instance.get("/admin/cinemas", authConfig());
    return {
      success: response.data.success,
      data: response.data.data || [],
      message: response.data.message,
    };
  } catch (error) {
    return {
      success: false,
      data: [],
      message: error.response?.data?.message || "Khong the lay danh sach rap phim",
    };
  }
};

export const getAllCities = async () => {
  try {
    const response = await instance.get("/admin/cinemas/cities", authConfig());
    return {
      success: response.data.success,
      data: response.data.data || [],
      message: response.data.message,
    };
  } catch (error) {
    return {
      success: false,
      data: [],
      message: error.response?.data?.message || "Khong the lay danh sach thanh pho",
    };
  }
};

export const createCinema = async ({ name, address, cityId }) => {
  try {
    const response = await instance.post(
      "/admin/cinemas",
      { name, address, cityId },
      authConfig()
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
      message: error.response?.data?.message || "Khong the tao rap phim",
    };
  }
};

export const updateCinema = async (cinemaId, { name, address, cityId }) => {
  try {
    const response = await instance.put(
      `/admin/cinemas/${cinemaId}`,
      { name, address, cityId },
      authConfig()
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
      message: error.response?.data?.message || "Khong the cap nhat rap phim",
    };
  }
};

export const deleteCinema = async (cinemaId) => {
  try {
    const response = await instance.delete(`/admin/cinemas/${cinemaId}`, authConfig());

    return {
      success: response.data.success,
      data: response.data.data,
      message: response.data.message,
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      message: error.response?.data?.message || "Khong the xoa rap phim",
    };
  }
};


