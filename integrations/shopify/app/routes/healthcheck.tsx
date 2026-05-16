import { json } from "@remix-run/node";

export const loader = async () => {
  return json({ ok: true, service: "blockpay-shopify", ts: Date.now() });
};
