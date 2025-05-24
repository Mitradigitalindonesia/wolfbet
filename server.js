const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Aktifkan CORS untuk semua domain (boleh kamu sesuaikan jika mau dibatasi)
app.use(cors());

// Parsing body JSON
app.use(express.json());

// Serve folder public untuk frontend
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint root serve file index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));

  app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Verifikasi token user (ambil data profil)
app.post('/api/verify-token', async (req, res) => {
  const { token } = req.body;

  if (!token) return res.status(400).json({ error: 'Token is required' });

  try {
    const response = await fetch('https://wolfbet.com/api/v1/user/profile', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Invalid token' });
    }

    const userData = await response.json();
    res.json({ success: true, user: userData });
  } catch (error) {
    res.status(500).json({ error: 'Server error', detail: error.message });
  }
});

// Endpoint untuk place bet
app.post('/api/place-bet', async (req, res) => {
  const { token, amount, rule, multiplier, betValue, currency = 'USDT' } = req.body;

  if (!token || !amount || !rule || !multiplier || betValue === undefined) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  try {
    const response = await fetch('https://wolfbet.com/api/v1/bet/place', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        currency,
        game: 'dice',
        amount,
        rule,
        multiplier,
        bet_value: betValue
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error || 'API Error', data });
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('Error placing bet:', error);
    res.status(500).json({ error: 'Server error', detail: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
