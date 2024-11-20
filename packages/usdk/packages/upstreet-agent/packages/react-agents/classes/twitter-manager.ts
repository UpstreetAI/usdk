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
    const _bind = async () => {
      const {
        token,
      } = args;
      const client = new TwitterClient(token, {
        endpoint: `https://ai.upstreet.ai/api/twitter`,
      });
      // console.log('twitter client 2', client);

      // abort controller
      this.abortController = new AbortController();

      const user = await client.users.findMyUser();

      const _poll = async () => {
        try {
          // This uses Twitter API v2 via twitter-api-sdk
          // Specifically the GET /2/users/:id/mentions endpoint
          const mentions = await client.tweets.usersIdMentions(user.data.id, {
            expansions: ["author_id"],
            "tweet.fields": ["created_at"]
          });
          
          if (mentions.data) {
            for (const tweet of mentions.data) {
              const { author_id, text } = tweet;
              // get the handle of the author
              const author = await client.users.findUserById(author_id);
              const authorUsername = author.data.username;

              console.log('got tweet', text, authorUsername);
            }
          }
        } catch (err) {
          console.error('Error polling tweets:', err);
        }
      };
      _poll();

      // Poll for tweets mentioning username
      const pollInterval = setInterval(async () => {
        _poll();
      }, 10000);

      // listen for abort signal
      const { signal } = this.abortController;
      signal.addEventListener('abort', () => {
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