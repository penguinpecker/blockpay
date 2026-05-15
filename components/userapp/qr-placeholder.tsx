import { cn } from "@/lib/utils";

// Deterministic pseudo-random pattern so the QR placeholder is stable across renders.
function buildPattern(size: number, seed = 1234) {
  const cells: boolean[][] = [];
  let state = seed;
  const next = () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state;
  };

  for (let y = 0; y < size; y++) {
    const row: boolean[] = [];
    for (let x = 0; x < size; x++) {
      row.push(next() % 2 === 0);
    }
    cells.push(row);
  }

  // Force the three corner finder patterns (typical QR feel).
  const stamp = (ox: number, oy: number) => {
    for (let y = 0; y < 7; y++) {
      for (let x = 0; x < 7; x++) {
        if (oy + y >= size || ox + x >= size) continue;
        const onBorder = x === 0 || x === 6 || y === 0 || y === 6;
        const onCore = x >= 2 && x <= 4 && y >= 2 && y <= 4;
        cells[oy + y][ox + x] = onBorder || onCore;
      }
    }
    for (let y = -1; y <= 7; y++) {
      for (let x = -1; x <= 7; x++) {
        if (y >= -1 && y <= 7 && (x === -1 || x === 7)) {
          if (oy + y >= 0 && oy + y < size && ox + x >= 0 && ox + x < size) {
            // quiet zone around finder
            if (y === -1 || y === 7 || x === -1 || x === 7) {
              cells[oy + y][ox + x] = false;
            }
          }
        }
      }
    }
  };

  stamp(0, 0);
  stamp(size - 7, 0);
  stamp(0, size - 7);

  return cells;
}

export function QrPlaceholder({
  size = 12,
  className,
  label = "QR code",
}: {
  size?: number;
  className?: string;
  label?: string;
}) {
  const cells = buildPattern(size);
  const dim = 100 / size;

  return (
    <div
      className={cn(
        "card-frame-tight relative aspect-square w-full overflow-hidden bg-white p-3",
        className,
      )}
      role="img"
      aria-label={label}
    >
      <svg
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full"
        aria-hidden="true"
      >
        <rect width="100" height="100" fill="#ffffff" />
        {cells.flatMap((row, y) =>
          row.map((on, x) =>
            on ? (
              <rect
                key={`${x}-${y}`}
                x={x * dim}
                y={y * dim}
                width={dim}
                height={dim}
                fill="#0a0f0c"
                rx={0.6}
              />
            ) : null,
          ),
        )}
      </svg>
    </div>
  );
}
