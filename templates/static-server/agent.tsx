import React from 'react';
import {
  useAgents,
  useCurrentAgent,
  PendingActionEvent,
  Agent,
  StaticServer,
  JsonAction,

  DefaultActions,
} from 'upstreet-sdk/agents';

//

export default function render() {
  return (
    <Agent>
      <StaticServer />
    </Agent>
  );
}
