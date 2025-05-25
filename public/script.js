let autoBetInterval;

async function getBalance() {
  const token = document.getElementById('token').value;
  if (!token) {
    document.getElementById('balances').innerText = 'Token kosong';
    return;
  }

  try {
    const res = await fetch('/api/get-balances', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    });

    const data = await res.json();
    console.log('Balance response:', data);

    if (data.success) {
      const balances = data.balances;
      const shibBalance = balances.find(b => b.currency === 'shib');
      const amount = shibBalance ? shibBalance.amount : '0.0000000000';
      document.getElementById('balances').innerText = `Saldo SHIB: ${amount}`;
    } else {
      document.getElementById('balances').innerText = `Gagal ambil saldo: ${data.error}`;
    }
  } catch (error) {
    console.error('Error ambil saldo:', error);
    document.getElementById('balances').innerText = 'Terjadi kesalahan mengambil saldo.';
  }
}

async function runAutoBet() {
  const token = document.getElementById('token').value;
  const amount = parseFloat(document.getElementById('amount').value);
  const multiplier = parseFloat(document.getElementById('multiplier').value);
  const rule = document.getElementById('rule').value;
  const betValue = parseFloat(document.getElementById('betValue').value);
  const currency = document.getElementById('currency').value;

  try {
    const res = await fetch('/api/place-bet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, amount, rule, multiplier, betValue, currency })
    });

    const data = await res.json();
    console.log('Response place bet:', data);

    const statusDiv = document.getElementById('status');
    if (res.ok && data.payout) {
      statusDiv.innerText = `Taruhan sukses! Payout: ${data.payout}`;
      getBalance();
    } else {
      statusDiv.innerText = `Gagal: ${data.error || JSON.stringify(data)}`;
    }
  } catch (error) {
    console.error('Fetch place bet error:', error);
    document.getElementById('status').innerText = 'Terjadi kesalahan saat mengirim taruhan.';
  }
}

function startAutoBet() {
  if (autoBetInterval) clearInterval(autoBetInterval);
  autoBetInterval = setInterval(runAutoBet, 5000); // tanpa eval/string
}

function stopAutoBet() {
  clearInterval(autoBetInterval);
  document.getElementById('status').innerText = 'Auto bet dihentikan.';
}
