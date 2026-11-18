/**
 * Crisp white & electric cobalt-blue diagonal geometric facet backdrop
 * matching the GoTech tech storefront visual identity.
 */
export default function GotechBackdrop({
  showWatermark = false,
}: {
  showWatermark?: boolean;
}) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden select-none z-0"
    >
      {/* Base bright luminous cool-white to ice-blue gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(165deg, #FFFFFF 0%, #F4F8FF 38%, #EAF2FF 70%, #F7FAFF 100%)",
        }}
      />

      {/* Faceted white/ice geometric shards + cobalt diagonal speed lines */}
      <svg
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 w-full h-full"
      >
        <defs>
          <linearGradient id="gtShardLight" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.92" />
            <stop offset="100%" stopColor="#DDEAFF" stopOpacity="0.45" />
          </linearGradient>
          <linearGradient id="gtShardSoft" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#E4EFFF" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.25" />
          </linearGradient>
          <linearGradient id="gtBlueStreak" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#003594" />
            <stop offset="55%" stopColor="#0057FF" />
            <stop offset="100%" stopColor="#00B0FF" />
          </linearGradient>
          <linearGradient id="gtCyanStreak" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0057FF" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#00A6FF" stopOpacity="0.85" />
          </linearGradient>
          <pattern
            id="gtDotMatrix"
            x="0"
            y="0"
            width="14"
            height="14"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="2" cy="2" r="1.4" fill="#0057FF" fillOpacity="0.16" />
          </pattern>
        </defs>

        {/* Subtle geometric glass facets */}
        <polygon points="0,0 520,0 240,420 0,310" fill="url(#gtShardLight)" />
        <polygon points="480,0 960,0 640,480 280,380" fill="url(#gtShardSoft)" />
        <polygon points="940,0 1440,0 1440,440 1050,240" fill="url(#gtShardLight)" />
        <polygon points="0,420 460,640 180,900 0,900" fill="url(#gtShardSoft)" />
        <polygon points="780,520 1440,280 1440,900 940,900" fill="url(#gtShardLight)" />

        {/* Faint edge dot-matrix tech texture */}
        <rect x="0" y="180" width="180" height="220" fill="url(#gtDotMatrix)" />
        <rect x="1220" y="420" width="220" height="240" fill="url(#gtDotMatrix)" />

        {/* Dynamic electric cobalt-blue diagonal streaks on right & left */}
        <polygon
          points="1260,0 1440,0 1440,340 1080,340"
          fill="url(#gtCyanStreak)"
          opacity="0.22"
        />
        <polygon
          points="1325,0 1440,0 1440,245 1190,245"
          fill="url(#gtBlueStreak)"
          opacity="0.85"
        />
        <polygon
          points="1235,0 1270,0 1090,220 1055,220"
          fill="#0099FF"
          opacity="0.45"
        />
        <polygon
          points="0,680 190,680 70,840 0,840"
          fill="url(#gtBlueStreak)"
          opacity="0.18"
        />
        <polygon
          points="1320,620 1440,480 1440,680 1260,760"
          fill="url(#gtBlueStreak)"
          opacity="0.22"
        />
      </svg>

      {/* Optional faint GoTech watermark behind hero */}
      {showWatermark && (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[360px] sm:w-[460px] opacity-[0.055]">
          <svg viewBox="0 0 120 100" fill="none" className="w-full h-auto">
            <path
              d="M78 24H44L27 42v24l17 14h32l13-16H59l7-11h34L81 86H39L16 66V38L39 14h49l-10 10Z"
              fill="#0044BB"
            />
            <ellipse
              cx="60"
              cy="52"
              rx="52"
              ry="20"
              transform="rotate(-24 60 52)"
              stroke="#0057FF"
              strokeWidth="4"
            />
          </svg>
        </div>
      )}
    </div>
  );
}
