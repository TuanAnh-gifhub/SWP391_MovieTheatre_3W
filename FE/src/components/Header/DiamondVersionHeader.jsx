import React from "react";

// Diamond rank: Polygonal luxury background, same layout as Gold, but with blue, bronze/gold, and black gradients, and orange borders
export const DiamondSparkleEffect = () => (
  <>
    <style>{`
      .diamond-polygon-bg {
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
      .diamond-polygon-anim {
        animation: diamondPolyFade 18s ease-in-out infinite alternate, diamondHue 32s ease-in-out infinite alternate;
      }
      .diamond-polygon-anim2 {
        animation: diamondPolyFade2 24s ease-in-out infinite alternate, diamondHue2 36s ease-in-out infinite alternate;
      }
      @keyframes diamondPolyFade {
        0% { opacity: 0.85; filter: brightness(1) hue-rotate(0deg); }
        50% { opacity: 0.98; filter: brightness(1.07) hue-rotate(5deg); }
        100% { opacity: 0.85; filter: brightness(1) hue-rotate(0deg); }
      }
      @keyframes diamondPolyFade2 {
        0% { opacity: 0.7; filter: brightness(0.97) hue-rotate(0deg); }
        50% { opacity: 0.9; filter: brightness(1.04) hue-rotate(-5deg); }
        100% { opacity: 0.7; filter: brightness(0.97) hue-rotate(0deg); }
      }
      @keyframes diamondHue {
        0% { filter: hue-rotate(0deg); }
        50% { filter: hue-rotate(6deg); }
        100% { filter: hue-rotate(0deg); }
      }
      @keyframes diamondHue2 {
        0% { filter: hue-rotate(0deg); }
        50% { filter: hue-rotate(-5deg); }
        100% { filter: hue-rotate(0deg); }
      }
    `}</style>
    <svg className="diamond-polygon-bg" viewBox="0 0 1440 80" preserveAspectRatio="none">
      <defs>
        <radialGradient id="diamondCenter" cx="50%" cy="50%" r="80%">
          <stop offset="0%" stopColor="#e3f0ff" stopOpacity="1" />
          <stop offset="40%" stopColor="#b3e0ff" stopOpacity="0.93" />
          <stop offset="70%" stopColor="#5ec6ff" stopOpacity="0.88" />
          <stop offset="90%" stopColor="#bfa76a" stopOpacity="0.82" />
          <stop offset="100%" stopColor="#23272f" stopOpacity="0.78" />
        </radialGradient>
        <linearGradient id="diamondSideL" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#23272f" stopOpacity="0.78" />
          <stop offset="100%" stopColor="#b3e0ff" stopOpacity="0.7" />
        </linearGradient>
        <linearGradient id="diamondSideR" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#23272f" stopOpacity="0.78" />
          <stop offset="100%" stopColor="#b3e0ff" stopOpacity="0.7" />
        </linearGradient>
        <linearGradient id="diamondTop" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e3f0ff" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#b3e0ff" stopOpacity="0.7" />
        </linearGradient>
        <linearGradient id="diamondBottom" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#bfa76a" stopOpacity="0.78" />
          <stop offset="100%" stopColor="#b3e0ff" stopOpacity="0.7" />
        </linearGradient>
      </defs>
      {/* Center polygon (radial gradient) */}
      <polygon className="diamond-polygon-anim" points="360,80 720,0 1080,80" fill="url(#diamondCenter)" stroke="none" />
      {/* Left and right large polygons */}
      <polygon className="diamond-polygon-anim2" points="0,80 240,20 360,80" fill="url(#diamondSideL)" stroke="none" />
      <polygon className="diamond-polygon-anim2" points="1080,80 1200,20 1440,80" fill="url(#diamondSideR)" stroke="none" />
      {/* Top and bottom polygons for extra depth */}
      <polygon className="diamond-polygon-anim" points="240,20 720,0 1200,20 1080,80 360,80" fill="url(#diamondTop)" stroke="none" />
      <polygon className="diamond-polygon-anim2" points="0,80 360,80 1080,80 1440,80" fill="url(#diamondBottom)" stroke="none" />
    </svg>
  </>
);
