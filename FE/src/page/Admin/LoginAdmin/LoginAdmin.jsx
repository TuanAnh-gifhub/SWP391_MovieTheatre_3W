import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { loginAdmin } from "../../../service/login/index";
import { motion } from "framer-motion";
import { FaUser, FaLock, FaShieldAlt, FaEye, FaEyeSlash } from "react-icons/fa"; // Thêm FaEye, FaEyeSlash
import ForgotPassword from "./ForgotPassword";

const LoginAdmin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // Thêm state
  const [showForgot, setShowForgot] = useState(false);

  useEffect(() => {
    const adminUser = JSON.parse(localStorage.getItem("adminUser"));
    if (adminUser?.token && adminUser?.role !== "CUSTOMER") {
      navigate("/admin", { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await loginAdmin(formData.username, formData.password);
      // Chỉ cho phép role khác CUSTOMER đăng nhập
      if (response?.token && response?.role !== "CUSTOMER") {
        localStorage.setItem(
            "adminUser",
            JSON.stringify({
              username: formData.username,
              token: response.token,
              role: response.role,
              id: response.id,
              fullName: response.fullName,
            })
        );
        console.log("Login successful, redirecting to admin...");
        window.location.href = "/admin";
      } else if (response?.token && response.role === "CUSTOMER") {
        setError("You do not have permission to login!");
      } else {
        setError(response.message || "Tên đăng nhập hoặc mật khẩu không đúng");
      }
    } catch (err) {
      setError("Đăng nhập thất bại. Vui lòng thử lại!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Left Side - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-white items-center justify-center p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-md"
        >
          <div className="flex items-center mb-8">
            <FaShieldAlt className="text-5xl text-gray-800 mr-3" />
            <h1 className="text-3xl font-bold text-gray-800">
              SIX CINEMA Admin Portal
            </h1>
          </div>
          <h2 className="text-2xl font-light text-gray-600 mb-6">
            Hệ thống quản lý dành cho nhân viên SIX CINEMA
          </h2>
          <p className="text-gray-500 mb-8">
            Truy cập vào bảng điều khiển để quản lý phim, vé xem phim, người
            dùng và các hoạt động khác trong hệ thống SIX CINEMA.
          </p>

          <div className="bg-gray-100 p-6 rounded-lg">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                <FaUser className="text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-800">
                  Quản lý người dùng
                </h3>
                <p className="text-sm text-gray-500">
                  Quản lý tài khoản và phân quyền
                </p>
              </div>
            </div>

            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-green-600"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3z" />
                  <path d="M16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-gray-800">Quản lý đơn hàng</h3>
                <p className="text-sm text-gray-500">
                  Theo dõi và cập nhật trạng thái đơn hàng
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="max-w-md w-full bg-white rounded-xl shadow-lg p-8"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-light text-gray-800">
              Đăng nhập Hệ thống
            </h2>
            <p className="text-gray-500 mt-2">Vui lòng đăng nhập để tiếp tục</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên đăng nhập
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  required
                  className="pl-10 w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg shadow-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  placeholder="Nhập tên đăng nhập"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mật khẩu
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="pl-10 pr-10 w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg shadow-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder="Nhập mật khẩu"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 focus:outline-none"
                  tabIndex={-1}
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showPassword ? (
                    <FaEyeSlash className="h-5 w-5" />
                  ) : (
                    <FaEye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-700 p-4 rounded-lg text-sm">
                <div className="flex">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 100-2 1 1 0 000 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {error}
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                {isLoading ? (
                  <svg
                    className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                ) : (
                  "Đăng nhập"
                )}
              </button>
            </div>
          </form>

          <div className="text-center mt-2">
            <button
              type="button"
              className="text-blue-600 hover:underline text-sm"
              onClick={() => setShowForgot(true)}
            >
              Quên mật khẩu   ?
            </button>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} SIX CINEMA Administration Panel
            </p>
          </div>
        </motion.div>
      </div>
      {/* Thêm dòng này ngay bên ngoài motion.div */}
      <ForgotPassword visible={showForgot} onCancel={() => setShowForgot(false)} />
    </div>
  );
};

export default LoginAdmin;
