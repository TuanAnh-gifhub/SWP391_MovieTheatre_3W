import React, { useEffect, useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getRandomCouponForGame } from '../../../service/minigame';
import ParallaxBackground from '../LandingPage/ParallaxBackground';
import { CiSun } from 'react-icons/ci';
import { FaUserCircle, FaSignInAlt } from 'react-icons/fa';
import LoginModal from '../LoginPage/LoginPage';
import { useAuth } from '../../../context/ScrollspyContext';

const GRID_SIZE = 20;
const INITIAL_SNAKE = [
  { x: 10, y: 10 },
  { x: 9, y: 10 },
  { x: 8, y: 10 }
];
const INITIAL_DIRECTION = { x: 1, y: 0 };
const TARGET_SCORE = 10; // Cần ăn 10 mồi để thành công

const SnakeGame = () => {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [food, setFood] = useState({ x: 15, y: 15 });
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const [coupon, setCoupon] = useState(null);
  const [loadingCoupon, setLoadingCoupon] = useState(false);
  const [isGamePlayed, setIsGamePlayed] = useState(() => localStorage.getItem('isGamePlayed') === 'true');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isEntertainmentMode, setIsEntertainmentMode] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  
  // Dark mode state synced with localStorage
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const stored = localStorage.getItem('landing_dark_mode');
    return stored === 'true';
  });

  // Khởi tạo game mới
  const initGame = (entertainmentMode = false) => {
    setSnake(INITIAL_SNAKE);
    setFood({ x: 15, y: 15 });
    setDirection(INITIAL_DIRECTION);
    setScore(0);
    setGameOver(false);
    setGameWon(false);
    setTimeLeft(60);
    setIsTimerRunning(false); // Không bắt đầu timer ngay
    setIsEntertainmentMode(entertainmentMode);
    setGameStarted(false); // Reset trạng thái bắt đầu
    // Tạo mồi mới
    generateFood();
  };

  // Tạo mồi mới
  const generateFood = () => {
    let newFood;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      };
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    setFood(newFood);
  };

  // Khởi tạo mồi ban đầu
  useEffect(() => {
    generateFood();
  }, []);

  // Bắt đầu game
  const startGame = () => {
    setGameStarted(true);
    setIsTimerRunning(true);
  };

  // Kiểm tra va chạm
  const checkCollision = (head) => {
    // Va chạm với tường
    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
      return true;
    }
    // Va chạm với thân rắn
    return snake.some(segment => segment.x === head.x && segment.y === head.y);
  };

  // Di chuyển rắn
  const moveSnake = () => {
    if (gameOver) return;

    const newSnake = [...snake];
    const head = { ...newSnake[0] };
    head.x += direction.x;
    head.y += direction.y;

    if (checkCollision(head)) {
      setGameOver(true);
      setIsTimerRunning(false);
      return;
    }

    newSnake.unshift(head);

    // Kiểm tra ăn mồi
    if (head.x === food.x && head.y === food.y) {
      setScore(prev => {
        const newScore = prev + 1;
        if (newScore >= TARGET_SCORE && !gameWon) {
          setGameWon(true);
          // KHÔNG dừng timer, cho phép chơi tiếp để xem điểm tối đa
          if (!isEntertainmentMode) {
            handleGameWin();
          }
        }
        return newScore;
      });
      generateFood();
    } else {
      newSnake.pop();
    }

    setSnake(newSnake);
  };

  // Xử lý khi thắng game
  const handleGameWin = async () => {
    if (isEntertainmentMode) return;
    
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
      // KHÔNG hiển thị modal ngay, chỉ lưu coupon để hiển thị sau
    }
  };

  // Xử lý nhận thưởng
  const handleReward = () => {
    localStorage.setItem('isGamePlayed', 'true');
    setIsGamePlayed(true);
    setShowReward(false);
    navigate('/game-selection');
  };

  // Xử lý phím bấm
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (gameOver || !gameStarted) return;

      // Ngăn chặn hành vi mặc định của phím mũi tên
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
      }

      switch (e.key) {
        case 'ArrowUp':
          if (direction.y === 0) setDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
          if (direction.y === 0) setDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
          if (direction.x === 0) setDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
          if (direction.x === 0) setDirection({ x: 1, y: 0 });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [direction, gameOver, gameStarted]);

  // Timer effect
  useEffect(() => {
    let interval = null;
    if (isTimerRunning && timeLeft > 0 && !gameOver && gameStarted) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            setGameOver(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timeLeft, gameOver, gameStarted]);

  // Game loop
  useEffect(() => {
    const gameInterval = setInterval(() => {
      if (!gameOver && isTimerRunning && gameStarted) {
        moveSnake();
      }
    }, 150);

    return () => clearInterval(gameInterval);
  }, [snake, direction, food, gameOver, isTimerRunning, gameStarted]);

  // Khởi tạo game khi component mount
  useEffect(() => {
    if (!isGamePlayed || showReward) {
      initGame(false); // Khởi tạo với chế độ thưởng mặc định
    } else if (isGamePlayed && !isEntertainmentMode) {
      // Nếu đã chơi game nhưng chưa ở chế độ giải trí, hiển thị thông báo
      return;
    } else {
      // Nếu đã chơi game và ở chế độ giải trí, khởi tạo game
      initGame(true);
    }
  }, [isGamePlayed, showReward, isEntertainmentMode]);

  // Hiển thị modal thưởng khi game over và đã thắng
  useEffect(() => {
    if (gameOver && gameWon && coupon && !isEntertainmentMode && !showReward) {
      setTimeout(() => setShowReward(true), 600);
    }
  }, [gameOver, gameWon, coupon, isEntertainmentMode, showReward]);

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
                    <p>✓ Chơi game rắn săn mồi</p>
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

  // Kiểm tra nếu đã chơi game và hiển thị thông báo
  if (isGamePlayed && !showReward && !isEntertainmentMode) {
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
                <div className="text-6xl mb-4">🎮</div>
                <h1 className="text-3xl font-bold text-orange-600 mb-4">Bạn đã hết lượt chơi!</h1>
                <p className="text-gray-700 mb-6">Bạn đã hoàn thành game trong tháng này.</p>
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
                      initGame(true);
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
            {/* Header */}
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-orange-600 mb-2">🐍 Game Rắn Săn Mồi</h1>
              <p className="text-gray-700 mb-3">Điều khiển rắn ăn mồi để tăng điểm!</p>
              
              {/* Game Info */}
              <div className="flex justify-center items-center gap-6 mb-6">
                <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-3 border-2 border-green-200 shadow-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">🎯 Điểm:</span>
                    <span className={`text-lg font-bold ${gameWon ? 'text-green-600' : 'text-green-600'}`}>
                      {score}/{TARGET_SCORE}
                      {gameWon && <span className="text-xs text-green-500 ml-1">(Đã thắng!)</span>}
                    </span>
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

            {/* Game Board */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                {/* Game Board Container */}
                <div className="relative">
                  {/* Background Grid */}
                  <div 
                    className="grid gap-0 border-4 border-orange-400 rounded-xl overflow-hidden bg-gradient-to-br from-green-50 to-blue-50 shadow-2xl"
                    style={{ 
                      gridTemplateColumns: `repeat(${GRID_SIZE}, 20px)`,
                      gridTemplateRows: `repeat(${GRID_SIZE}, 20px)`,
                      width: `${GRID_SIZE * 20 + 8}px`, // Thêm 8px cho border
                      height: `${GRID_SIZE * 20 + 8}px` // Thêm 8px cho border
                    }}
                  >
                    {/* Grid Lines */}
                    {Array.from({ length: GRID_SIZE - 1 }, (_, i) => (
                      <React.Fragment key={i}>
                        <div 
                          className="bg-orange-200 opacity-30"
                          style={{
                            gridColumn: i + 2,
                            gridRow: '1 / -1',
                            width: '1px'
                          }}
                        />
                        <div 
                          className="bg-orange-200 opacity-30"
                          style={{
                            gridColumn: '1 / -1',
                            gridRow: i + 2,
                            height: '1px'
                          }}
                        />
                      </React.Fragment>
                    ))}
                    
                    {/* Food */}
                    <motion.div
                      className="bg-gradient-to-br from-red-400 to-red-600 rounded-md shadow-lg"
                      animate={{ 
                        scale: [1, 1.2, 1],
                        rotate: [0, 180, 360]
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      style={{
                        gridColumn: food.x + 1,
                        gridRow: food.y + 1,
                        border: '2px solid #dc2626'
                      }}
                    />
                    
                    {/* Snake */}
                    {snake.map((segment, index) => {
                      const letters = "SIX CINEMA";
                      const totalLength = letters.length + 2; // Thêm 2 khoảng trống
                      const adjustedIndex = index % totalLength;
                      
                      let letter = "";
                      let showLetter = true;
                      let isFirstS = false;
                      
                      if (adjustedIndex < letters.length) {
                        letter = letters[adjustedIndex];
                        // Kiểm tra nếu là chữ S đầu tiên của mỗi chu kỳ
                        isFirstS = (adjustedIndex === 0);
                      } else {
                        // Khoảng trống sau "SIX CINEMA"
                        showLetter = false;
                      }
                      
                      return (
                        <motion.div
                          key={index}
                          className={`rounded-md shadow-md flex items-center justify-center font-bold text-xs ${
                            index === 0 
                              ? 'bg-gradient-to-br from-green-500 to-green-700 border-2 border-green-300' 
                              : 'bg-gradient-to-br from-green-400 to-green-600 border border-green-300'
                          }`}
                          animate={{ 
                            scale: index === 0 ? [1, 1.1, 1] : 1
                          }}
                          transition={{ 
                            duration: 0.5,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                          style={{
                            gridColumn: segment.x + 1,
                            gridRow: segment.y + 1,
                          }}
                        >
                          {showLetter && (
                            <span className={isFirstS ? 'text-orange-400' : 'text-white'}>
                              {letter}
                            </span>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                  
                  {/* Game Border Glow Effect */}
                  <div 
                    className="absolute inset-0 rounded-xl border-4 border-orange-300 opacity-50"
                    style={{
                      boxShadow: '0 0 20px rgba(251, 146, 60, 0.5)',
                      animation: 'pulse 2s infinite'
                    }}
                  />
                </div>
                
                {/* Start Game Overlay */}
                {!gameStarted && !gameOver && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center rounded-xl">
                    <motion.div 
                      className="bg-gradient-to-br from-white to-orange-50 rounded-2xl p-6 text-center shadow-2xl border-2 border-orange-200"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <motion.div 
                        className="text-6xl mb-4"
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        🐍
                      </motion.div>
                      <h3 className="text-2xl font-bold mb-3 text-orange-600">Sẵn sàng chơi!</h3>
                      <p className="text-base mb-4 text-gray-700">
                        Ăn <span className="font-bold text-red-600">{TARGET_SCORE} mồi</span> trong <span className="font-bold text-blue-600">60 giây</span> để thắng!
                      </p>
                      <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg p-4 mb-4 border border-orange-200">
                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <span className="text-orange-500">⬆️</span>
                            <span>Sử dụng phím mũi tên để điều khiển</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-red-500">⚠️</span>
                            <span>Tránh va chạm với tường và thân rắn</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-green-500">🍎</span>
                            <span>Ăn mồi đỏ để tăng điểm</span>
                          </div>
                        </div>
                      </div>
                      <motion.button
                        onClick={startGame}
                        className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8 py-3 rounded-xl text-lg font-bold shadow-lg transform hover:scale-105 transition-all duration-200"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        🎮 Bắt đầu chơi!
                      </motion.button>
                    </motion.div>
                  </div>
                )}
                
                {/* Game Over/Win Overlay */}
                {gameOver && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center rounded-xl">
                    <motion.div 
                      className="bg-gradient-to-br from-white to-orange-50 rounded-2xl p-6 text-center shadow-2xl border-2 border-orange-200"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <motion.div 
                        className="text-6xl mb-4"
                        animate={{ 
                          scale: [1, 1.2, 1],
                          rotate: gameWon ? [0, 10, -10, 0] : [0, -5, 5, 0]
                        }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        {gameWon ? '🎉' : '💀'}
                      </motion.div>
                      <h3 className="text-2xl font-bold mb-3">
                        {gameWon ? 'Chúc mừng!' : 'Game Over!'}
                      </h3>
                      <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg p-4 mb-4 border border-orange-200">
                        <p className="text-lg font-semibold text-gray-700">
                          {gameWon 
                            ? `Điểm tối đa: ${score} (Đã thắng!)` 
                            : `Điểm cuối: ${score}`
                          }
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {gameWon ? 'Bạn đã hoàn thành xuất sắc!' : 'Hãy thử lại lần sau!'}
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <motion.button
                          onClick={() => initGame(isEntertainmentMode)}
                          className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-2 rounded-xl text-sm font-bold shadow-lg"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          🔄 Chơi lại
                        </motion.button>
                        <motion.button
                          onClick={() => navigate('/game-selection')}
                          className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-6 py-2 rounded-xl text-sm font-bold shadow-lg"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                           Quay lại
                        </motion.button>
                      </div>
                    </motion.div>
                  </div>
                )}
              </div>
            </div>

            {/* Instructions */}
            <div className="text-center mb-6">
              {gameStarted ? (
                <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-4 border-2 border-orange-200 shadow-lg">
                  <div className="space-y-2 text-sm text-gray-700">
                    <p className="flex items-center justify-center gap-2">
                      <span className="text-orange-500">⬆️</span>
                      <span>Sử dụng phím mũi tên để điều khiển rắn</span>
                    </p>
                    <p className="flex items-center justify-center gap-2">
                      <span className="text-red-500">🍎</span>
                      <span>Ăn {TARGET_SCORE} mồi trong 60 giây để thắng!</span>
                    </p>
                    {gameWon && (
                      <p className="text-green-600 font-semibold flex items-center justify-center gap-2">
                        <span>🎉</span>
                        <span>Đã đạt mục tiêu! Chơi tiếp để xem điểm tối đa!</span>
                      </p>
                    )}
                    {isEntertainmentMode && !gameWon && (
                      <p className="text-green-600 font-semibold flex items-center justify-center gap-2">
                        <span>🎮</span>
                        <span>Chế độ giải trí - Không có thưởng</span>
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 border-2 border-blue-200 shadow-lg">
                  <p className="text-blue-600 font-semibold flex items-center justify-center gap-2">
                    <span>🎮</span>
                    <span>Nhấn "Bắt đầu chơi!" để bắt đầu game</span>
                  </p>
                </div>
              )}
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
                    initGame(true);
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
                        ? 'Bạn đã hoàn thành game rắn săn mồi trong chế độ giải trí!' 
                        : 'Bạn đã hoàn thành game rắn săn mồi!'
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

export default SnakeGame; 