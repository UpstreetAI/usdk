import { uniqueNamesGenerator, adjectives, colors, animals } from 'unique-names-generator';

const descriptions = [
  "AI enthusiast exploring new possibilities.",
  "Tech geek building intelligent agents.",
  "Passionate about coding and AI.",
  "Turning ideas into AI reality.",
  "Lifelong learner in artificial intelligence.",
  "Experimenting with AI models and algorithms.",
  "Sharing my journey in AI development.",
  "Creator of smart solutions and bots.",
  "Exploring the future of AI technology.",
  "Just a human teaching machines.",
  "Developer diving into AI agents.",
  "Coding my way through the AI world.",
  "Building bots to make life easier.",
  "AI hobbyist and programmer.",
  "Automating tasks with intelligent agents.",
  "Passionate about machine learning.",
  "Creating AI that learns and grows.",
  "Tech lover exploring AI frontiers.",
  "AI explorer and code writer.",
  "Bringing creativity to artificial intelligence.",
  "Making smart apps with AI.",
  "Engineer by day, AI tinkerer by night.",
  "Turning code into intelligent life.",
  "On a mission to innovate with AI.",
  "Building the future with AI agents.",
  "Coding bots to solve real problems.",
  "AI dreamer and developer.",
  "Exploring deep learning and AI.",
  "Programming intelligent solutions.",
  "Geeky about AI and automation.",
  "Teaching machines to think.",
  "Creating AI for fun and function.",
  "Always learning in the AI space.",
  "Enthusiast of neural networks.",
  "From ideas to AI implementations.",
  "Passionate about data and AI.",
  "Crafting code for intelligent agents.",
  "Exploring the limits of AI tech.",
  "Building smarter software with AI.",
  "Innovating one agent at a time.",
];


export const getRandomPFP = () => {
  // pick a number between 1 and 45
  const randomNum = Math.floor(Math.random() * 91) + 1;
  return `./pfps/${randomNum}.jpg`;
}

export const createRandomName = () => {
  let randomName = uniqueNamesGenerator({
    dictionaries: [adjectives, colors, animals],
    separator: '',
    style: 'capital'
  });

  // const suffixes = ['TV', 'Network', 'Show', 'Live', 'AI', '', '', ''];

  return randomName; // + suffixes[Math.floor(Math.random() * suffixes.length)];
};

export const getDefaultUser = (id = crypto.randomUUID(), name, preview_url) => {
  return {
    id,
    description: descriptions[Math.floor(Math.random() * descriptions.length)],
    name: name,
    playerSpec: getDefaultPlayerSpec(),
    preview_url: preview_url,
  };
};
export const getDefaultPlayerSpec = () => {
  return (Math.random() < 0.5 ?
    {
      name: 'Vipe 2185',
      bio: 'A blond-haired boy',
      // voiceEndpoint: 'elevenlabs:scillia',
      // voiceEndpoint: 'tiktalknet:Trixie',
      // voiceEndpoint: 'tiktalknet:Shining Armor',
      voiceEndpoint: 'elevenlabs:kaido:YkP683vAWY3rTjcuq2hX',
      voicePack: 'Griffin voice pack',
      // avatarUrl: '/avatars/default_2195.vrm',
      // avatarUrl: '/avatars/default_2194.vrm',
      // avatarUrl: '/avatars/Yoll2.vrm',
      // avatarUrl: '/avatars/ann_liskwitch_v3.3_gulty.vrm',
      // avatarUrl: '/avatars/CornetVRM.vrm',
      // avatarUrl: '/avatars/Buster_Rabbit_V1.1_Guilty.vrm',
      // avatarUrl: '/avatars/Scilly_FaceTracking_v1_Darling.vrm',
      // avatarUrl: '/avatars/Scilly_FaceTracking_v3_Darling_2.vrm',
      // avatarUrl: '/avatars/Scilly_FaceTracking_v5_Darling.vrm',
      // avatarUrl: '/avatars/Scilly_FaceTracking_v6_Darling.vrm',
      // avatarUrl: '/avatars/scilly_psx.vrm',
      // avatarUrl: '/avatars/scilly_drophunter_v31.10_Guilty.vrm',
      avatarUrl: '/avatars/default_2185.vrm',
    }
  :
    {
      name: 'Vipe 1614',
      bio: 'A brown-haired girl',
      voiceEndpoint: 'elevenlabs:scillia:kNBPK9DILaezWWUSHpF9',
      voicePack: 'ShiShi voice pack',
      // avatarUrl: '/avatars/default_1933.vrm',
      // avatarUrl: '/avatars/default_2194.vrm',
      avatarUrl: '/avatars/default_1934.vrm',
    }
  );
};
