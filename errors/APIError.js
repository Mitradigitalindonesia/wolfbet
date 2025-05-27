module.exports = class APIError extends Error {
  constructor(message, originalError = null) {
    super(message);
    this.name = 'APIError';
    this.originalError = originalError;
  }
};
