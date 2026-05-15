/**
 * Server-only Circle REST helper.
 *
 * Reads credentials from environment variables; never logs or echoes them
 * back to the caller. Errors are normalized into a structured shape so
 * route handlers can return sanitized JSON without leaking API responses
 * that might contain sensitive material.
 *
 * IMPORTANT: never import this file from a Client Component. Anything in
 * here transitively pulls in Node's `crypto` module and assumes env-vars
 * scoped to the server runtime.
 */

// Server-only by convention; do not import this module from a Client
// Component. We deliberately avoid pulling in the `server-only` package
// to keep the dependency surface small.
import { createPublicKey, publicEncrypt, constants, randomBytes } from "crypto";

// ---- Env access ----

const ENV = {
  apiKey: process.env.CIRCLE_API_KEY,
  baseUrl: process.env.CIRCLE_API_BASE_URL ?? "https://api.circle.com",
  entitySecret: process.env.CIRCLE_ENTITY_SECRET,
} as const;

export type CircleErrorCode =
  | "circle_not_configured"
  | "circle_request_failed"
  | "circle_invalid_response"
  | "circle_entity_secret_missing"
  | "circle_entity_secret_invalid_format";

export class CircleError extends Error {
  code: CircleErrorCode;
  status: number;
  constructor(code: CircleErrorCode, status = 500, message?: string) {
    super(message ?? code);
    this.code = code;
    this.status = status;
    this.name = "CircleError";
  }
}

function requireApiKey(): string {
  if (!ENV.apiKey) {
    throw new CircleError("circle_not_configured", 503);
  }
  return ENV.apiKey;
}

// ---- Typed fetch helper ----

export type CircleFetchInit = Omit<RequestInit, "body" | "headers"> & {
  body?: unknown;
  headers?: Record<string, string>;
  query?: Record<string, string | number | undefined>;
};

export async function circleFetch<T>(
  path: string,
  init: CircleFetchInit = {},
): Promise<T> {
  const apiKey = requireApiKey();

  const url = new URL(
    path.startsWith("http") ? path : `${ENV.baseUrl}${path}`,
  );
  if (init.query) {
    for (const [k, v] of Object.entries(init.query)) {
      if (v !== undefined) url.searchParams.set(k, String(v));
    }
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
    Accept: "application/json",
    ...init.headers,
  };

  let res: Response;
  try {
    res = await fetch(url.toString(), {
      ...init,
      headers,
      body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
    });
  } catch {
    throw new CircleError("circle_request_failed", 502);
  }

  if (!res.ok) {
    // Do not surface upstream body to the caller; it may echo the key or
    // other sensitive context back. Map to a generic error.
    throw new CircleError("circle_request_failed", res.status);
  }

  try {
    const data = (await res.json()) as T;
    return data;
  } catch {
    throw new CircleError("circle_invalid_response", 502);
  }
}

// ---- Entity public key cache + RSA-OAEP encrypt ----

type EntityPublicKeyResponse = {
  data?: {
    publicKey?: string;
  };
};

let cachedPublicKeyPem: string | null = null;
let cachedPublicKeyAt = 0;
const PUBLIC_KEY_TTL_MS = 60 * 60 * 1000; // 1h

export async function getEntityPublicKey(): Promise<string> {
  const now = Date.now();
  if (cachedPublicKeyPem && now - cachedPublicKeyAt < PUBLIC_KEY_TTL_MS) {
    return cachedPublicKeyPem;
  }
  const resp = await circleFetch<EntityPublicKeyResponse>(
    "/v1/w3s/config/entity/publicKey",
  );
  const pem = resp?.data?.publicKey;
  if (!pem || typeof pem !== "string") {
    throw new CircleError("circle_invalid_response", 502);
  }
  cachedPublicKeyPem = pem;
  cachedPublicKeyAt = now;
  return pem;
}

/**
 * Encrypt the entity secret hex with the cached entity public key using
 * RSA-OAEP / SHA-256. Returns base64 ciphertext. This produces a
 * one-time-use credential per Circle docs; never cache or reuse.
 */
export async function encryptEntitySecret(
  plaintextHex?: string,
): Promise<string> {
  const hex = plaintextHex ?? ENV.entitySecret;
  if (!hex) {
    throw new CircleError("circle_entity_secret_missing", 503);
  }
  if (!/^[0-9a-fA-F]{64}$/.test(hex)) {
    // Entity secret should be 32 bytes (64 hex chars).
    throw new CircleError("circle_entity_secret_invalid_format", 500);
  }
  const pem = await getEntityPublicKey();
  const key = createPublicKey(pem);
  const buf = Buffer.from(hex, "hex");
  const encrypted = publicEncrypt(
    {
      key,
      padding: constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: "sha256",
    },
    buf,
  );
  return encrypted.toString("base64");
}

// ---- Wallet & webhook type stubs (filled in once we wire those flows) ----

export type IdempotencyKey = string;

export function newIdempotencyKey(): IdempotencyKey {
  // RFC4122 v4 in spirit; Circle accepts any unique string per request.
  const b = randomBytes(16);
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const hex = b.toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(
    12,
    16,
  )}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export type CreateWalletSetRequest = {
  idempotencyKey?: IdempotencyKey;
  entitySecretCiphertext: string;
  name: string;
};

export type CreateWalletSetResponse = {
  data?: {
    walletSet?: { id: string; custodyType: string; name: string };
  };
};

export type CreateWalletRequest = {
  idempotencyKey?: IdempotencyKey;
  entitySecretCiphertext: string;
  walletSetId: string;
  blockchains: string[];
  count?: number;
};

export type Wallet = {
  id: string;
  address: string;
  blockchain: string;
  state: string;
  custodyType: string;
};

export type CreateWalletResponse = {
  data?: {
    wallets?: Wallet[];
  };
};

export type WebhookSubscription = {
  id: string;
  endpoint: string;
  enabled: boolean;
  notificationTypes?: string[];
};

export type ListWebhookSubscriptionsResponse = {
  data?: {
    subscriptions?: WebhookSubscription[];
  };
};

// Convenience wrappers. Each wrapper handles entity-secret encryption so
// callers never see the plaintext or ciphertext themselves.

export async function createWalletSet(name: string): Promise<{
  id: string;
  name: string;
}> {
  const ciphertext = await encryptEntitySecret();
  const resp = await circleFetch<CreateWalletSetResponse>(
    "/v1/w3s/developer/walletSets",
    {
      method: "POST",
      body: {
        idempotencyKey: newIdempotencyKey(),
        entitySecretCiphertext: ciphertext,
        name,
      } satisfies CreateWalletSetRequest,
    },
  );
  const set = resp?.data?.walletSet;
  if (!set?.id) {
    throw new CircleError("circle_invalid_response", 502);
  }
  return { id: set.id, name: set.name };
}

export async function createWallets(input: {
  walletSetId: string;
  blockchains: string[];
  count?: number;
}): Promise<Wallet[]> {
  const ciphertext = await encryptEntitySecret();
  const resp = await circleFetch<CreateWalletResponse>(
    "/v1/w3s/developer/wallets",
    {
      method: "POST",
      body: {
        idempotencyKey: newIdempotencyKey(),
        entitySecretCiphertext: ciphertext,
        walletSetId: input.walletSetId,
        blockchains: input.blockchains,
        count: input.count ?? 1,
      } satisfies CreateWalletRequest,
    },
  );
  const wallets = resp?.data?.wallets;
  if (!Array.isArray(wallets)) {
    throw new CircleError("circle_invalid_response", 502);
  }
  return wallets;
}

export async function listWebhookSubscriptions(): Promise<
  WebhookSubscription[]
> {
  const resp = await circleFetch<ListWebhookSubscriptionsResponse>(
    "/v2/notifications/subscriptions",
  );
  return resp?.data?.subscriptions ?? [];
}

/** Surface only whether Circle credentials are present. Never leak values. */
export function circleConfigured(): boolean {
  return Boolean(ENV.apiKey);
}
