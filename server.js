const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.post('/api/place-bet', async (req, res) => {
  const { token, amount, rule, multiplier, betValue } = req.body;

  try {
    const response = await fetch('https://wolfbet.com/api/v1/bet/place', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        currency: 'btc',
        game: 'dice',
        amount,
        rule,
        multiplier,
        bet_value: betValue
      })
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Server error', detail: error.message });
  }
});

app.get('/', (req, res) => {
  res.send('WolfBet Bot Proxy Server is running');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
