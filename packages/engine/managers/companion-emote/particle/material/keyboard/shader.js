const keyboardMarkVertexShader = `\   
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
const keyboardMarkFragmentShader = `\
  uniform sampler2D keyboardTexture;
  uniform vec2 textureOffset;
  varying vec2 vUv;

  void main() {
    vec4 keyboard = texture2D(
      keyboardTexture, 
      vec2(
        vUv.x / 15. + textureOffset.x,
        vUv.y / 20. + textureOffset.y
      )
    );
    gl_FragColor = keyboard;
    // if (keyboard.a < 0.01) {
    //   discard;
    // }
    

  }
`;
export {
  keyboardMarkVertexShader, keyboardMarkFragmentShader,
};