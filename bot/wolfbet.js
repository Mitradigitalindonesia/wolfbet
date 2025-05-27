'use strict';

var BaseDice = require('./base');
var fetch = require('isomorphic-fetch');
var APIError = require('../errors/APIError');
var SocksProxyAgent = require('socks-proxy-agent');

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
    ret.balances.forEach(function (item) {
      if (currency == item.currency) {
        userinfo.balance = item.amount;
      }
    });
    userinfo.success = true;
    info = { info: userinfo };
    req.session.info = info;
    return info;
  }

  async clear(req) {
    // (tidak diubah, bisa Anda tambahkan nanti jika perlu)
  }

  async bet(req) {
    // (tidak diubah, bisa Anda lanjutkan dengan versi Anda)
  }

  async resetseed(req) {
    let data = {};
    let accessToken = req.session.accessToken;
    data.client_seed = Math.random().toString(12).substring(2);
    let ret = await this._send('/api/v1/user/seed/refresh', 'POST', data, 'Bearer ' + accessToken);
    console.log(ret);
    let info = {};
    info.current_client = ret.seed;
    info.hash = ret.seed;
    info.new_hash = ret.seed;
    info.seed = data.client_seed;
    info.success = true;
    return info;
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
      body: method !== 'GET' ? JSON.stringify(body) : undefined,
    };
    if (this.proxy.ip) {
      let socks = 'socks://' + this.proxy.ip + ':' + this.proxy.port;
      if (this.proxy.user) {
        socks = 'socks://' + this.proxy.user + ':' + this.proxy.password + '@' + this.proxy.ip + ':' + this.proxy.port;
      }
      let agent = new SocksProxyAgent(socks);
      options.agent = agent;
    }
    let res = await fetch(url, options);
    let data = await res.json();

    if (data.errors) {
      let errs = new Error(JSON.stringify(data.errors));
      errs.value = JSON.stringify(data.errors);
      throw new APIError(JSON.stringify(data.errors), errs);
    }
    if (data.error) {
      let errs = new Error(JSON.stringify(data.error));
      errs.value = JSON.stringify(data.error);
      throw new APIError(JSON.stringify(data.error), errs);
    }
    return data;
  }
};
