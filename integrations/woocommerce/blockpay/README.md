# BlockPay for WooCommerce

Accept USDC payments at WooCommerce checkout. Funds settle directly to the merchant's wallet through BlockPay's non-custodial gateway.

## Requirements

- WordPress 6.0+
- WooCommerce 7.0+
- PHP 7.4+
- A BlockPay merchant account at https://blockpay-six.vercel.app

## Install

1. Download or build `blockpay.zip` (run `bash build.sh` at the repo root).
2. In WordPress admin, open **Plugins** > **Add New** > **Upload Plugin**.
3. Choose `blockpay.zip` and click **Install Now**.
4. Click **Activate**.

## Configure

1. In your BlockPay dashboard, create a **PaymentLink** for this store and note its slug (for example `my-store`). Also copy the webhook signing secret.
2. In WordPress admin, go to **WooCommerce** > **Settings** > **Payments**.
3. Find **BlockPay (USDC)** in the list and toggle it on, then click **Manage**.
4. Fill in:
   - **Title** and **Description** (shown to the customer at checkout)
   - **Settlement address** (the wallet that receives USDC, for reference)
   - **Settlement chain** (Arc Testnet or Base Sepolia in v0)
   - **PaymentLink slug** (from step 1)
   - **Webhook secret** (from step 1)
5. **Save changes.**
6. Back in the BlockPay dashboard, set the webhook URL to:

   ```
   https://YOUR-STORE.example.com/wc-api/blockpay_webhook
   ```

## Flow

1. Customer picks **Pay with USDC** at WooCommerce checkout.
2. Clicking **Place order** marks the WC order as `pending` and redirects the customer to:

   ```
   https://blockpay-six.vercel.app/pay/<slug>?source=woocommerce&order_id=<wc_order_id>&return_url=<thank_you_url>
   ```

3. After payment lands on-chain, BlockPay POSTs a signed `payment.succeeded` webhook to `/wc-api/blockpay_webhook`. The plugin verifies the HMAC, calls `WC_Order::payment_complete($tx_hash)`, and adds an order note with the on-chain tx hash.
4. The customer is sent back to the WooCommerce thank-you page.

## Webhook payload

```json
{
  "event": "payment.succeeded",
  "order_id": "123",
  "tx_hash": "0xabc...",
  "chain": "arc-testnet",
  "amount": "12.34",
  "currency": "USDC",
  "timestamp": 1715800000
}
```

Signature header: `X-BlockPay-Signature: <hex hmac-sha256 of raw body using the configured secret>` (the `sha256=` prefix is also accepted).

## Files

```
blockpay/
  blockpay.php                            Plugin bootstrap
  includes/
    class-wc-blockpay-gateway.php         WC_Payment_Gateway implementation
    class-wc-blockpay-webhook.php         /wc-api/blockpay_webhook handler
  assets/
    icon.svg                              24x24 gateway icon
  readme.txt                              WP.org-format readme
  README.md                               This file
```

## License

MIT. See `LICENSE`.
