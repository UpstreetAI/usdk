import { readFile, writeFile } from 'node:fs/promises'
import { generateAgentReactCodeFromPrompt } from './generateAgentReactCodeFromPrompt.js'
import { padLines } from './padLines.js'

export async function modifyAgentJSXWithGeneratedCode(
  agentJSXPath,
  prompt = '',
  nodes = [],
) {
  if ( !agentJSXPath )
    throw new Error( 'Missing path to agent JSX.' )

  const
    generatedCode = await generateAgentReactCodeFromPrompt( prompt, nodes ),
    agentJSX = await readFile( agentJSXPath, 'utf8' ),
    importsHookRegex = /\/\* IMPORTS REGEX HOOK \*\//,
    jsxHookRegex = /\{\/\* JSX REGEX HOOK \*\/}/,
    importIndentLevel = 2,
    jsxIndentLevel = 4,

    newAgentJSX = agentJSX
      .replace(
        importsHookRegex,
        padLines( generatedCode.imports, importIndentLevel ).trimStart(),
      )
      .replace(
        jsxHookRegex,
        padLines( generatedCode.jsx, jsxIndentLevel ).trimStart(),
      )

  await writeFile( agentJSXPath, newAgentJSX )
}
