export const actorTypes = [
  'character',
  'object',
];
export class Actor {
  constructor({
    id,
    type,
    spec,
    object,
  }) {
    if (typeof id !== 'string') {
      throw new Error('invalid id');
    }
    if (!actorTypes.includes(type)) {
      throw new Error('invalid type');
    }
    if (typeof spec?.name !== 'string') {
      throw new Error('invalid spec.name');
    }
    if (typeof object !== 'object') {
      throw new Error('invalid object');
    }

    this.isActor = true;

    this.id = id;
    this.type = type;
    this.spec = spec;
    this.object = object;
  }
}