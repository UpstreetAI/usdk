// import {
//   featureSpecs,
// } from './agent-features.js';

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
export const makeAgentSourceCode = (featuresObject) => {
  const importIndentString = Array(2 + 1).join(' ');
  const featureIndentString = Array(3 * 2 + 1).join(' ');

  const featureImports = [
    featuresObject.tts ? `TTS` : null,
  ].filter(Boolean).map(l => `${importIndentString}${l},`).join('\n');
  const featureComponents = [
    featuresObject.tts ? `<TTS voiceEndpoint=${JSON.stringify(featuresObject.tts.voiceEndpoint)} />` : null,
  ].filter(Boolean).map(l => `${featureIndentString}${l}`).join('\n');
  if (featureImports || featureComponents) {
    return defaultSourceCode
      .replace(importPlaceholder, featureImports)
      .replace(featurePlaceholder, featureComponents);
  } else {
    return defaultSourceCode;
  }
};