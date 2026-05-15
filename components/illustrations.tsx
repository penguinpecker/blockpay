/**
 * Original SVG illustrations rendered with isometric perspective and soft
 * lighting to feel "3D" without using any third-party icon set.
 */

type IllProps = { size?: number; className?: string };

export function IlloGlobeShield({ size = 420, className = "" }: IllProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 420 420"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="g-globe" cx="0.4" cy="0.35" r="0.7">
          <stop offset="0%" stopColor="#93c5fd" />
          <stop offset="55%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </radialGradient>
        <radialGradient id="g-cont" cx="0.5" cy="0.5" r="0.6">
          <stop offset="0%" stopColor="#86efac" />
          <stop offset="100%" stopColor="#16a34a" />
        </radialGradient>
        <linearGradient id="g-shield" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#bfdbfe" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
        <linearGradient id="g-coin-y" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
        <linearGradient id="g-arrow" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#cbd5e1" />
          <stop offset="100%" stopColor="#64748b" />
        </linearGradient>
      </defs>

      {/* Circular orbit arrows */}
      <path
        d="M 80 210 A 130 130 0 0 1 210 80"
        stroke="url(#g-arrow)"
        strokeWidth="14"
        fill="none"
        strokeLinecap="round"
      />
      <polygon points="200,72 220,80 200,92" fill="#94a3b8" />
      <path
        d="M 340 210 A 130 130 0 0 1 210 340"
        stroke="url(#g-arrow)"
        strokeWidth="14"
        fill="none"
        strokeLinecap="round"
      />
      <polygon points="218,330 198,338 218,350" fill="#94a3b8" />

      {/* Globe */}
      <circle cx="210" cy="210" r="110" fill="url(#g-globe)" />
      <ellipse
        cx="195"
        cy="190"
        rx="35"
        ry="22"
        fill="url(#g-cont)"
        opacity="0.9"
      />
      <ellipse cx="245" cy="225" rx="22" ry="14" fill="url(#g-cont)" />
      <ellipse cx="180" cy="245" rx="18" ry="10" fill="url(#g-cont)" />
      <ellipse
        cx="180"
        cy="170"
        rx="46"
        ry="12"
        fill="#fff"
        opacity="0.12"
      />

      {/* Shield */}
      <path
        d="M 175 175 L 245 175 L 245 215 Q 245 252 210 268 Q 175 252 175 215 Z"
        fill="url(#g-shield)"
      />
      <path
        d="M 192 213 L 207 228 L 232 198"
        stroke="#fff"
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Wallet (top-left of globe) */}
      <g transform="translate(60 90)">
        <rect width="80" height="58" rx="8" fill="#1d4ed8" />
        <rect x="0" y="6" width="80" height="14" rx="3" fill="#93c5fd" />
        <rect x="50" y="28" width="22" height="14" rx="2" fill="#fbbf24" />
        <rect x="-6" y="0" width="14" height="58" rx="3" fill="#22c55e" />
      </g>

      {/* Coins */}
      <g transform="translate(310 270)">
        <circle cx="0" cy="0" r="26" fill="url(#g-coin-y)" />
        <text
          x="0"
          y="9"
          textAnchor="middle"
          fontSize="28"
          fontWeight="800"
          fill="#7c2d12"
          fontFamily="system-ui"
        >
          ₿
        </text>
      </g>
      <g transform="translate(345 320)">
        <circle cx="0" cy="0" r="16" fill="#cbd5e1" />
        <polygon
          points="0,-8 -6,0 0,8 6,0"
          fill="#64748b"
        />
      </g>
      <g transform="translate(330 220)">
        <circle cx="0" cy="0" r="14" fill="url(#g-coin-y)" />
      </g>
    </svg>
  );
}

function FlowCard({
  emoji: _e,
  title,
  Illo,
}: {
  emoji?: string;
  title: string;
  Illo: () => React.JSX.Element;
}) {
  return (
    <div className="card-frame-tight flex w-[240px] items-center gap-3 px-4 py-3">
      <div className="h-10 w-10 shrink-0">
        <Illo />
      </div>
      <span className="text-base font-medium text-white">{title}</span>
    </div>
  );
}

const MiniCash = () => (
  <svg viewBox="0 0 40 40" fill="none" aria-hidden="true">
    <rect x="6" y="14" width="28" height="18" rx="3" fill="#1d4ed8" />
    <circle cx="20" cy="23" r="5" fill="url(#g-coin-y2)" />
    <defs>
      <linearGradient id="g-coin-y2" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#fde68a" />
        <stop offset="100%" stopColor="#d97706" />
      </linearGradient>
    </defs>
    <rect x="14" y="6" width="16" height="10" rx="2" fill="#16a34a" />
  </svg>
);
const MiniPay = () => (
  <svg viewBox="0 0 40 40" fill="none" aria-hidden="true">
    <rect x="6" y="6" width="28" height="22" rx="3" fill="#1d4ed8" />
    <rect x="6" y="10" width="28" height="4" fill="#0c1e54" />
    <rect x="10" y="20" width="14" height="3" rx="1" fill="#93c5fd" />
    <circle cx="30" cy="32" r="5" fill="#fbbf24" />
  </svg>
);
const MiniContract = () => (
  <svg viewBox="0 0 40 40" fill="none" aria-hidden="true">
    <rect x="10" y="6" width="22" height="28" rx="2" fill="#dbeafe" />
    <rect x="13" y="10" width="14" height="2" fill="#94a3b8" />
    <rect x="13" y="15" width="14" height="2" fill="#94a3b8" />
    <rect x="13" y="20" width="9" height="2" fill="#94a3b8" />
    <circle cx="30" cy="9" r="4" fill="#22c55e" />
  </svg>
);
const MiniWallet = () => (
  <svg viewBox="0 0 40 40" fill="none" aria-hidden="true">
    <rect x="5" y="12" width="30" height="20" rx="3" fill="#1d4ed8" />
    <circle cx="28" cy="22" r="3" fill="#22c55e" />
    <path d="M 5 14 L 30 6 L 35 14 Z" fill="#93c5fd" />
  </svg>
);
const MiniStore = () => (
  <svg viewBox="0 0 40 40" fill="none" aria-hidden="true">
    <path d="M 6 14 L 8 6 L 32 6 L 34 14 Z" fill="#1d4ed8" />
    <rect x="6" y="14" width="28" height="20" fill="#3b82f6" />
    <rect x="16" y="20" width="8" height="14" fill="#0c1e54" />
    <circle cx="32" cy="30" r="4" fill="#fbbf24" />
  </svg>
);

export const FlowFromBusiness = () => (
  <FlowCard emoji="" title="From Business" Illo={MiniCash} />
);
export const FlowPayment = () => (
  <FlowCard emoji="" title="Payment" Illo={MiniPay} />
);
export const FlowContract = () => (
  <FlowCard emoji="" title="Contract" Illo={MiniContract} />
);
export const FlowWallet = () => (
  <FlowCard emoji="" title="Wallet" Illo={MiniWallet} />
);
export const FlowToBusiness = () => (
  <FlowCard emoji="" title="To Business" Illo={MiniStore} />
);

export function IlloMiner({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 320 240"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="gear" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#e2e8f0" />
          <stop offset="100%" stopColor="#64748b" />
        </linearGradient>
        <radialGradient id="coin" cx="0.4" cy="0.35" r="0.7">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="100%" stopColor="#b45309" />
        </radialGradient>
      </defs>
      {/* Gear */}
      <g transform="translate(160 110)">
        {Array.from({ length: 8 }).map((_, i) => (
          <rect
            key={i}
            x="-10"
            y="-80"
            width="20"
            height="20"
            fill="url(#gear)"
            transform={`rotate(${i * 45})`}
          />
        ))}
        <circle r="58" fill="url(#gear)" />
        <circle r="40" fill="url(#coin)" />
        <text
          y="14"
          textAnchor="middle"
          fontSize="42"
          fontWeight="800"
          fill="#7c2d12"
          fontFamily="system-ui"
        >
          ₿
        </text>
      </g>
      {/* Pickaxe + shovel crossed */}
      <g
        transform="translate(70 60) rotate(-25)"
        stroke="#7c2d12"
        strokeWidth="6"
        strokeLinecap="round"
      >
        <line x1="0" y1="0" x2="120" y2="0" />
        <path
          d="M -10 -2 L 12 -22 L 16 -8 Z"
          fill="#e2e8f0"
          stroke="#94a3b8"
          strokeWidth="2"
        />
      </g>
      <g
        transform="translate(260 60) rotate(25)"
        stroke="#7c2d12"
        strokeWidth="6"
        strokeLinecap="round"
      >
        <line x1="0" y1="0" x2="-120" y2="0" />
        <path
          d="M -120 -6 L -134 6 L -120 18 L -106 6 Z"
          fill="#e2e8f0"
          stroke="#94a3b8"
          strokeWidth="2"
        />
      </g>
      {/* Banner */}
      <rect x="100" y="190" width="120" height="32" rx="4" fill="#3b82f6" />
      <text
        x="160"
        y="212"
        textAnchor="middle"
        fontWeight="800"
        fontSize="16"
        fill="#fff"
        fontFamily="system-ui"
      >
        MINER
      </text>
    </svg>
  );
}

export function IlloCloud({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 240" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="cloudg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#dbeafe" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
      </defs>
      <g transform="translate(110 90)">
        <ellipse cx="0" cy="20" rx="65" ry="32" fill="url(#cloudg)" />
        <circle cx="-35" cy="0" r="22" fill="url(#cloudg)" />
        <circle cx="0" cy="-12" r="28" fill="url(#cloudg)" />
        <circle cx="35" cy="0" r="22" fill="url(#cloudg)" />
        <rect
          x="-30"
          y="22"
          width="60"
          height="22"
          rx="3"
          fill="#1d4ed8"
        />
        <circle cx="-18" cy="33" r="3" fill="#22c55e" />
        <circle cx="-6" cy="33" r="3" fill="#fbbf24" />
        <circle cx="6" cy="33" r="3" fill="#22c55e" />
      </g>
      {/* Connecting tokens */}
      <g stroke="#475569" strokeWidth="2" fill="none">
        <line x1="160" y1="70" x2="220" y2="40" />
        <line x1="220" y1="100" x2="260" y2="110" />
        <line x1="220" y1="130" x2="260" y2="150" />
        <line x1="160" y1="160" x2="200" y2="190" />
      </g>
      <g>
        <circle cx="220" cy="40" r="14" fill="url(#tok-eth)" />
        <text
          x="220"
          y="45"
          textAnchor="middle"
          fontSize="16"
          fontWeight="800"
          fill="#1e1b4b"
          fontFamily="system-ui"
        >
          ◆
        </text>
        <circle cx="260" cy="110" r="14" fill="#fbbf24" />
        <text
          x="260"
          y="115"
          textAnchor="middle"
          fontSize="14"
          fontWeight="800"
          fill="#7c2d12"
          fontFamily="system-ui"
        >
          ₿
        </text>
        <circle cx="260" cy="150" r="12" fill="#22c55e" />
        <text
          x="260"
          y="154"
          textAnchor="middle"
          fontSize="14"
          fontWeight="800"
          fill="#052e16"
          fontFamily="system-ui"
        >
          $
        </text>
        <circle cx="200" cy="190" r="13" fill="#ef4444" />
        <text
          x="200"
          y="195"
          textAnchor="middle"
          fontSize="14"
          fontWeight="800"
          fill="#7f1d1d"
          fontFamily="system-ui"
        >
          ▲
        </text>
        <defs>
          <radialGradient id="tok-eth" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="#a5b4fc" />
            <stop offset="100%" stopColor="#4338ca" />
          </radialGradient>
        </defs>
      </g>
    </svg>
  );
}

export function IlloReceipt({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 240" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="paper" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f1f5f9" />
          <stop offset="100%" stopColor="#cbd5e1" />
        </linearGradient>
      </defs>
      <g transform="translate(110 30)">
        <path
          d="M 0 0 L 100 0 L 100 150 L 50 175 L 0 150 Z"
          fill="url(#paper)"
          stroke="#94a3b8"
          strokeWidth="2"
        />
        <line
          x1="14"
          y1="30"
          x2="86"
          y2="30"
          stroke="#94a3b8"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M 16 60 Q 30 50 44 64 T 76 60"
          stroke="#1e293b"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
        <rect x="14" y="100" width="72" height="18" rx="3" fill="#1e3a8a" />
        <text
          x="50"
          y="113"
          textAnchor="middle"
          fontSize="12"
          fontWeight="700"
          fill="#fbbf24"
          fontFamily="system-ui"
        >
          ★ ★ ★
        </text>
        <circle cx="100" cy="0" r="22" fill="#22c55e" />
        <path
          d="M 90 0 L 98 8 L 112 -6"
          stroke="#fff"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      {/* Coin stack */}
      <g transform="translate(225 165)">
        <ellipse cx="0" cy="0" rx="22" ry="6" fill="#b45309" />
        <ellipse cx="0" cy="-8" rx="22" ry="6" fill="#d97706" />
        <ellipse cx="0" cy="-16" rx="22" ry="6" fill="#fbbf24" />
      </g>
    </svg>
  );
}

export function IlloLaptop({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 240" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="screen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#cbd5e1" />
          <stop offset="100%" stopColor="#64748b" />
        </linearGradient>
      </defs>
      <g transform="translate(60 60)">
        <rect width="160" height="100" rx="6" fill="url(#screen)" />
        <rect x="6" y="6" width="148" height="88" rx="3" fill="#f1f5f9" />
        <g transform="translate(20 22)">
          <rect width="50" height="6" rx="2" fill="#94a3b8" />
          <rect y="12" width="80" height="6" rx="2" fill="#94a3b8" />
          <rect y="24" width="40" height="6" rx="2" fill="#94a3b8" />
          <g transform="translate(0 40)">
            <rect width="10" height="10" rx="2" fill="#22c55e" />
            <rect x="14" y="2" width="60" height="6" rx="2" fill="#94a3b8" />
            <rect y="16" width="10" height="10" rx="2" fill="#22c55e" />
            <rect x="14" y="18" width="60" height="6" rx="2" fill="#94a3b8" />
          </g>
        </g>
        <rect
          x="-12"
          y="100"
          width="184"
          height="6"
          rx="2"
          fill="#475569"
        />
      </g>
      {/* Key */}
      <g transform="translate(200 60) rotate(-20)">
        <circle cx="0" cy="0" r="14" fill="#fbbf24" />
        <rect x="-3" y="6" width="6" height="28" fill="#fbbf24" />
        <rect x="-3" y="22" width="10" height="4" fill="#fbbf24" />
      </g>
      {/* Lock */}
      <g transform="translate(230 110)">
        <rect width="36" height="48" rx="4" fill="#3b82f6" />
        <path
          d="M 10 0 V -10 Q 10 -20 18 -20 Q 26 -20 26 -10 V 0"
          stroke="#3b82f6"
          strokeWidth="4"
          fill="none"
        />
        <circle cx="18" cy="22" r="4" fill="#fbbf24" />
      </g>
    </svg>
  );
}

export function IlloChart({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 240" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="chartbg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#dbeafe" />
          <stop offset="100%" stopColor="#93c5fd" />
        </linearGradient>
      </defs>
      <rect
        x="60"
        y="50"
        width="200"
        height="130"
        rx="6"
        fill="url(#chartbg)"
      />
      <line
        x1="78"
        y1="160"
        x2="240"
        y2="160"
        stroke="#1e293b"
        strokeWidth="2"
      />
      <line
        x1="78"
        y1="70"
        x2="78"
        y2="160"
        stroke="#1e293b"
        strokeWidth="2"
      />
      {/* Candles */}
      {[
        { x: 95, h: 30, c: "#16a34a" },
        { x: 115, h: 50, c: "#16a34a" },
        { x: 135, h: 22, c: "#dc2626" },
        { x: 155, h: 40, c: "#16a34a" },
        { x: 175, h: 60, c: "#dc2626" },
        { x: 195, h: 70, c: "#16a34a" },
        { x: 215, h: 30, c: "#dc2626" },
      ].map((c, i) => (
        <g key={i}>
          <line
            x1={c.x + 4}
            y1={160 - c.h - 8}
            x2={c.x + 4}
            y2={160 - c.h + 14}
            stroke="#1e293b"
            strokeWidth="2"
          />
          <rect x={c.x} y={160 - c.h} width="8" height={c.h} fill={c.c} />
        </g>
      ))}
      <path
        d="M 95 110 L 145 90 L 195 60"
        stroke="#1e3a8a"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      <polygon points="195,60 205,65 200,70" fill="#1e3a8a" />
      {/* Target */}
      <g transform="translate(40 50)">
        <circle r="20" fill="none" stroke="#dc2626" strokeWidth="3" />
        <circle r="12" fill="none" stroke="#dc2626" strokeWidth="3" />
        <circle r="4" fill="#dc2626" />
        <line
          x1="-30"
          y1="-30"
          x2="0"
          y2="0"
          stroke="#475569"
          strokeWidth="3"
        />
        <polygon points="0,0 -8,-2 -2,-8" fill="#fbbf24" />
      </g>
    </svg>
  );
}
