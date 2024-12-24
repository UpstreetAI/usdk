import { Client as TwitterClient } from 'twitter-api-sdk';
import { TwitterBase } from './twitter-base';
import { TwitterApiAuth, ActiveAgentObject } from '../types';
import { ConversationObject } from './conversation-object';
import { formatConversationMessage } from '../util/message-utils';
import { bindConversationToAgent } from '../runtime';
import { QueueManager } from 'queue-manager';
import { Player } from 'react-agents-client/util/player.mjs';

export class TwitterApiClient extends TwitterBase {
  private client: TwitterClient | null = null;
  private refreshToken: string;
  private clientId: string;

  constructor(auth: TwitterApiAuth, agent: ActiveAgentObject, kv: any, codecs: any, jwt: string) {
    super(agent, kv, codecs, jwt);

    const [accessToken, refreshToken, clientId] = auth.token.split(':');
    if (!accessToken) throw new Error('Twitter bot requires an access token');
    if (!refreshToken) throw new Error('Twitter bot requires a refresh token');
    if (!clientId) throw new Error('Twitter bot requires a client ID');

    this.refreshToken = refreshToken;
    this.clientId = clientId;
  }

  async start() {
    const refreshTokenKey = `twitter:refreshToken`;
    const seenTweetIdsKey = `twitter:seenTweetIds`;

    const _ensureClient = async () => {
      if (this.client) {
        let ok = true;
        try {
          const user = await _fetchLocalUser();
          if (!user) {
            ok = false;
          }
        } catch (err) {
          console.warn('client not authorized, attempting refresh:', err);
          ok = false;
        }
        if (!ok) {
          this.client = null;
        }
      }
      if (!this.client) {
        await _refreshClient();
      }
    };

    const _fetchAccessToken = async () => {
      const _tryFetch = async (refreshToken: string) => {
        const fd = new URLSearchParams();
        fd.append('refresh_token', refreshToken);
        fd.append('grant_type', 'refresh_token');
        fd.append('client_id', this.clientId);

        const res = await fetch('https://api.x.com/2/oauth2/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: fd,
        });

        if (res.ok) {
          const data = await res.json();
          return data;
        } else {
          const text = await res.text();
          throw new Error(`Failed to refresh token: ${res.status}: ${text}`);
        }
      };

      const data = await (async () => {
        let error = null;
        try {
          return await _tryFetch(this.refreshToken);
        } catch (err) {
          error = err;
        }
        try {
          const cachedRefreshToken = await this.kv.get(refreshTokenKey, null);
          if (cachedRefreshToken) {
            return await _tryFetch(cachedRefreshToken);
          } else {
            throw new Error(`Passed refresh token didn't work and no refresh token cached; aborting`);
          }
        } catch (err) {
          error = err;
        }
        throw error;
      })();
      await this.kv.set(refreshTokenKey, data.refresh_token);
      return data.access_token;
    };

    const _refreshClient = async () => {
      const accessToken = await _fetchAccessToken();
      this.client = new TwitterClient(accessToken, {
        endpoint: `https://ai.upstreet.ai/api/twitter`,
      });
    };

    const _fetchLocalUser = async () => {
      return await this.client.users.findMyUser();
    };

    const _fetchMentions = async (userId: string) => {
      return await this.client.tweets.usersIdMentions(userId, {
        expansions: ["author_id"],
        "tweet.fields": ["created_at", "conversation_id"]
      });
    };

    const _fetchUserById = async (userId: string) => {
      return await this.client.users.findUserById(userId);
    };

    const _handleTweet = async (tweet: any, author: any) => {
      const { id: tweetId, text, conversation_id } = tweet;
      const { id: authorId } = author.data;

      let conversation = this.conversations.get(conversation_id);
      if (!conversation) {
        conversation = new ConversationObject({
          agent: this.agent,
          getHash: () => `twitter:conversation:${conversation_id}`,
        });

        this.agent.conversationManager.addConversation(conversation);
        this.conversations.set(conversation_id, conversation);

        bindConversationToAgent({
          agent: this.agent,
          conversation,
        });

        const player = new Player(this.agent.id, {
          name: this.agent.name,
        });
        conversation.addAgent(this.agent.id, player);
      }

      const player = this.makePlayerFromAuthor(author);
      conversation.addAgent(authorId, player);

      const rawMessage = {
        method: 'say',
        args: {
          text
        }
      };
      const newMessage = formatConversationMessage(rawMessage, {
        agent: this.agent,
      });

      const steps = await conversation.addLocalMessage(newMessage);

      const actions = steps.map(step => step.action).filter(Boolean);
      for (const message of actions) {
        const { method, args } = message;

        if (method === 'say') {
          const { text } = args;
          await this.client.tweets.createTweet({
            text,
            reply: {
              in_reply_to_tweet_id: tweetId,
            }
          });
        }
      }
    };

    const queueManager = new QueueManager();
    const _poll = async () => {
      try {
        await queueManager.waitForTurn(async () => {
          await _ensureClient();
          const user = await _fetchLocalUser();
          const mentions = await _fetchMentions(user.data.id);
          const seenTweetIds = await this.kv.get(seenTweetIdsKey, []);
          const mentionsData = (mentions.data || [])
            .filter(tweet => tweet.author_id !== user.data.id)
            .filter(tweet => !seenTweetIds.includes(tweet.id));

          if (mentionsData.length > 0) {
            const tweetPromises = mentionsData.map(async (tweet) => {
              const { author_id } = tweet;
              const author = await _fetchUserById(author_id);
              await _handleTweet(tweet, author);
            });
            await Promise.all(tweetPromises);
          } else {
            console.warn('no new tweets');
          }
        });
      } catch (err) {
        console.error('Error polling tweets:', err);
      }
    };

    const pollTimeout = setTimeout(() => {
      _poll();
    });
    const pollRate = 15 * 60 * 1000 / 10 + 1000;
    const pollInterval = setInterval(async () => {
      _poll();
    }, pollRate);

    const { signal } = this.abortController;
    signal.addEventListener('abort', () => {
      clearTimeout(pollTimeout);
      clearInterval(pollInterval);

      for (const conversation of this.conversations.values()) {
        this.agent.conversationManager.removeConversation(conversation);
      }
    });
  }

  destroy() {
    this.abortController.abort();
    this.abortController = new AbortController();
  }
}