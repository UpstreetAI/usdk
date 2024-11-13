export interface AiMessage {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
}

export interface CompletionGeneratorOptions {
  prompt?: string | AiMessage;
  model?: string;
  limit?: number;
  signal?: AbortSignal;
}

export interface BindLoreParams {
  name?: string;
  args?: string[];
  required?: {
    name?: boolean;
    args?: string[];
  };
}
