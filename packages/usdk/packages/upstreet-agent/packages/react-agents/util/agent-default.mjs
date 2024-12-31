export default `\
import React from 'react';
import { Agent } from 'react-agents';
import config from './agent.json';

export default function MyAgent() {
  return (
    <Agent config={config}>
      {/* ... */}
    </Agent>
  );
}
`;