import axios from "axios";

export async function getGenreRevenueReport() {
  // TODO: Sửa endpoint cho đúng backend
  const adminUser = JSON.parse(localStorage.getItem("adminUser") || "{}")
  const token = adminUser.token;
  try {
    const res = await axios.get(`${import.meta.env.VITE_API_URL}/report/genre-revenue`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });
    return res.data; // { status, result: { "Hành động": 2_000_000, ... } }
  } catch (error) {
    return { status: 500, result: {} };
  }
}

