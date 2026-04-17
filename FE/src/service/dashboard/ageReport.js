import axios from "axios";

export async function getCustomerAgeReport() {
  // TODO: Sửa endpoint cho đúng backend
  const adminUser = JSON.parse(localStorage.getItem("adminUser") || "{}")
  const token = adminUser.token;
  try {
    const res = await axios.get(`${import.meta.env.VITE_API_URL}/report/age-distribution`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });
    return res.data; // { status, result: { "0-18": 100, ... } }
  } catch (error) {
    return { status: 500, result: {} };
  }
}

