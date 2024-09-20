import { input } from '@inquirer/prompts';

class InquirerStrategy {
  async askQuestion(question) {
    const answer = await input({ message: question });
    return answer;
  }

  close() {}
}

export default InquirerStrategy;