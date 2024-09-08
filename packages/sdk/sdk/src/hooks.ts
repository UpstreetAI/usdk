import { useState, useMemo, useContext, useEffect, use } from 'react';
import Stripe from 'stripe';
import memoizeOne from 'memoize-one';
import {
  SceneObject,
  AgentObject,
  ActiveAgentObject,
  ActionProps,
  FormatterProps,
  NameProps,
  PersonalityProps,
  ActionMessages,
  ActionMessage,
  ActionHistoryQuery,
  ChatArgs,
  KvArgs,
  TtsArgs,
  Tts,
  StoreItem,
} from './types';
import {
  AppContext,
  AgentContext,
  AgentRegistryContext,
  ConversationsContext,
  ConversationContext,
} from './context';
// import { zbencode, zbdecode } from './lib/zjs/encoding.mjs';
import {
  // ConversationObject,
  CACHED_MESSAGES_LIMIT,
} from './classes/conversation-object';
import {
  loadMessagesFromDatabase,
} from './util/loadMessagesFromDatabase';
import {
  abortError,
  makePromise,
  uint8ArrayToBase64,
  base64ToUint8Array,
} from './util/util.mjs';
import {
  supabaseSubscribe,
} from './util/supabase-client.mjs';
import {
  QueueManager,
} from './util/queue-manager.mjs';
import {
  aiProxyHost,
} from './util/endpoints.mjs';
import {
  devSuffix,
} from './util/stripe-utils.mjs';
import {
  FetchHttpClient,
} from './util/stripe/net/FetchHttpClient';

//

export const useAuthToken: () => string = () => {
  const appContextValue = useContext(AppContext);
  return appContextValue.useAuthToken();
};

//

export const useAgent = () => {
  const agentContextValue = useContext(AgentContext);
  return agentContextValue;
};
export const useConversations = () => {
  const conversationsContext = useContext(ConversationsContext);
  return conversationsContext.conversations;
};
export const useConversation = () => {
  const conversationContextValue = useContext(ConversationContext);
  return conversationContextValue.conversation;
};
/* export const useScene: () => SceneObject = () => {
  const agentContextValue = useContext(AgentContext);
  return agentContextValue.useScene();
};
export const useAgents: () => Array<AgentObject> = () => {
  const agentContextValue = useContext(AgentContext);
  return agentContextValue.useAgents();
}; */

export const useActions: () => Array<ActionProps> = () => {
  const agentRegistryValue = useContext(AgentRegistryContext).agentRegistry;
  return agentRegistryValue.actions;
};
export const useFormatters: () => Array<FormatterProps> = () => {
  const agentRegistryValue = useContext(AgentRegistryContext).agentRegistry;
  return agentRegistryValue.formatters;
};

export const useName: () => string = () => {
  const agent = useContext(AgentContext);
  const agentRegistryValue = useContext(AgentRegistryContext).agentRegistry;
  const names = agentRegistryValue.names;
  return names.length > 0 ? names[0].children : agent.name;
};
export const usePersonality: () => string = () => {
  const agent = useContext(AgentContext);
  const agentRegistryValue = useContext(AgentRegistryContext).agentRegistry;
  const personalities = agentRegistryValue.personalities;
  return personalities.length > 0 ? personalities[0].children : agent.bio;
};

export const useCachedMessages = (opts?: ActionHistoryQuery) => {
  const agent = useAgent();
  const supabase = agent.useSupabase();
  const conversation = useConversation();

  if (!conversation.messageCache.loadPromise) {
    conversation.messageCache.loadPromise = (async () => {
      const messages = await loadMessagesFromDatabase({
        supabase,
        conversationId: conversation.getKey(),
        agentId: agent.id,
        limit: CACHED_MESSAGES_LIMIT,
      });
      conversation.messageCache.prependMessages(messages);
      conversation.messageCache.loaded = true;
    })();
  }
  use(conversation.messageCache.loadPromise);
  const messages = conversation.getCachedMessages(opts?.filter);
  return messages;
};
export const useMessageFetch = (opts?: ActionHistoryQuery) => {
  const agent = useAgent();
  const supabase = agent.useSupabase();
  const conversation = useConversation();
  const optsString = JSON.stringify(opts);
  const messagesPromise = useMemo<any>(makePromise, [conversation, optsString]);
  useEffect(() => {
    const abortController = new AbortController();
    const { signal } = abortController;
    (async () => {
      try {
        const messages = await conversation.fetchMessages(opts?.filter, {
          supabase,
          signal,
        });
        messagesPromise.resolve(messages);
      } catch (err) {
        if (err === abortError) {
          // nothing
        } else {
          messagesPromise.reject(err);
        }
      }
    })();

    return () => {
      abortController.abort(abortError);
    };
  }, [conversation, optsString]);
  use(messagesPromise);
  return messagesPromise;
};

export const useKv = (opts?: KvArgs) => {
  const appContextValue = useContext(AppContext);
  return appContextValue.useKv(opts);
};

export const useTts: (opts?: TtsArgs) => Tts = (opts) => {
  return memoizeOne((voiceEndpoint?: string, sampleRate?: number) => {
    const appContextValue = useContext(AppContext);
    return appContextValue.useTts(opts);
  })(opts?.voiceEndpoint, opts?.sampleRate);
};

export const useStripe = () => {
  const { stripeConnectAccountId } = useAgent();
  const authToken = useAuthToken();

  const customFetchFn = async (url: string, options: any) => {
    const u = new URL(url);
    // redirect to the ai proxy host
    u.host = aiProxyHost;
    // prefix the path with /api/stripe
    u.pathname = `/api/stripe${devSuffix}${u.pathname}`;
    return fetch(u.toString(), {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${authToken}`,
      },
    });
  };
  const httpClient = new FetchHttpClient(customFetchFn);
  const stripe = new Stripe(stripeConnectAccountId, {
    httpClient: httpClient as any,
    stripeAccount: stripeConnectAccountId,
  });
  return stripe;
};

export const useStoreItems: () => StoreItem[] = () => {
  // const agent = useContext(AgentContext);
  const agentRegistryValue = useContext(AgentRegistryContext).agentRegistry;
  const storeItems = agentRegistryValue.storeItems;
  return storeItems;
};
type AgentWebhook = {
  id: string,
  buyerUserId: string,
  type: 'payment' | 'subscription',
  event: any,
};
type AgentWebhooksState = {
  webhooks: AgentWebhook[],
  lastUpdateTimestamp: number,
};
const makeAgentWebhooksState = (): AgentWebhooksState => ({
  webhooks: [],
  lastUpdateTimestamp: 0,
});
const agentWebhooksStateKey = 'agentWebhooksState';
export const usePurchases = () => {
  const agent = useAgent();
  const agentId = agent.id;
  const ownerId = agent.ownerId;
  const supabase = agent.useSupabase();
  const kv = useKv();
  const stripe = useStripe();
  const queueManager = useMemo(() => new QueueManager(), []);
  const [agentWebhooksState, setAgentWebhooksState] = kv.use<AgentWebhooksState>(agentWebhooksStateKey, makeAgentWebhooksState);

  const handleWebhook = async (webhook: any) => {
    const { data: event, created_at } = webhook;
    const createdAt = +new Date(created_at);
    const agentWebhooksState = await kv.get<AgentWebhooksState>(agentWebhooksStateKey, makeAgentWebhooksState);

    if (createdAt >= agentWebhooksState.lastUpdateTimestamp && !agentWebhooksState.webhooks.some((w) => w.id === webhook.id)) {
      const object = event.data?.object;
      console.log('handle webhook', event.type, webhook);
      switch (event.type) {
        case 'checkout.session.completed': {
          const webhookOwnerId = webhook.user_id;
          const {
            agentId: webhookAgentId,
            targetUserId: webhookBuyerUserId,
          } = object.metadata;
          if (typeof webhookAgentId === 'string' && typeof webhookBuyerUserId === 'string') {
            console.log('checking handling', {
              equal: webhookOwnerId === ownerId && webhookAgentId === agentId,
              webhookOwnerId,
              ownerId,
              webhookAgentId,
              agentId,
            });
            if (webhookOwnerId === ownerId && webhookAgentId === agentId) {
              // if it's the correct owner and agent, handle the webhook
              const {
                mode, // 'payment' | 'subscription'
                payment_intent,
                subscription,
              } = object;
              // console.log('parse object', object);
              if (mode === 'payment') {
                const paymentIntentObject = await stripe.paymentIntents.retrieve(payment_intent);
                console.log('got payment intent', paymentIntentObject);
                // const {
                //   amount,
                //   currency,
                // } = paymentIntentObject;
                await kv.set<AgentWebhooksState>(agentWebhooksStateKey, {
                  webhooks: [
                    ...agentWebhooksState.webhooks,
                    {
                      id: webhook.id,
                      buyerUserId: webhookBuyerUserId,
                      type: 'payment',
                      event: paymentIntentObject,
                    },
                  ],
                  lastUpdateTimestamp: createdAt,
                });
              } else if (mode === 'subscription') {
                const subscriptionObject = await stripe.subscriptions.retrieve(subscription);
                console.log('got subscription', subscriptionObject);
                // const {
                //   items,
                //   status,
                // } = subscriptionObject;
                await kv.set<AgentWebhooksState>(agentWebhooksStateKey, {
                  webhooks: [
                    ...agentWebhooksState.webhooks,
                    {
                      id: webhook.id,
                      buyerUserId: webhookBuyerUserId,
                      type: 'subscription',
                      event: subscriptionObject,
                    },
                  ],
                  lastUpdateTimestamp: createdAt,
                });
              } else {
                // unknown mode; ignore
              }
            } else {
              // else if it's the wrong owner or agent, ignore the webhook
              // nothing
            }
          } else {
            console.warn('checkout.session.completed event missing metadata', event);
          }
          break;
        }
      }
    }
  };

  // get initial webhooks
  useEffect(() => {
    let live = true;

    (async () => {
      await queueManager.waitForTurn(async () => {
        const agentWebhooksState = await kv.get<AgentWebhooksState>(agentWebhooksStateKey, makeAgentWebhooksState);
        if (!live) return;

        console.log('initial', agentWebhooksState);

        const result = await supabase
          .from('webhooks')
          .select('*')
          .eq('user_id', ownerId)
          .gte('created_at', new Date(agentWebhooksState.lastUpdateTimestamp).toISOString())
          .order('created_at', { ascending: true });
        if (!live) return;

        const { error, data } = result;
        if (!error) {
          for (const webhook of data) {
            await handleWebhook(webhook);
           }
        } else {
          console.error(error);
        }
      });
    })();

    return () => {
      live = false;
    };
  }, []);
  // subscribe to webhooks
  useEffect(() => {
    const channel = supabaseSubscribe({
      supabase,
      table: 'webhooks',
      userId: ownerId,
    }, (payload: any) => {
      // console.log('subscription payload', payload);
      const webhook = payload.new;
      queueManager.waitForTurn(async () => {
        await handleWebhook(webhook);
      });
    });
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // XXX finish this
  console.log('render webhooks state', agentWebhooksState);

  const purchases = [];
  return purchases;
};