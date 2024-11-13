const microphoneModes = [
  'None',
  'Chat',
  'Roleplay',
  'Voice',
];

export class MicrophoneManager extends EventTarget {
  constructor() {
    super();
  
    this.mode = microphoneModes[0];
  }
  getMode() {
    return this.mode;
  }
  setMode(mode) {
    this.mode = mode;

    this.dispatchEvent(new MessageEvent('modechange', {
      data: {
        mode,
      },
    }));
  }
}