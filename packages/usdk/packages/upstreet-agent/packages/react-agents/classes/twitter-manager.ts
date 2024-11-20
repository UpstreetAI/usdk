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
import {
  ConversationObject,
} from './conversation-object';
// import { Player } from 'react-agents-client/util/player.mjs';
import { formatConversationMessage } from '../util/message-utils';
import {
  bindConversationToAgent,
} from '../runtime';
// import {
//   QueueManager,
// } from 'queue-manager';
// import uuidByString from 'uuid-by-string';

import { Client as TwitterClient } from 'twitter-api-sdk';

//

class TwitterBot {
  refreshToken: string;
  clientId: string;
  abortController: AbortController;
  agent: ActiveAgentObject;
  codecs: any;
  jwt: string;
  client: any;
  conversations: Map<string, ConversationObject>; // tweetId -> conversation

  constructor(args: TwitterArgs) {
    const {
      token,
      agent,
      codecs,
      jwt,
    } = args;

    if (!token) {
      throw new Error('Twitter bot requires a token');
    }
    const [accessToken, refreshToken, clientId] = token.split(':');
    if (!accessToken) {
      throw new Error('Twitter bot requires an access token');
    }
    if (!refreshToken) {
      throw new Error('Twitter bot requires a refresh token');
    }
    if (!clientId) {
      throw new Error('Twitter bot requires a client ID');
    }
    if (!agent) {
      throw new Error('Twitter bot requires an agent');
    }
    if (!codecs) {
      throw new Error('Twitter bot requires codecs');
    }
    if (!jwt) {
      throw new Error('Twitter bot requires a jwt');
    }

    this.refreshToken = refreshToken;
    this.clientId = clientId;
    this.agent = agent;
    this.codecs = codecs;
    this.jwt = jwt;
    this.client = null;
    this.conversations = new Map();

    this.abortController = new AbortController();

    const _bind = async () => {
      const _ensureClient = async () => {
        // clear old client if neccessary
        if (this.client) {
          // check if the client is still ok
          let ok = true;
          try {
            const user = await _fetchLocalUser();
            if (!user) {
              ok = false;
            }
          } catch (err) {
            console.warn('client no authorized, attempting refresh:', err);
            ok = false;
          }
          if (!ok) {
            this.client = null;
          }
        }
        // refresh client if necessary
        if (!this.client) {
          await _refreshClient();
        }
      };
      const _fetchAccessToken = async () => {
        // get the access token from the twitter oauth api

        // Step 5: POST oauth2/token - refresh token
        // A refresh token allows an application to obtain a new access token without prompting the user. You can create a refresh token by making a POST request to the following endpoint: https://api.x.com/2/oauth2/token You will need to add in the Content-Type of application/x-www-form-urlencoded via a header. In addition, you will also need to pass in your refresh_token, set your grant_type to be a refresh_token, and define your client_id.

        // This request will work for public clients:

        // POST 'https://api.x.com/2/oauth2/token' \
        // -> POST 'https://ai.upstreet.ai/api/twitter/2/oauth2/token' \
        // --header 'Content-Type: application/x-www-form-urlencoded' \
        // --data-urlencode 'refresh_token=bWRWa3gzdnk3WHRGU1o0bmRRcTJ5VUxWX1lZTDdJSUtmaWcxbTVxdEFXcW5tOjE2MjIxNDc3NDM5MTQ6MToxOnJ0OjE' \
        // --data-urlencode 'grant_type=refresh_token' \
        // --data-urlencode 'client_id=rG9n6402A3dbUJKzXTNX4oWHJ'

        const fd = new URLSearchParams();
        fd.append('refresh_token', this.refreshToken);
        fd.append('grant_type', 'refresh_token');
        fd.append('client_id', this.clientId);

        const res = await fetch('https://ai.upstreet.ai/api/twitter/2/oauth2/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: fd,
        });

        if (!res.ok) {
          throw new Error(`Failed to refresh token: ${res.status}`);
        }

        const json = await res.json();
        return json.access_token;
      };
      const _refreshClient = async () => {
        const accessToken = await _fetchAccessToken();
        this.client = new TwitterClient(accessToken, {
          endpoint: `https://ai.upstreet.ai/api/twitter`,
        });
      };

      // GET /2/users/me - Get authenticated user
      const _fetchLocalUser = async () => {
        return await this.client.users.findMyUser();
      };
      // GET /2/users/:id/mentions - Get tweets mentioning user 
      const _fetchMentions = async (userId: string) => {
        return await this.client.tweets.usersIdMentions(userId, {
          expansions: ["author_id"],
          "tweet.fields": ["created_at", "conversation_id"]
        });
      };
      // GET /2/users/:id - Get user by ID
      const _fetchUserById = async (userId: string) => {
        return await this.client.users.findUserById(userId);
      };

      const seenTweetIds = new Set();
      const _handleTweet = async (tweet: any, author: any) => {
        const { id: tweetId, text, conversation_id } = tweet;
        const { username: authorUsername, id: authorId } = author.data;

        // Skip if we've already handled this tweet
        if (!seenTweetIds.has(tweetId)) {
          seenTweetIds.add(tweetId);

          // Create or get conversation
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

            // Handle outgoing messages
            conversation.addEventListener('remotemessage', async (e: any) => {
              const { message } = e.data;
              const { method, args } = message;
              if (method === 'say') {
                const { text } = args;
                // Reply to tweet
                await client.tweets.createTweet({
                  text,
                  // XXX make this in reply to the previous tweet in the conversation
                  // reply: {
                  //   in_reply_to_tweet_id: tweetId,
                  // }
                });
              }
            });
          }

          // Add message to conversation
          const rawMessage = {
            method: 'say',
            args: {
              text
            }
          };
          const agent = {
            id: authorId,
            name: authorUsername
          };
          const newMessage = formatConversationMessage(rawMessage, {
            agent
          });
          await conversation.addLocalMessage(newMessage);
        }
      };

      const _poll = async () => {
        try {
          await _ensureClient();
          const user = await _fetchLocalUser();
          const mentions = await _fetchMentions(user.data.id);
          
          if (mentions.data) {
            for (const tweet of mentions.data) {
              // tweet:
              // - id: string (Tweet ID)
              // - text: string (Tweet content)
              // - author_id: string (User ID who wrote the tweet)
              // - created_at: string (Tweet creation timestamp)
              // - edit_history_tweet_ids: string[] (IDs of previous versions if edited)
              // - in_reply_to_user_id: string | null (User ID tweet is replying to)
              // - referenced_tweets: Array (Contains info about tweets this tweet references)
              // - conversation_id: string (Thread ID this tweet belongs to)
              // - lang: string (Language code of tweet content)
              // - possibly_sensitive: boolean (If tweet may contain sensitive content)
              // - reply_settings: string (Who can reply to this tweet)
              // - source: string (Client used to post tweet)
              const { author_id } = tweet;
              const author = await _fetchUserById(author_id);
              await _handleTweet(tweet, author);
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