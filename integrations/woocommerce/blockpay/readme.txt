=== BlockPay ===
Contributors: blockpay
Tags: woocommerce, payments, usdc, stablecoin, crypto, web3, payment-gateway
Requires at least: 6.0
Tested up to: 6.6
Requires PHP: 7.4
Stable tag: 0.1.0
License: MIT
License URI: https://opensource.org/licenses/MIT

Accept USDC at checkout. Funds settle directly to your own wallet through BlockPay's non-custodial gateway.

== Description ==

BlockPay adds a "Pay with USDC" option to your WooCommerce checkout. When a customer chooses BlockPay, they are redirected to a hosted BlockPay PaymentLink to complete payment. The store owner's wallet receives USDC directly: BlockPay never custodies funds.

Features:

* Adds USDC as a WooCommerce payment method
* Redirect-style checkout (no card fields, no PCI scope)
* Non-custodial: funds land in your wallet, not ours
* Supports Arc Testnet and Base Sepolia in v0
* Signed webhook marks the order paid and records the on-chain tx hash

== Installation ==

1. In WordPress admin, go to Plugins > Add New > Upload Plugin.
2. Upload `blockpay.zip` and click Install Now.
3. Activate the plugin.
4. Go to WooCommerce > Settings > Payments and enable BlockPay (USDC).
5. Click Manage and fill in your PaymentLink slug, settlement chain, and webhook secret (all available in the BlockPay dashboard at https://blockpay-six.vercel.app).

== Frequently Asked Questions ==

= Is BlockPay custodial? =

No. Payments settle directly to the wallet address you configure on your BlockPay PaymentLink. BlockPay does not hold customer funds.

= Which networks are supported? =

v0 supports Arc Testnet and Base Sepolia. More networks will follow.

= What happens if the webhook fails? =

The order stays in "pending" until BlockPay successfully delivers the signed `payment.succeeded` event. BlockPay retries delivery. You can also manually mark the order paid from the WooCommerce admin if needed.

= Does this plugin handle refunds? =

Not in v0. Refunds are handled off-platform from the merchant wallet.

== Changelog ==

= 0.1.0 =
* Initial release. Redirect checkout to BlockPay PaymentLink. Signed webhook completes the order and records tx hash.

== Upgrade Notice ==

= 0.1.0 =
First release.
