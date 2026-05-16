<?php

declare(strict_types=1);

namespace BlockPay\WooCommerce;

use GuzzleHttp\Client as GuzzleClient;
use GuzzleHttp\ClientInterface;
use GuzzleHttp\Exception\ConnectException;
use GuzzleHttp\Exception\GuzzleException;
use GuzzleHttp\Exception\RequestException;
use Psr\Http\Message\ResponseInterface;
use Throwable;

/**
 * Thin REST client for the BlockPay merchant API.
 *
 * The client is intentionally minimal: it handles authentication, JSON
 * encoding/decoding, and error normalisation. All BlockPay responses are
 * lifted into typed value objects ({@see Invoice}, {@see PaymentLink}) so
 * callers never have to deal with raw arrays unless they want to.
 *
 * Construct directly with an API key:
 *
 *     $client = new Client('blockpay_live_...');
 *     $invoice = $client->createInvoice([
 *         'amount' => '12.34',
 *         'currency' => 'USDC',
 *         'settlement_address' => '0x...',
 *         'settlement_chain' => 'arc-testnet',
 *         'reference' => 'wc-order-123',
 *     ]);
 */
final class Client
{
    public const DEFAULT_BASE_URL = 'https://blockpay-six.vercel.app';
    public const DEFAULT_TIMEOUT = 15.0;
    public const USER_AGENT = 'blockpay-woocommerce-sdk-php/1.0';

    private string $apiKey;
    private string $baseUrl;
    private ClientInterface $http;

    /**
     * @param string                $apiKey  BlockPay API key (Bearer token).
     * @param string|null           $baseUrl Override the API base URL. Defaults to production.
     * @param ClientInterface|null  $http    Optional Guzzle (or compatible) client. Useful for tests.
     */
    public function __construct(
        string $apiKey,
        ?string $baseUrl = self::DEFAULT_BASE_URL,
        ?ClientInterface $http = null
    ) {
        if ($apiKey === '') {
            throw new BlockPayException(
                'BlockPay API key is required.',
                'missing_api_key',
                0
            );
        }

        $this->apiKey = $apiKey;
        $this->baseUrl = rtrim($baseUrl ?? self::DEFAULT_BASE_URL, '/');
        $this->http = $http ?? new GuzzleClient([
            'timeout' => self::DEFAULT_TIMEOUT,
            'http_errors' => false,
            'headers' => [
                'User-Agent' => self::USER_AGENT,
            ],
        ]);
    }

    public function getBaseUrl(): string
    {
        return $this->baseUrl;
    }

    /**
     * Create a one-shot invoice for a specific customer/order.
     *
     * @param array<string, mixed> $input
     *
     * @throws BlockPayException
     */
    public function createInvoice(array $input): Invoice
    {
        $response = $this->request('POST', '/api/invoices', $input);

        return Invoice::fromArray($this->expectObject($response, 'invoice'));
    }

    /**
     * Look up a previously-created invoice by ID.
     *
     * @throws BlockPayException
     */
    public function getInvoice(string $id): Invoice
    {
        if ($id === '') {
            throw new BlockPayException(
                'Invoice id is required.',
                'missing_invoice_id',
                0
            );
        }

        $response = $this->request('GET', '/api/invoices/' . rawurlencode($id));

        return Invoice::fromArray($this->expectObject($response, 'invoice'));
    }

    /**
     * List invoices, optionally filtered. Supported filter keys depend on
     * the BlockPay API (e.g. `status`, `limit`, `cursor`, `reference`).
     *
     * @param array<string, mixed> $filter
     *
     * @return array<int, Invoice>
     *
     * @throws BlockPayException
     */
    public function listInvoices(array $filter = []): array
    {
        $path = '/api/invoices';
        if ($filter !== []) {
            $path .= '?' . http_build_query($filter);
        }

        $response = $this->request('GET', $path);
        $decoded = $this->decode($response);

        $rows = $decoded['data'] ?? $decoded['invoices'] ?? $decoded;
        if (!is_array($rows)) {
            return [];
        }

        $out = [];
        foreach ($rows as $row) {
            if (is_array($row)) {
                /** @var array<string, mixed> $row */
                $out[] = Invoice::fromArray($row);
            }
        }

        return $out;
    }

    /**
     * Create a reusable PaymentLink (hosted checkout URL).
     *
     * @param array<string, mixed> $input
     *
     * @throws BlockPayException
     */
    public function createPaymentLink(array $input): PaymentLink
    {
        $response = $this->request('POST', '/api/payment-links', $input);

        return PaymentLink::fromArray($this->expectObject($response, 'payment_link'));
    }

    /**
     * Issue a request against the BlockPay API, applying auth headers and
     * normalising error responses into {@see BlockPayException}.
     *
     * @param array<string, mixed>|null $body JSON payload (when applicable).
     *
     * @throws BlockPayException
     */
    private function request(string $method, string $path, ?array $body = null): ResponseInterface
    {
        $url = $this->baseUrl . $path;

        $options = [
            'headers' => [
                'Authorization' => 'Bearer ' . $this->apiKey,
                'Accept' => 'application/json',
                'User-Agent' => self::USER_AGENT,
            ],
        ];

        if ($body !== null) {
            $options['json'] = $body;
            $options['headers']['Content-Type'] = 'application/json';
        }

        try {
            $response = $this->http->request($method, $url, $options);
        } catch (ConnectException $e) {
            throw new BlockPayException(
                'Could not reach BlockPay API: ' . $e->getMessage(),
                'network_error',
                0,
                [],
                $e
            );
        } catch (RequestException $e) {
            $resp = $e->getResponse();
            if ($resp !== null) {
                $this->throwFromResponse($resp);
            }
            throw new BlockPayException(
                'BlockPay API request failed: ' . $e->getMessage(),
                'request_failed',
                0,
                [],
                $e
            );
        } catch (GuzzleException $e) {
            throw new BlockPayException(
                'BlockPay API request failed: ' . $e->getMessage(),
                'request_failed',
                0,
                [],
                $e
            );
        } catch (Throwable $e) {
            throw new BlockPayException(
                'Unexpected error calling BlockPay API: ' . $e->getMessage(),
                'unexpected_error',
                0,
                [],
                $e
            );
        }

        $status = $response->getStatusCode();
        if ($status < 200 || $status >= 300) {
            $this->throwFromResponse($response);
        }

        return $response;
    }

    /**
     * @throws BlockPayException
     */
    private function throwFromResponse(ResponseInterface $response): void
    {
        $status = $response->getStatusCode();
        $body = $this->safeDecode((string) $response->getBody());

        $errorCode = 'http_' . $status;
        $message = $response->getReasonPhrase() !== ''
            ? $response->getReasonPhrase()
            : 'BlockPay API returned HTTP ' . $status;

        if (is_array($body)) {
            $candidateError = $body['error'] ?? null;
            if (is_array($candidateError)) {
                if (isset($candidateError['code']) && is_string($candidateError['code'])) {
                    $errorCode = $candidateError['code'];
                }
                if (isset($candidateError['message']) && is_string($candidateError['message'])) {
                    $message = $candidateError['message'];
                }
            } elseif (is_string($candidateError)) {
                // Bodies of the shape { "error": "unauthorized", "message": "..." }.
                $errorCode = $candidateError;
                if (isset($body['message']) && is_string($body['message'])) {
                    $message = $body['message'];
                }
            }

            if (isset($body['code']) && is_string($body['code'])) {
                $errorCode = $body['code'];
            }

            if ($message === '' && isset($body['message']) && is_string($body['message'])) {
                $message = $body['message'];
            }
        }

        // Special-case the common ones so callers can branch without
        // memorising HTTP codes.
        if ($errorCode === 'http_401') {
            $errorCode = 'unauthorized';
        } elseif ($errorCode === 'http_403') {
            $errorCode = 'forbidden';
        } elseif ($errorCode === 'http_404') {
            $errorCode = 'not_found';
        } elseif ($errorCode === 'http_429') {
            $errorCode = 'rate_limited';
        }

        throw new BlockPayException(
            $message,
            $errorCode,
            $status,
            is_array($body) ? $body : []
        );
    }

    /**
     * Decode a successful response body, requiring it to be a JSON object.
     *
     * @return array<string, mixed>
     *
     * @throws BlockPayException
     */
    private function expectObject(ResponseInterface $response, string $context): array
    {
        $decoded = $this->decode($response);
        if ($decoded === []) {
            // An empty object is technically valid, but treat truly empty
            // (no decode at all) as a structural error.
            return $decoded;
        }
        if (array_is_list($decoded)) {
            throw new BlockPayException(
                'Expected a ' . $context . ' object from BlockPay API, got a list.',
                'unexpected_response_shape',
                $response->getStatusCode()
            );
        }

        return $decoded;
    }

    /**
     * @return array<string, mixed>
     *
     * @throws BlockPayException
     */
    private function decode(ResponseInterface $response): array
    {
        $body = (string) $response->getBody();
        if ($body === '') {
            return [];
        }
        $decoded = $this->safeDecode($body);
        if ($decoded === null) {
            throw new BlockPayException(
                'BlockPay API returned a body that was not valid JSON.',
                'invalid_response',
                $response->getStatusCode()
            );
        }

        return $decoded;
    }

    /**
     * Decode a JSON string without throwing. Returns null when the body is
     * not a JSON value, and an empty array when it is a scalar/null.
     *
     * @return array<string, mixed>|null
     */
    private function safeDecode(string $body): ?array
    {
        if ($body === '') {
            return [];
        }
        /** @var mixed $decoded */
        $decoded = json_decode($body, true);
        if ($decoded === null && json_last_error() !== JSON_ERROR_NONE) {
            return null;
        }
        if (!is_array($decoded)) {
            return [];
        }

        /** @var array<string, mixed> $decoded */
        return $decoded;
    }
}
