import axios from "axios";

export const getAllBookings = () => {
  const adminUser = JSON.parse(localStorage.getItem("adminUser") || "{}");
  const token = adminUser.token;
  return axios.get(`${import.meta.env.VITE_API_URL}/admin/get-all-booking`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};