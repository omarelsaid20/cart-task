class httpError extends Error {
  constructor(message, statusCode) {
    super(message); // 'Error'
    this.code = statusCode;
  }
}
module.exports = httpError;
