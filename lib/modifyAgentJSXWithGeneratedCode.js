import path from 'path'
import { readFile, writeFile } from 'node:fs/promises'
import { generateAgentReactCodeFromPrompt } from './generateAgentReactCodeFromPrompt.js'
import { padLines } from './padLines.js'


export async function modifyAgentJSXWithGeneratedCode({
  agentJSXPath,
  prompt,
  codeGenContext,
}) {
  if (!agentJSXPath || !prompt || !codeGenContext) {
    throw new Error('modifyAgentJSXWithGeneratedCode missing arguments');
  }
  const {nodes} = codeGenContext;

  // generate the code
  const
    generatedCode = await generateAgentReactCodeFromPrompt( prompt, nodes ),
    importsString = generatedCode.imports.join(',\n').trimEnd(),
    agentJSX = await readFile( agentJSXPath, 'utf8' ),
    importsHookRegex = /\/\* IMPORTS REGEX HOOK \*\//,
    jsxHookRegex = /\{\/\* JSX REGEX HOOK \*\/}/,
    // Indents are defined statically, but could be dynamic with some testing.
    importIndentLevel = 2,
    jsxIndentLevel = 6,

    newAgentJSX = agentJSX
      .replace(
        importsHookRegex,
        padLines( importsString, importIndentLevel ),
      )
      .replace(
        jsxHookRegex,
        padLines( generatedCode.jsx, jsxIndentLevel ),
      )

  await writeFile( agentJSXPath, newAgentJSX )

  return generatedCode
}
