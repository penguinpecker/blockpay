<?php
/**
 * BlockPay WooCommerce Payment Gateway.
 *
 * @package BlockPay
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! class_exists( 'WC_Payment_Gateway' ) ) {
	return;
}

/**
 * Class WC_BlockPay_Gateway
 *
 * Redirects the buyer to a BlockPay PaymentLink. BlockPay holds funds in
 * the merchant's own wallet (non-custodial). After payment, BlockPay calls
 * the webhook endpoint registered by WC_BlockPay_Webhook to mark the order
 * paid and store the on-chain tx hash.
 */
class WC_BlockPay_Gateway extends WC_Payment_Gateway {

	/**
	 * Merchant settlement address (EVM 0x...).
	 *
	 * @var string
	 */
	public $settlement_address = '';

	/**
	 * Settlement chain key (arc-testnet | base-sepolia).
	 *
	 * @var string
	 */
	public $settlement_chain = 'arc-testnet';

	/**
	 * BlockPay PaymentLink slug.
	 *
	 * @var string
	 */
	public $payment_link_slug = '';

	/**
	 * Webhook signing secret.
	 *
	 * @var string
	 */
	public $webhook_secret = '';

	/**
	 * Constructor.
	 */
	public function __construct() {
		$this->id                 = 'blockpay';
		$this->icon               = BLOCKPAY_PLUGIN_URL . 'assets/icon.svg';
		$this->has_fields         = false;
		$this->method_title       = __( 'BlockPay (USDC)', 'blockpay' );
		$this->method_description = __( "Accept USDC payments via BlockPay's non-custodial gateway.", 'blockpay' );
		$this->supports           = array( 'products' );

		$this->init_form_fields();
		$this->init_settings();

		$this->title              = $this->get_option( 'title' );
		$this->description        = $this->get_option( 'description' );
		$this->enabled            = $this->get_option( 'enabled' );
		$this->settlement_address = trim( (string) $this->get_option( 'settlement_address' ) );
		$this->settlement_chain   = $this->get_option( 'settlement_chain' );
		$this->payment_link_slug  = trim( (string) $this->get_option( 'payment_link_slug' ) );
		$this->webhook_secret     = (string) $this->get_option( 'webhook_secret' );

		add_action(
			'woocommerce_update_options_payment_gateways_' . $this->id,
			array( $this, 'process_admin_options' )
		);
	}

	/**
	 * Configurable settings shown under WC > Settings > Payments > BlockPay.
	 *
	 * @return void
	 */
	public function init_form_fields() {
		$webhook_url = home_url( '/wc-api/blockpay_webhook' );

		$this->form_fields = array(
			'enabled'            => array(
				'title'       => __( 'Enable / Disable', 'blockpay' ),
				'label'       => __( 'Enable BlockPay (USDC)', 'blockpay' ),
				'type'        => 'checkbox',
				'description' => '',
				'default'     => 'no',
			),
			'title'              => array(
				'title'       => __( 'Title', 'blockpay' ),
				'type'        => 'text',
				'description' => __( 'Label shown to the customer at checkout.', 'blockpay' ),
				'default'     => __( 'Pay with USDC', 'blockpay' ),
				'desc_tip'    => true,
			),
			'description'        => array(
				'title'       => __( 'Description', 'blockpay' ),
				'type'        => 'textarea',
				'description' => __( 'Helper text shown beneath the payment method.', 'blockpay' ),
				'default'     => __( 'Settle instantly to your own wallet', 'blockpay' ),
				'desc_tip'    => true,
			),
			'settlement_address' => array(
				'title'       => __( 'Settlement address', 'blockpay' ),
				'type'        => 'text',
				'description' => __( 'The wallet address that receives USDC. Configured on your BlockPay PaymentLink and shown here for reference.', 'blockpay' ),
				'default'     => '',
				'placeholder' => '0x...',
			),
			'settlement_chain'   => array(
				'title'       => __( 'Settlement chain', 'blockpay' ),
				'type'        => 'select',
				'description' => __( 'Network where USDC settles.', 'blockpay' ),
				'default'     => 'arc-testnet',
				'options'     => array(
					'arc-testnet'  => __( 'Arc Testnet', 'blockpay' ),
					'base-sepolia' => __( 'Base Sepolia', 'blockpay' ),
				),
			),
			'payment_link_slug'  => array(
				'title'       => __( 'PaymentLink slug', 'blockpay' ),
				'type'        => 'text',
				'description' => __( 'The slug of the BlockPay PaymentLink to redirect customers to (created in the BlockPay dashboard).', 'blockpay' ),
				'default'     => '',
				'placeholder' => 'my-store',
			),
			'webhook_secret'     => array(
				'title'       => __( 'Webhook secret', 'blockpay' ),
				'type'        => 'password',
				'description' => sprintf(
					/* translators: %s: webhook URL */
					__( 'Shared HMAC secret used to verify BlockPay webhooks. Paste the secret shown in the BlockPay dashboard. Webhook URL: %s', 'blockpay' ),
					'<code>' . esc_html( $webhook_url ) . '</code>'
				),
				'default'     => '',
			),
		);
	}

	/**
	 * Process the payment by redirecting to the BlockPay checkout.
	 *
	 * @param int $order_id WooCommerce order ID.
	 * @return array
	 */
	public function process_payment( $order_id ) {
		$order = wc_get_order( $order_id );

		if ( ! $order ) {
			wc_add_notice( __( 'BlockPay: order not found.', 'blockpay' ), 'error' );
			return array( 'result' => 'failure' );
		}

		$slug = $this->payment_link_slug;
		if ( '' === $slug ) {
			wc_add_notice(
				__( 'BlockPay is not fully configured: missing PaymentLink slug. Please contact the store owner.', 'blockpay' ),
				'error'
			);
			return array( 'result' => 'failure' );
		}

		// Mark the order as awaiting payment so it does not auto-cancel.
		$order->update_status( 'pending', __( 'Awaiting BlockPay USDC payment.', 'blockpay' ) );

		// Reduce stock and clear cart now; we will complete on webhook.
		wc_reduce_stock_levels( $order_id );
		if ( function_exists( 'WC' ) && WC()->cart ) {
			WC()->cart->empty_cart();
		}

		$return_url = $this->get_return_url( $order );

		$redirect_url = add_query_arg(
			array(
				'source'     => 'woocommerce',
				'order_id'   => rawurlencode( (string) $order_id ),
				'return_url' => rawurlencode( $return_url ),
			),
			trailingslashit( BLOCKPAY_CHECKOUT_BASE ) . rawurlencode( $slug )
		);

		return array(
			'result'   => 'success',
			'redirect' => $redirect_url,
		);
	}
}
