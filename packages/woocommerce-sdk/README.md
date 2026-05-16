# blockpay/woocommerce

A small, opinionated PHP SDK for talking to [BlockPay](https://blockpay-six.vercel.app)
from a WordPress or WooCommerce codebase. It gives you a typed `Client` for the
BlockPay REST API, Stripe-style webhook verification, and a couple of
WooCommerce-specific helpers for turning orders into invoices and applying
incoming payments back onto an order.

This package is intentionally framework-light: it only depends on Guzzle. You
can drop it into a custom WooCommerce gateway, a headless WordPress install, or
any standalone PHP service that needs to integrate with BlockPay.

## Requirements

- PHP 8.1 or newer
- `ext-json`
- Composer

WooCommerce is optional. The SDK's WooCommerce helpers are gated behind a
`class_exists('\\WC_Order')` check, so you can require the package in non-WP
projects without fatal errors.

## Install

```bash
composer require blockpay/woocommerce
```

## Quickstart

```php
use BlockPay\WooCommerce\Client;

$client = new Client(getenv('BLOCKPAY_API_KEY'));

$invoice = $client->createInvoice([
    'amount'             => '12.34',
    'currency'           => 'USDC',
    'settlement_address' => '0x1234abcd...',
    'settlement_chain'   => 'arc-testnet',
    'reference'          => 'order-1042',
    'return_url'         => 'https://shop.example/checkout/thank-you/1042',
]);

header('Location: ' . $invoice->getHostedUrl());
```

Errors come back as `BlockPay\WooCommerce\BlockPayException`. Use
`$e->getCode()` for the canonical slug (`unauthorized`, `invalid_settlement_address`,
`rate_limited`, ...) and `$e->getHttpStatus()` for the HTTP code.

## Generating a reusable PaymentLink

```php
$link = $client->createPaymentLink([
    'slug'               => 'main-store',
    'settlement_address' => '0x1234abcd...',
    'settlement_chain'   => 'base-sepolia',
    'description'        => 'Main storefront',
]);

$redirect = $link->buildCheckoutUrl([
    'order_id'   => $orderId,
    'source'     => 'woocommerce',
    'return_url' => $returnUrl,
]);
```

`buildCheckoutUrl()` appends query args without clobbering an existing query
string on the hosted URL, which makes it safe to call from inside
`process_payment`.

## Using the SDK from a WooCommerce gateway

Inside a custom `WC_Payment_Gateway::process_payment()` implementation:

```php
use BlockPay\WooCommerce\Client;
use BlockPay\WooCommerce\BlockPayException;
use BlockPay\WooCommerce\WooHelpers;

public function process_payment($order_id) {
    $order  = wc_get_order($order_id);
    $client = new Client($this->get_option('api_key'));

    $payload = WooHelpers::orderToInvoiceInput($order, [
        'settlement_address' => $this->get_option('settlement_address'),
        'settlement_chain'   => $this->get_option('settlement_chain'),
        'return_url'         => $this->get_return_url($order),
    ]);

    try {
        $invoice = $client->createInvoice($payload);
    } catch (BlockPayException $e) {
        wc_add_notice(
            sprintf('BlockPay error (%s): %s', $e->getCode(), $e->getMessage()),
            'error'
        );
        return ['result' => 'failure'];
    }

    $order->update_status('pending', 'Awaiting BlockPay USDC payment.');
    wc_reduce_stock_levels($order_id);
    WC()->cart->empty_cart();

    return [
        'result'   => 'success',
        'redirect' => $invoice->getHostedUrl(),
    ];
}
```

`WooHelpers::orderToInvoiceInput()` derives `amount`, `currency`, `customer`,
`line_items`, and `metadata` from the order. The `$defaults` argument is
merged on top, so you can force the settlement target without parsing the
order again.

## Receiving webhooks

BlockPay POSTs JSON to your webhook endpoint with a Stripe-style header:

```
BlockPay-Signature: t=1715900000,v1=8d3f...
```

Verify it, decode it, and apply it to the order. A typical WP REST route:

```php
use BlockPay\WooCommerce\Webhooks;
use BlockPay\WooCommerce\WooHelpers;
use BlockPay\WooCommerce\BlockPayException;

add_action('rest_api_init', function () {
    register_rest_route('blockpay/v1', '/webhook', [
        'methods'             => 'POST',
        'permission_callback' => '__return_true',
        'callback'            => function (\WP_REST_Request $request) {
            $body      = $request->get_body();
            $signature = $request->get_header('blockpay-signature') ?? '';
            $secret    = get_option('blockpay_webhook_secret', '');

            try {
                $event = Webhooks::parse($body, $signature, $secret);
            } catch (BlockPayException $e) {
                return new \WP_REST_Response(
                    ['error' => $e->getCode()],
                    401
                );
            }

            if ($event->getType() !== 'invoice.paid') {
                return new \WP_REST_Response(['ok' => true, 'ignored' => true], 200);
            }

            $orderId = $event->getOrderId();
            if ($orderId === null) {
                return new \WP_REST_Response(['error' => 'missing_order_id'], 400);
            }

            $order = wc_get_order($orderId);
            if (!$order) {
                return new \WP_REST_Response(['error' => 'order_not_found'], 404);
            }

            WooHelpers::markOrderPaidFromPayment($order, $event->getData());
            return new \WP_REST_Response(['ok' => true], 200);
        },
    ]);
});
```

`Webhooks::verify()` accepts three signature shapes for compatibility:

1. The modern `t=...,v1=...` Stripe-style envelope (recommended).
2. A bare hex HMAC-SHA256 of the raw body (legacy).
3. The `sha256=<hex>` prefixed form (legacy).

Comparisons use `hash_equals()` and the prefixed form additionally enforces a
default 5-minute timestamp tolerance, configurable per call.

## Event types

BlockPay emits at least the following event types. The SDK does not enforce a
whitelist; switch on `$event->getType()` in your handler.

- `invoice.created`
- `invoice.paid`
- `invoice.expired`
- `payment.succeeded` (legacy alias of `invoice.paid`)
- `payment.failed`

For paid events, `$event->getData()` typically contains `tx_hash`, `chain`,
`amount`, `currency`, and `metadata`.

## Mapping BlockPay events to WooCommerce order states

| BlockPay event       | Action                                                              |
| -------------------- | ------------------------------------------------------------------- |
| `invoice.paid`       | `WooHelpers::markOrderPaidFromPayment()` → `payment_complete($tx)`  |
| `invoice.expired`    | `$order->update_status('failed', ...)` (handle yourself)            |
| `payment.failed`     | `$order->update_status('failed', ...)` (handle yourself)            |

`markOrderPaidFromPayment()` is idempotent: if the order is already paid it
records a duplicate-receipt note and returns, so safe retries from BlockPay
will not double-fire.

## Development

```bash
composer install
vendor/bin/phpunit
vendor/bin/phpstan analyse src --level=6
```

The test suite mocks Guzzle (`GuzzleHttp\Handler\MockHandler`) so it runs
fully offline.

## License

MIT. See `LICENSE`.
