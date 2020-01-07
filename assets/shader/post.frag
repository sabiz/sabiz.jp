precision mediump float;

varying vec2 vUv;
uniform float uTime;
uniform vec2 uResolution;
uniform sampler2D uTex;

const float PI = 3.1415926535;
const float DISTORTION = 0.15;
const float CLIP_EDGE_H = 0.025;
const float CLIP_EDGE_V = 0.075;
vec2 curve(vec2 uv) {
	uv = (uv - 0.5) * 2.0;
	uv *= 1.1;
	uv.x *= 1.0 + pow((abs(uv.y) / 5.0), 2.0);
	uv.y *= 1.0 + pow((abs(uv.x) / 4.0), 2.0);
	uv  = (uv / 2.0) + 0.5;
	uv =  uv *0.92 + 0.04;
	return uv;
}


void main() {

  float u_stripe = 0.0;
  float u_rgbshift = mod(uTime, 10.0)*0.001;//0.005;

  vec2 ndc_pos = vUv;
  vec2 testVec = ndc_pos.xy / max(abs(ndc_pos.x), abs(ndc_pos.y));
  float len = max(1.0,length( testVec ));
  ndc_pos *= mix(1.0, mix(1.0,len,max(abs(ndc_pos.x), abs(ndc_pos.y))), DISTORTION);
  vec2 texCoord = vec2(ndc_pos.s, -ndc_pos.t) * 0.5 + 0.5;

  float stripTile = texCoord.t * mix(10.0, 100.0, u_stripe); //+ mod(uTime, 10.0);
  float stripFac = 1.0 + 0.25 * u_stripe * (step(0.5, stripTile-float(int(stripTile))) - 0.5);

// CRT Effect -------------------------------
  vec2 uv = curve( texCoord.xy );
  vec3 oricol = texture2D( uTex, vec2(texCoord.x, texCoord.y) ).xyz;
  vec3 col;
  float x =  sin(0.3*uTime+uv.y*21.0)*sin(0.7*uTime+uv.y*29.0)*sin(0.3+0.33*uTime+uv.y*31.0)*0.0017;
  col.r = texture2D(uTex,vec2(x+uv.x+0.001,uv.y+0.001)).x+0.05;
  col.g = texture2D(uTex,vec2(x+uv.x+0.000,uv.y-0.002)).y+0.05;
  col.b = texture2D(uTex,vec2(x+uv.x-0.002,uv.y+0.000)).z+0.05;
  col.r += 0.08*texture2D(uTex,0.75*vec2(x+0.025, -0.027)+vec2(uv.x+0.001,uv.y+0.001)).x;
  col.g += 0.05*texture2D(uTex,0.75*vec2(x+-0.022, -0.02)+vec2(uv.x+0.000,uv.y-0.002)).y;
  col.b += 0.08*texture2D(uTex,0.75*vec2(x+-0.02, -0.018)+vec2(uv.x-0.002,uv.y+0.000)).z;
  col = clamp(col*0.6+0.4*col*col*1.0,0.0,1.0);
  float vig = (0.0 + 1.0*16.0*uv.x*uv.y*(1.0-uv.x)*(1.0-uv.y));
  col *= vec3(pow(vig,0.3));
  col *= vec3(0.95,1.05,0.95);
  col *= 2.8;
  float scans = clamp( 0.35+0.35*sin(3.5*uTime+uv.y * uResolution.y * 1.5), 0.0, 1.0);
  float s = pow(scans,1.7);
	col = col*vec3( 0.4+0.7*s) ;
  col *= 1.0+0.01*sin(110.0*uTime);
	if (uv.x < 0.0 || uv.x > 1.0)
		col *= 0.0;
	if (uv.y < 0.0 || uv.y > 1.0)
		col *= 0.0;

	col*=1.0-0.65*vec3(clamp((mod(texCoord.x, 2.0)-1.0)*2.0,0.0,1.0));
  float comp = smoothstep( 0.1, 0.9, sin(uTime) );
	//col = mix( col, oricol, comp );

// ------------------------------------------
  // rgb shift
  // float texR = texture2D( uTex, texCoord.st-vec2(u_rgbshift) ).r;
  // float texG = texture2D( uTex, texCoord.st ).g;
  // float texB = texture2D( uTex, texCoord.st+vec2(u_rgbshift) ).b;
  // float texR = texture2D( uTex, uv.st).r;
  // float texG = texture2D( uTex, uv.st).g;
  // float texB = texture2D( uTex, uv.st).b;
  float texR = col.r;
  float texG = col.g;
  float texB = col.b;


  float clip = smoothstep(0.0, CLIP_EDGE_H, texCoord.s) * smoothstep(texCoord.s, texCoord.s + CLIP_EDGE_H, 1.0)
                 * smoothstep(0.0, CLIP_EDGE_V, texCoord.t) * smoothstep(texCoord.t, texCoord.t + CLIP_EDGE_V, 1.0);
  //step(0.0, texCoord.s) * step(texCoord.s, 1.0) * step(0.0, texCoord.t) * step(texCoord.t, 1.0);

  gl_FragColor  = vec4( vec3(texR, texG, texB) * stripFac * clip, 1.0 );

/*
vec2 q = fragCoord.xy / iResolution.xy;
    vec2 uv = q;
    uv = curve( uv );
    vec3 oricol = texture( iChannel0, vec2(q.x,q.y) ).xyz;
    vec3 col;
	float x =  sin(0.3*iTime+uv.y*21.0)*sin(0.7*iTime+uv.y*29.0)*sin(0.3+0.33*iTime+uv.y*31.0)*0.0017;

    col.r = texture(iChannel0,vec2(x+uv.x+0.001,uv.y+0.001)).x+0.05;
    col.g = texture(iChannel0,vec2(x+uv.x+0.000,uv.y-0.002)).y+0.05;
    col.b = texture(iChannel0,vec2(x+uv.x-0.002,uv.y+0.000)).z+0.05;
    col.r += 0.08*texture(iChannel0,0.75*vec2(x+0.025, -0.027)+vec2(uv.x+0.001,uv.y+0.001)).x;
    col.g += 0.05*texture(iChannel0,0.75*vec2(x+-0.022, -0.02)+vec2(uv.x+0.000,uv.y-0.002)).y;
    col.b += 0.08*texture(iChannel0,0.75*vec2(x+-0.02, -0.018)+vec2(uv.x-0.002,uv.y+0.000)).z;

    col = clamp(col*0.6+0.4*col*col*1.0,0.0,1.0);

    float vig = (0.0 + 1.0*16.0*uv.x*uv.y*(1.0-uv.x)*(1.0-uv.y));
	col *= vec3(pow(vig,0.3));

    col *= vec3(0.95,1.05,0.95);
	col *= 2.8;

	float scans = clamp( 0.35+0.35*sin(3.5*iTime+uv.y*iResolution.y*1.5), 0.0, 1.0);

	float s = pow(scans,1.7);
	col = col*vec3( 0.4+0.7*s) ;

    col *= 1.0+0.01*sin(110.0*iTime);
	if (uv.x < 0.0 || uv.x > 1.0)
		col *= 0.0;
	if (uv.y < 0.0 || uv.y > 1.0)
		col *= 0.0;

	col*=1.0-0.65*vec3(clamp((mod(fragCoord.x, 2.0)-1.0)*2.0,0.0,1.0));

    float comp = smoothstep( 0.1, 0.9, sin(iTime) );

	// Remove the next line to stop cross-fade between original and postprocess
//	col = mix( col, oricol, comp );

    fragColor = vec4(col,1.0);


*/
}
