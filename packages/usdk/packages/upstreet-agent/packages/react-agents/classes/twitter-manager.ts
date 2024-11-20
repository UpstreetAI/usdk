import {
  // DiscordRoomSpec,
  // DiscordArgs,
  // ConversationEventData,
  ActiveAgentObject,
  // ExtendableMessageEvent,
  // ActionMessageEventData,
  // PlayableAudioStream,
  TwitterArgs,
} from '../types';
import { Client as TwitterClient } from 'twitter-api-sdk';

//

class TwitterBot {
  token: string;
  abortController: AbortController;
  agent: ActiveAgentObject;
  codecs: any;
  jwt: string;
  constructor(args: TwitterArgs) {
    const {
      token,
      agent,
      codecs,
      jwt,
    } = args;

    this.token = token;
    this.agent = agent;
    this.codecs = codecs;
    this.jwt = jwt;

    this.abortController = new AbortController();

    const _bind = async () => {
      // console.log('twitter client', token);
      const client = new TwitterClient(token, {
        endpoint: `https://ai.upstreet.ai/api/twitter`,
      });
      // console.log('twitter client 2', client);


      // GET /2/users/me - Get authenticated user
      const _fetchLocalUser = async () => {
        return await client.users.findMyUser();
      };
      // GET /2/users/:id/mentions - Get tweets mentioning user
      const _fetchMentions = async (userId: string) => {
        return await client.tweets.usersIdMentions(userId, {
          expansions: ["author_id"],
          "tweet.fields": ["created_at"]
        });
      };
      // GET /2/users/:id - Get user by ID
      const _fetchUserById = async (userId: string) => {
        return await client.users.findUserById(userId);
      };
      const _poll = async () => {
        try {
          // GET /2/users/me endpoint
         const user = await _fetchLocalUser();

          const mentions = await _fetchMentions(user.data.id);
          
          if (mentions.data) {
            for (const tweet of mentions.data) {
              const { author_id, text } = tweet;
              const author = await _fetchUserById(author_id);
              const authorUsername = author.data.username;

              console.log('got tweet', text, authorUsername);
            }
          }
        } catch (err) {
          console.error('Error polling tweets:', err);
        }
      };
      // Poll for tweets mentioning username
      const pollTimeout = setTimeout(() => {
        _poll();
      });
      const pollInterval = setInterval(async () => {
        _poll();
      }, 10000);

      // listen for abort signal
      const { signal } = this.abortController;
      signal.addEventListener('abort', () => {
        clearTimeout(pollTimeout);
        clearInterval(pollInterval);
      });
    };
    
    (async () => {
      await _bind();
    })().catch(err => {
      console.warn('twitter bot error', err);
    });
  }
  destroy() {
    this.abortController.abort();
    this.abortController = new AbortController();
  }
}
export class TwitterManager extends EventTarget {
  codecs: any;
  constructor({
    codecs,
  }) {
    super();

    this.codecs = codecs;
  }
  async addTwitterBot(args: TwitterArgs) {
    const twitterBot = new TwitterBot(args);
    return twitterBot;
  }
  removeTwitterBot(twitterBot: TwitterBot) {
    twitterBot.destroy();
  }
  live() {
    // nothing
  }
  destroy() {
    // nothing
  }
}