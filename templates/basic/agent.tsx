import React from 'react';
import {
  Agent,
  AgentAppProps,
  DefaultAgentComponents,
  DefaultActions,
  DefaultPrompts,
  DefaultParsers,
  DefaultPerceptions,
  DefaultSchedulers,
  DefaultServers,  
} from 'upstreet-sdk/agents';

//

export default function render(props: AgentAppProps) {
  return (
    <Agent>
      <DefaultAgentComponents />
      {/* equivalent to
        <DefaultActions />
        <DefaultPrompts />
        <DefaultParsers />
        <DefaultPerceptions />
        <DefaultSchedulers />
        <DefaultServers />
      */}
    </Agent>
  );
}
