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
  inputCost: number;  // cost per 1K tokens for input
  outputCost: number; // cost per 1K tokens for output
};

export async function getModelCost(model: string, jwt: string): Promise<ModelCost> {
  const res = await fetch(`https://${aiProxyHost}/api/getModelCosting`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${jwt}`,
    },
    body: JSON.stringify({
      model,
    }),
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch model cost: ${res.status}`);
  }

  return res.json();
}

export async function calculateFeatureCosts(features: any, jwt: string) {
  let totalCost = 0;
  const costs: Record<string, object> = {};
  const [chatCost, visionCost, voiceCost, imageGenerationCost] = await Promise.all([
    getModelCost(defaultChatModel, jwt),
    getModelCost(defaultVisionModel, jwt),
    getModelCost(defaultVoiceModel, jwt),
    getModelCost(defaultImageGenerationModel, jwt),
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
  const chatInputCost = chatCost.inputCost * averageChatInputTokens;
  const chatOutputCost = chatCost.outputCost * averageChatOutputTokens;
  const totalEstimatedChatCost = chatInputCost + chatOutputCost;
  // Calculate chat model costs
  totalCost += totalEstimatedChatCost;

  if (features.tts) {
    totalCost += voiceCost.outputCost + voiceCost.inputCost;
  }

  return {
    featureCosts: costs,
    totalCost: totalCost
  };
}
