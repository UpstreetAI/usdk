import {
  aiHost,
} from './endpoints.mjs';

const defaultTranscriptionModel = 'whisper-1';
const defaultRealtimeModel = 'gpt-4o-realtime-preview-2024-10-01';

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
  jwt,
}) => {
  if (!jwt) {
    throw new Error('no jwt');
  }

  const u = new URL(`${aiHost.replace(/^http/, 'ws')}/api/ai/realtime`);
  u.searchParams.set('model', defaultRealtimeModel);
  const ws = new WebSocket(u, {
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
  });
  
  ws.addEventListener('open', () => {
    console.log('transcribe ws open');
    transcription.dispatchEvent(new MessageEvent('open', {
      data: null,
    }));

    // configure the session
    const sessionConfig = {
      // "event_id": "event_123",
      "type": "session.update",
      "session": {
        // "modalities": ["text", "audio"],
        "modalities": ["text"],
        "instructions": "Do not say anything.",
        // "voice": "alloy",
        "input_audio_format": "pcm16",
        // "output_audio_format": "pcm16",
        "input_audio_transcription": {
          "enabled": true,
          "model": "whisper-1"
        },
        "turn_detection": {
          "type": "server_vad",
          "threshold": 0.5,
          "prefix_padding_ms": 300,
          "silence_duration_ms": 200
        },
        // "tools": [
        //     {
        //         "type": "function",
        //         "name": "get_weather",
        //         "description": "Get the current weather for a location.",
        //         "parameters": {
        //             "type": "object",
        //             "properties": {
        //                 "location": { "type": "string" }
        //             },
        //             "required": ["location"]
        //         }
        //     }
        // ],
        // "tool_choice": "auto",
        // "temperature": 0.8,
        "max_output_tokens": 0,
      },
    };
    ws.send(JSON.stringify(sessionConfig));
  });
  ws.addEventListener('message', (e) => {
    console.log('transcribe ws message', e.data);
    // transcription.dispatchEvent(new MessageEvent('message', {
    //   data: e.data,
    // }));
    const message = JSON.parse(e.data);
    const { type } = message;
    switch (type) {
      case 'error': {
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
        break;
      }
      case 'input_audio_buffer.speech_stopped': {
        break;
      }
      case 'conversation.item.input_audio_transcription.completed': {
        break;
      }
      case 'conversation.item.input_audio_transcription.failed': {
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
      // }
    }
  });
  ws.addEventListener('close', (e) => {
    console.log('transcribe ws close');
    transcription.dispatchEvent(new MessageEvent('close', {
      data: null,
    }));
  });

  const transcription = new EventTarget();
  transcription.write = async (data) => { // Uint8Array
    const base64 = Buffer.from(data).toString('base64');
    const m = {
      type: 'input_audio_buffer.append',
      audio: base64,
    };
    ws.send(JSON.stringify(m));
  };
  transcription.commit = async () => {
    const m = {
      type: 'input_audio_buffer.commit',
    };
    ws.send(JSON.stringify(m));
  };
  transcription.close = () => {
    ws.close();
  };
  return transcription;
};