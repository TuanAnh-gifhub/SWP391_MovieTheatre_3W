import React from "react";

const balloons = Array.from({ length: 8 });

const Gratitude = ({ fullName, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center">
    <div
      className="bg-gradient-to-br from-yellow-50 via-pink-50 to-blue-50 rounded-xl shadow-2xl p-8 flex flex-col items-center relative overflow-hidden border-4 border-amber-300"
      style={{ minWidth: 340, minHeight: 380 }}
    >
      {/* Balloons */}
      {balloons.map((_, i) => (
        <div
          key={i}
          className="absolute balloon"
          style={{
            left: `${10 + i * 10}%`,
            bottom: 0,
            animationDelay: `${i * 0.3}s`,
            background: [
              "#fbbf24",
              "#f472b6",
              "#38bdf8",
              "#a78bfa",
              "#f59e42",
              "#4ade80",
              "#f87171",
              "#818cf8",
            ][i % 8],
          }}
        />
      ))}
      {/* Confetti */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="confetti"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random()}s`,
              background: [
                "#fbbf24",
                "#f472b6",
                "#38bdf8",
                "#a78bfa",
                "#f59e42",
                "#4ade80",
                "#f87171",
                "#818cf8",
              ][i % 8],
            }}
          />
        ))}
      </div>
      <h2 className="text-3xl font-extrabold text-amber-600 mt-24 mb-2 z-10 drop-shadow-lg">
        🎉 Chúc mừng sinh nhật! 🎉
      </h2>
      <p className="text-lg text-pink-700 mb-2 z-10 font-semibold text-center">
        {fullName
          ? `Chúc ${fullName} có một ngày sinh nhật thật vui vẻ!`
          : "Chúc bạn sinh nhật vui vẻ!"}
      </p>
      <span className="text-xl text-blue-400 z-10 mb-4">🎂 🎉 🎁</span>
      {/* Button đóng ở cuối, căn giữa */}
      <div className="w-full flex justify-center mt-6 z-10">
        <button
          className="px-6 py-2 rounded-full bg-gradient-to-r from-pink-500 to-blue-500 text-black font-bold shadow-lg hover:scale-105 transition-all text-lg"
          onClick={onClose}
        >
          Đóng
        </button>
      </div>
      {/* Custom CSS */}
      <style>{`
        .balloon {
          width: 32px;
          height: 44px;
          border-radius: 16px 16px 16px 16px / 22px 22px 22px 22px;
          position: absolute;
          animation: balloonUp 2.8s ease-in-out infinite;
          opacity: 0.85;
          z-index: 5;
        }
        @keyframes balloonUp {
          0% { transform: translateY(60px) scale(1); opacity: 0.7;}
          30% { opacity: 1;}
          80% { transform: translateY(-180px) scale(1.1);}
          100% { transform: translateY(-220px) scale(1.05); opacity: 0;}
        }
        .confetti {
          position: absolute;
          top: 0;
          width: 8px;
          height: 18px;
          border-radius: 2px;
          opacity: 0.8;
          animation: confettiDown 1.6s linear infinite;
        }
        @keyframes confettiDown {
          0% { transform: translateY(-10px) rotate(0deg);}
          80% { opacity: 1;}
          100% { transform: translateY(220px) rotate(360deg); opacity: 0;}
        }
      `}</style>
    </div>
  </div>
);

export default Gratitude;