require('dotenv').config();
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const WolfBet = require('./bot/wolfbet'); // pastikan file ini sudah dibuat dan benar

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: process.env.SESSION_SECRET || 'rahasia-wolfbet',
  resave: false,
  saveUninitialized: true
}));

// Inisialisasi Bot
const wolfbet = new WolfBet({});

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/api/login', async (req, res) => {
  const { apiKey } = req.body;
  if (!apiKey) return res.status(400).json({ error: 'API Key dibutuhkan' });

  try {
    await wolfbet.login(apiKey, req);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/refresh', async (req, res) => {
  try {
    const data = await wolfbet.refresh(req);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/place-bet', async (req, res) => {
  try {
    const result = await wolfbet.bet(req.body, req);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint tidak ditemukan' });
});

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
