export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const hostname = url.hostname.toLowerCase();

    // 1. Explicit check for the Founder Cockpit subdomain
    if (hostname === 'cockpit.thewealthflow.xyz' || url.pathname.startsWith('/cockpit')) {
      const cockpitHtml = `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Wealthflow | Founder Cockpit & Command Center</title>
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
                    }
                }
            }
        }
    </script>
</head>
<body class="bg-cosmicbg text-white min-h-screen p-6">
    <div class="max-w-7xl mx-auto">
        <h1 class="text-3xl font-bold mb-4">Founder Cockpit & Command Center</h1>
        <p class="text-gray-400">Welcome to your Wealthflow OS control panel.</p>
    </div>
</body>
</html>`;
      return new Response(cockpitHtml, { headers: { 'Content-Type': 'text/html' } });
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
            'Authorization': `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: new URLSearchParams({
            grant_type: 'authorization_code',
            code: code
          })
        });

        const tokenData = await tokenRes.json();
        if (!tokenData.access_token) throw new Error('Failed to obtain access token');

        const userRes = await fetch('https://api-m.sandbox.paypal.com/v1/identity/openidconnect/userinfo?schema=openid', {
          headers: { 'Authorization': `Bearer ${tokenData.access_token}` }
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
            'Authorization': `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: 'grant_type=client_credentials'
        });
        const tokenData = await tokenRes.json();

        const orderRes = await fetch('https://api-m.sandbox.paypal.com/v2/checkout/orders', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${tokenData.access_token}`,
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

    // Default Fallback Route
    return new Response('Wealthflow OS Universal Worker Active', { status: 200 });
  }
};
