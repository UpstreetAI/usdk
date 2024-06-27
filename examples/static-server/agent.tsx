import React from 'react';
import {
  useAgents,
  useCurrentAgent,
  PendingActionEvent,

  Agent,
  DefaultAgentComponents,
  StaticServer,
} from 'react-agents';

//

export default function render() {
  return (
    <Agent>
      <StaticServer />
    </Agent>
  );
}
