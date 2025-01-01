export const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': '*',
  'Access-Control-Allow-Headers': '*',
};

export const defaultChatModels = [
  'openai:gpt-4o-2024-08-06',
  'anthropic:claude-3-5-sonnet-20240620',
  'openrouter:nousresearch/hermes-3-llama-3.1-405b',
  'openrouter:nousresearch/hermes-3-llama-3.1-70b',
  'openrouter:google/gemini-2.0-flash-exp:free',
];
export const defaultSmallChatModels = [
  'openai:gpt-4o-mini',
];
export const defaultLargeChatModels = [
  'openai:o1-preview',
];

export const defaultVisionModels = [
  'openai:gpt-4o-2024-08-06',
  'anthropic:claude-3-5-sonnet-20240620',
];

export const defaultVoiceModels = [
  'elevenlabs:eleven_turbo_v2_5',
  'elevenlabs:eleven_turbo_v2',
  'openai:tts-1',
  'openai:tts-1-hd',
];

export const defaultImageGenerationModels = [
  'black-forest-labs:flux1-dev',
  'openai:dall-e-3',
];

export const defaultVoiceCloningModels = [
  'elevenlabs:eleven_turbo_v2_5',
  'elevenlabs:eleven_turbo_v2',
];

export const defaultEmbeddingModel = 'openai:text-embedding-3-small';

export const defaultChatModel = defaultChatModels[0];
export const defaultSmallChatModel = defaultSmallChatModels[0];
export const defaultLargeChatModel = defaultLargeChatModels[0];
export const defaultVisionModel = defaultVisionModels[0];
export const defaultVoiceModel = defaultVoiceModels[0];
export const defaultImageGenerationModel = defaultImageGenerationModels[0];
export const defaultVoiceCloningModel = defaultVoiceCloningModels[0];

export const currencies = ['usd'];
export const intervals = ['month', 'year', 'week', 'day'];

export const consoleImageWidth = 80;
export const consoleImagePreviewWidth = 24*2;

export const SUPABASE_URL = "https://friddlbqibjnxjoxeocc.supabase.co";
export const SUPABASE_PUBLIC_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyaWRkbGJxaWJqbnhqb3hlb2NjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDM2NjE3NDIsImV4cCI6MjAxOTIzNzc0Mn0.jnvk5X27yFTcJ6jsCkuXOog1ZN825md4clvWuGQ8DMI";

