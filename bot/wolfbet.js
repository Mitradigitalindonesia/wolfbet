'use strict';

const BaseDice = require('./base');
const fetch = require('isomorphic-fetch');
const APIError = require('../errors/APIError');
const SocksProxyAgent = require('socks-proxy-agent');

module.exports = class WolfBet extends BaseDice {
  constructor(proxy) {
    super(proxy);
    this.url = 'https://wolf.bet';
    this.benefit = '?c=mydicebot';
  }

  async login(userName, password, twoFactor, apiKey, req) {
    let ret = await this._send('api/v1/user/balances', 'GET', '', 'Bearer ' + apiKey);
    console.log(ret);
    req.session.accessToken = apiKey;
    req.session.username = apiKey;
    return true;
  }

  async getUserInfo(req) {
    return true;
  }

  async refresh(req) {
    let info = req.session.info;
    if (info) {
      console.log("info is not null");
      return info;
    }

    let accessToken = req.session.accessToken;
    let currency = req.query.currency;
    let ret = await this._send('api/v1/user/stats/bets', 'GET', '', 'Bearer ' + accessToken);
    let userinfo = {};
    const currencyStats = ret.dice[currency];
    userinfo.bets = currencyStats.total_bets;
    userinfo.wins = currencyStats.win;
    userinfo.losses = currencyStats.lose;
    userinfo.profit = currencyStats.profit;
    userinfo.wagered = currencyStats.waggered;

    ret = await this._send('api/v1/user/balances', 'GET', '', 'Bearer ' + accessToken);
    ret.balances.forEach(item => {
      if (currency === item.currency) {
        userinfo.balance = item.amount;
      }
    });

    userinfo.success = true;
    info = { info: userinfo };
    req.session.info = info;
    return info;
  }

  async bet(req) {
    let accessToken = req.session.accessToken;
    let amount = parseFloat(req.body.PayIn / 100000000);
    let currency = req.body.Currency.toLowerCase();
    let condition = req.body.High === "true" ? "over" : "under";

    let game = req.body.High === "true"
      ? 9999 - Math.floor(req.body.Chance * 100)
      : Math.floor(req.body.Chance * 100);

    let multiplier = (100 - 1) / req.body.Chance;

    let data = {
      currency,
      game: "dice",
      amount: amount.toFixed(8),
      rule: condition,
      multiplier: multiplier.toFixed(4),
      bet_value: (game / 100).toFixed(2)
    };

    let ret = await this._send('api/v1/bet/place', 'POST', data, 'Bearer ' + accessToken);
    console.log(ret);

    let info = req.session.info || { info: {}, currentInfo: {} };
    let betInfo = {
      condition: req.body.High === "true" ? ">" : "<",
      id: ret.bet.hash,
      serverHash: ret.bet.hash,
      nonce: ret.bet.nonce,
      time: ret.bet.published_at,
      target: ret.bet.bet_value,
      roll: ret.bet.result_value,
      amount: amount.toFixed(8),
      profit: ret.bet.profit
    };

    betInfo.payout = (parseFloat(amount) + parseFloat(betInfo.profit)).toFixed(8);
    betInfo.win = ret.bet.state === "win";

    if (betInfo.win) {
      info.info.wins++;
      info.currentInfo.wins++;
    } else {
      info.info.losses++;
      info.currentInfo.losses++;
    }

    info.info.bets++;
    info.currentInfo.bets++;
    info.info.profit = (parseFloat(info.info.profit) + parseFloat(betInfo.profit)).toFixed(8);
    info.currentInfo.profit = (parseFloat(info.currentInfo.profit) + parseFloat(betInfo.profit)).toFixed(8);
    info.info.wagered = (parseFloat(info.info.wagered) + parseFloat(amount)).toFixed(8);
    info.currentInfo.wagered = (parseFloat(info.currentInfo.wagered) + parseFloat(amount)).toFixed(8);
    info.info.balance = parseFloat(ret.userBalance.amount).toFixed(8);
    info.currentInfo.balance = parseFloat(ret.userBalance.amount).toFixed(8);

    req.session.info = info;
    return { betInfo, info };
  }

  async resetseed(req) {
    let data = {
      client_seed: Math.random().toString(12).substring(2)
    };
    let accessToken = req.session.accessToken;
    let ret = await this._send('api/v1/user/seed/refresh', 'POST', data, 'Bearer ' + accessToken);
    console.log(ret);
    return {
      current_client: ret.seed,
      hash: ret.seed,
      new_hash: ret.seed,
      seed: data.client_seed,
      success: true
    };
  }

  async _send(route, method, body, accessToken) {
    let url = `${this.url}/${route}`;
    console.log(JSON.stringify(body));
    let options = {
      method,
      headers: {
        'User-Agent': 'MyDiceBot',
        'Authorization': accessToken,
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: method !== 'GET' ? JSON.stringify(body) : undefined
    };

    if (this.proxy.ip) {
      let socks = `socks://${this.proxy.ip}:${this.proxy.port}`;
      if (this.proxy.user) {
        socks = `socks://${this.proxy.user}:${this.proxy.password}@${this.proxy.ip}:${this.proxy.port}`;
      }
      options.agent = new SocksProxyAgent(socks);
    }

    let res = await fetch(url, options);
    let data = await res.json();

    if (data.errors) {
      let err = new Error(JSON.stringify(data.errors));
      throw new APIError(err.message, err);
    }
    if (data.error) {
      let err = new Error(JSON.stringify(data.error));
      throw new APIError(err.message, err);
    }

    return data;
  }
};
