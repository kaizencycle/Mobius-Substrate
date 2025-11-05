precision highp float;

uniform sampler2D uPalette;
uniform float uEnergy;

varying float vColorIdx;
varying float vFade;

void main() {
  // circular sprite mask
  vec2 uv = gl_PointCoord * 2.0 - 1.0;
  float r2 = dot(uv, uv);
  if (r2 > 1.0) discard;

  // soft edge
  float alpha = smoothstep(1.0, 0.4, r2);

  // palette sample (1D texture)
  vec3 col = texture2D(uPalette, vec2(vColorIdx, 0.0)).rgb;

  // bloom-ready brightness with energy breathing
  float glow = 0.6 + 0.8 * uEnergy;
  vec3 color = col * glow;

  gl_FragColor = vec4(color, alpha * vFade);
}
