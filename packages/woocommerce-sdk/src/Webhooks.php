<?php

declare(strict_types=1);

namespace BlockPay\WooCommerce;

/**
 * Stateless helpers for verifying and decoding BlockPay webhook deliveries.
 *
 * BlockPay signs every webhook with a Stripe-style header of the form:
 *
 *     t=<unix-seconds>,v1=<hex-hmac-sha256>
 *
 * where the HMAC is computed over `<t>.<raw-body>` using the merchant's
 * webhook signing secret. For backwards compatibility with the original
 * BlockPay WooCommerce plugin we also accept:
 *
 *   - bare hex strings (HMAC over the raw body only), and
 *   - the `sha256=<hex>` prefixed form (HMAC over the raw body only).
 */
final class Webhooks
{
    /**
     * Default tolerance for the `t=` timestamp in the prefixed signature
     * format, in seconds.
     */
    public const DEFAULT_TOLERANCE = 300;

    /**
     * Verify a BlockPay webhook signature against the raw request body.
     *
     * Accepts both the modern Stripe-style `t=...,v1=...` envelope and the
     * legacy bare/sha256-prefixed hex forms. Uses {@see hash_equals()} for
     * timing-safe comparison.
     */
    public static function verify(
        string $rawBody,
        string $signature,
        string $secret,
        int $tolerance = self::DEFAULT_TOLERANCE,
        ?int $now = null
    ): bool {
        if ($secret === '' || $signature === '') {
            return false;
        }

        if (str_contains($signature, 't=') && str_contains($signature, 'v1=')) {
            return self::verifyPrefixed($rawBody, $signature, $secret, $tolerance, $now);
        }

        return self::verifyBare($rawBody, $signature, $secret);
    }

    /**
     * Verify a webhook signature and decode its body. Throws on any failure.
     *
     * @throws BlockPayException When the signature is invalid or the body is
     *                           not valid JSON.
     */
    public static function parse(
        string $rawBody,
        string $signature,
        string $secret,
        int $tolerance = self::DEFAULT_TOLERANCE,
        ?int $now = null
    ): WebhookEvent {
        if (!self::verify($rawBody, $signature, $secret, $tolerance, $now)) {
            throw new BlockPayException(
                'BlockPay webhook signature verification failed.',
                'invalid_signature',
                401
            );
        }

        /** @var mixed $decoded */
        $decoded = json_decode($rawBody, true);
        if (!is_array($decoded)) {
            throw new BlockPayException(
                'BlockPay webhook body was not valid JSON.',
                'invalid_json',
                400
            );
        }

        /** @var array<string, mixed> $decoded */
        return WebhookEvent::fromArray($decoded);
    }

    private static function verifyPrefixed(
        string $rawBody,
        string $signature,
        string $secret,
        int $tolerance,
        ?int $now
    ): bool {
        $timestamp = null;
        $signatures = [];

        foreach (explode(',', $signature) as $part) {
            $part = trim($part);
            if ($part === '') {
                continue;
            }
            $eq = strpos($part, '=');
            if ($eq === false) {
                continue;
            }
            $key = substr($part, 0, $eq);
            $value = substr($part, $eq + 1);

            if ($key === 't') {
                $timestamp = $value;
            } elseif ($key === 'v1') {
                $signatures[] = $value;
            }
        }

        if ($timestamp === null || !ctype_digit($timestamp) || $signatures === []) {
            return false;
        }

        $tsInt = (int) $timestamp;
        $clock = $now ?? time();
        if ($tolerance > 0 && abs($clock - $tsInt) > $tolerance) {
            return false;
        }

        $signedPayload = $timestamp . '.' . $rawBody;
        $expected = hash_hmac('sha256', $signedPayload, $secret);

        foreach ($signatures as $candidate) {
            if (hash_equals($expected, $candidate)) {
                return true;
            }
        }

        return false;
    }

    private static function verifyBare(string $rawBody, string $signature, string $secret): bool
    {
        $provided = $signature;
        if (str_starts_with($provided, 'sha256=')) {
            $provided = substr($provided, 7);
        }

        // A bare body-only signature must look like a hex digest. If it
        // contains `=` after the prefix strip it is not a valid bare hash
        // and we should reject it rather than fall through.
        if ($provided === '' || !ctype_xdigit($provided)) {
            return false;
        }

        $expected = hash_hmac('sha256', $rawBody, $secret);

        return hash_equals($expected, $provided);
    }

    /**
     * Build a Stripe-style signature header for a payload. Primarily useful
     * in tests and when self-signing internal retries.
     */
    public static function sign(string $rawBody, string $secret, ?int $timestamp = null): string
    {
        $ts = $timestamp ?? time();
        $signedPayload = $ts . '.' . $rawBody;
        $hmac = hash_hmac('sha256', $signedPayload, $secret);

        return 't=' . $ts . ',v1=' . $hmac;
    }
}
