/*
this file is responsible for managing skybox-based logical world scenes.
*/

import * as THREE from 'three';
// import {
//   OctahedronSphereCreator,
// } from '../../../genesis/index.js';
import physicsManager from '../../physics/physics-manager.js';

//

export class FloorManager {
  constructor({
    physicsTracker,
  }) {
    this.physicsTracker = physicsTracker;

    this.floorPlanePhysicsObject = null;
    // this.live = true;
    this.enabled = true;
  }
  isEnabled() {
    return this.enabled;
  }
  enableFloor() {
    // console.log('enabled floor plane', this.floorPlanePhysicsObject);
    const physicsScene = physicsManager.getScene();
    physicsScene.enableActor(this.floorPlanePhysicsObject);

    this.enabled = true;
  }
  disableFloor() {
    const physicsScene = physicsManager.getScene();
    physicsScene.disableActor(this.floorPlanePhysicsObject);

    this.enabled = false;
  }
  async waitForLoad() {
    await physicsManager.waitForLoad();
    // if (!this.live) return;

    const physicsScene = physicsManager.getScene();
    const floorPlanePhysicsObject = physicsScene.addPlaneGeometry(
      new THREE.Vector3(0, 0, 0),
      new THREE.Quaternion(0, 0, 0.7071067811865475, 0.7071067811865476),
      false
    );
    physicsScene.disableGeometryQueries(floorPlanePhysicsObject);
    // console.log('added floor plane', floorPlanePhysicsObject);
    this.floorPlanePhysicsObject = floorPlanePhysicsObject;
    // console.log('added floor plane', this.floorPlanePhysicsObject);
  }
  /* destroy() {
    this.live = false;

    // console.log('destroy floor plane', this.floorPlanePhysicsObject);
    if (this.floorPlanePhysicsObject) {
      const physicsScene = physicsManager.getScene();
      physicsScene.removeGeometry(this.floorPlanePhysicsObject);
      this.floorPlanePhysicsObject = null;
    }
  } */
}