// const capitalize = s => s[0].toUpperCase() + s.slice(1);

//

const collectKeys = (datasetSpec, initialValue, opts) => {
  const {
    nameKey,
    descriptionKey,
    attributeKeys,
  } = datasetSpec;
  const {
    keys,
    continueKey,
  } = opts;

  const allKeys = [];
  // if (nameKey in initialValue) {
    allKeys.push(nameKey);
  // }
  // if (descriptionKey in initialValue) {
    allKeys.push(descriptionKey);
  // }
  for (const k in initialValue) {
    if (!allKeys.includes(k)) {
      allKeys.push(k);
    }
  }
  if (keys) {
    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      if (!allKeys.includes(k)) {
        allKeys.push(k);
      }
    }
  } else {
    for (let i = 0; i < attributeKeys.length; i++) {
      const k = attributeKeys[i];
      if (!allKeys.includes(k)) {
        allKeys.push(k);
      }
    }
  }

  if (continueKey) { // if we have a continue key, put it at the end
    if (!allKeys.includes(continueKey)) {
      allKeys.push(continueKey);
    }
    allKeys.sort((a, b) => {
      const aIsContinue = a === continueKey;
      const bIsContinue = b === continueKey;
      return +aIsContinue - +bIsContinue;
    });
    // ensure that there are no missing keys, as that would result in illegal formatting
    const firstMissingValueKeyIndex = findFirstMissingValueKeyIndex(allKeys, initialValue);
    if (
      !(
        firstMissingValueKeyIndex === allKeys.length || // not missing
        firstMissingValueKeyIndex === allKeys.length - 1 // missing, but it's the continue key at the end
      )
    ) {
      console.warn('Missing continuation initial value keys: ', {allKeys, initialValue, firstMissingValueKeyIndex});
    }
  } else { // othrwise, sort the keys so that the missing keys are at the end
    allKeys.sort((a, b) => {
      const aHas = a in initialValue;
      const bHas = b in initialValue;
      return +bHas - +aHas;
    });
  }

  return allKeys;
};
const findFirstMissingValueKeyIndex = (allKeys, initialValue) => {
  for (let i = 0; i < allKeys.length; i++) {
    const k = allKeys[i];
    if (!(k in initialValue)) {
      return i;
    }
  }
  return allKeys.length;
};

//

export const formatItemText = (item, datasetSpec, initialValue = {}, opts = {}) => {
  // const {
  //   nameKey,
  //   descriptionKey,
  //   attributeKeys,
  // } = datasetSpec;
  const {
    keys,
  } = opts;

  const allKeys = collectKeys(datasetSpec, initialValue, opts);

  // acc result
  let s = '';
  for (const k of allKeys) {
    const v = item[k];
    s += `#${k}:\n${v}\n`;
  }
  return s;
};
export const formatInitialValueText = (initialValue, datasetSpec, opts = {}) => {
  const {
    nameKey,
    descriptionKey,
    attributeKeys,
  } = datasetSpec;
  const {
    keys,
    continueKey,
  } = opts;

  const allKeys = collectKeys(datasetSpec, initialValue, opts);

  // find the first missing value key index
  const firstMissingValueKeyIndex = findFirstMissingValueKeyIndex(allKeys, initialValue);

  // acc result
  let s = '';
  for (let i = 0; i < firstMissingValueKeyIndex; i++) {
    const k = allKeys[i];
    const v = initialValue[k];
    s += `#${k}:\n`;
    if (v) {
      s += v;
      // if (!v.endsWith('\n')) {
        s += '\n';
      // }
    }
  }
  if (firstMissingValueKeyIndex < allKeys.length) {
    const k = allKeys[firstMissingValueKeyIndex];
    s += `#${k}:\n`;
  }
  return s;
};
export const formatDatasetItems = (dataset, datasetSpec) => {
  // const {
  //   type,
  //   nameKey,
  //   descriptionKey,
  //   attributeKeys,
  // } = datasetSpec;

  let result = '';
  for (let i = 0; i < dataset.length; i++) {
    const item = dataset[i];
    const s = formatItemText(item, datasetSpec);
    if (result.length > 0) {
      result += '\n\n';
    }
    result += s;
  }
  return result;
};
export const formatDatasetItemsForPolyfill = (dataset, datasetSpec, initialValue = {}, opts = {}) => {
  // const {
  //   type,
  //   nameKey,
  //   descriptionKey,
  //   attributeKeys,
  // } = datasetSpec;
  // const {
  //   keys,
  //   continueKey,
  // } = opts;

  // if ([nameKey, descriptionKey].includes(keys)) {
  //   throw new Error(`keys cannot include ${nameKey} or ${descriptionKey}`);
  // }

  let result = '';
  for (let i = 0; i < dataset.length; i++) {
    const item = dataset[i];
    const s = formatItemText(item, datasetSpec, initialValue, opts);
    if (result.length > 0) {
      result += '\n';
    }
    result += s;
  }
  return result;
};
export const formatTrainingItemCandidates = (item, datasetSpec) => {
  const {
    type,
    nameKey,
    descriptionKey,
  } = datasetSpec;

  const _getNameCompletion = () => {
    if (item[nameKey]) {
      const prompt = `@Type: ${type}\n## ${nameKey}:`
      const completion = `\n${item[nameKey]}\n\n`;
      return [
        {
          prompt,
          completion,
        },
      ];
    } else {
      return [];
    }
  };
  const _getDescriptionCompletion = () => {
    if (item[nameKey] && item[descriptionKey]) {
      const prompt = `@Type: ${type}\n\
## ${nameKey}:\n${item[nameKey]}\n\
## ${descriptionKey}:\
`;
      const completion = `\n${item[descriptionKey]}\n\n`;
      return [
        {
          prompt,
          completion,
        },
      ];
    } else {
      return [];
    }
  };
  const _getAttributeCompletions = () => {
    const basePrompt = `@Type: ${type}\n`;
    // const completion = formatItemText(item, ignoreKeys); */
    const formattedItems = [];
    const itemAttributeKeys = Object.keys(item);
    for (const k of itemAttributeKeys) {
      const prompt = `${basePrompt}## ${k}:`;
      const completion = `\n${item[k]}\n\n`;
      const formattedItem = {
        prompt,
        completion,
      };
      formattedItems.push(formattedItem);
    }
    return formattedItems;
  };
  return _getNameCompletion()
    .concat(_getDescriptionCompletion())
    .concat(_getAttributeCompletions());
};
export const formatDatasetNamePrompt = datasetSpec => {
  const {
    type,
    nameKey,
  } = datasetSpec;
  const prompt = `@Type: ${type}\n## ${nameKey}:`;
  return prompt;
};
export const formatDatasetDescriptionPrompt = (datasetSpec, name) => {
  const {
    type,
    nameKey,
    descriptionKey,
  } = datasetSpec;
  const prompt = `@Type: ${type}\n\
## ${nameKey}:\n\
${name}\n\
## ${descriptionKey}:`;
  return prompt;
};
export const formatDatasetAttributePrompts = (datasetSpec, name, description) => {
  const {
    type,
    nameKey,
    descriptionKey,
    attributeKeys,
  } = datasetSpec;
  
  const basePrompt = `@Type: ${type}\n\
## ${nameKey}:\n\
${name}\n\
## ${descriptionKey}:\n\
${description}\n\
`;
  const ignoreKeys = [
    nameKey,
    descriptionKey,
  ];
  return attributeKeys.filter(key => !ignoreKeys.includes(key)).map(key => {
    const prompt = `${basePrompt}## ${key}:`;
    return {
      key,
      prompt,
    };
  });
};
export const parseDatasetItems = (md, datasetSpec, {
  count = Infinity,
} = {}) => {
  const {
    // type,
    // nameKey,
    // descriptionKey,
    groupKey,
  } = datasetSpec;

  const items = [];
  const r = /([\s\S]+?)(?:\n\n|$)/g;
  let match2;
  while (match2 = r.exec(md)) {
    const itemString = match2[1];

    const itemAttributes = {};
    let currentAttributeName = '';
    let currentAttributeValue = '';
    // let currentAttributeAsterisk = false;
    const _flushAttribute = () => {
      itemAttributes[currentAttributeName] = currentAttributeValue;
      // if (currentAttributeAsterisk) {
      //   itemAttributes[currentAttributeName] = currentAttributeAsterisk;
      // }

      currentAttributeName = '';
      currentAttributeValue = '';
      // currentAttributeAsterisk = false;
    };

    const itemLines = itemString.split('\n');
    for (let i = 0; i < itemLines.length; i++) {
      const itemLine = itemLines[i];

      const match3 = itemLine.match(/^([@#]+ ?[\s\S]+?)(\*?):(?: )?(.*)(?:\n|$)/);
      if (match3) {
        const name = match3[1];
        // const asterisk = match3[2];
        const value = match3[3];

        if (currentAttributeName) {
          _flushAttribute();
        }

        currentAttributeName = name.replace(/^[@#]+ ?/, '');
        currentAttributeValue = value;
        // currentAttributeAsterisk = !!asterisk;
      } else {
        if (currentAttributeName) {
          if (currentAttributeName === groupKey) {
            const itemAttributesClone = {...itemAttributes};
            itemAttributesClone[currentAttributeName] = itemLine;
            items.push(itemAttributesClone);
            if (items.length >= count) {
              return items;
            }
          } else {
            if (currentAttributeValue) {
              currentAttributeValue += '\n';
            }
            currentAttributeValue += itemLine;
          }
        } else {
          throw new Error(
            'did not have item attribute context: ' +
              JSON.stringify({
                datasetSpec,
                currentAttributeName,
                currentAttributeValue,
                itemString,
                itemLines,
              }, null, 2)
          );
        }
      }
    }
    if (currentAttributeName) {
      _flushAttribute();
    }

    items.push(itemAttributes);
    if (items.length >= count) {
      return items;
    }
  }
  return items;
};
export const parseDatasetSpec = md => {
  const match = md.match(/^([\s\S]*?)\n\n([\s\S]*)$/);
  if (match) {
    const prefix = match[1];
    const itemsMd = match[2];

    const datasetItems = parseDatasetItems(itemsMd, {
      count: 1,
    });
    const item0 = datasetItems[0];
    let itemKeys = Object.keys(item0);
    if (itemKeys.length >= 4) {
      const [
        typeKey,
        imagePromptKey,
        nameKey,
        descriptionKey,
        ...attributeKeys
      ] = itemKeys;
      const type = item0[typeKey];
      const imagePrompt = item0[imagePromptKey];
      const groupKey = attributeKeys.find(k => k.endsWith('*')) ?? null;
      // console.log('got keys', [groupKey], attributeKeys);
      return {
        type,
        imagePrompt,
        nameKey,
        descriptionKey,
        attributeKeys,
        groupKey,
        prefix,
      };
    } else {
      throw new Error('invalid dataset item keys: ' + JSON.stringify(itemKeys, null, 2));
    }
  } else {
    throw new Error('had no prefix: ' + JSON.stringify(md));
  }
};

export const getCompletionParser = (datasetSpec, initialValue, opts) => (completionString) => {
  const {
    nameKey,
    descriptionKey,
    attributeKeys,
  } = datasetSpec;
  const {
    keys,
    continueKey,
    continueLabel,
  } = opts;

  const completionValue = {};
  let done = true;
  let readString = '';
  if (continueKey) {
    const oldValue = initialValue[continueKey] ?? '';
    completionValue[continueKey] = oldValue + '\n' + continueLabel + completionString;
    readString += completionString;
  } else {
    let completionStringRemaining = completionString;

    const readLineIndex = () => {
      const match = completionStringRemaining.match(/^([^\n]+)(\n|$)/);
      if (match) {
        const line = match[1];
        const sp = match[2];
        const deltaLength = line.length + sp.length;
        return deltaLength;
      } else {
        return -1;
      }
    };
    const readLine = () => {
      const deltaLength = readLineIndex();
      
      if (deltaLength !== -1) {
        const first = completionStringRemaining.slice(0, deltaLength);
        shiftLine(deltaLength);
        return first;
      } else {
        return null;
      }
    };
    const shiftLine = deltaLength => {
      const first = completionStringRemaining.slice(0, deltaLength);
      const rest = completionStringRemaining.slice(deltaLength);
      completionStringRemaining = rest;
      readString += first;
    };
    // const unshiftLine = line => {
    //   completionStringRemaining = line + '\n' + completionStringRemaining;
    // };
    const labelLineRegex = /^#([^\n]*):(?:\n|$)/;
    
    const allKeys = collectKeys(datasetSpec, initialValue, opts);
    const firstMissingValueKeyIndex = findFirstMissingValueKeyIndex(allKeys, initialValue);
    for (let i = firstMissingValueKeyIndex; i < allKeys.length; i++) {
      const key = allKeys[i];
      if (i !== firstMissingValueKeyIndex) { // skip upcoming label line
        const line = readLine();
        if (line !== null) {
          const match = line.match(labelLineRegex);
          if (!match) {
            throw new Error('invalid label line: ' + JSON.stringify(line));
          }
          if (match[1].trim().toLowerCase() !== key.toLowerCase()) {
            console.warn('key mismatch', {
              key,
              line,
              match: [
                match[1].toLowerCase(),
                key.toLowerCase(),
              ],
            });

            if (readString.length > 0) {
              readString += `\n#${key}:\n`;
            }
            done = false;
            
            break;
          }
        }
      }
      // accumulate a complete attribute
      const value = readLine();
      if (value !== null) {
        let acc = '';
        acc += value;
        for (;;) {
          const lineIndex = readLineIndex();
          if (lineIndex === -1) {
            break;
          } else {
            const value2 = completionStringRemaining.slice(0, lineIndex);
            if (labelLineRegex.test(value2)) {
              // unshiftLine(value2);
              break;
            } else {
              acc += value2;
              shiftLine(lineIndex);
              continue;
            }
          }
        }
        completionValue[key] = acc.trim();
      } else {
        if (readString.length > 0) {
          readString += `\n#${key}:\n`;
        }
        done = false;
        break;
      }
    }
  }
  return {
    done,
    readString,
    completionValue,
  };
}