import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { FiEdit2, FiEye, FiEyeOff, FiUser, FiMail, FiCalendar, FiPhone, FiMapPin, FiAward, FiGift, FiKey, FiChevronRight, FiFilm } from "react-icons/fi";
import { getProfileMember, sendOtpResetPassword, resetPasswordWithOtp } from "../../../service/profile";
import Orders from "./MyOrders/MyOrdered";
import MyVoucher from "./MyVouchers/MyVoucher";
import EditProfile from "./UpdateProfile/UpdateProfile";
import avatarMale from "../../../assets/img/avatar-male.png";
import avatarFemale from "../../../assets/img/avatar-female.png";
import avatarDefault from "../../../assets/img/default-avatar.png";
import { toast } from "react-toastify";
import { getAllLoyaltyTiers } from '../../../service/loyalty';
import ParallaxBackground from '../LandingPage/ParallaxBackground';
import { CiSun } from 'react-icons/ci';

const OTP_LENGTH = 6;

const tabList = [
  { key: "profile", label: "Thông tin cá nhân", icon: <FiUser /> },
  { key: "orders", label: "Lịch sử đặt vé", icon: <FiFilm /> },
  { key: "myVoucher", label: "Voucher của tôi", icon: <FiGift /> },
];

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const location = useLocation();
  const [formData, setFormData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetStep, setResetStep] = useState(1);
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetMsg, setResetMsg] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const inputsRef = useRef([]);
  const [loyaltyTiers, setLoyaltyTiers] = useState([]);
  // Dark mode state synced with localStorage (like LandingPage)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const stored = localStorage.getItem('landing_dark_mode');
    return stored === 'true';
  });

  // Hàm lấy thông tin tài khoản từ API
  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const customerID = localStorage.getItem("id") || JSON.parse(localStorage.getItem("user"))?.customerID;
      if (customerID) {
        const profile = await getProfileMember(customerID);
        if (profile) {
          let avatar = profile.avatar || null;
          let gender = profile.sex || localStorage.getItem("gender");
          if (!avatar) {
            if (gender?.toUpperCase() === "MALE") {
              avatar = avatarMale;
            } else if (gender?.toUpperCase() === "FEMALE") {
              avatar = avatarFemale;
            } else {
              avatar = avatarDefault;
            }
          }
          setFormData({
            fullName: profile.fullName || "",
            email: profile.email || "",
            dateOfBirth: profile.dob || "",
            sex: gender || "",
            identityCard: profile.identityCard || "",
            phoneNumber: profile.phone || "",
            address: profile.address || "",
            avatar: avatar,
            score: profile.score || 0,
            finalScore: profile.finalScore || 0,
            updatedDate: profile.updatedDate || "",
            rank: profile.rank || "",
            rankImage: profile.rankImage || "",
          });
        }
      }
    } catch (err) {
      alert("Không lấy được thông tin cá nhân!");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    // Lấy danh sách tier
    getAllLoyaltyTiers().then(res => {
      if (res && res.status === 200 && Array.isArray(res.result)) {
        // Sắp xếp theo pointThreshold tăng dần
        setLoyaltyTiers(res.result.sort((a, b) => a.pointThreshold - b.pointThreshold));
      }
    });
  }, []);

  useEffect(() => {
    if (location.state && location.state.tab === 'myVoucher') {
      setActiveTab('myVoucher');
      setTimeout(() => {
        const mainContent = document.getElementById('profile-main-content');
        if (mainContent) {
          mainContent.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 200);
    }
  }, [location.state]);

  // Gửi OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResetMsg("");
    const res = await sendOtpResetPassword(emailOrUsername);
    setLoading(false);
    if (res && (res.status === "OK" || res.success)) {
      setResetStep(2);
      toast.success("OTP đã được gửi đến email hoặc số điện thoại của bạn.");
    } else {
      setResetMsg(res?.message || "Gửi OTP thất bại.");
    }
  };

  // Đổi mật khẩu
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetMsg("");
    const otpValue = otp.join("");
    if (
      otpValue.length !== OTP_LENGTH ||
      !newPassword ||
      !confirmPassword
    ) {
      setResetMsg("Vui lòng nhập đầy đủ thông tin!");
      return;
    }
    if (newPassword.length < 6) {
      setResetMsg("Mật khẩu mới phải có ít nhất 6 ký tự!");
      return;
    }
    if (newPassword !== confirmPassword) {
      setResetMsg("Mật khẩu xác nhận không khớp!");
      return;
    }
    setLoading(true);
    const res = await resetPasswordWithOtp({
      token: otpValue,
      newPassword,
      confirmPassword,
    });
    setLoading(false);
    if (res && (res.status === "OK" || res.success)) {
      toast.success("Đổi mật khẩu thành công!");
      setTimeout(() => setShowResetModal(false), 1500);
    } else {
      setResetMsg(res?.message || "OTP không hợp lệ hoặc có lỗi!");
      setOtp(Array(OTP_LENGTH).fill(""));
      inputsRef.current[0]?.focus();
    }
  };

  const isConfirmMismatch = confirmPassword && newPassword !== confirmPassword;

  // Xác định tier hiện tại theo backend (rank) và chỉ highlight tier đang bật (isActive)
  const activeTiers = loyaltyTiers.filter(tier => tier.isActive !== false);
  const currentTier = activeTiers.find(tier => tier.name === formData?.rank) || activeTiers[0];
  
  // Tính toán vị trí dot dựa trên vị trí thực tế của các tier
  const calculateDotPosition = () => {
    if (!formData?.finalScore || activeTiers.length === 0) return 0;
    
    const userScore = formData.finalScore;
    const maxScore = activeTiers[activeTiers.length - 1]?.pointThreshold || 1;
    
    // Nếu user đã đạt tier cao nhất
    if (userScore >= maxScore) return 100;
    
    // Tìm tier hiện tại và tier tiếp theo
    let currentTierIndex = -1;
    let nextTierIndex = -1;
    
    for (let i = 0; i < activeTiers.length; i++) {
      if (userScore >= activeTiers[i].pointThreshold) {
        currentTierIndex = i;
      } else {
        nextTierIndex = i;
        break;
      }
    }
    
    // Nếu user chưa đạt tier nào
    if (currentTierIndex === -1) {
      const firstTierScore = activeTiers[0]?.pointThreshold || 0;
      return Math.min((userScore / firstTierScore) * (100 / activeTiers.length), 100 / activeTiers.length);
    }
    
    // Nếu user đã đạt tier cao nhất
    if (nextTierIndex === -1) return 100;
    
    // Tính toán vị trí dựa trên tier hiện tại và tier tiếp theo
    const currentTierScore = activeTiers[currentTierIndex].pointThreshold;
    const nextTierScore = activeTiers[nextTierIndex].pointThreshold;
    
    // Vị trí bắt đầu của tier hiện tại (theo index)
    const currentTierPosition = (currentTierIndex / (activeTiers.length - 1)) * 100;
    const nextTierPosition = (nextTierIndex / (activeTiers.length - 1)) * 100;
    
    // Tính tỷ lệ progress trong khoảng giữa 2 tier
    const progressInRange = (userScore - currentTierScore) / (nextTierScore - currentTierScore);
    
    // Vị trí cuối cùng
    return currentTierPosition + (progressInRange * (nextTierPosition - currentTierPosition));
  };

  return (
    <div className="relative min-h-screen w-full font-sans" style={{ fontFamily: 'Inter, Montserrat, Roboto, Arial, sans-serif' }}>
      {/* Nút chuyển chế độ sáng/tối giống MovieList/LandingPage */}
      <button
        onClick={() => {
          setIsDarkMode((prev) => {
            localStorage.setItem('landing_dark_mode', !prev);
            return !prev;
          });
        }}
        className="fixed top-20 right-1 z-[10000] w-8 h-8 flex items-center justify-center rounded-full shadow-lg hover:bg-gray-700 transition bg-orange-100 border-gray-600 focus:outline-none"
        aria-label={isDarkMode ? 'Chế độ Sáng' : 'Chế độ Tối'}
        title={isDarkMode ? 'Chế độ Sáng' : 'Chế độ Tối'}
      >
        <CiSun className={`w-7 h-7 transition-colors duration-200 ${isDarkMode ? 'text-black' : 'text-orange-400'}`} />
      </button>
      {/* Lớp phủ hiệu ứng đặt ngoài cùng, dùng ParallaxBackground */}
      <ParallaxBackground isDarkMode={isDarkMode} />
      {/* Main content */}
      <div className="relative z-10 px-1 py-4">
                 <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-6">
           {/* Sidebar */}
           <aside className="w-full md:w-1/3 bg-white rounded-2xl shadow-xl p-6 flex flex-col items-center border border-[#e5e7eb] overflow-hidden">
            <div className="relative w-24 h-24 mb-4">
              <img
                src={formData?.avatar || avatarDefault}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-2 border-[#FF7120] shadow"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = avatarDefault;
                }}
              />
              <button
                className="absolute bottom-1 right-1 bg-[#FF7120] text-white p-2 rounded-full shadow hover:bg-orange-600 transition-all duration-200 border border-white"
                title="Đổi mật khẩu"
                onClick={() => {
                  setShowResetModal(true);
                  setResetStep(1);
                  setEmailOrUsername("");
                  setOtp(Array(OTP_LENGTH).fill(""));
                  setNewPassword("");
                  setConfirmPassword("");
                  setResetMsg("");
                }}
              >
                <FiKey size={18} />
              </button>
            </div>
            {/* Tên */}
            <div className="flex flex-col items-center w-full min-w-0 overflow-x-auto mb-1">
              <div className="flex items-center justify-center w-full min-w-0">
                <span className="break-all w-full min-w-0 text-lg font-extrabold text-gray-900 text-center">{formData?.fullName || ""}</span>
                {formData?.rankImage && (
                  <img
                    src={formData.rankImage}
                    alt={formData.rank}
                    className="w-6 h-6 object-contain ml-1"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                )}
              </div>
            </div>
                         {/* Email */}
             <div className="flex flex-col items-center w-full min-w-0 overflow-x-auto mb-1">
               <div className="flex items-center justify-center w-full min-w-0">
                 <span className="break-all w-full min-w-0 text-gray-500 text-sm text-center">{formData?.email || ""}</span>
               </div>
             </div>
             {/* Xếp hạng */}
             <div className="flex flex-col items-center w-full min-w-0 overflow-x-auto mb-1">
               <div className="flex items-center justify-center w-full min-w-0">
                 <span className="font-semibold text-[#FF7120] text-sm break-all w-full min-w-0 text-center">{formData?.rank}</span>
               </div>
             </div>
                         <div className="flex flex-col items-center mb-3 w-full px-4">
               <span className="text-xs text-gray-400 mb-1">Điểm xếp hạng</span>
               {/* Thanh xếp hạng động - thiết kế lại */}
               <div className="relative w-full flex flex-col items-center">
                                 {/* Các mốc tier phía trên thanh */}
                 <div className="flex w-full justify-between mb-1 relative z-10 overflow-x-auto rank-tier-container -mx-2">
                   {activeTiers.map((tier, idx) => {
                     const isCurrent = tier.id === currentTier?.id;
                     return (
                       <div key={tier.id} className="flex flex-col items-center flex-shrink-0 rank-tier-item" style={{ width: `${100 / activeTiers.length}%`, minWidth: '40px' }}>
                         <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold mb-1 transition-all duration-200 ${isCurrent ? 'bg-[#FF7120] border-[#FF7120] text-white scale-110 shadow' : 'bg-white border-gray-300 text-[#FF7120]'}`}>{idx+1}</div>
                       </div>
                     );
                   })}
                 </div>
                                 {/* Thanh tiến trình */}
                 <div className="relative w-full h-4 flex items-center -mx-2">
                   <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-3 bg-gray-200 rounded-full overflow-hidden">
                     <div
                         className="h-3 rounded-full bg-gradient-to-r from-[#FF7120] to-[#fbbf24] transition-all duration-700"
                       style={{ width: activeTiers.length > 0 && formData?.finalScore !== undefined ? `${calculateDotPosition()}%` : '0%' }}
                     ></div>
                   
                     {/* Vị trí user hiện tại (dot) */}
                     {formData?.finalScore !== undefined && activeTiers.length > 0 && (
                       <div
                         className="absolute top-1/2 -translate-y-1/2"
                         style={{ left: `${calculateDotPosition()}%`, transform: 'translate(-50%, -50%)' }}
                       >
                         <div className="w-4 h-4 bg-[#FF7120] rounded-full border-2 border-white shadow"></div>
                       </div>
                     )}
                   </div>
                 </div>
                                  {/* Tên tier và điểm mốc phía dưới thanh */}
                 <div className="flex w-full justify-between mt-1 relative z-10 overflow-x-auto rank-tier-container -mx-2">
                   {activeTiers.map((tier, idx) => {
                     const isCurrent = tier.id === currentTier?.id;
                     return (
                       <div key={tier.id} className="flex flex-col items-center flex-shrink-0 text-center rank-tier-item" style={{ width: `${100 / activeTiers.length}%`, minWidth: '40px' }}>
                         <div className={`text-xs font-semibold truncate w-full px-1 rank-tier-text ${isCurrent ? 'text-[#FF7120]' : 'text-gray-700'}`} title={tier.name}>{tier.name}</div>
                       <div className="text-[10px] text-gray-500 truncate w-full px-1 rank-tier-points" title={`${tier.pointThreshold} điểm`}>{tier.pointThreshold} điểm</div>
                       {tier.discountPercent > 0 && (
                         <div className="text-[10px] text-green-600 font-semibold truncate w-full px-1 rank-tier-discount" title={`Giảm ${tier.discountPercent}%`}>Giảm {tier.discountPercent}%</div>
                       )}
                     </div>
                   );
                 })}
                 </div>
                {/* Điểm hiện tại căn giữa dưới thanh */}
                <div className="w-full flex justify-center mt-2">
                  <span className="text-base font-bold text-[#FF7120] bg-white px-3 py-1 rounded-xl shadow border border-[#FF7120]">
                    {formData?.finalScore} / {
                      activeTiers.length > 0 && formData?.finalScore 
                        ? (() => {
                            const nextTier = activeTiers.find(tier => formData.finalScore < tier.pointThreshold);
                            return nextTier ? nextTier.pointThreshold : activeTiers[activeTiers.length-1]?.pointThreshold || 0;
                          })()
                        : activeTiers[activeTiers.length-1]?.pointThreshold || 0
                    }
                  </span>
                  </div>
              </div>
            </div>
            <div className="flex flex-col gap-2 w-full mt-1">
              {tabList.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl font-bold text-sm uppercase tracking-wide transition border shadow-sm ${
                    activeTab === tab.key
                      ? "bg-gradient-to-r from-[#FF7120] to-[#fbbf24] text-white border-[#FF7120] shadow-lg scale-105"
                      : "bg-white text-[#FF7120] border-gray-200 hover:bg-orange-50 hover:scale-105"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                  {activeTab === tab.key && <FiChevronRight className="ml-auto" />}
                </button>
              ))}
            </div>
          </aside>

          {/* Main content */}
          <main id="profile-main-content" className="flex-1">
            <div className="bg-white rounded-2xl shadow-xl p-5 border border-[#e5e7eb] min-h-[400px]">
              {isLoading ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF7120]"></div>
                </div>
              ) : (
                <div
                  key={activeTab}
                  className="transition-all duration-500 ease-out animate-fade-in-slide"
                >
                  {activeTab === "profile" && (
                    <div>
                      <h3 className="text-xl font-extrabold mb-5 text-[#FF7120] flex items-center gap-2 tracking-tight">
                        <FiUser /> Thông tin cá nhân
                      </h3>
                      {formData ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div className="bg-gradient-to-br from-[#fff7f0] to-[#f3f4f6] rounded-xl shadow p-4 border flex flex-col gap-3">
                            {/* Tên */}
                            <div className="flex items-center gap-2 w-full min-w-0 overflow-x-auto mb-1">
                              <FiUser className="text-lg text-[#FF7120]" />
                              <span className="break-all w-full min-w-0 font-semibold text-base">{formData.fullName}</span>
                            </div>
                            <div className="flex items-center gap-2 w-full min-w-0 overflow-x-auto">
                              <FiMail className="text-lg text-[#FF7120]" />
                              <span className="break-words w-full min-w-0">{formData.email}</span>
                            </div>
                            <div className="flex items-center gap-2 w-full min-w-0 overflow-x-auto">
                              <FiCalendar className="text-lg text-[#FF7120]" />
                              <span className="break-words w-full min-w-0">{formData.dateOfBirth}</span>
                            </div>
                            <div className="flex items-center gap-2 w-full min-w-0 overflow-x-auto">
                              <FiUser className="text-lg text-[#FF7120]" />
                              <span className="break-words w-full min-w-0">{formData.sex === "MALE" ? "Nam" : formData.sex === "FEMALE" ? "Nữ" : formData.sex}</span>
                            </div>
                            <div className="flex items-center gap-2 w-full min-w-0 overflow-x-auto">
                              <FiAward className="text-lg text-[#FF7120]" />
                              <span className="break-words w-full min-w-0">{formData.identityCard}</span>
                            </div>
                          </div>
                          <div className="bg-gradient-to-br from-[#f3f4f6] to-[#fff7f0] rounded-xl shadow p-4 border flex flex-col gap-3">
                            <div className="flex items-center gap-2 w-full min-w-0 overflow-x-auto">
                              <FiPhone className="text-lg text-[#FF7120]" />
                              <span className="break-words w-full min-w-0">{formData.phoneNumber}</span>
                            </div>
                            <div className="flex items-center gap-2 w-full min-w-0 overflow-x-auto">
                              <FiMapPin className="text-lg text-[#FF7120]" />
                              <span className="break-words w-full min-w-0">{formData.address}</span>
                            </div>
                            <div className="flex items-center gap-2 w-full min-w-0 overflow-x-auto">
                              <FiCalendar className="text-lg text-[#FF7120]" />
                              <span className="break-words w-full min-w-0">{formData.updatedDate ? new Date(formData.updatedDate).toLocaleString("vi-VN") : ""}</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-500">Không có thông tin chi tiết để hiển thị.</p>
                      )}
                      <div className="flex justify-end mt-5">
                        <button
                          onClick={() => setIsEditing(true)}
                          className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-[#FF7120] to-[#fbbf24] text-white font-bold shadow-lg hover:scale-105 transition-all text-base"
                        >
                          <FiEdit2 /> Chỉnh sửa thông tin
                        </button>
                      </div>
                    </div>
                  )}
                  {activeTab === "orders" && (
                    <div>
                      <h3 className="text-xl font-extrabold mb-5 text-[#FF7120] flex items-center gap-2 tracking-tight">
                        <FiFilm /> Lịch sử đặt vé
                      </h3>
                      <Orders />
                    </div>
                  )}
                  {activeTab === "myVoucher" && (
                    <div>
                      <h3 className="text-xl font-extrabold mb-5 text-[#FF7120] flex items-center gap-2 tracking-tight">
                        <FiGift /> Voucher của tôi
                      </h3>
                      <MyVoucher defaultTab="voucher" />
                    </div>
                  )}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Modal chỉnh sửa thông tin */}
      {isEditing && (
        <EditProfile
          initialData={formData}
          onClose={() => setIsEditing(false)}
          onSuccess={fetchProfile}
        />
      )}

      {/* Modal đổi mật khẩu bằng OTP */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-5 w-full max-w-md shadow-2xl border border-[#FF7120]">
            <h3 className="text-lg font-extrabold mb-5 text-[#FF7120] flex items-center gap-2"><FiKey /> Đổi mật khẩu bằng OTP</h3>
            {resetStep === 1 && (
              <form className="space-y-4" onSubmit={handleSendOtp}>
                <input
                  type="text"
                  className="w-full border-2 border-blue-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
                  placeholder="Nhập email hoặc username"
                  value={emailOrUsername}
                  onChange={e => setEmailOrUsername(e.target.value)}
                  required
                  disabled={loading}
                />
                <button
                  type="submit"
                  className="w-full text-white py-2 rounded-lg bg-gradient-to-r from-orange-500 to-blue-400 hover:from-orange-600 hover:to-blue-500 font-semibold shadow"
                  disabled={loading || !emailOrUsername}
                >
                  {loading ? "Đang gửi..." : "Gửi OTP"}
                </button>
                {resetMsg && <div className="mt-2 text-sm text-red-600">{resetMsg}</div>}
              </form>
            )}
            {resetStep === 2 && (
              <form className="space-y-4" onSubmit={handleResetPassword}>
                <div className="flex gap-2 mb-2" onPaste={e => {
                  const paste = e.clipboardData.getData("text").replace(/[^0-9]/g, "");
                  if (paste.length === OTP_LENGTH) {
                    setOtp(paste.split(""));
                    inputsRef.current[OTP_LENGTH - 1]?.focus();
                  }
                }}>
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={el => (inputsRef.current[idx] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={e => {
                        const value = e.target.value.replace(/[^0-9]/g, "");
                        if (!value) return;
                        const newOtp = [...otp];
                        newOtp[idx] = value[0];
                        setOtp(newOtp);
                        if (idx < OTP_LENGTH - 1 && value) {
                          inputsRef.current[idx + 1].focus();
                        }
                      }}
                      onKeyDown={e => {
                        if (e.key === "Backspace") {
                          if (otp[idx]) {
                            const newOtp = [...otp];
                            newOtp[idx] = "";
                            setOtp(newOtp);
                          } else if (idx > 0) {
                            inputsRef.current[idx - 1].focus();
                          }
                        }
                      }}
                      className="w-12 h-12 text-center text-2xl border-2 border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                      autoFocus={idx === 0}
                      disabled={loading}
                    />
                  ))}
                </div>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    className="w-full border-2 border-blue-200 rounded-lg px-3 py-2 pr-10 focus:ring-2 focus:ring-blue-400"
                    placeholder="Mật khẩu mới"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                    onClick={() => setShowNewPassword(v => !v)}
                    style={{ outline: "none" }}
                  >
                    {showNewPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    className="w-full border-2 border-blue-200 rounded-lg px-3 py-2 pr-10 focus:ring-2 focus:ring-blue-400"
                    placeholder="Xác nhận mật khẩu mới"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                    onClick={() => setShowConfirmPassword(v => !v)}
                    style={{ outline: "none" }}
                  >
                    {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                {isConfirmMismatch && (
                  <div className="text-sm text-red-600 -mt-2 mb-2">
                    Mật khẩu xác nhận không khớp!
                  </div>
                )}
                <button
                  type="submit"
                  className="w-full text-white py-2 rounded-lg bg-gradient-to-r from-orange-500 to-blue-400 hover:from-orange-600 hover:to-blue-500 font-semibold shadow"
                  disabled={loading || otp.join("").length !== OTP_LENGTH}
                >
                  {loading ? "Đang đổi..." : "Đổi mật khẩu"}
                </button>
                {resetMsg && <div className="mt-2 text-sm text-red-600">{resetMsg}</div>}
              </form>
            )}
            <div className="flex justify-center mt-4">
              <button
                className="w-full bg-white border-2 border-blue-400 text-blue-700 py-2 rounded-lg hover:bg-blue-50 hover:text-blue-900 transition font-semibold"
                onClick={() => setShowResetModal(false)}
                disabled={loading}
                type="button"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
