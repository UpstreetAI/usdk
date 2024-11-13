import Parser from 'stream-json/Parser';

throw new Error('old code, do not include!');

//

export class JsonCommandParserStream extends TransformStream {
  constructor({
    skills,
    onMessage,
    signal,
  }) {
    let jsonStreamParser = null;
    const handleMessage = (type, value) => {
      onMessage({
        type,
        value,
      });
    };
    const processSentence = sentence => {
      if (sentence.type === 'Sentence') { // ignore Whitespace, Punctuation
        const text = sentence.raw.trim();
        handleMessage('text', text);
      }
    };
    const processSentenceText = (value, setValue, final) => {
      // split sentences
      const sentences = sentenceSplitter.split(value);

      // process all sentences except the last one
      while (sentences.length > 1) {
        processSentence(sentences.shift());
      }

      if (!final) { // if we're not done, set the value to the pending sentence
        const newValue = sentences.length > 0 ? sentences[0].raw : '';
        setValue(newValue);
      } else { // if we're done, flush the last sentence
        if (sentences.length > 0) {
          processSentence(sentences[0]);
        }
        setValue('');
      }
    };
    const processEvent = e => {
      const {
        key,
        value,
        final,
      } = e.data;

      const skillSpec = skills.get(key);
      if (skillSpec) {
        if (skillSpec.progressive === 'sentence') {
          processSentenceText(value, e.setValue, final);
        } else {
          if (final) {
            handleMessage(key, value);
          }
        }
      } else {
        console.warn('LLM generated unknown skill: ' + JSON.stringify(key));
      }
    };
    const processEvents = events => {
      for (const event of events) {
        processEvent(event);
      }
    };
    const processCharacter = c => {
      if (!jsonStreamParser) {
        if (c === '{') {
          jsonStreamParser = new JsonStreamParser();
        } else {
          return;
        }
      }

      const parseResult = jsonStreamParser.write(c);
      const {
        done,
        value,
      } = parseResult;

      processEvents(value);

      if (done) {
        jsonStreamParser = null;
      }
    };
    const processContent = content => {
      const contentCharacters = [...content]; // split emojis
      for (let i = 0; i < contentCharacters.length; i++) {
        const c = contentCharacters[i];
        processCharacter(c);
      }
    };

    super({
      transform: (chunk, controller) => {
        const valueString = chunk;
        processContent(valueString);
      },
    })
  }
}

//

// NOTE: only supports flat json objects
export class JsonStreamParser extends EventTarget {
  constructor() {
    super();

    this.currentObject = null;
    this.currentKey = null;

    this.objectDepth = 0;
    this.done = false;
    this.eventCache = [];
    // this.finished = false;

    this.parser = new Parser();
    {
      this.parser.on('data', e => {
        // console.log('data', [e.name, e.value]);
        this.parser.emit(e.name, e.value)
      });

      this.parser.on('startObject', e => {
        // console.log('startObject', e);

        if (++this.objectDepth === 1) {
          this.currentObject = {};
        }
      });
      this.parser.on('endObject', e => {
        // console.log('endObject', e);

        if (--this.objectDepth === 0) {
          this.done = true;

          this.dispatchEvent(new MessageEvent('end', {
            data: {
              object: this.currentObject,
            },
          }));
        }
      });

      this.parser.on('startKey', e => {
        // console.log('startKey', e);
        if (this.objectDepth === 1) {
          this.currentKeyValue = null;
        }
      });
      // this.parser.on('endKey', e => {
      //   console.log('endKey', e);
      // });
      this.parser.on('keyValue', e => {
        // console.log('keyValue', e);
        if (this.objectDepth === 1) {
          this.currentKeyValue = {
            key: e,
            value: '',
          };
        }
      });

      for (const eventName of [
        'stringChunk',
        // 'numberChunk',
      ]) {
        this.parser.on(eventName, e => {
          // console.log('stringChunk', e, this.objectDepth, this.currentKeyValue);
          if (this.objectDepth === 1) {
            if (this.currentKeyValue) {
              this.currentKeyValue.value += e;

              // if (typeof this.currentKeyValue.value === 'number' && isNaN(this.currentKeyValue.value)) {
              //   debugger;
              // }

              const updateEvent = new MessageEvent('update', {
                data: {
                  key: this.currentKeyValue.key,
                  value: this.currentKeyValue.value,
                  object: this.currentObject,
                  final: false,
                },
              });
              updateEvent.setValue = (v) => {
                this.currentKeyValue.value = v;
              };
              // this.dispatchEvent(updateEvent);
              this.eventCache.push(updateEvent);
            }
          }
        });
      }

      for (const eventName of [
        'nullValue',
        'trueValue',
        'falseValue',
        'stringValue',
        'numberValue',
      ]) {
        this.parser.on(eventName, e => {
          // console.log('got', eventName, e);

          if (this.objectDepth === 1 && this.currentObject && this.currentKeyValue) {
            const {
              key,
              value,
            } = this.currentKeyValue;
            if (['stringValue'/*, 'numberValue' */].includes(eventName)) {
              // this.currentObject[key] = e;
              // console.log([key, value]);

              this.currentObject[key] = this.currentKeyValue.value;

              const updateEvent = new MessageEvent('update', {
                data: {
                  key,
                  value: this.currentKeyValue.value,
                  object: this.currentObject,
                  final: true,
                },
              });
              updateEvent.setValue = (v) => {
                this.currentKeyValue.value = v;
              };
              // this.dispatchEvent(updateEvent);
              this.eventCache.push(updateEvent);
            } else if (['numberValue'].includes(eventName)) {
              this.currentObject[key] = parseFloat(e);
              // console.log([key, parseFloat(e)]);

              const updateEvent = new MessageEvent('update', {
                data: {
                  key,
                  value: parseFloat(e),
                  object: this.currentObject,
                  final: true,
                },
              });
              updateEvent.setValue = (e) => {
                debugger;
              };
              // this.dispatchEvent(updateEvent);
              this.eventCache.push(updateEvent);
            } else {
              this.currentObject[key] = e;
              // console.log([key, e]);

              const updateEvent = new MessageEvent('update', {
                data: {
                  key,
                  value: e,
                  object: this.currentObject,
                  final: true,
                },
              });
              updateEvent.setValue = (e) => {
                debugger;
              };
              // this.dispatchEvent(updateEvent);
              this.eventCache.push(updateEvent);
            }
          }
        });
      }
    }
  }
  flushEvents() {
    if (this.eventCache.length > 0) {
      const result = this.eventCache;
      this.eventCache = [];
      return result;
    } else {
      return [];
    }
  }
  write(s) {
    let hadError = false;
    try {
      this.parser.write(s);
    } catch(err) {
      console.warn(err);
      hadError = true;
    }

    const done = hadError || this.done;
    return {
      done,
      hadError,
      thisDone: this.done,
      value: this.flushEvents(),
    };
  }
}