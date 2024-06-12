import { fetchChatCompletion } from '../sdk/src/util/fetch.mjs'
import { generationModel } from '../const.js'
import dedent from 'dedent'
import { parseCodeBlock } from '../sdk/src/util/util.mjs'
import { generateImportsFromAgentReactCode } from './generateImportsFromAgentReactCode.js'


const
  retryErrors = {
    invalidImports: 'Invalid imports.',
    invalidResponse: 'Invalid response from AI proxy server.',
    noContent: 'No content was generated.'
  },

  retryErrorsValues = Object.values( retryErrors )


export async function generateAgentReactCodeFromPrompt(
  prompt,
  availableNodes = [],
  maxRetries = 3
){
  if (!prompt)
    throw new Error( 'Must provide a prompt for code generation.' )

  if (!availableNodes?.length)
    throw new Error( 'No available nodes for code generation.' )

  return generate( prompt, availableNodes, maxRetries )
}


async function generate(
  prompt,
  availableNodes,
  maxRetries = 3,
  retryNumber = 0,
  errorMessage = '',
) {
  if ( retryNumber > maxRetries )
    throwRetryError(maxRetries, errorMessage)

  try {
    const newPrompt = `Given these available nodes:
\`\`\`
${JSON.stringify(availableNodes, null, 2)}
\`\`\`

Generate react code for the following prompt.
DO NOT generate any other code, as the code you generate will be later inserted into an existing React component called Agent, where imports, state management and other stuff are already taken care of.  
DON'T make them children of any component, including the Agent component. Please just list the required components.
ONLY include components which match the provided nodes.

Prompt:

\`\`\`
${prompt}
\`\`\``,

      messages = [
        {
          role: 'system',

          content: dedent`
            You are capable of generating high-level React code given a prompt and list of available nodes.
            The user will specify a prompt, and you will generate code based on it.
            Use your best judgement for which nodes should be included for a given prompt.
            
            Respond ONLY with valid React code. Do not append or prepend any other text.
            Use the following format:
            
            \`\`\`
              <Component1/>
              <Component2/>
            \`\`\`
          `,
        },
        {
          role: 'user',
          content: newPrompt,
        },
      ],

      res = await fetchChatCompletion({
        messages,
        model: generationModel,
      })

    let content = ''

    if ( res.ok ) {
      const json = await res.json()

      content = json?.choices?.[0]?.message?.content;

      if ( !content )
        throw new Error( retryErrors.noContent )

    } else {
      throw new Error( retryErrors.invalidResponse )
    }

    const jsx = parseCodeBlock( content.trim()).trim()

    const imports =
      await generateImportsFromAgentReactCode( jsx )

    if (!validateImports( imports, availableNodes ))
      throw new Error( retryErrors.invalidImports )

    return {
      jsx,
      imports: imports.join(',\n').trimEnd(),
    }
  } catch(e) {
    if ( retryErrorsValues.includes( e.message ))
      return generate(
        prompt,
        availableNodes,
        maxRetries,
        retryNumber + 1,
        e.message,
      )

    console.warn( 'Could not generate agent code.' )
    throw e
  }
}


function throwRetryError(maxRetries, errorMessage) {
  throw new Error(
    'Could not generate agent react code after ' +
    `${maxRetries} attempts${errorMessage ? `: ${errorMessage}` : '.'}`
  )
}


function validateImports( imports, availableNodes ) {
  return !imports.find( name =>
    !availableNodes.find( node => node.name === name )
  )
}
