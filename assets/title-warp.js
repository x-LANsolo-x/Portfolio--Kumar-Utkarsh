import{o as k}from"./viewport.js";import{i as B}from"./fold-mode.js";const C=`#version 300 es
precision highp float;

in vec2 aUV;

uniform vec2  uRes;      
uniform vec2  uCentre;   
uniform float uTop;      
uniform float uHeight;   
uniform float uHalf;     
uniform float uAngle;    
uniform float uEase;     
uniform float uVary;     
uniform float uK;        
uniform float uPersp;
uniform float uRise;     
uniform vec4  uXfAD;     
uniform vec2  uXfEF;     
uniform vec2  uXfO;      

out vec2 vUV;

const int STEPS = 24;

void main() {
  vUV = aUV;
  vec2 p = aUV * uRes;

  float A = uAngle * uK
          * (1.0 + uVary * cos((p.x - uCentre.x) / max(uHalf, 1.0) * 1.9 + 0.7));

  float y = p.y;
  float z = 0.0;
  float v = p.y - uTop;
  if (v > 0.0 && abs(A) > 1e-4 && uHeight > 1.0) {
    float dv = v / float(STEPS);
    float ay = 0.0;
    float az = 0.0;
    for (int i = 0; i < STEPS; i++) {
      float s = (float(i) + 0.5) * dv;
      
      float t = clamp(s / uHeight, 0.0, 1.0);
      float th = A * pow(t, uEase);
      ay += cos(th);
      az += sin(th);
    }
    y = uTop + ay * dv;
    z = -az * dv;
  }

  float sc = uPersp / max(uPersp - z, uPersp * 0.25);
  vec2 sp = uCentre + (vec2(p.x, y) - uCentre) * sc;

  sp.y += pow(max(0.0, -uK), 1.25) * uRise;

  vec2 q = sp - uXfO;
  sp = uXfO + vec2(uXfAD.x * q.x + uXfAD.z * q.y + uXfEF.x,
                   uXfAD.y * q.x + uXfAD.w * q.y + uXfEF.y);

  gl_Position = vec4(sp.x / uRes.x * 2.0 - 1.0, 1.0 - sp.y / uRes.y * 2.0, 0.0, 1.0);
}`,H=`#version 300 es
precision highp float;

in vec2 vUV;
uniform sampler2D uTex;
uniform float uAlpha;
out vec4 frag;

void main() {
  float a = texture(uTex, vUV).a * uAlpha;
  frag = vec4(vec3(a), a);      
}`;function P(t,r,e,s){const a=t.createShader(r);return t.shaderSource(a,e),t.compileShader(a),t.getShaderParameter(a,t.COMPILE_STATUS)?a:(console.error(`[title-warp] ${s}: ${t.getShaderInfoLog(a)}`),null)}const x=6,_=320;function W(t){const r=new Float32Array((x+1)*(_+1)*2);let e=0;for(let u=0;u<=_;u++)for(let d=0;d<=x;d++)r[e++]=d/x,r[e++]=u/_;const s=new Uint16Array(x*_*6);let a=0;for(let u=0;u<_;u++)for(let d=0;d<x;d++){const m=u*(x+1)+d,A=m+1,f=m+x+1,E=f+1;s[a++]=m,s[a++]=f,s[a++]=A,s[a++]=A,s[a++]=f,s[a++]=E}const c=t.createVertexArray();t.bindVertexArray(c);const i=t.createBuffer();t.bindBuffer(t.ARRAY_BUFFER,i),t.bufferData(t.ARRAY_BUFFER,r,t.STATIC_DRAW),t.enableVertexAttribArray(0),t.vertexAttribPointer(0,2,t.FLOAT,!1,0,0);const T=t.createBuffer();return t.bindBuffer(t.ELEMENT_ARRAY_BUFFER,T),t.bufferData(t.ELEMENT_ARRAY_BUFFER,s,t.STATIC_DRAW),t.bindVertexArray(null),{vao:c,count:s.length}}function N(t,r,e,s,a,c,i,T,u){t.clearRect(0,0,e,s);const d=(r||"").trim();if(!d)return{halfW:0,centreX:i,inkTop:0,inkHeight:1};t.font=`900 ${c}px ${a}`,t.fillStyle="#fff",t.textAlign="left",t.textBaseline="alphabetic";const m=t.measureText(d),A=m.fontBoundingBoxAscent||c*.8,f=m.fontBoundingBoxDescent||c*.2,E=T-u/2+(u-(A+f))/2+A,g=[...d],S=c*.02,R=g.map(l=>t.measureText(l).width),o=R.reduce((l,p)=>l+p,0)+S*(g.length-1);let n=i-o/2;for(let l=0;l<g.length;l++)t.fillText(g[l],n,E),n+=R[l]+S;const h=m.actualBoundingBoxAscent||c*.72,y=m.actualBoundingBoxDescent||0;return{halfW:o/2,centreX:i,inkTop:E-h,inkHeight:Math.max(1,h+y)}}const w=matchMedia("(prefers-reduced-motion: reduce)"),I=-1,z=0,K=1;function L(t){const r=getComputedStyle(t),e=t.offsetWidth,s=t.offsetHeight;let a=new DOMMatrix;if(r.translate&&r.translate!=="none"){const c=r.translate.trim().split(/\s+/),i=(T,u)=>T?T.endsWith("%")?parseFloat(T)/100*u:parseFloat(T)||0:0;a=a.translate(i(c[0],e),i(c[1],s))}if(r.rotate&&r.rotate!=="none"&&(a=a.rotate(parseFloat(r.rotate)||0)),r.scale&&r.scale!=="none"){const c=r.scale.trim().split(/\s+/).map(parseFloat);a=a.scale(c[0]??1,c[1]??c[0]??1)}return r.transform&&r.transform!=="none"&&(a=a.multiply(new DOMMatrix(r.transform))),a}function O(t){const r=getComputedStyle(t).transformOrigin.split(/\s+/);return{x:t.offsetLeft+(parseFloat(r[0])||0),y:t.offsetTop+(parseFloat(r[1])||0)}}function $(t){const r=L(t);return{x:t.offsetLeft+t.offsetWidth/2+r.e,y:t.offsetTop+t.offsetHeight/2+r.f}}const D=new WeakMap;function q(t){let r=D.get(t);return r||(r=V(t),D.set(t,r)),r}const F=()=>({state:{a:0,k:0},render(){},remeasure(){}});function V(t){if(B())return{ok:!1,layer:F};const r=document.createElement("canvas");r.className="title-warp",r.setAttribute("aria-hidden","true");const e=r.getContext("webgl2",{alpha:!0,antialias:!0,premultipliedAlpha:!0,depth:!1});if(!e)return{ok:!1,layer:F};const s=e.createProgram(),a=P(e,e.VERTEX_SHADER,C,"vert"),c=P(e,e.FRAGMENT_SHADER,H,"frag");if(!a||!c)return{ok:!1,layer:F};if(e.attachShader(s,a),e.attachShader(s,c),e.bindAttribLocation(s,0,"aUV"),e.linkProgram(s),!e.getProgramParameter(s,e.LINK_STATUS))return console.error("[title-warp] link:",e.getProgramInfoLog(s)),{ok:!1,layer:F};const i={};for(const o of["uRes","uCentre","uTop","uHeight","uHalf","uAngle","uEase","uVary","uK","uPersp","uTex","uAlpha","uRise","uXfAD","uXfEF","uXfO"])i[o]=e.getUniformLocation(s,o);const T=W(e);t.appendChild(r);const u=document.createElement("canvas"),d=u.getContext("2d");let m=0,A=0,f=1;const E=[];function g(){const o=t.getBoundingClientRect();m=Math.max(1,Math.round(o.width)),A=Math.max(1,Math.round(o.height)),f=Math.min(devicePixelRatio||1,2),r.width=Math.round(m*f),r.height=Math.round(A*f),r.style.width=`${m}px`,r.style.height=`${A}px`,u.width=r.width,u.height=r.height,e.viewport(0,0,r.width,r.height);for(const n of E)n.dirty=!0;R()}g(),k(g),w.addEventListener?.("change",R),document.fonts?.ready.then(()=>{for(const o of E)o.dirty=!0;R()});function S(o){const n=getComputedStyle(o.title),h=parseFloat(n.fontSize)*f,y=o.title.offsetLeft+o.title.offsetWidth/2,l=o.title.offsetTop+o.title.offsetHeight/2,p=N(d,o.word,u.width,u.height,n.fontFamily,h,y*f,l*f,o.title.offsetHeight*f);o.tex?e.bindTexture(e.TEXTURE_2D,o.tex):(o.tex=e.createTexture(),e.bindTexture(e.TEXTURE_2D,o.tex),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE)),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!1),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,e.RGBA,e.UNSIGNED_BYTE,u);const v=(M,b)=>{const X=parseFloat(n.getPropertyValue(M));return Number.isFinite(X)?X:b};o.angle=v("--warp-angle",78)*(Math.PI/180),o.persp=v("--warp-persp",420),o.rise=v("--warp-rise",3)*p.inkHeight,o.ease=Math.max(.2,v("--warp-ease",1.7)),o.vary=v("--warp-vary",.09),o.halfW=p.halfW,o.centreX=p.centreX,o.centreY=l*f,o.inkTop=p.inkTop,o.inkHeight=p.inkHeight;const U=O(o.title);o.originX=U.x,o.originY=U.y,o.dirty=!1}function R(){const o=E.filter(n=>n.state.a>.001);if(!o.length){r.style.display!=="none"&&(r.style.display="none");for(const n of E)n.hidden&&(n.title.classList.remove("is-warping"),n.hidden=!1);return}r.style.display!=="block"&&(r.style.display="block"),e.clearColor(0,0,0,0),e.clear(e.COLOR_BUFFER_BIT),e.enable(e.BLEND),e.blendFunc(e.ONE,e.ONE_MINUS_SRC_ALPHA),e.useProgram(s),e.bindVertexArray(T.vao),e.uniform2f(i.uRes,r.width,r.height),e.uniform1i(i.uTex,0),e.activeTexture(e.TEXTURE0);for(const n of o){(n.dirty||!n.tex)&&S(n),n.hidden||(n.title.classList.add("is-warping"),n.hidden=!0);const h=getComputedStyle(n.title),y=parseFloat(h.opacity),l=Math.min(1,n.state.a)*(Number.isFinite(y)?y:1);if(l<.002)continue;const p=L(n.title);e.uniform4f(i.uXfAD,p.a,p.b,p.c,p.d),e.uniform2f(i.uXfEF,p.e*f,p.f*f),e.uniform2f(i.uXfO,n.originX*f,n.originY*f),e.bindTexture(e.TEXTURE_2D,n.tex),e.uniform2f(i.uCentre,n.centreX,n.centreY),e.uniform1f(i.uTop,n.inkTop),e.uniform1f(i.uHeight,n.inkHeight),e.uniform1f(i.uHalf,n.halfW),e.uniform1f(i.uAngle,n.angle),e.uniform1f(i.uEase,n.ease),e.uniform1f(i.uVary,w.matches?0:n.vary),e.uniform1f(i.uK,w.matches?0:n.state.k),e.uniform1f(i.uPersp,n.persp*f),e.uniform1f(i.uRise,w.matches?0:n.rise*f),e.uniform1f(i.uAlpha,l),e.drawElements(e.TRIANGLES,T.count,e.UNSIGNED_SHORT,0)}e.bindVertexArray(null);for(const n of E)!o.includes(n)&&n.hidden&&(n.title.classList.remove("is-warping"),n.hidden=!1)}return{ok:!0,canvas:r,render:R,layer(o,n,h={}){const y={title:o,word:n,state:{k:I,a:h.present?1:0},tex:null,dirty:!0,hidden:!1,angle:(h.angle??78)*(Math.PI/180),persp:h.persp??420,rise:h.rise??3,ease:h.ease??1.7,vary:h.vary??.09,halfW:0,centreX:0,centreY:0,inkTop:0,inkHeight:1,originX:0,originY:0};return E.push(y),{state:y.state,render:R,remeasure(){y.dirty=!0}}}}}export{z as W,K as a,q as g,$ as t};
