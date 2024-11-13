const angryMarkVertexShader = `\   
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
const angryMarkFragmentShader = `\
  uniform sampler2D angryTexture;
  varying vec2 vUv;

  void main() {
    vec4 angry = texture2D(angryTexture, vUv);
    
    if (angry.a < 0.5) {
      discard;
    }
    else {
      gl_FragColor = vec4(0.660, 0.0330, 0.0539, 1.0);
    }
  }
`;
export {
  angryMarkVertexShader, angryMarkFragmentShader,
};