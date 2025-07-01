const axios = require('axios');

class WolfBet {
  constructor(options = {}) {
    this.apiUrl = 'https://api.wolf.bet'; // Endpoint utama
  }

  // Simpan API key ke session
  async login(apiKey, req) {
    if (!apiKey) throw new Error('API key tidak boleh kosong');

    // Coba ambil data user untuk validasi API key
    const response = await axios.get(`${this.apiUrl}/v1/users/me`, {
      headers: {
        Authorization: `Bearer ${apiKey}`
      }
    });

    if (!response.data || !response.data.user) {
      throw new Error('Login gagal: API Key tidak valid');
    }

    req.session.apiKey = apiKey;
    req.session.user = response.data.user;
    return true;
  }

  // Ambil saldo / info user
  async refresh(req) {
    const apiKey = req.session.apiKey;
    if (!apiKey) throw new Error('Belum login');

    const response = await axios.get(`${this.apiUrl}/v1/users/me`, {
      headers: {
        Authorization: `Bearer ${apiKey}`
      }
    });

    const user = response.data.user;
    return {
      info: {
        username: user.username,
        balance: user.balance.amount,
        currency: user.balance.currency
      }
    };
  }

  // Melakukan taruhan
  async bet(params, req) {
    const apiKey = req.session.apiKey;
    if (!apiKey) throw new Error('Belum login');

    const {
      currency,
      game,
      amount,
      rule,
      multiplier,
      bet_value
    } = params;

    // Validasi
    if (!currency || !game || !amount || !rule || !multiplier || !bet_value) {
      throw new Error('Semua parameter taruhan wajib diisi');
    }

    const payload = {
      currency,
      game,
      amount,
      rule,
      multiplier,
      bet_value
    };

    const response = await axios.post(`${this.apiUrl}/v1/bets/place`, payload, {
      headers: {
        Authorization: `Bearer ${apiKey}`
      }
    });

    return response.data; // Sudah dalam format standar dari WolfBet
  }
}

module.exports = WolfBet;
