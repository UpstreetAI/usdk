export class NotEnoughCreditsError extends Error {
    constructor(message = 'Not enough credits') {
      super(message);
      this.name = 'NotEnoughCreditsError';
      this.status = 402;
  }
}
