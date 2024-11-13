const messMarkVertexShader = `\   
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
const messMarkFragmentShader = `\
  uniform sampler2D messTexture;
  uniform vec2 textureOffset;
  varying vec2 vUv;

  void main() {
    vec4 mess = texture2D(
      messTexture, 
      vec2(
        vUv.x / 2. + textureOffset.x,
        vUv.y / 2. + textureOffset.y
      )
    );
    gl_FragColor = mess;
    if (mess.a < 0.5) {
      discard;
    }
    gl_FragColor.rgb = vec3(0.170, 0.163, 0.158);
  }
`;
export {
  messMarkVertexShader, messMarkFragmentShader,
};