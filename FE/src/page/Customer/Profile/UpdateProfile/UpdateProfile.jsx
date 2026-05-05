import React, { useState } from "react";
import ReactDOM from "react-dom";
import { FiX, FiUser, FiMail, FiCalendar, FiPhone, FiMapPin, FiAward, FiFilm } from "react-icons/fi";
import { updateProfile } from "../../../../service/profile";
import { toast } from "react-toastify";

const GENRE_OPTIONS = [
  "Hành động",
  "Phiêu lưu",
  "Kinh dị",
  "Tình cảm",
  "Hài",
  "Hoạt hình",
  "Khoa học viễn tưởng",
  "Tâm lý",
  "Gia đình",
  "Thần thoại",
];

// Validate helpers
function isIdentityCardValid(identityCard) {
  return /^\d{9}$|^\d{12}$/.test(identityCard);
}
function isPhoneValid(phone) {
  return /^0\d{8,10}$/.test(phone);
}
function isEmailValid(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

const EditProfile = ({
  initialData,
  onClose,
  onSuccess,
}) => {
  const initialFavoriteGenres = Array.isArray(initialData?.favoriteGenres) && initialData.favoriteGenres.length
    ? initialData.favoriteGenres
    : JSON.parse(localStorage.getItem("favoriteGenres") || "[]");

  const [formData, setFormData] = useState({
    ...initialData,
    favoriteGenres: initialFavoriteGenres,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleGenreChange = (e) => {
    const selectedValues = Array.from(e.target.selectedOptions).map((option) => option.value);
    setFormData((prev) => ({
      ...prev,
      favoriteGenres: selectedValues,
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.fullName) newErrors.fullName = "Họ và tên không được để trống";
    if (formData.email && !isEmailValid(formData.email)) newErrors.email = "Email không hợp lệ";
    if (formData.identityCard && !isIdentityCardValid(formData.identityCard)) newErrors.identityCard = "CMND/CCCD phải có 9 hoặc 12 số";
    if (formData.phoneNumber && !isPhoneValid(formData.phoneNumber)) newErrors.phoneNumber = "Số điện thoại phải 10 số, bắt đầu bằng 0";
    if (!formData.dateOfBirth) newErrors.dateOfBirth = "Ngày sinh không được để trống";
    if (!formData.sex) newErrors.sex = "Giới tính không được để trống";
    if (!formData.address) newErrors.address = "Địa chỉ không được để trống";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    setLoading(true);
    try {
      const favoriteGenres = Array.isArray(formData.favoriteGenres)
        ? formData.favoriteGenres
        : [];

      localStorage.setItem("favoriteGenres", JSON.stringify(favoriteGenres));
      window.dispatchEvent(new Event("favoriteGenresUpdated"));

      const payload = {
        fullName: formData.fullName,
        dateOfBirth: formData.dateOfBirth,
        sex: formData.sex,
        email: formData.email,
        identityCard: formData.identityCard,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
        favoriteGenres,
      };

      const result = await updateProfile(payload);
      if (result && result.success) {
        if (onSuccess) onSuccess();
        onClose();
        toast.success("Cập nhật thông tin thành công!", {
          icon: "✅",
          position: "top-right",
          autoClose: 2000,
        });
      } else {
        toast.error(result?.message || "Cập nhật thông tin thất bại.", {
          icon: "❗",
          position: "top-right",
          autoClose: 2000,
        });
      }
    } catch (error) {
      toast.error("Cập nhật thông tin thất bại.", {
        icon: "❗",
        position: "top-right",
        autoClose: 2000,
      });
    } finally {
      setLoading(false);
    }
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999]" style={{ fontFamily: 'Inter, Montserrat, Roboto, Arial, sans-serif' }}>
      <div className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl border-2 border-[#FF7120]" style={{ maxHeight: "90vh", overflowY: "auto" }}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-extrabold text-[#FF7120] flex items-center gap-2">
            <FiUser /> Chỉnh sửa thông tin
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-[#FF7120] transition">
            <FiX size={28} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-[#FF7120] font-semibold mb-1 flex items-center gap-2"><FiUser /> Họ và tên</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName || ""}
              onChange={handleChange}
              className="w-full border-2 border-[#FF7120] rounded-xl px-4 py-2 text-base focus:ring-2 focus:ring-[#FF7120] focus:border-[#FF7120]"
              required
            />
            {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
          </div>
          <div>
            <label className="text-[#FF7120] font-semibold mb-1 flex items-center gap-2"><FiCalendar /> Ngày sinh</label>
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth || ""}
              onChange={handleChange}
              className="w-full border-2 border-[#FF7120] rounded-xl px-4 py-2 text-base focus:ring-2 focus:ring-[#FF7120] focus:border-[#FF7120]"
              required
            />
            {errors.dateOfBirth && <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth}</p>}
          </div>
          <div>
            <label className="text-[#FF7120] font-semibold mb-1 flex items-center gap-2"><FiUser /> Giới tính</label>
            <select
              name="sex"
              value={formData.sex || ""}
              onChange={handleChange}
              className="w-full border-2 border-[#FF7120] rounded-xl px-4 py-2 text-base focus:ring-2 focus:ring-[#FF7120] focus:border-[#FF7120]"
              required
            >
              <option value="MALE">Nam</option>
              <option value="FEMALE">Nữ</option>
            </select>
            {errors.sex && <p className="text-red-500 text-sm mt-1">{errors.sex}</p>}
          </div>
          <div>
            <label className="text-[#FF7120] font-semibold mb-1 flex items-center gap-2"><FiAward /> CMND/CCCD</label>
            <input
              type="text"
              name="identityCard"
              value={formData.identityCard || ""}
              onChange={handleChange}
              className="w-full border-2 border-[#FF7120] rounded-xl px-4 py-2 text-base focus:ring-2 focus:ring-[#FF7120] focus:border-[#FF7120]"
            />
            {formData.identityCard && !isIdentityCardValid(formData.identityCard) && (
              <p className="text-red-500 text-sm mt-1">
                CMND/CCCD phải có 9 hoặc 12 số.
              </p>
            )}
            {errors.identityCard && <p className="text-red-500 text-sm mt-1">{errors.identityCard}</p>}
          </div>
          <div>
            <label className="text-[#FF7120] font-semibold mb-1 flex items-center gap-2"><FiMail /> Email</label>
            <input
              type="email"
              name="email"
              value={formData.email || ""}
              onChange={handleChange}
              className="w-full border-2 border-[#FF7120] rounded-xl px-4 py-2 text-base focus:ring-2 focus:ring-[#FF7120] focus:border-[#FF7120]"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>
          <div>
            <label className="text-[#FF7120] font-semibold mb-1 flex items-center gap-2"><FiMapPin /> Địa chỉ</label>
            <input
              type="text"
              name="address"
              value={formData.address || ""}
              onChange={handleChange}
              className="w-full border-2 border-[#FF7120] rounded-xl px-4 py-2 text-base focus:ring-2 focus:ring-[#FF7120] focus:border-[#FF7120]"
              required
            />
            {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
          </div>
          <div>
            <label className="text-[#FF7120] font-semibold mb-1 flex items-center gap-2"><FiFilm /> Thể loại yêu thích</label>
            <select
              multiple
              value={formData.favoriteGenres || []}
              onChange={handleGenreChange}
              className="w-full border-2 border-[#FF7120] rounded-xl px-4 py-2 text-base focus:ring-2 focus:ring-[#FF7120] focus:border-[#FF7120] min-h-[120px]"
            >
              {GENRE_OPTIONS.map((genre) => (
                <option key={genre} value={genre}>
                  {genre}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">Giữ Ctrl (hoặc Cmd trên Mac) để chọn nhiều thể loại.</p>
          </div>
          <div>
            <label className="text-[#FF7120] font-semibold mb-1 flex items-center gap-2"><FiPhone /> Số điện thoại</label>
            <input
              type="text"
              name="phoneNumber"
              value={formData.phoneNumber || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  phoneNumber: e.target.value.replace(/\D/g, ""),
                }))
              }
              className="w-full border-2 border-[#FF7120] rounded-xl px-4 py-2 text-base focus:ring-2 focus:ring-[#FF7120] focus:border-[#FF7120]"
              minLength={9}
              maxLength={11}
            />
            {formData.phoneNumber && !isPhoneValid(formData.phoneNumber) && (
              <p className="text-red-500 text-sm mt-1">
                Số điện thoại phải từ 9 đến 11 số.
              </p>
            )}
            {errors.phoneNumber && <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>}
          </div>
          <div className="flex gap-4 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border-2 border-[#FF7120] text-[#FF7120] rounded-xl font-bold bg-white hover:bg-orange-50 hover:text-orange-700 transition text-base shadow"
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 text-white rounded-xl font-bold bg-gradient-to-r from-[#FF7120] to-[#fbbf24] hover:from-orange-600 hover:to-yellow-400 transition text-base shadow"
              disabled={loading}
            >
              {loading ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default EditProfile;