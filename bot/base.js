module.exports = class BaseDice {
  constructor(proxy = {}) {
    this.proxy = proxy;
    this.url = ''; // bisa diatur ulang oleh child class seperti wolfbet.js
    this.benefit = '';
  }

  log(message) {
    console.log(`[BaseDice] ${message}`);
  }
};
