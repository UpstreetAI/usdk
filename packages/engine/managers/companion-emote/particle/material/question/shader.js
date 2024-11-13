const questionMarkVertexShader = `\   
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
const questionMarkFragmentShader = `\
  uniform sampler2D questionTexture;
  uniform vec2 textureOffset;
  uniform vec3 textureInfo;
  
  varying vec2 vUv;

  void main() {
    vec4 question = texture2D(
      questionTexture, 
      vec2(
        vUv.x / textureInfo.x + textureOffset.x,
        vUv.y / textureInfo.y + textureOffset.y
      )
    );
    gl_FragColor = question;
    if (question.a < 0.5) {
      discard;
    }
    gl_FragColor.rgb = vec3(0.930, 0.714, 0.121);
  }
`;
export {
  questionMarkVertexShader, questionMarkFragmentShader,
};