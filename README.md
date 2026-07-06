# LogoForge AI — Single-merchant, multi-site Stripe prototype

This package is a front-end prototype and implementation specification for:

- AI-assisted logo generation through the OpenAI Image API.
- Closed-loop prepaid Service Credits funded with Stripe Checkout.
- A hosted popup payment experience.
- Multiple registered websites owned by the same legal entity.
- One Stripe merchant account and one merchant of record across every website.
- Separate Service Credit and multi-site payment ledgers.
- Public business, contact and policy pages.
- Compliance configuration and a launch checklist.

## Start the prototype

```bash
cd LogoForge_Stripe_Ready_Prototype
python -m http.server 8080
```

Open:

```text
http://localhost:8080/index.html
```

The checkout and AI generation are simulated. No real payment or OpenAI request is made.

## Important legal and commercial limitation

The package does not guarantee Stripe approval, legal compliance or tax compliance. Before live use:

1. Replace every placeholder with the real legal entity information.
2. Confirm that the company, products and websites are supported by Stripe in the account country.
3. Add every domain to the company’s verified public business presence and payment configuration where required.
4. Obtain legal review for Terms, Privacy, Refund, consumer cancellation, AI output, intellectual property and cookies.
5. Obtain tax advice for VAT, GST, sales tax and invoicing.
6. Ensure every registered website is owned and operated by the same legal entity.
7. Use the same merchant name, business details, Stripe account, bank recipient and support structure across all sites.
8. Do not market Service Credits as a bank account, cash wallet or withdrawable stored value.

## Recommended production architecture

- Laravel 12 / PHP 8.4
- PostgreSQL
- Redis + Horizon queues
- Stripe Checkout + Stripe webhooks
- Stripe Tax where appropriate after tax registrations are confirmed
- OpenAI Image API
- Cloudflare R2 / Amazon S3
- Sentry and immutable audit logs

## Payment model A — LogoForge Service Credits

LogoForge is the seller.

1. Customer chooses a Service Credit amount.
2. Server creates a Stripe Checkout Session.
3. Checkout shows the legal seller, amount, currency, tax, policies and terms acceptance.
4. Stripe confirms payment through a signed webhook.
5. An idempotent ledger entry credits the customer’s closed-loop Service Credit account.
6. The popup result page queries the backend, posts UI feedback to the original window and closes.
7. An email receipt and internal receipt record are created.

Service Credits:

- can only purchase LogoForge services;
- cannot be transferred between users;
- cannot be withdrawn or redeemed for cash, except required refunds;
- are not interest-bearing;
- have no expiration while the account remains active in this prototype.

## Payment model B — other websites operated by the same company

Every registered website:

- is owned and operated by the same legal entity;
- identifies the same merchant of record;
- uses the same Stripe merchant account;
- settles funds to the same company;
- uses the same support and policy framework;
- receives a unique `site_id`, API credential, origin allowlist and webhook URL;
- sends its own source customer ID and source order ID;
- receives payment status through a signed site webhook;
- has reports separated by `site_id`.

These payments are stored in the multi-site payment ledger. They never add or subtract LogoForge Service Credits.

## OpenAI usage price

```text
customer_charge_before_tax = measured_provider_cost × 5
```

Implementation:

1. Store model, endpoint, quality, size and provider price version.
2. Calculate a conservative maximum.
3. Reserve the maximum in Service Credits.
4. Send the generation request.
5. Store returned input/output usage.
6. Recalculate exact provider cost using decimal arithmetic.
7. Settle five times the provider cost.
8. Release the difference.
9. Reverse the entire reservation if no billable output is delivered.
10. Never exceed the customer-authorized maximum without a new authorization.

Provider pricing changes. Do not hard-code one permanent token or image price.

## Stripe Checkout session

Recommended configuration includes:

- `mode=payment`
- server-created line item and amount
- Stripe Customer or receipt email
- billing-address collection when needed
- automatic tax only after appropriate registrations and configuration
- terms-of-service consent
- public policy URLs
- success URL returning to the central payment result page
- cancel URL
- immutable internal IDs in metadata
- `client_reference_id`
- idempotency key
- `site_id`, source customer ID and source order ID for multi-site reconciliation

Never trust an amount, currency, site ID, customer ID or order ID supplied only by browser query parameters. The source website’s backend must create the payment session.

## Webhook source of truth

Verify Stripe signatures and process idempotently. Common events include:

- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`
- `checkout.session.async_payment_failed`
- `payment_intent.payment_failed`
- `charge.refunded`
- `charge.dispute.created`

Return a quick 2xx response and queue slower work. Record every event ID so retries do not duplicate fulfillment.

## Popup behavior

1. The source website requests a signed payment session from its backend.
2. Its backend calls the central payment API.
3. The browser opens the returned hosted checkout URL.
4. The hosted page redirects to Stripe Checkout.
5. Stripe returns to the central payment result page.
6. The result page polls the backend until the Stripe-webhook-confirmed terminal state.
7. It sends `window.opener.postMessage(payload, exactAllowlistedOrigin)`.
8. The source website updates the interface.
9. The source website’s backend still waits for or verifies the signed central site webhook.

The prototype uses `*` for local demonstration. Production must send only to the exact allowlisted origin.

## Public website and checkout information

Keep accessible without login:

- legal entity name and business address;
- registration and tax information where legally appropriate;
- actual product and service descriptions;
- pricing or pricing mechanism;
- delivery information;
- support email and phone;
- Terms of Service;
- Privacy Policy;
- Refund and Cancellation Policy;
- Acceptable Use Policy;
- AI Output and Intellectual Property Policy;
- Cookie Policy and consent settings;
- same merchant identity across every website;
- supported currency and taxes;
- recognizable card statement descriptor.

## Database separation

Service Credit domain:

- `users`
- `service_credit_accounts`
- `service_credit_transactions`
- `service_credit_reservations`
- `logo_projects`
- `logo_generations`
- `logo_assets`
- `openai_usage_records`
- `provider_price_versions`

Multi-site payment domain:

- `business_sites`
- `site_api_credentials`
- `site_allowed_origins`
- `site_webhook_endpoints`
- `site_payment_sessions`
- `site_payments`
- `site_payment_events`
- `refunds`
- `disputes`
- `site_webhook_deliveries`

Do not insert multi-site payments into `service_credit_transactions`.

## Security checklist

- Secret keys only on the server.
- Stripe and site-webhook signature verification.
- Exact origin allowlist.
- Short-lived signed checkout tokens.
- HTTPS and secure headers.
- Rate limits and card-testing controls.
- Idempotency keys.
- Integer minor units for customer money.
- Decimal arithmetic for provider costs.
- Encrypted site credentials.
- Admin MFA.
- Audit logs for prices, policies and status changes.
- File scanning and content moderation.
- Data-retention and deletion jobs.
- Backup and incident-response procedures.


## Financial report prototypes

### Company Receivables

`company-receivables-report.html` is the consolidated cash-receipt report for the legal entity. It includes gross payments, refunds, Stripe fees, tax, net receipts, bank payouts, results by website, transaction detail and reconciliation from customer charge to bank settlement.

### Site Wallet Report

`site-wallet-report.html` covers the LogoForge Service Credit program only. It includes outstanding customer balances, available and reserved credits, credit purchases, generation consumption, failed-generation reversals, cash refunds, aging, high-balance wallets, transaction ledger and generation economics.

A Service Credit purchase appears as a company cash receipt in the receivables report and as an increase in the outstanding Service Credit obligation in the wallet report. Credit consumption reduces that obligation and represents delivered service for management reporting, subject to the accountant's final accounting policy.


## Completed application menu prototypes

Every sidebar item now opens a working prototype page:

- `app.html` — Create Logo
- `my-logos.html` — My Logos project gallery
- `logo-project.html` — Logo project details, selection, refinement and exports
- `wallet.html` — Service Credits
- `billing-history.html` — Billing History, receipts, charges and refunds
- `company-receivables-report.html` — Company Receivables
- `site-wallet-report.html` — Site Wallet Report
- `admin.html` — Compliance Center
- `business-websites.html` — Business Websites management
- `website-settings.html` — Website credentials, origins, webhooks and event logs
- `site-payment-demo.html` — Multi-site payment integration demo

The pages use simulated data and front-end interactions. Production operations such as export, key rotation, webhook delivery, logo generation and payment fulfillment must be implemented server-side.


## Complete menu prototypes

The package now includes prototypes for every main menu item:

- `app.html` — guided logo generator.
- `my-logos.html` — logo library, filters, exports and concept management.
- `logo-detail.html` — individual logo detail, prompt, cost and export settings.
- `wallet.html` — Service Credit purchase and balance screen.
- `billing-history.html` — receipts, wallet ledger, generation charges and refunds.
- `company-receivables-report.html` — consolidated company cash receipts.
- `site-wallet-report.html` — LogoForge Service Credit wallet obligation and consumption report.
- `admin.html` — compliance and launch checklist.
- `business-websites.html` — registered websites operated by the same legal entity.
- `business-website-detail.html` — per-site origins, API keys, payment settings and webhook health.
- `api-webhooks.html` — integration documentation and webhook payload examples.
- `site-payment-demo.html` — hosted payment popup demo for another company-owned website.
- `account-settings.html` — profile and security settings prototype.
