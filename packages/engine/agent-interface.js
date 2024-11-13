export const exposeAgentInterface = ({
  playersManager,
  chatManager,
  loreManager,
}) => {
  globalThis.engineLoaded = undefined;
  globalThis.receiveChat = undefined;
  globalThis.sendChat = (messageSpec) => {
    const localPlayer = playersManager.getLocalPlayer();
    const {
      playerName = localPlayer.playerSpec.name,
      command = '',
      commandArgument = '',
      message = '',
    } = messageSpec;

    if (!command) {
      console.warn('invalid messageSpec', messageSpec);
      throw new Error('missing command in messageSpec');
    }

    const messageSpec2 = {
      playerName,
      command,
      commandArgument,
      message,
    };
    const m = loreManager.createChatMessageFromSpec(messageSpec2);
    chatManager.addMessage(m, {
      source: 'agent',
    });
  };
};
