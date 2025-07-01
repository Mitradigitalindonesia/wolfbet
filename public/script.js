let autoBetInterval = null;

async function login() {
  const token = document.getElementById('token').value;
  if (!token) return alert('Masukkan API key dulu!');

  const res = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ apiKey: token }),
    credentials: 'same-origin'
  });

  const data = await res.json();
  if (data.success) {
    alert('Login berhasil!');
    getBalance();
  } else {
    alert('Login gagal: ' + data.error);
  }
}

async function getBalance() {
  const currency = document.getElementById('currency').value;

  const res = await fetch('/api/refresh?currency=' + currency, {
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
  const currency = document.getElementById('currency').value;
  const amount = parseFloat(document.getElementById('amount').value).toFixed(8);
  const multiplier = parseFloat(document.getElementById('multiplier').value).toFixed(4);
  const rule = document.getElementById('rule').value;
  const betValue = parseFloat(document.getElementById('betValue').value).toFixed(2);

  if (autoBetInterval) clearInterval(autoBetInterval);

  autoBetInterval = setInterval(async () => {
    const res = await fetch('/api/place-bet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({
        currency,
        game: 'dice',
        amount: amount.toString(),
        rule,
        multiplier: multiplier.toString(),
        bet_value: betValue.toString()
      })
    });

    const data = await res.json();
    console.log(data);

    if (data.bet) {
      document.getElementById('status').innerText = `Roll: ${data.bet.result_value} | Target: ${data.bet.bet_value} | ${data.bet.state === 'win' ? 'Menang' : 'Kalah'} | Profit: ${data.bet.profit}`;
      getBalance();
    } else {
      stopAutoBet();
      alert("Gagal bet: " + (data.error || "Unknown error"));
    }
  }, 3000);
}

function stopAutoBet() {
  if (autoBetInterval) clearInterval(autoBetInterval);
  document.getElementById('status').innerText = 'Auto Bet dihentikan.';
}
