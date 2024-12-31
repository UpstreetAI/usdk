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

export async function calculateFeatureCosts(
    features: any,
    jwt: string,
    chatInputTokens?: number,
  ) {
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

  // XXX test basic chat token values
  const inputChatTokens = chatInputTokens || 4000; // 4000 estimated tokens for the 1st conversation prompt being inferenced
  const averageChatOutputTokens = 30; // 30 estimated tokens for the average chat generated response
  const chatInputCost = chatCost.cost.inputCost * inputChatTokens;
  const chatOutputCost = chatCost.cost.outputCost * averageChatOutputTokens;
  const totalEstimatedChatCost = chatInputCost + chatOutputCost;

  // Calculate basic chat model costs
  totalCost += totalEstimatedChatCost;

  // XXX add in image generation costs
  const defaultImageGenerationCost = typeof imageGenerationCost.cost.inputCost === 'number' ? imageGenerationCost.cost.inputCost : imageGenerationCost.cost.inputCost.default.default;
  const totalImageGenerationCost = defaultImageGenerationCost * 2; // 2 images generated for Personality
  totalCost += totalImageGenerationCost;

  // XXX add in voice costs if enabled
  if (features.tts) {
    const voiceInputCost = voiceCost.cost.inputCost * averageChatOutputTokens;
    totalCost += voiceInputCost;
  }


  return {
    featureCosts: costs,
    totalCost: totalCost
  };
}
