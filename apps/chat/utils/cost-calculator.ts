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
import { FeaturesObject } from '@/lib/types';


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
  const chatInputCost = chatCost.cost.inputCost * inputChatTokens;
  const chatOutputCost = chatCost.cost.outputCost * averageChatOutputTokens;
  const totalEstimatedChatCost = chatInputCost + chatOutputCost;
  breakdown.chat = {
    inputCost: chatInputCost,
    outputCost: chatOutputCost,
    total: totalEstimatedChatCost
  };
  
  // Calculate image generation costs if personality is enabled
  if (features.personality) {
    const defaultImageGenerationCost = typeof imageGenerationCost.cost.inputCost === 'number' 
      ? imageGenerationCost.cost.inputCost 
      : imageGenerationCost.cost.inputCost.default.default;
    const totalImageGenerationCost = defaultImageGenerationCost * 2;
    breakdown.imageGeneration = {
      cost: defaultImageGenerationCost,
      total: totalImageGenerationCost
    };
  }
  
  // Calculate voice costs if TTS is enabled
  if (features.tts) {
    const voiceInputCost = voiceCost.cost.inputCost * averageChatOutputTokens;
    breakdown.voice = {
      inputCost: voiceCost.cost.inputCost,
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

  const totalCost = Object.values(breakdown).reduce((sum, feature: any) => 
    sum + (feature.total || 0), 0
  );

  return {
    featureCosts: costs,
    totalCost,
    breakdown
  };
}
