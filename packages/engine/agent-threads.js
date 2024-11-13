// import {
//   assistantModel,
// } from './agents.js';
import { aiProxyHost } from './endpoints.js';
import { getCleanJwt } from './util.js';

const maxLimit = 100;

export const createThread = async ({ messages = [] } = {}) => {
  const jwt = getCleanJwt();
  const u = `https://${aiProxyHost}/api/ai/threads`;
  const j = {
    messages,
  };
  const res = await fetch(u, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${jwt}`,
    },
    body: JSON.stringify(j),
  });
  const { id: threadId } = await res.json();
  const threadMessages = await getMessages({
    threadId,
  });
  return {
    threadId,
    messages: threadMessages,
  };
};

export const pushThreadMessage = async ({ threadId, message, queue }) => {
  // lock reader
  return await queue.waitForReader(async () => {
    const jwt = getCleanJwt();
    const u = `https://${aiProxyHost}/api/ai/threads/${threadId}/messages`;
    const j = message;
    const res = await fetch(u, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify(j),
    });
    if (res.ok) {
      const result = await res.json();
      return result;
    } else {
      throw new Error('bad status code: ' + res.status);
    }
  });
};

export const getMessages = async ({
  threadId,
  // before,
  after,
}) => {
  // if (before) {
  //   debugger;
  // }

  const messages = [];
  for (;;) {
    const jwt = getCleanJwt();
    const u = new URL(
      `https://${aiProxyHost}/api/ai/threads/${threadId}/messages`
    );
    u.searchParams.set('limit', maxLimit);
    u.searchParams.set('order', 'asc');
    after && u.searchParams.set('after', after);
    const res = await fetch(u, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`,
      },
    });
    if (res.ok) {
      const result = await res.json();
      const { data } = result;
      for (const message of data) {
        messages.push(message);
      }
      if (data.length >= maxLimit) {
        after = data[data.length - 1].id;
        continue;
      } else {
        break;
      }
    } else {
      throw new Error('bad status code: ' + res.status);
    }
  }
  // console.log('got new messages after', {
  //   messages,
  //   after,
  // });
  return messages;
};

export const continueThread = async ({
  threadId,
  assistantId,
  messages,
  queue,
}) => {
  // lock writer
  const newMessages = await queue.waitForWriter(async () => {
    const after = messages[messages.length - 1]?.id;

    const jwt = getCleanJwt();
    const u = `https://${aiProxyHost}/api/ai/threads/${threadId}/runs`;
    const j = {
      assistant_id: assistantId,
    };
    const res = await fetch(u, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify(j),
    });
    if (res.ok) {
      const result = await res.json();
      const { id: runId } = result;
      await waitForRun({
        threadId,
        runId,
      });

      const newMessages = await getMessages({
        threadId,
        after,
      });
      console.log('continue thread 1', { messages, newMessages });
      return newMessages;
    } else {
      throw new Error('bad status code: ' + res.status);
    }
  });
  console.log('continue thread 2', { newMessages });
  return newMessages;
};

const retryTimeout = 500;
export const waitForRun = async ({ threadId, runId, timeout = Infinity }) => {
  const startTime = performance.now();

  for (;;) {
    try {
      const jwt = getCleanJwt();
      const u = `https://${aiProxyHost}/api/ai/threads/${threadId}/runs/${runId}`;
      const res = await fetch(u, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwt}`,
        },
      });
      const result = await res.json();
      const { status, required_action } = result;
      // const {completed_at, failed_at, cancelled_at} = result;
      // if (completed_at || failed_at || cancelled_at) {
      // console.log('got result', result);
      if (
        [
          'cancelled',
          'failed',
          'completed',
          'expired',
          'requires_action',
        ].includes(status)
      ) {
        // const messages = await getMessages();
        // return messages;
        return result;
      }
    } catch (err) {
      console.warn(err);
    }

    // console.log('not done yet 1', {result});
    await new Promise((accept, reject) => {
      setTimeout(accept, retryTimeout);
    });
    // console.log('not done yet 2', {result, messages});

    const now = performance.now();
    const timeDiff = now - startTime;
    if (timeDiff > timeout) {
      // throw new Error('timeout');
      break;
    }
  }
};
