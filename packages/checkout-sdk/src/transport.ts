/**
 * Low-level HTTP transport for the BlockPay REST API.
 *
 * Wraps `fetch` and provides typed JSON responses plus a structured
 * `BlockPayError` thrown on every non-2xx response.
 */

export const DEFAULT_BASE_URL = "https://blockpay-six.vercel.app";

export interface TransportOptions {
  apiKey: string;
  baseUrl?: string;
  /**
   * Override the fetch implementation. Useful for tests and for runtimes
   * where the global is named something else.
   */
  fetch?: typeof fetch;
  /** Extra headers merged into every request. */
  headers?: Record<string, string>;
}

export interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  query?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
  /** Per-request header overrides. */
  headers?: Record<string, string>;
  /** AbortSignal for cancellation. */
  signal?: AbortSignal;
}

export interface ErrorPayload {
  code?: string;
  message?: string;
  details?: unknown;
}

/**
 * Structured error raised by every BlockPay SDK call when the server
 * responds with a non-2xx status, or when the network itself fails.
 */
export class BlockPayError extends Error {
  /** Machine-readable error code, e.g. `invoice_not_found`. */
  public readonly code: string;
  /** HTTP status. `0` when the request never reached the server. */
  public readonly status: number;
  /** Optional structured details from the API. */
  public readonly details?: unknown;

  constructor(args: {
    code: string;
    message: string;
    status: number;
    details?: unknown;
  }) {
    super(args.message);
    this.name = "BlockPayError";
    this.code = args.code;
    this.status = args.status;
    this.details = args.details;
  }
}

/**
 * Construct an absolute URL with optional query parameters.
 *
 * Undefined query values are skipped. Other primitives are coerced to
 * string and properly URL-encoded.
 */
export function buildUrl(
  baseUrl: string,
  path: string,
  query?: RequestOptions["query"],
): string {
  const url = new URL(
    path.startsWith("/") ? path : `/${path}`,
    baseUrl.replace(/\/$/, "") + "/",
  );
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined) continue;
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

/**
 * Thin transport wrapper. Construct once per client; the `BlockPay`
 * facade does this for you.
 */
export class Transport {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly fetchImpl: typeof fetch;
  private readonly extraHeaders: Record<string, string>;

  constructor(opts: TransportOptions) {
    if (!opts.apiKey) {
      throw new BlockPayError({
        code: "invalid_api_key",
        message: "apiKey is required to construct a BlockPay client",
        status: 0,
      });
    }
    this.apiKey = opts.apiKey;
    this.baseUrl = (opts.baseUrl ?? DEFAULT_BASE_URL).replace(/\/$/, "");
    this.fetchImpl = opts.fetch ?? globalThis.fetch.bind(globalThis);
    this.extraHeaders = opts.headers ?? {};
  }

  /** Perform a typed JSON request and return the parsed body. */
  async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const method = options.method ?? "GET";
    const url = buildUrl(this.baseUrl, path, options.query);

    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.apiKey}`,
      Accept: "application/json",
      "User-Agent": "blockpay-checkout-sdk/0.1.0",
      ...this.extraHeaders,
      ...(options.headers ?? {}),
    };

    let body: BodyInit | undefined;
    if (options.body !== undefined && options.body !== null) {
      body = JSON.stringify(options.body);
      headers["Content-Type"] = "application/json";
    }

    let response: Response;
    try {
      response = await this.fetchImpl(url, {
        method,
        headers,
        body,
        signal: options.signal,
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "network request failed";
      throw new BlockPayError({
        code: "network_error",
        message,
        status: 0,
        details: err,
      });
    }

    const contentType = response.headers.get("content-type") ?? "";
    const isJson = contentType.includes("application/json");
    const text = await response.text();
    let parsed: unknown = undefined;
    if (text.length > 0 && isJson) {
      try {
        parsed = JSON.parse(text);
      } catch {
        // fall through: handled below
      }
    }

    if (!response.ok) {
      const errPayload =
        parsed && typeof parsed === "object"
          ? ((parsed as { error?: ErrorPayload }).error ??
            (parsed as ErrorPayload))
          : undefined;
      throw new BlockPayError({
        code: errPayload?.code ?? `http_${response.status}`,
        message:
          errPayload?.message ??
          `Request to ${path} failed with status ${response.status}`,
        status: response.status,
        details: errPayload?.details ?? parsed ?? text,
      });
    }

    return (parsed ?? (text.length === 0 ? undefined : text)) as T;
  }
}
