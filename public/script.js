let autoBetInterval = null;

async function getBalance() {
  const token = document.getElementById('token').value;
  const currency = document.getElementById('currency').value;

  const res = await fetch('/api/refresh?currency=' + currency, {
    headers: { 'Content-Type': 'application/json' },
    method: 'GET',
    credentials: 'same-origin'
  });

  const data = await res.json();
  if (data && data.info && data.info.balance !== undefined) {
    document.getElementById('balances').innerText = `Saldo: ${data.info.balance} ${currency.toUpperCase()}`;
  } else {
    document.getElementById('balances').innerText = 'Gagal ambil saldo.';
  }
}

function startAutoBet() {
  const token = document.getElementById('token').value;
  const currency = document.getElementById('currency').value;
  const amount = parseFloat(document.getElementById('amount').value).toFixed(8);
  const multiplier = parseFloat(document.getElementById('multiplier').value).toFixed(4);
  const rule = document.getElementById('rule').value;
  const betValue = parseFloat(document.getElementById('betValue').value).toFixed(2);

  if (autoBetInterval) {
    clearInterval(autoBetInterval);
  }

  autoBetInterval = setInterval(async () => {
    const res = await fetch('/api/place-bet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, amount, multiplier, rule, betValue, currency })
    });

    const data = await res.json();
    console.log(data);

    if (data.betInfo) {
      const statusEl = document.getElementById('status');
      statusEl.innerText = `Roll: ${data.betInfo.roll} | Target: ${data.betInfo.target} | ${data.betInfo.win ? 'Menang' : 'Kalah'} | Profit: ${data.betInfo.profit}`;
      getBalance(); // update saldo setiap bet
    } else {
      stopAutoBet();
      alert("Terjadi kesalahan saat bet: " + (data.error || "Unknown error"));
    }
  }, 3000); // setiap 3 detik
}

function stopAutoBet() {
  if (autoBetInterval) clearInterval(autoBetInterval);
  document.getElementById('status').innerText = 'Auto Bet dihentikan.';
}
