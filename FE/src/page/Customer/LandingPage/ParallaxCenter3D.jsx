import React, { useEffect, useState } from "react";

const ROBOT_VIDEO = "https://chaingpt-web.s3.us-east-2.amazonaws.com/assets/video/Labs/LABS_robot_CHROME_VP9.webm";
const COIN_VIDEO = "https://chaingpt-web.s3.us-east-2.amazonaws.com/assets/video/Labs/LABS_coin_CHROME_VP9.webm";

const HEADER_HEIGHT =66; // px, adjust if your header is taller/shorter
const BASE_WIDTH = 280;
const BASE_HEIGHT = 500;

function ParallaxCenter3D() {
  const [progress, setProgress] = useState(0); // 0: đầu trang, 1: cuối trang
  const [container, setContainer] = useState({ width: BASE_WIDTH, height: BASE_HEIGHT, scale: 1, top: 0 });

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const p = Math.min(1, Math.max(0, scrollTop / docHeight));
      setProgress(p);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Responsive glass size/position
  useEffect(() => {
    function updateContainer() {
      const winH = window.innerHeight;
      const availH = winH - HEADER_HEIGHT;
      let scale = 1;
      if (availH < BASE_HEIGHT) {
        scale = availH / BASE_HEIGHT;
      }
      const height = BASE_HEIGHT * scale;
      const width = BASE_WIDTH * scale;
      // Center vertically in available area
      const top = HEADER_HEIGHT + availH / 2;
      setContainer({ width, height, scale, top });
    }
    updateContainer();
    window.addEventListener('resize', updateContainer);
    return () => window.removeEventListener('resize', updateContainer);
  }, []);

  // Tính toán style cho robot và coin dựa trên progress
  // 0-0.25: robot ở giữa, coin ẩn
  // 0.25-0.35: robot khuất hẳn vào nắp lồng kính
  // 0.35-1: coin xuất hiện từ đáy lồng kính và bay vào giữa
  const robotStyle = {
    position: "absolute",
    left: 0,
    top: 0,
    width: `${container.width}px`,
    height: `${container.height}px`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
    opacity: progress < 0.25 ? 1 : 0,
    transform: `translateY(${progress < 0.25 ? 0 : -300 * container.scale}px)`,
    transition: "opacity 0.3s, transform 0.3s"
  };

  const coinStyle = {
    position: "absolute",
    left: 0,
    top: 0,
    width: `${container.width}px`,
    height: `${container.height}px`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
    opacity: progress > 0.35 ? 1 : 0,
    transform: `translateY(${progress < 0.35 ? 300 * container.scale : 0}px)`,
    transition: "opacity 0.3s, transform 0.3s"
  };

  return (
    <div
      style={{
        position: "fixed",
        left: "50%",
        top: `${container.top}px`,
        width: `${container.width}px`,
        height: `${container.height}px`,
        transform: "translate(-50%, -50%)",
        zIndex: 10,
        pointerEvents: "none",
        willChange: "top, width, height, transform"
      }}
      aria-hidden="true"
    >
      {/* Lồng kính SVG giữ nguyên, scale nếu cần */}
      <svg
        width={container.width}
        height={container.height}
        viewBox={`0 0 ${BASE_WIDTH} ${BASE_HEIGHT}`}
        style={{ position: 'absolute', left: 0, top: 0, zIndex: 1, pointerEvents: 'none', width: '100%', height: '100%' }}
      >
        {/* Base dưới */}
        <ellipse cx="140" cy="470" rx="110" ry="18" fill="#f5f5f5" stroke="#e0e0e0" strokeWidth="2" />
        <rect x="40" y="420" width="200" height="50" rx="28" fill="#ededed" stroke="#e0e0e0" strokeWidth="2" />
        <ellipse cx="140" cy="420" rx="110" ry="28" fill="#fff" stroke="#e0e0e0" strokeWidth="1.5" />
        {/* Viền cam dưới */}
        <ellipse cx="140" cy="410" rx="100" ry="7" fill="#ff7120" opacity="0.7" />
        {/* Thân ống: chỉ còn viền, không fill */}
        <rect x="25" y="60" width="230" height="360" rx="90" fill="none" stroke="#e0e0e0" strokeWidth="5" />
        {/* Viền cam nổi bật */}
        <rect x="40" y="100" width="200" height="280" rx="70" fill="none" stroke="#ff7120" strokeWidth="3" opacity="0.35" />
        {/* Đỉnh ống nhỏ lại */}
        <ellipse cx="140" cy="60" rx="110" ry="28" fill="#fff" stroke="#e0e0e0" strokeWidth="1.5" />
        <rect x="40" y="10" width="200" height="50" rx="28" fill="#ededed" stroke="#e0e0e0" strokeWidth="2" />
        <ellipse cx="140" cy="10" rx="110" ry="18" fill="#f5f5f5" stroke="#e0e0e0" strokeWidth="2" />
        {/* Hiệu ứng phản chiếu */}
        <ellipse cx="140" cy="250" rx="90" ry="140" fill="none" stroke="#fff" strokeWidth="2" opacity="0.08" />
        <ellipse cx="140" cy="250" rx="70" ry="110" fill="none" stroke="#fff" strokeWidth="1.5" opacity="0.10" />
        {/* Hiệu ứng cam ở giữa */}
        <rect x="60" y="240" width="160" height="7" rx="3.5" fill="#ff7120" opacity="0.7" />
      </svg>
      {/* Robot 3D */}
      <div style={robotStyle}>
        <video
          src={ROBOT_VIDEO}
          autoPlay
          loop
          muted
          playsInline
          style={{
            width: `${180 * container.scale}px`,
            height: `${300 * container.scale}px`,
            objectFit: 'contain',
            borderRadius: '2.5rem',
            background: 'transparent',
            pointerEvents: 'none'
          }}
        />
      </div>
      {/* Coin 3D */}
      <div style={coinStyle}>
        <video
          src={COIN_VIDEO}
          autoPlay
          loop
          muted
          playsInline
          style={{
            width: `${120 * container.scale}px`,
            height: `${120 * container.scale}px`,
            objectFit: 'contain',
            borderRadius: '50%',
            background: 'transparent',
            pointerEvents: 'none'
          }}
        />
      </div>
    </div>
  );
}

export default ParallaxCenter3D; 