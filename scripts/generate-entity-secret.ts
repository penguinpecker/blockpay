/**
 * Generate a 32-byte Entity Secret locally, encrypt it with Circle's public
 * RSA key, and print the ciphertext to paste into the Configurator at
 * https://console.circle.com/wallets/dev/configurator
 *
 * The plaintext Entity Secret is written to .entity-secret.recovery (gitignored
 * — but you must MOVE IT to 1Password / Bitwarden and delete the local file).
 *
 *   npx tsx scripts/generate-entity-secret.ts
 */

import { config } from "dotenv";
config({ path: ".env.local" });

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const apiKey = process.env.CIRCLE_API_KEY;
if (!apiKey) {
  console.error("CIRCLE_API_KEY missing in .env.local");
  process.exit(1);
}

const BASE_URL = process.env.CIRCLE_API_BASE_URL ?? "https://api.circle.com";

async function main() {
  // 1. Get Circle's public key for our app
  console.log("Fetching Circle public key…");
  const pkRes = await fetch(`${BASE_URL}/v1/w3s/config/entity/publicKey`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!pkRes.ok) {
    console.error(`Failed to fetch public key: ${pkRes.status} ${await pkRes.text()}`);
    process.exit(1);
  }
  const pkJson = (await pkRes.json()) as { data: { publicKey: string } };
  const circlePublicKey = pkJson.data.publicKey;
  console.log("Got Circle public key (RSA-2048 PEM).");

  // 2. Generate 32 random bytes — the Entity Secret
  const entitySecret = crypto.randomBytes(32);
  const entitySecretHex = entitySecret.toString("hex");

  // 3. Encrypt the Entity Secret with Circle's public key using RSA-OAEP + SHA-256
  const ciphertext = crypto.publicEncrypt(
    {
      key: circlePublicKey,
      oaepHash: "sha256",
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
    },
    Buffer.from(entitySecretHex, "hex"),
  );
  const ciphertextB64 = ciphertext.toString("base64");

  // 4. Save the plaintext recovery file (gitignored, MUST be moved to 1Password)
  const recoveryPath = path.resolve(".entity-secret.recovery");
  fs.writeFileSync(
    recoveryPath,
    [
      "# BlockPay Circle Entity Secret — PLAINTEXT recovery file",
      "# Move this to 1Password / Bitwarden and DELETE this file.",
      "# Never commit. Never email. Never paste into chat.",
      "#",
      `# Generated: ${new Date().toISOString()}`,
      "#",
      `ENTITY_SECRET_HEX=${entitySecretHex}`,
      "",
    ].join("\n"),
    { mode: 0o600 },
  );

  console.log();
  console.log("==============================================================");
  console.log("STEP 1 — Paste this ciphertext into the Configurator");
  console.log("URL: https://console.circle.com/wallets/dev/configurator");
  console.log("==============================================================");
  console.log();
  console.log(ciphertextB64);
  console.log();
  console.log("==============================================================");
  console.log("STEP 2 — Then store the plaintext somewhere safe");
  console.log("Plaintext written to: " + recoveryPath);
  console.log("Move it to 1Password / Bitwarden, then DELETE the local file:");
  console.log("    rm " + recoveryPath);
  console.log("==============================================================");
  console.log();
  console.log("Also paste the ciphertext into .env.local as:");
  console.log("    CIRCLE_ENTITY_SECRET_CIPHERTEXT=" + ciphertextB64.slice(0, 12) + "…(rest)");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
