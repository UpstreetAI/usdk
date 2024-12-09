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
      console.log('cookies', cookies);
      const cookieStrings = cookies.map(cookie => {
        const domain = cookie.domain?.startsWith('.') ? cookie.domain : `.${cookie.domain}`;
        const expires = cookie.expires ? new Date(cookie.expires).toUTCString() : undefined;
        
        return `${cookie.name || cookie.key}=${cookie.value}; Domain=${domain}; Path=${cookie.path || '/'}${expires ? `; Expires=${expires}` : ''}${cookie.httpOnly ? '; HttpOnly' : ''}${cookie.secure ? '; Secure' : ''}; SameSite=${cookie.sameSite || 'Lax'}`;
      });
      
      await this.scraper.setCookies(cookieStrings);
      if (await this.scraper.isLoggedIn()) {
        console.log('Already logged in with cookies');
        this.startTweetHandlingAndPolling();
        return;
      }
    }

    const { username, password, email, apiKey, apiSecretKey, accessToken, accessTokenSecret } = this.auth;


    if (!username || !password) {
      throw new Error('Username and password are required');
    }

    if (apiKey && apiSecretKey && accessToken && accessTokenSecret) {
      console.log('logging in with api key');
      await this.scraper.login(username, password, email, apiKey, apiSecretKey, accessToken, accessTokenSecret);
    } else {
      console.log('logging in with username and password');
      await this.scraper.login(username, password, email);
    }

    console.log('logged in');

    const newCookies = await this.scraper.getCookies();
    await this.kv.set(cookiesKey, newCookies);

    this.startTweetHandlingAndPolling();
  }

  private startTweetHandlingAndPolling() {
    const _handleTweet = async (tweet: any, author: any) => {
      const { id: tweetId, text, conversationId, userId } = tweet;

      let conversation = this.conversations.get(conversationId);
      if (!conversation) {
        conversation = new ConversationObject({
          agent: this.agent,
          getHash: () => `twitter:conversation:${conversationId}`,
        });

        this.agent.conversationManager.addConversation(conversation);
        this.conversations.set(conversationId, conversation);

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
      conversation.addAgent(userId, player);

      const rawMessage = {
        method: 'say',
        args: {
          text
        }
      };
      const newMessage = formatConversationMessage(rawMessage, {
        agent: this.agent,
      });

      console.log('newMessage', newMessage);
      const steps = await conversation.addLocalMessage(newMessage);
      console.log('steps', steps);
      
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
          const mentions = this.scraper.getTweetsAndReplies(user.username);

          console.log('mentions', mentions);
          console.log('user', user);

          const seenTweetIds = await this.kv.get(`twitter:seenTweetIds`, []);
          const mentionsArray = [];
          for await (const tweet of mentions) {
            mentionsArray.push(tweet);
          }
          const mentionsData = mentionsArray.filter(tweet => !seenTweetIds.includes(tweet.id));

          if (mentionsData.length > 0) {
            const tweetPromises = mentionsData.map(async (tweet) => {
              console.log('tweet', tweet);
              const author = await this.scraper.getProfile(tweet.username);
              console.log('author', author);
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