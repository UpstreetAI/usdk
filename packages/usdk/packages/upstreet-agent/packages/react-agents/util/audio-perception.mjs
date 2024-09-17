import {
  aiHost,
} from './endpoints.mjs';

const defaultTranscriptionModel = 'whisper-1';
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