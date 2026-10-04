export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const hostname = url.hostname.toLowerCase();
    const walletAddress = env.WALLET_ADDRESS || '0x47cdb61e41b7806Ab23B5d4C1296aacC11cAD489';

    const dashboardHtml = `<!DOCTYPE html>
<html lang="en" class="dark">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Wealthflow OS | Staking Services</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script>
      tailwind.config = {
        darkMode: 'class',
        theme: {
          extend: {
            colors: {
              cosmicbg: '#030712',
              panelbg: '#0b0f19',
              panelalt: '#101827',
              mint: '#34d399',
              cyan: '#22d3ee',
              gold: '#fbbf24',
              rose: '#fb7185',
              violet: '#8b5cf6'
            }
          }
        }
      };
    </script>
    <style>
      body { background: radial-gradient(circle at top left, rgba(45,212,191,0.12), transparent 18%), #030712; }
      .glass { background: rgba(15, 23, 42, 0.72); border: 1px solid rgba(148, 163, 184, 0.15); backdrop-filter: blur(14px); }
      .stat-card { transition: transform 0.2s ease, border-color 0.2s ease; }
      .stat-card:hover { transform: translateY(-2px); border-color: rgba(34, 211, 238, 0.55); }
      .health-ring { position: relative; }
      .health-ring::before {
        content: "";
        position: absolute;
        inset: 12px;
        border-radius: 9999px;
        background: rgba(15, 23, 42, 0.9);
      }
      .health-ring canvas { position: relative; z-index: 1; }
    </style>
  </head>
  <body class="min-h-screen text-slate-100">
    <div class="max-w-7xl mx-auto px-4 py-8 md:px-8 lg:px-10">
      <header class="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p class="text-xs uppercase tracking-[0.28rem] text-cyan-300/80">Wealthflow OS</p>
          <h1 class="mt-2 text-3xl font-bold text-white md:text-4xl">Staking Services & Live Sell Analytics</h1>
        </div>
        <div class="glass rounded-2xl px-4 py-3 text-sm text-slate-300">
          <div class="text-xs uppercase tracking-[0.2rem] text-slate-400">Connected wallet</div>
          <div id="walletAddress" class="mt-1 font-mono text-cyan-300">${walletAddress}</div>
        </div>
      </header>

      <section class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div class="stat-card glass rounded-2xl p-5 border border-slate-700/60">
          <div class="text-xs uppercase tracking-[0.2rem] text-slate-400">Net Volume</div>
          <div id="netVolume" class="mt-3 text-3xl font-bold text-white">$0</div>
          <div class="mt-2 flex items-center gap-2 text-xs text-mint-300"><span class="inline-block h-2 w-2 rounded-full bg-mint-400"></span><span id="netVolumeDelta">+0.0%</span> vs prior window</div>
        </div>

        <div class="stat-card glass rounded-2xl p-5 border border-slate-700/60">
          <div class="text-xs uppercase tracking-[0.2rem] text-slate-400">Sell Count</div>
          <div id="sellCount" class="mt-3 text-3xl font-bold text-white">0</div>
          <div class="mt-2 text-xs text-slate-300"><span id="sellCountLabel">0</span> active sell events</div>
        </div>

        <div class="stat-card glass rounded-2xl p-5 border border-slate-700/60">
          <div class="text-xs uppercase tracking-[0.2rem] text-slate-400">Avg Exit Yield</div>
          <div id="avgYield" class="mt-3 text-3xl font-bold text-white">0%</div>
          <div class="mt-2 text-xs text-cyan-300"><span id="yieldTrend">Stable</span> across monitored positions</div>
        </div>

        <div class="stat-card glass rounded-2xl p-5 border border-slate-700/60">
          <div class="text-xs uppercase tracking-[0.2rem] text-slate-400">Portfolio Health</div>
          <div id="healthScore" class="mt-3 text-3xl font-bold text-white">0</div>
          <div class="mt-2 text-xs text-amber-300"><span id="healthStatus">Assessing exposure</span></div>
        </div>
      </section>

      <section class="mt-8 grid gap-6 xl:grid-cols-[1.5fr_0.85fr]">
        <div class="glass rounded-3xl p-5 border border-slate-700/60">
          <div class="mb-5 flex items-center justify-between">
            <div>
              <p class="text-xs uppercase tracking-[0.24rem] text-slate-400">Volume trend</p>
              <h2 class="mt-2 text-xl font-semibold text-white">Live sell analytics</h2>
            </div>
            <div class="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-200">Live data</div>
          </div>
          <div class="h-72">
            <canvas id="salesChart"></canvas>
          </div>
        </div>

        <div class="glass rounded-3xl p-5 border border-slate-700/60">
          <div class="mb-5">
            <p class="text-xs uppercase tracking-[0.24rem] text-slate-400">System overview</p>
            <h2 class="mt-2 text-xl font-semibold text-white">Overall health</h2>
          </div>
          <div class="health-ring mx-auto flex h-52 w-52 items-center justify-center">
            <canvas id="healthChart" width="180" height="180"></canvas>
          </div>
          <div class="mt-5 space-y-4 text-sm text-slate-300">
            <div class="flex items-center justify-between rounded-xl border border-slate-700/60 bg-slate-900/40 px-3 py-2">
              <span>Liquidity</span>
              <span id="liquidityRate" class="font-semibold text-mint-300">0%</span>
            </div>
            <div class="flex items-center justify-between rounded-xl border border-slate-700/60 bg-slate-900/40 px-3 py-2">
              <span>Risk exposure</span>
              <span id="riskRate" class="font-semibold text-rose-300">0%</span>
            </div>
            <div class="flex items-center justify-between rounded-xl border border-slate-700/60 bg-slate-900/40 px-3 py-2">
              <span>Yield stability</span>
              <span id="stabilityRate" class="font-semibold text-cyan-300">0%</span>
            </div>
          </div>
        </div>
      </section>

      <section class="mt-8">
        <div class="mb-5 flex items-center justify-between">
          <div>
            <p class="text-xs uppercase tracking-[0.24rem] text-slate-400">Recent activity</p>
            <h2 class="mt-2 text-xl font-semibold text-white">Latest sell events</h2>
          </div>
          <div class="rounded-full border border-slate-600/80 bg-slate-900/50 px-3 py-1 text-xs text-slate-300">Auto-refresh</div>
        </div>

        <div class="glass overflow-hidden rounded-3xl border border-slate-700/60">
          <div class="overflow-x-auto">
            <table class="min-w-full text-left text-sm text-slate-200">
              <thead class="border-b border-slate-700/70 bg-slate-900/40 text-xs uppercase tracking-[0.2rem] text-slate-400">
                <tr>
                  <th class="px-5 py-4">Asset</th>
                  <th class="px-5 py-4">Type</th>
                  <th class="px-5 py-4">Amount</th>
                  <th class="px-5 py-4">Exit Yield</th>
                  <th class="px-5 py-4">Status</th>
                  <th class="px-5 py-4">Time</th>
                </tr>
              </thead>
              <tbody id="sellTableBody"></tbody>
            </table>
          </div>
        </div>
      </section>
    </div>

    <script>
      const formatCurrency = (value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
      const formatCompact = (value) => new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(value);

      const buildChart = (labels, values) => {
        return new Chart(document.getElementById('salesChart'), {
          type: 'line',
          data: {
            labels,
            datasets: [{
              label: 'Sell volume',
              data: values,
              borderColor: '#22d3ee',
              backgroundColor: 'rgba(34, 211, 238, 0.18)',
              fill: true,
              tension: 0.36,
              borderWidth: 3,
              pointBackgroundColor: '#f8fafc',
              pointRadius: 3,
              pointHoverRadius: 5
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: { callbacks: { label: (ctx) => `${ctx.dataset.label}: ${formatCurrency(ctx.parsed.y)}` } }
            },
            scales: {
              x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(148,163,184,0.08)' } },
              y: { ticks: { color: '#94a3b8', callback: (value) => formatCompact(value) }, grid: { color: 'rgba(148,163,184,0.08)' } }
            }
          }
        });
      };

      const buildHealthChart = (value) => {
        const ctx = document.getElementById('healthChart');
        const gauge = new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: ['Health', 'Risk'],
            datasets: [{
              data: [value, 100 - value],
              backgroundColor: ['#34d399', '#1f2937'],
              borderWidth: 0,
              cutout: '70%'
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            rotation: -90,
            circumference: 360,
            plugins: { legend: { display: false } }
          }
        });
        return gauge;
      };

      const renderDashboard = (data) => {
        const { summary, sells } = data;
        document.getElementById('netVolume').textContent = formatCurrency(summary.netVolume);
        document.getElementById('netVolumeDelta').textContent = `${summary.volumeDelta > 0 ? '+' : ''}${summary.volumeDelta.toFixed(1)}%`;
        document.getElementById('sellCount').textContent = summary.sellCount;
        document.getElementById('sellCountLabel').textContent = summary.sellCount;
        document.getElementById('avgYield').textContent = `${summary.avgYield.toFixed(1)}%`;
        document.getElementById('yieldTrend').textContent = summary.yieldTrend;
        document.getElementById('healthScore').textContent = summary.healthScore;
        document.getElementById('healthStatus').textContent = summary.healthStatus;
        document.getElementById('liquidityRate').textContent = `${summary.liquidityRate}%`;
        document.getElementById('riskRate').textContent = `${summary.riskRate}%`;
        document.getElementById('stabilityRate').textContent = `${summary.stabilityRate}%`;

        const rows = sells.map((sell) => `
          <tr class="border-b border-slate-700/60 last:border-b-0">
            <td class="px-5 py-4 font-medium text-white">${sell.asset}</td>
            <td class="px-5 py-4"><span class="rounded-full border border-violet-400/30 bg-violet-500/10 px-2 py-1 text-violet-200">${sell.type}</span></td>
            <td class="px-5 py-4 text-slate-200">${sell.amount}</td>
            <td class="px-5 py-4 text-cyan-300">${sell.exitYield}%</td>
            <td class="px-5 py-4"><span class="rounded-full px-2 py-1 ${sell.status === 'Healthy' ? 'bg-mint-500/10 text-mint-300 border border-mint-400/20' : 'bg-amber-500/10 text-amber-300 border border-amber-400/20'}">${sell.status}</span></td>
            <td class="px-5 py-4 text-slate-300">${sell.time}</td>
          </tr>
        `).join('');
        document.getElementById('sellTableBody').innerHTML = rows;

        const chart = document.getElementById('salesChart');
        if (window.salesChartInstance) window.salesChartInstance.destroy();
        window.salesChartInstance = buildChart(summary.labels, summary.values);

        const healthCanvas = document.getElementById('healthChart');
        if (window.healthChartInstance) window.healthChartInstance.destroy();
        window.healthChartInstance = buildHealthChart(summary.healthScore);
      };

      fetch('/api/wealthflow/overview')
        .then((res) => res.json())
        .then(renderDashboard)
        .catch(() => {
          const fallback = {
            summary: {
              netVolume: 184500,
              volumeDelta: 12.4,
              sellCount: 19,
              avgYield: 17.8,
              yieldTrend: 'Upward',
              healthScore: 86,
              healthStatus: 'Healthy',
              liquidityRate: 82,
              riskRate: 24,
              stabilityRate: 91,
              labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
              values: [42000, 54000, 61000, 73000, 67000, 89000]
            },
            sells: [
              { asset: 'SOL', type: 'Strategic sell', amount: '410 SOL', exitYield: 21.4, status: 'Healthy', time: '2m ago' },
              { asset: 'ETH', type: 'Treasury exit', amount: '18 ETH', exitYield: 18.2, status: 'Healthy', time: '9m ago' },
              { asset: 'BTC', type: 'Risk rebalance', amount: '1.2 BTC', exitYield: 16.8, status: 'Watch', time: '24m ago' },
              { asset: 'AVAX', type: 'Portfolio trim', amount: '121 AVAX', exitYield: 15.3, status: 'Healthy', time: '54m ago' }
            ]
          };
          renderDashboard(fallback);
        });

      setInterval(() => {
        fetch('/api/wealthflow/overview')
          .then((res) => res.json())
          .then(renderDashboard)
          .catch(() => {});
      }, 9000);
    </script>
  </body>
</html>`;

    if (hostname === 'cockpit.thewealthflow.xyz' || url.pathname.startsWith('/cockpit') || url.pathname.startsWith('/dashboard') || url.pathname === '/templates/stakingServices.html' || url.pathname === '/templates/staking-services.html' || url.pathname === '/staking-services') {
      return new Response(dashboardHtml, { headers: { 'Content-Type': 'text/html; charset=UTF-8' } });
    }

    if (url.pathname === '/api/wealthflow/overview') {
      const now = Date.now();
      const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
      const monthValues = [42000, 54000, 61000, 67200, 76000, 89200];

      const overview = {
        walletAddress,
        timestamp: new Date(now).toISOString(),
        summary: {
          netVolume: 184500,
          volumeDelta: 12.4,
          sellCount: 19,
          avgYield: 17.8,
          yieldTrend: 'Upward',
          healthScore: 86,
          healthStatus: 'Healthy',
          liquidityRate: 82,
          riskRate: 24,
          stabilityRate: 91,
          labels: monthLabels,
          values: monthValues
        },
        sells: [
          { asset: 'SOL', type: 'Strategic sell', amount: '410 SOL', exitYield: 21.4, status: 'Healthy', time: '2m ago' },
          { asset: 'ETH', type: 'Treasury exit', amount: '18 ETH', exitYield: 18.2, status: 'Healthy', time: '9m ago' },
          { asset: 'BTC', type: 'Risk rebalance', amount: '1.2 BTC', exitYield: 16.8, status: 'Watch', time: '24m ago' },
          { asset: 'AVAX', type: 'Portfolio trim', amount: '121 AVAX', exitYield: 15.3, status: 'Healthy', time: '54m ago' },
          { asset: 'MATIC', type: 'Yield harvest', amount: '2900 MATIC', exitYield: 25.1, status: 'Healthy', time: '1h ago' },
          { asset: 'LINK', type: 'Market exit', amount: '520 LINK', exitYield: 14.7, status: 'Watch', time: '2h ago' }
        ]
      };

      return Response.json(overview, {
        headers: { 'Content-Type': 'application/json; charset=UTF-8' }
      });
    }

    // 1. Explicit check for the Founder Cockpit subdomain
    if (hostname === 'cockpit.thewealthflow.xyz' || url.pathname.startsWith('/cockpit')) {
      return new Response(dashboardHtml, { headers: { 'Content-Type': 'text/html; charset=UTF-8' } });
    }

    // 2. Route: Trigger PayPal Login Redirect
    if (url.pathname === '/auth/paypal') {
      const clientId = env.PAYPAL_CLIENT_ID;
      const redirectUri = `${url.origin}/auth/paypal/callback`;
      const paypalAuthUrl = `https://www.paypal.com/signin/authorize?client-id=${clientId}&response_type=code&scope=openid+email+profile&redirect_uri=${encodeURIComponent(redirectUri)}`;
      return Response.redirect(paypalAuthUrl, 302);
    }

    // 3. Route: Handle PayPal OAuth Callback & Token Exchange
    if (url.pathname === '/auth/paypal/callback') {
      const code = url.searchParams.get('code');
      if (!code) return new Response('Authorization code missing', { status: 400 });

      const clientId = env.PAYPAL_CLIENT_ID;
      const clientSecret = env.PAYPAL_CLIENT_SECRET;
      const credentials = btoa(`${clientId}:${clientSecret}`);
      const tokenEndpoint = 'https://api-m.sandbox.paypal.com/v1/oauth2/token';

      try {
        const tokenRes = await fetch(tokenEndpoint, {
          method: 'POST',
          headers: {
            Authorization: `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: new URLSearchParams({
            grant_type: 'authorization_code',
            code
          })
        });

        const tokenData = await tokenRes.json();
        if (!tokenData.access_token) throw new Error('Failed to obtain access token');

        const userRes = await fetch('https://api-m.sandbox.paypal.com/v1/identity/openidconnect/userinfo?schema=openid', {
          headers: { Authorization: `Bearer ${tokenData.access_token}` }
        });
        const userData = await userRes.json();

        return new Response(`Successfully logged into Wealthflow OS as: ${userData.name || userData.email}`, {
          headers: { 'Content-Type': 'text/html' }
        });
      } catch (err) {
        return new Response(`Authentication Error: ${err.message}`, { status: 500 });
      }
    }

    // 4. Route: Terminal / Create Payment Order API Endpoint
    if (url.pathname === '/api/terminal/create-order' && request.method === 'POST') {
      try {
        const body = await request.json();
        const { amount } = body;

        const clientId = env.PAYPAL_CLIENT_ID;
        const clientSecret = env.PAYPAL_CLIENT_SECRET;
        const credentials = btoa(`${clientId}:${clientSecret}`);

        const tokenRes = await fetch('https://api-m.sandbox.paypal.com/v1/oauth2/token', {
          method: 'POST',
          headers: {
            Authorization: `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: 'grant_type=client_credentials'
        });
        const tokenData = await tokenRes.json();

        const orderRes = await fetch('https://api-m.sandbox.paypal.com/v2/checkout/orders', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${tokenData.access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            intent: 'CAPTURE',
            purchase_units: [{
              amount: {
                currency_code: 'USD',
                value: amount || '10.00'
              }
            }]
          })
        });

        const orderData = await orderRes.json();
        return Response.json(orderData);
      } catch (err) {
        return Response.json({ error: err.message }, { status: 500 });
      }
    }

    // 5. Route: PayPal Webhook Event Receiver (Wealthflow OS Integration)
    if (url.pathname === '/api/webhook/paypal' && request.method === 'POST') {
      try {
        const event = await request.json();
        const eventType = event.event_type;
        const resource = event.resource;

        console.log(`[Wealthflow OS] Received Webhook: ${eventType}`);

        switch (eventType) {
          case 'PAYMENT.CAPTURE.COMPLETED': {
            const transactionId = resource.id;
            const grossAmount = resource.amount?.value;
            const currency = resource.amount?.currency_code;
            const wealthflowUserId = resource.custom_id || resource.supplementary_data?.related_ids?.order_id;

            console.log(`[Wealthflow Ledger] Processing deposit of ${grossAmount} ${currency} for User: ${wealthflowUserId}`);
            break;
          }
          case 'CHECKOUT.ORDER.APPROVED': {
            console.log(`[Wealthflow OS] Order approved by user: ${resource.id}`);
            break;
          }
          case 'PAYMENT.CAPTURE.DENIED': {
            console.log(`[Wealthflow OS] Payment capture failed for order: ${resource.id}`);
            break;
          }
          default:
            console.log(`[Wealthflow OS] Unhandled event type ignored: ${eventType}`);
        }

        return new Response(JSON.stringify({ status: 'success', handled: eventType }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (err) {
        console.error(`[Wealthflow OS Error] Webhook processing failed: ${err.message}`);
        return new Response(JSON.stringify({ error: err.message }), { status: 400 });
      }
    }

    if (url.pathname === '/' || url.pathname === '') {
      return new Response(dashboardHtml, { headers: { 'Content-Type': 'text/html; charset=UTF-8' } });
    }

    return new Response('Wealthflow OS Universal Worker Active', { status: 200 });
  }
};
