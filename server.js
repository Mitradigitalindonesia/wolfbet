// server.js

require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const WolfBet = require('./bot/wolfbet');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

const wolfbet = new WolfBet();

// Serve frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Login (validasi token)
app.post('/api/login', async (req, res) => {
  const { apiKey } = req.body;
  if (!apiKey) return res.status(400).json({ error: 'API Key dibutuhkan' });

  try {
    const user = await wolfbet.validate(apiKey); // ubah dari .login
    res.json({ success: true, username: user.username });
  } catch (error) {
    console.error('[LOGIN ERROR]', error.response?.data || error.message);
    res.status(500).json({ error: error.response?.data?.message || error.message });
  }
});

// Refresh saldo
app.post('/api/refresh', async (req, res) => {
  const { apiKey } = req.body;
  if (!apiKey) return res.status(401).json({ error: 'Tidak ada API key' });

  try {
    const info = await wolfbet.refresh(apiKey);
    res.json({ info });
  } catch (error) {
    console.error('[REFRESH ERROR]', error.response?.data || error.message);
    res.status(500).json({ error: error.response?.data?.message || error.message });
  }
});

// Bet
app.post('/api/place-bet', async (req, res) => {
  const { apiKey } = req.body;
  if (!apiKey) return res.status(401).json({ error: 'Tidak ada API key' });

  try {
    const result = await wolfbet.bet(req.body);
    res.json(result);
  } catch (error) {
    console.error('[BET ERROR]', error.response?.data || error.message);
    res.status(500).json({ error: error.response?.data?.message || error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
