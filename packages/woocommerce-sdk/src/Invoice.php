<?php

declare(strict_types=1);

namespace BlockPay\WooCommerce;

/**
 * Immutable value object describing a BlockPay invoice as returned by the
 * REST API. Use {@see Invoice::fromArray()} to hydrate from a decoded JSON
 * response.
 */
final class Invoice
{
    /**
     * @param array<string, mixed> $raw
     */
    public function __construct(
        private string $id,
        private string $status,
        private string $amount,
        private string $currency,
        private string $settlementAddress,
        private string $settlementChain,
        private ?string $hostedUrl,
        private ?string $reference,
        private ?int $expiresAt,
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
            status: (string) ($data['status'] ?? 'unknown'),
            amount: (string) ($data['amount'] ?? '0'),
            currency: (string) ($data['currency'] ?? 'USDC'),
            settlementAddress: (string) ($data['settlement_address'] ?? ''),
            settlementChain: (string) ($data['settlement_chain'] ?? ''),
            hostedUrl: isset($data['hosted_url']) ? (string) $data['hosted_url'] : null,
            reference: isset($data['reference']) ? (string) $data['reference'] : null,
            expiresAt: isset($data['expires_at']) ? (int) $data['expires_at'] : null,
            createdAt: isset($data['created_at']) ? (int) $data['created_at'] : null,
            raw: $data,
        );
    }

    public function getId(): string
    {
        return $this->id;
    }

    public function getStatus(): string
    {
        return $this->status;
    }

    public function getAmount(): string
    {
        return $this->amount;
    }

    public function getCurrency(): string
    {
        return $this->currency;
    }

    public function getSettlementAddress(): string
    {
        return $this->settlementAddress;
    }

    public function getSettlementChain(): string
    {
        return $this->settlementChain;
    }

    public function getHostedUrl(): ?string
    {
        return $this->hostedUrl;
    }

    public function getReference(): ?string
    {
        return $this->reference;
    }

    public function getExpiresAt(): ?int
    {
        return $this->expiresAt;
    }

    public function getCreatedAt(): ?int
    {
        return $this->createdAt;
    }

    public function isPaid(): bool
    {
        return $this->status === 'paid' || $this->status === 'succeeded';
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        return $this->raw;
    }
}
