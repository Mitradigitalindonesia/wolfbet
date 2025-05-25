let autoBetInterval;

const token = "eyJ0eXAiOiJKV1QiLCJhbGciOi..."; // gunakan token dari kamu
const amount = 10;
const multiplier = 2;
const rule = "over";
const betValue = 50;
const currency = "shib";
const intervalMs = 5000;

async function getBalance() {
  try {
    const res = await fetch('/api/get-balances', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    });
    const data = await res.json();
    console.log('Saldo:', data);
    if (data.success) {
      const shib = data.balances.find(b => b.currency === 'shib');
      document.getElementById('balances').innerText = `Saldo SHIB: ${shib?.amount || 0}`;
    } else {
      document.getElementById('balances').innerText = `Gagal: ${data.error}`;
    }
  } catch (err) {
    console.error('Gagal ambil saldo:', err);
  }
}

async function runAutoBet() {
  try {
    const res = await fetch('/api/place-bet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, amount, rule, multiplier, betValue, currency })
    });

    const data = await res.json();
    console.log('Hasil bet:', data);

    if (res.ok && data.payout) {
      document.getElementById('status').innerText = `Sukses! Payout: ${data.payout}`;
      getBalance();
    } else {
      document.getElementById('status').innerText = `Gagal: ${data.error || JSON.stringify(data)}`;
    }
  } catch (err) {
    console.error('Error kirim taruhan:', err);
    document.getElementById('status').innerText = 'Kesalahan jaringan.';
  }
}

function startAutoBet() {
  if (autoBetInterval) clearInterval(autoBetInterval);
  runAutoBet(); // langsung jalan pertama kali
  autoBetInterval = setInterval(runAutoBet, intervalMs);
}

function stopAutoBet() {
  clearInterval(autoBetInterval);
  document.getElementById('status').innerText = 'Auto bet dihentikan.';
}
