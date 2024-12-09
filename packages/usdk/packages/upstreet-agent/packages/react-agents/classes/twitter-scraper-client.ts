import { Scraper } from 'agent-twitter-client';
import { TwitterBase } from './twitter-base';
import { TwitterScraperAuth, ActiveAgentObject } from '../types';
import { ConversationObject } from './conversation-object';
import { formatConversationMessage } from '../util/message-utils';
import { bindConversationToAgent } from '../runtime';
import { QueueManager } from 'queue-manager';
import { Player } from 'react-agents-client/util/player.mjs';

export class TwitterScraperClient extends TwitterBase {
  private scraper: Scraper;
  private auth: TwitterScraperAuth;

  constructor(auth: TwitterScraperAuth, agent: ActiveAgentObject, kv: any, codecs: any, jwt: string) {
    super(agent, kv, codecs, jwt);
    this.auth = auth;
    this.scraper = new Scraper();
  }

  async start() {
    const cookiesKey = `twitter:cookies:${this.auth.username}`;
    
    const cookies = await this.kv.get(cookiesKey);
    if (cookies) {
      await this.scraper.setCookies(cookies);
      if (await this.scraper.isLoggedIn()) {
        return;
      }
    }

    const { username, password, email, apiKey, apiSecretKey, accessToken, accessTokenSecret } = this.auth;
    if (apiKey && apiSecretKey && accessToken && accessTokenSecret) {
      await this.scraper.login(username, password, email, apiKey, apiSecretKey, accessToken, accessTokenSecret);
    } else {
      await this.scraper.login(username, password);
    }

    const newCookies = await this.scraper.getCookies();
    await this.kv.set(cookiesKey, newCookies);

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
          await this.scraper.sendTweet(text, tweetId);
        }
      }
    };

    const queueManager = new QueueManager();
    const _poll = async () => {
      try {
        await queueManager.waitForTurn(async () => {
          const user = await this.scraper.getProfile(this.auth.username);
          const mentions = await this.scraper.getTweetsAndReplies(user.username);
          const seenTweetIds = await this.kv.get(`twitter:seenTweetIds`, []);
          const mentionsData = mentions.filter(tweet => !seenTweetIds.includes(tweet.id));

          if (mentionsData.length > 0) {
            const tweetPromises = mentionsData.map(async (tweet) => {
              const author = await this.scraper.getProfile(tweet.author_id);
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