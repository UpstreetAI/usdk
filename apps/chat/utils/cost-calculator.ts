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

export type ModelCost = {
  cost: {
    inputCost: number;  // cost per 1K tokens for input
    outputCost: number; // cost per 1K tokens for output
  };
};

export async function getModelCost(model: string, jwt: string): Promise<ModelCost> {
  const url = new URL(`/api/getModelCosting`, `https://${aiProxyHost}`);
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

export async function calculateFeatureCosts(features: any, jwt: string) {
  let totalCost = 0;
  const costs: Record<string, object> = {};
  const [chatCost, visionCost, voiceCost, imageGenerationCost] = await Promise.all([
    getModelCost(defaultChatModel.split(':')[1], jwt),
    getModelCost(defaultVisionModel.split(':')[1], jwt),
    getModelCost(defaultVoiceModel.split(':')[1], jwt),
    getModelCost(defaultImageGenerationModel.split(':')[1], jwt),
  ]);


  costs['chat'] = chatCost; 
  costs['vision'] = visionCost;
  costs['voice'] = voiceCost;
  costs['imageGeneration'] = imageGenerationCost;

  console.log('costing: ', {
    chatCost,
    visionCost,
    voiceCost,
    imageGenerationCost,
  });

  // XXX test chat token values
  const averageChatInputTokens = 15;
  const averageChatOutputTokens = 20;
  const chatInputCost = chatCost.cost.inputCost * averageChatInputTokens;
  const chatOutputCost = chatCost.cost.outputCost * averageChatOutputTokens;
  const totalEstimatedChatCost = chatInputCost + chatOutputCost;
  // Calculate chat model costs
  totalCost += totalEstimatedChatCost;

  if (features.tts) {
    const voiceInputCost = voiceCost.cost.inputCost * averageChatOutputTokens;
    totalCost += voiceInputCost;
  }


  return {
    featureCosts: costs,
    totalCost: totalCost
  };
}
