import axios from 'axios';


const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getCommentsByMovie = async (movieId) => {
  try {
    const token = localStorage.getItem("token"); // hoặc nơi bạn lưu token đăng nhập
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/comments/getCommentsByMovie/${movieId}`,
      {
        headers: {
          Authorization: getAuthHeader(),
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching comments:', error);
    return [];
  }
};

// API lấy tất cả comment cho admin
export const getAllCommentsForAdmin = async (movieId) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/comments/admin/movie/${movieId}/all-comments`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching admin comments:', error);
    return [];
  }
};

// API ẩn/hiện comment
export const toggleHiddenComment = async (commentId) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.put(
      `${import.meta.env.VITE_API_URL}/comments/${commentId}/toggle-hidden`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error toggling comment hidden status:', error);
    if (error.response && error.response.data) {
      throw error; // Throw error để component có thể xử lý message từ API
    }
    throw new Error('Có lỗi xảy ra khi thay đổi trạng thái bình luận');
  }
};

// API tạo comment mới cho phim
export const createComment = async ({ movieId, customerId, content, rating }) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/comments/createComment/${movieId}?accountId=${customerId}`,
      { content, rating },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      return error.response.data;
    }
    console.error('Error creating comment:', error);
    return { status: 500, message: 'Có lỗi xảy ra, vui lòng thử lại sau.' };
  }
};

// API chỉnh sửa comment
export const editComment = async ({ commentId, customerId, content, rating }) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.put(
      `${import.meta.env.VITE_API_URL}/comments/editComment/${commentId}?accountId=${customerId}`,
      { content, rating },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      return error.response.data;
    }
    console.error('Error editing comment:', error);
    return { status: 500, message: 'Có lỗi xảy ra, vui lòng thử lại sau.' };
  }
};
