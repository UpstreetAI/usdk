import * as THREE from 'three';

//

const resizeImage = (image, width) => {
  // Calculate the new height while maintaining the aspect ratio
  const aspectRatio = image.width / image.height;
  const height = width / aspectRatio;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  ctx.drawImage(image, 0, 0, width, height);

  return canvas;
};


//

const left = new THREE.Vector3(-1, 0, 0);
const right = new THREE.Vector3(1, 0, 0);
const up = new THREE.Vector3(0, 1, 0);
const down = new THREE.Vector3(0, -1, 0);
const back = new THREE.Vector3(0, 0, 1);
const forward = new THREE.Vector3(0, 0, -1);

//

const localVector = new THREE.Vector3();
// const localVector2 = new THREE.Vector3();
// const localVector3 = new THREE.Vector3();
// const localVector4 = new THREE.Vector3();
const localVector2D = new THREE.Vector2();
const localVector4D = new THREE.Vector4();

//

/* spec = {
  api_key: `dbBsbOJbJwBMZKYQCBYtCcO3R59vdZaJdSDKphT5hXYwCrSEfFOdBo8KGCav`,
  generator: 'stable',
};
makeSkybox = async () => {
  // u = new URL('https://backend.blockadelabs.com/api/v1/skybox');
  // u.searchParams.set('api_key', spec.api_key);
  // res = await fetch(u);
  // j = await res.json();

  u = new URL('https://backend.blockadelabs.com/api/v1/skybox/submit/3');
  fd = new FormData();
  fd.append('api_key', spec.api_key);
  fd.append('prompt[USER_INPUT_1]', 'japanese school classroom hallway, raining outside');
  res = await fetch(u, {
    method: 'POST',
    body: fd,
  });
  j = await res.json();
  const {
    imaginations,
  } = j;
  const imagination = imaginations[0];
  const {
    id,
  } = imagination;
  return j;
  
  blob = await res.blob();
  img = new Image();
  img.src = URL.createObjectURL(blob);
  img.style.position = 'absolute';
  img.style.top = '0px';
  img.style.left = '0px';
  img.style.width = '512px';
  img.style.zIndex = 10;
  document.body.appendChild(img);
  console.log('got image', img);
  return blob;
};
checkRequests = async (id) => {
  // u = new URL('https://backend.blockadelabs.com/api/v1/imagine/myRequests');
  u = new URL('https://backend.blockadelabs.com/api/v1/imagine/requests/' + id);
  u.searchParams.set('api_key', spec.api_key);
  res = await fetch(u);
  j = await res.json();
  const {
    request,
  } = j;
  const {
    file_url,
  } = request;
  return j;
}; */

//

function bilinearInterpolate(
  values,
  width,
  height,
  px,
  pz,
) {
  // first, compute the sample coordinates:
  const x = Math.floor(px * (width - 1));
  const z = Math.floor(pz * (height - 1));
  const x1 = Math.min(x + 1, width - 1);
  const z1 = Math.min(z + 1, height - 1);
  const index = z * width + x;
  const index1 = z * width + x1;
  const index2 = z1 * width + x;
  const index3 = z1 * width + x1;
  
  // then, compute the interpolation coefficients:
  const fx = px * width - x;
  const fz = pz * height - z;
  const fx1 = 1 - fx;
  const fz1 = 1 - fz;

  // finally, interpolate:
  const v = (
    values[index] * fx1 * fz1 +
    values[index1] * fx * fz1 +
    values[index2] * fx1 * fz +
    values[index3] * fx * fz
  );
  return v;
}

//

// const invertGeometry = geometry => {
//   for (let i = 0; i < geometry.index.count; i += 3) {
//     const a = geometry.index.array[i];
//     const b = geometry.index.array[i + 1];
//     const c = geometry.index.array[i + 2];
//     geometry.index.array[i] = c;
//     geometry.index.array[i + 1] = b;
//     geometry.index.array[i + 2] = a;
//   }
//   return geometry;
// };

//

// const defaultLevel = 6;
const defaultLevel = 7;
const defaultRadius = 1.;

export class OctahedronSphereCreator {
	static directions = [
		left,
		back,
		right,
		forward,
	];

	static Create({
		subdivisions = defaultLevel,
		radius = defaultRadius,
		width,
		height,
		depthFloats,
	} = {}) {
    if (width === undefined || height === undefined || depthFloats === undefined) {
			debugger;
		}
		if (depthFloats.length !== width * height) {
			debugger;
		}

		if (subdivisions < 0) {
			subdivisions = 0;
		}

		const resolution = 1 << subdivisions;
		const vertices = new Float32Array(((resolution + 1) * (resolution + 1) * 4 - (resolution * 2 - 1) * 3) * 3);
		const triangles = new Uint32Array((1 << (subdivisions * 2 + 3)) * 3);
		this.#CreateOctahedron(vertices, triangles, resolution);

		const normals = new Float32Array(vertices.length);
		this.#Normalize(vertices, normals);

		const uv = new Float32Array(vertices.length / 3 * 2);
		this.#CreateUV(vertices, uv);

		const tangents = new Float32Array(vertices.length / 3 * 4);
		this.#CreateTangents(vertices, tangents);

		if (radius != 1.) {
				for (let i = 0; i < vertices.length / 3; i++) {
					localVector.fromArray(vertices, i * 3)
					  .multiplyScalar(radius)
						.toArray(vertices, i * 3);
				}
		}

	  const geometry = new THREE.BufferGeometry();
		geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
		geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
		geometry.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
		geometry.setAttribute('tangent', new THREE.BufferAttribute(tangents, 4));
		geometry.setIndex(new THREE.BufferAttribute(triangles, 1));

		// transform the geometry
		{
			const _Max = 1000.;
			const _Scale = 3.;

			const positions = geometry.attributes.position.array;
			const uvs = geometry.attributes.uv.array;
			for (let i = 0; i < positions.length; i += 3) {
				localVector2D.fromArray(uvs, i / 3 * 2);
				
				let depth = bilinearInterpolate(
					depthFloats,
					width,
					height,
					localVector2D.x,
					localVector2D.y,
				);

				localVector.fromArray(positions, i)
					.multiplyScalar(depth)
					.toArray(positions, i);
			}
		}

		const map = new THREE.Texture();
		map.wrapS = THREE.RepeatWrapping;
		map.wrapT = THREE.RepeatWrapping;
		const material = new THREE.ShaderMaterial({
			uniforms: {
				map: {
					value: map,
					needsUpdate: true,
				},
				depthTex: {
					value: null,
					needsUpdate: false,
				},
				_Min: {
					value: 0,
					needsUpdate: true,
				},
				_Max: {
					value: 1000,
					needsUpdate: true,
				},
				_Scale: {
					value: 10,
					needsUpdate: true,
				},
				width: {
					value: 1,
					needsUpdate: true,
				},
				height: {
					value: 1,
					needsUpdate: true,
				},
			},
			vertexShader: `\
			  uniform sampler2D map;
				uniform sampler2D depthTex;

				uniform float _Min;
				uniform float _Max;
				uniform float _Scale;
				uniform float width;
				uniform float height;

				varying vec2 vUv;

				float _clamp(float x, float minVal, float maxVal) {
					return min(max(x, minVal), maxVal);
				}

				void main() {
					vec2 uv2 = uv;
					vec3 position2 = position;

					// float depth = texture2D(depthTex, uv2).r;
					// depth = _Scale / depth;
					// depth = _clamp(depth, 0., _Max * _Scale);

					// // Vertex displacement (assumes rendering on a unit sphere with radius 1)
					vec4 position3 = projectionMatrix * modelViewMatrix * vec4(position2, 1.0);

					gl_Position = position3;
					vUv = uv2;
				}
			`,
			fragmentShader: `\
			  uniform sampler2D map;
			  varying vec2 vUv;

				void main() {
					gl_FragColor = texture2D(map, vUv);
				}
			`,
		})

		return new THREE.Mesh(geometry, material);
  }
	static #CreateOctahedron(vertices, triangles, resolution) {
		let v = 0, vBottom = 0, t = 0;

		for (let i = 0; i < 4; i++) {
				// vertices[v++] = Vector3.down;
				down.toArray(vertices, (v++) * 3);
		}

		for (let i = 1; i <= resolution; i++) {
				let progress = i / resolution;
				let from, to;
				// vertices[v++] = to = Vector3.Lerp(Vector3.down, Vector3.forward, progress);
				to = down.clone().lerp(forward, progress);
				to.toArray(vertices, (v++) * 3);
				
				for (let d = 0; d < 4; d++) {
						from = to;
						// to = Vector3.Lerp(Vector3.down, directions[d], progress);
						to = down.clone().lerp(this.directions[d], progress);
						t = this.#CreateLowerStrip(i, v, vBottom, t, triangles);
						v = this.#CreateVertexLine(from, to, i, v, vertices);
						vBottom += i > 1 ? (i - 1) : 1;
				}
				vBottom = v - 1 - i * 4;
		}

		for (let i = resolution - 1; i >= 1; i--) {
				let progress = i / resolution;
				let from, to;
				// vertices[v++] = to = Vector3.Lerp(Vector3.up, Vector3.forward, progress);
				to = up.clone().lerp(forward, progress);
				to.toArray(vertices, (v++) * 3);

				for (let d = 0; d < 4; d++) {
						from = to;
						// to = Vector3.Lerp(Vector3.up, directions[d], progress);
						to = up.clone().lerp(this.directions[d], progress);
						t = this.#CreateUpperStrip(i, v, vBottom, t, triangles);
						v = this.#CreateVertexLine(from, to, i, v, vertices);
						vBottom += i + 1;
				}
				vBottom = v - 1 - i * 4;
		}

		for (let i = 0; i < 4; i++) {
				triangles[t++] = vBottom;
				triangles[t++] = v;
				triangles[t++] = ++vBottom;
				// vertices[v++] = Vector3.up;
				up.toArray(vertices, (v++) * 3);
		}
  }

	static #CreateVertexLine(from, to, steps, v, vertices) {
		for (let i = 1; i <= steps; i++) {
			// vertices[v++] = Vector3.Lerp(from, to, i / steps);
			from.clone().lerp(to, i / steps)
				.toArray(vertices, (v++) * 3);
		}
		return v;
  }
  static #CreateLowerStrip(steps, vTop, vBottom, t, triangles) {
		for (let i = 1; i < steps; i++) {
				triangles[t++] = vBottom;
				triangles[t++] = vTop - 1;
				triangles[t++] = vTop;

				triangles[t++] = vBottom++;
				triangles[t++] = vTop++;
				triangles[t++] = vBottom;
		}
		triangles[t++] = vBottom;
		triangles[t++] = vTop - 1;
		triangles[t++] = vTop;
		return t;
  }
  static #CreateUpperStrip(steps, vTop, vBottom, t, triangles) {
		triangles[t++] = vBottom;
		triangles[t++] = vTop - 1;
		triangles[t++] = ++vBottom;
		for (let i = 1; i <= steps; i++) {
			triangles[t++] = vTop - 1;
			triangles[t++] = vTop;
			triangles[t++] = vBottom;

			triangles[t++] = vBottom;
			triangles[t++] = vTop++;
			triangles[t++] = ++vBottom;
		}
		return t;
  }
  static #Normalize(vertices, normals) {
		for (let i = 0; i < vertices.length / 3; i++) {
			localVector.fromArray(vertices, i * 3).normalize();
			localVector.toArray(normals, i * 3);
			localVector.toArray(vertices, i * 3);
			// normals[i] = vertices[i] = vertices[i].normalized;
		}
  }
	static #CreateUV(vertices, uv) {
		// let previousX = 1;
		for (let i = 0; i < vertices.length / 3; i++) {
			const v = localVector.fromArray(vertices, i * 3);
			// if (v.x == previousX) {
			// 	// uv[i - 1].x = 1;
			// 	uv[(i - 1) * 2] = 1;
			// }
			// previousX = v.x;
			let textureCoordinates = localVector2D;
			textureCoordinates.x = Math.atan2(v.x, v.z) / (-2 * Math.PI);
			if (textureCoordinates.x < 0) {
				textureCoordinates.x += 1;
			}
			if (textureCoordinates.x > 1) {
				textureCoordinates.x -= 1;
			}
			let y = v.y;
			if (y < -1) {
				y += 1;
			}
			if (y > 1) {
				y -= 1;
			}
			textureCoordinates.y = Math.asin(v.y) / Math.PI + 0.5;
			// textureCoordinates.y = Math.asin(Math.min(Math.max(v.y, -0.99), 0.99)) / Math.PI + 0.5;
			// if (textureCoordinates.y < 0) {
			// 	textureCoordinates.y += 1;
			// }
			// if (textureCoordinates.y > 1) {
			// 	textureCoordinates.y -= 1;
			// }
			// uv[i * 2] = textureCoordinates;
			textureCoordinates.toArray(uv, i * 2);
		}
		uv[(vertices.length / 3 - 4) * 2] = uv[0 * 2] = 0.125;
		uv[(vertices.length / 3 - 3) * 2] = uv[1 * 2] = 0.375;
		uv[(vertices.length / 3 - 2) * 2] = uv[2 * 2] = 0.625;
		uv[(vertices.length / 3 - 1) * 2] = uv[3 * 2] = 0.875;

		// const nans = uv.filter((v) => isNaN(v));
		// if (nans.length > 0) {
		// 	debugger;
		// }
  }
  static #CreateTangents(vertices, tangents) {
		for (let i = 0; i < vertices.length / 3; i++) {
				// THREE.Vector3 v = vertices[i];
				const v = localVector.fromArray(vertices, i * 3);
				v.y = 0.;
				// v = v.normalized;
				// const oldV = v.clone();
				// if (isNaN(v.x) || isNaN(v.y) || isNaN(v.z)) {
				// 	debugger;
				// }
				if (v.lengthSq() !== 0) {
					v.normalize();
				}
				// console.log('got old v', v, oldV);
				// if (isNaN(v.x) || isNaN(v.y) || isNaN(v.z)) {
				// 	debugger;
				// }

				// Vector4 tangent;
				const tangent = localVector4D;
				tangent.x = -v.z;
				tangent.y = 0.;
				tangent.z = v.x;
				tangent.w = -1.;
				// tangents[i] = tangent;
				tangent.toArray(tangents, i * 4);
				// if (tangents.filter(n => isNaN(n)).length > 0) {
				// 	debugger;
				// }
		}

		// tangents[vertices.length - 4] = tangents[0] = new THREE.Vector3(-1., 0, -1.).normalized;
		localVector.set(-1., 0, -1.).normalize();
		localVector.toArray(tangents, (vertices.length / 3 - 4) * 4);
		localVector.toArray(tangents, 0 * 4);
		// tangents[vertices.length - 3] = tangents[1] = new THREE.Vector3(1., 0., -1.).normalized;
		localVector.set(1., 0., -1.).normalize();
		localVector.toArray(tangents, (vertices.length / 3 - 3) * 4);
		localVector.toArray(tangents, 1 * 4);
		// tangents[vertices.length - 2] = tangents[2] = new THREE.Vector3(1., 0., 1.).normalized;
		localVector.set(1., 0., 1.).normalize();
		localVector.toArray(tangents, (vertices.length / 3 - 2) * 4);
		localVector.toArray(tangents, 2 * 4);
		// tangents[vertices.length - 1] = tangents[3] = new THREE.Vector3(-1., 0., 1.).normalized;
		localVector.set(-1., 0., 1.).normalize();
		localVector.toArray(tangents, (vertices.length / 3 - 1) * 4);
		localVector.toArray(tangents, 3 * 4);

		for (let i = 0; i < 4; i++) {
			// tangents[vertices.length - 1 - i].w = tangents[i].w = -1.;
      tangents[(vertices.length / 3 - 1 - i) * 4 + 3] = tangents[i * 4 + 3] = -1.;
		}
  }
}

//

export default ctx => {
  const {
    useApp,
    usePhysics,
    usePhysicsTracker,
    useFloorManager,
  } = ctx;

  const app = useApp();
  const physics = usePhysics();
  const physicsTracker = usePhysicsTracker();
  const floorManager = useFloorManager();

  const srcUrl = ${this.srcUrl};
  
  ctx.waitUntil((async () => {
    const res = await fetch(srcUrl);
    const json = await res.json();

    // console.log('got json', json);
    // debugger;

    const {
      imgSrc: imgUrl,
      // imgSrcs,
    } = json;

    if (!imgUrl) {
      console.warn('no imgSrc', {json});
      debugger;
    }

    const imgBlob = await (async () => {
      console.log('worldzine fetch image 1', imgUrl);
      const res = await fetch(imgUrl);
      const blob = await res.blob();
      console.log('worldzine fetch image 2', blob.size, imgUrl);
      return blob;
    })();
    const img = await new Promise((accept, reject) => {
      const img = new Image();
      img.onload = () => {
        cleanup();
        accept(img);
      };
      img.onerror = err => {
        cleanup();
        reject(err);
      };
      const u = URL.createObjectURL(imgBlob);
      const cleanup = () => {
        URL.revokeObjectURL(u);
      };
      img.crossOrigin = 'Anonymous';
      img.src = u;
    });
    const imgTexture = new THREE.Texture(img);
    imgTexture.needsUpdate = true;

    // new THREE.TextureLoader().load(imgUrl)

    // octahedron mesh
    // (async () => {
      // const fileName = 'anime_art_style_top_of_a_skyscraper_looking_down_o.jfif';
      // const fileName = 'anime_art_style_nighttime_cyberpunk_forest_glowin (1).jfif';
      // const imgUrl = `/public/images/genesis/${fileName}`;
      // const imgUrl = imgSrc;
      // if (imgSrc) {
      //   imgUrl = imgSrc;
      // } else if (imgSrcs && imgSrcs.length > 0) {
      //   imgUrl = imgSrcs[Math.floor(Math.random() * imgSrcs.length)];
      // } else {
      //   console.warn('no imgSrc or imgSrcs', {json});
      //   throw new Error('no imgSrc or imgSrcs');
      // }

      const {
        width,
        height,
        arrayBuffer,
      } = await (async () => {
        // const width = 6144;
        // const height = 3072;
        // const res = await fetch('/images/worldzines/depth/test_image.dep');
        // const arrayBuffer = await res.arrayBuffer();




        // const res = await fetch(imgUrl);
        // const blob = await res.blob();

        // const res2 = await fetch('https://local.webaverse.com/midasDepth', {
        //   method: 'POST',
        //   body: blob,
        // });
        // const width = parseInt(res2.headers.get('X-Width'), 10);
        // const height = parseInt(res2.headers.get('X-Height'), 10);
        // const arrayBuffer = await res2.arrayBuffer();

        const depthWidth = 1024;
        const img2 = resizeImage(img, depthWidth);
        const img2Blob = await new Promise((accept, reject) => {
          img2.toBlob(accept, 'image/jpeg');
        });

        console.log('worldzine fetch depth 1', img2Blob.size, imgUrl);
        const res2 = await fetch('https://local.webaverse.com/zoeDepth', {
          method: 'POST',
          body: img2Blob,
        });
        console.log('worldzine fetch depth 2', imgUrl);
        const width = parseInt(res2.headers.get('X-Width'), 10);
        const height = parseInt(res2.headers.get('X-Height'), 10);
        const arrayBuffer = await res2.arrayBuffer();
        console.log('worldzine fetch depth 3', arrayBuffer.byteLength, width, height, imgUrl);

        return {
          width,
          height,
          arrayBuffer,
        };
      })();

      // const res2 = await fetch('https://local.webaverse.com/midasDepth', {
      //   method: 'POST',
      //   body: blob,
      // });
      // const width = parseInt(res2.headers.get('X-Width'), 10);
      // const height = parseInt(res2.headers.get('X-Height'), 10);
      // const arrayBuffer = await res2.arrayBuffer();

      let float32Array = new Float32Array(arrayBuffer);

      // get min max
      let min = Infinity;
      let max = -Infinity;
      for (let i = 0; i < float32Array.length; i++) {
        let v = float32Array[i];
        min = Math.min(min, v);
        max = Math.max(max, v);
      }
      const delta = max - min;
      const minDelta = 20;
      if (delta < minDelta) {
        const scale = minDelta / delta;
        float32Array = float32Array.map(n => n * scale);
      }

      const octahedronMesh = OctahedronSphereCreator.Create({
        width,
        height,
        depthFloats: float32Array,
      });
      octahedronMesh.frustumCulled = false;
      app.add(octahedronMesh);
      octahedronMesh.updateMatrixWorld();
      
      //

      app.getMesh = () => octahedronMesh;

      //

      octahedronMesh.material.uniforms.depthTex.value = new THREE.DataTexture(
        float32Array,
        width,
        height,
        THREE.RedFormat,
        THREE.FloatType
      );

      octahedronMesh.material.uniforms.map.value = imgTexture;
      octahedronMesh.material.uniforms.map.value.needsUpdate = true;
      octahedronMesh.material.uniforms.map.needsUpdate = true;

      octahedronMesh.material.uniforms.depthTex.value.flipY = true;
      // octahedronMesh.material.uniforms.depthTex.value.encoding = THREE.LinearEncoding;
      octahedronMesh.material.uniforms.depthTex.value.wrapS = THREE.RepeatWrapping;
      octahedronMesh.material.uniforms.depthTex.value.wrapT = THREE.RepeatWrapping;
      // octahedronMesh.material.uniforms.depthTex.value.wrapS = THREE.ClampToEdgeWrapping;
      // octahedronMesh.material.uniforms.depthTex.value.wrapT = THREE.ClampToEdgeWrapping;
      octahedronMesh.material.uniforms.depthTex.value.needsUpdate = true;
      octahedronMesh.material.uniforms.depthTex.needsUpdate = true;

      octahedronMesh.material.uniforms.width.value = width;
      octahedronMesh.material.uniforms.width.needsUpdate = true;
      octahedronMesh.material.uniforms.height.value = height;
      octahedronMesh.material.uniforms.height.needsUpdate = true;

      // octahedronMesh.material.uniforms._Min.value = min;
      // octahedronMesh.material.uniforms._Min.needsUpdate = true;
      // octahedronMesh.material.uniforms._Max.value = max;
      // octahedronMesh.material.uniforms._Max.needsUpdate = true;
      // octahedronMesh.position.y = 5;
      // octahedronMesh.updateMatrixWorld();




      // draw to canvas
      // const canvas = document.createElement('canvas');
      // canvas.width = width;
      // canvas.height = height;
      // const ctx = canvas.getContext('2d');
      // const imageData = ctx.createImageData(width, height);
      // const data = imageData.data;
      // for (let i = 0; i < float32Array.length; i++) {
      //   let v = float32Array[i] / 10;
      //   // normalize v
      //   const j = i * 4;
      //   data[j + 0] = v * 255;
      //   data[j + 1] = v * 255;
      //   data[j + 2] = v * 255;
      //   data[j + 3] = 255;
      // }
      // ctx.putImageData(imageData, 0, 0);
      // canvas.classList.add('depthCanvas');
      // canvas.style.width = '500px';
      // canvas.style.position = 'absolute';
      // canvas.style.top = '0px';
      // canvas.style.left = '0px';
      // canvas.style.zIndex = 10;
      // document.body.appendChild(canvas);




      // const img = new Image();
      // img.src = imgUrl;
      // img.style.width = '500px';
      // img.style.position = 'absolute';
      // img.style.top = '0px';
      // img.style.left = '500px';
      // img.style.zIndex = 10;
      // document.body.appendChild(img);

      // physics
      // const physicsIds = [];
      // this.physicsIds = physicsIds;

      // scene physics
      {
        // const geometry2 = getDoubleSidedGeometry(octahedronMesh.geometry);
        // const scenePhysicsMesh = new THREE.Mesh(geometry2, octahedronMesh.material);
        // scenePhysicsMesh.name = 'scenePhysicsMesh';
        // scenePhysicsMesh.visible = false;
        
        // globalThis.octahedronMesh = octahedronMesh;
        
        const scenePhysicsMesh = new THREE.Mesh(octahedronMesh.geometry, octahedronMesh.material);

        const scenePhysicsObject = physics.addGeometry(scenePhysicsMesh);
        scenePhysicsObject.update = () => {
          scenePhysicsMesh.matrixWorld.decompose(
            scenePhysicsObject.position,
            scenePhysicsObject.quaternion,
            scenePhysicsObject.scale
          );
          physics.setTransform(scenePhysicsObject, false);
        };
        physicsTracker.addAppPhysicsObject(app, scenePhysicsObject);
        
        // start off as not selected
        physics.disableActor(scenePhysicsObject);
        app.setSelected = selected => {
          if (selected) {
            // console.log('enable actor', scenePhysicsObject);
            physics.enableActor(scenePhysicsObject);
          } else {
            // console.log('disable actor', scenePhysicsObject);
            physics.disableActor(scenePhysicsObject);
          }
        };
      }
    // })();

  })());

  return app;
};
export const contentId = ${this.contentId};
export const name = ${this.name};
export const description = ${this.description};
export const type = 'worldzine';
export const components = ${this.components};