import { useState } from "react";
import { toast } from "react-toastify";
import { resetPassword } from "../../../service/login";

const ForgotPasswordForm = ({ onBackToLogin }) => {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);

    const res = await resetPassword({ email, newPassword, confirmPassword });

    setLoading(false);

    if (res && !res.error && res.success) {
      toast.success("Đặt lại mật khẩu thành công! Vui lòng đăng nhập.");
      setTimeout(() => {
        onBackToLogin();
      }, 1200);
    } else {
      toast.error(res?.message || "Không thể đặt lại mật khẩu. Vui lòng thử lại!");
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-900">Đặt lại mật khẩu của bạn</h2>
      <p className="text-sm text-gray-600">
        Nhập email và mật khẩu mới. Hệ thống sẽ cập nhật mật khẩu ngay nếu email tồn tại.
      </p>

      <form className="space-y-4" onSubmit={handleResetPassword}>
        <input
          type="email"
          placeholder="Địa chỉ email"
          className="w-full p-3 border-b border-gray-300 bg-transparent text-gray-800 focus:outline-none focus:border-gray-900 placeholder-gray-500"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />
        <input
          type="password"
          placeholder="Mật khẩu mới"
          className="w-full p-3 border-b border-gray-300 bg-transparent text-gray-800 focus:outline-none focus:border-gray-900 placeholder-gray-500"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          disabled={loading}
        />
        <input
          type="password"
          placeholder="Xác nhận mật khẩu mới"
          className="w-full p-3 border-b border-gray-300 bg-transparent text-gray-800 focus:outline-none focus:border-gray-900 placeholder-gray-500"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          disabled={loading}
        />
        <button
          type="submit"
          className="w-full px-4 py-3 bg-black text-white text-sm font-semibold rounded-md hover:bg-gray-800 transition"
          disabled={loading}
        >
          {loading ? "Đang xử lý..." : "Cập nhật mật khẩu"}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600 mb-4">Bạn đã nhớ mật khẩu chưa?</p>
        <button
          onClick={onBackToLogin}
          className="w-full flex items-center justify-center px-4 py-3 text-sm font-semibold border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
          disabled={loading}
        >
          Quay lại đăng nhập
          <span className="ml-2">→</span>
        </button>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;