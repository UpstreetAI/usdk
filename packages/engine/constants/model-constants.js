// import {
//   aiProxyHost,
// } from "../endpoints.js";

// export const model = 'text-davinci-003';
// export const imageModels = [
//   {
//     name: `SD:openjourney-v2`,
//     endpointUrl: `https://${aiProxyHost}/api/imaginairy/imagine`,
//     handleFn: async (promptObject) => {
//       const fd = new FormData();
//       fd.append('prompt_texts', promptObject + 'beautiful, best quality, highres, trending on artstation, masterpiece');
//       fd.append('width', 512);
//       fd.append('height', 512);
//       return fd;
//     },
//   },
// ];

// export const objectModel = 'objectArthemy_v10.safetensors';
// const objectModel = 'sd_xl_base_1.0.safetensors';
// export const objectModel = 'counterfeitxlV10.iOpX.safetensors';
// const objectPrompt = 'dark thorn cable device, icon concept art, fortnite style, borderlands style, clean white background';
// const objectNegativePrompt = 'human, person, character, man, woman, npc, avatar, skin, boy, girl';

//

// export const characterModel = 'flat2dAnimergeV3F16.vzgC.safetensors';
// export const characterModel = 'animetenFp16.FbQ5.safetensors';
// export const characterModel = 'mistoonAnime_v20.safetensors';
// export const characterModel = 'animeartdiffusionalp.zx1y.safetensors';
// export const characterModel = 'counterfeitxlV10.iOpX.safetensors';
// export const characterModel = 'emix.3afb.safetensors';
// export const characterModel = 'emi.safetensors';
export const characterModel = 'horizonV11.3KCl.safetensors';
// export const characterModel = 'notAnimefullFinalXl.L3vj.safetensors';
export const characterLora = '';
// export const characterLora = '<lora:lohaAnimeV2MnArtstyle08:1>'; // mn artstyle
// export const characterLora = '<lora:cuteAnime20v1.kIK1:1>';
// export const characterLora = '<lora:anime.iJFu.safetensors:1>';
// export const characterLora = '<lora:animemixV3Offset.5KSg.safetensors:1>';
// export const characterLora = '<lora:detailedanimestills.NnLJ.safetensors:2>';
// export const characterLora = '<lora:pokemonanimev210.Jcw4:1>';
// export const characterLora = '<lora:pokemoviesV1.PENq:1>';
// export const characterLora = '<lora:pokemonV3Offset:1>';

export const characterPrompt = 'full body character, looking at viewer, flat anime style, 8k, high resolution, white background';
// export const characterPrompt = 'looking at camera, pokemovies, empty white background';
// export const characterPrompt = 'looking at camera, mn artstyle, anime style, white background';
export const characterNegativePrompt = 'shadow, mask, background, environment, weapon';

// export const characterDenoisingStrength = undefined;
// export const characterDenoisingStrength = 0.5;
export const characterDenoisingStrength = 0.9;

//

// export const backgroundModel = 'animeartdiffusionalp.zx1y.safetensors';
export const backgroundModel = 'emix.3afb.safetensors';
// export const backgroundModel = 'anime20natural.XrkU.safetensors';
// export const backgroundLora = '';
export const backgroundLora = '<lora:animeBackground:1>';
// export const backgroundLora = '<lora:animeBackground:1> <lora:lohaAnimeV2MnArtstyle08:1>';
// export const backgroundLora = '<lora:animeBackground:1> <lora:cyberBackgroundSdxl.un6d:1>';

export const backgroundPrompt = 'anime background, unreal engine';
// export const backgroundPrompt = 'anime background, mn artstyle, unreal engine';
export const backgroundNegativePrompt = 'monochrome, text, human, person, character, avatar, man, woman, boy, girl';

//

export const itemModel = 'animeartdiffusionalp.zx1y.safetensors';
// export const itemModel = 'counterfeitxlV10.iOpX.safetensors';
// export const itemModel = 'emix.3afb.safetensors';
// export const itemModel = 'anime20natural.XrkU.safetensors';
// export const itemModel = 'notAnimefullFinalXl.L3vj.safetensors';
// export const itemLora = '<lora:gameIconV10.UfBM:1> <lora:animeBackground:1>';
// export const itemLora = '';
// export const itemLora = '<lora:gameIconV10.UfBM:1>';
// export const itemLora = '<lora:gameIconV10.UfBM:1> <lora:animeBackground:1>';
// export const itemLora = '<lora:animeBackground:1>';
export const itemLora = '<lora:animeBackground:1> <lora:ps1StyleSDXLV2:1>';

export const itemPrompt = `ps1 style, item, anime style, white background`;
export const itemNegativePrompt = `shadow, effect, environment, human, person, character, avatar, man, woman, boy, girl`;

//

// export const mob360Model = 'animeartdiffusionalp.zx1y.safetensors';
export const mob360Model = 'emix.3afb.safetensors';
export const mob360Lora = '<lora:pokemonV3Offset.kqVz:1> <lora:ps1StyleSDXLV2:1>';

// export const mob360Prompt = `natural mysterious creature pet, ps1 style, pokemon style, zelda style, white background`;
// export const mob360Prompt = `natural mysterious creature animal pet on a white background, ps1 style, pokemon style, zelda style`;
export const mob360Prompt = `natural beautiful mysterious creature on a white background, ps1 style, pokemon style`;
export const mob360NegativePrompt = itemNegativePrompt;