/* eslint-disable react/prop-types */

import { Layout, Menu } from "antd";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  DashboardOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  GiftOutlined,
  LogoutOutlined,
  PlayCircleOutlined, 
  ApartmentOutlined,
  CoffeeOutlined,
  TagsOutlined,
} from "@ant-design/icons";

const { Sider } = Layout;

const Sidebar = ({ collapsed, theme }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Lấy thông tin admin từ localStorage
  const adminUser = JSON.parse(localStorage.getItem("adminUser"));
  const userRole = adminUser?.role || "CUSTOMER";

  const handleLogout = () => {
    localStorage.removeItem("adminUser");
    navigate("/admin/login");
  };

  // Menu items cho admin (có tất cả quyền)
  const adminMenuItems = [
    {
      key: "/admin",
      icon: <DashboardOutlined />,
      label: <Link to="/admin">Thống kê</Link>,
    },
    {
      key: "/admin/user",
      icon: <UserOutlined />,
      label: <Link to="/admin/user">Quản lý tài khoản</Link>,
    },
    {
      key: "/admin/ticket",
      icon: <ShoppingCartOutlined />,
      label: <Link to="/admin/ticket">Quản lý vé</Link>,
    },
    {
      key: "/admin/movie",
      icon: <PlayCircleOutlined />,
      label: <Link to="/admin/movie">Quản lý Phim</Link>,
    },
    {
      key: "/admin/theater",
      icon: <ApartmentOutlined />,
      label: <Link to="/admin/theater">Quản lý rạp phim</Link>,
    },
    {
      key: "/admin/seat-types",
      icon: <TagsOutlined />,
      label: <Link to="/admin/seat-types">Loại ghế</Link>,
    },
    {
      key: "/admin/vouchers",
      icon: <GiftOutlined />,
      label: <Link to="/admin/vouchers">Quản lý khuyến mãi</Link>,
    },

    {
      key: "/admin/food-and-drink",
      icon: <CoffeeOutlined />,
      label: <Link to="/admin/food-and-drink">Đồ ăn & Nước uống</Link>,
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Đăng xuất",
      className: "mt-auto",
      danger: true,
      onClick: handleLogout,
    },
  ];

  // Menu items cho các role khác (không phải admin)
  const otherRoleMenuItems = [
    {
      key: "/admin",
      icon: <DashboardOutlined />,
      label: <Link to="/admin">Thống kê</Link>,
    },
    {
      key: "/admin/ticket",
      icon: <ShoppingCartOutlined />,
      label: <Link to="/admin/ticket">Quản lý vé</Link>,
    },
    {
      key: "/admin/movie",
      icon: <PlayCircleOutlined />,
      label: <Link to="/admin/movie">Quản lý Phim</Link>,
    },
    {
      key: "/admin/theater",
      icon: <ApartmentOutlined />,
      label: <Link to="/admin/theater">Quản lý rạp phim</Link>,
    },
    {
      key: "/admin/seat-types",
      icon: <TagsOutlined />,
      label: <Link to="/admin/seat-types">Loại ghế</Link>,
    },
    {
      key: "/admin/vouchers",
      icon: <GiftOutlined />,
      label: <Link to="/admin/vouchers">Quản lý khuyến mãi</Link>,
    },
    // Loyalty link removed (feature disabled)
    {
      key: "/admin/food-and-drink",
      icon: <CoffeeOutlined />,
      label: <Link to="/admin/food-and-drink">Đồ ăn & Nước uống</Link>,
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Đăng xuất",
      className: "mt-auto",
      danger: true,
      onClick: handleLogout,
    },
  ];

  // Chọn menu items dựa trên role
  const menuItems = userRole === "ADMIN" ? adminMenuItems : otherRoleMenuItems;

  const isDark = theme === "dark";
  const sidebarBg = isDark ? "#23272f" : "#ffffff";
  const sidebarColor = isDark ? "#e0e0e0" : "#222";
  const sidebarLogoBg = isDark ? "#181c23" : "#f5f5f5";
  const sidebarLogoText = isDark ? "#fff" : "#222";
  const sidebarLogoSub = isDark ? "#a0aec0" : "#888";

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      width={250}
      style={{
        background: sidebarBg,
        color: sidebarColor,
        height: "100vh",
        position: "fixed",
        left: 0,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
      }}
    >
      <div className="p-4 flex items-center justify-center">
        <div
          className={`transition-all duration-300 ease-in-out ${
            collapsed ? "w-12 h-12" : "w-full"
          }`}
        >
          {collapsed ? (
            <div className="w-12 h-12 rounded-lg flex items-center justify-center"
              style={{ background: sidebarLogoBg }}>
              <span className="text-2xl font-bold" style={{ color: sidebarLogoText }}>S</span>
            </div>
          ) : (
            <div className="flex items-center">
              <div className="text-2xl font-bold flex items-center" style={{ color: sidebarLogoText }}>
                <div className="flex items-end">
                  <span> SIX Cinema</span>
                  <span className="text-sm ml-2 mb-1" style={{ color: sidebarLogoSub }}>
                    {userRole === "ADMIN" ? "ADMIN" : userRole}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Menu
        theme={isDark ? "dark" : "light"}
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
        style={{
          borderRight: 0,
          background: sidebarBg,
          color: sidebarColor,
          fontWeight: 500,
          fontSize: 16,
        }}
      />
    </Sider>
  );
};

export default Sidebar;
