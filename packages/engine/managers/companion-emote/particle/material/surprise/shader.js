const surpriseMarkVertexShader = `\   
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
const surpriseMarkFragmentShader = `\
  uniform sampler2D surpriseTexture;
  varying vec2 vUv;

  void main() {
    vec4 surprise = texture2D(surpriseTexture, vUv);
    
    if (surprise.a < 0.5) {
      discard;
    }
    else {
      gl_FragColor = surprise;
    }
  }
`;
export {
  surpriseMarkVertexShader, surpriseMarkFragmentShader,
};