import * as THREE from 'three';

//

export class SpawnManager extends EventTarget {
  constructor({
    engineRenderer,
    cameraManager,
    playersManager,
  }) {
    if (!engineRenderer || !cameraManager || !playersManager) {
      throw new Error('missing required argument');
    }

    super();

    this.engineRenderer = engineRenderer;
    this.cameraManager = cameraManager;
    this.playersManager = playersManager;

    this.spawnPoints = [];
    this.spawned = false;
  }

  getSpawnPoint() {
    if (this.spawnPoints.length > 0) {
      return this.spawnPoints[0];
    } else {
      return null;
    }
  }
  getSpawnPoints() {
    return this.spawnPoints;
  }
  setSpawnPoint(position, quaternion) {
    const spawnPoint = {
      position,
      quaternion,
    };
    this.spawnPoints.push(spawnPoint);
    return spawnPoint;
  }
  unsetSpawnPoint(spawnPoint) {
    const index = this.spawnPoints.indexOf(spawnPoint);
    if (index !== -1) {
      this.spawnPoints.splice(index, 1);
    } else {
      throw new Error('cannot unset spawn point');
    }
  }

  async spawn({
    quaternion = false,
  } = {}) {
    const localPlayer = this.playersManager.getLocalPlayer();
    // if the avatar was not set, we'll need to set the spawn again when it is
    if (!localPlayer.avatar) {
      await new Promise((accept, reject) => {
        localPlayer.addEventListener('avatarchange', e => {
          const {avatar} = e;
          if (avatar) {
            accept();
          }
        });
      });
    }
    const {height} = localPlayer.avatar;
    const spawnPoint = this.getSpawnPoint();
    const playerSpawnPosition = (spawnPoint ? spawnPoint.position.clone() : new THREE.Vector3())
      .add(
        new THREE.Vector3(0, height, 0)
      );
    localPlayer.characterPhysics.setPosition(playerSpawnPosition);

    if (quaternion) {
      const {
        camera,
      } = this.engineRenderer;
      const playerSpawnQuaternion = (spawnPoint ? spawnPoint.quaternion.clone() : new THREE.Quaternion());
      localPlayer.quaternion.copy(playerSpawnQuaternion);

      // this is needed to prevenr the camera from resetting the player position
      camera.quaternion.copy(playerSpawnQuaternion);
      this.cameraManager.targetQuaternion.copy(playerSpawnQuaternion);
    }

    this.spawned = true;
    this.dispatchEvent(new MessageEvent('spawn'));
  }

  async waitForSpawn() {
    if (!this.spawned) {
      await new Promise((accept, reject) => {
        const spawn = e => {
          accept();
          cleanup();
        };
        this.addEventListener('spawn', spawn);
        
        const cleanup = () => {
          this.removeEventListener('spawn', spawn);
        };
      });
    }
  }
}