const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
  res.send('WolfBet Bot Proxy Server is running');
});

// Endpoint place bet
app.post('/api/place-bet', async (req, res) => {
  const { token, amount, rule, multiplier, betValue } = req.body;

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
