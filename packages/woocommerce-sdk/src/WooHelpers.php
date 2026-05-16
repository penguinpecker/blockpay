<?php

declare(strict_types=1);

namespace BlockPay\WooCommerce;

/**
 * Bridge helpers between BlockPay and WooCommerce. None of these methods
 * import WooCommerce types at parse time: every entry point checks for
 * `WC_Order` via {@see class_exists()} so the SDK can be required in a
 * non-WordPress context (e.g. for unit tests) without fatal errors.
 *
 * The `\WC_Order` references in docblocks are intentional: they document
 * the expected duck-type without forcing PHP to autoload it.
 */
final class WooHelpers
{
    /**
     * Convert a WooCommerce order into a payload suitable for
     * {@see Client::createInvoice()}.
     *
     * @param object               $order    A `\WC_Order` instance.
     * @param array<string, mixed> $defaults Optional fields merged on top of the derived payload
     *                                       (e.g. `settlement_address`, `settlement_chain`, `description`).
     *
     * @return array<string, mixed>
     */
    public static function orderToInvoiceInput(object $order, array $defaults = []): array
    {
        self::ensureWcOrder($order);

        /** @var mixed $orderIdRaw */
        $orderIdRaw = self::call($order, 'get_id');
        $orderId = is_scalar($orderIdRaw) ? (string) $orderIdRaw : '';

        /** @var mixed $totalRaw */
        $totalRaw = self::call($order, 'get_total');
        $amount = self::formatAmount($totalRaw);

        /** @var mixed $currencyRaw */
        $currencyRaw = self::call($order, 'get_currency');
        $currency = is_string($currencyRaw) && $currencyRaw !== '' ? $currencyRaw : 'USDC';

        /** @var mixed $emailRaw */
        $emailRaw = self::call($order, 'get_billing_email');
        $email = is_string($emailRaw) ? $emailRaw : '';

        /** @var mixed $firstNameRaw */
        $firstNameRaw = self::call($order, 'get_billing_first_name');
        /** @var mixed $lastNameRaw */
        $lastNameRaw = self::call($order, 'get_billing_last_name');
        $name = trim(
            (is_string($firstNameRaw) ? $firstNameRaw : '')
            . ' '
            . (is_string($lastNameRaw) ? $lastNameRaw : '')
        );

        /** @var mixed $orderKeyRaw */
        $orderKeyRaw = self::call($order, 'get_order_key');
        $orderKey = is_string($orderKeyRaw) ? $orderKeyRaw : '';

        /** @var mixed $returnUrl */
        $returnUrl = self::call($order, 'get_checkout_order_received_url');

        $items = [];
        /** @var mixed $rawItems */
        $rawItems = self::call($order, 'get_items');
        if (is_iterable($rawItems)) {
            foreach ($rawItems as $item) {
                if (!is_object($item)) {
                    continue;
                }
                /** @var mixed $itemName */
                $itemName = self::call($item, 'get_name');
                /** @var mixed $itemQty */
                $itemQty = self::call($item, 'get_quantity');
                /** @var mixed $itemTotal */
                $itemTotal = self::call($item, 'get_total');

                $items[] = [
                    'name' => is_string($itemName) ? $itemName : '',
                    'quantity' => is_numeric($itemQty) ? (int) $itemQty : 1,
                    'amount' => self::formatAmount($itemTotal),
                ];
            }
        }

        $payload = [
            'reference' => $orderId !== '' ? 'wc-order-' . $orderId : null,
            'amount' => $amount,
            'currency' => $currency,
            'customer' => array_filter(
                [
                    'email' => $email !== '' ? $email : null,
                    'name' => $name !== '' ? $name : null,
                ],
                static fn ($v) => $v !== null && $v !== ''
            ),
            'metadata' => array_filter(
                [
                    'order_id' => $orderId !== '' ? $orderId : null,
                    'order_key' => $orderKey !== '' ? $orderKey : null,
                    'source' => 'woocommerce',
                ],
                static fn ($v) => $v !== null && $v !== ''
            ),
            'line_items' => $items,
            'return_url' => is_string($returnUrl) && $returnUrl !== '' ? $returnUrl : null,
        ];

        // Drop nulls / empty arrays so we send a tight payload.
        $payload = array_filter(
            $payload,
            static function ($v) {
                if ($v === null) {
                    return false;
                }
                if (is_array($v) && $v === []) {
                    return false;
                }
                return true;
            }
        );

        // Defaults overlay last so callers can force settlement_address /
        // settlement_chain / description without us second-guessing them.
        return array_merge($payload, $defaults);
    }

    /**
     * Mark a WooCommerce order paid based on a BlockPay payment event.
     *
     * The `$blockpayPayment` array is expected to contain at minimum a
     * `tx_hash`; `chain`, `amount`, and `currency` are used to write a
     * human-readable order note. Idempotent: if the order is already paid
     * we add a duplicate-receipt note and bail.
     *
     * @param object               $order            A `\WC_Order` instance.
     * @param array<string, mixed> $blockpayPayment  Webhook `data` payload (or a flat legacy payload).
     */
    public static function markOrderPaidFromPayment(object $order, array $blockpayPayment): void
    {
        self::ensureWcOrder($order);

        $txHash = isset($blockpayPayment['tx_hash']) ? (string) $blockpayPayment['tx_hash'] : '';
        $chain = isset($blockpayPayment['chain']) ? (string) $blockpayPayment['chain'] : '';
        $amount = isset($blockpayPayment['amount']) ? (string) $blockpayPayment['amount'] : '';
        $currency = isset($blockpayPayment['currency']) ? (string) $blockpayPayment['currency'] : 'USDC';

        /** @var mixed $isPaid */
        $isPaid = self::call($order, 'is_paid');
        if ($isPaid === true) {
            self::call($order, 'add_order_note', [
                self::formatDuplicateNote($txHash, $chain),
            ]);
            return;
        }

        self::call($order, 'payment_complete', [$txHash]);

        $note = self::formatPaidNote($chain, $amount, $currency, $txHash);
        self::call($order, 'add_order_note', [$note]);

        if ($txHash !== '') {
            self::call($order, 'update_meta_data', ['_blockpay_tx_hash', $txHash]);
        }
        if ($chain !== '') {
            self::call($order, 'update_meta_data', ['_blockpay_chain', $chain]);
        }
        if ($amount !== '') {
            self::call($order, 'update_meta_data', ['_blockpay_amount', $amount]);
        }
        if ($currency !== '') {
            self::call($order, 'update_meta_data', ['_blockpay_currency', $currency]);
        }

        self::call($order, 'save');
    }

    /**
     * @throws BlockPayException When called against something that is not a `\WC_Order`.
     */
    private static function ensureWcOrder(object $order): void
    {
        if (class_exists('\\WC_Order') && !($order instanceof \WC_Order)) {
            throw new BlockPayException(
                'Expected a \\WC_Order instance.',
                'invalid_order',
                0
            );
        }
        // If WC_Order isn't even loaded we accept any object; downstream
        // method calls will fail in a more descriptive way if the duck-type
        // doesn't match.
    }

    /**
     * @param array<int, mixed> $args
     *
     * @return mixed
     */
    private static function call(object $target, string $method, array $args = [])
    {
        if (!method_exists($target, $method) && !is_callable([$target, $method])) {
            return null;
        }
        /** @var callable $callable */
        $callable = [$target, $method];
        return $callable(...$args);
    }

    /**
     * Normalise an amount-like input to a string with a sensible precision.
     *
     * @param mixed $raw
     */
    private static function formatAmount($raw): string
    {
        if (is_string($raw) && $raw !== '') {
            return $raw;
        }
        if (is_int($raw) || is_float($raw)) {
            return rtrim(rtrim(number_format((float) $raw, 6, '.', ''), '0'), '.') ?: '0';
        }
        if (is_numeric($raw)) {
            return (string) $raw;
        }
        return '0';
    }

    private static function formatPaidNote(string $chain, string $amount, string $currency, string $txHash): string
    {
        $parts = [];
        $parts[] = 'BlockPay payment confirmed';
        if ($amount !== '') {
            $parts[] = $amount . ' ' . ($currency !== '' ? $currency : 'USDC');
        }
        if ($chain !== '') {
            $parts[] = 'on ' . $chain;
        }
        $line = implode(' ', $parts) . '.';
        if ($txHash !== '') {
            $line .= ' Tx: ' . $txHash;
        }
        return $line;
    }

    private static function formatDuplicateNote(string $txHash, string $chain): string
    {
        $tx = $txHash !== '' ? $txHash : 'n/a';
        $chainPart = $chain !== '' ? (' on ' . $chain) : '';
        return 'BlockPay duplicate payment notification received' . $chainPart . '. Tx: ' . $tx;
    }
}
