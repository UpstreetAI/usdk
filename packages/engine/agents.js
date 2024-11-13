import { aiProxyHost } from './endpoints.js';
import { getCleanJwt } from './util.js';

// const assistantModel = `gpt-4-1106-preview`;
// const assistantModel = `gpt-4-vision-preview`; // cannot be used with the Assistants API
export const assistantModel = `gpt-3.5-turbo-1106`;
// export const assistantModel = `gpt-4-32k`;

export const createAssistant = async ({
  instructions = 'You are an AI.',
  name = 'AI',
  functions = [],
  retrieval = false,
  interpreter = false,
  files = [],
} = {}) => {
  const tools = (
    retrieval
      ? [
          {
            type: 'retrieval',
          },
        ]
      : []
  )
    .concat(
      interpreter
        ? [
            {
              type: 'code_interpreter',
            },
          ]
        : []
    )
    .concat(
      functions.map((f) => {
        return {
          type: 'function',
          function: f,
          /*
      {
        description: 'test',
        name: 'test',
        parameters: [
          {
            name: 'test',
            type: 'string',
          },
        ],
      }
      */
        };
      })
    );
  const j = {
    model: assistantModel,
    instructions,
    name,
    // "tools": [{"type": "code_interpreter"}],
    tools,
    file_ids: files,
  };

  const jwt = getCleanJwt();
  const res = await fetch(`https://${aiProxyHost}/api/ai/assistants`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'OpenAI-Beta': 'assistants=v1',
      Authorization: `Bearer ${jwt}`,
    },
    body: JSON.stringify(j),
  });
  const result = await res.json();
  const { id } = result;
  return id;
};
