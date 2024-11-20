import {
  // DiscordRoomSpec,
  // DiscordArgs,
  // ConversationEventData,
  // ActiveAgentObject,
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
  constructor(args: TwitterArgs) {
    this.abortController = new AbortController();

    const _bind = async () => {
      const {
        token,
      } = args;
      // console.log('twitter client', token);
      const client = new TwitterClient(token, {
        endpoint: `https://ai.upstreet.ai/api/twitter`,
      });
      // console.log('twitter client 2', client);

      // Uses Twitter API v2 GET /2/users/me endpoint
      const user = await client.users.findMyUser();

      const _poll = async () => {
        try {
          // GET /2/users/:id/mentions endpoint
          const mentions = await client.tweets.usersIdMentions(user.data.id, {
            expansions: ["author_id"],
            "tweet.fields": ["created_at"]
          });
          
          if (mentions.data) {
            for (const tweet of mentions.data) {
              const { author_id, text } = tweet;

              // get the handle of the author
              // GET /2/users/:id endpoint
              const author = await client.users.findUserById(author_id);
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