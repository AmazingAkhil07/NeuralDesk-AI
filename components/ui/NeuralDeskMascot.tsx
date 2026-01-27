import * as React from "react";

// A premium NeuralDesk SVG mascot/icon with a subtle bounce animation
export function NeuralDeskMascot({ className = "", style = {} }) {
  return (
    <svg
      className={"neuraldesk-mascot animate-bounce-slow " + className}
      style={{ filter: "drop-shadow(0 2px 8px rgba(255,180,60,0.25))", ...style }}
      width="54" height="54" viewBox="0 0 54 54" fill="none" xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="27" cy="27" r="27" fill="url(#gd)" />
      <ellipse cx="27" cy="27" rx="18" ry="14" fill="#fff8e1" />
      <ellipse cx="27" cy="27" rx="12" ry="9" fill="#ffe0a3" />
      <ellipse cx="27" cy="27" rx="7" ry="5.5" fill="#ffb300" />
      <circle cx="22" cy="25" r="2" fill="#fff" />
      <circle cx="32" cy="25" r="2" fill="#fff" />
      <ellipse cx="27" cy="32" rx="4" ry="2" fill="#fff" fillOpacity=".7" />
      <defs>
        <radialGradient id="gd" cx="0" cy="0" r="1" gradientTransform="translate(27 27) scale(27)" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffe0a3" />
          <stop offset="1" stopColor="#ffb300" />
        </radialGradient>
      </defs>
    </svg>
  );
}

// Add a slow bounce animation
// In your global CSS (e.g. globals.css):
// .animate-bounce-slow { animation: bounce-slow 1.8s infinite cubic-bezier(.68,-0.55,.27,1.55); }
// @keyframes bounce-slow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
