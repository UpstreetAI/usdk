const funMarkVertexShader = `\   
  varying vec2 vUv;
  
  attribute vec3 positions;
  attribute float scales;
       
  void main() {
    vUv = uv;
    
    vec3 pos = position;
    pos *= scales;
    pos += positions;
    vec4 modelPosition = modelMatrix * vec4(pos, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectionPosition = projectionMatrix * viewPosition;
    gl_Position = projectionPosition;
  }
`;
const funMarkFragmentShader = `\
  uniform sampler2D sparkleTexture;
  varying vec2 vUv;
  
  void main() {
    vec4 fun = texture2D(sparkleTexture, vUv);
    
    if (fun.a < 0.5) {
      discard;
    }
    else {
      gl_FragColor.rgb = mix(vec3(0.950, 0.939, 0.266), vec3(0.970, 0.907, 0.213), fun.r);
      gl_FragColor.a = fun.r;
    }
  }
`;
export {
  funMarkVertexShader, funMarkFragmentShader,
};