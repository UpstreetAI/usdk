const md = {
  toMarkdownString(messages) {
    let s = '';
    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];
      const item = message.object;

      if (s) {
        s += '\n\n';
      }

      for (const key in item) {
        const value = item[key];
        if (s) {
          s += '\n';
        }
        s += `#${key}:\n${value}`;
      }
    }
    return s;
  },
  fromMarkdownString(s) {
    const itemStrings = s.split('\n\n');
    
    const results = [];
    for (let i = 0; i < itemStrings.length; i++) {
      const itemString = itemStrings[i];

      // console.log('item string', itemStrings);

      let completionStringRemaining = itemString;
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
        const rest = completionStringRemaining.slice(deltaLength);
        completionStringRemaining = rest;
      };
      const labelLineRegex = /^#+([^\n]*):([^\n]*)(?:\n|$)/;

      for (;;) {
        const lineIndex = readLineIndex();
        if (lineIndex !== -1) {
          const completionValue = {};
          results.push(completionValue);
          const _consumeAttributes = () => {
            for (;;) {
              const value = readLine();
              if (value !== null) {
                const labelMatch = value.match(labelLineRegex);
                if (labelMatch) {
                  const key = labelMatch[1].trim();
                  const value2 = labelMatch[2].trim();

                  let acc = '';
                  acc += value2;
                  for (;;) {
                    const lineIndex = readLineIndex();
                    if (lineIndex === -1) {
                      break;
                    } else {
                      const value3 = completionStringRemaining.slice(0, lineIndex);
                      if (labelLineRegex.test(value3)) {
                        break;
                      } else {
                        acc += value3;
                        shiftLine(lineIndex);
                        continue;
                      }
                    }
                  }
                  completionValue[key] = acc.trim();
                } else {
                  throw new Error(`expected label: ${value}`);
                }
              } else {
                break;
              }
            }
          };
          _consumeAttributes();
        } else {
          break;
        }
      }
    }
    return results;
  },
};
export default md;