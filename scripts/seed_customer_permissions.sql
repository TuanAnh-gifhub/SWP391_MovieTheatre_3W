SET NOCOUNT ON;

-- Ensure permission codes required by customer booking/payment flow
IF NOT EXISTS (SELECT 1 FROM permissions WHERE code = 'CREATE_PAYMENT')
    INSERT INTO permissions(code, description, created_at, updated_at) VALUES ('CREATE_PAYMENT', N'Tạo thanh toán', SYSDATETIME(), SYSDATETIME());
IF NOT EXISTS (SELECT 1 FROM permissions WHERE code = 'VIEW_PAYMENT')
    INSERT INTO permissions(code, description, created_at, updated_at) VALUES ('VIEW_PAYMENT', N'Xem thanh toán', SYSDATETIME(), SYSDATETIME());
IF NOT EXISTS (SELECT 1 FROM permissions WHERE code = 'GET_SCORE_MEMBER')
    INSERT INTO permissions(code, description, created_at, updated_at) VALUES ('GET_SCORE_MEMBER', N'Tính điểm thành viên', SYSDATETIME(), SYSDATETIME());
IF NOT EXISTS (SELECT 1 FROM permissions WHERE code = 'VIEW_SCORES_MEMBER')
    INSERT INTO permissions(code, description, created_at, updated_at) VALUES ('VIEW_SCORES_MEMBER', N'Xem lịch sử điểm thành viên', SYSDATETIME(), SYSDATETIME());
IF NOT EXISTS (SELECT 1 FROM permissions WHERE code = 'EDIT_PROFILE_MEMBER')
    INSERT INTO permissions(code, description, created_at, updated_at) VALUES ('EDIT_PROFILE_MEMBER', N'Sửa hồ sơ thành viên', SYSDATETIME(), SYSDATETIME());

DECLARE @CustomerRoleId INT = (SELECT roleid FROM roles WHERE role_name = 'CUSTOMER');

;WITH Needed(code) AS (
    SELECT 'VIEW_TICKET' UNION ALL
    SELECT 'CREATE_TICKET' UNION ALL
    SELECT 'EDIT_TICKET' UNION ALL
    SELECT 'CREATE_PAYMENT' UNION ALL
    SELECT 'VIEW_PAYMENT' UNION ALL
    SELECT 'GET_SCORE_MEMBER' UNION ALL
    SELECT 'VIEW_SCORES_MEMBER' UNION ALL
    SELECT 'EDIT_PROFILE_MEMBER'
)
INSERT INTO role_permissions(role_id, permission_id)
SELECT @CustomerRoleId, p.id
FROM Needed n
JOIN permissions p ON p.code = n.code
WHERE @CustomerRoleId IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM role_permissions rp
      WHERE rp.role_id = @CustomerRoleId AND rp.permission_id = p.id
  );

SELECT r.role_name, COUNT(rp.permission_id) AS permission_count
FROM roles r
LEFT JOIN role_permissions rp ON rp.role_id = r.roleid
GROUP BY r.role_name
ORDER BY r.role_name;

SELECT p.code
FROM role_permissions rp
JOIN permissions p ON p.id = rp.permission_id
JOIN roles r ON r.roleid = rp.role_id
WHERE r.role_name = 'CUSTOMER'
ORDER BY p.code;
