precision mediump float;

uniform float uTime;
uniform vec2 uResolution;
uniform sampler2D uTex;


// ============================================================================
// Checker
// ============================================================================

vec3 checker(vec3 col) {
  vec2 uv = gl_FragCoord.xy / uResolution.xy;

  vec2 checkerCenter = uv*2.0 - 1.0;
  float checkerFade = fract(length(checkerCenter)*0.2);
  float checkerSize = gl_FragCoord.x*gl_FragCoord.y;
  col = mix(col, vec3(-mod(checkerSize, 2.0)), checkerFade);
  return col;
}

// ============================================================================
// Distortion
// ============================================================================

vec2 distortion() {
  vec2 uv = gl_FragCoord.xy / uResolution.xy;
  float distortion = 0.065;
  uv = uv * 2.0 - 1.0;

  float r = uv.x*uv.x + uv.y*uv.y;
  uv *= 1.6 + distortion * r + distortion * r * r;
  uv = 0.5 * (uv * 0.5 + 1.0);
  return uv;
}


// ============================================================================
// glitch   https://www.shadertoy.com/view/XtK3W3
// ============================================================================

#define MOD289(x) (mod(x, 289.0))
#define PERMUTE(x) (MOD289(((x*34.0)+1.0)*x))
#define RANDOM(a) (fract(sin(dot(a.xy,vec2(12.9898,78.233))) * 43758.5453))

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
                      0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
                     -0.577350269189626,  // -1.0 + 2.0 * C.x
                      0.024390243902439); // 1.0 / 41.0
  // First corner
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);

  // Other corners
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  x0 = x0 - 0.0 + 0.0 * C.xx ;
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;

  // Permutations
  i = MOD289(i); // Avoid truncation effects in permutation
  vec3 p = PERMUTE( PERMUTE( i.y + vec3(0.0, i1.y, 1.0 ))
		+ i.x + vec3(0.0, i1.x, 1.0 ));

  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m;
  m = m*m;

  // Gradients: 41 points uniformly over a line, mapped onto a diamond.
  // The ring size 17*17 = 289 is close to a multiple of 41 (41*7 = 287)

  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;

  // Normalise gradients implicitly by scaling m
  // Approximation of: m *= inversesqrt( a0*a0 + h*h );
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );

  // Compute final noise value at P
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

vec3 glitch(vec2 uv) {
  float time = uTime / 3.0;

  float noise = max(0.0, snoise(vec2(time, uv.y * 0.2)) - 0.5) * 1.11;
  noise = noise + (snoise(vec2(time * 8.0, uv.y * 1.2)) - 1.5) * 0.05;

  float xpos = uv.x;
  xpos -= pow(noise, 2.0) * RANDOM(vec2(floor(uTime/2.0)));
  xpos += pow(noise, 2.0) * RANDOM(vec2(floor(uTime/5.0)));
	vec3 fragColor = texture2D(uTex, vec2(xpos, uv.y)).rgb;

  const float noisePower = 0.55;
  float hasLine = sign(floor(mod(gl_FragCoord.y * 0.25, 2.0)));
  fragColor = mix(fragColor, vec3(RANDOM(vec2(uv.y * time))), noise * noisePower * hasLine);

  float shift = noise * 0.019;
  vec4 shiftColor = texture2D(uTex, vec2(xpos + shift, uv.y));
  fragColor.g = mix(fragColor.g, shiftColor.g, 0.75);
  shift = noise * 0.029;
  shiftColor = texture2D(uTex, vec2(xpos - shift, uv.y));
  fragColor.b = mix(fragColor.b, shiftColor.b, 0.75);

  return fragColor.rgb;
}

// ============================================================================
// CRT   from https://www.shadertoy.com/view/wld3WN
// ============================================================================

vec3 crt(vec3 col) {
  vec2 uv = gl_FragCoord.xy / uResolution.xy;
  uv = uv * 2.0 - 1.0;

  float ang  = atan(uv.y, uv.x);
  float r = length(uv);
  r = r / (1.0 - 0.025 * r * r);
  uv.x = r * cos(ang);
  uv.y = r * sin(ang);
  uv = 0.5 * (uv + 1.0);

  float coe = 30.0 * (uv.x) * uv.y * (1.0 - uv.x) * (1.0 - uv.y);
	col *= vec3(pow(coe, 0.55)) * 1.25;
  col *=step(0.0, uv.x);
  col *=step(uv.x, 1.0);
  return col;
}

// ============================================================================
// Opening
// ============================================================================

#define PI 3.14159265
vec3 opening(vec3 col, vec2 uv) {
  vec3 onBg = vec3(0.99, 0.98, 0.95);
  vec3 offBg = vec3(0.22, 0.24, 0.22);
  float speed = 1.25;
  vec2 uvLocal = (uv * 2.0 - 1.0) / uTime / speed;
  float d = pow(uvLocal.y, 2.0);
  d += 1.0 - exp(-(pow(uvLocal.x, 2.0)*2.5));
  return mix(col, offBg, smoothstep(0.0, 1.65, d));
}

// ============================================================================
// Main
// ============================================================================

void main() {
  vec3 col = vec3(0);

  vec2 uv = distortion();
  col = glitch(uv);
  col = opening(col, uv);
  col = checker(col);
  col = crt(col);

  gl_FragColor = vec4(col, 1.0);

}
