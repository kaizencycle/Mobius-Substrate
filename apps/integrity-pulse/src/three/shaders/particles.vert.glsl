precision highp float;

attribute float aSize;
attribute float aColorIdx;

uniform float uTime;
uniform float uEnergy;     // 0..~1 mic energy
uniform float uSizePx;     // base point size in px
uniform float uRadius;     // sphere radius
uniform float uSeed;

varying float vColorIdx;
varying float vFade;

void main() {
  vec3 p = position;

  // golden-ratio breathing: swirl around local tangent using energy
  float sw = 0.35 + 1.25 * uEnergy;      // swirl strength
  float t  = uTime * (0.15 + 0.85*uEnergy);
  float phase = (aColorIdx * 6.28318) + uSeed;

  // rotate around normal-ish axes
  float cs = cos(t + phase);
  float sn = sin(t + phase);
  mat2 rot = mat2(cs, -sn, sn, cs);

  // split into two axes for mild "torus" wobble
  vec2 xz = rot * p.xz;
  p.x = xz.x;
  p.z = xz.y;

  // micro wobble along latitude
  p.y += sw * 0.02 * sin(12.9898 * phase + t);

  // slight inflate/deflate with energy
  p *= (1.0 + 0.05 * uEnergy);

  vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  // distance fade maintains density
  float dist = length(mvPosition.xyz);
  vFade = clamp(1.5 / dist, 0.0, 1.0);

  // screen-space size
  gl_PointSize = (uSizePx * aSize) * vFade;
  vColorIdx = aColorIdx;
}
