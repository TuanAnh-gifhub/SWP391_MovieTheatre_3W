import axios from "axios";
import { toast } from "react-toastify";

const API_BASE_URL = import.meta.env.VITE_API_URL;

// Lấy danh sách phim yêu thích của customer
export const getFavoriteMovies = async () => {
  try {
    const customerId = Number(localStorage.getItem("id"));
    const token = localStorage.getItem("token");
    if (!customerId || isNaN(customerId)) {
      return { error: true, message: "Bạn cần đăng nhập để sử dụng chức năng này!" };
    }
    if (!token) {
      return { error: true, message: "Vui lòng đăng nhập lại." };
    }

    const response = await axios.get(
      `${API_BASE_URL}/movie/view-favorite-movie/${customerId}`,
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
      message: error?.response?.data?.message || "Không thể lấy danh sách phim yêu thích",
    };
  }
};

// Thêm hoặc xóa phim khỏi danh sách yêu thích (toggle)
export const toggleFavoriteMovie = async ({ movieId, customerId }) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return { error: true, message: "Vui lòng đăng nhập lại." };

    const response = await axios.post(
      `${API_BASE_URL}/movie/favorite-movie`,
      { movieId, customerId },
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
      message: error?.response?.data?.message || "Không thể cập nhật danh sách yêu thích",
    };
  }
};