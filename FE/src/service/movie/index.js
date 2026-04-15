import { instance } from "../instance";
import axios from "axios"; 

// Lấy danh sách phim (admin)
export const getAllMovies = async () => {
  try {
    const response = await instance.get("/movie/view-all-movies");
    return {
      error: false,
      result: response.data.result,
      message: response.data.message,
    };
  } catch (error) {
    return {
      error: true,
      message: error.response?.data?.message || "Failed to fetch movies",
    };
  }
};

// Thêm phim mới (admin)
export const addMovie = async (movieData) => {
  // Lấy token từ object adminUser trong localStorage
  const adminUser = JSON.parse(localStorage.getItem("adminUser") || "{}");
  const token = adminUser.token;
  try {
    const response = await instance.post(
      "/movie/create-movie",
      movieData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
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
      message: error.response?.data?.message || "Failed to add movie",
    };
  }
};


// Xoá phim (nếu backend có API này, ví dụ: /api/movie/delete/:id)
export const deleteMovie = async (movieID) => {
  // Lấy token admin nếu cần
  const adminUser = JSON.parse(localStorage.getItem("adminUser") || "{}");
  const token = adminUser.token;
  try {
    const response = await instance.delete(`/movie/delete-movie/${movieID}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return {
      error: false,
      message: response.data.message,
    };
  } catch (error) {
    return {
      error: true,
      message: error.response?.data?.message || "Xóa phim thất bại",
    };
  }
};

export const getMovieDetail = async (slug) => {
  try {
    const response = await instance.get(`/movie/${slug}`);
    return {
      error: false,
      result: response.result || response.data,
      message: response.message || response.data?.message,
    };
  } catch (error) {
    return {
      error: true,
      message: error.response?.data?.message || "Có lỗi xảy ra",
    };
  }
};

export const getMovieById = async (movieID) => {
  try {
    const response = await instance.get("/movie/view-all-movies");
    const allMovies = response.data.result || [];
    const movie = allMovies.find((item) => String(item.movieID) === String(movieID));
    if (movie) {
      return {
        error: false,
        result: movie,
        message: "Success",
      };
    } else {
      return {
        error: true,
        message: "Không tìm thấy phim",
      };
    }
  } catch (error) {
    return {
      error: true,
      message: error.response?.data?.message || "Có lỗi xảy ra",
    };
  }
};

/**
 * Cập nhật thông tin phim theo movieID.
 * @param {number|string} movieID - ID của phim cần cập nhật.
 * @param {object} movieData - Object chứa các thuộc tính cần cập nhật, ví dụ: { active: true }
 * @returns {Promise<{error: boolean, result?: any, message: string}>}
 * Sử dụng: updateMovie(6, { active: true })
 */
export const updateMovie = async (movieID, movieData) => {
  const adminUser = JSON.parse(localStorage.getItem("adminUser") || "{}");
  const token = adminUser.token;
  try {
    const response = await instance.put(
      `/movie/update-movie/${movieID}`,
      movieData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    // Đảm bảo trả về đúng cấu trúc response mới
    return {
      error: false,
      status: response.data.status,
      message: response.data.message,
      result: response.data.result, // chứa thông tin phim đã cập nhật
    };
  } catch (error) {
    return {
      error: true,
      status: error.response?.data?.status || 500,
      message: error.response?.data?.message || "Cập nhật phim thất bại",
      result: null,
    };
  }
};

/***************************************
 * API cập nhật trạng thái Kích hoạt phim
 * @param {string|string[]} movieIDs - 1 ID hoặc mảng ID
 * @returns {Promise<{error: boolean, message: string}>}
 * Sử dụng: onOffMovie(movieID) hoặc onOffMovie([id1, id2])
 ***************************************/
export const onOffMovie = async (movieIDs) => {
  const adminUser = JSON.parse(localStorage.getItem("adminUser") || "{}");
  const token = adminUser.token;
  try {
    // Luôn truyền mảng, kể cả chỉ 1 movieID
    const body = Array.isArray(movieIDs) ? movieIDs : [movieIDs];
    const response = await instance.put(
      `/movie/on-off-movie`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return {
      error: false,
      message: response.data.message || response.data.result,
    };
  } catch (error) {
    return {
      error: true,
      message: error.response?.data?.message || "Cập nhật trạng thái kích hoạt thất bại",
    };
  }
};

export const searchMovieTMDB = async (name) => {
  const adminUser = JSON.parse(localStorage.getItem("adminUser") || "{}");
  const token = adminUser.token;
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/movieTMDB/search?name=${encodeURIComponent(name)}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data; 
  } catch (error) {
    return {
      status: 500,
      message: error?.response?.data?.message || "Lỗi khi tìm kiếm phim TMDB",
      result: [],
    };
  }
};

export const getMovieTMDBDetail = async (movieId) => {
  const adminUser = JSON.parse(localStorage.getItem("adminUser") || "{}");
  const token = adminUser.token;
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/movieTMDB/search-detail/${movieId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data; 
  } catch (error) {
    return {
      status: 500,
      message: error?.response?.data?.message || "Lỗi khi lấy chi tiết phim TMDB",
      result: null,
    };
  }
}; 
