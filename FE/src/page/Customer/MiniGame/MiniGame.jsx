import React, { useEffect, useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getAllMovies } from '../../../service/landingpage';
import { getRandomCouponForGame } from '../../../service/minigame';
import ParallaxBackground from '../LandingPage/ParallaxBackground';
import { CiSun } from 'react-icons/ci';
import { FaUserCircle, FaSignInAlt } from 'react-icons/fa';
import LoginModal from '../LoginPage/LoginPage';
import { useAuth } from '../../../context/ScrollspyContext';

const GRID_SIZE = 3; // 3x3 puzzle

function shuffleArray(array) {
  // Fisher-Yates shuffle
  const arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function isSolved(pieces) {
  return pieces.every((piece, idx) => piece === idx);
}

const MiniGame = () => {
  const [poster, setPoster] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pieces, setPieces] = useState([]); // array of indices
  const [selected, setSelected] = useState(null); // index of selected piece
  const [solved, setSolved] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const [coupon, setCoupon] = useState(null);
  const [loadingCoupon, setLoadingCoupon] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [draggedPiece, setDraggedPiece] = useState(null); // index of dragged piece
  const [dragOverPiece, setDragOverPiece] = useState(null); // index of piece being dragged over
  const [isGamePlayed, setIsGamePlayed] = useState(() => localStorage.getItem('isGamePlayed') === 'true');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isEntertainmentMode, setIsEntertainmentMode] = useState(false);
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  
  // Dark mode state synced with localStorage (like ProfilePage)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const stored = localStorage.getItem('landing_dark_mode');
    return stored === 'true';
  });

  // Lấy random poster phim từ API (giống HeroSection)
  const loadNewPoster = (entertainmentMode = false) => {
    setLoading(true);
    setTimeLeft(60);
    setIsTimerRunning(false);
    setSolved(false);
    setSelected(null);
    setPieces([]);
    setAttempts(prev => prev + 1);
    setDraggedPiece(null);
    setDragOverPiece(null);
    setIsEntertainmentMode(entertainmentMode);
    
    getAllMovies().then(res => {
      let posters = [];
      if (res && Array.isArray(res.result)) {
        posters = res.result.map(m => m.poster).filter(Boolean);
      }
      if (posters.length > 0) {
        const randomPoster = posters[Math.floor(Math.random() * posters.length)];
        setPoster(randomPoster);
      }
      setLoading(false);
    });
  };

  useEffect(() => {
    loadNewPoster(false); // Khởi tạo với chế độ thưởng mặc định
  }, []);

  // Khởi tạo mảng pieces (0..8), xáo trộn
  useEffect(() => {
    if (poster) {
      let arr = Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, i) => i);
      let shuffled = shuffleArray(arr);
      // Đảm bảo không phải đã đúng luôn
      while (isSolved(shuffled)) {
        shuffled = shuffleArray(arr);
      }
      setPieces(shuffled);
      setSolved(false);
      setSelected(null);
      setDraggedPiece(null);
      setDragOverPiece(null);
      // Bắt đầu timer khi puzzle được tạo
      setTimeLeft(60);
      setIsTimerRunning(true);
    }
  }, [poster]);

  // Timer effect
  useEffect(() => {
    let interval = null;
    if (isTimerRunning && timeLeft > 0 && !solved) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // Hết thời gian, chuyển sang poster mới (không gọi API vì thất bại)
            setIsTimerRunning(false);
            loadNewPoster();
            return 60;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timeLeft, solved]);

  // Xử lý click vào mảnh (logic cũ)
  const handleClick = async (idx) => {
    if (solved || timeLeft <= 0) return;
    if (selected === null) {
      setSelected(idx);
    } else if (selected === idx) {
      setSelected(null);
    } else {
      // Hoán đổi 2 mảnh
      const newPieces = pieces.slice();
      [newPieces[selected], newPieces[idx]] = [newPieces[idx], newPieces[selected]];
      setPieces(newPieces);
      setSelected(null);
      await checkSolved(newPieces);
    }
  };

  // Xử lý drag start
  const handleDragStart = (e, idx) => {
    if (solved || timeLeft <= 0) {
      e.preventDefault();
      return;
    }
    setDraggedPiece(idx);
    setSelected(null); // Clear selection when dragging
  };

  // Xử lý drag over
  const handleDragOver = (e, idx) => {
    e.preventDefault();
    if (draggedPiece !== null && draggedPiece !== idx) {
      setDragOverPiece(idx);
    }
  };

  // Xử lý drag leave
  const handleDragLeave = (e) => {
    setDragOverPiece(null);
  };

  // Xử lý drop
  const handleDrop = async (e, idx) => {
    e.preventDefault();
    if (draggedPiece !== null && draggedPiece !== idx) {
      // Hoán đổi 2 mảnh
      const newPieces = pieces.slice();
      [newPieces[draggedPiece], newPieces[idx]] = [newPieces[idx], newPieces[draggedPiece]];
      setPieces(newPieces);
      await checkSolved(newPieces);
    }
    setDraggedPiece(null);
    setDragOverPiece(null);
  };

  // Kiểm tra đã giải xong chưa
  const checkSolved = async (newPieces) => {
    if (isSolved(newPieces)) {
      setSolved(true);
      setIsTimerRunning(false);
      
      // Chỉ gọi API khi không ở chế độ giải trí
      if (!isEntertainmentMode) {
        setLoadingCoupon(true);
        try {
          // Lấy customerId từ localStorage cho đồng bộ với các service khác
          const customerId = localStorage.getItem('id');
          if (customerId) {
            const couponResponse = await getRandomCouponForGame(customerId);
            if (couponResponse && couponResponse.status === 200) {
              setCoupon(couponResponse.result);
              // KHÔNG cập nhật isGamePlayed ở đây, chỉ cập nhật khi user bấm "Quay lại trang chủ"
            }
          } else {
            console.error("Customer ID not found");
          }
        } catch (error) {
          console.error("Error getting coupon:", error);
        } finally {
          setLoadingCoupon(false);
          setTimeout(() => setShowReward(true), 600);
        }
      } else {
        // Chế độ giải trí - chỉ hiển thị thông báo thành công
        setTimeout(() => setShowReward(true), 600);
      }
    }
  };

  const handleReward = () => {
    // Cập nhật trạng thái đã chơi game khi user bấm "Quay lại trang chủ"
    localStorage.setItem('isGamePlayed', 'true');
    setIsGamePlayed(true);
    setShowReward(false);
    navigate('/game-selection');
  };

  // Tính toán style cho từng mảnh
  const getPieceStyle = (pieceIdx) => {
    const row = Math.floor(pieceIdx / GRID_SIZE);
    const col = pieceIdx % GRID_SIZE;
    const percent = 100 / (GRID_SIZE - 1);
    return {
      backgroundImage: `url(${poster})`,
      backgroundSize: `${GRID_SIZE * 100}% ${GRID_SIZE * 100}%`,
      backgroundPosition: `${col * percent}% ${row * percent}%`,
      border: '1.5px solid #fff',
      cursor: solved ? 'default' : 'pointer',
      transition: 'transform 0.2s',
    };
  };

  // Kiểm tra nếu chưa đăng nhập
  if (!isLoggedIn) {
    return (
      <div className="relative min-h-screen w-full font-sans" style={{ fontFamily: 'Inter, Montserrat, Roboto, Arial, sans-serif' }}>
        {/* Nút chuyển chế độ sáng/tối */}
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
        {/* Lớp phủ hiệu ứng */}
        <ParallaxBackground isDarkMode={isDarkMode} />
        {/* Main content */}
        <div className="relative z-10 px-1 py-4">
          <div className="flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-6 relative overflow-hidden">
              <div className="text-center">
                <div className="text-6xl mb-4">🔐</div>
                <h1 className="text-3xl font-bold text-orange-600 mb-4">Vui lòng đăng nhập!</h1>
                <p className="text-gray-700 mb-6">Bạn cần đăng nhập để chơi mini game và nhận thưởng.</p>
                <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-center mb-3">
                    <FaUserCircle className="text-4xl text-orange-500 mr-3" />
                    <div className="text-left">
                      <p className="text-lg font-semibold text-orange-600">Chưa đăng nhập</p>
                      <p className="text-sm text-gray-600">Đăng nhập để mở khóa mini game</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>✓ Chơi mini game xếp hình</p>
                    <p>✓ Nhận mã giảm giá hấp dẫn</p>
                    
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/game-selection')}
                    className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center"
                  >
                    <span>Quay lại trang chủ</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowLoginModal(true)}
                    className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center"
                  >
                    <FaSignInAlt className="mr-2" />
                    <span>Đăng nhập ngay</span>
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Login Modal */}
        {showLoginModal && (
          <LoginModal
            isOpen={showLoginModal}
            onClose={() => setShowLoginModal(false)}
            onLoginSuccess={(username) => {
              setShowLoginModal(false);
              // Không cần reload trang nữa, chỉ cần đóng modal
              // Trạng thái đăng nhập sẽ được cập nhật tự động qua AuthContext
            }}
          />
        )}
      </div>
    );
  }

  // Kiểm tra nếu đã chơi game và hiển thị thông báo
  if (isGamePlayed && !showReward && !isEntertainmentMode) {
    return (
      <div className="relative min-h-screen w-full font-sans" style={{ fontFamily: 'Inter, Montserrat, Roboto, Arial, sans-serif' }}>
        {/* Nút chuyển chế độ sáng/tối */}
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
        {/* Lớp phủ hiệu ứng */}
        <ParallaxBackground isDarkMode={isDarkMode} />
        {/* Main content */}
        <div className="relative z-10 px-1 py-4">
          <div className="flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-6 relative overflow-hidden">
              <div className="text-center">
                <div className="text-6xl mb-4">🎮</div>
                <h1 className="text-3xl font-bold text-orange-600 mb-4">Bạn đã hết lượt chơi!</h1>
                <p className="text-gray-700 mb-6">Bạn đã hoàn thành mini game trong tháng này.</p>
                <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4 mb-6">
                  <p className="text-lg font-semibold text-orange-600">Số lượt chơi còn lại: <span className="text-2xl font-bold">0</span></p>
                  <p className="text-sm text-gray-600 mt-2">Vui lòng quay lại vào tháng sau để chơi tiếp!</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/game-selection')}
                    className="bg-gray-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg"
                  >
                    Quay lại chọn game
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setIsEntertainmentMode(true);
                      loadNewPoster(true);
                    }}
                    className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg"
                  >
                    Chơi giải trí
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full font-sans" style={{ fontFamily: 'Inter, Montserrat, Roboto, Arial, sans-serif' }}>
      {/* Nút chuyển chế độ sáng/tối giống ProfilePage */}
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
        <div className="flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-6 relative overflow-hidden">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-orange-600 mb-2">🧩 Game Xếp Hình</h1>
          <p className="text-gray-700 mb-3">Xếp các mảnh ghép lại thành poster phim hoàn chỉnh!</p>
          
          {/* Game Info */}
          <div className="flex justify-center items-center gap-6 mb-6">
            <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-3 border-2 border-green-200 shadow-lg">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">🎯 Lần thử:</span>
                <span className="text-lg font-bold text-green-600">{attempts}</span>
              </div>
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-3 border-2 border-blue-200 shadow-lg">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">⏰ Thời gian:</span>
                <span className={`text-lg font-bold ${
                  timeLeft <= 10 
                    ? 'text-red-600 animate-pulse' 
                    : timeLeft <= 30 
                      ? 'text-orange-500' 
                      : 'text-blue-600'
                }`}>
                  {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                </span>
              </div>
            </div>
            <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-3 border-2 border-orange-200 shadow-lg">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">🎮 Chế độ:</span>
                <span className={`text-lg font-bold ${isEntertainmentMode ? 'text-green-600' : 'text-orange-600'}`}>
                  {isEntertainmentMode ? 'Giải trí' : 'Thưởng'}
                </span>
              </div>
            </div>
          </div>
        </div>
        {/* Puzzle Area with Reference Image */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-6 my-4">
          {/* Reference Image */}
          <div className="flex flex-col items-center">
            <h3 className="text-lg font-semibold text-orange-600 mb-2">Hình gốc</h3>
            <div className="w-32 h-48 rounded-lg overflow-hidden border-2 border-orange-300 shadow-lg">
              {loading ? (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">Đang tải...</div>
              ) : poster ? (
                <img 
                  src={poster} 
                  alt="Hình gốc" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">Không có ảnh</div>
              )}
            </div>
          </div>

          {/* Puzzle */}
          <div className="flex flex-col items-center">
            <h3 className="text-lg font-semibold text-orange-600 mb-2">Xếp hình</h3>
            <div className="relative" style={{ width: 300, height: 300 }}>
              {loading ? (
                <div className="w-full h-full flex items-center justify-center text-gray-400">Đang tải poster...</div>
              ) : poster ? (
                <div
                  className="grid grid-cols-3 grid-rows-3 gap-0 w-full h-full rounded-xl overflow-hidden border-2 border-orange-300 bg-gray-200"
                  style={{ width: 300, height: 300 }}
                >
                  {pieces.map((piece, idx) => (
                    <motion.div
                      key={idx}
                      className="w-full h-full aspect-square select-none"
                      animate={{ 
                        scale: selected === idx ? 1.08 : draggedPiece === idx ? 1.1 : 1,
                        opacity: draggedPiece === idx ? 0.8 : 1,
                        zIndex: draggedPiece === idx ? 10 : 1
                      }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      onClick={() => handleClick(idx)}
                      draggable={!solved && timeLeft > 0}
                      onDragStart={(e) => handleDragStart(e, idx)}
                      onDragOver={(e) => handleDragOver(e, idx)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, idx)}
                      whileHover={!solved && timeLeft > 0 ? { scale: 1.05 } : {}}
                      whileTap={!solved && timeLeft > 0 ? { scale: 0.95 } : {}}
                      style={{
                        ...getPieceStyle(piece),
                        cursor: solved ? 'default' : 'grab',
                        border: dragOverPiece === idx ? '2px solid #f97316' : '1.5px solid #fff',
                        backgroundColor: dragOverPiece === idx ? 'rgba(249, 115, 22, 0.1)' : 'transparent',
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">Không tìm thấy poster phim.</div>
              )}
            </div>
          </div>
        </div>
        {/* Instructions */}
        <div className="text-center mb-6">
          <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-4 border-2 border-orange-200 shadow-lg">
            <div className="space-y-2 text-sm text-gray-700">
              <p className="flex items-center justify-center gap-2">
                <span className="text-orange-500">🧩</span>
                <span>Chọn 2 mảnh để hoán đổi vị trí hoặc kéo thả mảnh vào vị trí khác</span>
              </p>
              <p className="flex items-center justify-center gap-2">
                <span className="text-red-500">⏰</span>
                <span>Hoàn thành hình trong 60 giây để nhận thưởng!</span>
              </p>
              {isEntertainmentMode && (
                <p className="text-green-600 font-semibold flex items-center justify-center gap-2">
                  <span>🎮</span>
                  <span>Chế độ giải trí - Không có thưởng</span>
                </p>
              )}
            </div>
          </div>
        </div>
        {/* Control Buttons */}
        <div className="flex justify-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/game-selection')}
            className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg"
          >
             Quay lại
          </motion.button>
          {isGamePlayed && !isEntertainmentMode && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setIsEntertainmentMode(true);
                loadNewPoster(true);
              }}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg"
            >
              🎮 Chơi giải trí
            </motion.button>
          )}
        </div>
        {/* Reward Modal */}
        <AnimatePresence>
          {showReward && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 pt-20"
              onClick={handleReward}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="bg-white rounded-2xl p-6 max-w-2xl mx-4 text-center"
                onClick={e => e.stopPropagation()}
              >
                <div className="text-5xl mb-3">🎉</div>
                <h3 className="text-xl font-bold text-orange-600 mb-2">Chúc mừng!</h3>
                <p className="text-base text-gray-700 mb-3">
                  {isEntertainmentMode 
                    ? 'Bạn đã hoàn thành poster phim trong chế độ giải trí!' 
                    : 'Bạn đã hoàn thành poster phim!'
                  }
                </p>
                
                {!isEntertainmentMode ? (
                  loadingCoupon ? (
                    <div className="flex items-center justify-center mb-3">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-500"></div>
                      <span className="ml-2 text-gray-600 text-sm">Đang tải mã giảm giá...</span>
                    </div>
                  ) : coupon ? (
                    <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border-2 border-orange-200 rounded-lg p-3 mb-3">
                      <h4 className="text-base font-bold text-orange-600 mb-2">{coupon.name}</h4>
                      <div className="bg-white border-2 border-orange-300 rounded-lg p-2 mb-2">
                        <p className="text-xs text-gray-600 mb-1">Mã giảm giá:</p>
                        <p className="text-xl font-bold text-orange-600 tracking-wider">{coupon.code}</p>
                      </div>
                      <div className="text-xs text-gray-600 space-y-1">
                        <p>Giảm {coupon.discountValue}{coupon.discountType === 'PERCENTAGE' ? '%' : 'đ'} cho đơn hàng</p>
                        <p>Còn lại: {coupon.usageLimit - coupon.usedCount} lượt sử dụng</p>
                        <p>Hết hạn: {new Date(coupon.expirationDate).toLocaleDateString('vi-VN')}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-100 rounded-lg p-3 mb-3">
                      <p className="text-gray-600 text-sm">Không thể tải mã giảm giá. Vui lòng thử lại sau.</p>
                    </div>
                  )
                ) : (
                  <div className="bg-green-50 border-2 border-green-200 rounded-lg p-3 mb-3">
                    <p className="text-green-600 text-sm font-semibold">Chế độ giải trí - Không có thưởng</p>
                    <p className="text-gray-600 text-xs mt-1">Bạn có thể chơi lại để cải thiện kỹ năng!</p>
                  </div>
                )}
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleReward}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-5 rounded-lg text-sm"
                >
                  Quay lại trang chủ
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MiniGame; 