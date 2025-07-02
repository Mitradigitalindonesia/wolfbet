const axios = require('axios');

class WolfBet {
  constructor() {
    this.apiUrl = 'https://api.wolf.bet';
  }

  // Validasi API key
  async validate(apiKey) {
    const response = await axios.get(`${this.apiUrl}/v1/users/me`, {
      headers: {
        Authorization: `Bearer ${apiKey}`
      }
    });

    if (!response.data || !response.data.user) {
      throw new Error('API Key tidak valid');
    }

    return response.data.user;
  }

  // Ambil info user
  async refresh(apiKey) {
    const response = await axios.get(`${this.apiUrl}/v1/users/me`, {
      headers: {
        Authorization: `Bearer ${apiKey}`
      }
    });

    const user = response.data.user;
    return {
      username: user.username,
      balance: user.balance.amount,
      currency: user.balance.currency
    };
  }

  // Taruhan
  async bet({ currency, game, amount, rule, multiplier, bet_value, apiKey }) {
    const payload = { currency, game, amount, rule, multiplier, bet_value };

    const response = await axios.post(`${this.apiUrl}/v1/bets/place`, payload, {
      headers: {
        Authorization: `Bearer ${apiKey}`
      }
    });

    return response.data;
  }
}

module.exports = WolfBet;
