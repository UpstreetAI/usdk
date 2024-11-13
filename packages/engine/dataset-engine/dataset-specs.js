import fs from 'fs';
import {
  parseDatasetSpec,
  parseDatasetItems,
  formatTrainingItemCandidates,
  // getItemNameKey,
  // getItemDescriptionKey,
  // getItemAttributeKeys,
} from './dataset-parser.js';

//

const fetchText = async u => {
  if (u.startsWith('./')) {
    const s = await fs.promises.readFile(u, 'utf8');
    return s;
  } else {
    const res = await fetch(u);
    if (res.ok) {
      const text = await res.text();
      return text;
    } else {
      throw new Error(`fetch error ${res.status} ${res.statusText} ${u}`);
    }
  }
};

//

// const datasetsBasePath = `https://raw.githack.com/webaverse/content/main/lore/`;
const datasetsBasePath = `https://cdn.jsdelivr.net/gh/webaverse/content@main/lore/`;
const datasetSpecsBasePath = `${datasetsBasePath}specs/`;
const datasetDataBasePath = `${datasetsBasePath}data/`;
const mdSpecs = [
  {
    url: 'characters.md',
  },
  {
    url: 'settings.md',
  },
  {
    url: 'items.md',
  },
  {
    url: 'cutscenes.md',
  },
  {
    url: 'chats.md',
  },
  {
    url: 'lore.md',
  },
  {
    url: 'battle-banters.md',
  },
  {
    url: 'matches.md',
  },
  {
    url: 'quests.md',
  },
];
const datasetSpecUrls = mdSpecs.map(mdSpec => `${datasetSpecsBasePath}${mdSpec.url}`);
const datasetDataUrls = mdSpecs.map(mdSpec => `${datasetDataBasePath}${mdSpec.url}`);

//

let datasetSpecPromise = null;
export const getDatasetSpecs = () => {
  if (!datasetSpecPromise) {
    datasetSpecPromise = (async () => {
      const datasetSpecs = await Promise.all(datasetSpecUrls.map(async datasetSpecUrl => {
        const mdText = await fetchText(datasetSpecUrl);
        const datasetSpec = parseDatasetSpec(mdText);
        return datasetSpec;
      }));
      return datasetSpecs;
    })();
  }
  return datasetSpecPromise;
};

export const getDatasetItems = async () => {
  const datasetSpecs = await getDatasetSpecs();
  const itemsArray = await Promise.all(datasetDataUrls.map(async (datasetDataUrl, index) => {
    const mdText = await fetchText(datasetDataUrl);
    const datasetSpec = datasetSpecs[index];
    let items = parseDatasetItems(mdText, datasetSpec);
    return items;
  }));
  return itemsArray.flat();
};

export const getDatasetItemsForDatasetSpec = async (datasetSpec) => {
  const datasetSpecs = await getDatasetSpecs();
  const index = datasetSpecs.findIndex(ds => ds.type === datasetSpec.type);
  
  if (index !== -1) {
    const datasetDataUrl = datasetDataUrls[index];
    const mdText = await fetchText(datasetDataUrl);
    let items = parseDatasetItems(mdText, datasetSpec);
    return items;
  } else {
    return [];
  }
};

export const getTrainingItems = async () => {
  const datasetSpecs = await getDatasetSpecs();
  const itemsArray = await Promise.all(datasetDataUrls.map(async (datasetDataUrl, index) => {
    const mdText = await fetchText(datasetDataUrl);
    const datasetSpec = datasetSpecs[index];
    let items = parseDatasetItems(mdText, datasetSpec);
    items = items.map(item => formatTrainingItemCandidates(item, datasetSpec)).flat();
    return items;
  }));
  return itemsArray.flat();
};