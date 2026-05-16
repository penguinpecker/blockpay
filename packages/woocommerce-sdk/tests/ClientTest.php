<?php

declare(strict_types=1);

namespace BlockPay\WooCommerce\Tests;

use BlockPay\WooCommerce\BlockPayException;
use BlockPay\WooCommerce\Client;
use GuzzleHttp\Client as GuzzleClient;
use GuzzleHttp\Handler\MockHandler;
use GuzzleHttp\HandlerStack;
use GuzzleHttp\Middleware;
use GuzzleHttp\Psr7\Response;
use PHPUnit\Framework\TestCase;
use Psr\Http\Message\RequestInterface;

final class ClientTest extends TestCase
{
    /**
     * @param array<int, Response> $responses
     * @param array<int, array{0: RequestInterface, 1: array<string, mixed>}> $history
     */
    private function makeClient(array $responses, array &$history = []): Client
    {
        $mock = new MockHandler($responses);
        $stack = HandlerStack::create($mock);
        $stack->push(Middleware::history($history));
        $guzzle = new GuzzleClient([
            'handler' => $stack,
            'http_errors' => false,
        ]);

        return new Client('blockpay_test_key', 'https://api.blockpay.test', $guzzle);
    }

    public function testCreateInvoiceSendsBearerTokenAndReturnsTypedInvoice(): void
    {
        $body = json_encode([
            'id' => 'inv_123',
            'status' => 'pending',
            'amount' => '12.34',
            'currency' => 'USDC',
            'settlement_address' => '0xabc',
            'settlement_chain' => 'arc-testnet',
            'hosted_url' => 'https://blockpay.test/i/inv_123',
            'reference' => 'wc-order-1',
            'expires_at' => 1715900000,
            'created_at' => 1715800000,
        ], JSON_THROW_ON_ERROR);

        $history = [];
        $client = $this->makeClient(
            [new Response(201, ['Content-Type' => 'application/json'], $body)],
            $history
        );

        $invoice = $client->createInvoice([
            'amount' => '12.34',
            'currency' => 'USDC',
            'settlement_address' => '0xabc',
            'settlement_chain' => 'arc-testnet',
            'reference' => 'wc-order-1',
        ]);

        $this->assertSame('inv_123', $invoice->getId());
        $this->assertSame('pending', $invoice->getStatus());
        $this->assertSame('https://blockpay.test/i/inv_123', $invoice->getHostedUrl());
        $this->assertFalse($invoice->isPaid());

        $this->assertCount(1, $history);
        /** @var RequestInterface $request */
        $request = $history[0]['request'];
        $this->assertSame('POST', $request->getMethod());
        $this->assertSame('/api/invoices', $request->getUri()->getPath());
        $this->assertSame('Bearer blockpay_test_key', $request->getHeaderLine('Authorization'));
        $this->assertSame('application/json', $request->getHeaderLine('Content-Type'));
        $this->assertStringContainsString('wc-order-1', (string) $request->getBody());
    }

    public function testUnauthorizedResponseRaisesExceptionWithCanonicalCode(): void
    {
        $client = $this->makeClient([
            new Response(401, ['Content-Type' => 'application/json'], json_encode([
                'error' => 'unauthorized',
                'message' => 'Invalid API key.',
            ], JSON_THROW_ON_ERROR)),
        ]);

        try {
            $client->createInvoice(['amount' => '1', 'currency' => 'USDC']);
            $this->fail('Expected BlockPayException');
        } catch (BlockPayException $e) {
            $this->assertSame('unauthorized', $e->getCode());
            $this->assertSame(401, $e->getHttpStatus());
            $this->assertSame('Invalid API key.', $e->getMessage());
        }
    }

    public function testBadRequestSurfacesNestedErrorCode(): void
    {
        $client = $this->makeClient([
            new Response(400, ['Content-Type' => 'application/json'], json_encode([
                'error' => [
                    'code' => 'invalid_settlement_address',
                    'message' => 'Settlement address must be a 0x-prefixed EVM address.',
                ],
            ], JSON_THROW_ON_ERROR)),
        ]);

        try {
            $client->createInvoice(['amount' => '1', 'currency' => 'USDC']);
            $this->fail('Expected BlockPayException');
        } catch (BlockPayException $e) {
            $this->assertSame('invalid_settlement_address', $e->getCode());
            $this->assertSame(400, $e->getHttpStatus());
            $this->assertStringContainsString('0x-prefixed', $e->getMessage());
        }
    }

    public function testGetInvoiceRoundTripIssuesGetRequestAndDecodes(): void
    {
        $history = [];
        $client = $this->makeClient(
            [
                new Response(200, ['Content-Type' => 'application/json'], json_encode([
                    'id' => 'inv_abc',
                    'status' => 'paid',
                    'amount' => '99.00',
                    'currency' => 'USDC',
                    'settlement_address' => '0xdef',
                    'settlement_chain' => 'base-sepolia',
                ], JSON_THROW_ON_ERROR)),
            ],
            $history
        );

        $invoice = $client->getInvoice('inv_abc');

        $this->assertSame('inv_abc', $invoice->getId());
        $this->assertSame('paid', $invoice->getStatus());
        $this->assertTrue($invoice->isPaid());
        $this->assertSame('base-sepolia', $invoice->getSettlementChain());

        $this->assertCount(1, $history);
        /** @var RequestInterface $request */
        $request = $history[0]['request'];
        $this->assertSame('GET', $request->getMethod());
        $this->assertSame('/api/invoices/inv_abc', $request->getUri()->getPath());
        $this->assertSame('Bearer blockpay_test_key', $request->getHeaderLine('Authorization'));
    }

    public function testListInvoicesParsesDataArray(): void
    {
        $history = [];
        $client = $this->makeClient(
            [
                new Response(200, ['Content-Type' => 'application/json'], json_encode([
                    'data' => [
                        ['id' => 'inv_1', 'status' => 'paid', 'amount' => '1'],
                        ['id' => 'inv_2', 'status' => 'pending', 'amount' => '2'],
                    ],
                ], JSON_THROW_ON_ERROR)),
            ],
            $history
        );

        $invoices = $client->listInvoices(['status' => 'paid', 'limit' => 5]);

        $this->assertCount(2, $invoices);
        $this->assertSame('inv_1', $invoices[0]->getId());
        $this->assertSame('inv_2', $invoices[1]->getId());

        /** @var RequestInterface $request */
        $request = $history[0]['request'];
        $this->assertSame('/api/invoices', $request->getUri()->getPath());
        $this->assertSame('status=paid&limit=5', $request->getUri()->getQuery());
    }

    public function testCreatePaymentLinkReturnsTypedPaymentLink(): void
    {
        $client = $this->makeClient([
            new Response(201, ['Content-Type' => 'application/json'], json_encode([
                'id' => 'pl_1',
                'slug' => 'my-store',
                'url' => 'https://blockpay.test/p/my-store',
                'settlement_address' => '0xabc',
                'settlement_chain' => 'arc-testnet',
                'active' => true,
                'created_at' => 1715800000,
            ], JSON_THROW_ON_ERROR)),
        ]);

        $link = $client->createPaymentLink([
            'slug' => 'my-store',
            'settlement_address' => '0xabc',
            'settlement_chain' => 'arc-testnet',
        ]);

        $this->assertSame('pl_1', $link->getId());
        $this->assertSame('my-store', $link->getSlug());
        $this->assertTrue($link->isActive());
        $this->assertStringContainsString(
            'order_id=42',
            $link->buildCheckoutUrl(['order_id' => 42, 'source' => 'woocommerce'])
        );
    }

    public function testEmptyApiKeyRaisesException(): void
    {
        $this->expectException(BlockPayException::class);
        $this->expectExceptionMessage('API key is required');

        new Client('');
    }
}
