import * as THREE from 'three';

//

const localVector = new THREE.Vector3();
const localVector2 = new THREE.Vector3();
const localQuaternion = new THREE.Quaternion();
const localQuaternion2 = new THREE.Quaternion();

//

class Track {
  constructor({
    name,
    type,
    times,
    values,
    bone,
    hipHeight,
  }) {
    this.name = name;
    this.type = type;
    this.times = times;
    this.values = values;
    this.bone = bone;
    this.hipHeight = hipHeight;

    // this.currentTimestamp = 0;
    this.currentIndex = 0;
  }
  forward(timestamp) {
    // advance this.currentIndex to the next timestamp
    for (let i = this.currentIndex; i < this.times.length; i++) {
      const time = this.times[i];
      if (timestamp < time) {
        // this.currentIndex = i;
        break;
      } else {
        this.currentIndex = i;
      }
    }

    return this.currentIndex < this.times.length;
  }
  apply(timestamp) {
    // const {bone, values, currentIndex} = this;
    // const value = values[currentIndex];
    // bone.quaternion.fromArray(value);

    const {
      currentIndex,
    } = this;
    const nextIndex = currentIndex < this.times.length ? (currentIndex + 1) : currentIndex;

    // lerp
    const currentTime = this.times[currentIndex];
    const nextTime = this.times[nextIndex];
    const factor = (timestamp - currentTime) / (nextTime - currentTime);

    if (this.type === 'quaternion') {
      this.bone.quaternion.slerpQuaternions(
        localQuaternion.fromArray(this.values, currentIndex * 4),
        localQuaternion2.fromArray(this.values, nextIndex * 4),
        factor
      );
    } else if (this.type === 'position') {
      this.bone.position.lerpVectors(
        localVector.fromArray(this.values, currentIndex * 3),
        localVector2.fromArray(this.values, nextIndex * 3),
        factor
      ).multiplyScalar(0.01);
      // console.log('position', this.bone.position.toArray());

      const {
        x,
        y,
        z,
      } = this.bone.position;
      this.bone.position.x *= -1;
      // this.bone.position.z *= -1;
      this.bone.position.y = z;
      this.bone.position.z = y;

      // this.bone.position.y -= this.hipHeight;

      // this.bone.position.x = z;
      // this.bone.position.z = y;
      // this.bone.position.y = z;

      // this.bone.position.y = 0;
    }
  }
}

const makeFbxAnimator = ({
  fbxSrc,
  skeleton,
  modelBones,
}) => {
  // const fbxLoader = new FBXLoader();

  //

  // const fbxDst = await new Promise((accept, reject) => {
  //   fbxLoader.load('./public/animations/cry.fbx', accept, function onprogress() {}, reject);
  // });
  // const dstAnimation = fbxDst.animations[0];

  //

  // const fbxSrc = await new Promise((accept, reject) => {
  //   fbxLoader.load('./public/edge.fbx', accept, function onprogress() {}, reject);
  // });
  const srcAnimation = fbxSrc.animations[0];
  // console.log('got fbx animation', {
  //   srcAnimation,
  // });

  //

  // const {skeleton} = vrm;
  const {bones} = skeleton;
  // console.log('got bones', bones.map(b => b.name).join('\n'));

  //

  const hipHeight = localVector.setFromMatrixPosition(modelBones.Hips.matrixWorld).y;
  // console.log('hip height', hipHeight, modelBones.Hips.position.toArray());

  //

  const boneMapping = {
    m_avg_root: null,
    Armature: null,

    m_avg_Pelvis: 'Hips',
    m_avg_Spine1: 'Spine',
    m_avg_Spine2: 'Chest',
    // m_avg_Spine3: 'Spine2',
    m_avg_Spine3: null,

    m_avg_Neck: 'Neck',
    m_avg_Head: 'Head',

    m_avg_L_Hip: 'UpperLegL',
    m_avg_L_Knee: 'LowerLegL',
    m_avg_L_Ankle: 'FootL',
    m_avg_L_Foot: 'ToeL',

    m_avg_R_Hip: 'UpperLegR',
    m_avg_R_Knee: 'LowerLegR',
    m_avg_R_Ankle: 'FootR',
    m_avg_R_Foot: 'ToeR',

    m_avg_L_Collar: 'ShoulderL',
    m_avg_L_Shoulder: 'UpperArmL',
    m_avg_L_Elbow: 'LowerArmL',
    m_avg_L_Wrist: 'WristL',
    m_avg_L_Hand: null,

    m_avg_R_Collar: 'ShoulderR',
    m_avg_R_Shoulder: 'UpperArmR',
    m_avg_R_Elbow: 'LowerArmR',
    m_avg_R_Wrist: 'WristR',
    m_avg_R_Hand: null,
  };
  // mao keys for female as well
  let expectedNumMatches = 0;
  for (const k in boneMapping) {
    if (k.startsWith('m_')) {
      const k2 = k.replace(/^m_/g, 'f_');
      const v2 = boneMapping[k];
      boneMapping[k2] = v2;
    }
    expectedNumMatches++;
  }
  // console.log('got bone mapping', boneMapping);

  /* const findDstTrack = (srcName, type) => {
    if (srcName === null) {
      debugger;
    }

    const dstName = boneMapping[srcName];
    if (dstName) {
      const fullName = dstName + '.' + type;
      const dstTrack = dstAnimation.tracks.find(track => track.name === fullName);
      if (!dstTrack) {
        console.log('all track names', dstAnimation.tracks.map(track => track.name));
        throw new Error('failed to find dst track for ' + fullName);
      }
      return dstTrack;
    } else if (dstName === null) {
      // skip
      return null;
    } else {
      console.warn('failed to find dst track for ' + srcName + ' ' + type);
      throw new Error('failed to find dst track for ' + srcName + ' ' + type);
      // return null;
    }
  }; */

  const findDstBoneInVrm = (srcName, fullName) => {
    const dstName = boneMapping[srcName];
    if (dstName) {
      // const dstBone = vrm.humanoid.getBoneNode(dstName);
      const dstBone = bones.find(bone => bone.name === dstName);
      if (!dstBone) {
        throw new Error('failed to find dst bone for ' + fullName);
      }
      return dstBone;
    } else if (dstName === null) {
      // skip
      return null;
    } else {
      throw new Error('failed to find dst bone for ' + fullName);
    }
  };

  const tracks = [];

  let numMatches = 0;
  for (let i = 0; i < srcAnimation.tracks.length; i++) {
    const srcTrack = srcAnimation.tracks[i];

    const fullName = srcTrack.name;
    const match = fullName.match(/^(.+)\.(.+)$/);
    const name = match[1];
    const type = match[2];

    const {times, values} = srcTrack;

    if (['position', 'quaternion'].includes(type)) {
      const dstBone = findDstBoneInVrm(name, fullName);
      if (dstBone || dstBone === null) {
        if (type === 'quaternion') {
          numMatches++;
        }

        if (dstBone !== null) {
          if (type === 'position') {
            if (/pelvis/i.test(name)) {
              // console.log('position track', fullName, {times, values});
              const track = new Track({
                name: fullName,
                type,
                times,
                values,
                bone: dstBone,
                hipHeight,
              });
              tracks.push(track);
            }
          } else if (type === 'quaternion') {
            const track = new Track({
              name: fullName,
              type,
              times,
              values,
              bone: dstBone,
              hipHeight,
            });
            tracks.push(track);
          }
        }
      }
    } else {
      // skip
    }
  }

  if (numMatches !== expectedNumMatches) {
    throw new Error('failed to match all tracks to bones: ' + numMatches + ' ' + expectedNumMatches);
  }

  // timestamp in seconds
  return (timestamp) => {
    for (let i = 0; i < tracks.length; i++) {
      const track = tracks[i];
      const ok = track.forward(timestamp);
      if (ok) {
        track.apply(timestamp);
      }
      // const {
      //   name,
      //   times,
      //   values,
      //   bone,
      // } = track;
      // bone.quaternion.fromArray(values, times.findIndex(t => t >= timestamp) * 4);
    }

    // skeleton.update();
    // vrm.updateMatrixWorld(true);

    // globalThis.vrm = vrm;
    // globalThis.skeleton = skeleton;
  };
};
const danceManager = {
  makeFbxAnimator,
};
export default danceManager;