export const sayCommandType = 'dialogue';
export const friendInviteCommandType = 'friendInvite';
export const chatInviteCommandType = 'chatInvite';
export const paymentCommandType = 'payment';
export const rvcCommandType = 'rvc';
export const joinWorldCommandType = "joinWorld";
export const joinAdventureCommandType = "joinAdventure";
export const openFriendListCommandType = "openFriendList";
export const addFriendCommandType = "addFriend";
export const waitForMsCommandType = "waitForMs";
export const restartConversationAfterCommandType = "restartConversationAfter";
export const txt2ImageCommandType = "txt2Image";
export const loadImageFromUrlCommandType = "loadImageFromUrl";
export const openPosthogSurveyCommandType = "openPosthogSurvey";

// character message types are actions that can be performed by characters (e.g. SAY)
export const normalizeName = name => (name ?? '')
  .trim()
  .replace(/\s+/g, ' ')
  .replace(/[^a-z0-9\s]/ig, '')
  .toUpperCase();
  // .replace(/\s+/g, '_');

//

export const getCompleterGeneratorFn = (makeCompleter) => {
  return ({
    conversation,
    storyManager,
  }) => async () => {
    const limit = conversation.getQueueCapacityRemaining();
    const completer = makeCompleter();
    // this.dispatchEvent(new MessageEvent('completerstart', {
    //   data: {
    //     completer,
    //   },
    // }));
    const signal = conversation.getPreloadSignal();

    // const completion = this.#getCompletion(completer, {
    //   signal: conversation.getCompleteSignal(),
    // });
    const completion = completer.complete({
      // prompt,
      model: storyManager.storyAiModel.getMode(),
      includeLocalPlayer: storyManager.storyPresence.getMode() === 'Actor',
      limit: conversation ?
        conversation.getQueueCapacityRemaining()
      :
        undefined,
      signal,
    });
    for (let i = 0; i < limit; i++) {
      const {
        value: message,
        done,
      } = await completion.next();
      if (done) {
        break;
      } else {
        conversation.queueMessage(message);
      }
    }
  };
}

//

export async function narratePreloadText(text, {
  engine,
  signal,
}) {
  const defaultNarratorVoiceEndpoint = 'elevenlabs:Walter - Intelligent and Resolute:cIzbREfeVYNWky2Hgenc';
  // const defaultNarratorVoiceEndpoint = 'tiktalknet:Discord:1Cg9Oc_K9UDe5WgVDAcaCSbbBoo-Npj1E';

  const settings = engine.worldClient.getSettings();
  const voiceEndpointName = settings?.voiceEndpoint ?? defaultNarratorVoiceEndpoint;
  // console.log('got world client', engine.worldClient.getSettings());

  const match = voiceEndpointName.match(/^(.+?):(.+?):(.+?)$/);
  if (match) {
    const [
      _,
      model,
      name,
      voiceId,
    ] = match;

    //

    const {audioManager} = engine;

    const voiceEndpoint = new AutoVoiceEndpoint({
      model,
      voiceId,
    });

    const voicer = new VoiceEndpointVoicer({
      voiceEndpoint,
      audioManager,
    });

    const stream = await voicer.getStream(text, {
      signal,
    });
    await stream.waitForLoad();
    return stream;
  } else {
    console.warn('invalid voice endpoint name', {voiceEndpointName});
  }
}
export async function narrateStream(stream, {
  engine,
  signal,
}) {
  const {audioManager} = engine;
  const {audioContext} = audioManager;

  // console.log('narrate 2.4', {text});

  await engine.voiceQueueManager.waitForTurn(async () => {
    const audioInjectWorkletNode = new AudioInjectWorkletNode({
      audioContext,
    });

    // console.log('narrate 2.5', {text});

    await VoiceEndpointVoicer.streamMp3(stream, {
      audioInjectWorkletNode,
      signal,
      onStart: () => {
        // console.log('narrate 2.6', {text});
        audioInjectWorkletNode.connect(audioContext.gain);
      },
      onEnd: () => {
        // console.log('narrate 2.7', {text});
        audioInjectWorkletNode.disconnect();
      },
    });

    // console.log('narrate 2.8', {text});
  });
}

//

export async function narratePreloadMessage(message, {
  engine,
  signal,
}) {
  if (message.isMajor()) {
    const text = message.toText();

    return await narratePreloadText(text, {
      engine,
      signal,
    });
  } else {
    return null;
  }
}
export async function narrateExecuteMessage(message, {
  engine,
  signal,
  debugLabel = 'anonymous',
}) {
  if (message.isMajor()) {
    // const text = message.toText();
    console.log('narrate start', {
      name: this.name,
      // text,
      debugLabel,
    });

    const stream = await message.waitForPreload();
    if (signal.aborted) return;
    
    // console.log('narrate 1', {stream, text});

    if (stream) {
      // console.log('narrate 2.3', {text});
      await narrateStream(stream, {
        engine,
        signal,
      });
      // console.log('narrate 2.9');
    } else {
      // no stream to play
      await fakePlayMessage(message, {
        signal,
      });
    }

    console.log('narrate end', {
      name: this.name,
      text,
      debugLabel,
    });
  }
}

export const fakePlayMessage = async (message, {
  signal,
}) => {
  // console.log('fake play start');
  
  // playStart(message);

  const text = message.toText();
  await new Promise((accept, reject) => {
    const timeout = setTimeout(() => {
      accept();
      cleanup && cleanup();
    }, 50 * text.length);

    let cleanup = null;
    if (signal) {
      const abort = () => {
        clearTimeout(timeout);
        accept();
        cleanup();
      };
      signal.addEventListener('abort', abort);
      cleanup = () => {
        signal.removeEventListener('abort', abort);
      };
    }
  });

  // console.log('fake play end');
  // playEnd(message);
};
