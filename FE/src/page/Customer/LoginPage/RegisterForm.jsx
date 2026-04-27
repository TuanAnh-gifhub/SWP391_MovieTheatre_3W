/* eslint-disable react/prop-types */
import { useState } from "react";
import { EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";
import { register } from "../../../service/register/index";
import NotificationModal from "../../../components/Nofication/NotificationModal";

const RegisterForm = ({ onBackToLogin }) => {
  const [registerData, setRegisterData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    dateOfBirth: "",
    sex: "",
    identityCard: "",
    email: "",
    address: "",
    phoneNumber: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [modalInfo, setModalInfo] = useState({
    isOpen: false,
    message: "",
    type: "success"
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Kiểm tra số điện thoại hợp lệ (9-11 số)
  const isPhoneValid = /^\d{9,11}$/.test(registerData.phoneNumber);

  // Kiểm tra CMND/CCCD hợp lệ (9 hoặc 12 số)
  const isIdentityCardValid = /^\d{9}$/.test(registerData.identityCard) || /^\d{12}$/.test(registerData.identityCard);

  const isPasswordValid = registerData.password.length >= 6;

  const isFormValid =
    registerData.username &&
    registerData.password &&
    registerData.confirmPassword &&
    registerData.fullName &&
    registerData.dateOfBirth &&
    registerData.sex &&
    registerData.identityCard &&
    registerData.email &&
    registerData.address &&
    registerData.phoneNumber &&
    isPhoneValid &&
    isIdentityCardValid &&
    isPasswordValid &&
    registerData.password === registerData.confirmPassword &&
    !passwordError;

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setModalInfo({ ...modalInfo, isOpen: false });

    if (!isFormValid) {
      setError("Vui lòng điền đầy đủ thông tin hợp lệ.");
      return;
    }

    setLoading(true);

    try {
      const requestData = { ...registerData };
      const response = await register(requestData);

      const isSuccess = 
        (typeof response === "string" && response.toLowerCase().includes("success")) ||
        (response && response.token);

      if (isSuccess) {
        setRegisterData({
          username: "",
          password: "",
          confirmPassword: "",
          fullName: "",
          dateOfBirth: "",
          sex: "",
          identityCard: "",
          email: "",
          address: "",
          phoneNumber: "",
        });
        setModalInfo({
          isOpen: true,
          message: "Đăng ký thành công. Bạn có thể đăng nhập ngay bây giờ.",
          type: "success"
        });
        if (onBackToLogin) onBackToLogin();
      } else {
        let errorMsg = typeof response === "string" ? response : response?.message || "Đăng ký thất bại!";
        if (errorMsg === "IDENTITY HAD ALREADY EXISTED") {
          errorMsg = "Tạo tài khoản thất bại hoặc tài khoản đã tồn tại";
        }
        setModalInfo({
          isOpen: true,
          message: errorMsg,
          type: "error"
        });
      }
    } catch (err) {
      setModalInfo({
        isOpen: true,
        message: err?.response?.data?.message || err?.message || "Đăng ký thất bại. Vui lòng thử lại!",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <NotificationModal
        isOpen={modalInfo.isOpen}
        message={modalInfo.message}
        type={modalInfo.type}
        onClose={() => {
          setModalInfo({ ...modalInfo, isOpen: false });
          // XÓA đoạn này để không chuyển về login khi có lỗi
          // if (modalInfo.type === "error") {
          //   onBackToLogin();
          // }
        }}
      />

      <h2 className="text-2xl font-semibold text-gray-900">
        Tạo tài khoản mới
      </h2>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <form className="space-y-4" onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="Tài khoản"
          className="w-full p-3 border-b border-gray-300 bg-transparent text-gray-800 focus:outline-none focus:border-gray-900 placeholder-gray-500"
          required
          value={registerData.username}
          onChange={(e) =>
            setRegisterData({ ...registerData, username: e.target.value })
          }
        />
        <input
          type="text"
          placeholder="Họ và tên"
          className="w-full p-3 border-b border-gray-300 bg-transparent text-gray-800 focus:outline-none focus:border-gray-900 placeholder-gray-500"
          required
          value={registerData.fullName}
          onChange={(e) =>
            setRegisterData({ ...registerData, fullName: e.target.value })
          }
        />
        <input
          type="date"
          placeholder="Ngày tháng năm sinh"
          className="w-full p-3 border-b border-gray-300 bg-transparent text-gray-800 focus:outline-none focus:border-gray-900"
          required
          value={registerData.dateOfBirth}
          onChange={(e) =>
            setRegisterData({ ...registerData, dateOfBirth: e.target.value })
          }
        />
        <select
          className="w-full p-3 border-b border-gray-300 bg-transparent text-gray-800 focus:outline-none focus:border-gray-900"
          required
          value={registerData.sex}
          onChange={(e) =>
            setRegisterData({ ...registerData, sex: e.target.value })
          }
        >
          <option value="">Giới tính</option>
          <option value="MALE">Nam</option>
          <option value="FEMALE">Nữ</option>
          
        </select>
        <input
          type="text"
          placeholder="CCCD/CMND"
          className="w-full p-3 border-b border-gray-300 bg-transparent text-gray-800 focus:outline-none focus:border-gray-900 placeholder-gray-500"
          required
          value={registerData.identityCard}
          minLength={9}
          maxLength={12}
          onChange={(e) =>
            setRegisterData({
              ...registerData,
              identityCard: e.target.value.replace(/\D/g, "")
            })
          }
        />
        {registerData.identityCard && !isIdentityCardValid && (
          <p className="text-red-500 text-sm mt-1">
            CMND/CCCD phải có 9 hoặc 12 số.
          </p>
        )}

        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 border-b border-gray-300 bg-transparent text-gray-800 focus:outline-none focus:border-gray-900 placeholder-gray-500"
          required
          value={registerData.email}
          onChange={(e) =>
            setRegisterData({ ...registerData, email: e.target.value })
          }
        />
        <input
          type="text"
          placeholder="Địa chỉ"
          className="w-full p-3 border-b border-gray-300 bg-transparent text-gray-800 focus:outline-none focus:border-gray-900 placeholder-gray-500"
          required
          value={registerData.address}
          onChange={(e) =>
            setRegisterData({ ...registerData, address: e.target.value })
          }
        />
        <input
          type="text"
          placeholder="Số điện thoại"
          className="w-full p-3 border-b border-gray-300 bg-transparent text-gray-800 focus:outline-none focus:border-gray-900 placeholder-gray-500"
          required
          value={registerData.phoneNumber}
          minLength={9}
          maxLength={11}
          onChange={(e) =>
            setRegisterData({
              ...registerData,
              phoneNumber: e.target.value.replace(/\D/g, "")
            })
          }
        />
        {registerData.phoneNumber && !isPhoneValid && (
          <p className="text-red-500 text-sm mt-1">
            Số điện thoại phải từ 9 đến 11 số.
          </p>
        )}
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Tạo mật khẩu"
            className="w-full p-3 border-b border-gray-300 bg-transparent text-gray-800 focus:outline-none focus:border-gray-900 placeholder-gray-500 pr-10"
            required
            value={registerData.password}
            onChange={(e) =>
              setRegisterData({ ...registerData, password: e.target.value })
            }
          />
          <span
            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500"
            onClick={() => setShowPassword((prev) => !prev)}
          >
            {showPassword ? <EyeTwoTone /> : <EyeInvisibleOutlined />}
          </span>
        </div>
        {registerData.password && !isPasswordValid && (
          <p className="text-red-500 text-sm mt-1">
            Mật khẩu phải có ít nhất 6 ký tự.
          </p>
        )}
        <div className="relative">
          <input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Xác nhận mật khẩu"
            className="w-full p-3 border-b border-gray-300 bg-transparent text-gray-800 focus:outline-none focus:border-gray-900 placeholder-gray-500 pr-10"
            required
            value={registerData.confirmPassword}
            onChange={(e) => {
              const value = e.target.value;
              setRegisterData({
                ...registerData,
                confirmPassword: value,
              });

              if (value !== registerData.password) {
                setPasswordError("Mật khẩu không khớp!");
              } else {
                setPasswordError("");
              }
            }}
          />
          <span
            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500"
            onClick={() => setShowConfirmPassword((prev) => !prev)}
          >
            {showConfirmPassword ? <EyeTwoTone /> : <EyeInvisibleOutlined />}
          </span>
        </div>
        {passwordError && (
          <p className="text-red-500 text-sm mt-1">{passwordError}</p>
        )}

        <button
          type="submit"
          disabled={!isFormValid || loading}
          className={`w-full px-4 py-3 text-sm font-semibold rounded-md transition ${
            isFormValid && !loading
              ? "bg-black text-white hover:bg-gray-800"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          {loading ? "Đang đăng ký..." : "Tạo tài khoản mới"}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600 mb-4">Bạn đã có tài khoản chưa?</p>
        <button
          onClick={onBackToLogin}
          className="w-full flex items-center justify-center px-4 py-3 text-sm font-semibold border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
        >
          Quay lại đăng nhập
          <span className="ml-2">→</span>
        </button>
      </div>
    </div>
  );
};

export default RegisterForm;
