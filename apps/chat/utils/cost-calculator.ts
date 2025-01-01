import { 
    defaultChatModel, 
    defaultImageGenerationModel, 
    defaultVisionModel, 
    defaultImageGenerationModels, 
    defaultVisionModels, 
    defaultVoiceModel,
    defaultVoiceModels
} from 'react-agents/constants.mjs';
import { aiProxyHost } from './const/endpoints';
import { FeaturesObject, ModelType } from '@/lib/types';



export async function getModelsCosts(
  jwt: string,
  modelConfig: Partial<Record<ModelType, string>>
): Promise<Partial<Record<ModelType, any>>> {
  // Extract model names from the provided model strings
  const modelNames: Partial<Record<ModelType, string>> = {};
  for (const [key, value] of Object.entries(modelConfig)) {
    if (value) {
      modelNames[key as ModelType] = value.split(':')[1];
    }
  }

  const url = new URL(`/api/getModelsCostings`, `https://${aiProxyHost}`);
  url.searchParams.set('models', Object.values(modelNames).join(','));

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${jwt}`,
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch model costs: ${response.status}`);
  }

  const { costs } = await response.json();

  // Map costs to feature types, only including provided models
  const modelCosts: Partial<Record<ModelType, any>> = {};
  for (const [key, modelName] of Object.entries(modelNames)) {
    modelCosts[key as ModelType] = costs[modelName];
  }

  return modelCosts;
}

export async function getModelCost(model: string, jwt: string): Promise<any> {
  const url = new URL(`/api/getModelCosting`, `http://${aiProxyHost}`);
  url.searchParams.set('model', model);

  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${jwt}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch model cost: ${res.status} ${await res.text()}`);
  }

  return res.json();
}

export function calculateFeatureCosts(
    features: FeaturesObject,
    costs: any,
    chatInputTokens?: number,
  ) {
  const { chat: chatCost, vision: visionCost, voice: voiceCost, imageGeneration: imageGenerationCost } = costs;
  
  const breakdown: Record<string, any> = {};
  
  // Calculate chat costs
  const inputChatTokens = chatInputTokens || 4000;
  const averageChatOutputTokens = 30;
  const chatInputCost = chatCost.inputCost * inputChatTokens;
  const chatOutputCost = chatCost.outputCost * averageChatOutputTokens;
  const totalEstimatedChatCost = chatInputCost + chatOutputCost;
  breakdown.chat = {
    inputCost: chatInputCost,
    outputCost: chatOutputCost,
    total: totalEstimatedChatCost
  };
  
  // XXX each feature/client has its own cost per interaction, perhaps we can take the base requirements to feautre specs


  // Calculate image generation costs if personality is enabled
  if (features.personality) {
    const defaultImageGenerationCost = typeof imageGenerationCost.inputCost === 'number' 
      ? imageGenerationCost.inputCost 
      : imageGenerationCost.inputCost.default.default;
    const totalImageGenerationCost = defaultImageGenerationCost * 2;
    breakdown.imageGeneration = {
      cost: defaultImageGenerationCost,
      total: totalImageGenerationCost
    };
  }
  
  // Calculate voice costs if TTS is enabled
  if (features.tts) {
    const voiceInputCost = voiceCost.inputCost * averageChatOutputTokens;
    breakdown.voice = {
      inputCost: voiceCost.inputCost,
      total: voiceInputCost
    };
  }

  // Calculate Discord costs if enabled
  if (features.discord) {
    const averageDiscordChatInteractions = 500;
    const discordCost = averageDiscordChatInteractions * totalEstimatedChatCost;
    breakdown.discord = {
      interactionCount: averageDiscordChatInteractions,
      costPerInteraction: totalEstimatedChatCost,
      total: discordCost
    };
  }

  // Calculate Twitter costs if enabled
  if (features.twitterBot) {
    const averageTwitterChatInteractions = 150;
    const twitterCost = averageTwitterChatInteractions * totalEstimatedChatCost;
    breakdown.twitter = {
      interactionCount: averageTwitterChatInteractions,
      costPerInteraction: totalEstimatedChatCost,
      total: twitterCost
    };
  }

  const totalCost = Object.values(breakdown).reduce((sum, feature: any) => 
    sum + (feature.total || 0), 0
  );

  return {
    featureCosts: costs,
    totalCost,
    breakdown
  };
}
