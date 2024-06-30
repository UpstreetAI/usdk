---
sidebar_position: 3
slug: /sdk/interface/web-request
description: "Your agents can handle arbitrary web requests by using the `request` perception type. This lets you define any REST interface you like for your agent, such as webhook handlers."
sidebar_label: Web Request
---

# Web Request

Your agents can handle arbitrary web requests by using the `request` perception type. This lets you define any REST interface you like for your agent, such as webhook handlers.

```tsx
<Agent>
  <Perception
    type='request'
    handler={async (e) => {
      cont { request } = e.data;
      return new Response(JSON.stringify({
        ok: true,
      }));
    }}
  />
</Agent>
```