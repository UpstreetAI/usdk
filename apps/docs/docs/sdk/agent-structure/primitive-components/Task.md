---
sidebar_position: 3
slug: /sdk/components/task
description: "Tasks enable an agent to take charge of its own scheduling, including the ability to sleep and wake itself in the future."
sidebar_label: <Task />
---

# Processing with `<Task>`s

An agent that operates autonomously must be able to act on its own, even if there are no active external perceptions. Tasks enable an agent to take charge of its own scheduling, including the ability to sleep and wake itself in the future.

A task is a unit of work the agent is currently performing. Each task defines a handler which performs the next step in the task, and either finalizes the task or schedules the timeout at which the agent should wake to perform more work

```tsx
import { TaskResponse } from 'react-agents';
// have the agent say something every few seconds
<Task
  handler={async (e) => {
    await e.data.agent.think();
    return new TaskResponse(TaskResponse.SCHEDULE, {
      timestamp: Date.now() + 2000,
    })
  }}
/>
```