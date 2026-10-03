import{g as k}from"./core.js";import{g as ft,W as et,a as dt}from"./title-warp.js";import{S as ut}from"./scroll-trigger.js";import{i as mt}from"./fold-mode.js";import{o as vt}from"./viewport.js";const gt=`#version 300 es
in vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`,K=[{scale:2,fps:30,interactFps:60},{scale:1.5,fps:30,interactFps:60},{scale:1,fps:30,interactFps:60},{scale:.75,fps:30,interactFps:45},{scale:.5,fps:24,interactFps:30}],xt=2;function bt(){const u=navigator.connection;return u&&(u.saveData||u.effectiveType==="slow-2g"||u.effectiveType==="2g")?1:0}function yt(){const u=navigator.hardwareConcurrency||8,s=navigator.deviceMemory||8,t=matchMedia("(pointer: coarse)").matches,e=bt();return u<=4||s<=4||t?xt+e:e}const _t=`#version 300 es
precision highp float;

out vec4 fragColor;

uniform vec2  uRes;
uniform float uTime;
uniform float uProgress;   

uniform float uBevel;      
uniform float uThickness;  
uniform float uDispersion; 
uniform float uFrost;      
uniform float uSpecPow;
uniform float uSpecGain;

uniform float uLift;     
uniform float uFlex;     
uniform float uFlexAxis; 
uniform float uPillY;    
uniform float uPunch;    
uniform float uRipple;   

uniform float uYaw;    
uniform float uPitch;  
uniform float uDist;   
uniform float uFocal;  

#define PI 3.14159265359

float gPx = 1.0;

float sdRoundRect(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
}

const vec2  CARD_C = vec2(0.0, -1090.0);
const vec2  CARD_B = vec2(470.0, 1200.0);
const float CARD_R = 96.0;
float sdCard(vec2 p) { return sdRoundRect(p - CARD_C, CARD_B, CARD_R); }

const float NEAR_Y = CARD_C.y + CARD_B.y;

float flexAt(vec2 pp) {
  if (uFlex == 0.0) return 0.0;
  
  float ux = clamp(abs(pp.x) / CARD_B.x, 0.0, 1.0);
  float uy = clamp(abs(pp.y - CARD_C.y) / CARD_B.y, 0.0, 1.0);
  float u = mix(ux, uy, uFlexAxis);
  return -uFlex * u * u;
}

float sdEquilateral(vec2 p, float r) {
  const float k = 1.7320508;
  p.x = abs(p.x) - r;
  p.y = p.y + r / k;
  if (p.x + k * p.y > 0.0) p = vec2(p.x - k * p.y, -k * p.x - p.y) / 2.0;
  p.x -= clamp(p.x, -2.0 * r, 0.0);
  return -length(p) * sign(p.y);
}

float glyphSDF(vec2 gp) {
  float up   = abs(sdEquilateral(vec2(gp.x, -(gp.y + 20.0)), 25.0)) - 1.7;
  float down = abs(sdEquilateral(vec2(gp.x,   gp.y - 20.0),  25.0)) - 1.7;
  return min(up, down);
}

float grooveDepth(vec2 gp) { return smoothstep(0.1, -1.5, glyphSDF(gp)); }

vec3 palette(float band) {
  vec3 c = vec3(0.15, 0.04, 0.19);                                 
  c = mix(c, vec3(0.46, 0.03, 0.12), smoothstep(-0.04, 0.21, band)); 
  c = mix(c, vec3(0.94, 0.05, 0.07), smoothstep(0.18, 0.35, band)); 
  c = mix(c, vec3(1.00, 0.26, 0.08), smoothstep(0.33, 0.47, band)); 
  c = mix(c, vec3(1.00, 0.12, 0.52), smoothstep(0.45, 0.59, band)); 
  c = mix(c, vec3(0.80, 0.10, 0.86), smoothstep(0.57, 0.69, band)); 
  c = mix(c, vec3(0.42, 0.16, 0.96), smoothstep(0.67, 0.81, band)); 
  c = mix(c, vec3(0.09, 0.30, 0.99), smoothstep(0.78, 0.90, band)); 
  c = mix(c, vec3(0.10, 0.58, 1.00), smoothstep(0.88, 1.04, band)); 
  return c;
}

vec3 room(vec2 p) {
  float t = uTime * 0.045;
  vec2 q = p / 2600.0;
  
  q.x += sin(q.y * 2.1 + t * 1.1) * 0.34;
  q.y += cos(q.x * 1.7 - t * 0.8) * 0.30;
  float band = clamp(0.60 + q.y * 0.55 + sin(q.x * 1.9 + t * 0.6) * 0.16, 0.0, 1.0);
  return palette(band);
}

vec3 wallpaper(vec2 p) {
  vec2 w = p;
  w.x += sin(p.y / 430.0 + uTime * 0.55) * 165.0;   
  w.y += cos(p.x / 360.0 - uTime * 0.47) * 120.0;   
  
  w.x += sin(p.y / 190.0 - uTime * 0.86 + 2.1) * 55.0;   
  w.y += cos(p.x / 160.0 + uTime * 0.72 + 0.9) * 42.0;   

  float band = (w.y + 2150.0) / 2760.0;
  band += sin(w.x / 300.0 + uTime * 0.63) * 0.115;   
  band += sin(w.x / 165.0 - uTime * 0.91 + 1.7) * 0.048;
  band += sin(w.x / 620.0 + uTime * 0.41 + 0.6) * 0.100;
  band += sin(uTime * 0.29) * 0.075;                 
  return palette(clamp(band, 0.0, 1.0));
}

uniform vec4  uUi[8];
uniform float uUiHot[8];    
uniform float uUiHit[8];    
uniform float uUiOn;        

uniform float uAmbA;        
uniform float uAmbB;        
uniform float uShaftG;      

uniform float uSplitX;

uniform float uTravel;

uniform float uUiShow;

uniform float uUiShift;

#define UI_TRK1 0
#define UI_TRK2 1
#define UI_BAR  2
#define UI_KNB1 3
#define UI_KNB2 4
#define UI_ICO1 5   
#define UI_ICO2 6   
#define UI_ICO3 7   

const float UI_TOP = 246.0;
const float UI_BOT = 636.0;
const float UI_KNOB_R = 46.0;
const float UI_BAR_R = 60.0;

float uiIn(float a, float b) { return smoothstep(a, b, uProgress); }

vec3 spectrum(float t) {
  vec3 c = vec3(0.16, 0.66, 0.88);                                 
  c = mix(c, vec3(0.22, 0.36, 0.88), smoothstep(-0.02, 0.17, t));  
  c = mix(c, vec3(0.55, 0.24, 0.86), smoothstep(0.13, 0.31, t));   
  c = mix(c, vec3(0.89, 0.13, 0.62), smoothstep(0.27, 0.46, t));   
  c = mix(c, vec3(0.91, 0.16, 0.21), smoothstep(0.42, 0.59, t));   
  c = mix(c, vec3(0.94, 0.47, 0.13), smoothstep(0.55, 0.71, t));   
  c = mix(c, vec3(0.92, 0.89, 0.24), smoothstep(0.67, 0.84, t));   
  c = mix(c, vec3(0.35, 0.79, 0.31), smoothstep(0.80, 1.02, t));   
  return c;
}

float sdRing(vec2 q, float rad, float w) { return abs(length(q) - rad) - w; }

float sdSquareO(vec2 q, float hw, float rad, float w) {
  return abs(sdRoundRect(q, vec2(hw), rad)) - w;
}
float sdPlayO(vec2 q, float rad, float w) {
  
  return abs(sdEquilateral(vec2(q.y, q.x), rad)) - w;
}

float barMark(vec2 q) {
  float sq = sdSquareO(q - vec2(-140.0, 0.0), 17.0, 6.0, 2.6);
  float ring = sdRing(q - vec2(0.0, 0.0), 17.0, 2.6);
  float ringOn = length(q) - 19.6;
  ring = mix(ring, min(ring, ringOn), uUiOn);
  float play = sdPlayO(q - vec2(140.0, 0.0), 19.0, 2.6);
  return min(min(sq, ring), play);
}
float barDepth(vec2 q) { return smoothstep(0.7, -1.8, barMark(q)); }

vec4 uiPlate(vec2 p) {
  
  if (uUiShow < 0.5) return vec4(0.0);
  float py = p.y - uUiShift;
  if (py < UI_TOP || py > UI_BOT || abs(p.x) > 312.0) return vec4(0.0);

  vec3 art = vec3(0.0);
  float cov = 0.0;

  float in1 = uiIn(0.40, 0.58);
  if (in1 > 0.001 && abs(p.y - uUi[UI_TRK1].y) < uUi[UI_TRK1].w + 3.0) {
    vec4 e = uUi[UI_TRK1];
    float d = sdRoundRect(p - e.xy, vec2(e.z * in1, e.w), e.w);
    
    float fill = smoothstep(-gPx, gPx, uSplitX - p.x);
    vec3 bar = mix(vec3(0.34, 0.37, 0.49), vec3(0.83, 0.16, 0.40), fill);
    float c1 = smoothstep(gPx, -gPx, d);
    art += bar * c1; cov = max(cov, c1);
  }

  float in3 = uiIn(0.66, 0.86);
  if (in3 > 0.001 && abs(p.y - uUi[UI_BAR].y) < uUi[UI_BAR].w + 3.0) {
    vec4 e = uUi[UI_BAR];
    float d = sdRoundRect(p - e.xy, vec2(e.z * in3, e.w), UI_BAR_R);
    float ly = (p.y - e.y) / e.w;                       
    float shelf = smoothstep(0.52, 0.28, ly);
    vec3 face = vec3(0.235, 0.250, 0.335) * (1.12 - 0.30 * ly);
    float c3 = smoothstep(gPx, -gPx, d) * shelf;
    art += face * c3; cov = max(cov, c3);
  }

  float in2 = uiIn(0.50, 0.68);
  if (in2 > 0.001 && abs(p.y - uUi[UI_TRK2].y) < uUi[UI_TRK2].w + 3.0) {
    vec4 e = uUi[UI_TRK2];
    float d = sdRoundRect(p - e.xy, vec2(e.z * in2, e.w), e.w);
    
    float uu = clamp(0.5 + 0.5 * p.x / uTravel, 0.0, 1.0);
    float c2 = smoothstep(gPx, -gPx, d);
    art += spectrum(uu) * c2; cov = max(cov, c2);
  }

  return vec4(art, cov);
}

vec3 backdrop(vec2 p, float withPlate) {
  float t = uTime * 0.06;

  float d = sdCard(p);
  float panel = smoothstep(gPx, -gPx, d);
  
  vec4 plate = (withPlate > 0.5) ? uiPlate(p) : vec4(0.0);
  if (panel <= 0.001) return plate.rgb;

  vec3 col = wallpaper(p);

  float edge = smoothstep(0.0, 30.0, -d);
  col *= mix(0.70, 1.0, edge);
  col += smoothstep(3.5, 0.0, abs(d)) * 0.30;

  vec2 cy1 = vec2(360.0 + sin(uTime * 0.31) * 140.0, 60.0 + cos(uTime * 0.24) * 190.0);
  col = mix(col, vec3(0.10, 0.72, 1.00),
            clamp(exp(-2.4 * length((p - cy1) / 560.0)) * 1.30, 0.0, 1.0));

  vec2 ht = vec2(-40.0 + cos(uTime * 0.27) * 300.0, -980.0 + sin(uTime * 0.36) * 320.0);
  col = mix(col, vec3(1.00, 0.34, 0.06),
            clamp(exp(-3.0 * length((p - ht) / 480.0)) * 0.85, 0.0, 1.0));

  return col * panel * (1.0 - plate.a) + plate.rgb;
}

vec3 backdropBlur(vec2 p, float radius) {
  if (radius < 0.6) return backdrop(p, 1.0);
  vec3 sum = vec3(0.0);
  float total = 0.0;
  for (int i = 0; i < 8; i++) {
    float a = (float(i) / 8.0) * PI * 2.0 + uTime * 0.05;
    vec2 o = vec2(cos(a), sin(a)) * radius;
    sum += backdrop(p + o, 1.0); total += 1.0;
    sum += backdrop(p + o * 0.5, 1.0); total += 1.0;
  }
  sum += backdrop(p, 1.0) * 2.0; total += 2.0;
  return sum / total;
}

vec3 uiGlass(vec2 p, vec2 c, vec2 b, float r, float bev, float mark,
             float bounceY, float hot, float hero, out float cov) {
  vec2 lp = p - c;
  float d = sdRoundRect(lp, b, r);
  cov = smoothstep(gPx, -gPx, d);
  if (cov <= 0.001) return vec3(0.0);

  float t = clamp(-d / bev, 0.0, 1.0);
  float h = sqrt(max(0.0, 1.0 - (1.0 - t) * (1.0 - t)));

  float e = 1.5;
  vec2 gr = normalize(vec2(
    sdRoundRect(lp + vec2(e, 0.0), b, r) - sdRoundRect(lp - vec2(e, 0.0), b, r),
    sdRoundRect(lp + vec2(0.0, e), b, r) - sdRoundRect(lp - vec2(0.0, e), b, r)) + 1e-6);

  float tilt = 1.0 - h;
  vec3 N = normalize(vec3(gr * tilt, h * 0.85 + 0.15));

  float cut = 0.0;
  if (mark > 0.5) {
    float ge = 1.2;
    cut = barDepth(lp);
    vec2 gn = vec2(barDepth(lp + vec2(ge, 0.0)) - barDepth(lp - vec2(ge, 0.0)),
                   barDepth(lp + vec2(0.0, ge)) - barDepth(lp - vec2(0.0, ge)));
    N = normalize(N + vec3(gn * 1.7, 0.0));
  }

  float bend = (hero > 0.5) ? tilt * tilt : tilt * sqrt(sqrt(tilt));
  vec2 off = -N.xy * uThickness * (b.y / 92.0) * bend;

  vec3 col;
  if (hero > 0.5) {
    
    float frost = uFrost * tilt * tilt;
    col.r = backdropBlur(p + off * (1.0 + uDispersion), frost).r;
    col.g = backdropBlur(p + off,                       frost).g;
    col.b = backdropBlur(p + off * (1.0 - uDispersion), frost).b;
    col = mix(col, vec3(dot(col, vec3(0.33))), 0.02) * 1.02;
    col += vec3(0.030, 0.031, 0.040);
  } else {
    col.r = backdrop(p + off * (1.0 + uDispersion), 1.0).r;
    col.g = backdrop(p + off,                       1.0).g;
    col.b = backdrop(p + off * (1.0 - uDispersion), 1.0).b;
    col += vec3(0.030, 0.031, 0.040);
    float scat = tilt * tilt * tilt;
    col = mix(col, vec3(dot(col, vec3(0.299, 0.587, 0.114))), scat * 0.16) + scat * 0.020;
  }

  float bounceMask = smoothstep(-b.y * 0.15, b.y * 0.95, lp.y);
  if (hero > 0.5) {
    
    col += backdrop(vec2(p.x + off.x * 0.4, bounceY), 1.0) * bounceMask * 0.42;
  } else {
  
  col += backdrop(vec2(p.x + off.x * 0.4, bounceY), 1.0) * bounceMask * 0.28;
  }

  float rimDesign = 2.6 * b.y / 92.0;
  float rimW = max(rimDesign, 1.6 * gPx);
  float rimCore = smoothstep(rimW, 0.0, abs(d)) * (rimDesign / rimW);
  float rim = rimCore * 0.72 + smoothstep(bev * 0.9, 0.0, abs(d)) * 0.12;

  vec3 L = normalize(vec3(-0.42, -0.80, 0.58));
  float spec = pow(max(dot(N, L), 0.0), uSpecPow) * uSpecGain * (1.0 - cut * 0.92);

  col += smoothstep(b.y * 0.80, -b.y * 0.65, lp.y) * 0.10 * (0.4 + 0.6 * tilt);
  col += spec + rim;

  col += rimCore * hot * 0.85;

  col = mix(col, vec3(0.95, 0.955, 0.97), cut * 0.95);
  if (mark > 0.5) col *= 1.0 - smoothstep(1.4, 0.2, abs(barMark(lp))) * 0.10;
  return col;
}

void uiPiece(inout vec3 col, vec2 p, int i, float rad, float mark, float bounceY,
             float hero, float in0) {
  if (in0 <= 0.001) return;

  vec4 el = uUi[i];
  vec2 c = el.xy;
  float hot = uUiHot[i], hit = uUiHit[i];

  float scale = in0 * (1.0 + hot * 0.028 - hit * 0.055);
  vec2 b = el.zw * scale;
  
  float r = rad * scale;

  vec2 far = abs(p - c) - b;
  if (max(far.x, far.y) > 140.0) return;

  float k = 0.571 - 0.231 / max(1.0, b.x / b.y);

  float cov;
  vec3 g = uiGlass(p, c, b, r, k * b.y, mark, bounceY, hot, hero, cov);

  float gap = 1.0 - hit * 0.55;
  vec2 lightXY = vec2(0.42, 0.80);
  float dPiece = sdRoundRect(p - c, b, r);
  float dTight = sdRoundRect(p - c - lightXY * 12.0 * gap, b, r);
  float dWide  = sdRoundRect(p - c - lightXY * 34.0 * gap, b, r);
  float shade = smoothstep(26.0, -4.0, dTight) * 0.30
              + smoothstep(96.0, -8.0, dWide) * 0.20 * gap;
  
  col *= 1.0 - clamp(shade, 0.0, 0.26) * (1.0 - cov) * in0;

  float dCaus = sdRoundRect(p - c - lightXY * (1.413 * b.y), b * vec2(0.80, 0.32), r * 0.45);
  float caustic = smoothstep(1.630 * b.y, -0.435 * b.y, dCaus)
                * smoothstep(-6.0, 0.500 * b.y, dPiece);
  col += caustic * 0.026 * in0 * vec3(1.00, 0.93, 0.86);

  col = mix(col, g, cov * in0);
}

void main() {
  vec2 sp = (gl_FragCoord.xy - 0.5 * uRes);

  vec3 ro = vec3(0.0);
  vec3 rd = normalize(vec3(sp.x, sp.y, -uFocal));

  float yaw   = uYaw   + sin(uTime * 0.13) * 0.013;
  float pitch = uPitch + cos(uTime * 0.11) * 0.009;

  float cy = cos(yaw),   sy = sin(yaw);
  float cp = cos(pitch), sq = sin(pitch);

  vec3 planeU = vec3(cy, 0.0, sy);
  vec3 planeV = vec3(sy * sq, cp, -cy * sq);
  vec3 planeN = cross(planeU, planeV);   
                                         
  vec3 P0 = vec3(0.0, 0.0, -uDist);

  float denom = dot(rd, planeN);
  float tHit = dot(P0 - ro, planeN) / denom;

  if (abs(denom) < 1e-5 || tHit <= 0.0) { fragColor = vec4(0.0, 0.0, 0.0, 1.0); return; }

  vec3 hit = ro + rd * tHit;
  vec2 pf = vec2(dot(hit - P0, planeU), -dot(hit - P0, planeV));  

  vec3 Pc = P0 + planeN * uLift;
  float den2 = denom;                            
  float t2 = dot(Pc - ro, planeN) / den2;
  vec2 p = vec2(dot(ro + rd * t2 - Pc, planeU), -dot(ro + rd * t2 - Pc, planeV));

  for (int i = 0; i < 3; i++) {
    t2 = dot((Pc + planeN * flexAt(p)) - ro, planeN) / den2;
    vec3 hp = ro + rd * t2;
    p = vec2(dot(hp - Pc, planeU), -dot(hp - Pc, planeV));
  }
  vec3 hit2 = ro + rd * t2;

  vec3 vv = vec3(sp, -uFocal);
  
  gPx = clamp(t2 * uFocal / (dot(vv, vv) * abs(den2)), 0.05, 48.0);

  if (abs(den2) < 1e-5 || t2 <= 0.0) { p = vec2(1e6); gPx = 1.0; }

  float thick = min(34.0, uLift);
  
  vec3 Pb = P0 + planeN * (uLift - thick + flexAt(p));
  float t3 = dot(Pb - ro, planeN) / den2;
  vec3 hitb = ro + rd * t3;
  vec2 pb = vec2(dot(hitb - Pb, planeU), -dot(hitb - Pb, planeV));
  
  float side = smoothstep(gPx, -gPx, sdCard(pb))
             * (1.0 - smoothstep(gPx, -gPx, sdCard(p)))
             * smoothstep(0.0, 3.0, thick)
             * ((abs(den2) < 1e-5 || t2 <= 0.0) ? 0.0 : 1.0);

  vec3 col = backdrop(p, 1.0);

  if (side > 0.001) {
    
    float dOut = max(0.0, sdCard(p));
    vec2 eN = normalize(vec2(sdCard(p + vec2(2.0, 0.0)) - sdCard(p - vec2(2.0, 0.0)),
                             sdCard(p + vec2(0.0, 2.0)) - sdCard(p - vec2(0.0, 2.0))) + 1e-6);
    vec3 edge = backdrop(p - eN * (dOut + 22.0), 0.0);
    vec3 wall = edge * (0.055 + 0.30 * exp(-dOut / 15.0)) + vec3(0.022, 0.021, 0.032);
    wall += smoothstep(2.2, 0.0, dOut) * 0.30;
    col = mix(col, wall, side);
  }

  float dCard = max(0.0, sdCard(pf));
  float cardBottom = NEAR_Y;

  float notPhone = (1.0 - smoothstep(gPx, -gPx, sdCard(p))) * (1.0 - side);

  if (notPhone > 0.001) {
    
    vec2 gN = normalize(vec2(sdCard(pf + vec2(2.0, 0.0)) - sdCard(pf - vec2(2.0, 0.0)),
                             sdCard(pf + vec2(0.0, 2.0)) - sdCard(pf - vec2(0.0, 2.0))) + 1e-6);
    
    vec3 emit = backdrop(pf - gN * (dCard + 26.0), 0.0);

    float near = exp(-dCard / 1400.0);
    float depth = smoothstep(-2600.0, 700.0, pf.y);

    vec3 amb = mix(room(pf), emit, 0.62);
    amb = max(vec3(0.0), mix(vec3(dot(amb, vec3(0.299, 0.587, 0.114))), amb, 1.34));
    col += amb * (uAmbA + uAmbB * near) * (0.38 + 0.62 * depth) * notPhone;

    vec2 rel = pf - vec2(0.0, CARD_C.y);
    float ang = atan(rel.x, max(240.0, abs(rel.y)) * sign(rel.y + 1e-5));
    
    float s1 = 0.5 + 0.5 * sin(ang * 13.0 + uTime * 0.11);
    
    s1 *= s1;
    float s2 = 0.5 + 0.5 * sin(ang * 27.0 - uTime * 0.17 + 1.7);
    col += emit * s1 * (0.60 + 0.40 * s2) * near * exp(-dCard / 900.0) * uShaftG * notPhone;
  }

  if (notPhone > 0.001 && dCard < 620.0) {
    vec2 gN = normalize(vec2(sdCard(pf + vec2(2.0, 0.0)) - sdCard(pf - vec2(2.0, 0.0)),
                             sdCard(pf + vec2(0.0, 2.0)) - sdCard(pf - vec2(0.0, 2.0))) + 1e-6);
    
    float fall = exp(-dCard / 200.0) * smoothstep(620.0, 90.0, dCard);

    float notBelow = 1.0 - smoothstep(10.0, 210.0, pf.y - cardBottom);
    col += backdrop(pf - gN * (dCard + 26.0), 0.0) * fall * 0.20 * notBelow * notPhone;
  }

  {
    
    vec2 drop = vec2(0.17, 1.0) * uLift * 1.55;
    float sd = sdCard(pf - drop);

    float pen = 30.0 + uLift * 2.918;
    float shade = smoothstep(pen, -pen * 0.30, sd);

    float dark = mix(0.34, 0.45, smoothstep(0.0, 75.0, uLift));

    col *= 1.0 - shade * dark * notPhone;
  }

  float ease = smoothstep(0.0, 1.0, uProgress);

  vec2 pillC = vec2(0.0, uPillY - uPunch * 420.0);
  
  float stretch = clamp(uPunch, -0.55, 0.55);
  
  float birth = smoothstep(0.0, 0.34, uProgress);
  vec2 pillB = vec2(mix(92.0, 300.0, ease) * (1.0 - stretch * 0.13),
                    92.0 * (1.0 + stretch * 0.22)) * birth;
  float pillR = 92.0 * (1.0 + stretch * 0.10) * birth;

  vec2 lp = p - pillC;
  float d = sdRoundRect(lp, pillB, pillR);

  float onCard = smoothstep(gPx, -gPx, sdCard(p));
  vec2 lightXY = normalize(vec2(0.42, 0.80));   

  float contact = smoothstep(56.0, -2.0, d) * 0.15;

  float dCast = sdRoundRect(lp - lightXY * 95.0, pillB, pillR);
  float castShade = smoothstep(340.0, -30.0, dCast) * 0.11;   

  col *= 1.0 - clamp(contact + castShade, 0.0, 0.30) * ease * onCard;

  float dCaus = sdRoundRect(lp - lightXY * 130.0, pillB * vec2(0.80, 0.32), pillR * 0.45);
  float caustic = smoothstep(150.0, -40.0, dCaus) * smoothstep(-6.0, 46.0, d);
  col += caustic * 0.13 * ease * onCard * vec3(1.00, 0.93, 0.86);

  float ripple = exp(-uRipple * 3.4) * sin(uRipple * 21.0 - length(lp) * 0.040);
  float bevel = uBevel * (1.0 + ripple * 0.55);

  float t = clamp(-d / bevel, 0.0, 1.0);
  float h = sqrt(max(0.0, 1.0 - (1.0 - t) * (1.0 - t)));

  float e = 1.5;
  vec2 g = vec2(
    sdRoundRect(lp + vec2(e, 0.0), pillB, pillR) - sdRoundRect(lp - vec2(e, 0.0), pillB, pillR),
    sdRoundRect(lp + vec2(0.0, e), pillB, pillR) - sdRoundRect(lp - vec2(0.0, e), pillB, pillR));
  g = normalize(g + 1e-6);

  float tilt = 1.0 - h;
  vec3 N = normalize(vec3(g * tilt, h * 0.85 + 0.15));

  vec2 gp = lp + vec2(0.0, 18.0);
  float iconFade = smoothstep(0.18, 0.72, uProgress);
  float ge = 1.2;
  vec2 grooveN = vec2(
    grooveDepth(gp + vec2(ge, 0.0)) - grooveDepth(gp - vec2(ge, 0.0)),
    grooveDepth(gp + vec2(0.0, ge)) - grooveDepth(gp - vec2(0.0, ge)));
  float cut = grooveDepth(gp);
  N = normalize(N + vec3(grooveN * 1.7, 0.0) * iconFade);

  float inside = smoothstep(gPx, -gPx, d) * birth;
  if (inside > 0.001) {
    vec2 off = -N.xy * uThickness * tilt * tilt;

    float frost = uFrost * tilt * tilt;
    vec3 gl;
    gl.r = backdropBlur(p + off * (1.0 + uDispersion), frost).r;
    gl.g = backdropBlur(p + off,                       frost).g;
    gl.b = backdropBlur(p + off * (1.0 - uDispersion), frost).b;

    gl = mix(gl, vec3(dot(gl, vec3(0.33))), 0.02) * 1.02;
    
    gl += vec3(0.030, 0.031, 0.040);

    float bounceMask = smoothstep(-pillB.y * 0.15, pillB.y * 0.95, lp.y);
    vec3 bounceCol = backdropBlur(vec2(p.x + off.x * 0.4, pillC.y - pillB.y - 30.0), 22.0);
    gl += bounceCol * bounceMask * 0.42;

    float rimW = max(2.6, 1.6 * gPx);
    float rimCore = smoothstep(rimW, 0.0, abs(d)) * (2.6 / rimW);
    float rimWide = smoothstep(bevel * 0.9, 0.0, abs(d));
    float rim = rimCore * 0.72 + rimWide * 0.12;

    vec3 L = normalize(vec3(-0.42, -0.80, 0.58));
    float etch = cut * iconFade;
    
    float spec = pow(max(dot(N, L), 0.0), uSpecPow) * uSpecGain * (1.0 - etch * 0.92);

    float sheen = smoothstep(pillB.y * 0.80, -pillB.y * 0.65, lp.y);
    gl += sheen * 0.10 * (0.4 + 0.6 * tilt);

    gl += spec + rim + exp(-uRipple * 7.0) * rimCore * 0.55;

    gl = mix(gl, vec3(0.95, 0.955, 0.97), etch * 0.95);
    
    float lip = smoothstep(3.0, 0.4, abs(glyphSDF(gp))) * iconFade;
    gl *= 1.0 - lip * 0.10;

    col = mix(col, gl, inside);
  }

  float upy = p.y - uUiShift;
  if (uUiShow > 0.5 && upy > 200.0 && upy < 700.0) {
    if (upy < 470.0) uiPiece(col, p, UI_KNB1, UI_KNOB_R, 0.0, 300.0 + uUiShift, 0.0, uiIn(0.46, 0.64));
    if (upy > 330.0 && upy < 600.0) uiPiece(col, p, UI_KNB2, UI_KNOB_R, 0.0, 428.0 + uUiShift, 0.0, uiIn(0.56, 0.74));
    if (upy > 430.0) uiPiece(col, p, UI_BAR, UI_BAR_R, 1.0, 560.0 + uUiShift, 1.0, uiIn(0.66, 0.86));
  }

  col *= smoothstep(0.0, 0.16, abs(denom));

  vec2 vn = sp / uRes;
  col *= 1.0 - 0.30 * dot(vn, vn);

  vec2 fc = gl_FragCoord.xy;
  float n1 = fract(sin(dot(fc, vec2(12.9898, 78.233))) * 43758.5453);
  float n2 = fract(sin(dot(fc + 17.0, vec2(39.3468, 11.135))) * 24634.6345);
  
  col += (n1 - n2) * (1.6 / 255.0);

  fragColor = vec4(max(col, 0.0), 1.0);
}
`,it=110,wt=92,$=300,st=24,D=[300,428,560],S=186,V=[100,52],ot=[300,66],j=[-140,140,0],W=.62,Pt=u=>u<=W?.34+(1-.34)/W*u:1+(1.2-1)/(1-W)*(u-W),H=0,X=1,F=2,Y=3,L=4,z=5,q=6,G=7,at=470,nt=1200,ct=-1090,N=90,J=-1520,Rt=-1100,O=34,Q=1233,Mt=.72,Z=(u,s)=>Math.min(1,u/s/Mt),rt=8e6,Ut={bevel:46,thickness:155,dispersion:.3,frost:11,specPow:14,specGain:1.05,yaw:0,pitch:.72,dist:1500,focal:1350};function lt(u,s,t){const e=u.createShader(s);if(u.shaderSource(e,t),u.compileShader(e),!u.getShaderParameter(e,u.COMPILE_STATUS))throw new Error(u.getShaderInfoLog(e)||"shader compile failed");return e}class At{constructor(s,t={}){if(this.host=s,this.params={...Ut,...t},mt()){this.ok=!1;return}this.showConsole=t.showConsole!==!1,this.flexAxis=t.flexAxis==="y"?1:0,this.progress=0,this.ok=!1,this.tierIndex=window.__glassTier??yt(),this.tier=K[this.tierIndex],this._lastDraw=0,this.wallT=12,this._timeScale=1,this._gaps=[],this._cooldown=0,this.canvas=document.createElement("canvas"),this.canvas.width=0,this.canvas.height=0,this.canvas.style.cssText="display:block;width:100%;height:100%",s.appendChild(this.canvas);const e=this.canvas.getContext("webgl2",{alpha:!1,antialias:!1,powerPreference:"high-performance"});if(!e)return;this.gl=e;const i=e.createProgram();if(e.attachShader(i,lt(e,e.VERTEX_SHADER,gt)),e.attachShader(i,lt(e,e.FRAGMENT_SHADER,_t)),e.linkProgram(i),!e.getProgramParameter(i,e.LINK_STATUS))throw new Error(e.getProgramInfoLog(i)||"link failed");e.useProgram(i),this.prog=i;const r=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,r),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),e.STATIC_DRAW);const v=e.getAttribLocation(i,"aPos");e.enableVertexAttribArray(v),e.vertexAttribPointer(v,2,e.FLOAT,!1,0,0),this.u={};for(const l of["uRes","uTime","uProgress","uBevel","uThickness","uDispersion","uFrost","uSpecPow","uSpecGain","uYaw","uPitch","uDist","uFocal","uLift","uFlex","uFlexAxis","uPillY","uPunch","uRipple","uUi[0]","uUiHot[0]","uUiHit[0]","uUiOn","uAmbA","uAmbB","uShaftG","uSplitX","uUiShift","uTravel","uUiShow"])this.u[l.replace("[0]","")]=e.getUniformLocation(i,l);this.canvas.addEventListener("webglcontextlost",l=>{l.preventDefault(),this.ok=!1,this.host.classList.remove("is-live")}),this.motion=!matchMedia("(prefers-reduced-motion: reduce)").matches,this.ptr={x:0,y:0,tx:0,ty:0,hover:0,thover:0},this.punch=0,this.punchV=0,this.rippleT=1e3,this._last=0,this.pillY=N,this.pillTargetY=N,this.pillV=0,this.lift=0,this.standUp=1,this.touching=!1,this.ui={val:[.62,.22],tval:[.62,.22],on:0,ton:0,hot:new Float32Array(8),thot:new Float32Array(8),hit:new Float32Array(8),hitV:new Float32Array(8),geom:new Float32Array(32),hover:-1,drag:-1,shift:0},this.uOut={ambA:.042,ambB:.205,shaftG:.22,splitX:0},this._sd=1/0,this._pushingDown=!1,this._prevCurY=void 0,this.resize(),this.ok=!0}_watch(s,t){if(t!==this.tier.fps){this._gaps.length=0;return}if(this._cooldown>0){this._cooldown--;return}const e=1e3/this.tier.fps;if(this._gaps.push(s),this._gaps.length<20)return;const i=[...this._gaps].sort((v,l)=>v-l),r=i[i.length>>1];this._gaps.length=0,r>e*1.5&&this.tierIndex<K.length-1?(this._setTier(this.tierIndex+1),this._cooldown=60):r<e*1.1&&this.tierIndex>0?(this._good=(this._good||0)+1,this._good>=5&&(this._setTier(this.tierIndex-1),this._cooldown=180)):this._good=0}_setTier(s){this.tierIndex=s,this.tier=K[s],this._good=0,this.resize()}resize(){if(!this.gl)return;this._needsFull=!0;const s=this.host.getBoundingClientRect(),t=Math.min(this.tier.scale,window.devicePixelRatio||1),e=s.width*t*(s.height*t),i=e>rt?t*Math.sqrt(rt/e):t;this.canvas.width=Math.max(1,Math.round(s.width*i)),this.canvas.height=Math.max(1,Math.round(s.height*i)),this.gl.viewport(0,0,this.canvas.width,this.canvas.height)}get restY(){const s=Math.min(1,Math.max(0,this.lift)),t=s*s*s*s*(5-4*s);return N+(Rt-N)*t}hitTest(){const s=this.planePoint(this.ptr.tx,this.ptr.ty);if(!s)return!1;const t=Math.min(1,Math.max(0,this.progress)),i=92+208*(t*t*(3-2*t)),r=92,v=92,l=this.pillY-this.punch*420,R=Math.abs(s.x)-i+v,P=Math.abs(s.y-l)-r+v;return this._sd=Math.min(Math.max(R,P),0)+Math.hypot(Math.max(R,0),Math.max(P,0))-v,this._sd<O*1.5}_active(){this._activeAt=performance.now()}setPointer(s,t){(Math.abs(s-this.ptr.tx)>1e-4||Math.abs(t-this.ptr.ty)>1e-4)&&this._active(),this.ptr.tx=s,this.ptr.ty=t}get cardLift(){const s=Math.min(1,Math.max(0,this.standUp)),t=s*s*s*(s*(s*6-15)+10),e=Math.sin(s*Math.PI)*(s*s*s)*.22;return it*(t+e)}planePoint(s,t){const{yaw:e,pitch:i,dist:r}=this.params,v=this.canvas.width,l=this.canvas.height,R=this.params.focal*(l/Q)*Z(v,l),P=s*v/2,U=-t*l/2,o=Math.hypot(P,U,R),a=[P/o,U/o,-R/o],f=Math.cos(e),d=Math.sin(e),c=Math.cos(i),M=Math.sin(i),p=[f,0,d],y=[d*M,c,-f*M],_=[p[1]*y[2]-p[2]*y[1],p[2]*y[0]-p[0]*y[2],p[0]*y[1]-p[1]*y[0]],A=this.cardLift,g=[_[0]*A,_[1]*A,-r+_[2]*A],T=a[0]*_[0]+a[1]*_[1]+a[2]*_[2];if(Math.abs(T)<1e-6)return null;const h=(g[0]*_[0]+g[1]*_[1]+g[2]*_[2])/T;if(h<=0)return null;const C=[a[0]*h-g[0],a[1]*h-g[1],a[2]*h-g[2]];return{x:C[0]*p[0]+C[1]*p[1]+C[2]*p[2],y:-(C[0]*y[0]+C[1]*y[1]+C[2]*y[2])}}push(s=1){this._active(),this.punchV=Math.max(-10,Math.min(10,this.punchV+6.5*s)),this.rippleT=0}uiStep(s){const t=this.ui,e=c=>1-Math.pow(1-c,s*60),i=e(.16),r=e(.22);t.val[0]+=(t.tval[0]-t.val[0])*i,t.val[1]+=(t.tval[1]-t.val[1])*i,t.on+=(t.ton-t.on)*e(.18);for(let c=0;c<8;c++)t.hot[c]+=(t.thot[c]-t.hot[c])*r,t.hitV[c]+=(0-t.hit[c])*520*s,t.hitV[c]*=Math.pow(4e-6,s),t.hit[c]+=t.hitV[c]*s,Math.abs(t.hit[c])<1e-4&&Math.abs(t.hitV[c])<.001&&(t.hit[c]=0,t.hitV[c]=0);const v=(c,M)=>{const p=Math.min(1,Math.max(0,(this.progress-c)/(M-c)));return p*p*(3-2*p)},l=v(.4,.58),R=v(.5,.68),P=Pt(t.val[0]),U=1+1.6*t.on,o=1-.22*t.on;this.uOut.ambA=.042*P*o,this.uOut.ambB=.205*P*o,this.uOut.shaftG=.22*P*U;const a=-S+2*S*t.val[0];this.uOut.splitX=(a+($-S)*(2*t.val[0]-1))*l,t.shift=this.showConsole?this.pillY-this.punch*420-N:0;const f=t.geom,d=(c,M,p,y,_)=>{f[c*4]=M,f[c*4+1]=p+t.shift,f[c*4+2]=y,f[c*4+3]=_};d(H,0,D[0],$,st),d(X,0,D[1],$,st),d(F,0,D[2],ot[0],ot[1]),d(Y,(-S+2*S*t.val[0])*l,D[0],V[0],V[1]),d(L,(-S+2*S*t.val[1])*R,D[1],V[0],V[1]),d(z,j[0],D[2],33,33),d(q,j[1],D[2],33,33),d(G,j[2],D[2],33,33)}uiHit(s){if(!s||!this.showConsole||this.progress<.95)return-1;const t=this.ui.geom,e=(i,r,v)=>{const l=Math.abs(s.x-t[i*4])-t[i*4+2],R=Math.abs(s.y-t[i*4+1])-t[i*4+3];return l<r&&R<v};for(const i of[Y,L])if(e(i,26,12))return i;for(const i of[z,q,G])if(e(i,16,16))return i;if(e(F,4,4))return F;for(const i of[H,X])if(e(i,30,36))return i;return-1}uiValueAt(s){return Math.min(1,Math.max(0,(s+S)/(2*S)))}uiDown(){const s=this.planePoint(this.ptr.tx,this.ptr.ty),t=this.uiHit(s);if(t<0)return!1;this._active();const e=(i,r)=>{this.ui.hitV[i]=Math.min(60,Math.max(-60,this.ui.hitV[i]+r))};if(e(t,30),t===H||t===Y)this.ui.drag=0,this.ui.tval[0]=this.uiValueAt(s.x),e(Y,18);else if(t===X||t===L)this.ui.drag=1,this.ui.tval[1]=this.uiValueAt(s.x),e(L,18);else if(t===G)this.ui.ton=this.ui.ton>.5?0:1,e(F,22);else if(t===z||t===q){const i=t===q?.08:-.08;this.ui.tval[0]=Math.min(1,Math.max(0,this.ui.tval[0]+i)),e(Y,14),e(F,22)}return!0}uiUp(){this.ui.drag>=0&&this._active(),this.ui.drag=-1}uiMove(){const s=this.planePoint(this.ptr.tx,this.ptr.ty);if(this.ui.drag>=0&&s){this.ui.tval[this.ui.drag]=this.uiValueAt(s.x),this.ui.hover=this.ui.drag===0?Y:L;return}const t=this.ptr.thover>.5?this.uiHit(s):-1;for(let e=0;e<8;e++)this.ui.thot[e]=0;t>=0&&(this.ui.thot[t]=1,t===H&&(this.ui.thot[Y]=1),t===X&&(this.ui.thot[L]=1),(t===z||t===q||t===G)&&(this.ui.thot[F]=1)),this.ui.hover=t}render(s){const t=performance.now(),e=window.scrollY;(Math.abs(this.progress-(this._lastProgress??-1))>5e-4||Math.abs(e-(this._lastY??-1))>.5)&&(this._lastProgress=this.progress,this._lastY=e,this._movedAt=t);const r=t-(this._movedAt??t)>400,v=Math.abs(this.punchV)>.01||this.rippleT<1.4||this.ui.drag>=0,l=t-(this._activeAt??-1e9)<400||v,R=l?this.tier.interactFps??this.tier.fps:r?Math.min(8,this.tier.fps):this.tier.fps,P=this._needsFull||t-this._lastDraw>=1e3/R-2;let U=null;if(P){const x=t-this._lastDraw;this._lastDraw=t,this._lastPulse=t,this._needsFull?this._needsFull=!1:this._watch(x,R)}else{if(!(t-(this._lastPulse??0)>=1e3/this.tier.fps-2)||!r||l||!this.motion||!this._cardRect)return;U=this._cardRect,this._lastPulse=t}const{gl:o,u:a,params:f}=this;if(!o)return;const d=Math.min(.25,Math.max(0,s-this._last)||1/60),c=Math.min(1/30,d);this._last=s;const M=r&&!l?.25:1;this._timeScale+=(M-this._timeScale)*Math.min(1,d*3),this.wallT+=d*this._timeScale;const p=10.5;this.punchV+=(-118*this.punch-p*this.punchV)*c,this.punch+=this.punchV*c,Math.abs(this.punch)<1e-4&&Math.abs(this.punchV)<.001&&(this.punch=0,this.punchV=0),this.rippleT+=c;const y=Math.min(1,Math.max(0,this.progress)),A=92+208*(y*y*(3-2*y)),g=92,T=92,h=this.planePoint(this.ptr.tx,this.ptr.ty);if(h&&this.ptr.thover>.5){const x=Math.abs(h.x)-A+T,n=this.pillY-this.punch*420,b=Math.abs(h.y-n)-g+T,w=Math.min(Math.max(x,b),0)+Math.hypot(Math.max(x,0),Math.max(b,0))-T;if(this.touching=w<(this.touching?O*4.5:O),this._sd=w,this._prevCurY!==void 0){const m=h.y-this._prevCurY;Math.abs(m)>1.5&&(this._pushingDown=m>0)}if(this._prevCurY=h.y,this.touching){const m=g+O*.5,I=this._pushingDown?h.y+m:h.y-m;this.pillTargetY=Math.min(this.restY,Math.max(J,I))}}else this.touching=!1,this._sd=1/0;this.touching||(this.pillTargetY=this.restY);const C=this.pillY;if(this.touching){const x=1-Math.pow(.84,c*60);this.pillY+=(this.pillTargetY-this.pillY)*x}else{const x=this.restY,n=5;this.pillV+=(-10*(this.pillY-x)-n*this.pillV)*c,this.pillY+=this.pillV*c,this.pillY=Math.min(x+62,Math.max(J,this.pillY)),Math.abs(this.pillY-x)<.4&&Math.abs(this.pillV)<1&&(this.pillY=x,this.pillV=0)}if(h&&this.ptr.thover>.5&&Math.abs(h.x)<A+O){const x=g+6;!this._pushingDown&&h.y-this.pillY<x?(this.pillY=Math.max(J,h.y-x),this.touching=!0):this._pushingDown&&this.pillY-h.y<x&&(this.pillY=Math.min(this.restY,h.y+x),this.touching=!0)}if(this.touching){const x=(this.pillY-C)/Math.max(c,1e-4),n=1-Math.pow(1-.3,c*60);this.pillV+=(x-this.pillV)*n,this.pillV=Math.max(-2600,Math.min(2600,this.pillV))}o.useProgram(this.prog),o.uniform2f(a.uRes,this.canvas.width,this.canvas.height),o.uniform1f(a.uTime,this.motion?this.wallT:12),o.uniform1f(a.uProgress,this.progress),o.uniform1f(a.uBevel,f.bevel),o.uniform1f(a.uThickness,f.thickness),o.uniform1f(a.uDispersion,f.dispersion),o.uniform1f(a.uFrost,f.frost),o.uniform1f(a.uSpecPow,f.specPow),o.uniform1f(a.uSpecGain,f.specGain),o.uniform1f(a.uYaw,f.yaw),o.uniform1f(a.uPitch,f.pitch),o.uniform1f(a.uLift,this.cardLift),o.uniform1f(a.uFlexAxis,this.flexAxis),o.uniform1f(a.uFlex,wt*Math.sin(Math.PI*Math.min(1,Math.max(0,this.cardLift/it)))),o.uniform1f(a.uDist,f.dist),o.uniform1f(a.uFocal,f.focal*(this.canvas.height/Q)*Z(this.canvas.width,this.canvas.height)),this.uiStep(c),this.uiMove(),o.uniform4fv(a.uUi,this.ui.geom),o.uniform1fv(a.uUiHot,this.ui.hot),o.uniform1fv(a.uUiHit,this.ui.hit),o.uniform1f(a.uUiOn,this.ui.on),o.uniform1f(a.uAmbA,this.uOut.ambA),o.uniform1f(a.uAmbB,this.uOut.ambB),o.uniform1f(a.uShaftG,this.uOut.shaftG),o.uniform1f(a.uSplitX,this.uOut.splitX),o.uniform1f(a.uUiShift,this.ui.shift),o.uniform1f(a.uTravel,S),o.uniform1f(a.uUiShow,this.showConsole?1:0),o.uniform1f(a.uPillY,this.pillY),o.uniform1f(a.uPunch,this.punch),o.uniform1f(a.uRipple,this.rippleT),U?(o.enable(o.SCISSOR_TEST),o.scissor(U.x,U.y,U.w,U.h),o.drawArrays(o.TRIANGLES,0,3),o.disable(o.SCISSOR_TEST)):(o.drawArrays(o.TRIANGLES,0,3),this._cardRect=this._cardRectPx())}_cardRectPx(){const{yaw:s,pitch:t,dist:e}=this.params,i=this.canvas.width,r=this.canvas.height,v=this.params.focal*(r/Q)*Z(i,r),l=Math.cos(s),R=Math.sin(s),P=Math.cos(t),U=Math.sin(t),o=[l,0,R],a=[R*U,P,-l*U],f=[o[1]*a[2]-o[2]*a[1],o[2]*a[0]-o[0]*a[2],o[0]*a[1]-o[1]*a[0]],d=this.cardLift,c=[f[0]*d,f[1]*d,-e+f[2]*d],M=90,p=[-at-M,at+M],y=[ct-nt-M,ct+nt+M];let _=1/0,A=1/0,g=-1/0,T=-1/0;for(const w of p)for(const m of y){const I=[c[0]+o[0]*w-a[0]*m,c[1]+o[1]*w-a[1]*m,c[2]+o[2]*w-a[2]*m];if(I[2]>-.001)return null;const B=-v*I[0]/I[2]+i/2,tt=-v*I[1]/I[2]+r/2;_=Math.min(_,B),g=Math.max(g,B),A=Math.min(A,tt),T=Math.max(T,tt)}const h=Math.max(g-_,T-A)*.08;_-=h,g+=h,A-=h,T+=h;const C=Math.max(0,Math.floor(_)),x=Math.max(0,Math.floor(A)),n=Math.min(i,Math.ceil(g))-C,b=Math.min(r,Math.ceil(T))-x;return n>0&&b>0?{x:C,y:x,w:n,h:b,frac:+(n*b/(i*r)).toFixed(3)}:null}dispose(){this.canvas.remove(),this.gl?.getExtension("WEBGL_lose_context")?.loseContext()}}k.registerPlugin(ut);const Tt=.16,E=.4,ht=.63,Ct=.42,pt=.2;function Bt(u,s={}){if(!u)return null;const t=u.querySelector(".craft__scene"),e=u.querySelector(".craft__title");if(!t||!e)return null;let i=null;try{i=new At(t,{showConsole:s.console!==!1,flexAxis:s.flexAxis}),i.ok||(i=null)}catch(n){console.warn("[craft] liquid glass unavailable:",n.message),i=null}i&&t.classList.add("is-live");let r=null;if(!i){t.classList.add("is-css");const n=document.createElement("div");n.className="craft__phone";const b=document.createElement("div");b.className="craft__pill",t.append(n,b),r={stand:-1,pill:-1,lift:-1}}const v=(n,b,w)=>{r.stand!==n&&(r.stand=n,t.style.setProperty("--craft-stand",n.toFixed(3))),r.pill!==b&&(r.pill=b,t.style.setProperty("--craft-pill",b.toFixed(3))),r.lift!==w&&(r.lift=w,t.style.setProperty("--craft-lift",w.toFixed(3)))};let l=0,R=!1;const P={sweep:0,out:0};let U=-1,o=-1;const a=()=>{let n;P.out>1e-4?(o<0&&(o=1-P.sweep),n=o*(1-P.out)):(o=-1,n=1-P.sweep),!(Math.abs(n-U)<.002)&&(U=n,e.style.opacity=n>.999?"":n.toFixed(4))},f={o:0};let d=-1;k.ticker.add((n,b)=>{const w=f.o;let m;if(d<0)m=w;else{const I=w>d?.45:.153,B=1-Math.pow(1-I,Math.min(33,b)/16.667);m=d+(w-d)*B,Math.abs(w-m)<.004&&(m=w)}m!==d&&(d=m,t.style.opacity=m>=.9995?"1":m.toFixed(4))}),i&&(k.ticker.add(n=>{i.ok&&l>5e-4&&l<.9995&&i.render(n);const b=i.ok?-i.ui.shift:0,w=Math.min(1,Math.max(0,(b-60)/100))*(1-Math.min(1,Math.max(0,(b-880)/100)));P.sweep=w,a();const m=i.ok&&l>=E&&(i.ui.hover>=0||i.hitTest());m!==R&&(R=m,u.style.cursor=m?"pointer":""),l<E&&(i.ptr.thover=0)}),addEventListener("pointermove",n=>{if(n.pointerType==="mouse"){if(l<E){i.ptr.thover=0,i.uiUp();return}i.setPointer(n.clientX/innerWidth*2-1,n.clientY/innerHeight*2-1),i.ptr.thover=1}},{passive:!0}),addEventListener("pointerleave",()=>{i.ptr.thover=0},{passive:!0}),addEventListener("pointerdown",n=>{if(!(l<E)){if(i.setPointer(n.clientX/innerWidth*2-1,n.clientY/innerHeight*2-1),n.pointerType!=="mouse"){i.uiDown();return}i.ptr.thover=1,!i.uiDown()&&i.hitTest()&&i.push()}},{passive:!0}),addEventListener("pointerup",()=>i.uiUp(),{passive:!0}),addEventListener("pointercancel",()=>i.uiUp(),{passive:!0}),vt(()=>i.resize()),ut.addEventListener("refresh",()=>i.resize()));const c=e.textContent.trim();e.setAttribute("aria-label",c),e.innerHTML=[...c].map(n=>`<span class="focus__mask" aria-hidden="true"><span class="focus__letter">${n}</span></span>`).join("");const M=e.querySelectorAll(".focus__letter");k.set(M,{yPercent:120}),e.classList.add("is-parked"),e.removeAttribute("data-unclaimed");const p=ft(u).layer(e,c);let y=!1,_=null;const A=n=>{n!==y&&(y=n,_?.kill(),k.killTweensOf(M),n?(e.classList.remove("is-parked"),_=k.to(M,{yPercent:0,duration:1.15,ease:"expo.out",stagger:.055,onComplete:()=>{y&&e.classList.add("is-revealed")}}),p.state.a=1):(e.classList.remove("is-revealed"),e.classList.add("is-parked"),k.set(M,{yPercent:120}),p.state.a=0,p.render()))},g=k.timeline({paused:!0,onUpdate:()=>{const n=g.progress();l=n;const b=B=>Math.min(1,Math.max(0,B)),w=b((n-ht)/(1-ht)),m=b(n/Ct),I=b((n-pt)/(E-pt));if(!i){r&&v(m,I,w);return}i.standUp=m,i.progress=I,i.lift=w}});g.to({},{duration:1},0),g.fromTo(f,{o:0},{o:1,duration:Tt,ease:"power2.out"},0);const T=.93,h=.9;g.to(f,{o:0,duration:.07,ease:"power2.in"},T).to(e,{yPercent:-110,duration:.07,ease:"power3.in"},h).to(P,{out:1,duration:.07,ease:"power3.in",onUpdate:a},h).fromTo(p.state,{k:et},{k:dt,duration:.07,ease:"power3.in",onUpdate:p.render,immediateRender:!1},h);const C=k.to(p.state,{k:et,duration:1,ease:"back.out(0.9)",paused:!0,onUpdate:p.render});return{timeline:g,setTitleShown:A,setWarpProgress:n=>{g.progress()>=h||C.progress(n<0?0:n>1?1:n)}}}export{Bt as initCraft};
