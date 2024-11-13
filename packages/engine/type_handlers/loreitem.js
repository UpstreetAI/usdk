import * as THREE from 'three';
// import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';

//

const localVector = new THREE.Vector3();
const localQuaternion = new THREE.Quaternion();

//

let threeUtils = null;
let Text  = null;

export class LoreItemMesh extends THREE.Object3D {
  constructor({
    url,
    name,
    description,
    props,
  }) {
    super();

    {
      const planeGeometry = new THREE.PlaneGeometry(0.5, 0.5);
      const planeGeometryBack = planeGeometry.clone()
        .applyMatrix4(new THREE.Matrix4().makeRotationY(Math.PI));
      const {BufferGeometryUtils} = threeUtils;
      const geometry = BufferGeometryUtils.mergeBufferGeometries([
        planeGeometry,
        planeGeometryBack,
      ]);
      const imageTexture = new THREE.TextureLoader().load(url);
      const imageMaterial = new THREE.MeshBasicMaterial({
        map: imageTexture,
      });
      
      const mesh = new THREE.Mesh(geometry, imageMaterial);
      // mesh.side = THREE.DoubleSide;
      this.add(mesh);
      this.mesh = mesh;
    }

    {
      const nameText = new Text();
      nameText.text = name;
      nameText.sync();
      this.add(nameText);
      this.nameText = nameText;

      const descriptionText = new Text();
      // console.log('descriptionText', descriptionText);
      descriptionText.maxWidth = 1;
      // descriptionText.whiteSpace = 'normal';
      // descriptionText.overflowWrap = 'break-word';
      descriptionText.text = description;
      descriptionText.sync();
      descriptionText.position.y += 1;
      this.add(descriptionText);
      descriptionText.updateMatrixWorld();
      this.descriptionText = descriptionText;
    }

    this.timeFactorOffset = Math.random();
  }
  update(timestamp) {
    const maxTime = 2000;
    let f = timestamp / maxTime;
    f += this.timeFactorOffset;
    
    const quaternion = localQuaternion.setFromAxisAngle(
      localVector.set(0, 1, 0),
      f * Math.PI * 2
    );
    this.mesh.quaternion.copy(quaternion);
    this.mesh.updateMatrixWorld();
  }
}

//

export default ctx => {
  const {
    useApp,
    useRenderer,
    useCamera,
    createAppManager,
    useLocalPlayer,
    useCleanup,
    useThreeUtils,
    useText,
  } = ctx;

  {
    threeUtils = useThreeUtils();
    Text = useText();
  }

  const app = useApp();

  const srcUrl = ${this.srcUrl};

  ctx.waitUntil((async () => {
    const res = await fetch(srcUrl);
    const json = await res.json();

    const {
      url,
      name,
      description,
      prompt,
    } = json;

    const loreItemMesh = new LoreItemMesh({
      url,
      name,
      description,
      prompt,
    });
    app.add(loreItemMesh);
    loreItemMesh.updateMatrixWorld();

    app.update = (timestamp) => {
      loreItemMesh.update(timestamp);
    };
  })());

  return app;
};
export const contentId = ${this.contentId};
export const name = ${this.name};
export const description = ${this.description};
export const type = 'loreitem';
export const components = ${this.components};