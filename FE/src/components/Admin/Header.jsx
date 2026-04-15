/* eslint-disable react/prop-types */

import React, { useState } from "react";
import { Layout, Button } from 'antd';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import ResetPassword from "../../page/Admin/LoginAdmin/ResetPassword";

const { Header } = Layout;
const AdminHeader = ({ collapsed, toggleCollapsed, adminUser, theme }) => {
  const isDark = theme === "dark";
  const [showReset, setShowReset] = useState(false);
  const [showMenuActions, setShowMenuActions] = useState(false);

  const handleMenuClick = () => {
    toggleCollapsed();
    setShowMenuActions((prev) => !prev);
  };

  return (
    <Header 
      style={{ 
        padding: '0 16px', 
        background: isDark ? "#181818" : "#ffffff",
        color: isDark ? "#fff" : "#000",
        display: 'flex', 
        alignItems: 'center',
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
        borderBottom: isDark ? "1px solid #23272f" : "1px solid #f0f0f0"
      }}
    >
      <Button
        type="text"
        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        onClick={handleMenuClick}
        style={{
          fontSize: '16px',
          width: 64,
          height: 64,
          color: isDark ? "#fff" : "#000",
        }}
      />
      <span style={{ marginLeft: '16px', color: isDark ? "#fff" : "#000" }}>
        Xin chào, <span style={{ fontWeight: 700 }}>{adminUser?.fullName || "System Admin"}</span>
        {showMenuActions && (
          <Button
            type="link"
            style={{ marginLeft: 16, padding: 0, color: "#1677ff" }}
            onClick={() => setShowReset(true)}
          >
            Đổi mật khẩu
          </Button>
        )}
      </span>
      <ResetPassword visible={showReset} onCancel={() => setShowReset(false)} />
    </Header>
  );
};

export default AdminHeader;