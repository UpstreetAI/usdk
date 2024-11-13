import {makeId, makePromise} from '../util.js';

//

export class MultiArray extends Array {
  constructor(array) {
    super();

    this.subArrays = [];

    if (array) {
      const subArray = this.addSubArray();
      subArray.push.apply(subArray, array);
    }
  }

  update() {
    this.length = 0;
    for (let i = 0; i < this.subArrays.length; i++) {
      const subArray = this.subArrays[i];
      this.push.apply(this, subArray);
    }
  }

  addSubArray(id = makeId(8)) {
    const subArray = new MultiArraySubarray(id, this);
    this.subArrays.push(subArray);
    return subArray;
  }

  removeSubArray(subArray) {
    const index = this.subArrays.findIndex(s => s.id === subArray.id);
    if (index !== -1) {
      this.subArrays.splice(index, 1);
      this.update();
    }
  }

  toArray() {
    const result = [];
    for (let i = 0; i < this.subArrays.length; i++) {
      const subArray = this.subArrays[i];
      for (let j = 0; j < subArray.length; j++) {
        const element = subArray[j];
        result.push(element);
      }
    }
    return result;
  }
  map() {
    const result = this.toArray();
    return result.map.apply(result, arguments);
  }
  slice() {
    const result = this.toArray();
    return result.slice.apply(result, arguments);
  }

  clone() {
    const result = new MultiArray();
    for (let i = 0; i < this.subArrays.length; i++) {
      const subArray = this.subArrays[i];
      const subArray2 = result.addSubArray(subArray.id);
      for (let j = 0; j < subArray.length; j++) {
        const v = subArray[j];
        Array.prototype.push.call(subArray2, v);
      }
    }
    result.update();
    return result;
  }
}

export class MultiArraySubarray extends Array {
    constructor(id, parent) {
      super();
  
      this.id = id;
      this.parent = parent;
    }
  
    push() {
      const result = super.push.apply(this, arguments);
      this.parent.update();
      return result;
    }
  
    pop() {
      const result = super.pop();
      this.parent.update();
      return result;
    }
  
    splice() {
      const result = super.splice.apply(this, arguments);
      this.parent.update();
      return result;
    }
  
    clone() {
      const result = new MultiArraySubarray(this.id, this.parent);
      result.push.apply(result, this);
      return result;
    }
  }