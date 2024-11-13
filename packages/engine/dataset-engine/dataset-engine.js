import alea from 'alea';
// import uuidHash from 'uuid-hash';
import {
  formatInitialValueText,
  formatDatasetItemsForPolyfill,
  getCompletionParser,
} from './dataset-parser.js';
import {
  getDatasetItemsForDatasetSpec,
} from './dataset-specs.js';

const modelMaxTokens = 4000;
export class DatasetEngine {
  constructor({
    datasetSpec,
    aiClient,
    fillRatio = 0.5,
  }) {
    this.datasetSpec = datasetSpec;
    this.aiClient = aiClient;
    this.fillRatio = fillRatio;
  }
  async generateItem(initialValue, opts) {
    const {
      continueKey,
      continueLabel,
    } = opts;

    const initialValueString = formatInitialValueText(initialValue, this.datasetSpec, opts);
    const initialValueEncoded = this.aiClient.tokenize(initialValueString);
    let tokenLength = initialValueEncoded.length;
    // note: the token length is conservative, since we don't account for token merge across items

    // choose items
    const items = [];
    const fillTokens = modelMaxTokens * this.fillRatio;
    if (tokenLength < fillTokens) {
      // get candidate items
      let candidateItems = await getDatasetItemsForDatasetSpec(this.datasetSpec);
      candidateItems = candidateItems.slice();
      const rng = alea(Math.random());
      while (candidateItems.length > 0) {
        const index = Math.floor(rng() * candidateItems.length);
        const item = candidateItems[index];
        let itemString = '';
        if (items.length > 0) {
          itemString += '\n\n';
        }
        itemString += formatDatasetItemsForPolyfill([item], this.datasetSpec, initialValue, opts);
        const itemStringEncoded = this.aiClient.tokenize(itemString);
        const itemStringEncodedLength = itemStringEncoded.length;
        if (tokenLength + itemStringEncodedLength <= fillTokens) {
          tokenLength += itemStringEncodedLength;
          items.push(item);
          candidateItems.splice(index, 1); 
        } else {
          break;
        }
      }
    }

    const itemsString = formatDatasetItemsForPolyfill(items, this.datasetSpec, initialValue, opts);
    let prompt = itemsString + '\n' + initialValueString;
    // console.log('initial prompt', {
    //   itemsString,
    //   initialValueString,
    //   prompt,
    // });
    let stops;
    if (continueKey) {
      if (continueLabel) {
        prompt += continueLabel;
      }
      stops = [
        '\n',
      ];
    } else {
      stops = [
        '\n\n',
      ];
    }

    const maxRetries = 10;
    for (let i = 0; i < maxRetries; i++) {
      const completion = await this.aiClient.generate(prompt, stops);
      // console.log('try completion', {
      //   prompt,
      //   stops,
      //   completion,
      // });
      const parseFn = getCompletionParser(this.datasetSpec, initialValue, opts);
      const {
        readString,
        done,
        completionValue,
      } = parseFn(completion);

      initialValue = {
        ...initialValue,
        ...completionValue,
      };

      if (done) {
        return initialValue;
      } else {
        prompt += readString;
      }
    }

    throw new Error(`Failed to generate item after ${maxRetries} retries`);
  }
}