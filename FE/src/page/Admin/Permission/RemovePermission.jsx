import { removePermissionsFromRole } from '../../../service/permission/index';

/**
 * Gọi API xóa permission khỏi role
 * @param {number|string} roleId
 * @param {number[]} permissionIds
 * @returns {Promise<{error: boolean, message: string}>}
 */
export const handleRemovePermissionsFromRole = async (roleId, permissionIds) => {
  return await removePermissionsFromRole(roleId, permissionIds);
};
