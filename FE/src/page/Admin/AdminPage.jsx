import React, { useState, useEffect } from "react";
import { Layout, Button } from "antd";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "../../components/Admin/Sidebar";
import AdminHeader from "../../components/Admin/Header";
import { logout } from "../../service/logout";
import { BulbOutlined, BulbFilled } from "@ant-design/icons";

const { Content } = Layout;

const AdminPage = () => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem("adminTheme") || "light");
  const adminUser = JSON.parse(localStorage.getItem("adminUser"));

  useEffect(() => {
    localStorage.setItem("adminTheme", theme);
    document.body.setAttribute("data-theme", theme);
  }, [theme]);

  const handleThemeToggle = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const handleLogout = async () => {
    try {
      const token = adminUser?.token;
      if (token) {
        const response = await logout(token);
        if (!response.error) {
          localStorage.clear();
          navigate("/admin/login");
        } else {
          console.error("Lỗi đăng xuất:", response.message);
        }
      } else {
        localStorage.clear();
        navigate("/admin/login");
      }
    } catch (error) {
      console.error("Lỗi khi đăng xuất:", error);
      localStorage.clear();
      navigate("/admin/login");
    }
  };

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  // Style cho dark/light mode
  const isDark = theme === "dark";
  const layoutStyle = {
    marginLeft: collapsed ? 80 : 250,
    transition: "all 0.2s",
    background: isDark ? "#181818" : "#f5f5f5",
    height: "100vh",
    display: "flex",
    flexDirection: "column",
  };
  const contentStyle = {
    margin: "24px 16px",
    padding: 16,
    flex: 1,
    background: isDark ? "#181818" : "#f5f5f5",
    borderRadius: 8,
    color: isDark ? "#fff" : "#000",
    overflowY: "auto",
    height: "calc(100vh - 88px)",
    transition: "all 0.2s",
  };

  return (
    <Layout className={`h-screen overflow-hidden ${isDark ? "dark-mode" : ""}`}>
      <Sidebar
        handleLogout={handleLogout}
        collapsed={collapsed}
        toggleCollapsed={toggleCollapsed}
        theme={theme} 
      />
      <Layout style={layoutStyle}>
        <AdminHeader
          collapsed={collapsed}
          toggleCollapsed={toggleCollapsed}
          adminUser={adminUser}
          theme={theme} // truyền theme
          style={{
            position: "sticky",
            top: 0,
            zIndex: 1,
            width: "100%"
          }}
        />
        <div style={{ position: "absolute", top: 20, right: 40, zIndex: 10 }}>
          <Button
            shape="circle"
            size="large"
            onClick={handleThemeToggle}
            icon={isDark ? <BulbFilled /> : <BulbOutlined />}
            title={isDark ? "Chuyển sang Light Mode" : "Chuyển sang Dark Mode"}
          />
        </div>
        <Content style={contentStyle}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminPage;
