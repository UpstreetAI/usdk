class InterviewLogger {
    constructor(strategy) {
      this.strategy = strategy;
    }
  
    askQuestion(question) {
      return this.strategy.askQuestion(question);
    }

    log(...args) {
      return this.strategy.log(...args);
    }
  
    close() {
      this.strategy.close();
    }
  }
  
  export default InterviewLogger;