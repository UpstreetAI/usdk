import readline from 'readline';
import util from 'util';

class StreamStrategy {
  constructor(inputStream, outputStream) {
    this.rl = readline.createInterface({
      input: inputStream,
      output: outputStream,
    });
  }

  async askQuestion(question) {
    for (;;) {
      const answer = await new Promise((resolve) => {
        this.rl.question(
          question,
          (answer) => {
            resolve(answer.trim());
          },
        );
      });
      if (answer) {
        return answer;
      }
    }
  }

  log(...args) {
    const formattedArgs = args.map(arg => {
      if (typeof arg === 'string') {
        return arg;
      } else {
        return util.inspect(arg, {
          depth: 3,
          // colors: true,
        });
      }
    });
    this.rl.output.write(formattedArgs.join(' ') + '\n');
  }

  close() {
    this.rl.close();
  }
}

export default StreamStrategy;