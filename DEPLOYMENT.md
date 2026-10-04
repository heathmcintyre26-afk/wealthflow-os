# Wealthflow OS — Production Deployment Guide

## Phase 1: Branch Push & GitHub PR

### Step 1: Push Feature Branch
```bash
git checkout feature/staking-services-dashboard
git add .
git commit -m "feat: add advanced admin cockpit, treasury analytics, receipts, and compliance dashboard"
git push origin feature/staking-services-dashboard
```

### Step 2: Create GitHub PR
- Go to: https://github.com/heathmcintyre26-afk/wealthflow-os
- Click "New Pull Request"
- Base: `main`
- Compare: `feature/staking-services-dashboard`
- Title: "Add Advanced Admin Cockpit & Financial Platform"
- Description: See PR_TEMPLATE.md
- Assign: yourself
- Labels: `enhancement`, `production-ready`, `financial-platform`

### Step 3: Merge to Main
- Wait for any CI checks
- Review changes
- Merge with "Squash and merge" strategy
- Delete feature branch after merge

---

## Phase 2: Cloudflare Worker Deployment

### Step 1: Install Dependencies
```bash
npm install
npm install -D wrangler
```

### Step 2: Authenticate with Cloudflare
```bash
npx wrangler login
```
This will open your browser to authenticate. Authorize the action.

### Step 3: Configure Production Secrets

**CRITICAL: Use your REAL values here. These are production credentials.**

#### Admin Secret
```bash
npx wrangler secret put ADMIN_SECRET
# Enter a secure random token (e.g., 32+ character string)
# Example: "aB3xK9pL2mN8qRsT7uVwXyZ0cDeFgHiJ"
```

#### Treasury Wallet Address
```bash
npx wrangler secret put WALLET_ADDRESS
# Enter your Ethereum wallet address
# Example: "0x47cdb61e41b7806Ab23B5d4C1296aacC11cAD489"
```

#### PayPal Live Merchant Keys
```bash
npx wrangler secret put PAYPAL_CLIENT_ID
# Enter your PayPal LIVE merchant client ID (not sandbox)
# Format: ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

npx wrangler secret put PAYPAL_CLIENT_SECRET
# Enter your PayPal LIVE merchant secret
# Format: EJxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

#### Session Secret
```bash
npx wrangler secret put SESSION_SECRET
# Enter a long random string for session encryption
# Example: "L8K3pQ9mW2xN5sR7tU1vY4zB6cD9eF2gH5iJ8kL1mN4"
```

#### Email Service (Optional - for receipt emails)
```bash
npx wrangler secret put RESEND_API_KEY
# Enter your Resend.com API key
# Format: re_xxxxxxxxxxxxxxxxxxxxxxxxxx
# Skip if not using email receipts
```

### Step 4: Verify Secrets Are Set
```bash
npx wrangler secret list
```
You should see:
- ADMIN_SECRET
- WALLET_ADDRESS
- PAYPAL_CLIENT_ID
- PAYPAL_CLIENT_SECRET
- SESSION_SECRET
- RESEND_API_KEY (if set)

### Step 5: Deploy to Production
```bash
npx wrangler deploy
```

Output should show:
```
✨ Successfully published your Worker
URL: https://wealthflow-os.workers.dev
Domain: thewealthflow.xyz
```

---

## Phase 3: Production Validation

### Test Public Routes
1. **Public Dashboard**
   ```
   https://thewealthflow.xyz/
   ```
   Should show: Platform status, active products, customer count, ecosystem health

2. **Public Cockpit**
   ```
   https://thewealthflow.xyz/cockpit
   ```
   Should show: Staking dashboard, sell analytics, portfolio health

3. **Product Catalog API**
   ```
   curl https://thewealthflow.xyz/api/wealthflow/products
   ```
   Should return: 5 products (Starter, Gold, Diamond, Staking Beta, Wallet Ops)

### Test Admin Routes (Requires Token)
1. **Admin Cockpit**
   ```
   https://thewealthflow.xyz/admin/cockpit?token=YOUR_ADMIN_SECRET
   ```
   Should show: 6 dashboard tabs with all metrics

2. **Overview API**
   ```
   curl -H "Authorization: Bearer YOUR_ADMIN_SECRET" \
     https://thewealthflow.xyz/api/admin/overview
   ```
   Should return: Revenue, transactions, active users, health score

3. **Treasury API**
   ```
   curl -H "Authorization: Bearer YOUR_ADMIN_SECRET" \
     https://thewealthflow.xyz/api/admin/treasury
   ```
   Should return: Inflow, outflow, net balance

4. **Receipts API**
   ```
   curl -H "Authorization: Bearer YOUR_ADMIN_SECRET" \
     https://thewealthflow.xyz/api/admin/receipts
   ```
   Should return: Array of transaction receipts

5. **Portfolio API**
   ```
   curl -H "Authorization: Bearer YOUR_ADMIN_SECRET" \
     https://thewealthflow.xyz/api/admin/portfolio
   ```
   Should return: Holdings with USD, ETH, BTC, USDC, DAI breakdown

### Test Payment Capture
```bash
curl -X POST https://thewealthflow.xyz/api/wealthflow/capture \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "gold",
    "customer": "test@example.com",
    "amount": 99,
    "method": "PayPal"
  }'
```

Expected response:
```json
{
  "success": true,
  "receipt": {
    "receiptId": "WF-XXXXXX",
    "customer": "test@example.com",
    "productName": "Gold Treasury Vault",
    "amount": 99,
    "breakdown": {
      "subtotal": 99,
      "fees": 2.97,
      "net": 96.03
    },
    "status": "captured"
  }
}
```

---

## Phase 4: Real Treasury Connection

### PayPal Live Integration
1. Verify PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET are production keys
2. Test payment capture in admin dashboard
3. Verify funds appear in PayPal merchant account
4. Enable webhook receiver at `/api/webhook/paypal`

### Treasury Wallet Setup
1. Ensure WALLET_ADDRESS is correct and has sufficient gas for transactions
2. Set up auto-payout script if using crypto treasury
3. Configure payout schedule (daily/weekly/monthly)
4. Test deposit flow end-to-end

### Email Receipt Setup (Optional)
1. Create Resend account at https://resend.com
2. Get API key from dashboard
3. Set RESEND_API_KEY secret
4. Test receipt email send:
   ```bash
   curl -X POST https://thewealthflow.xyz/api/wealthflow/email-receipt \
     -H "Content-Type: application/json" \
     -d '{
       "receiptId": "WF-TEST123",
       "email": "your-email@example.com"
     }'
   ```

---

## Phase 5: Monitoring & Maintenance

### View Worker Logs
```bash
npx wrangler tail
```

### Check Secrets
```bash
npx wrangler secret list
```

### Update a Secret
```bash
npx wrangler secret put SECRET_NAME
```

### Redeploy
```bash
git pull origin main
npx wrangler deploy
```

### Monitor Uptime
- Cloudflare Dashboard: https://dash.cloudflare.com
- Select "Wealthflow OS" zone
- Check "Analytics" for traffic, errors, performance

---

## Rollback Plan

If something breaks in production:

### Option 1: Redeploy Previous Commit
```bash
git revert HEAD
npx wrangler deploy
```

### Option 2: Rollback via Cloudflare Dashboard
1. Go to Cloudflare Workers
2. Select "wealthflow-os" worker
3. Click "Deployments"
4. Select previous deployment
5. Click "Rollback"

---

## Success Criteria

✅ Feature branch pushed to GitHub  
✅ PR created and merged to main  
✅ All Cloudflare secrets configured  
✅ Worker deployed successfully  
✅ Public dashboard loads  
✅ Admin cockpit loads with valid token  
✅ All API endpoints respond  
✅ Admin metrics display correctly  
✅ Portfolio holdings show real data  
✅ Compliance audit trail visible  
✅ Payment capture endpoint working  
✅ Receipt generation functional  
✅ Email receipts send (if configured)  
✅ Treasury connection verified  
✅ Monitoring & alerts enabled  

---

## Next Steps

1. **After Deployment**:
   - Test all admin routes thoroughly
   - Verify real-time data updates
   - Confirm PayPal integration is live
   - Set up monitoring alerts

2. **Phase 2 (Future)**:
   - Implement persistent ledger storage
   - Add KYC/AML verification
   - Connect blockchain for crypto payouts
   - Build customer portal
   - Add recurring billing

3. **Phase 3 (Future)**:
   - Multi-currency support
   - Advanced portfolio analytics
   - Automated yield optimization
   - Risk scoring engine
   - Regulatory compliance automation

---

## Support

For issues during deployment:
1. Check Cloudflare dashboard for error logs
2. Run `npx wrangler tail` to see real-time logs
3. Verify all secrets are set: `npx wrangler secret list`
4. Test locally first: `npx wrangler dev`

**Last Updated**: 2026-10-04
**Status**: Production Ready ✅
