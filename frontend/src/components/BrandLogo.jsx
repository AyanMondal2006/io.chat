import { Link } from "react-router";

export const BrandIcon = ({ className = "size-9" }) => {
  return (
    <div
      className={`relative flex shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 via-indigo-600 to-cyan-600 p-[1px] shadow-lg shadow-violet-500/20 transition-all duration-300 group-hover:scale-105 group-hover:shadow-violet-500/35 ${className}`}
    >
      {/* Outer ambient glow */}
      <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-violet-600/40 via-fuchsia-500/30 to-cyan-500/40 blur-sm opacity-70 transition-opacity duration-300 group-hover:opacity-100" />

      {/* Inner surface */}
      <div className="relative flex size-full items-center justify-center rounded-[15px] bg-[#0c1022]/90 backdrop-blur-sm overflow-hidden">
        {/* Subtle cyber background grid / sheen */}
        <div className="absolute inset-0 bg-gradient-to-tr from-violet-600/15 via-transparent to-cyan-400/10 pointer-events-none" />

        <svg
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative size-[75%] drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]"
        >
          <defs>
            <linearGradient id="bubbleGrad" x1="6" y1="4" x2="30" y2="28" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.25" />
            </linearGradient>
            <linearGradient id="oRingGrad" x1="16" y1="11" x2="28" y2="23" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#a5f3fc" />
            </linearGradient>
          </defs>

          {/* Sleek chat bubble backdrop with tail at bottom-left */}
          <path
            d="M8 7.5C8 5.567 9.567 4 11.5 4H24.5C26.433 4 28 5.567 28 7.5V19.5C28 21.433 26.433 23 24.5 23H14.5L9.6 26.8C8.8 27.4 8 26.8 8 25.8V7.5Z"
            fill="url(#bubbleGrad)"
            stroke="rgba(255, 255, 255, 0.2)"
            strokeWidth="1.2"
          />

          {/* === LETTER 'i' === */}
          {/* Glowing dot */}
          <circle cx="13" cy="9.2" r="2.1" fill="#38bdf8" className="drop-shadow-[0_0_6px_#38bdf8]" />
          {/* Vertical stem */}
          <rect
            x="11.2"
            y="13"
            width="3.6"
            height="8.2"
            rx="1.8"
            fill="#ffffff"
          />

          {/* === LETTER 'o' (100% symmetric circle - zero tail!) === */}
          <circle
            cx="22.5"
            cy="17.1"
            r="4.4"
            stroke="url(#oRingGrad)"
            strokeWidth="2.8"
          />
          {/* High-tech central signal / live dot */}
          <circle
            cx="22.5"
            cy="17.1"
            r="1.5"
            fill="#38bdf8"
            className="drop-shadow-[0_0_4px_#38bdf8]"
          />
        </svg>
      </div>
    </div>
  );
};

const BrandLogo = ({
  size = "md",
  collapsed = false,
  to = "/",
  withLink = true,
  className = "",
  showBadge = false,
}) => {
  const sizeConfig = {
    sm: {
      icon: "size-8",
      text: "text-lg",
      badge: "text-[10px] px-1.5 py-0.5",
      gap: "gap-2",
    },
    md: {
      icon: "size-9 sm:size-10",
      text: "text-xl sm:text-2xl",
      badge: "text-[11px] px-2 py-0.5",
      gap: "gap-2.5",
    },
    lg: {
      icon: "size-12 sm:size-14",
      text: "text-3xl sm:text-4xl",
      badge: "text-xs px-2.5 py-0.5",
      gap: "gap-3.5",
    },
  };

  const currentSize = sizeConfig[size] || sizeConfig.md;

  const content = (
    <div
      className={`group inline-flex items-center ${currentSize.gap} ${className}`}
      aria-label="io.chat home"
    >
      <BrandIcon className={currentSize.icon} />

      {!collapsed && (
        <div className="flex items-center gap-2">
          <div className="flex items-baseline tracking-tight font-black leading-none select-none">
            {/* 'io' in high-contrast crisp white */}
            <span className="text-white drop-shadow-sm font-black">io</span>

            {/* Glowing neon dot */}
            <span className="mx-0.5 text-cyan-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.9)] font-black">
              .
            </span>

            {/* 'chat' in cyber fuchsia-to-cyan gradient */}
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-300 to-cyan-300 bg-clip-text text-transparent font-extrabold">
              chat
            </span>
          </div>

          {/* Pulse Live indicator */}
          <span className="relative flex h-2 w-2 ml-0.5" title="Online">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
          </span>

          {showBadge && (
            <span
              className={`rounded-full border border-cyan-400/30 bg-cyan-500/10 font-bold tracking-wider text-cyan-300 uppercase ${currentSize.badge}`}
            >
              Realtime
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (withLink) {
    return (
      <Link
        to={to}
        className="inline-flex items-center transition-opacity hover:opacity-95 focus:outline-none"
      >
        {content}
      </Link>
    );
  }

  return content;
};

export default BrandLogo;
