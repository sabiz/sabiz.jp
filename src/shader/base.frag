
// https://www.shadertoy.com/view/ltj3Wc

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 uResolution;
uniform float uTime;

// #####################################
// Utility
// #####################################
#define pi 3.14159

#define hexColor(r,g,b) (vec3(float(r)/255.0,  float(g)/255.0,  float(b)/255.0))
#define rot2D(r) (mat2(cos(r), sin(r), -sin(r), cos(r)))

vec2 getuvCenterX(vec2 fragCoord, vec2 newTL, vec2 newSize) {
    // ret is now 0-1 in both dimensions
    vec2 ret = vec2(fragCoord.x / uResolution.x, (uResolution.y - fragCoord.y) / uResolution.y);
    // scale up to new dimensions
    ret *= newSize;
    float aspect = uResolution.x / uResolution.y;
   // orig aspect ratio
    ret.x *= aspect;
    float newWidth = newSize.x * aspect;
    return ret + vec2(newTL.x - (newWidth - newSize.x) / 2.0, newTL.y);
}

vec2 hash( vec2 p ) {
    p = vec2( dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3)) );
    return -1.0 + 2.0*fract(sin(p)*43758.5453123);
}

float noise( in vec2 p )
{
    const float K1 = 0.366025404; // (sqrt(3)-1)/2;
    const float K2 = 0.211324865; // (3-sqrt(3))/6;

	vec2 i = floor( p + (p.x+p.y)*K1 );

    vec2 a = p - i + (i.x+i.y)*K2;
    vec2 o = (a.x>a.y) ? vec2(1.0,0.0) : vec2(0.0,1.0); //vec2 of = 0.5 + 0.5*vec2(sign(a.x-a.y), sign(a.y-a.x));
    vec2 b = a - o + K2;
	vec2 c = a - 1.0 + 2.0*K2;

    vec3 h = max( 0.5-vec3(dot(a,a), dot(b,b), dot(c,c) ), 0.0 );

	vec3 n = h*h*h*h*vec3( dot(a,hash(i+0.0)), dot(b,hash(i+o)), dot(c,hash(i+1.0)));

    return dot( n, vec3(70.0) );
}
float noise01(vec2 p)
{
    return clamp((noise(p)+.5)*.5, 0.,1.);
}
float sdAxisAlignedRect(vec2 uv, vec2 tl, vec2 br)
{
    vec2 d = max(tl-uv, uv-br);
    return length(max(vec2(0.0), d)) + min(0.0, max(d.x, d.y));
}

float dtoa(float d, float amount)
{
    return clamp(1.0 / (clamp(d, 1.0/amount, 1.0)*amount), 0.,1.);
}
float smoothf(float x)
{
    return x*x*x*(x*(x*6. - 15.) + 10.);
}
float rand(float n){
 	return fract(cos(n*89.42)*343.42);
}

vec3 colorBrushStroke(vec2 uvLine, vec2 uvPaper, vec2 lineSize, float sdGeometry, vec3 inpColor, vec4 brushColor) {
    float posInLineY = (uvLine.y / lineSize.y);
    if(posInLineY > 0.) {
        posInLineY = pow(posInLineY, (pow(1.0,2.) * 15.) + 1.5);
    }

    // brush stroke fibers effect.
    float strokeBoundary = dtoa(sdGeometry, 300.);// keeps stroke texture inside the geometry.
    float strokeTexture = 0.
        + noise01(uvLine * vec2(min(uResolution.y,uResolution.x)*0.2, 1.))// high freq fibers
        + noise01(uvLine * vec2(79., 1.))// smooth brush texture. lots of room for variation here, also layering.
        + noise01(uvLine * vec2(14., 1.))// low freq noise, gives more variation
        ;
    strokeTexture *= 0.333 * strokeBoundary;// 0 to 1 (take average of above)
    strokeTexture = max(0.008, strokeTexture);// avoid 0; it will be ugly to modulate
  	// fade it from very dark to almost nonexistent by manipulating the curve along Y
	float strokeAlpha = pow(strokeTexture, max(0.,posInLineY)+0.09);// add allows bleeding
    // fade out the end of the stroke by shifting the noise curve below 0
    const float strokeAlphaBoost = 1.09;
    if(posInLineY > 0.)
        strokeAlpha = strokeAlphaBoost * max(0., strokeAlpha - pow(posInLineY,0.5));// fade out
    else
        strokeAlpha *= strokeAlphaBoost;

    // strokeAlpha = smoothf(strokeAlpha);

    // paper bleed effect.
    // float paperBleedAmt = 60. + (rand(uvPaper.y) * 30.) + (rand(uvPaper.x) * 30.);
    float paperBleedAmt = 500.;// disable paper bleed

    float alpha = strokeAlpha * brushColor.a * dtoa(sdGeometry, paperBleedAmt);
    alpha = clamp(alpha, 0.,1.);
    return mix(inpColor, brushColor.rgb, alpha);
}

vec3 colorBrushStrokeLine(vec2 uv, vec3 inpColor, vec4 brushColor, vec2 p1_, vec2 p2_, float lineWidth)
{

    float lineAngle = pi-atan(p1_.x - p2_.x, p1_.y - p2_.y);
    mat2 rotMat = rot2D(lineAngle);

    float lineLength = distance(p2_, p1_);
    vec2 tl = (p1_ * rotMat);
    vec2 br = tl + vec2(0,lineLength);
    vec2 uvLine = uv * rotMat;

    lineWidth *= mix(1., .9, smoothstep(tl.y, br.y, uvLine.y));

    float res = min(uResolution.y, uResolution.x);
    uvLine.x += (noise01(uvLine * 1.)-0.5) * 0.02;
    uvLine.x += cos(uvLine.y * 3.) * 0.069;
    uvLine.x += (noise01(uvLine * 5.)-0.5) * 0.005;

    float d = sdAxisAlignedRect(uvLine, tl, br) - lineWidth / 2.;
    uvLine = tl - uvLine;

    vec2 lineSize = vec2(lineWidth, lineLength);

    vec3 ret = colorBrushStroke(vec2(uvLine.x, -uvLine.y), uv, lineSize,
                                d, inpColor, brushColor);
    return ret;
}

void main() {
    vec2 st = gl_FragCoord.xy/uResolution.xy;
    vec2 uv = getuvCenterX(gl_FragCoord.xy, vec2(-1,-1), vec2(2,2));
    vec3 col =  hexColor(0xFC, 0xFA, 0xF2);
    vec4 brushColor =vec4(hexColor(0x37 ,0x3C, 0x38), .9);
    vec4 brushEdgeColor = vec4(hexColor(0x58 ,0xB2, 0xDC), .9);
    float lineWidth = .03;
    float lineEdgeWidth = .15;

    if (1.0-st.y > uTime/10.0) {
        gl_FragColor = vec4(col,1.0);
        return;
    }

    // s
    float s = sin((uv.y+1.8)*pi*2.85)*0.2;
    col = colorBrushStrokeLine(uv, col, brushEdgeColor, vec2(-0.7+s, -0.06), vec2(-1.1+s, 0.85),  lineEdgeWidth);
    col = colorBrushStrokeLine(uv, col, brushColor, vec2(-0.7+s, -0.06), vec2(-1.1+s, 0.85),  lineWidth);

    // A
    col = colorBrushStrokeLine(uv, col, brushEdgeColor, vec2(-0.28,-0.59), vec2(-0.72,0.85),  lineEdgeWidth);
    col = colorBrushStrokeLine(uv, col, brushEdgeColor, vec2(-0.48,0.27), vec2(-0.04,0.26),  lineEdgeWidth);
    col = colorBrushStrokeLine(uv, col, brushEdgeColor, vec2(-0.28,-0.59), vec2(-0.09,0.85),  lineEdgeWidth);
    col = colorBrushStrokeLine(uv, col, brushColor, vec2(-0.28,-0.59), vec2(-0.72,0.85),  lineWidth);
    col = colorBrushStrokeLine(uv, col, brushColor, vec2(-0.28,-0.59), vec2(-0.09,0.85),  lineWidth);
    col = colorBrushStrokeLine(uv, col, brushColor, vec2(-0.48,0.27), vec2(-0.04,0.26),  lineWidth);

    // b
    float b = uv.y + pow(uv.y, 3.0);
    col = colorBrushStrokeLine(uv, col, brushEdgeColor, vec2(0.05,-0.08), vec2(0.05,0.75),  lineEdgeWidth);
    col = colorBrushStrokeLine(uv, col, brushEdgeColor, vec2(-0.21+b, 0.3), vec2(1.0-b, 0.75),  lineEdgeWidth);
    col = colorBrushStrokeLine(uv, col, brushColor, vec2(0.05,-0.08), vec2(0.05,0.75),  lineWidth);
    col = colorBrushStrokeLine(uv, col, brushColor, vec2(-0.21+b, 0.3), vec2(1.0-b, 0.75),  lineWidth);

    // I
    col = colorBrushStrokeLine(uv, col, brushEdgeColor, vec2(0.5,-0.58), vec2(0.5,0.85),  lineEdgeWidth);
    col = colorBrushStrokeLine(uv, col, brushColor, vec2(0.5,-0.58), vec2(0.5,0.85),  lineWidth);

    // z
    col = colorBrushStrokeLine(uv, col, brushEdgeColor, vec2(0.94,-0.04), vec2(0.55,0.65),  lineEdgeWidth);
    col = colorBrushStrokeLine(uv, col, brushEdgeColor, vec2(0.6,0.03), vec2(1,0.03),  lineEdgeWidth);
    col = colorBrushStrokeLine(uv, col, brushEdgeColor, vec2(0.56,0.55), vec2(1,0.55),  lineEdgeWidth);
    col = colorBrushStrokeLine(uv, col, brushColor, vec2(0.94,-0.04), vec2(0.55,0.65),  lineWidth);
    col = colorBrushStrokeLine(uv, col, brushColor, vec2(0.6,0.03), vec2(1,0.03),  lineWidth);
    col = colorBrushStrokeLine(uv, col, brushColor, vec2(0.56,0.55), vec2(1,0.55),  lineWidth);

    gl_FragColor = vec4(col,1.0);
}

