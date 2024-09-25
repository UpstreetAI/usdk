'use client';

import { useEffect, useState } from 'react';
import EventSource from 'eventsource';
import { deployEndpointUrl } from '@/utils/const/endpoints';
import { getJWT } from '@/lib/jwt';

type Params = {
  params: {
    id: string;
  };
};

export default function Logs({ params }: Params) {
  // const supabase = makeAnonymousClient(env);
  const agentId = decodeURIComponent(params.id);

  const [events, setEvents] = useState<string[]>([]);

  useEffect(() => {
    const abortController = new AbortController();
    const { signal } = abortController;

    (async () => {
      const u = `${deployEndpointUrl}/agents/${agentId}/logs`;
      const jwt = await getJWT();
      if (signal.aborted) return;

      setEvents(events => events.concat(['<connecting...>']));
      const eventSource = new EventSource(u, {
        headers: {
          'Authorization': `Bearer ${jwt}`,
        },
      });
      eventSource.addEventListener('open', (e) => {
        setEvents(events => events.concat(['<connected>']));
      });
      eventSource.addEventListener('message', (e) => {
        const j = JSON.parse(e.data);
        if (typeof j === 'string') {
          setEvents(events => events.concat([j]));
        } else {
          setEvents(events => events.concat([JSON.stringify(j)]));
        }
      });
      eventSource.addEventListener('error', (e) => {
        setEvents(events => events.concat([`<error: ${JSON.stringify(e)}>`]));
      });
      eventSource.addEventListener('close', (e) => {
        setEvents(events => events.concat(['<disconnected>']));
      });

      signal.addEventListener('abort', () => {
        eventSource.close();
      });
    })();

    return () => {
      abortController.abort();
    };
  }, []);

  return (
    <div className="whitespace-pre">
      {events.map((event, index) => {
        return (
          <div key={index}>
            {event}
          </div>
        );
      })}
    </div>
  );
}
