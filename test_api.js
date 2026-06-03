import fetch from 'node-fetch';

async function test() {
  const res = await fetch('http://localhost:3001/api/create-payment-intent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ qtyTurchese: 2, qtyRosa: 0, email: 'test@example.com' })
  });
  const data = await res.json();
  console.log('Response for 2 bottles:', data);
  // We can't see the actual amount here easily without having the secret key, but we can verify the server doesn't error and maybe add a log on the server.
}

test();
