import axios from "axios";

export async function getSummaryByDate() {
  // Lấy token admin từ localStorage (giống cinemaroom)
  const adminUser = JSON.parse(localStorage.getItem("adminUser") || "{}");
  const token = adminUser.token;
  try {
    const res = await axios.get(`${import.meta.env.VITE_API_URL}/export-movie-date/summary-by-date`, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });
    return res.data; // {status, message, result}
  } catch (error) {
    return { status: 500, message: error.message, result: [] };
  }
}

export async function getSalesSummary({ from, to }) {
  try {
    const params = new URLSearchParams({ from, to });
    const res = await axios.get(`${import.meta.env.VITE_API_URL}/sales/summary?${params.toString()}`, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return res.data; // Array of summary objects
  } catch (error) {
    return [];
  }
}

export async function downloadSalesSummaryPdf({ from, to }) {
  try {
    const params = new URLSearchParams({ from, to });
    const res = await axios.get(`${import.meta.env.VITE_API_URL}/sales/summary/pdf?${params.toString()}`, {
      responseType: 'blob',
    });
    return res.data;
  } catch (error) {
    return null;
  }
}

export async function downloadSalesSummaryCsv({ from, to }) {
  try {
    const params = new URLSearchParams({ from, to });
    const res = await axios.get(`${import.meta.env.VITE_API_URL}/sales/summary/csv?${params.toString()}`, {
      responseType: 'blob',
    });
    return res.data;
  } catch (error) {
    return null;
  }
}

export async function downloadDashboardRevenuePdf() {
  try {
    const adminUser = JSON.parse(localStorage.getItem("adminUser") || "{}");
    const token = adminUser.token;
    const res = await axios.get(`${import.meta.env.VITE_API_URL}/report/revenue-pdf`, {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      responseType: 'blob',
    });
    return res.data;
  } catch (error) {
    return null;
  }
}

export async function getCustomerUsageReport({ start, end, sortBy = 'totalSpent', direction = 'desc' }) {
  try {
    const adminUser = JSON.parse(localStorage.getItem("adminUser") || "{}");
    const token = adminUser.token;
    
    if (!token) {
      return { success: false, message: 'No admin token found', data: [] };
    }
    
    const params = new URLSearchParams({
      start,
      end,
      sortBy,
      direction
    });
    
    const url = `${import.meta.env.VITE_API_URL}/report/reports/customers?${params.toString()}`;
    
    const res = await axios.get(url, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
        "accept": "*/*",
      },
    });
    
    return { success: true, data: res.data }; // Trả về array của customer objects
  } catch (error) {
    if (error.response) {
      // Server trả về response với status code lỗi
      return { 
        success: false, 
        message: error.response.data?.message || `HTTP ${error.response.status}: ${error.response.statusText}`, 
        data: [] 
      };
    } else if (error.request) {
      // Request được gửi nhưng không nhận được response
      return { 
        success: false, 
        message: 'Không thể kết nối đến server', 
        data: [] 
      };
    } else {
      // Lỗi khác
      return { 
        success: false, 
        message: error.message || 'Lỗi không xác định', 
        data: [] 
      };
    }
  }
}

export async function downloadCustomerReportPdf({ start, end, sortBy = 'totalSpent', direction = 'desc' }) {
  try {
    const adminUser = JSON.parse(localStorage.getItem("adminUser") || "{}");
    const token = adminUser.token;
    
    if (!token) {
      return null;
    }
    
    const params = new URLSearchParams({
      start,
      end,
      sortBy,
      direction
    });
    
    const url = `${import.meta.env.VITE_API_URL}/report/reports/customers/export/pdf?${params.toString()}`;
    
    const res = await axios.get(url, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "accept": "*/*",
      },
      responseType: 'blob',
    });
    
    return res.data;
  } catch (error) {
    return null;
  }
}