import { useState, useRef, useEffect, useContext } from "react";
import { FiSearch } from "react-icons/fi";
import { FaArrowRightLong } from "react-icons/fa6";
import { Link, useNavigate, useLocation } from "react-router-dom";
import LoginModal from "../../page/Customer/LoginPage/LoginPage";
import { FiUser } from "react-icons/fi";
import { logout } from "../../service/logout";
import { clearExpiredToken } from "../../service/login/index";
import { getAllMovies } from "../../service/landingpage";
import logo from "../../assets/img/logo.png";
import { GoldSparkleEffect } from "./GoldVersionHeader";
import { DiamondSparkleEffect } from "./DiamondVersionHeader";
import { updateMemberScore } from "../../service/payment";
import { LoginVersionContext } from "../../layout/RootLayout";
import { useScrollspy, useAuth } from "../../context/ScrollspyContext";
import { motion } from "framer-motion";
// ScrambleText: Hiệu ứng giải mã chữ
const ScrambleText = ({ text, triggerKey, duration = 400, interval = 30, className = "" }) => {
  const [display, setDisplay] = useState(text);
  useEffect(() => {
    let mounted = true;
    let frame = 0;
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=<>?";
    const textArr = text.split("");
    let revealCount = 0;
    setDisplay(textArr.map(() => "").join(""));
    const totalFrames = Math.ceil(duration / interval);
    const scramble = () => {
      if (!mounted) return;
      if (frame < totalFrames) {
        // Reveal progressively
        revealCount = Math.floor((frame / totalFrames) * textArr.length);
        const scrambled = textArr.map((c, i) => {
          if (i < revealCount) return c;
          if (c === " ") return " ";
          return chars[Math.floor(Math.random() * chars.length)];
        });
        setDisplay(scrambled.join(""));
        frame++;
        setTimeout(scramble, interval);
      } else {
        setDisplay(text);
      }
    };
    scramble();
    return () => { mounted = false; };
    // eslint-disable-next-line
  }, [triggerKey, text]);
  return <span className={className}>{display}</span>;
};

const Header = () => {
  const { activeSection } = useScrollspy();
  const [showSearch, setShowSearch] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const searchRef = useRef(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showShopMenu, setShowShopMenu] = useState(false);
  const shopMenuRef = useRef(null);
  const [isShopDropdownOpen, setIsShopDropdownOpen] = useState(false);
  const shopButtonRef = useRef(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef(null);
  const [error, setError] = useState(null);
  const { loginVersion, setLoginVersion } = useContext(LoginVersionContext);
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const searchTimeout = useRef();
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn, user, userProfile, logout: authLogout, updateUserProfile } = useAuth();

  // Kiểm tra token hết hạn và cập nhật user profile
  useEffect(() => {
    clearExpiredToken("user");
    
    // Chỉ cập nhật profile nếu đã đăng nhập và có userProfile
    if (isLoggedIn && userProfile?.customerID) {
      updateMemberScore(userProfile.customerID)
        .then((res) => {
          if (res && res.result) {
            updateUserProfile({
              ...userProfile,
              rank: res.result.rankName,
              rankImage: res.result.rankImage,
              scores: res.result.scores,
            });
          }
        })
        .catch(() => {
          // Giữ nguyên profile hiện tại nếu có lỗi
        });
    }
  }, [loginVersion, isLoggedIn, userProfile?.customerID]);

  // Đóng search khi click ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        if (!searchValue.trim()) setShowSearch(false);
      }
    };
    if (showSearch) document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [showSearch, searchValue]);

  // Đổi trạng thái header khi scroll
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 0);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Đóng shop menu khi click ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (shopMenuRef.current && !shopMenuRef.current.contains(event.target)) {
        setShowShopMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Đóng user menu khi click ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("click", handleClickOutside); // đổi từ mousedown sang click
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Bổ sung hàm handleSearch
  const handleSearch = () => {
    if (searchResults && searchResults.length > 0) {
      // Chuyển hướng đến phim đầu tiên tìm được
      navigate(`/movies/${normalize(searchResults[0].title)}`);
      setShowSearch(false);
      setSearchValue("");
      setSearchResults([]);
    }
  };

  const handleShopClick = (e) => {
    e.stopPropagation();
    setIsShopDropdownOpen(!isShopDropdownOpen);
  };

  const handleLogout = () => {
    // Sử dụng authLogout từ AuthContext
    authLogout();
    setShowUserMenu(false);
  };

  const handleProfileClick = () => {
    setShowUserMenu(false);
  };

  // Hàm normalize giống các nơi khác
  const normalize = (str) =>
    str
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "_");

  // Search realtime khi searchValue thay đổi (debounce 300ms)
  useEffect(() => {
    if (!showSearch) return;
    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    if (!searchValue.trim()) {
      setSearchResults([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    searchTimeout.current = setTimeout(async () => {
      const res = await getAllMovies();
      if (!res.error && Array.isArray(res.result)) {
        const results = res.result.filter((movie) =>
          movie.title.toLowerCase().includes(searchValue.trim().toLowerCase())
        );
        setSearchResults(results);
      } else {
        setSearchResults([]);
      }
      setSearching(false);
    }, 300);

    return () => clearTimeout(searchTimeout.current);
  }, [searchValue, showSearch]);

  // Xử lý enter trong ô input
  const handleInputKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  // Hàm xác định style header dựa trên rank
  const getHeaderStyle = () => {
    if (!userProfile?.rank) return "default";
    const rank = userProfile.rank.toLowerCase();
    if (rank.includes("vàng")) return "gold";
    if (rank.includes("kim cương")) return "diamond";
    return "default";
  };

  const headerStyle = getHeaderStyle();

  // Xác định màu nền theo rank
  const getHeaderBg = () => {
    if (headerStyle === "gold")
      // Nền cam trong suốt cho vàng
      return "bg-[rgba(255,113,32,0.18)] backdrop-blur-[2px]";
    if (headerStyle === "diamond")
      // Nền xanh dương trong suốt cho kim cương
      return "bg-[rgba(30,144,255,0.18)] backdrop-blur-[2px]";
    // Default: xám nhạt trong suốt
    return "bg-[rgba(228,228,228,0.82)] backdrop-blur-[2px]";
  };

  const headerBg = getHeaderBg();

  // Parse query params for /movies page
  let moviesStatus = null;
  if (location.pathname === '/movies') {
    const params = new URLSearchParams(location.search);
    moviesStatus = params.get('status');
  }
  // Kết hợp scrollspy và query param
  const isActiveNowShowing =
    (location.pathname === '/movies' && moviesStatus === 'Now Showing') ||
    (location.pathname === '/' && activeSection === 'now-showing');
  const isActiveComingSoon =
    (location.pathname === '/movies' && moviesStatus === 'Coming Soon') ||
    (location.pathname === '/' && activeSection === 'coming-soon');

  // Helper to handle menu click for landing sections
  const handleMenuClick = (sectionId) => {
    if (location.pathname === '/') {
      // Đã ở landing, scroll như bình thường
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
      // Chuyển về landing và truyền hash
      navigate('/#' + sectionId);
    }
  };

  return (
    <>
      <header
        className={`w-full fixed top-0 left-0 right-0 z-50 border-b-2 border-[#ff7120] font-mono text-[#0e0e0e] text-base leading-[1.4] shadow-sm ${headerBg}`}
        style={{
          minHeight: '64px'
        }}
      >
        <div className="w-full max-w-screen-2xl mx-auto px-2 md:px-4 flex flex-wrap md:flex-nowrap items-center justify-between h-auto md:h-16 gap-y-1">
          {/* Logo trái */}
          <div className="flex items-center flex-shrink-0 gap-1 md:gap-3 max-w-[60vw] md:max-w-none">
            <Link to="/" className="flex items-center gap-1 md:gap-2">
              <img src={logo} alt="SIX Cinema Logo" className="h-9 w-9 md:h-11 md:w-11 object-contain border-2 border-[#ff7120] rounded-lg bg-white" />
              {activeSection === 'hero' ? (
                <span className="relative text-base md:text-2xl font-extrabold tracking-tight text-black select-none" style={{letterSpacing:2, marginLeft: '6px'}}>
                  <motion.span
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="absolute -left-2 -top-1 text-[#ff7120] font-extrabold"
                    style={{ fontWeight: 900, fontSize: '1.5rem' }}
                  >
                    ⌜
                  </motion.span>
                  <span className="relative z-10 inline-block">
                    <ScrambleText text="SIX Cinema" triggerKey={activeSection} className="inline-block" />
                  </span>
                  <motion.span
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="absolute -right-2 -bottom-1 text-[#ff7120] font-extrabold"
                    style={{ fontWeight: 900, fontSize: '1.5rem' }}
                  >
                    ⌟
                  </motion.span>
                </span>
              ) : (
                <span className="text-base md:text-2xl font-extrabold tracking-tight text-black select-none" style={{letterSpacing:2, marginLeft: '6px', fontWeight:900}}>
                  SIX Cinema
                </span>
              )}
            </Link>
          </div>
          {/* Menu giữa */}
          <nav
            className={`hidden md:flex flex-1 items-center ${showSearch ? 'justify-start mr-auto scale-75 opacity-50 pointer-events-none' : 'justify-center scale-100 opacity-100'} gap-x-1 transition-all duration-300`}
          >
            <Link
              to="/movies"
              className="px-2 py-2 text-xs font-semibold rounded hover:bg-[#ff7120]/10 transition-colors duration-150"
            >
              {(location.pathname === '/movies' && !moviesStatus) ? (
                <span className="relative">
                  <motion.span
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="absolute -left-2 -top-1 text-[#ff7120] font-extrabold"
                    style={{ fontWeight: 900, fontSize: '2rem' }}
                  >
                    ⌜
                  </motion.span>
                  <span className="relative z-10 inline-block text-xs">
                    <ScrambleText text="Tất Cả Phim" triggerKey={location.pathname} className="inline-block" />
                  </span>
                  <motion.span
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="absolute -right-2 -bottom-1 text-[#ff7120] font-extrabold"
                    style={{ fontWeight: 900, fontSize: '2rem' }}
                  >
                    ⌟
                  </motion.span>
                </span>
              ) : (
                <span className="text-xs">Tất Cả Phim</span>
              )}
            </Link>
            <button type="button" onClick={() => handleMenuClick('now-showing')} className="px-2 py-2 text-xs font-semibold rounded hover:bg-[#ff7120]/10 transition-colors duration-150 bg-transparent border-0 focus:outline-none">
              {isActiveNowShowing ? (
                <span className="relative">
                  <motion.span
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="absolute -left-2 -top-1 text-[#ff7120] font-extrabold"
                    style={{ fontWeight: 900, fontSize: '2rem' }}
                  >
                    ⌜
                  </motion.span>
                  <span className="relative z-10 inline-block text-xs">
                    <ScrambleText text="Phim Đang Chiếu" triggerKey={location.search + activeSection} className="inline-block" />
                  </span>
                  <motion.span
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="absolute -right-2 -bottom-1 text-[#ff7120] font-extrabold"
                    style={{ fontWeight: 900, fontSize: '2rem' }}
                  >
                    ⌟
                  </motion.span>
                </span>
              ) : (
                <span className="text-xs">Phim Đang Chiếu</span>
              )}
            </button>
            <button type="button" onClick={() => handleMenuClick('coming-soon')} className="px-2 py-2 text-xs font-semibold rounded hover:bg-[#ff7120]/10 transition-colors duration-150 bg-transparent border-0 focus:outline-none">
              {isActiveComingSoon ? (
                <span className="relative">
                  <motion.span
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="absolute -left-2 -top-1 text-[#ff7120] font-extrabold"
                    style={{ fontWeight: 900, fontSize: '2rem' }}
                  >
                    ⌜
                  </motion.span>
                  <span className="relative z-10 inline-block text-xs">
                    <ScrambleText text="Phim Sắp Chiếu" triggerKey={location.search + activeSection} className="inline-block" />
                  </span>
                  <motion.span
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="absolute -right-2 -bottom-1 text-[#ff7120] font-extrabold"
                    style={{ fontWeight: 900, fontSize: '2rem' }}
                  >
                    ⌟
                  </motion.span>
                </span>
              ) : (
                <span className="text-xs">Phim Sắp Chiếu</span>
              )}
            </button>
            <button type="button" onClick={() => handleMenuClick('promotion')} className="px-2 py-2 text-xs font-semibold rounded hover:bg-[#ff7120]/10 transition-colors duration-150 bg-transparent border-0 focus:outline-none">
              {activeSection === 'promotion' && location.pathname === '/' ? (
                <span className="relative">
                  <motion.span
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="absolute -left-2 -top-1 text-[#ff7120] font-extrabold"
                    style={{ fontWeight: 900, fontSize: '2rem' }}
                  >
                    ⌜
                  </motion.span>
                  <span className="relative z-10 inline-block text-xs">
                    <ScrambleText text="Khuyến Mãi" triggerKey={activeSection} className="inline-block" />
                  </span>
                  <motion.span
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="absolute -right-2 -bottom-1 text-[#ff7120] font-extrabold"
                    style={{ fontWeight: 900, fontSize: '2rem' }}
                  >
                    ⌟
                  </motion.span>
                </span>
              ) : (
                <span className="text-xs">Khuyến Mãi</span>
              )}
            </button>
            <button type="button" onClick={() => handleMenuClick('about-us')} className="px-2 py-2 text-xs font-semibold rounded hover:bg-[#ff7120]/10 transition-colors duration-150 bg-transparent border-0 focus:outline-none">
              {activeSection === 'about-us' && location.pathname === '/' ? (
                <span className="relative">
                  <motion.span
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="absolute -left-2 -top-1 text-[#ff7120] font-extrabold"
                    style={{ fontWeight: 900, fontSize: '2rem' }}
                  >
                    ⌜
                  </motion.span>
                  <span className="relative z-10 inline-block text-xs">
                    <ScrambleText text="Về Chúng Tôi" triggerKey={activeSection} className="inline-block" />
                  </span>
                  <motion.span
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="absolute -right-2 -bottom-1 text-[#ff7120] font-extrabold"
                    style={{ fontWeight: 900, fontSize: '2rem' }}
                  >
                    ⌟
                  </motion.span>
                </span>
              ) : (
                <span className="text-xs">Về Chúng Tôi</span>
              )}
            </button>
          </nav>
          {/* Nhóm icon phải */}
          <div className="flex items-center gap-1 md:gap-2 ml-1 md:ml-2 flex-wrap">
            {/* Search icon */}
            <div className="relative group flex items-center" ref={searchRef}>
              {showSearch && (
                <input
                  type="text"
                  className="w-36 md:w-52 text-sm md:text-base border border-[#ff7120] rounded-xl px-2 md:px-4 py-2 focus:ring-2 focus:ring-[#ff7120] outline-none bg-white text-black placeholder:text-gray-500 transition-all duration-200 absolute right-10 md:right-12 top-1/2 -translate-y-1/2 shadow-lg z-[9999]"
                  placeholder="Tìm tên phim..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onKeyDown={handleInputKeyDown}
                  autoFocus
                />
              )}
              <button
                className="h-9 w-9 md:h-12 md:w-12 flex items-center justify-center rounded-full hover:bg-[#ff7120]/20 transition-colors"
                onClick={e => { e.stopPropagation(); setShowSearch(prev => !prev); }}
                style={{ zIndex: 52 }}
              >
                <FiSearch size={20} className="md:text-[24px] text-[#00c9a7]" />
              </button>
              {/* Kết quả search */}
              {showSearch && searchResults && searchResults.length > 0 && (
                <>
                  {/* Mobile: full width, top header, responsive */}
                  <div className="fixed left-0 right-0 mx-auto w-[95vw] max-w-xs top-[60px] md:hidden bg-white border-2 border-[#ff7120] rounded-xl shadow-lg z-[9999] p-2">
                    <div className="w-full max-h-80 overflow-y-auto">
                      {searchResults.map((movie) => (
                        <Link
                          key={movie.movieID}
                          to={`/movies/${normalize(movie.title)}`}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-gradient-to-r hover:bg-orange-100 transition rounded-lg"
                          onClick={() => {
                            setShowSearch(false);
                            setSearchValue("");
                            setSearchResults([]);
                          }}
                        >
                          <img src={movie.poster} alt={movie.title} className="w-10 h-14 object-cover rounded shadow border border-orange-200" />
                          <span className="font-semibold text-gray-800 group-hover:text-orange-700 text-base">{movie.title}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                  {/* Desktop/tablet: giữ nguyên vị trí cũ */}
                  <div className="fixed hidden md:block" style={{top: 65, left: 646, width: 320, background: 'white', border: '2px solid #ff7120', borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.18)', zIndex: 9999, padding: 8}}>
                    <div className="w-full max-h-80 overflow-y-auto">
                      {searchResults.map((movie) => (
                        <Link
                          key={movie.movieID}
                          to={`/movies/${normalize(movie.title)}`}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-gradient-to-r hover:bg-orange-100 transition rounded-lg"
                          onClick={() => {
                            setShowSearch(false);
                            setSearchValue("");
                            setSearchResults([]);
                          }}
                        >
                          <img src={movie.poster} alt={movie.title} className="w-10 h-14 object-cover rounded shadow border border-orange-200" />
                          <span className="font-semibold text-gray-800 group-hover:text-orange-700 text-base">{movie.title}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
            {/* Profile/Login */}
            <div className="relative group" ref={menuRef}>
              {isLoggedIn ? (
                <div className="relative flex items-center">
                  <button
                    className="h-9 w-9 md:h-12 md:w-12 flex items-center justify-center rounded-full hover:bg-[#ff7120]/20 transition-colors"
                    onClick={() => setShowUserMenu(!showUserMenu)}
                  >
                    <FiUser size={20} className="md:text-[24px] text-[#ff7120]" />
                  </button>
                  {showUserMenu && (
                    <div className="absolute right-0 top-16 w-48 bg-black/90 rounded-lg shadow-lg py-2 z-[9999]">
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-white hover:bg-orange-600 hover:text-white"
                        onClick={handleProfileClick}
                      >
                        Thông tin cá nhân
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full hover:bg-orange-600 text-left px-4 py-2 text-sm text-white hover:text-white"
                      >
                        Đăng xuất
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="ml-1 md:ml-2 px-3 md:px-6 py-2 bg-[#ff7120] hover:bg-orange-600 text-white font-bold rounded-lg shadow transition-all duration-200 uppercase tracking-wide text-sm md:text-base border-2 border-[#ff7120]"
                  style={{ minWidth: 80 }}
                >
                  Đăng nhập
                </button>
              )}
            </div>
          </div>
        </div>
      </header>
      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={(username) => {
          // setUser(username); // This line is removed as per the new_code
          setShowLoginModal(false);
          // LoginVersionContext đã được trigger trong LoginModal rồi
        }}
      />
    </>
  );
};

export default Header;