<?php
/**
 * Plugin Name: BlockPay
 * Plugin URI: https://blockpay-six.vercel.app
 * Description: Accept USDC payments at checkout through BlockPay's non-custodial gateway. Customers pay in USDC; funds settle directly to your wallet.
 * Version: 0.1.0
 * Author: BlockPay
 * Author URI: https://blockpay-six.vercel.app
 * License: MIT
 * License URI: https://opensource.org/licenses/MIT
 * Text Domain: blockpay
 * Domain Path: /languages
 * Requires at least: 6.0
 * Requires PHP: 7.4
 * WC requires at least: 7.0
 * WC tested up to: 9.4
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'BLOCKPAY_PLUGIN_FILE', __FILE__ );
define( 'BLOCKPAY_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'BLOCKPAY_PLUGIN_URL', plugin_dir_url( __FILE__ ) );
define( 'BLOCKPAY_VERSION', '0.1.0' );
define( 'BLOCKPAY_CHECKOUT_BASE', 'https://blockpay-six.vercel.app/pay' );

/**
 * Bootstrap the gateway after all plugins (including WooCommerce) are loaded.
 */
function blockpay_init_gateway() {
	if ( ! class_exists( 'WC_Payment_Gateway' ) ) {
		return;
	}

	require_once BLOCKPAY_PLUGIN_DIR . 'includes/class-wc-blockpay-gateway.php';
	require_once BLOCKPAY_PLUGIN_DIR . 'includes/class-wc-blockpay-webhook.php';

	add_filter( 'woocommerce_payment_gateways', 'blockpay_register_gateway' );

	// Webhook receiver listens on /wc-api/blockpay_webhook.
	new WC_BlockPay_Webhook();
}
add_action( 'plugins_loaded', 'blockpay_init_gateway' );

/**
 * Register the BlockPay gateway with WooCommerce.
 *
 * @param array $gateways Existing gateways.
 * @return array
 */
function blockpay_register_gateway( $gateways ) {
	$gateways[] = 'WC_BlockPay_Gateway';
	return $gateways;
}

/**
 * Convenience link to the gateway settings page from the Plugins list.
 *
 * @param array $links Plugin action links.
 * @return array
 */
function blockpay_plugin_action_links( $links ) {
	$settings_url = admin_url( 'admin.php?page=wc-settings&tab=checkout&section=blockpay' );
	array_unshift( $links, '<a href="' . esc_url( $settings_url ) . '">' . esc_html__( 'Settings', 'blockpay' ) . '</a>' );
	return $links;
}
add_filter( 'plugin_action_links_' . plugin_basename( __FILE__ ), 'blockpay_plugin_action_links' );
