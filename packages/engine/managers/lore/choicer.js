import {
  aiProxyHost,
} from '../../endpoints.js';
// import {
//   Message,
// } from './message.js';
// import {
//   // showrunnerInspiration,
//   fetchChatCompletion,
// } from './completer.js';
// import {
//   underline,
// } from '../../util.js';
import {
  EventStreamParseStream,
  // modelTypeContentFns,
} from '../../ai-agent/utils/event-stream-parser.js';
import { getCleanJwt } from '../../utils/jwt-util.js';

//

const model = 'gpt-4';
const defaultMaxChoices = 4;

//

export class Choicer {
  async complete({
    messages: oldMessages,
    maxChoices = defaultMaxChoices,
    signal,
  }) {
    const messages = [
      {
        role: 'system',
        content: `\
The user will provide details about a scene and possibly a partial script.
Reply with 2-${maxChoices} unique options representing possible next lines in the script.
If no script is provided, give options for the first line of dialogue.
They options should be short (max 4 words), and appropriate for a role-playing game.
Each option must be unique. Do not reply with the same option multiple times.
Wrap your response in a code block with triple backticks (\`\`\`), but do not wrap the lines in quotes.
Do not reply with anything else.

Example OK response:
\`\`\`
Yes, of course
No way!
How about...
\`\`\`

Example BAD response:
\`\`\`
Sounds good
Sounds good
Sounds good
Sounds good
\`\`\`
This response is bad because it is repeating the same line multiple times.

Example BAD response:
\`\`\`
"Ok"
"No"
\`\`\`
This response is bad because it is wrapping the lines in quotes.
`,
      },
      {
        role: 'user',
        content: oldMessages.map(m => m.getContent()).join('\n'),
      },
    ];
    const jwt = getCleanJwt();
    const res = await fetch(`https://${aiProxyHost}/api/ai/chat/completions`, {
      method: 'POST',
  
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`,
      },
  
      body: JSON.stringify({
        model,
        messages,
        stream: true,
      }),
      signal,
    });

    const eventStreamParser = new EventStreamParseStream();
    res.body.pipeThrough(eventStreamParser);

    // read the event stream
    let result = '';
    let foundCodeBlock = false;
    const choices = [];
    const reader = eventStreamParser.readable.getReader();
    while (choices.length < maxChoices) {
      const {done, value} = await reader.read();
      if (signal?.aborted) return;
      if (done) {
        break;
      } else {
        result += value;

        let codeBlockMatch;
        const codeBlockRegex = /\`\`\`([^\n]*)\n/;
        while (codeBlockMatch = result.match(/\`\`\`([^\n]*)\n/)) {
          result = result.slice(codeBlockMatch.index + codeBlockMatch[0].length);
          foundCodeBlock = true;
        }

        if (foundCodeBlock) {
          // match lines
          let match;
          while (
            (choices.length < maxChoices) &&
            (match = result.match(/([^\n]*)\n/))
          ) {
            const line = match[1];
            if (!codeBlockRegex.test(line)) {
              choices.push(line);
            }

            result = result.slice(match.index + match[0].length);
          }
        }
      }
    }
    return choices;
  }
}