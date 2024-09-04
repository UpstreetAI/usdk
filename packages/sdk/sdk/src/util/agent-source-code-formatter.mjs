import { featureSpecs } from './agent-features.mjs';

const agentPropsPlaceholder = ` /* */ `;
const importPlaceholder = `  // ...`;
const featurePlaceholder = `      {/* ... */}`;
const defaultSourceCode = `\
import React from 'react';
import {
  Agent,
${importPlaceholder}
} from 'react-agents';

//

export default function MyAgent() {
  return (
    <Agent${agentPropsPlaceholder}>
${featurePlaceholder}
    </Agent>
  );
}
`;
const agentPropsIndentString = Array(3 * 2 + 1).join(' ');
const agentPropsEndIndentString = Array(2 * 2 + 1).join(' ');
const importIndentString = Array(2 + 1).join(' ');
const featureIndentString = Array(3 * 2 + 1).join(' ');
export const makeAgentSourceCode = (featuresObject) => {
  const agentProps = [];
  const imports = [];
  const components = [];
  for (const [key, value] of Object.entries(featuresObject)) {
    if (value) {
      const spec = featureSpecs.find(spec => spec.name === key);
      if (spec.agentProps) {
        agentProps.push(...spec.agentProps(value));
      }
      if (spec.imports) {
        imports.push(...spec.imports(value));
      }
      if (spec.components) {
        components.push(...spec.components(value));
      }
    }
  }

  let sourceCode = defaultSourceCode;
  const agentPropsString = agentProps.length > 0 ? `\n${
    agentProps
      .map(l => `${agentPropsIndentString}${l}`)
      .join('\n')
  }\n${agentPropsEndIndentString}` : '';
  if (agentPropsString) {
    sourceCode = sourceCode.replace(agentPropsPlaceholder, agentPropsString);
  }
  const featureImports = imports.map(l => `${importIndentString}${l},`).join('\n');
  if (featureImports) {
    sourceCode = sourceCode.replace(importPlaceholder, featureImports);
  }
  const featureComponents = components.map(l => `${featureIndentString}${l}`).join('\n');
  if (featureComponents) {
    sourceCode = sourceCode.replace(featurePlaceholder, featureComponents);
  }
  return sourceCode;
};