const sweatDropMarkVertexShader = `\   
  varying vec2 vUv;
                  
  void main() {
    vUv = uv;
    vec3 pos = position;
    vec4 modelPosition = modelMatrix * vec4(pos, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectionPosition = projectionMatrix * viewPosition;
    gl_Position = projectionPosition;
  }
`;
const sweatDropMarkFragmentShader = `\
  uniform sampler2D sweatDropTexture;
  varying vec2 vUv;

  void main() {
    vec4 sweatDrop = texture2D(sweatDropTexture, vUv);
    
    if (sweatDrop.a < 0.5) {
      discard;
    }
    else {
      gl_FragColor = sweatDrop;
    }
  }
`;
export {
  sweatDropMarkVertexShader, sweatDropMarkFragmentShader,
};