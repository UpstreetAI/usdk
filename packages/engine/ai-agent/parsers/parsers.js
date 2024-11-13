// import {
//   validMoods,
//   validEmotions,
// } from '../../constants/companion-constants.js';
import {
  AvatarMLStreamParser,
} from '../utils/avatarml-stream-parser.js';

export const defaultParserSpecs = [
  {
    name: 'AvatarML',
    makeParserFn: () => { // XXX get the parser from here during pipeline execution
      const avatarMlParser = new AvatarMLStreamParser({ // XXX parser should be chosen by the promptset
        skills: this.skills,
        onMessage: (message) => {
          const {
            character,
            command,
            value,
          } = message;

          const aiAgent = this.getAiAgentByName(character);
          if (aiAgent) {
            const agentMessage = new AgentMessage({
              type: command,
              user: character,
              value,
            }, {
              signal,
            });
            const p = this.playAgentMessage(agentMessage);
            agentMessageRunPromises.push(p);
          } else {
            console.warn('no such ai agent during llm parse processing: ' + character);
            // XXX this should probably cause stream abort, to prevent bad data from being processed
            debugger;
          }
        },
      });
      // XXX finish this
      return avatarMlParser;
    },
  },
];