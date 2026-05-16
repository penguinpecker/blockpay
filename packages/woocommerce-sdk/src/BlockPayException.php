<?php

declare(strict_types=1);

namespace BlockPay\WooCommerce;

use RuntimeException;
use Throwable;

/**
 * Exception thrown when the BlockPay API returns a non-2xx response, when
 * the SDK is unable to reach the API, or when an incoming payload fails
 * validation.
 *
 * The string error code returned by the BlockPay API (e.g. "unauthorized",
 * "invalid_settlement_address") is preserved via {@see getCode()} so callers
 * can branch on it. We deliberately override the inherited integer-typed
 * code with a string, because BlockPay error codes are slugs, not numbers.
 */
final class BlockPayException extends RuntimeException
{
    /**
     * BlockPay error slug (e.g. "unauthorized").
     */
    private string $errorCode;

    /**
     * HTTP status code returned by the API, when applicable.
     */
    private int $httpStatus;

    /**
     * Raw decoded response body, when available.
     *
     * @var array<string, mixed>
     */
    private array $responseBody;

    /**
     * @param array<string, mixed> $responseBody
     */
    public function __construct(
        string $message,
        string $errorCode = 'unknown_error',
        int $httpStatus = 0,
        array $responseBody = [],
        ?Throwable $previous = null
    ) {
        parent::__construct($message, 0, $previous);
        $this->errorCode = $errorCode;
        $this->httpStatus = $httpStatus;
        $this->responseBody = $responseBody;
    }

    /**
     * Returns the BlockPay error code slug.
     *
     * Overrides {@see \Exception::getCode()} (declared as `int` in the SDK
     * docblock sense) to return the canonical slug used by the BlockPay API.
     */
    public function getCode(): string
    {
        return $this->errorCode;
    }

    public function getHttpStatus(): int
    {
        return $this->httpStatus;
    }

    /**
     * @return array<string, mixed>
     */
    public function getResponseBody(): array
    {
        return $this->responseBody;
    }
}
