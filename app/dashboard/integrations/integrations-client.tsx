"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Key,
  Webhook,
  Loader2,
  Copy,
  Check,
  Shield,
  ExternalLink,
} from "lucide-react";

type Props = {
  apiKeyIssued: boolean;
  apiKeyIssuedAt: string;
  webhookUrl: string;
  webhookSecretSet: boolean;
  merchantAddress: string;
};

const CURL_SNIPPET = `curl -X POST https://blockpay-six.vercel.app/api/invoices \\
  -H "Content-Type: application/json" \\
  -d '{
    "merchantId": "<your-merchant-id>",
    "merchantAddress": "0xYourSettlementWallet",
    "amount": "1000000",
    "currency": "USDC",
    "chainKey": "arc-testnet",
    "lineItems": [
      { "label": "Pro plan", "amount": "1.00 USDC" }
    ]
  }'`;

const JS_SNIPPET = `// npm install @blockpay/checkout (coming soon)
import { Blockpay } from "@blockpay/checkout";

const bp = new Blockpay({ apiKey: process.env.BLOCKPAY_KEY });

const invoice = await bp.invoices.create({
  amount: "1000000", // base units (USDC = 6 decimals)
  currency: "USDC",
  chainKey: "arc-testnet",
  lineItems: [{ label: "Pro plan", amount: "1.00 USDC" }],
});

window.location.href = invoice.checkoutUrl;`;

export function IntegrationsClient({
  apiKeyIssued: initialIssued,
  apiKeyIssuedAt,
  webhookUrl: initialWebhookUrl,
  webhookSecretSet,
  merchantAddress,
}: Props) {
  const [issued, setIssued] = useState(initialIssued);
  const [plaintext, setPlaintext] = useState<string | null>(null);
  const [regenerating, setRegenerating] = useState(false);
  const [keyError, setKeyError] = useState<string | null>(null);

  const [webhookUrl, setWebhookUrl] = useState(initialWebhookUrl);
  const [savedUrl, setSavedUrl] = useState(initialWebhookUrl);
  const [secretSet, setSecretSet] = useState(webhookSecretSet);
  const [savingWebhook, setSavingWebhook] = useState(false);
  const [webhookSaved, setWebhookSaved] = useState(false);
  const [webhookError, setWebhookError] = useState<string | null>(null);

  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = async (id: string, text: string) => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      }
    } catch {
      // ignore
    }
    setCopied(id);
    setTimeout(() => setCopied((c) => (c === id ? null : c)), 1600);
  };

  const handleGenerateKey = async () => {
    setRegenerating(true);
    setKeyError(null);
    try {
      const res = await fetch("/api/merchants", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ regenerateApiKey: true }),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        setKeyError(j.error ?? `Request failed (${res.status})`);
        return;
      }
      const data = (await res.json()) as { apiKey: string | null };
      if (data.apiKey) {
        setPlaintext(data.apiKey);
        setIssued(true);
      }
    } catch (err) {
      setKeyError(err instanceof Error ? err.message : "Network error");
    } finally {
      setRegenerating(false);
    }
  };

  const handleSaveWebhook = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSavingWebhook(true);
    setWebhookSaved(false);
    setWebhookError(null);
    try {
      const res = await fetch("/api/merchants", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          webhookUrl: webhookUrl.trim() === "" ? null : webhookUrl.trim(),
        }),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        setWebhookError(j.error ?? `Request failed (${res.status})`);
        return;
      }
      const data = (await res.json()) as {
        merchant: { webhookUrl: string | null };
      };
      setSavedUrl(data.merchant.webhookUrl ?? "");
      setWebhookUrl(data.merchant.webhookUrl ?? "");
      setWebhookSaved(true);
      if (data.merchant.webhookUrl) setSecretSet(true);
      setTimeout(() => setWebhookSaved(false), 1800);
    } catch (err) {
      setWebhookError(err instanceof Error ? err.message : "Network error");
    } finally {
      setSavingWebhook(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border border-[rgba(74,222,128,0.18)] bg-[#0c1310] p-7">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl border border-[rgba(74,222,128,0.25)] bg-[rgba(74,222,128,0.08)] text-[#4ade80]">
              <Key size={18} strokeWidth={2} />
            </div>
            <div>
              <div className="font-display text-lg font-semibold text-white">
                API key
              </div>
              <p className="mt-1 text-sm text-zinc-500">
                {issued
                  ? `Active · issued on ${apiKeyIssuedAt}`
                  : "Not issued yet. Generate a key to use the REST API and SDKs."}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleGenerateKey}
            disabled={regenerating}
            className="btn-pill-solid text-sm disabled:opacity-70"
          >
            {regenerating ? (
              <>
                <Loader2 size={16} strokeWidth={2.4} className="animate-spin" />
                {issued ? "Rotating…" : "Generating…"}
              </>
            ) : issued ? (
              "Rotate key"
            ) : (
              "Generate API key"
            )}
          </button>
        </div>

        {plaintext ? (
          <div className="mt-5 rounded-2xl border border-[rgba(74,222,128,0.35)] bg-[rgba(74,222,128,0.06)] p-4">
            <div className="flex items-center justify-between gap-3">
              <code className="overflow-x-auto whitespace-nowrap font-mono text-sm text-[#86efac]">
                {plaintext}
              </code>
              <button
                type="button"
                onClick={() => handleCopy("apikey", plaintext)}
                className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(74,222,128,0.45)] px-3 py-1 text-xs font-medium text-[#86efac] hover:text-white"
              >
                {copied === "apikey" ? (
                  <>
                    <Check size={13} /> Copied
                  </>
                ) : (
                  <>
                    <Copy size={13} /> Copy
                  </>
                )}
              </button>
            </div>
            <p className="mt-2 flex items-center gap-2 text-xs text-amber-300">
              <Shield size={12} /> Save this key now. It will not be shown again.
            </p>
          </div>
        ) : null}

        {keyError ? (
          <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/[0.06] px-4 py-3 text-xs text-amber-300">
            {keyError}
          </div>
        ) : null}
      </section>

      <section className="rounded-2xl border border-[rgba(74,222,128,0.18)] bg-[#0c1310] p-7">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl border border-[rgba(74,222,128,0.25)] bg-[rgba(74,222,128,0.08)] text-[#4ade80]">
            <Webhook size={18} strokeWidth={2} />
          </div>
          <div className="flex-1">
            <div className="font-display text-lg font-semibold text-white">
              Webhook endpoint
            </div>
            <p className="mt-1 text-sm text-zinc-500">
              We POST a signed payload here every time an invoice is paid.
              {secretSet
                ? " A signing secret is on file — keep your endpoint in sync with our docs."
                : " Saving a URL also provisions a signing secret you can fetch via the API."}
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveWebhook} className="mt-5 flex flex-col gap-3">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">
              Webhook URL
            </span>
            <input
              type="url"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://api.example.com/blockpay/webhook"
              className="dashboard-input"
            />
          </label>

          {webhookError ? (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/[0.06] px-4 py-3 text-xs text-amber-300">
              {webhookError}
            </div>
          ) : null}

          <div className="flex items-center justify-between gap-3">
            <span className="text-xs text-zinc-500">
              {savedUrl ? `Currently sending to ${savedUrl}` : "No endpoint set."}
            </span>
            <button
              type="submit"
              disabled={savingWebhook}
              className="btn-pill-solid text-sm disabled:opacity-70"
            >
              {savingWebhook ? (
                <>
                  <Loader2 size={16} strokeWidth={2.4} className="animate-spin" />
                  Saving…
                </>
              ) : webhookSaved ? (
                <>
                  <Check size={16} strokeWidth={2.4} /> Saved
                </>
              ) : (
                "Save endpoint"
              )}
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-2xl border border-[rgba(74,222,128,0.18)] bg-[#0c1310] p-7">
        <div className="font-display text-lg font-semibold text-white">
          Install snippets
        </div>
        <p className="mt-1 text-sm text-zinc-500">
          Drop these into your backend. Replace placeholders with your merchant
          id ({merchantAddress.slice(0, 6)}…{merchantAddress.slice(-4)}) and key.
        </p>

        <div className="mt-5 grid gap-5">
          <SnippetBlock
            label="REST · create an invoice"
            value={CURL_SNIPPET}
            id="curl"
            copied={copied}
            onCopy={handleCopy}
          />
          <SnippetBlock
            label="JavaScript SDK"
            value={JS_SNIPPET}
            id="sdk"
            copied={copied}
            onCopy={handleCopy}
          />
        </div>

        <div className="mt-6 flex flex-wrap gap-3 border-t border-[rgba(74,222,128,0.10)] pt-5">
          <Link
            href="/docs/shopify"
            className="inline-flex items-center gap-2 rounded-full border border-[rgba(255,255,255,0.1)] px-4 py-2 text-xs font-medium text-zinc-300 transition-colors hover:text-white hover:border-[rgba(74,222,128,0.45)]"
          >
            Shopify guide <ExternalLink size={13} />
          </Link>
          <Link
            href="/docs/wordpress"
            className="inline-flex items-center gap-2 rounded-full border border-[rgba(255,255,255,0.1)] px-4 py-2 text-xs font-medium text-zinc-300 transition-colors hover:text-white hover:border-[rgba(74,222,128,0.45)]"
          >
            WordPress guide <ExternalLink size={13} />
          </Link>
        </div>
      </section>

      <style>{`
        .dashboard-input {
          width: 100%;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.08);
          background: #0a0f0c;
          padding: 10px 14px;
          font-size: 14px;
          color: #fff;
          outline: none;
          transition: border-color 160ms ease;
        }
        .dashboard-input::placeholder { color: #52525b; }
        .dashboard-input:focus { border-color: rgba(74,222,128,0.45); }
      `}</style>
    </div>
  );
}

function SnippetBlock({
  label,
  value,
  id,
  copied,
  onCopy,
}: {
  label: string;
  value: string;
  id: string;
  copied: string | null;
  onCopy: (id: string, text: string) => void;
}) {
  return (
    <div className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[#0a0f0c]">
      <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.06)] px-4 py-2.5">
        <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">
          {label}
        </span>
        <button
          type="button"
          onClick={() => onCopy(id, value)}
          className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(255,255,255,0.08)] px-3 py-1 text-xs font-medium text-zinc-300 hover:text-white hover:border-[rgba(74,222,128,0.45)]"
        >
          {copied === id ? (
            <>
              <Check size={13} className="text-[#4ade80]" /> Copied
            </>
          ) : (
            <>
              <Copy size={13} /> Copy
            </>
          )}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed text-zinc-300">
        {value}
      </pre>
    </div>
  );
}
