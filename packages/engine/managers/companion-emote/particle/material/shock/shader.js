const shockMarkVertexShader = `\   
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
const shockMarkFragmentShader = `\
  uniform sampler2D shockTexture;
  uniform vec2 textureOffset;
  varying vec2 vUv;

  void main() {
    vec4 shock = texture2D(
      shockTexture, 
      vec2(
        vUv.x / 5. + textureOffset.x,
        vUv.y / 3. + textureOffset.y
      )
    );
    gl_FragColor = shock;
    if (shock.a < 0.5) {
      discard;
    }
    gl_FragColor.rgb = vec3(0.940, 0.847, 0.141);
  }
`;
export {
  shockMarkVertexShader, shockMarkFragmentShader,
};