import React from 'react';
import {
  useAgents,
  useCurrentAgent,
  PendingActionEvent,

  Agent,
  DefaultAgentComponents,
  StaticServer,
  JsonAction,
} from 'upstreet-sdk/agents';

//

export default function render() {
  return (
    <Agent>
      <DefaultAgentComponents />
      <StaticServer />
    </Agent>
  );
}
