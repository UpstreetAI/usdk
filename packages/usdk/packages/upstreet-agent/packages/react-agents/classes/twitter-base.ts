import { ActiveAgentObject, ConversationObject } from '../types';
import { Player } from 'react-agents-client/util/player.mjs';

export abstract class TwitterBase {
  agent: ActiveAgentObject;
  kv: any;
  codecs: any;
  jwt: string;
  conversations: Map<string, ConversationObject>;
  abortController: AbortController;

  constructor(agent: ActiveAgentObject, kv: any, codecs: any, jwt: string) {
    if (!agent) throw new Error('Twitter bot requires an agent');
    if (!codecs) throw new Error('Twitter bot requires codecs');
    if (!jwt) throw new Error('Twitter bot requires a jwt');

    this.agent = agent;
    this.kv = kv;
    this.codecs = codecs;
    this.jwt = jwt;
    this.conversations = new Map();
    this.abortController = new AbortController();
  }

  protected makePlayerFromAuthor(author: any): Player {
    const { id, username } = author;
    return new Player(id, {
      name: username,
    });
  }

  abstract start(): Promise<void>;
  abstract destroy(): void;
}