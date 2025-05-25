let autoBetInterval;

async function getBalance() {
  const token = document.getElementById('token').value;
  const res = await fetch('/api/get-balances', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token })
  });

  const data = await res.json();
  if (data.success) {
    const balances = data.balances;
    const shibBalance = balances.find(b => b.currency === 'shib');
    const amount = shibBalance ? shibBalance.amount : '0.0000000000';
    document.getElementById('balances').innerText = `Saldo SHIB: ${amount}`;
  } else {
    document.getElementById('balances').innerText = `Gagal ambil saldo: ${data.error}`;
  }
}

function startAutoBet() {
  const token = document.getElementById('token').value;
  const amount = parseFloat(document.getElementById('amount').value);
  const multiplier = parseFloat(document.getElementById('multiplier').value);
  const rule = document.getElementById('rule').value;
  const betValue = parseFloat(document.getElementById('betValue').value);
  const currency = document.getElementById('currency').value;

  if (!token) return alert('Token harus diisi');

  autoBetInterval = setInterval(async () => {
    try {
      const res = await fetch('/api/place-bet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, amount, rule, multiplier, betValue, currency })
      });

      const data = await res.json();
      console.log('Response place bet:', data); // <-- log response dari server

      const statusDiv = document.getElementById('status');
      if (res.ok && data.payout) {
        statusDiv.innerText = `Taruhan sukses! Payout: ${data.payout}`;
        getBalance(); // update saldo
      } else {
        statusDiv.innerText = `Gagal: ${data.error || JSON.stringify(data)}`;
      }
    } catch (error) {
      console.error('Fetch place bet error:', error); // log error network/dll
      document.getElementById('status').innerText = 'Terjadi kesalahan saat mengirim taruhan.';
    }
  }, 5000);
}
