// Create your bot here: https://discord.com/developers/applications
// NOTE: You will need to enable Privileged Gateway Intents in your bot's settings!
// Add the bot to your server:
// https://discord.com/oauth2/authorize/?permissions=-2080908480&scope=bot&client_id=1143818703813759058

import stream from 'stream';

// import { Client, Partials, Collection, GatewayIntentBits, TextChannel, VoiceChannel, Events, CommandInteraction, GuildMember } from 'discord.js';
// import {
// 	NoSubscriberBehavior,
// 	StreamType,
// 	createAudioPlayer,
// 	createAudioResource,
// 	entersState,
// 	AudioPlayerStatus,
//   VoiceConnection,
// 	VoiceConnectionStatus,
// 	joinVoiceChannel,
//   EndBehaviorType,
//   VoiceReceiver,
// } from '@discordjs/voice';
import {
  zbencode,
  zbdecode,
} from './encoding.mjs';

//

const headers = [
  {
    "key": "Access-Control-Allow-Origin",
    "value": "*"
  },
  {
    "key": "Access-Control-Allow-Methods",
    "value": "*"
  },
  {
    "key": "Access-Control-Allow-Headers",
    "value": "*"
  },
  {
    "key": "Access-Control-Expose-Headers",
    "value": "*"
  },
  {
    "key": "Access-Control-Allow-Private-Network",
    "value": "true"
  }
];
const headersObject = {};
for (const header of headers) {
  headersObject[header.key] = header.value;
}

//

function makeId(length) {
  let result = '';
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

//

const makeAudioPlayer = () => {
  const audioPlayer = createAudioPlayer({
    behaviors: {
      noSubscriber: NoSubscriberBehavior.Play,
      maxMissedFrames: 10,
    },
  });

  const inputStream = new stream.PassThrough();
  const audioResource = createAudioResource(inputStream);
  audioPlayer.play(audioResource);
  audioPlayer.inputStream = inputStream;

  return audioPlayer;
};

//

export class DiscordClient extends EventTarget {
  channelWhitelist: string[] = [];
  userWhitelist: string[] = [];
  constructor({
    token,
    channelWhitelist,
    userWhitelist,
  }: {
    token: string,
    channelWhitelist: string[],
    userWhitelist: string[],
  }) {
    super();

    this.channelWhitelist = channelWhitelist;
    this.userWhitelist = userWhitelist;

    const createListeningStream = (receiver, userId, user) => {
      const streamId = makeId(8);
      
      const opusStream = receiver.subscribe(userId, {
        end: {
          behavior: EndBehaviorType.AfterSilence,
          duration: 1000,
        },
      });
      
      const {username} = user;
      this.dispatchEvent(new MessageEvent('voicestart', {
        data: {
          userId,
          username,
          streamId,
        },
      }));
      opusStream.on('data', (data) => {
        const uint8Array = Uint8Array.from(data);
        this.dispatchEvent(new MessageEvent('voicedata', {
          data: {
            userId,
            streamId,
            uint8Array,
          },
        }));
      });
      opusStream.on('end', () => {
        this.dispatchEvent(new MessageEvent('voiceend', {
          data: {
            userId,
            streamId,
          },
        }));
      });
    };
    const connectToVoiceChannel = async (channel) => {
      const connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        
        // selfDeaf: false,
        // selfMute: true,
  
        adapterCreator: channel.guild.voiceAdapterCreator,
      });
      try {
        await entersState(connection, VoiceConnectionStatus.Ready, 20e3);
        return connection;
      } catch (error) {
        connection.destroy();
        throw error;
      }
    };
  
    // Creating a new client:
    const client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.MessageContent,
      ],
      partials: [
        Partials.Channel,
        Partials.Message,
        Partials.User,
        Partials.GuildMember,
        Partials.Reaction
      ],
      presence: {
        activities: [{
          name: "Death to wizards",
          type: 0
        }],
        status: 'online'
      }
    });

    client.on('messageCreate', async (message) => {
      const {
        guild,
        channel,
        member,
        content,
        attachments,
      } = message;

      const guildName = guild?.name ?? '';
      const channelName = channel?.name ?? '';
      const username = member?.user?.username ?? '';
      const discriminator = member?.user?.discriminator ?? '';

      const fullChannelName = `${guildName}:${channelName}`;
      const fullUserName = `${username}#${discriminator}`;

      const textChannel = textChannels.find(c => c.id === channel.id);
      if (textChannel) {
        if (this.#hasUser(username) || this.#hasUser(fullUserName)) {
          const userId = member?.user?.id;
          const username = member?.user?.username;
          const text = content;
          this.dispatchEvent(new MessageEvent('text', {
            data: {
              userId,
              username,
              text,
            },
          }));
          console.log('message ok', {user: member?.user, username, text, userWhitelist: this.userWhitelist});
        } else {
          console.log('message ignored', {user: member?.user, username, userWhitelist: this.userWhitelist});
        }
      }
    });

    const {
      promise: loadPromise,
      resolve: loadPromiseResolve,
      reject: loadPromiseReject,
    } = Promise.withResolvers();
    (loadPromise as any).resolve = loadPromiseResolve;
    (loadPromise as any).reject = loadPromiseReject;

    let textConnected = false;
    let voiceConnected = false;
    const textChannels: TextChannel[] = [];
    const voiceConnections = [];
    client.on('ready', async e => {
      const promises = [];

      // list channels the bot can access
      client.guilds.cache.each(async guild => {
        // Iterate through all channels in the guild
        guild.channels.cache.each(channel => {
          if (channel instanceof TextChannel) {
            const n = `${guild.name}:${channel.name}`;
            console.log(`text channel: ${n}`);

            if (!textConnected && channelWhitelist.includes(n)) {
              textConnected = true;

              textChannels.push(channel);

              console.log('push text channel', n);
            }
          } else if (channel instanceof VoiceChannel) {
            // XXX create the connection to the first matching voice channel here
            // const connection = await connectToChannel(channel);
            // connection.subscribe(player);
            const n = `${guild.name}:${channel.name}`;
            console.log(`voice channel: ${n}`);

            if (!voiceConnected && channelWhitelist.includes(n)) {
              voiceConnected = true;

              const p = (async () => {
                const connection = await connectToVoiceChannel(channel);

                // read
                {
                  const receiver = connection.receiver;
                  // console.log('listen for speaking start');
                  receiver.speaking.on('start', (userId) => {
                    const user = client.users.cache.get(userId);
                    const fullUserName = `${user.username}#${user.discriminator}`;
                    console.log('user speak', fullUserName, userId);
                    if (this.#hasUser(user.username) || this.#hasUser(fullUserName)) {
                      console.log('user speak allow', fullUserName, userId);
                      createListeningStream(receiver, userId, user);
                    }
                  });
                  // console.log('got users', receiver.speaking.users);
                }

                console.log('push voice connection', n);
                voiceConnections.push(connection);
              })();
              promises.push(p);
            }
          }
        });
        // console.log('list channels 2');
      });
      await Promise.all(promises);
      loadPromise.resolve();
    });
  
    client.login(token)
      .then(() => {
        console.log('login ok');
      })
      .catch((err) => {
        console.error("[CRASH] Something went wrong while connecting to your bot...");
        console.error("[CRASH] Error from Discord API:" + err);
        return process.exit();
      });
    
    this.client = client;
    this.textChannels = textChannels;
    this.voiceConnections = voiceConnections;
    this.waitForLoad = () => loadPromise;
  }

  #hasUser(username) {
    return this.userWhitelist.length === 0 || this.userWhitelist.includes(username);
  }

  setUsername(name) {
    // XXX
  }
  setAvatar(avatar) {
    // XXX
  }

  writeText(text) {
    for (const channel of this.textChannels) {
      channel.send(text);
    }
  }

  playAudioPlayer(audioPlayer) {
    for (const connection of this.voiceConnections) {
      connection.subscribe(audioPlayer);
    }
  }

  destroy() {
    this.client.destroy();
  }
}

//

/* const startDiscordServer = () => {
  const server = createServer();
  const wss = new WebSocketServer({
    // server,
    noServer: true,
  });
  // wss.binaryType = 'arraybuffer';
  wss.on('connection', function connection(ws) {
    (async () => {
      // request url
      const u = ws.upgradeReq.url;
      const q = url.parse(u, true).query;
      const {
        token = '',
        channelWhitelist: channelWhitelistString = '',
        userWhitelist: userWhitelistString = '',
      } = q;
      if (!token) {
        console.warn('missing token');
        ws.close();
        return;
      }

      ws.on('error', console.error);

      const channelWhitelist = channelWhitelistString.split(',');
      const userWhitelist = userWhitelistString.split(',');

      const discordClient = new DiscordClient({
        token,
        channelWhitelist,
        userWhitelist,
      });
      await discordClient.waitForLoad();

      for (const method of [
        'voicestart',
        'voiceend',
      ]) {
        discordClient.addEventListener(method, (e) => {
          const {
            userId,
            username,
            streamId,
          } = e.data;
          const m = {
            method,
            args: {
              userId,
              username,
              streamId,
            },
          };
          ws.send(JSON.stringify(m));
        });
      }
      discordClient.addEventListener('voicedata', (e) => {
        const {
          userId,
          streamId,
          uint8Array,
        } = e.data;
        const data = zbencode({
          method: 'voicedata',
          args: {
            userId,
            streamId,
            uint8Array,
          },
        });
        ws.send(data);
      });
      discordClient.addEventListener('text', (e) => {
        const {
          userId,
          username,
          text,
        } = e.data;

        const m = {
          method: 'text',
          args: {
            userId,
            username,
            text,
          },
        };
        ws.send(JSON.stringify(m));
      });

      ws.on('close', function close() {
        discordClient.destroy();
      });

      const audioPlayers = new Map();
      ws.on('message', (data, isBinary) => {
        // if binary
        if (isBinary) {
          // assume voice data
          const o = zbdecode(data);
          const {
            method,
            args,
          } = o;
          switch (method) {
            case 'setAvatar': {
              const {
                uint8Array,
              } = args;
              discordClient.setAvatar(uint8Array);
              break;
            }
            case 'playVoiceData': {
              const {
                streamId,
                uint8Array,
              } = args;
              const audioPlayer = audioPlayers.get(streamId);
              if (audioPlayer) {
                audioPlayer.inputStream.write(uint8Array);
              } else {
                console.warn('no audio player for stream', streamId);
              }
              break;
            }
          }
        } else {
          // assume json data
          const s = data.toString('utf8');
          const j = JSON.parse(s);
          const {
            method,
            args,
          } = j;
          switch (method) {
            case 'setUsername': {
              const {
                name,
              } = args;
              discordClient.setUsername(name);
              break;
            }
            case 'writeText': {
              const {
                text,
              } = args;
              discordClient.writeText(text);
              break;
            }
            case 'playVoiceStart': {
              const {
                streamId,
              } = args;
              console.log('play voice start', {streamId});
              let audioPlayer = audioPlayers.get(streamId);
              if (audioPlayer) {
                console.warn('already have audio player for stream', streamId);
              } else {
                audioPlayer = makeAudioPlayer();
                discordClient.playAudioPlayer(audioPlayer);

                audioPlayers.set(streamId, audioPlayer);

                audioPlayer.addListener('stateChange', (oldOne, newOne) => {
                  console.log('audio player state change', newOne.status);
                  if (newOne.status == 'idle') {
                    ws.send(JSON.stringify({
                      method: 'voiceidle',
                      args: {
                        streamId,
                      },
                    }));
                  }
                });
              }
              break;
            }
            case 'playVoiceEnd': {
              const {
                streamId,
              } = args;
              console.log('play voice end', {streamId});
              const audioPlayer = audioPlayers.get(streamId);
              if (audioPlayer) {
                audioPlayer.inputStream.end();
                audioPlayers.delete(streamId);
              } else {
                console.warn('no audio player for stream', streamId);
              }
              break;
            }
            case 'playVoiceAbort': {
              const {
                streamId,
              } = args;
              const audioPlayer = audioPlayers.get(streamId);
              console.log('abort audio player', streamId, !!audioPlayer);
              if (audioPlayer) {
                audioPlayer.stop(true);
                // audioPlayers.delete(streamId);
              } else {
                console.warn('no audio player for stream', streamId);
              }
              break;
            }
            default: {
              console.warn('unknown json message', j);
              break;
            }
          }
        }
      });

      ws.send(JSON.stringify({
        method: 'ready',
        args: {},
      }));
    })();
  });

  server.on('upgrade', function upgrade(request, socket, head) {
    console.log('handle upgrade 1', request.url);
    wss.handleUpgrade(request, socket, head, function done(ws) {
      console.log('handle upgrade 2', request.url);
      ws.upgradeReq = request;
      // ws.binaryType = 'arraybuffer';
      wss.emit('connection', ws, request);
    });
  });

  const port = parseInt(process.env.PORT, 10) || 9898;
  const host = '0.0.0.0';
  server.listen(port, host);
  server.on('listening', () => {
    console.log(`Running: listening on ${host}:${port}`);
  });
  server.on('error', (err) => {
    console.error('server error', err);
    throw err;
  });
};
startDiscordServer(); */