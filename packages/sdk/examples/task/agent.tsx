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
  Task,
  TaskResult,
  // WebBrowser,
} from 'react-agents';

//

export default function MyAgent(props) {
  return (
    <Agent>
      <Task
        // id="autonomous"
        handler={async (e) => {
          // console.log('autonomous task 1');
          await e.data.agent.think();
          // console.log('autonomous task 2');
          return new TaskResult(TaskResult.SCHEDULE, {
            timestamp: new Date(Date.now() + 2000),
          });
        }}
      />
    </Agent>
  );
}
