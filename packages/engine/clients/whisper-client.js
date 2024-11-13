// import { makeTimeoutPromise } from "./MakeTimeoutPromise";

import {
  aiProxyHost,
} from '../endpoints.js';
import { getCleanJwt } from '../utils/jwt-util.js';

export async function whisperTranscribe(blob, prompt, language = 'en', temperature = 0, format = 'text') {
    const maxRetries = 5;
    for (let i = 0; i < maxRetries; i++) {
      // fetch write stream to the transcription api server
      // if (prompt === undefined) {
      //   prompt = 'He tried SO HARD to be the best version of himself! But, he also faced many challenges...';
      // }
      const model = 'whisper-1';
      const responseFormat = 'verbose_json';
      // const temperature = 0;
      // const language = 'en';
      // const options = undefined;
  
      const fd = new FormData();
      // match the extension from the mime type e.g. "audio/webm;codecs=opus"
      const ext = blob.type.match(/\/([^\/\;]+)/)[1] || 'webm';
      const fileName = `speech.${ext}`;
      fd.append('file', blob, fileName);
      fd.append('model', model);
      prompt && fd.append('prompt', prompt);
      // fd.append('prompt', 'This');
      fd.append('response_format', responseFormat);
      fd.append('temperature', temperature);
      fd.append('language', language);
  
      try {
        // const timeoutTime = 5000;
        // const timeoutPromise = makeTimeoutPromise(timeoutTime);
        // const j = await Promise.race([
          // (async () => {
          //   try {
          //     await timeoutPromise;
          //   } catch (err) {
          //     console.warn('transcription timeout', timeoutTime, err);
          //     throw err;
          //   }
          // })(),
        const j = await (async () => {
          const jwt = getCleanJwt();
            const res = await fetch(`https://${aiProxyHost}/api/ai/audio/transcriptions`, {
              method: 'POST',
              body: fd,
              headers: {
                Authorization: `Bearer ${jwt}`,
              },
            });
            if (res.ok) {
              const j = await res.json();
              return j;
            } else {
              throw new Error('bad status code: ' + res.status);
            }
          })()
        // ]);
        if (format === 'json') {
          return j;
        } else {
          let fullText = '';
          const {
            segments,
          } = j;
          for (const segment of segments) {
            const {
              text,
              // no_speech_prob,
            } = segment;
            // if (no_speech_prob < 0.7) {
              fullText += text;
            // }
          }
          return fullText.trim();
        }
      } catch(err) {
        console.warn(err);
      }
    }
    throw new Error('transcription failed');
  }