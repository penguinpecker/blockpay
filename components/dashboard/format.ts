/**
 * USDC / EURC are 6-decimal tokens on every supported chain. All money on
 * BlockPay is currently denominated in one of those, so a single fixed-point
 * formatter is sufficient for the dashboard.
 */
const DECIMALS = 6;

function divmod(value: bigint, divisor: bigint): [bigint, bigint] {
  return [value / divisor, value % divisor];
}

/**
 * Format a base-unit amount string ("12500000") plus currency code into a
 * human-readable string ("$12.50"). USDC and EURC both round to 2dp for
 * display.
 */
export function formatAmount(amount: string, currency: string): string {
  let parsed: bigint;
  try {
    parsed = BigInt(amount);
  } catch {
    return `${amount} ${currency}`;
  }
  const scale = BigInt(10) ** BigInt(DECIMALS);
  const [whole, rem] = divmod(parsed, scale);
  const remPad = rem.toString().padStart(DECIMALS, "0");
  // 2dp, half-up
  const twoDp = Number(remPad.slice(0, 2));
  const thirdDigit = Number(remPad.charAt(2) || "0");
  let displayWhole = whole;
  let displayCents = twoDp;
  if (thirdDigit >= 5) {
    displayCents += 1;
    if (displayCents >= 100) {
      displayCents -= 100;
      displayWhole += BigInt(1);
    }
  }
  const wholeStr = displayWhole
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const centsStr = displayCents.toString().padStart(2, "0");
  const symbol = currency === "EURC" ? "€" : "$";
  return `${symbol}${wholeStr}.${centsStr}`;
}

/**
 * Sum a list of base-unit amount strings, returning the bigint total.
 */
export function sumAmounts(amounts: string[]): bigint {
  let total = BigInt(0);
  for (const a of amounts) {
    try {
      total += BigInt(a);
    } catch {
      // ignore unparseable rows
    }
  }
  return total;
}

/**
 * Divide bigint a by bigint b, returning the result as a base-unit string.
 * Used for avg ticket = sum / count.
 */
export function divideBigInts(a: bigint, b: bigint): string {
  if (b === BigInt(0)) return "0";
  return (a / b).toString();
}

export function truncateAddress(addr: string): string {
  if (!addr) return "";
  if (addr.length <= 10) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export function truncateHash(hash: string): string {
  if (!hash) return "";
  if (hash.length <= 14) return hash;
  return `${hash.slice(0, 7)}...${hash.slice(-5)}`;
}

/**
 * Lossless date formatter. Returns "May 15, 09:42" style — matches the look
 * the legacy mock data used.
 */
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function formatShortDateTime(d: Date): string {
  const month = MONTHS[d.getUTCMonth()];
  const day = d.getUTCDate();
  const hh = d.getUTCHours().toString().padStart(2, "0");
  const mm = d.getUTCMinutes().toString().padStart(2, "0");
  return `${month} ${day}, ${hh}:${mm}`;
}

export function formatLongDate(d: Date): string {
  const month = MONTHS[d.getUTCMonth()];
  const day = d.getUTCDate();
  const year = d.getUTCFullYear();
  return `${month} ${day.toString().padStart(2, "0")}, ${year}`;
}

/**
 * Look up a friendly chain name from a chainKey. Falls back to the raw key.
 */
const CHAIN_NAMES: Record<string, string> = {
  "base-sepolia": "Base Sepolia",
  "arc-testnet": "Arc Testnet",
  base: "Base",
  arc: "Arc",
  ethereum: "Ethereum",
  optimism: "Optimism",
  arbitrum: "Arbitrum",
  polygon: "Polygon",
};

export function chainName(key: string): string {
  return CHAIN_NAMES[key] ?? key;
}
