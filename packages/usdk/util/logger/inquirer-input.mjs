import { input, select } from '@inquirer/prompts';

class InquirerStrategy {
  async askQuestion(question) {
    if (question.type === 'list') {
      const answer = await select({
        message: question.message,
        choices: question.choices.map(choice => ({ name: choice, value: choice })),
      });
      return answer;
    } else if (question.type === 'input') {
      const answer = await input({
        message: question.message,
      });
      return answer;
    }
  }

  close() {}
}

export default InquirerStrategy;