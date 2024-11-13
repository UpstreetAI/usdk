import {
  Actor,
} from './actor.js';
import {
  normalizeName,
} from './util.js';
import {
  heading,
  underline,
  ensureNewline,
} from '../../util.js';
import {
  contentRatings,
  contentRatingDefault,
} from '../story/story-manager.js';

//

export class LoreBinding {
  constructor({
    name,
    type,
    value,
  }) {
    this.name = name;
    this.type = type;
    this.value = value;
  }
}

//

export class Lore extends EventTarget {
  constructor({
    names = [],
    descriptions = [],
    contentRating = contentRatingDefault,
    actors = new Map(),
    locations = [],
    loreItems = [],
  } = {}) {
    super();

    this.#names = names;
    this.#descriptions = descriptions;
    this.#contentRating = contentRating;
    this.#actors = structuredClone(actors);
    this.#locations = structuredClone(locations);
    this.#loreItems = structuredClone(loreItems);
  }
  #names;
  #descriptions;
  #contentRating;
  #actors;
  #locations;
  #loreItems;

  /* clone() {
    return new Lore({
      actors: this.#actors,
      settings: this.#settings,
      directors: this.#directors,
      loreItems: this.#loreItems,
    });
  } */

  /* static #getActorMessage(actor) {
    if (actor.type === 'character') {
      return {
        role: 'user',
        content: `\
Character actor added:
Name: ${JSON.stringify(actor.spec.name)}
${actor.spec.description ? `Description: ${actor.spec.description}` : ''}
${actor.spec.personality ? `Personality: ${actor.spec.personality}` : ''}
`,
      };
    } else if (actor.type === 'object') {
      return {
        role: 'user',
        content: `\
Object actor added:
Name: ${JSON.stringify(actor.spec.name)}
${actor.spec.description ? `Description: ${actor.spec.description}` : ''}
`,
      };
    } else {
      throw new Error('invalid actor type');
    }
  }
  static #getSettingMessage(setting) {
    return {
      role: 'user',
      content: `\
Setting changed:
${setting}
`,
    };
  }
  static #getDirectorMessage(director) {
    console.log('get director message', setting);
    debugger;
    return {
    };
  }
  static #getLoreItemMessage(loreItem) {
    return {
      role: 'user',
      content: `\
Lore added:
${loreItem}
`,
    };
  } */
  getContent({
    playersBlacklist = [],
  } = {}) {
    let result = '';

//     if (this.#names.length > 0) {
//       const name = this.#names[0].value;
//       result += `\
// Title: ${name ?? '(none)'}
// `;
//     }
    if (this.#descriptions.length > 0) {
      const description = this.#descriptions[0].value;
      result += `\
Premise: ${description ?? '(none)'}

`;
    }

    if (this.#contentRating) {
      result += `\
Content rating: ${contentRatings[this.#contentRating]}

`;
    }

    const locations = this.#locations;
    if (locations.length > 0) {
      result += `\
Locations:

`;
      for (const location of locations) {
        result += `\
${normalizeName(location.spec.name)}${location.spec.description ? ` - ${location.spec.description}` : ''}
`;
      }
    }

    const characterActors = Array.from(this.#actors.values())
      .filter(a => a.type === 'character')
      .filter(a => !playersBlacklist.includes(a.object));
    if (characterActors.length > 0) {
      result += `\
Characters:

`;
      for (const actor of characterActors) {
        result += `\
${normalizeName(actor.spec.name)}${actor.spec.description ? `, ${actor.spec.description}` : ''}
${actor.spec.personality ? ensureNewline(actor.spec.personality) : ''}\
${actor.spec.first_mes ? ensureNewline(actor.spec.first_mes.replace(/\n+/g, ' ')) : ''}\

`;
      }
    }

    const propActors = Array.from(this.#actors.values()).filter(a => a.type === 'object');
    if (propActors.length > 0) {
      result += `\
Props:

`;
      for (const actor of propActors) {
        result += `\
${normalizeName(actor.spec.name)}${actor.spec.description ? `, ${actor.spec.description}` : ''}

`;
      }
    }

    return result;
  }
  getBindables() {
    const bindables = Array.from(this.#actors.values())
      .map(actor => {
        return new LoreBinding({
          name: normalizeName(actor.spec.name),
          type: actor.type,
          value: actor,
        });
      }).concat(
        this.#locations.map(location => {
          return new LoreBinding({
            name: normalizeName(location.name),
            type: 'location',
            value: location,
          });
        })
      );
    return bindables;
  }
  getBindablesByType(bindingTypes) {
    if (!Array.isArray(bindingTypes)) {
      bindingTypes = [bindingTypes];
    }
    const bindables = this.getBindables()
      .filter(bindingCandidate => bindingTypes.includes(bindingCandidate.type));
    return bindables;
  }
  // returns the bindables extracted from the text, filtered by the allowed binding types
  bindFilter(filterFn) {
    return this.getBindables().filter(filterFn);
  }
  bindNameSpec(text, allowedBindingTypes) {
    return this.bindFilter(text, bindable => {
      if (allowedBindingTypes.includes(bindable.type)) {
        const index = text.indexOf(bindable.name);
        if (index !== -1) {
          text = text.slice(0, index) + text.slice(index + firstBindable.name.length);
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    });
  }
  /* getInitialLoreMessages() {
    const messages = [];

    for (const actor of this.#actors.values()) {
      const m = Lore.#getActorMessage(actor);
      messages.push(m);
    }
    for (const setting of this.#settings) {
      const m = Lore.#getSettingMessage(setting);
      messages.push(m);
    }
    for (const director of this.#directors) {
      const m = Lore.#getDirectorMessage(director);
      messages.push(m);
    }
    for (const loreItem of this.#loreItems) {
      const m = Lore.#getLoreItemMessage(loreItem);
      messages.push(m);
    }

    return messages;
  } */

  /* toJSON() {
    return {
      actors: Array.from(this.#actors.values())
        .map(actor => actor.toJSON()),
      settings: this.#settings,
      loreItems: this.#loreItems,
    };
  } */

  //

  getActorById(actorId) {
    return this.#actors.get(actorId) ?? null;
  }
  getActorByName(name) {
    const actors = this.getActors();
    const actor = actors.find(actor => actor.spec.name === name);
    if (actor) {
      return actor;
    } else {
      return null;
    }
  }
  getActorByNormalizedName(normalizedName) {
    const actors = this.getActors();
    const actor = actors.find(actor => normalizeName(actor.spec.name) === normalizedName);
    if (actor) {
      return actor;
    } else {
      return null;
    }
  }
  getActors() {
    return Array.from(this.#actors.values());
  }
  addActor(actor) {
    // const previewUrl = actor.spec?.previewUrl;
    // if (!previewUrl) {
    //   console.log('missing actor previewUrl', actor);
    // }

    // if (actor.type === 'character' && !actor.object.playerApp) {
    //   console.log('adding invalid character actor', actor);
    //   debugger;
    // }

    this.#actors.set(actor.id, actor);

    this.dispatchEvent(new MessageEvent('actorsupdate', {}));
  }
  removeActor(actor) {
    if (!(actor instanceof Actor)) {
      throw new Error('invalid actor');
    }

    if (this.#actors.has(actor.id)) {
      this.#actors.delete(actor.id);
      this.dispatchEvent(new MessageEvent('actorsupdate', {}));
    } else {
      throw new Error('actor not found');
    }
  }

  //

  getName() {
    return this.#names[0]?.value ?? null;
  }
  addName(name) {
    this.#names.push(name);
    this.dispatchEvent(new MessageEvent('nameupdate', {}));
  }
  removeName(name) {
    const index = this.#names.indexOf(name);
    if (index !== -1) {
      this.#names.splice(index, 1);
    } else {
      console.warn('name not found', name);
    }

    this.dispatchEvent(new MessageEvent('nameupdate', {}));
  }

  getDescription() {
    return this.#descriptions[0]?.value ?? null;
  }
  addDescription(description) {
    this.#descriptions.push(description);
    this.dispatchEvent(new MessageEvent('descriptionupdate', {}));
  }
  removeDescription(description) {
    const index = this.#descriptions.indexOf(description);
    if (index !== -1) {
      this.#descriptions.splice(index, 1);
    } else {
      console.warn('description not found', description);
    }

    this.dispatchEvent(new MessageEvent('descriptionupdate', {}));
  }

  getContentRating() {
    return this.#contentRating;
  }
  setContentRating(contentRating) {
    this.#contentRating = contentRating;
    this.dispatchEvent(new MessageEvent('contentratingupdate', {}));
  }

  //

  getLoreItems() {
    return this.#loreItems;
  }
  addLoreItem(loreItem) {
    this.#loreItems.push(loreItem);

    this.dispatchEvent(new MessageEvent('loreitemsupdate', {}));
  }
  removeLoreItem(loreItem) {
    const index = this.#loreItems.indexOf(loreItem);
    if (index !== -1) {
      this.#loreItems.splice(index, 1);
    } else {
      console.warn('lore item not found', loreItem);
    }

    this.dispatchEvent(new MessageEvent('loreitemsupdate', {}));
  }

  //

  getLocations() {
    return this.#locations.slice();
  }
  addLocation(location) {
    this.#locations.push(location);

    this.dispatchEvent(new MessageEvent('locationsupdate', {}));
  }
  removeLocation(location) {
    const index = this.#locations.indexOf(location);
    if (index !== -1) {
      this.#locations.splice(index, 1);

      this.dispatchEvent(new MessageEvent('locationsupdate', {}));
    } else {
      console.warn('location not found', location);
    }
  }

  //

  // addDirector(director) {
  //   this.#directors.push(director);
  // }
  // getDirector() {
  //   return this.#directors[this.#directors.length - 1] ?? null;
  // }
  // removeDirector(director) {
  //   const index = this.#directors.indexOf(director);
  //   if (index !== -1) {
  //     this.#directors.splice(index, 1);
  //   } else {
  //     console.warn('director not found', director);
  //   }
  // }
}
