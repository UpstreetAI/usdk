import Jimp from 'jimp';

import ReadlineStrategy from '../../../../../util/logger/readline.mjs';
import InquirerStrategy from '../../../../../util/logger/inquirer-input.mjs';
import InterviewLogger from '../../../../../util/logger/interview-logger.mjs';

import { AgentInterview } from './agent-interview.mjs';
import { ImageRenderer } from '../devices/video-input.mjs';
import { consoleImageWidth } from '../constants.mjs';

class AgentInterviewFlow {
  constructor() {
    this.logger = new InterviewLogger(new InquirerStrategy());
  }

  async askMode() {
    return await this.logger.askQuestion({
      type: 'list',
      name: 'creationMode',
      message: 'Welcome to the agent creation quest! How would you like to proceed?\n- Provide a prompt and let the system handle it (auto)?\n- Or be the master of your creation (interactive)?',
      choices: ['auto', 'interactive'],
    });
  }

  async askAutoPrompt() {
    return await this.logger.askQuestion({
      type: 'input',
      name: 'autoPrompt',
      message: 'You chose the automated path. Please provide a prompt to kickstart the creation:',
    });
  }

  async askInteractiveQuestion() {
    const questions = [
      { type: 'input', name: 'agentName', message: 'What shall be the name of your extraordinary agent?' },
      { type: 'input', name: 'agentDescription', message: 'Paint a picture with words: Describe your agent in vivid detail.' },
      { type: 'input', name: 'agentPurpose', message: 'What grand purpose will your agent serve in this world?' },
    ];

    const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
    return await this.logger.askQuestion(randomQuestion);
  }

  async conductInterview(agentJson, jwt, prompt = '') {
    let mode;
    let initAnswer = null;

    if (prompt) {
      mode = 'auto';
    } else {
      mode = await this.askMode();
      if (mode === 'auto') {
        prompt = await this.askAutoPrompt();
      } else if (mode === 'interactive') {
        initAnswer = await this.askInteractiveQuestion();
      }
    }

    const questionLogger = new InterviewLogger(new ReadlineStrategy());
    const getAnswer = (question) => {
      return questionLogger.askQuestion(question);
    };

    const agentInterview = new AgentInterview({
      agentJson,
      prompt,
      mode,
      jwt,
    });

    if (mode === 'interactive') {
      agentInterview.write(initAnswer);
    }

    agentInterview.addEventListener('input', async e => {
      const { question } = e.data;
      const answer = await getAnswer(question);
      agentInterview.write(answer);
    });

    agentInterview.addEventListener('output', async e => {
      const { text } = e.data;
      console.log(text);
    });

    agentInterview.addEventListener('change', e => {
      const { updateObject, agentJson } = e.data;
      // console.log('change', updateObject);
    });

    const imageLogger = (label) => async (e) => {
      const { result: blob, signal } = e.data;
      const ab = await blob.arrayBuffer();
      if (signal.aborted) return;

      const b = Buffer.from(ab);
      const jimp = await Jimp.read(b);
      if (signal.aborted) return;

      const imageRenderer = new ImageRenderer();
      const { text: imageText } = imageRenderer.render(jimp.bitmap, consoleImageWidth, undefined);
      console.log(label);
      console.log(imageText);
    };

    agentInterview.addEventListener('preview', imageLogger('Avatar updated:'));
    agentInterview.addEventListener('homespace', imageLogger('Homespace updated:'));

    const result = await agentInterview.waitForFinish();
    questionLogger.close();
    return result;
  }
}

export default AgentInterviewFlow;