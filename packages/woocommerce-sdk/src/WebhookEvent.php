<?php

declare(strict_types=1);

namespace BlockPay\WooCommerce;

/**
 * Immutable value object representing a verified webhook delivery from
 * BlockPay. Construct via {@see Webhooks::parse()} after a successful HMAC
 * signature check.
 */
final class WebhookEvent
{
    /**
     * @param array<string, mixed> $data
     * @param array<string, mixed> $raw
     */
    public function __construct(
        private string $id,
        private string $type,
        private int $ts,
        private array $data,
        private array $raw = []
    ) {
    }

    /**
     * @param array<string, mixed> $payload
     */
    public static function fromArray(array $payload): self
    {
        // Accept both the new BlockPay envelope (id/type/data/created_at)
        // and the legacy flat shape (event/order_id/tx_hash/timestamp).
        $type = isset($payload['type'])
            ? (string) $payload['type']
            : (string) ($payload['event'] ?? '');

        $id = isset($payload['id']) ? (string) $payload['id'] : '';

        $ts = 0;
        if (isset($payload['created_at'])) {
            $ts = (int) $payload['created_at'];
        } elseif (isset($payload['timestamp'])) {
            $ts = (int) $payload['timestamp'];
        }

        if (isset($payload['data']) && is_array($payload['data'])) {
            /** @var array<string, mixed> $data */
            $data = $payload['data'];
        } else {
            // Promote known top-level fields into a data payload so callers
            // get a stable shape even on legacy webhooks.
            $data = $payload;
            unset($data['type'], $data['event'], $data['id'], $data['created_at'], $data['timestamp']);
        }

        return new self(
            id: $id,
            type: $type,
            ts: $ts,
            data: $data,
            raw: $payload,
        );
    }

    public function getId(): string
    {
        return $this->id;
    }

    public function getType(): string
    {
        return $this->type;
    }

    public function getTs(): int
    {
        return $this->ts;
    }

    /**
     * @return array<string, mixed>
     */
    public function getData(): array
    {
        return $this->data;
    }

    /**
     * Convenience: returns the WooCommerce order ID embedded in the payload,
     * or null if not present. Looks at common locations used by BlockPay
     * webhooks (top level, in `data`, or under `metadata`).
     */
    public function getOrderId(): ?int
    {
        $candidate = $this->data['order_id'] ?? $this->raw['order_id'] ?? null;

        if ($candidate === null) {
            $metaData = $this->data['metadata'] ?? null;
            if (is_array($metaData) && isset($metaData['order_id'])) {
                $candidate = $metaData['order_id'];
            }
        }

        if ($candidate === null) {
            $metaRaw = $this->raw['metadata'] ?? null;
            if (is_array($metaRaw) && isset($metaRaw['order_id'])) {
                $candidate = $metaRaw['order_id'];
            }
        }

        if ($candidate === null || $candidate === '') {
            return null;
        }

        if (is_int($candidate)) {
            return $candidate;
        }

        if (is_string($candidate) && ctype_digit($candidate)) {
            return (int) $candidate;
        }

        if (is_numeric($candidate)) {
            return (int) $candidate;
        }

        return null;
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        return $this->raw;
    }
}
