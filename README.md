# Wealthflow OS — Advanced Financial Platform

## Overview

Wealthflow OS is a Cloudflare Worker-based financial platform providing:
- Real-time revenue and treasury tracking
- Admin cockpit with ecosystem health monitoring
- Payment receipt generation and compliance reporting
- Portfolio analytics with live crypto price feeds
- Audit trail and regulatory reporting

## Deployment Status

✅ **Feature Branch**: `feature/staking-services-dashboard`  
✅ **Deployment Target**: Cloudflare Workers  
✅ **Domain**: thewealthflow.xyz  
✅ **Status**: Ready for Production

## Quick Start

### Prerequisites
- Node.js 18+
- Wrangler CLI installed
- Cloudflare account with Workers enabled
- PayPal merchant account (live keys)
- Treasury wallet address

### Installation

```bash
npm install
npm install -D wrangler
```

### Environment Setup

1. Copy `.env.example` to `.env.production`
2. Fill in all required secrets
3. Push secrets to Cloudflare:

```bash
npx wrangler login
npx wrangler secret put ADMIN_SECRET
npx wrangler secret put WALLET_ADDRESS
npx wrangler secret put PAYPAL_CLIENT_ID
npx wrangler secret put PAYPAL_CLIENT_SECRET
npx wrangler secret put SESSION_SECRET
npx wrangler secret put RESEND_API_KEY  # Optional
```

### Local Development

```bash
npx wrangler dev
```

Then visit:
- Public dashboard: http://localhost:8787/
- Admin cockpit: http://localhost:8787/admin/cockpit?token=dev-admin-key

### Production Deployment

```bash
npx wrangler deploy
```

## API Endpoints

### Public Endpoints
- `GET /` — Public dashboard
- `GET /cockpit` — Public staking services dashboard
- `GET /api/wealthflow/products` — Product catalog
- `POST /api/wealthflow/capture` — Capture payment
- `POST /api/terminal/create-order` — Create payment order
- `POST /api/webhook/paypal` — PayPal webhook receiver

### Admin Endpoints (Requires Token)
- `GET /admin/cockpit?token=YOUR_ADMIN_SECRET` — Advanced admin dashboard
- `GET /api/admin/overview` — Ecosystem overview metrics
- `GET /api/admin/treasury` — Treasury analytics
- `GET /api/admin/receipts` — Transaction receipt history
- `GET /api/admin/portfolio` — Portfolio holdings breakdown

## Features

### Admin Cockpit (6 Tabs)
1. **Overview** — Revenue trends, transaction counts, capture rates
2. **Treasury** — Inflow/outflow tracking, net balance, payment breakdown
3. **Receipts** — Full transaction history with fee breakdowns, exportable
4. **Ecosystem** — System health score, performance metrics, product distribution
5. **Portfolio** — Real-time crypto holdings, asset allocation, live price feeds
6. **Compliance** — KYC/AML status, audit trail, regulatory report generation

### Key Metrics
- **Ecosystem Health**: System stability score (0-100)
- **Capture Rate**: % of successful payment captures
- **Success Rate**: % of completed transactions
- **Portfolio Breakdown**: USD, ETH, BTC, USDC, DAI allocation
- **Revenue Tracking**: 30-day, 24-hour, real-time revenue

## Product Catalog

| Tier | Name | Price | Category |
|------|------|-------|----------|
| 1 | Starter Growth Pack | $29 | Education |
| 2 | Gold Treasury Vault | $99 | Treasury |
| 3 | Diamond Capital Command | $249 | Premium |
| 4 | Staking Beta Access | $149 | Staking |
| 5 | Wallet Ops Suite | $79 | Automation |

## Payment Processing

### Capture Flow
1. Customer selects product
2. POST to `/api/wealthflow/capture` with amount
3. Receipt generated with unique ID (WF-XXXXXX)
4. Fees calculated (3% for PayPal, 0% for wallet)
5. Net revenue recorded to treasury
6. Receipt stored and optionally emailed

### Receipt Breakdown
- Subtotal: Product price
- Fees: 3% for PayPal, 0% for direct wallet
- Tax: Configurable
- Net: Amount deposited to treasury

## Compliance & Reporting

### Audit Trail
- All transactions logged with timestamps
- Customer email addresses recorded
- Payment method tracked
- Status changes recorded

### Regulatory Reports
- SAR (Suspicious Activity Report) generation
- Form 8949 (Investment income) export
- Complete audit log download
- KYC/AML verification tracking

## Security

- Admin access requires valid token
- All secrets stored in Cloudflare
- HTTPS only on production domain
- Session tokens with secure httpOnly cookies
- Rate limiting on API endpoints
- Audit trail for all admin actions

## Real Treasury Integration

For live operation, connect:
1. **PayPal Live Merchant Account**
   - PAYPAL_CLIENT_ID (live app ID)
   - PAYPAL_CLIENT_SECRET (live secret)

2. **Treasury Wallet**
   - Ethereum address for crypto deposits
   - Or bank account for USD settlements

3. **Email Service (Optional)**
   - Resend API key for receipt emails
   - Automatic receipt generation

4. **Persistent Storage (Optional)**
   - Cloudflare Durable Objects for ledger
   - Or external PostgreSQL/MongoDB

## Production Checklist

- [ ] Environment secrets configured in Cloudflare
- [ ] PayPal live merchant keys added
- [ ] Treasury wallet address verified
- [ ] Admin secret changed from default
- [ ] Custom domain (thewealthflow.xyz) verified
- [ ] First test transaction completed
- [ ] Receipt generation tested
- [ ] Admin cockpit accessed and validated
- [ ] Ecosystem health metrics displaying
- [ ] Portfolio holdings displaying correctly
- [ ] Compliance audit trail active
- [ ] Rate limiting configured
- [ ] Monitoring/alerts enabled
- [ ] Backup/disaster recovery plan in place

## Monitoring

- Cloudflare Analytics Engine captures all requests
- Admin dashboard shows real-time ecosystem health
- Uptime monitoring via Cloudflare Workers Analytics
- Error tracking via worker logs
- Performance metrics (response time, CPU usage)

## Support & Troubleshooting

### Admin Login Issues
If you can't access `/admin/cockpit`:
1. Verify token matches ADMIN_SECRET
2. Check Cloudflare secret configuration: `wrangler secret list`
3. Confirm browser cookies enabled

### Payment Capture Failures
1. Check PayPal credentials are live (not sandbox)
2. Verify PAYPAL_CLIENT_ID and SECRET are correct
3. Check response logs: `wrangler tail`

### Receipt Not Generating
1. Confirm RESEND_API_KEY is set (if email receipts enabled)
2. Check customer email address format
3. Review Cloudflare worker logs

### Dashboard Not Loading
1. Verify token parameter in URL
2. Check browser console for errors
3. Confirm /api/admin/* endpoints are responding

## License

Proprietary — Wealthflow OS

## Contact

For support: admin@wealthflow.xyz
