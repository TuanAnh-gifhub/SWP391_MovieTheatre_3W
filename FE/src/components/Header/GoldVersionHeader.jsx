import React from "react";

// Gold rank: Polygonal luxury background with gentle color-shifting animation (bronze-gray transparent base) và viền xanh
export const GoldSparkleEffect = () => (
  <>
    <style>{`
      .gold-polygon-bg {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 0;
        opacity: 0.92;
        filter: blur(0.5px);
        transition: opacity 0.5s;
      }
      .gold-polygon-anim {
        animation: goldPolyFade 18s ease-in-out infinite alternate, goldHue 32s ease-in-out infinite alternate;
      }
      .gold-polygon-anim2 {
        animation: goldPolyFade2 24s ease-in-out infinite alternate, goldHue2 36s ease-in-out infinite alternate;
      }
      @keyframes goldPolyFade {
        0% { opacity: 0.85; filter: brightness(1) hue-rotate(0deg); }
        50% { opacity: 0.98; filter: brightness(1.06) hue-rotate(4deg); }
        100% { opacity: 0.85; filter: brightness(1) hue-rotate(0deg); }
      }
      @keyframes goldPolyFade2 {
        0% { opacity: 0.7; filter: brightness(0.97) hue-rotate(0deg); }
        50% { opacity: 0.9; filter: brightness(1.04) hue-rotate(-4deg); }
        100% { opacity: 0.7; filter: brightness(0.97) hue-rotate(0deg); }
      }
      @keyframes goldHue {
        0% { filter: hue-rotate(0deg); }
        50% { filter: hue-rotate(6deg); }
        100% { filter: hue-rotate(0deg); }
      }
      @keyframes goldHue2 {
        0% { filter: hue-rotate(0deg); }
        50% { filter: hue-rotate(-5deg); }
        100% { filter: hue-rotate(0deg); }
      }
    `}</style>
    <svg className="gold-polygon-bg" viewBox="0 0 1440 80" preserveAspectRatio="none">
      <defs>
        <radialGradient id="goldCenter" cx="50%" cy="50%" r="80%">
          <stop offset="0%" stopColor="#fffbe6" stopOpacity="1" />
          <stop offset="40%" stopColor="#ffe9a7" stopOpacity="0.93" />
          <stop offset="70%" stopColor="#ffe066" stopOpacity="0.88" />
          <stop offset="90%" stopColor="#e6b96a" stopOpacity="0.82" />
          <stop offset="100%" stopColor="#bfa76a" stopOpacity="0.78" />
        </radialGradient>
        <linearGradient id="goldSideL" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#bfa76a" stopOpacity="0.78" />
          <stop offset="100%" stopColor="#ffe9a7" stopOpacity="0.7" />
        </linearGradient>
        <linearGradient id="goldSideR" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#bfa76a" stopOpacity="0.78" />
          <stop offset="100%" stopColor="#ffe9a7" stopOpacity="0.7" />
        </linearGradient>
        <linearGradient id="goldTop" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fffbe6" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#ffe9a7" stopOpacity="0.7" />
        </linearGradient>
        <linearGradient id="goldBottom" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#bfa76a" stopOpacity="0.78" />
          <stop offset="100%" stopColor="#ffe9a7" stopOpacity="0.7" />
        </linearGradient>
      </defs>
      {/* Center polygon (radial gradient) */}
      <polygon className="gold-polygon-anim" points="360,80 720,0 1080,80" fill="url(#goldCenter)" stroke="none" />
      {/* Left and right large polygons */}
      <polygon className="gold-polygon-anim2" points="0,80 240,20 360,80" fill="url(#goldSideL)" stroke="none" />
      <polygon className="gold-polygon-anim2" points="1080,80 1200,20 1440,80" fill="url(#goldSideR)" stroke="none" />
      {/* Top and bottom polygons for extra depth */}
      <polygon className="gold-polygon-anim" points="240,20 720,0 1200,20 1080,80 360,80" fill="url(#goldTop)" stroke="none" />
      <polygon className="gold-polygon-anim2" points="0,80 360,80 1080,80 1440,80" fill="url(#goldBottom)" stroke="none" />
    </svg>
  </>
);
