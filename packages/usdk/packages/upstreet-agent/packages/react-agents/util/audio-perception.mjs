import * as alawmulaw from 'alawmulaw';
import {
  floatTo16Bit,
  int16ToFloat32,
} from '../lib/multiplayer/public/audio-worker/convert.mjs';
import { AudioEncodeStream } from '../lib/multiplayer/public/audio/audio-encode.mjs';
import { QueueManager } from './queue-manager.mjs';
import {
  aiHost,
} from './endpoints.mjs';

const { mulaw } = alawmulaw.default;

const defaultTranscriptionModel = 'whisper-1';
// const defaultRealtimeModel = 'gpt-4o-realtime-preview-2024-10-01';

const encodeMp3 = async (f32, {
  sampleRate,
  codecs,
}) => {
  if (!sampleRate) {
    throw new Error('no sample rate');
  }
  if (!codecs) {
    throw new Error('no codecs');
  }

  const encodeTransformStream = new AudioEncodeStream({
    type: 'audio/mpeg',
    sampleRate,
    codecs,
  });

  (async () => {
    const writer = encodeTransformStream.writable.getWriter();
    // console.log('write 1');
    await writer.write(f32);
    // console.log('write 2');
    await writer.close();
    // console.log('write 3');
  })();

  // read the encoded mp3 from the readable end of the web stream
  const reader = encodeTransformStream.readable.getReader();
  const chunks = [];
  for (;;) {
    // console.log('read 1');
    const { done, value } = await reader.read();
    // console.log('read 2', {
    //   done,
    //   value,
    // });
    if (done) {
      break;
    }
    chunks.push(value);
  }
  // console.log('read 3');

  // XXX terminate the encoder

  // console.log('got chunks', chunks);
  const b = Buffer.concat(chunks);
  return b;
};

export const transcribe = async (data, {
  jwt,
}) => {
  const fd = new FormData();
  fd.append('file', new Blob([data], {
    type: 'audio/mpeg',
  }));
  fd.append('model', defaultTranscriptionModel);
  fd.append('language', 'en');
  // fd.append('response_format', 'json');
  
  const res = await fetch(`${aiHost}/api/ai/audio/transcriptions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${jwt}`,
    },
    body: fd,
  });
  if (res.ok) {
    const j = await res.json();
    const { text } = j;
    return text;
  } else {
    const text = await res.text();
    throw new Error('request failed: ' + res.status + ': ' + text);
  }
};

export const transcribeRealtime = ({
  sampleRate,
  codecs,
  jwt,
}) => {
  if (!codecs) {
    throw new Error('no codecs');
  }
  if (!jwt) {
    throw new Error('no jwt');
  }

  let bsSampleIndex = 0;
  const bs = [];
  let speechStartSampleIndex = 0;
  const queueManager = new QueueManager();

  // const u = new URL(`${aiHost.replace(/^http/, 'ws')}/api/ai/realtime`);
  // u.searchParams.set('model', defaultRealtimeModel);
  const u = `https://vad.fly.dev/`;
  const ws = new WebSocket(u, {
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
  });
  ws.binaryType = 'arraybuffer';
  
  ws.addEventListener('open', () => {
    // console.log('transcribe ws open');
    transcription.dispatchEvent(new MessageEvent('open', {
      data: null,
    }));

    /* // configure the session
    const sessionConfig = {
      // "event_id": "event_123",
      "type": "session.update",
      "session": {
        // modalities: ['text', 'audio'],
        modalities: ['text'],
        // modalities: [],
        instructions: 'Repeat exactly what you hear.',
        // voice: 'alloy',
        input_audio_format: 'pcm16',
        // output_audio_format: 'pcm16',
        input_audio_transcription: {
          // enabled: true,
          model: 'whisper-1',
        },
        turn_detection: {
          type: 'server_vad',
          // threshold: 0.5,
          // prefix_padding_ms: 300,
          // silence_duration_ms: 200,
        },
        // tools: [],
        // tool_choice: 'auto',
        // temperature: 0.8,
        // max_response_output_tokens: 4096,
        max_response_output_tokens: 1,
      },
    };
    ws.send(JSON.stringify(sessionConfig)); */
  });
  ws.addEventListener('message', async (e) => {
    // console.log(e.data);
    const message = JSON.parse(e.data);
    const { type, sampleIndex } = message;
    switch (type) {
      case 'speechstart': {
        console.log('speech start');
        speechStartSampleIndex = sampleIndex;
        break;
      }
      case 'speechstop': {
        const speechEndSampleIndex = sampleIndex;
        const numSpeechSamples = speechEndSampleIndex - speechStartSampleIndex;
        const f32Result = (() => {
          const f32Result = new Float32Array(numSpeechSamples);
          // copy the samples from the bs
          let f32ResultIndex = 0;
          for (;;) {
            const b = bs.shift(); // b is a Float32Array
            if (b) {
              bsSampleIndex += b.length;
              // copy the samples from b into f32Result
              f32Result.set(b, f32ResultIndex);
              f32ResultIndex += b.length;
              if (f32ResultIndex >= numSpeechSamples) {
                break;
              }
            } else {
              break;
            }
          }
          return f32Result;
        })();
        console.log('speech stop', f32Result);

        // encode as mp3 so we can transcribe it
        const mp3Buffer = await encodeMp3(f32Result, {
          sampleRate,
          codecs,
        });

        await queueManager.waitForTurn(async () => {
          const text = await transcribe(mp3Buffer, {
            jwt,
          });
          console.log('transcribed', text);
        });

        break;
      }
      case 'trim': {
        // console.log('trim', sampleIndex);
        while (bsSampleIndex < sampleIndex) {
          const b = bs.shift();
          bsSampleIndex += b.length;
        }
        break;
      }
      /* case 'error': {
        break;
      }
      case 'session.created': {
        break;
      }
      case 'session.updated': {
        break;
      }
      case 'input_audio_buffer.committed': {
        break;
      }
      case 'input_audio_buffer.cleared': {
        break;
      }
      case 'input_audio_buffer.speech_started': {
        const timestamp = message.audio_start_ms;
        transcription.dispatchEvent(new MessageEvent('speechstart', {
          data: {
            timestamp,
          },
        }));
        break;
      }
      case 'input_audio_buffer.speech_stopped': {
        const timestamp = message.audio_end_ms;
        transcription.dispatchEvent(new MessageEvent('speechstop', {
          data: {
            timestamp,
          },
        }));
        transcription.clear();
        break;
      }
      case 'conversation.item.input_audio_transcription.completed': {
        const {
          transcript,
        } = message;
        if (transcript) {
          transcription.dispatchEvent(new MessageEvent('transcription', {
            data: {
              transcript,
            },
          }));
        }
        break;
      }
      case 'conversation.item.input_audio_transcription.failed': {
        console.log('transcription failed', message);
        break;
      }
      case 'response.audio_transcript.delta': {
        break;
      }
      case 'response.audio_transcript.done': {
        break;
      }
      // case 'response.text.delta': {
      //   break;
      // } */
    }
  });
  ws.addEventListener('close', (e) => {
    // console.log('transcribe ws close');
    transcription.dispatchEvent(new MessageEvent('close', {
      data: null,
    }));
  });

  const transcription = new EventTarget();
  transcription.write = async (f32) => { // Float32Array
    bs.push(f32);

    const i16 = floatTo16Bit(f32);
    const mulawBuffer = mulaw.encode(i16);
    ws.send(mulawBuffer);

    // const base64 = Buffer.from(data).toString('base64');
    // const m = {
    //   type: 'input_audio_buffer.append',
    //   audio: base64,
    // };
    // ws.send(JSON.stringify(m));
  };
  // transcription.commit = async () => {
  //   const m = {
  //     type: 'input_audio_buffer.commit',
  //   };
  //   ws.send(JSON.stringify(m));
  // };
  // transcription.clear = async () => {
  //   const m = {
  //     type: 'input_audio_buffer.clear',
  //   };
  //   ws.send(JSON.stringify(m));
  // };
  transcription.close = () => {
    ws.close();
  };
  return transcription;
};