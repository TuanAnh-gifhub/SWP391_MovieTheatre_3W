import axios from "axios";


// Lấy danh sách lịch chiếu
export const getAllCalendars = () => {
  // Lấy token từ object adminUser trong localStorage
  const adminUser = JSON.parse(localStorage.getItem("adminUser") || "{}");
  const token = adminUser.token;

  return axios.get(`${import.meta.env.VITE_API_URL}/movie/view-all-dates-for-movie`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// Tạo lịch chiếu mới
export const createCalendar = (fromDate, toDate) => {
  const adminUser = JSON.parse(localStorage.getItem("adminUser") || "{}");
  const token = adminUser.token;

  return axios.post(
    `${import.meta.env.VITE_API_URL}/movie/create-date-show`,
    { fromDate, toDate },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

// Xóa lịch chiếu
export const deleteCalendar = (calendarId) => {
  const adminUser = JSON.parse(localStorage.getItem("adminUser") || "{}");
  const token = adminUser.token;

  return axios.delete(
    `${import.meta.env.VITE_API_URL}/movie/delete-date/${calendarId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

// Cập nhật lịch chiếu
export const updateCalendar = (calendarId, fromDate, toDate) => {
  const adminUser = JSON.parse(localStorage.getItem("adminUser") || "{}");
  const token = adminUser.token;

  return axios.put(
    `${import.meta.env.VITE_API_URL}/movie/update-date-show/${calendarId}`,
    { fromDate, toDate },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

// Gán phim vào lịch chiếu
export const setMovieToCalendar = (calendarId, movieIDs) => {
  const adminUser = JSON.parse(localStorage.getItem("adminUser") || "{}");
  const token = adminUser.token;

  return axios.put(
    `${import.meta.env.VITE_API_URL}/movie/set-date-movie/${calendarId}`,
    movieIDs,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );
};

// Lấy danh sách tất cả phim để chọnchọn
export const getAllMovies = () => {
  return axios.get(`${import.meta.env.VITE_API_URL}/movie/view-all-movies`);
};

