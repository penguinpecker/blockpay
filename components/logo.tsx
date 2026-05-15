export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="bp-coin" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#86efac" />
            <stop offset="100%" stopColor="#22c55e" />
          </linearGradient>
        </defs>
        <circle cx="10" cy="11" r="5.5" fill="url(#bp-coin)" />
        <text
          x="10"
          y="14.5"
          textAnchor="middle"
          fontSize="7"
          fontWeight="700"
          fill="#052e16"
          fontFamily="system-ui"
        >
          B
        </text>
        <circle cx="22" cy="21" r="5.5" fill="url(#bp-coin)" />
        <text
          x="22"
          y="24.5"
          textAnchor="middle"
          fontSize="7"
          fontWeight="700"
          fill="#052e16"
          fontFamily="system-ui"
        >
          $
        </text>
        <path
          d="M14 9 Q20 6 24 14"
          stroke="#4ade80"
          strokeWidth="1.4"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M18 23 Q12 26 8 18"
          stroke="#4ade80"
          strokeWidth="1.4"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
      <span
        className="font-display text-xl font-bold tracking-tight"
        style={{ color: "#4ade80" }}
      >
        Blockpay
      </span>
    </div>
  );
}
