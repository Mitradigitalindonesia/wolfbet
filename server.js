const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const WolfBet = require('./bot/wolfbet');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'wolfbet-secret',
  resave: false,
  saveUninitialized: true
}));

// Init WolfBet instance
const wolfbet = new WolfBet({ ip: null, port: null });

// Routes

// Serve frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Login with API key
app.post('/api/login', async (req, res) => {
  const { apiKey } = req.body;
  try {
    await wolfbet.login(null, null, null, apiKey, req);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Refresh user stats
app.get('/api/refresh', async (req, res) => {
  try {
    const data = await wolfbet.refresh(req);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Place a bet
app.post('/api/place-bet', async (req, res) => {
  try {
    const result = await wolfbet.bet(req);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reset client seed
app.post('/api/reset-seed', async (req, res) => {
  try {
    const result = await wolfbet.resetseed(req);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`WolfBet Bot Backend is running at http://localhost:${PORT}`);
});
