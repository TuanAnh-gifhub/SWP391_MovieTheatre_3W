/* eslint-disable react/prop-types */
import { useState, useEffect, useRef, useContext } from "react";
import RegisterForm from "./RegisterForm";
import ForgotPasswordForm from "./ForgotPasswordForm";
import { login } from "../../../service/login/index"; // Import API login
import { toast } from "react-toastify";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Thêm dòng này vào đầu file
import { LoginVersionContext } from "../../../layout/RootLayout";
import { useAuth } from "../../../context/ScrollspyContext";

const LoginModal = ({ isOpen, onClose, onLoginSuccess }) => {
  const [activeForm, setActiveForm] = useState("login");
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [errors, setErrors] = useState({
    username: "",
    password: "",
    general: "",
  });
  const [showPassword, setShowPassword] = useState(false); 
  const passwordRef = useRef(null);
  const { setLoginVersion } = useContext(LoginVersionContext);
  const { login: authLogin } = useAuth();

  useEffect(() => {
    if (!isOpen) {
      setActiveForm("login");
      setErrors({ username: "", password: "", general: "" });
      setFormData({ username: "", password: "" });
    }
  }, [isOpen]);

  const handleFormChange = (form) => {
    setErrors({ username: "", password: "", general: "" });
    setActiveForm(form);
  };

  const handleClose = () => {
    onClose();
    setActiveForm("login");
    setErrors({ username: "", password: "", general: "" });
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = { username: "", password: "", general: "" };

    // Validate username
    if (!formData.username.trim()) {
      newErrors.username = "Tên đăng nhập là bắt buộc";
      isValid = false;
    } else if (formData.username.length < 3) {
      newErrors.username = "Tên đăng nhập phải có ít nhất 3 ký tự";
      isValid = false;
    }

    // Validate password - chỉ kiểm tra khi password chưa đủ 6 ký tự
    if (!formData.password) {
      newErrors.password = "Mật khẩu là bắt buộc";
      isValid = false;
    } else if (formData.password.length > 0 && formData.password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrors({ username: "", password: "", general: "" });

    if (!validateForm()) {
      return;
    }

    try {
      const response = await login(formData.username, formData.password);

      if (response?.error || !response?.token) {
        // Hiển thị toast lỗi từ API nếu có
        if (response?.message) {
          toast.error(response.message, {
            icon: "❗",
            position: "top-right",
            autoClose: 3000,
          });
        }
        return;
      }

      // Thành công
      localStorage.setItem("token", response.token);
      localStorage.setItem("username", formData.username);
      if (response.id) {
        const userData = {
          customerID: response.id || response.customerID,
          username: formData.username,
          fullName: response.fullName,
        };
        localStorage.setItem("user", JSON.stringify(userData));
        
        // Cập nhật trạng thái đăng nhập qua AuthContext
        authLogin(userData);
      }
      if (response.sex) {
        localStorage.setItem("gender", response.sex);
      }
      // Lưu trạng thái isGamePlayed
      if (typeof response.isGamePlayed !== "undefined") {
        localStorage.setItem("isGamePlayed", response.isGamePlayed ? "true" : "false");
      }
      
      // Đóng modal
      onClose();
      
      // Trigger login version update để cập nhật trạng thái đăng nhập
      setLoginVersion(v => v + 1);
      
      // Gọi callback nếu có
      if (onLoginSuccess) {
        onLoginSuccess(formData.username);
      }
      
      // Hiển thị toast thành công
      const message = response?.message;
      if (message && !message.toLowerCase().includes('error') && !message.toLowerCase().includes('invalid')) {
        // Nếu API trả về message thành công, sử dụng message đó
        toast.success(message, {
          icon: "✅",
          position: "top-right",
          autoClose: 3000,
        });
      } else if (!message) {
        // Nếu API không trả về message, hiển thị message mặc định
        toast.success("Đăng nhập thành công!", {
          icon: "✅",
          position: "top-right",
          autoClose: 3000,
        });
      }
      
    } catch (err) {
      toast.error("Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin!", {
        icon: "❗",
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  if (!isOpen) return null;

  const renderForm = () => {
    if (activeForm === "register")
      return <RegisterForm onBackToLogin={() => handleFormChange("login")} />;
    if (activeForm === "forgotPassword")
      return (
        <ForgotPasswordForm onBackToLogin={() => handleFormChange("login")} />
      );

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900">
          Đăng nhập tài khoản
        </h2>
        <form className="space-y-6" onSubmit={handleLogin}>
          <div>
            <input
              type="text"
              placeholder="Tên đăng nhập"
              className={`w-full p-3 border-b ${
                errors.username ? "border-red-500" : "border-gray-300"
              } bg-transparent focus:outline-none`}
              value={formData.username}
              autoFocus
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  passwordRef.current?.focus();
                }
              }}
            />
            {errors.username && (
              <p className="text-red-500 text-xs mt-1">{errors.username}</p>
            )}
          </div>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Mật khẩu"
              className={`w-full p-3 border-b ${
                errors.password ? "border-red-500" : "border-gray-300"
              } bg-transparent focus:outline-none pr-10`}
              value={formData.password}
              ref={passwordRef}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              tabIndex={-1}
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            )}
          </div>
          <div className="text-right">
            <button
              type="button"
              onClick={() => handleFormChange("forgotPassword")}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Quên mật khẩu?
            </button>
          </div>
          <button
            type="submit"
            className="w-full px-4 py-3 bg-black text-white text-sm font-semibold rounded-md hover:bg-gray-800 transition"
          >
            Đăng nhập
          </button>
        </form>
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 mb-4">Tạo tài khoản SIX Cinema mới?</p>
          <button
            onClick={() => handleFormChange("register")}
            className="w-full px-4 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
          >
            Tạo tài khoản →
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[1100] overflow-y-auto">
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleClose}
      />
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative bg-white w-full max-w-5xl rounded-lg shadow-xl flex overflow-hidden">
          <div className="hidden lg:block w-1/2 relative">
            <video
              className="absolute inset-0 w-full h-full object-cover"
              autoPlay
              loop
              muted
              playsInline
            >
              <source src="https://cdn.pixabay.com/video/2021/02/04/64118-509542832_tiny.mp4" type="video/mp4" />
            </video>
          </div>
          <div className="w-full lg:w-1/2 p-8">
            <button
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-500"
              onClick={handleClose}
            >
              <span className="text-2xl">&times;</span>
            </button>
            {renderForm()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
