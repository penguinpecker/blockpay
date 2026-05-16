import { redirect } from "@remix-run/node";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";

import { login } from "../../shopify.server";

import styles from "./styles.module.css";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);

  if (url.searchParams.get("shop")) {
    throw redirect(`/app?${url.searchParams.toString()}`);
  }

  return { showForm: Boolean(login) };
};

export default function App() {
  const { showForm } = useLoaderData<typeof loader>();

  return (
    <div className={styles.index}>
      <div className={styles.content}>
        <h1 className={styles.heading}>BlockPay for Shopify</h1>
        <p className={styles.text}>
          Accept on-chain USDC payments from your Shopify storefront. Settle to
          your own wallet, on the chain you choose.
        </p>
        {showForm && (
          <Form className={styles.form} method="post" action="/auth/login">
            <label className={styles.label}>
              <span>Shop domain</span>
              <input className={styles.input} type="text" name="shop" />
              <span>e.g: my-shop-domain.myshopify.com</span>
            </label>
            <button className={styles.button} type="submit">
              Log in
            </button>
          </Form>
        )}
        <ul className={styles.list}>
          <li>
            <strong>Self-custodial settlement.</strong> Your USDC lands in your
            wallet, not BlockPay&apos;s.
          </li>
          <li>
            <strong>Testnet first.</strong> Arc Testnet and Base Sepolia are
            supported on day one.
          </li>
          <li>
            <strong>Theme app extension.</strong> Adds a &ldquo;Pay with
            crypto&rdquo; button to your cart page in one click.
          </li>
        </ul>
      </div>
    </div>
  );
}
