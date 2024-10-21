import {
  WHIPClient,
} from '@eyevinn/whip-web-client';
// import tmi from 'tmi.js';
import {
  // discordBotEndpoint,
  twitchWhipEndpoint,
  twitchBotEndpoint,
} from '../endpoints.js';
import {
  // makePromise,
  // makeId,
  getCorsFullProxyUrl, makePromise,
} from '../util.js';

//


// Get a stream key at https://dashboard.twitch.tv/u/username/settings/stream
export class TwitchVideoClient extends EventTarget {
  constructor() {
    super();

    // this.pc = null;

    this.abortController = new AbortController();
  }
  async connect({
    streamKey,
    mediaStreams,
  }) {
    const twitchEndpointUrl = getCorsFullProxyUrl(twitchWhipEndpoint);
    const client = new WHIPClient({
      endpoint: twitchEndpointUrl,
      opts: {
        debug: true,
        // iceServers: [{ urls: "stun:stun.l.google.com:19320" }],
        authkey: streamKey,
      },
      peerConnectionFactory: (configuration) => {
        // globalThis.configuration = configuration;
        const pc = new RTCPeerConnection(configuration);
        // globalThis.pc = pc;
        // globalThis.transceivers = pc.getTransceivers();
        pc.addTrack = (addTrack => function(track) {
          const rtcRtpSender = addTrack.apply(this, arguments);

          /* const transceivers = pc.getTransceivers();
          const lastTransceiver = transceivers[transceivers.length - 1];
          console.log('get new transceivers', [rtcRtpSender, pc.getTransceivers(), lastTransceiver]);
          // force H264 and Opus
          const settings = track.getSettings();

          console.log(track.kind + ' settings 1', {
            settings,
            sender: lastTransceiver.sender,
            receiver: lastTransceiver.receiver,
          });

          const availSendAudioCodecs = RTCRtpSender.getCapabilities("audio").codecs;
          const availReceiveAudioCodecs = RTCRtpReceiver.getCapabilities("audio").codecs;
          const availSendVideoCodecs = RTCRtpSender.getCapabilities("video").codecs;
          const availReceiveVideoCodecs = RTCRtpReceiver.getCapabilities("video").codecs;
          
          // match against clockRate, mimeType, channels, sdpFmtpLine
          const availSendReceiveAudioCodecs = availSendAudioCodecs.filter(codec => {
            return availReceiveAudioCodecs.some(codec2 => {
              return codec.clockRate === codec2.clockRate &&
                codec.mimeType === codec2.mimeType &&
                codec.channels === codec2.channels &&
                codec.sdpFmtpLine === codec2.sdpFmtpLine;
            });
          });
          const availSendReceiveVideoCodecs = availSendVideoCodecs.filter(codec => {
            return availReceiveVideoCodecs.some(codec2 => {
              return codec.clockRate === codec2.clockRate &&
                codec.mimeType === codec2.mimeType &&
                codec.sdpFmtpLine === codec2.sdpFmtpLine;
            });
          });

          // find the first Opus
          const audioCodec = availSendReceiveAudioCodecs.find(codec => codec.mimeType === 'audio/opus');
          // find the first H264
          const videoCodec = availSendReceiveVideoCodecs.find(codec => codec.mimeType === 'video/H264');
          
          // console.log(track.kind + ' settings 2', {
          //   settings,
          //   sender: lastTransceiver.sender,
          //   receiver: lastTransceiver.receiver,
          //   availSendAudioCodecs,
          //   availReceiveAudioCodecs,
          //   availSendVideoCodecs,
          //   availReceiveVideoCodecs,
          //   availSendReceiveAudioCodecs,
          //   availSendReceiveVideoCodecs,
          //   audioCodec,
          //   videoCodec,
          // });

          // if it's an audio track
          if (track.kind === 'audio') {
            // force Opus
            // lastTransceiver.setCodecPreferences([
            //   audioCodec,
            // ]);
          }
          // else if it's a video track
          else if (track.kind === 'video') {
            // force H264
            // lastTransceiver.setCodecPreferences([
            //   videoCodec,
            // ]);
          } else {
            throw new Error(`invalid track kind: ${track.kind}`);
          } */
          return rtcRtpSender;
        })(pc.addTrack);
        // pc.createOffer = (createOffer => async function(options) {
        //   console.log('create offer 1', {
        //     options,
        //   });
        //   const offer = await createOffer.apply(this, arguments);
        //   console.log('create offer 2', {
        //     options,
        //     offer,
        //   });
        //   return offer;
        // })(pc.createOffer);
        // if (!this.abortController.signal.aborted) {
        //   this.pc = pc;
          return pc;
        // } else {
          
        //   return null;
        // }
      },
    });
    this.abortController.signal.addEventListener('abort', () => {
      client.destroy();
    });

    await client.setIceServersFromEndpoint();
    if (this.abortController.signal.aborted) return;
    
    for (const mediaStream of mediaStreams) {
      await client.ingest(mediaStream);
      if (this.abortController.signal.aborted) return;
    }
  }
  close() {
    this.abortController.abort();
  }
}

// Get a token at https://twitchapps.com/tmi/
export class TwitchChatClient extends EventTarget {
  constructor() {
    super();

    this.ws = null;
  }
  async connect({
    username,
    password,
    channels,
  }) {
    const u = new URL(twitchBotEndpoint);
    u.searchParams.set('username', username);
    u.searchParams.set('password', password);
    u.searchParams.set('channels', channels.join(','));
    const ws = new WebSocket(u);
    const openPromise = makePromise();
    const readyPromise = makePromise();
    ws.addEventListener('open', () => {
      openPromise.resolve();
    });
    ws.addEventListener('error', err => {
      openPromise.reject(err);
    });
    ws.addEventListener('message', e => {
      // check if it is a binary message
      const {
        data,
      } = e;
      const isBinary = data instanceof ArrayBuffer;
      if (isBinary) {
        console.warn('ignoring binary message', data);
      } else {
        // assume json message
        const text = data;
        const j = JSON.parse(text);
        console.log('got json', {j});
        const {
          method,
        } = j;
        switch (method) {
          case 'ready': {
            readyPromise.resolve();
            break;
          }
          case 'message': {
            const {
              channel,
              tags,
              message,
            } = j;
            console.log('got message', {
              channel,
              tags,
              message,
            });
            this.dispatchEvent(new MessageEvent('message', {
              data: {
                channel,
                tags,
                message,
              },
            }));
            break;
          }
          default: {
            console.warn('unknown twitch bot json method', {method});
            break;
          }
        }
      }
    });
    this.ws = ws;

    await openPromise;
    await readyPromise;
  }
  close() {
    this.ws.disconnect();
  }
}