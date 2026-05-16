<?php

declare(strict_types=1);

namespace BlockPay\WooCommerce\Tests;

use BlockPay\WooCommerce\BlockPayException;
use BlockPay\WooCommerce\Webhooks;
use PHPUnit\Framework\TestCase;

final class WebhooksTest extends TestCase
{
    private const SECRET = 'whsec_test_super_secret_value';

    public function testValidPrefixedSignaturePasses(): void
    {
        $body = '{"id":"evt_1","type":"invoice.paid","data":{"order_id":42}}';
        $ts = 1715900000;
        $signature = Webhooks::sign($body, self::SECRET, $ts);

        $this->assertTrue(
            Webhooks::verify($body, $signature, self::SECRET, 300, $ts)
        );
    }

    public function testTamperedBodyFailsVerification(): void
    {
        $body = '{"id":"evt_1","type":"invoice.paid","data":{"order_id":42}}';
        $ts = 1715900000;
        $signature = Webhooks::sign($body, self::SECRET, $ts);

        $tamperedBody = '{"id":"evt_1","type":"invoice.paid","data":{"order_id":999}}';

        $this->assertFalse(
            Webhooks::verify($tamperedBody, $signature, self::SECRET, 300, $ts)
        );
    }

    public function testWrongSecretFailsVerification(): void
    {
        $body = '{"id":"evt_1","type":"invoice.paid","data":{"order_id":42}}';
        $ts = 1715900000;
        $signature = Webhooks::sign($body, self::SECRET, $ts);

        $this->assertFalse(
            Webhooks::verify($body, $signature, 'whsec_wrong_secret', 300, $ts)
        );
    }

    public function testPrefixedFormatIsParsedRegardlessOfWhitespace(): void
    {
        $body = '{"id":"evt_2","type":"invoice.paid"}';
        $ts = 1715900100;
        $hmac = hash_hmac('sha256', $ts . '.' . $body, self::SECRET);
        $signature = " t=$ts , v1=$hmac ";

        $this->assertTrue(
            Webhooks::verify($body, $signature, self::SECRET, 300, $ts)
        );
    }

    public function testBareHexFormatPassesForLegacyCallers(): void
    {
        $body = '{"event":"payment.succeeded","order_id":7,"tx_hash":"0xabc"}';
        $bare = hash_hmac('sha256', $body, self::SECRET);

        $this->assertTrue(Webhooks::verify($body, $bare, self::SECRET));
        $this->assertTrue(
            Webhooks::verify($body, 'sha256=' . $bare, self::SECRET)
        );
    }

    public function testParseReturnsTypedEventForPrefixedSignature(): void
    {
        $body = json_encode([
            'id' => 'evt_abc',
            'type' => 'invoice.paid',
            'created_at' => 1715901234,
            'data' => [
                'order_id' => '101',
                'tx_hash' => '0xdeadbeef',
                'chain' => 'arc-testnet',
                'amount' => '12.34',
                'currency' => 'USDC',
            ],
        ], JSON_THROW_ON_ERROR);

        $ts = 1715901234;
        $signature = Webhooks::sign($body, self::SECRET, $ts);

        $event = Webhooks::parse($body, $signature, self::SECRET, 300, $ts);

        $this->assertSame('evt_abc', $event->getId());
        $this->assertSame('invoice.paid', $event->getType());
        $this->assertSame(1715901234, $event->getTs());
        $this->assertSame(101, $event->getOrderId());
        $this->assertSame('0xdeadbeef', $event->getData()['tx_hash']);
    }

    public function testParseThrowsOnInvalidSignature(): void
    {
        $this->expectException(BlockPayException::class);
        $this->expectExceptionMessage('signature verification failed');

        Webhooks::parse('{}', 't=1,v1=deadbeef', self::SECRET);
    }

    public function testStaleTimestampIsRejected(): void
    {
        $body = '{"id":"evt_3","type":"invoice.paid"}';
        $oldTs = 1715000000;
        $signature = Webhooks::sign($body, self::SECRET, $oldTs);

        $this->assertFalse(
            Webhooks::verify($body, $signature, self::SECRET, 300, $oldTs + 1000)
        );
    }

    public function testEmptySignatureAndSecretAreRejected(): void
    {
        $this->assertFalse(Webhooks::verify('{}', '', self::SECRET));
        $this->assertFalse(Webhooks::verify('{}', 'deadbeef', ''));
    }
}
