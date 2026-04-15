import { instance } from "../instance";

// Helper: Lấy token admin
const getAdminToken = () => {
  const adminUser = JSON.parse(localStorage.getItem("adminUser") || "{}");
  return adminUser.token;
};

/**
 * Lấy danh sách tất cả permissions
 * @returns {Promise<{error: boolean, result?: any, message: string}>}
 */
export const getAllPermissions = async () => {
  const token = getAdminToken();
  if (!token) {
    return { error: true, message: "Không tìm thấy token xác thực" };
  }
  try {
    const response = await instance.get("/permissions", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return {
      error: false,
      result: response.data.result || response.data,
      message: response.data.message,
    };
  } catch (error) {
    return {
      error: true,
      message: error.response?.data?.message || "Failed to fetch permissions",
    };
  }
};

/**
 * Lấy chi tiết permission theo ID
 * @param {string|number} permissionId
 * @returns {Promise<{error: boolean, result?: any, message: string}>}
 */
export const getPermissionById = async (permissionId) => {
  const token = getAdminToken();
  if (!token) {
    return { error: true, message: "Không tìm thấy token xác thực" };
  }
  try {
    const response = await instance.get("/permissions", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const allPermissions = response.data.result || response.data || [];
    const permission = allPermissions.find((item) => String(item.id) === String(permissionId));
    if (permission) {
      return { error: false, result: permission, message: response.data.message };
    }
    return { error: true, message: "Không tìm thấy permission" };
  } catch (error) {
    return {
      error: true,
      message: error.response?.data?.message || "Không tìm thấy permission",
    };
  }
};

/**
 * Lấy tất cả roles cùng quyền hạn
 * @returns {Promise<{error: boolean, result?: any, message: string}>}
 */
export const getAllRoles = async () => {
  const token = getAdminToken();
  if (!token) {
    return { error: true, message: "Không tìm thấy token xác thực" };
  }
  try {
    const response = await instance.get("/admin/roles", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return {
      error: false,
      result: response.data.data,
      message: response.data.message,
    };
  } catch (error) {
    return {
      error: true,
      message: error.response?.data?.message || "Không thể lấy danh sách roles",
    };
  }
};

/**
 * Thêm permission cho role
 * @param {number|string} roleId
 * @param {number[]} permissionIds
 * @returns {Promise<{error: boolean, message: string}>}
 */
export const addPermissionsToRole = async (roleId, permissionIds) => {
  const token = getAdminToken();
  if (!token) {
    return { error: true, message: "Không tìm thấy token xác thực" };
  }
  try {
    const response = await instance.post(
      "/admin/roles/add-permissions",
      { roleId, permissionIds },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return {
      error: false,
      message: response.data.message,
    };
  } catch (error) {
    return {
      error: true,
      message: error.response?.data?.message || "Thêm permission thất bại",
    };
  }
};

/**
 * Xóa permission khỏi role
 * @param {number|string} roleId
 * @param {number[]} permissionIds
 * @returns {Promise<{error: boolean, message: string}>}
 */
export const removePermissionsFromRole = async (roleId, permissionIds) => {
  const token = getAdminToken();
  if (!token) {
    return { error: true, message: "Không tìm thấy token xác thực" };
  }
  try {
    const response = await instance.post(
      "/admin/roles/remove-permissions",
      { roleId, permissionIds },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return {
      error: false,
      message: response.data.message,
    };
  } catch (error) {
    return {
      error: true,
      message: error.response?.data?.message || "Xóa permission thất bại",
    };
  }
};

/**
 * Tạo role mới
 * @param {Object} roleData - Dữ liệu role {roleName, roleCode, description}
 * @returns {Promise<{error: boolean, result?: any, message: string}>}
 */
export const createRole = async (roleData) => {
  const token = getAdminToken();
  if (!token) {
    return { error: true, message: "Không tìm thấy token xác thực" };
  }
  try {
    const response = await instance.post(
      "/admin/roles/add",
      roleData,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return {
      error: false,
      result: response.data.data,
      message: response.data.message,
    };
  } catch (error) {
    return {
      error: true,
      message: error.response?.data?.message || "Tạo role thất bại",
    };
  }
};

/**
 * Xóa role theo roleId
 * @param {number|string} roleId - ID của role cần xóa
 * @returns {Promise<{error: boolean, message: string}>}
 */
export const deleteRole = async (roleId) => {
  const token = getAdminToken();
  if (!token) {
    return { error: true, message: "Không tìm thấy token xác thực" };
  }
  try {
    const response = await instance.delete(
      `/admin/roles/delete/${roleId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return {
      error: false,
      message: response.data.message,
    };
  } catch (error) {
    return {
      error: true,
      message: error.response?.data?.message || "Xóa role thất bại",
    };
  }
};

/**
 * Cập nhật role theo roleId
 * @param {number|string} roleId - ID của role cần cập nhật
 * @param {Object} roleData - Dữ liệu role cần cập nhật {roleName, roleCode, description}
 * @returns {Promise<{error: boolean, result?: any, message: string}>}
 */
export const updateRole = async (roleId, roleData) => {
  const token = getAdminToken();
  if (!token) {
    return { error: true, message: "Không tìm thấy token xác thực" };
  }
  try {
    const response = await instance.put(
      `/admin/roles/update/${roleId}`,
      roleData,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return {
      error: false,
      result: response.data.data,
      message: response.data.message,
    };
  } catch (error) {
    return {
      error: true,
      message: error.response?.data?.message || "Cập nhật role thất bại",
    };
  }
};

/**
 * Gán role cho tài khoản nhân viên
 * @param {number} accountId - ID của tài khoản nhân viên
 * @param {number} roleId - ID của role cần gán
 * @returns {Promise<{error: boolean, result?: any, message: string}>}
 */
export const assignRoleToAccount = async (accountId, roleId) => {
  const token = getAdminToken();
  if (!token) {
    return { error: true, message: "Không tìm thấy token xác thực" };
  }
  try {
    const response = await instance.put(
      "/admin/accounts/assign-role-with-details",
      {
        accountId: accountId,
        roleId: roleId,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return {
      error: false,
      result: response.data.data,
      message: response.data.message,
    };
  } catch (error) {
    return {
      error: true,
      message: error.response?.data?.message || "Gán role thất bại",
    };
  }
};

/**
 * Lấy accountId từ employeeID
 * @param {number|string} employeeID - ID của nhân viên
 * @returns {Promise<{error: boolean, result?: any, message: string}>}
 */
export const getAccountIdFromEmployee = async (employeeID) => {
  const token = getAdminToken();
  if (!token) {
    return { error: true, message: "Không tìm thấy token xác thực" };
  }
  try {
    const response = await instance.get(
      `/admin/employees/${employeeID}/account`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return {
      error: false,
      result: response.data.data,
      message: response.data.message,
    };
  } catch (error) {
    return {
      error: true,
      message: error.response?.data?.message || "Không thể lấy thông tin tài khoản",
    };
  }
};
