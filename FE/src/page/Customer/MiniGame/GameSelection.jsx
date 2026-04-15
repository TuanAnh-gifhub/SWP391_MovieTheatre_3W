import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ParallaxBackground from '../LandingPage/ParallaxBackground';
import { CiSun } from 'react-icons/ci';
import { FaUserCircle, FaSignInAlt } from 'react-icons/fa';
import LoginModal from '../LoginPage/LoginPage';
import { useAuth } from '../../../context/ScrollspyContext';

const GameSelection = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  
  // Dark mode state synced with localStorage
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const stored = localStorage.getItem('landing_dark_mode');
    return stored === 'true';
  });

  // Kiểm tra trạng thái đã chơi game
  const isGamePlayed = localStorage.getItem('isGamePlayed') === 'true';
  const isAnyGamePlayed = isGamePlayed;

  // Kiểm tra nếu chưa đăng nhập
  if (!isLoggedIn) {
    return (
      <div className="relative min-h-screen w-full font-sans" style={{ fontFamily: 'Inter, Montserrat, Roboto, Arial, sans-serif' }}>
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
        <ParallaxBackground isDarkMode={isDarkMode} />
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
                    <p>✓ Chơi game xếp hình</p>
                    <p>✓ Chơi game rắn săn mồi</p>
                    <p>✓ Nhận mã giảm giá hấp dẫn</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/')}
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
        {showLoginModal && (
          <LoginModal
            isOpen={showLoginModal}
            onClose={() => setShowLoginModal(false)}
            onLoginSuccess={(username) => {
              setShowLoginModal(false);
            }}
          />
        )}
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full font-sans" style={{ fontFamily: 'Inter, Montserrat, Roboto, Arial, sans-serif' }}>
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
      <ParallaxBackground isDarkMode={isDarkMode} />
      <div className="relative z-10 px-1 py-4">
        <div className="flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-4 relative overflow-hidden">
            {/* Header */}
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-orange-600 mb-2">🎮 Chọn Mini Game</h1>
              <p className="text-gray-600 mb-3">Chọn một trong hai game để chơi và nhận thưởng!</p>
              
              {/* Game Status */}
              {isAnyGamePlayed && (
                <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-3 mb-4">
                  <p className="text-base font-semibold text-orange-600 mb-1">Thông báo quan trọng!</p>
                  <p className="text-xs text-gray-600 mb-1">
                    Bạn đã hoàn thành game trong tháng này. Bạn có thể chơi để giải trí mà không nhận thưởng.
                  </p>
                  <div className="text-xs text-gray-500">
                    <p>✓ Trạng thái game: {isGamePlayed ? 'Đã hoàn thành' : 'Chưa chơi'}</p>
                  </div>
                </div>
              )}
            </div>

                        {/* Game Cards */}
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              {/* Puzzle Game Card */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-gradient-to-br from-orange-50 to-yellow-50 border-2 border-orange-200 rounded-xl p-4 cursor-pointer"
                onClick={() => navigate('/minigame')}
              >
                <div className="text-center">
                  <div className="text-4xl mb-2">🧩</div>
                  <h3 className="text-lg font-bold text-orange-600 mb-1">Game Xếp Hình</h3>
                  <p className="text-xs text-gray-600 mb-2">
                    Xếp các mảnh ghép lại thành poster phim hoàn chỉnh trong 60 giây!
                  </p>
                  <div className="space-y-1 text-xs text-gray-500 mb-2">
                    <p>✓ Xếp hình 3x3</p>
                    <p>✓ Kéo thả hoặc click để hoán đổi</p>
                    <p>✓ Thời gian: 60 giây</p>
                    <p>✓ Thưởng: Mã giảm giá</p>
                  </div>
                  <div className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                    isGamePlayed 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-orange-100 text-orange-700'
                  }`}>
                    {isGamePlayed ? 'Đã hoàn thành' : 'Chưa chơi'}
                  </div>
                </div>
              </motion.div>

              {/* Snake Game Card */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-200 rounded-xl p-4 cursor-pointer"
                onClick={() => navigate('/snakegame')}
              >
                <div className="text-center">
                  <div className="text-4xl mb-2">🐍</div>
                  <h3 className="text-lg font-bold text-green-600 mb-1">Game Rắn Săn Mồi</h3>
                  <p className="text-xs text-gray-600 mb-2">
                    Điều khiển rắn ăn mồi để tăng điểm trong 60 giây!
                  </p>
                  <div className="space-y-1 text-xs text-gray-500 mb-2">
                    <p>✓ Điều khiển bằng phím mũi tên</p>
                    <p>✓ Ăn 10 mồi để thắng</p>
                    <p>✓ Thời gian: 60 giây</p>
                    <p>✓ Thưởng: Mã giảm giá</p>
                  </div>
                  <div className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                    isGamePlayed 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-orange-100 text-orange-700'
                  }`}>
                    {isGamePlayed ? 'Đã hoàn thành' : 'Chưa chơi'}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-6">
              <h4 className="text-lg font-semibold text-blue-600 mb-2">📋 Hướng dẫn</h4>
              <div className="text-sm text-gray-700 space-y-1">
                <p>• Mỗi tháng bạn chỉ có thể nhận thưởng từ một game</p>
                <p>• Sau khi hoàn thành game, bạn có thể chơi để giải trí</p>
                <p>• Sử dụng phím mũi tên để điều khiển game rắn</p>
                <p>• Click hoặc kéo thả để xếp hình</p>
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex justify-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/')}
                className="bg-gray-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg"
              >
                Quay lại trang chủ
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameSelection; 