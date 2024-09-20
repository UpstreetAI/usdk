import readline from 'readline';

class ReadlineStrategy {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  askQuestion(question) {
    return new Promise((resolve) => {
      this.rl.question(`\x1b[32m?\x1b[0m \x1b[1m${question}\x1b[0m\n`, (answer) => {
        resolve(answer);
      });
    });
  }

  close() {
    this.rl.close();
  }
}

export default ReadlineStrategy;