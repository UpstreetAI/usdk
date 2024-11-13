// import {
//   ZineData,
// } from '../zine/zine-format.js';

import {makeId} from './util.js';

/**
@typedef {
  {
    type: 'inAir'
    time: number
    isMoving: boolean
  }
  | {
    type: 'skydive'
  }
  | {
    type: 'fallLoop'
    from?: 'jump'
  }
  | {
    type: 'rightHand'
  }
  | {
    type: 'leftHand'
  }
} Action
*/

//

export class ActionManager extends EventTarget {
  constructor() {
    super();
  }
  /** @type {Map<Action['type'], Action[]>} */
  #actionByType = new Map();

  /** @type {Map<string, Action>} */
  #actionByActionId = new Map();

  /** @param {Action} action */
  addAction(action) {
    if (typeof action.type !== 'string') {
      console.warn('type must be a string', action);
      debugger;
      throw new Error('invalid action type');
    }

    action = {
      ...action,
    };
    if (action.type === 'facepose' && !action.emotion) {
      console.warn('invalid face pose action...', action);
      debugger;
      throw new Error('invalid face pose action');
    }
    if (action.actionId === undefined) {
      action.actionId = makeId(8);
    }

    let actionTypesArray = this.#actionByType.get(action.type);
    if (!actionTypesArray) {
      actionTypesArray = [];
      this.#actionByType.set(action.type, actionTypesArray);
    }
    actionTypesArray.push(action);

    // if (this.#actionByActionId.has(action.actionId)) {
    //   debugger;
    // }
    this.#actionByActionId.set(action.actionId, action);

    this.dispatchEvent(new MessageEvent('actionadded', {
      data: {
        action,
      },
    }));

    return action;
  }

  /** @param {Action} action */
  removeAction(action) {
    if (!action) {
      console.warn('action must be defined', action);
      debugger;
      throw new Error('invalid action');
    }
    if (typeof action.type !== 'string') {
      console.warn('type must be a string', action);
      debugger;
      throw new Error('invalid action type');
    }

    const actionTypesArray = this.#actionByType.get(action.type);
    if (!actionTypesArray || actionTypesArray.length === 0) {
      debugger;
    }
    const actionIndex = actionTypesArray.indexOf(action);
    if (actionIndex === -1) {
      debugger;
    }
    actionTypesArray.splice(actionIndex, 1);
    if (actionTypesArray.length === 0) {
      this.#actionByType.delete(action.type);
    }

    if (!this.#actionByActionId.has(action.actionId)) {
      debugger;
    }
    this.#actionByActionId.delete(action.actionId);

    this.dispatchEvent(new MessageEvent('actionremoved', {
      data: {
        action,
      },
    }));
  }

  /** @param {Action['type']} type */
  removeActionType(type) {
    if (typeof type !== 'string') {
      console.warn('type must be a string', type);
      debugger;
    }

    // get the first action of the type
    const actionTypesArray = this.#actionByType.get(type);
    if (actionTypesArray) {
      const action = actionTypesArray.shift();
      if (actionTypesArray.length === 0) {
        this.#actionByType.delete(type);
      }

      if (!this.#actionByActionId.has(action.actionId)) {
        debugger;
      }
      this.#actionByActionId.delete(action.actionId);

      this.dispatchEvent(new MessageEvent('actionremoved', {
        data: {
          action,
        },
      }));
    } else {
      debugger;
    }
  }

  /** @param {string} actionId */
  removeActionId(actionId) {
    if (typeof actionId !== 'string') {
      console.warn('action id must be a string', actionId);
      debugger;
    }

    // get the first action of the type
    const action = this.#actionByActionId.get(actionId);
    if (action) {
      this.removeAction(action);

      // const action = actionTypesArray.shift();
      // if (actionTypesArray.length === 0) {
      //   this.#actionByType.delete(type);
      // }

      // if (!this.#actionByActionId.has(action.actionId)) {
      //   debugger;
      // }
      // this.#actionByActionId.delete(action.actionId);

      // this.dispatchEvent(new MessageEvent('actionremoved', {
      //   data: {
      //     action,
      //   },
      // }));
    } else {
      debugger;
    }
  }

  /**
   * @template {Action} T
   * @param {T} action
   * @param {T} updateObject
   */
  updateAction(action, updateObject) {
    for (const k in updateObject) {
      action[k] = updateObject[k];
    }
  }

  /** @param {Action['type']} type */
  getActionType(type) {
    if (typeof type !== 'string') {
      console.warn('type must be a string', type);
      debugger;
    }
    const actionTypesArray = this.#actionByType.get(type);
    if (actionTypesArray) {
      return actionTypesArray[0];
    } else {
      return null;
    }
  }

  /** @param {Action['type']} type */
  hasActionType(type) {
    if (typeof type !== 'string') {
      console.warn('type must be a string', type);
      debugger;
    }
    return this.#actionByType.has(type);
  }

  /** @param {string} actionId */
  hasActionId(actionId) {
    if (typeof actionId !== 'string') {
      console.warn('action id must be a string', actionId);
      debugger;
    }
    return this.#actionByActionId.has(actionId);
  }

  /** @param {(a: Action) => boolean} pred */
  findAction(pred) {
    for (const actionTypesArray of this.#actionByType.values()) {
      for (const action of actionTypesArray) {
        if (pred(action)) {
          return action;
        }
      }
    }
    return null;
  }

  /** @returns {Action[]} */
  getActionsArray() {
    const result = [];
    for (const actionTypesArray of this.#actionByType.values()) {
      for (const action of actionTypesArray) {
        result.push(action);
      }
    }
    return result;
  }
}
