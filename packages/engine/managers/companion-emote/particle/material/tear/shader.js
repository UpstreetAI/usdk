const tearMarkVertexShader = `\   
  uniform vec4 cameraBillboardQuaternion;
  varying vec2 vUv;
  varying float vTextureRotation;

  attribute float textureRotation;
  attribute vec3 positions;
  attribute float scales;
       
  vec3 rotateVecQuat(vec3 position, vec4 q) {
    vec3 v = position.xyz;
    return v + 2.0 * cross(q.xyz, cross(q.xyz, v) + q.w * v);
  }

  void main() {
    vUv = uv;
    vTextureRotation = textureRotation;
   
    
    vec3 pos = position;
    pos = rotateVecQuat(pos, cameraBillboardQuaternion);
    pos *= scales;
    pos += positions;
    vec4 modelPosition = modelMatrix * vec4(pos, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectionPosition = projectionMatrix * viewPosition;
    gl_Position = projectionPosition;
  }
`;
const tearMarkFragmentShader = `\
  uniform sampler2D tearTexture;

  varying vec2 vUv;
  varying float vTextureRotation;
  
  #define PI 3.1415926
  void main() {
    float mid = 0.5;
    vec2 rotated = vec2(
      cos(vTextureRotation * PI) * (vUv.x - mid) - sin(vTextureRotation * PI) * (vUv.y - mid) + mid,
      cos(vTextureRotation * PI) * (vUv.y - mid) + sin(vTextureRotation * PI) * (vUv.x - mid) + mid
    );
    
    vec4 tear = texture2D(tearTexture, rotated);
    
    if (tear.a < 0.5) {
      discard;
    }
    else {
      gl_FragColor = tear;
    }
  }
`;
export {
  tearMarkVertexShader, tearMarkFragmentShader,
};