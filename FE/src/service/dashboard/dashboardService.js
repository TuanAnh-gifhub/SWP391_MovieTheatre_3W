
import axios from "axios";

const getAuthHeaders = () => {
  const adminUser = JSON.parse(localStorage.getItem("adminUser") || "{}");
  const token = adminUser.token;
  return {
    "Content-Type": "application/json",
    "Authorization": token ? `Bearer ${token}` : "",
  };
};

// ============= API 1: Lấy customer report (CÓ THỂ DÙNG) =============
export async function getCustomerReport({ start, end, sortBy = 'totalSpent', direction = 'desc' }) {
  try {
    const params = new URLSearchParams({ start, end, sortBy, direction });
    const res = await axios.get(
      `${import.meta.env.VITE_API_URL}/report/reports/customers?${params.toString()}`,
      { headers: getAuthHeaders() }
    );
    return res.data; // Array of customer objects
  } catch (error) {
    console.error("Error fetching customer report:", error);
    return [];
  }
}

// ============= Transform Functions =============

// Transform customer data để lấy khách mới vs quay lại
export const transformCustomerMix = (customerData) => {
  if (!customerData || customerData.length === 0) {
    return [
      { name: "Khách mới", value: 38 },
      { name: "Khách quay lại", value: 62 }
    ];
  }

  // Khách mới: totalOrders === 1
  const newCustomers = customerData.filter(c => c.totalOrders === 1).length;
  const returningCustomers = customerData.filter(c => c.totalOrders > 1).length;
  const total = customerData.length;

  return [
    { name: "Khách mới", value: total > 0 ? (newCustomers / total * 100) : 0 },
    { name: "Khách quay lại", value: total > 0 ? (returningCustomers / total * 100) : 0 }
  ];
};

// Tính average order value
export const getAverageOrderValue = (customerData) => {
  if (!customerData || customerData.length === 0) return 0;
  const total = customerData.reduce((sum, c) => sum + c.averageOrderValue, 0);
  return total / customerData.length;
};