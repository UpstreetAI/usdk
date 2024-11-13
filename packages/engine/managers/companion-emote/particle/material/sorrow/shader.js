const sorrowMarkVertexShader = `\   
  varying vec2 vUv;
  varying float vIndex;

  attribute float index;
  attribute vec3 positions;
  attribute float scales;
       
  void main() {
    vUv = uv;
    vIndex = index;
   
    
    vec3 pos = position;
    pos *= scales;
    pos += positions;
    vec4 modelPosition = modelMatrix * vec4(pos, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectionPosition = projectionMatrix * viewPosition;
    gl_Position = projectionPosition;
  }
`;
const sorrowMarkFragmentShader = `\
  uniform sampler2D sorrowTexture1;
  uniform sampler2D sorrowTexture2;
  varying vec2 vUv;
  varying float vIndex;

  void main() {
    vec4 sorrow;
    if (vIndex < 0.5) {
      sorrow = texture2D(sorrowTexture1, vUv);
    }
    else {
      sorrow = texture2D(sorrowTexture2, vUv);
    }
    if (sorrow.a < 0.5) {
      discard;
    }
    else {
      gl_FragColor = sorrow;
    }
  }
`;
export {
  sorrowMarkVertexShader, sorrowMarkFragmentShader,
};