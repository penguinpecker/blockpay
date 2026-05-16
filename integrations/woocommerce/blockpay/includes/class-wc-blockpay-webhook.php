<?php
/**
 * BlockPay webhook receiver.
 *
 * @package BlockPay
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class WC_BlockPay_Webhook
 *
 * Listens on WooCommerce's `/wc-api/blockpay_webhook` endpoint. BlockPay POSTs
 * a JSON payload signed with HMAC-SHA256 in the `X-BlockPay-Signature` header.
 *
 * Expected payload (minimum):
 * {
 *   "event":     "payment.succeeded",
 *   "order_id":  "123",
 *   "tx_hash":   "0xabc...",
 *   "chain":     "arc-testnet",
 *   "amount":    "12.34",
 *   "currency":  "USDC",
 *   "timestamp": 1715800000
 * }
 */
class WC_BlockPay_Webhook {

	/**
	 * Constructor.
	 */
	public function __construct() {
		// woocommerce_api_<endpoint> fires on requests to /wc-api/<endpoint>.
		add_action( 'woocommerce_api_blockpay_webhook', array( $this, 'handle' ) );
	}

	/**
	 * Handle an incoming BlockPay webhook.
	 *
	 * @return void
	 */
	public function handle() {
		$raw_body  = file_get_contents( 'php://input' );
		$signature = isset( $_SERVER['HTTP_X_BLOCKPAY_SIGNATURE'] )
			? sanitize_text_field( wp_unslash( $_SERVER['HTTP_X_BLOCKPAY_SIGNATURE'] ) )
			: '';

		$gateway = $this->get_gateway();
		$secret  = $gateway ? (string) $gateway->webhook_secret : '';

		if ( '' === $secret ) {
			$this->respond( 401, array( 'error' => 'webhook_secret_not_configured' ) );
			return;
		}

		if ( ! $this->verify_signature( $raw_body, $signature, $secret ) ) {
			$this->respond( 401, array( 'error' => 'invalid_signature' ) );
			return;
		}

		$payload = json_decode( $raw_body, true );
		if ( ! is_array( $payload ) ) {
			$this->respond( 400, array( 'error' => 'invalid_json' ) );
			return;
		}

		$event    = isset( $payload['event'] ) ? (string) $payload['event'] : '';
		$order_id = isset( $payload['order_id'] ) ? (int) $payload['order_id'] : 0;
		$tx_hash  = isset( $payload['tx_hash'] ) ? (string) $payload['tx_hash'] : '';
		$chain    = isset( $payload['chain'] ) ? (string) $payload['chain'] : '';

		if ( 'payment.succeeded' !== $event ) {
			// Acknowledge other events so BlockPay doesn't retry forever, but no-op.
			$this->respond( 200, array( 'ok' => true, 'ignored' => true ) );
			return;
		}

		if ( $order_id <= 0 ) {
			$this->respond( 400, array( 'error' => 'missing_order_id' ) );
			return;
		}

		$order = wc_get_order( $order_id );
		if ( ! $order ) {
			$this->respond( 404, array( 'error' => 'order_not_found' ) );
			return;
		}

		// Idempotency: if already paid, just ack.
		if ( $order->is_paid() ) {
			$this->respond( 200, array( 'ok' => true, 'already_paid' => true ) );
			return;
		}

		$order->payment_complete( $tx_hash );

		$note = sprintf(
			/* translators: 1: chain key, 2: tx hash */
			__( 'BlockPay payment confirmed on %1$s. Tx: %2$s', 'blockpay' ),
			$chain ? $chain : 'unknown',
			$tx_hash ? $tx_hash : 'n/a'
		);
		$order->add_order_note( $note );

		if ( $tx_hash ) {
			$order->update_meta_data( '_blockpay_tx_hash', $tx_hash );
		}
		if ( $chain ) {
			$order->update_meta_data( '_blockpay_chain', $chain );
		}
		$order->save();

		$this->respond( 200, array( 'ok' => true ) );
	}

	/**
	 * Resolve the gateway instance to read the configured webhook secret.
	 *
	 * @return WC_BlockPay_Gateway|null
	 */
	private function get_gateway() {
		if ( ! function_exists( 'WC' ) || ! WC()->payment_gateways() ) {
			return null;
		}

		$gateways = WC()->payment_gateways()->payment_gateways();
		if ( isset( $gateways['blockpay'] ) && $gateways['blockpay'] instanceof WC_BlockPay_Gateway ) {
			return $gateways['blockpay'];
		}
		return null;
	}

	/**
	 * Verify the HMAC-SHA256 signature using a timing-safe comparison.
	 *
	 * Supports either a raw hex signature ("abcd...") or the prefixed form
	 * ("sha256=abcd...") for compatibility.
	 *
	 * @param string $body      Raw request body.
	 * @param string $signature Header value.
	 * @param string $secret    Shared secret.
	 * @return bool
	 */
	private function verify_signature( $body, $signature, $secret ) {
		if ( '' === $signature ) {
			return false;
		}

		$provided = $signature;
		if ( 0 === strpos( $provided, 'sha256=' ) ) {
			$provided = substr( $provided, 7 );
		}

		$expected = hash_hmac( 'sha256', $body, $secret );

		return is_string( $provided ) && hash_equals( $expected, $provided );
	}

	/**
	 * JSON response helper.
	 *
	 * @param int   $status HTTP status.
	 * @param array $data   Body.
	 * @return void
	 */
	private function respond( $status, $data ) {
		status_header( $status );
		nocache_headers();
		wp_send_json( $data, $status );
	}
}
