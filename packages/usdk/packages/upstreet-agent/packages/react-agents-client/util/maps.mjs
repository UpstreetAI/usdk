export class TypingMap extends EventTarget {
  #internalMap = new Map(); // playerId: string -> { userId: string, name: string, typing: boolean }
  getMap() {
    return this.#internalMap;
  }
  set(playerId, spec) {
    this.#internalMap.set(playerId, spec);
    this.dispatchEvent(new MessageEvent('typingchange', {
      data: spec,
    }));
  }
  clear() {
    for (const [playerId, spec] of this.#internalMap) {
      this.dispatchEvent(new MessageEvent('typingchange', {
        data: spec,
      }));
    }
    this.#internalMap.clear();
  }
}
export class SpeakerMap extends EventTarget {
  #internalMap = new Map(); // playerId: string -> boolean
  #localSpeaking = false;
  #lastSpeakers = false;
  getMap() {
    return this.#internalMap;
  }
  set(playerId, speaking) {
    this.#internalMap.set(playerId, speaking);
    this.dispatchEvent(new MessageEvent('speakingchange', {
      data: {
        playerId,
        speaking,
      },
    }));

    const currentSpeakers = Array.from(this.#internalMap.values()).some(Boolean);
    if (currentSpeakers && !this.#lastSpeakers) {
      this.dispatchEvent(new MessageEvent('playingchange', {
        data: true,
      }));
    } else if (!currentSpeakers && this.#lastSpeakers) {
      this.dispatchEvent(new MessageEvent('playingchange', {
        data: false,
      }));
    }
    this.#lastSpeakers = currentSpeakers;
  }
  getLocal() {
    return this.#localSpeaking;
  }
  setLocal(speaking) {
    this.#localSpeaking = speaking;
    this.dispatchEvent(new MessageEvent('localspeakingchange', {
      data: {
        speaking,
      },
    }));
  }
  clear() {
    for (const [playerId, speaking] of this.#internalMap) {
      this.dispatchEvent(new MessageEvent('speakingchange', {
        data: {
          playerId,
          speaking,
        },
      }));
    }
    this.#internalMap.clear();
    this.#lastSpeakers = false;
  }
}