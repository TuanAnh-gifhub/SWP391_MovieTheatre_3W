import axios from "axios";

export const getAllEmployees = async () => {
  try {
    const adminUser = JSON.parse(localStorage.getItem("adminUser") || "{}");
    const token = adminUser.token;
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/admin/employees/get-all-employee`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return { result: response.data, error: false };
  } catch (error) {
    return {
      error: true,
      message: error?.response?.data?.message || "Lỗi khi lấy danh sách nhân viên",
    };
  }
};

// thêm nhân viên mới
export const addEmployee = async (employeeData) => {
  try {
    const adminUser = JSON.parse(localStorage.getItem("adminUser") || "{}");
    const token = adminUser.token;
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/admin/employees/add-employee`,
      employeeData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    // Trả về đúng response.data để bên ngoài dùng được success, message
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error?.response?.data?.message || "Lỗi khi thêm nhân viên",
    };
  }
};

// API xóa nhân viên
export const deleteEmployee = async (employeeID) => {
  try {
    const adminUser = JSON.parse(localStorage.getItem("adminUser") || "{}");
    const token = adminUser.token;
    const response = await axios.delete(
      `${import.meta.env.VITE_API_URL}/admin/employees/delete-employee-by-id/${employeeID}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error?.response?.data?.message || "Lỗi khi xóa nhân viên",
    };
  }
};

export const updateEmployee = async (employeeId, employeeData) => {
  try {
    const adminUser = JSON.parse(localStorage.getItem("adminUser") || "{}");
    const token = adminUser.token;
    const response = await axios.put(
      `${import.meta.env.VITE_API_URL}/admin/employees/update-employee-by-id/${employeeId}`,
      employeeData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error?.response?.data?.message || "Lỗi khi cập nhật nhân viên",
    };
  }
};

export const setActiveEmployee = async (employeeID, active) => {
  try {
    const adminUser = JSON.parse(localStorage.getItem("adminUser") || "{}");
    const token = adminUser.token;
    const response = await axios.put(
      `${import.meta.env.VITE_API_URL}/admin/employees/${employeeID}/set-active?active=${active}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return {
      success: response.data.success,
      message: response.data.message,
      data: response.data.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error?.response?.data?.message || "Không thể cập nhật trạng thái nhân viên",
    };
  }
};

