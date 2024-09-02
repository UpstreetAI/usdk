import { featureSpecs } from './agent-features.mjs';

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
    <Agent>
${featurePlaceholder}
    </Agent>
  );
}
`;
const importIndentString = Array(2 + 1).join(' ');
const featureIndentString = Array(3 * 2 + 1).join(' ');
export const makeAgentSourceCode = (featuresObject) => {
  const imports = [];
  const components = [];
  for (const [key, value] of Object.entries(featuresObject)) {
    if (value) {
      const spec = featureSpecs.find(spec => spec.name === key);
      imports.push(...spec.imports(value));
      components.push(...spec.components(value));
    }
  }
  const featureImports = imports.map(l => `${importIndentString}${l},`).join('\n');
  const featureComponents = components.map(l => `${featureIndentString}${l}`).join('\n');
  if (featureImports || featureComponents) {
    return defaultSourceCode
      .replace(importPlaceholder, featureImports)
      .replace(featurePlaceholder, featureComponents);
  } else {
    return defaultSourceCode;
  }
};