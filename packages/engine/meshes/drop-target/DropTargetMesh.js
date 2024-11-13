import * as THREE from 'three';

//

const getArrowGeometry = (() => {
  let geometry = null;
  return () => {
    if (geometry === null) {
      const shape = new THREE.Shape();
    }
    return geometry;
  };
})();
const getBaseGeometry = (() => {
  let geometry = null;
  return () => {
    if (geometry === null) {
      geometry = new THREE.TorusBufferGeometry(0.5, 0.15, 3, 5);
    }
    return geometry;
  };
})();

//

class DropTargetMaterial extends THREE.ShaderMaterial {
  constructor() {
    super({

    });
  }
}

//

export class DropTargetMesh extends THREE.Object3D {
  constructor() {
    super();

    const arrowGeometry = getArrowGeometry();
    const arrowMaterial = new DropTargetMaterial();
    const arrowMesh = new THREE.Mesh(arrowGeometry, arrowMaterial);
    this.add(arrowMesh);

    const baseGeometry = getBaseGeometry();
    const baseMaterial = new DropTargetMaterial();
    const baseMesh = new THREE.Mesh(baseGeometry, baseMaterial);
    this.add(baseMesh);
  }
  update() {
    // XXX
  }
  // destroy() {
  //   for (const child of this.children) {
  //     child.geometry.dispose();
  //     child.material.dispose();
  //   }
  // }
}