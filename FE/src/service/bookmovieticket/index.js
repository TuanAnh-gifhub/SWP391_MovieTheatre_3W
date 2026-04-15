import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;
  
const API_BASE = `${import.meta.env.VITE_API_URL}/customer`;

const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Lấy tất cả suất chiếu theo movieId
export const getShowtimesByMovie = (movieId) =>
  axios.get(`${API_BASE}/view-all-showtime/${movieId}`, {
    headers: getAuthHeader(),
  });

// Xác nhận thông tin đặt vé (bước 2)
export const bookingConfirmation = (data) =>
  axios.post(`${API_BASE}/movies/booking-confirmation`, data, {
    headers: getAuthHeader(),
  });

// Đặt vé (bước 3)
export const confirmBooking = (data) =>
  axios.post(`${API_BASE}/confirm-bookings`, data, {
    headers: getAuthHeader(),
  });

