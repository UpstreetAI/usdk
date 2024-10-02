import { useEffect, useState } from 'react';
import type {
  ActiveAgentObject,
  ConversationObject,
  LiveTriggerEventData,
} from '../types';

//

type LiveTimeout = {
  updateFn: () => void;
  conversation: ConversationObject;
  timestamp: number;
};

//

/*
the purpose of this class is to support runtime-integrated alarm timeouts
there is no local storage; this is runtime state only
as a matter of policy, only the earliest timeout for each thread is considered
*/
export class LiveManager extends EventTarget {
  agent: ActiveAgentObject;
  #timeouts: LiveTimeout[] = [];

  constructor({
    agent,
  }: {
    agent: ActiveAgentObject;
  }) {
    super();

    this.agent = agent;
  }

  getTimeouts(conversation: ConversationObject) {
    return this.#timeouts.filter((timeout) => timeout.conversation === conversation);
  }
  useTimeouts(conversation: ConversationObject) {
    const getTimeouts = () => this.getTimeouts(conversation).map(t => t.timestamp);
    const [timeouts, setTimeouts] = useState(getTimeouts);

    useEffect(() => {
      const updatealarm = () => {
        setTimeouts(getTimeouts());
      };
      this.addEventListener('updatealarm', updatealarm);
      return () => {
        this.removeEventListener('updatealarm', updatealarm);
      };
    }, []);

    return timeouts;
  }
  setTimeout(updateFn: () => void, conversation: ConversationObject, timestamp: number) {
    const timeout = {
      updateFn,
      conversation,
      timestamp,
    };
    this.#timeouts.push(timeout);
    this.#timeouts.sort((a, b) => a.timestamp - b.timestamp);

    this.updateAlarm();
  }
  process(now = Date.now()) {
    let triggered = false;
    const seenConversations = new Set<ConversationObject>();
    this.#timeouts = this.#timeouts.filter((timeout) => {
      if (now >= timeout.timestamp) {
        // trigger only once per thread, in case of multiple timeouts in one tick
        if (!seenConversations.has(timeout.conversation)) {
          seenConversations.add(timeout.conversation);
          this.trigger(timeout);
        }
        triggered = true;
        return false;
      } else {
        return true;
      }
    });
    if (triggered) {
      this.updateAlarm();
    }
  }
  private trigger(timeout: LiveTimeout) {
    this.dispatchEvent(new MessageEvent<LiveTriggerEventData>('trigger', {
      data: {
        agent: this.agent,
        conversation: timeout.conversation,
      },
    }));
  }
  private updateAlarm() {
    this.dispatchEvent(new MessageEvent('updatealarm', {
      data: null,
    }));
  }
  getNextTimeout() {
    // get the minimum timeout
    let minTimeout = Infinity;
    for (const timeout of this.#timeouts) {
      minTimeout = Math.min(minTimeout, timeout.timestamp);
    }
    return minTimeout;
  }
}
