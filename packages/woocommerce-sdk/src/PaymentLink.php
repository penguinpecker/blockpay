<?php

declare(strict_types=1);

namespace BlockPay\WooCommerce;

/**
 * Immutable value object representing a BlockPay PaymentLink (a reusable
 * hosted-checkout URL that any number of customers can pay).
 */
final class PaymentLink
{
    /**
     * @param array<string, mixed> $raw
     */
    public function __construct(
        private string $id,
        private string $slug,
        private string $url,
        private string $settlementAddress,
        private string $settlementChain,
        private ?string $amount,
        private ?string $currency,
        private ?string $description,
        private bool $active,
        private ?int $createdAt,
        private array $raw = []
    ) {
    }

    /**
     * @param array<string, mixed> $data
     */
    public static function fromArray(array $data): self
    {
        return new self(
            id: (string) ($data['id'] ?? ''),
            slug: (string) ($data['slug'] ?? ''),
            url: (string) ($data['url'] ?? ''),
            settlementAddress: (string) ($data['settlement_address'] ?? ''),
            settlementChain: (string) ($data['settlement_chain'] ?? ''),
            amount: isset($data['amount']) ? (string) $data['amount'] : null,
            currency: isset($data['currency']) ? (string) $data['currency'] : null,
            description: isset($data['description']) ? (string) $data['description'] : null,
            active: (bool) ($data['active'] ?? true),
            createdAt: isset($data['created_at']) ? (int) $data['created_at'] : null,
            raw: $data,
        );
    }

    public function getId(): string
    {
        return $this->id;
    }

    public function getSlug(): string
    {
        return $this->slug;
    }

    public function getUrl(): string
    {
        return $this->url;
    }

    public function getSettlementAddress(): string
    {
        return $this->settlementAddress;
    }

    public function getSettlementChain(): string
    {
        return $this->settlementChain;
    }

    public function getAmount(): ?string
    {
        return $this->amount;
    }

    public function getCurrency(): ?string
    {
        return $this->currency;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function isActive(): bool
    {
        return $this->active;
    }

    public function getCreatedAt(): ?int
    {
        return $this->createdAt;
    }

    /**
     * Build a checkout URL for this PaymentLink with cart-context query args.
     * Useful when redirecting from a WooCommerce gateway's `process_payment`.
     *
     * @param array<string, string|int> $extra
     */
    public function buildCheckoutUrl(array $extra = []): string
    {
        $base = rtrim($this->url, '/');
        if ($base === '') {
            return '';
        }

        if ($extra === []) {
            return $base;
        }

        $query = http_build_query($extra);
        $separator = str_contains($base, '?') ? '&' : '?';

        return $base . $separator . $query;
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        return $this->raw;
    }
}
