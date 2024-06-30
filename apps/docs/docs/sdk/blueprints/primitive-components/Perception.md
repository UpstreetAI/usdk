---
sidebar_position: 3
slug: /sdk/components/perception
description: "Preceptions correspond to the agent receiving input from its environment."
sidebar_label: <Perception />
---

# Perceiving with `<Perception>`s

Wheras actions correspond to an agent performing output into its environment, preceptions correspond to the agent receiving input from its environment.

Each perception is associated with a specific name and schema. As events are processed by the agent, any matching perception handlers will be called. If the schema is provided but does not match the event data, the event will not be handled.

```tsx
import { z } from 'zod';
<Perception
  name="request"
  handler={async (e) => {
    const { request } = e.data;
    return new Response(JSON.stringify({
      ok: true,
    }));
  }}
/>
```

Here are the default perception events available: