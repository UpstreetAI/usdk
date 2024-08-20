export class SceneObject extends EventTarget {
  name: string;
  description: string;
  constructor({
    name = '',
    description = '',
  } = {}) {
    super();

    this.name = name;
    this.description = description;
  }
}