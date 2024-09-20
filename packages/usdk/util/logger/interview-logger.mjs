class InterviewLogger {
    constructor(strategy) {
      this.strategy = strategy;
    }
  
    askQuestion(question) {
      return this.strategy.askQuestion(question);
    }
  
    close() {
      this.strategy.close();
    }
  }
  
  export default InterviewLogger;