import{g as a}from"./core.js";const xe=`#version 300 es
precision highp float;

in vec2 aUV;

uniform vec2  uRes;        
uniform vec4  uRect;       
uniform vec2  uCover;      

uniform float uZone;       
uniform float uAngle;      
uniform float uRound;      
uniform float uDir;        
uniform float uPersp;      

uniform float uXFlat;      
uniform float uXAngle;
uniform float uXRound;
uniform float uXDir;       
uniform vec2  uFade;       

out vec2 vUV;      
out vec2 vQuad;    
out float vFade;

vec2 foldAt(float s, float a, float r) {
  if (s <= 0.0 || a <= 0.0) return vec2(s, 0.0);
  r = max(r, 0.001);
  float arc = r * a;
  if (s < arc) {
    float th = s / r;
    return vec2(r * sin(th), -r * (1.0 - cos(th)));
  }
  float d = s - arc;
  return vec2(r * sin(a) + d * cos(a), -r * (1.0 - cos(a)) - d * sin(a));
}

void main() {
  vUV = (aUV - 0.5) * uCover + 0.5;
  vQuad = aUV;

  vec2 p = uRect.xy + aUV * uRect.zw;

  float line = uRes.y - uZone;
  vec2 fy = foldAt(p.y - line, uAngle, uRound);
  float y = p.y > line ? line + fy.x : p.y;
  float z = (p.y > line ? fy.y : 0.0) * uDir;

  float cx = uRes.x * 0.5;
  float dx = p.x - cx;
  vec2 fx = foldAt(abs(dx) - uXFlat, uXAngle, uXRound);
  float x = abs(dx) > uXFlat ? cx + sign(dx) * (uXFlat + fx.x) : p.x;
  z += (abs(dx) > uXFlat ? fx.y : 0.0) * uXDir;

  vec2 eye = vec2(cx, uRes.y * 0.5);
  
  float k = uPersp / max(uPersp - z, uPersp * 0.25);
  vec2 sp = eye + (vec2(x, y) - eye) * k;

  vFade = 1.0 - smoothstep(uFade.x, uFade.y, abs(z));

  float depth = clamp(0.5 - z / 12000.0, 0.0, 0.999);
  gl_Position = vec4(sp.x / uRes.x * 2.0 - 1.0, 1.0 - sp.y / uRes.y * 2.0, depth, 1.0);
}`,he=`#version 300 es
precision highp float;

in vec2 vUV;
in vec2 vQuad;
in float vFade;

uniform sampler2D uTex;
uniform vec2  uSize;       
uniform float uRadius;
uniform float uAlpha;
uniform float uHasTex;

out vec4 frag;

void main() {
  
  vec2 q = abs((vQuad - 0.5) * uSize) - (uSize * 0.5 - uRadius);
  float d = length(max(q, vec2(0.0))) + min(max(q.x, q.y), 0.0) - uRadius;
  float aa = max(fwidth(d), 0.0001);
  float mask = 1.0 - smoothstep(-aa, aa, d);

  vec3 rgb = uHasTex > 0.5 ? texture(uTex, vUV).rgb : vec3(0.09);

  vec2 fw = fwidth(vUV) + 1e-6;
  vec2 lo = smoothstep(vec2(0.0), fw, vUV);
  vec2 hi = smoothstep(vec2(0.0), fw, vec2(1.0) - vUV);
  float inside = lo.x * lo.y * hi.x * hi.y;
  rgb = mix(vec3(0.0431, 0.0431, 0.0588), rgb, inside);

  float a = mask * uAlpha * clamp(vFade, 0.0, 1.0);
  
  if (a < 0.003) discard;
  frag = vec4(rgb * a, a);          
}`,D=(t,e,o)=>{const n=parseFloat(t.getPropertyValue(e));return Number.isFinite(n)?n:o};function ve({selector:t="[data-fold]",prefix:e="--case-fold",root:o=document}={}){const n=[...o.querySelectorAll(t)];if(!n.length)return null;const c=getComputedStyle(document.documentElement),i={zone:D(c,`${e}-zone`,340),angle:D(c,`${e}-angle`,36),persp:D(c,`${e}-persp`,1100),dir:D(c,`${e}-dir`,-1),fadeIn:D(c,`${e}-fade-in`,380),fadeOut:D(c,`${e}-fade-out`,1e3)},u=n[0]?.closest("[style], .work");if(u){const f=getComputedStyle(u),v=parseFloat(f.getPropertyValue(`${e}-angle`));Number.isFinite(v)&&(i.angle=v);const R=parseFloat(f.getPropertyValue(`${e}-dir`));Number.isFinite(R)&&(i.dir=R)}for(const f of n){const v=f.parentElement;v&&(v.style.perspective=`${i.persp}px`,f.style.transformOrigin="50% 0%",f.style.willChange="transform, opacity",f.style.backfaceVisibility="hidden")}const y=new Set;let k=null;const Y=()=>{const f=window.innerHeight,v=window.innerWidth/2,R=f/2,V=f-i.zone;for(const _ of y){const N=_.getBoundingClientRect();if(!N.height)continue;const $=_.parentElement;if($){const g=$.getBoundingClientRect();$.style.perspectiveOrigin=`${(v-g.left).toFixed(0)}px ${(R-g.top).toFixed(0)}px`}const Q=Math.min(Math.max((N.top-V)/i.zone,0),1),r=Q*Q*i.angle*i.dir,C=Math.abs(Math.sin(r*Math.PI/180))*N.height,p=1-Math.min(Math.max((C-i.fadeIn)/(i.fadeOut-i.fadeIn),0),1);_.style.transform=`rotateX(${r.toFixed(2)}deg)`,_.style.opacity=p.toFixed(3)}k=y.size?requestAnimationFrame(Y):null},j=()=>{k===null&&y.size&&(k=requestAnimationFrame(Y))},z=new IntersectionObserver(f=>{for(const v of f)v.isIntersecting?y.add(v.target):(y.delete(v.target),v.target.style.transform="",v.target.style.opacity="");j()},{rootMargin:"60% 0px 60% 0px"});for(const f of n)z.observe(f);return{destroy(){z.disconnect(),k!==null&&cancelAnimationFrame(k);for(const f of n)f.style.transform="",f.style.opacity="",f.style.willChange="",f.parentElement&&(f.parentElement.style.perspective="")}}}let m=null,E=null,w=null,h=null,L=null,O=null,M=null,G=null,q=null,F=!1,ee=null,X=null,l=null,x=null,d=null,S=!1,b=-1;const H=()=>matchMedia("(prefers-reduced-motion: reduce)").matches;function fe(){m=document.createElement("div"),m.className="lightbox",m.setAttribute("role","dialog"),m.setAttribute("aria-modal","true"),E=document.createElement("div"),E.className="lightbox__scrim",h=document.createElement("div"),h.className="lightbox__stage",w=document.createElement("button"),w.type="button",w.className="lightbox__close",w.setAttribute("aria-label","Close image"),w.innerHTML='<svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';const t=o=>`<svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true"><path d="${o<0?"M14.5 6L8.5 12l6 6":"M9.5 6l6 6-6 6"}" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;L=document.createElement("button"),L.type="button",L.className="lightbox__nav lightbox__nav--prev",L.setAttribute("aria-label","Previous image"),L.innerHTML=t(-1),O=document.createElement("button"),O.type="button",O.className="lightbox__nav lightbox__nav--next",O.setAttribute("aria-label","Next image"),O.innerHTML=t(1),M=document.createElement("div"),M.className="lightbox__dots work__dots",M.setAttribute("aria-label","Choose an image"),m.append(E,h,L,O,M,w),document.body.appendChild(m),w.addEventListener("click",te),L.addEventListener("click",()=>W(-1)),O.addEventListener("click",()=>W(1));let e=null;m.addEventListener("pointerdown",o=>{e={x:o.clientX,y:o.clientY}},!0),m.addEventListener("click",o=>{e&&Math.hypot(o.clientX-e.x,o.clientY-e.y)>8||(o.target===m||o.target===h||o.target===E)&&te()})}function le(t){if(t.key==="Escape"){t.preventDefault(),te();return}if(l){if(t.key==="ArrowLeft"){t.preventDefault(),W(-1);return}if(t.key==="ArrowRight"){t.preventDefault(),W(1);return}}if(t.key==="Tab"){t.preventDefault();const e=l?[w,L,O,...M.children]:[w],o=e.indexOf(document.activeElement),n=o===-1?0:(o+(t.shiftKey?-1:1)+e.length)%e.length;e[n].focus()}}function se(t){document.documentElement.toggleAttribute("data-lightbox",t),window.dispatchEvent(new CustomEvent("lightbox:toggle",{detail:{open:t}}))}function re(t){const e=t.getBoundingClientRect();return e.width>1&&e.height>1?e:null}function ce(t,e){const o=t.getBoundingClientRect();return!e||!o.width?null:{x:e.left+e.width/2-(o.left+o.width/2),y:e.top+e.height/2-(o.top+o.height/2),scale:e.width/o.width}}function ne(t,e){const n={s:1,tx:0,ty:0};let c=!1;const i=new Map;let u=0,y=null,k=null,Y=!1;const j=new AbortController,z={signal:j.signal},f=()=>{const s=t.getBoundingClientRect();return{w:s.width/n.s,h:s.height/n.s,cx:s.left+s.width/2-n.tx,cy:s.top+s.height/2-n.ty}},v=(s,r,C,p)=>{const g=h.getBoundingClientRect(),A=(B,P,de)=>{const J=(P*C-de)/2;return J>0?Math.min(J,Math.max(-J,B)):0};return{x:A(s,p.w,g.width),y:A(r,p.h,g.height)}},R=s=>{const r={x:n.tx,y:n.ty,scale:n.s,overwrite:"auto"};s&&!H()?a.to(t,{...r,duration:.3,ease:"power2.out"}):a.set(t,r)},V=()=>{Y||(Y=!0,a.killTweensOf(t),a.set(t,{opacity:1}))},_=(s,r,C)=>{const p=f();s=Math.min(4,Math.max(1,s));const g=p.cx+(r.x-p.cx-n.tx)/n.s,A=p.cy+(r.y-p.cy-n.ty)/n.s,B=v(r.x-p.cx-s*(g-p.cx),r.y-p.cy-s*(A-p.cy),s,p);n.s=s,n.tx=B.x,n.ty=B.y,R(C)},N=(s,r)=>{const C=f(),p=v(n.tx+s,n.ty+r,n.s,C);n.tx=p.x,n.ty=p.y,R(!1)},$=()=>{n.s=1,n.tx=0,n.ty=0,R(!0)};h.addEventListener("pointerdown",s=>{i.set(s.pointerId,{x0:s.clientX,y0:s.clientY,x:s.clientX,y:s.clientY}),u=0,y=null},z),h.addEventListener("pointermove",s=>{const r=i.get(s.pointerId);if(!r)return;const C=r.x,p=r.y;if(r.x=s.clientX,r.y=s.clientY,i.size===2){const[g,A]=[...i.values()],B=Math.hypot(g.x-A.x,g.y-A.y),P={x:(g.x+A.x)/2,y:(g.y+A.y)/2};u&&(V(),_(n.s*(B/u),P,!1),N(P.x-y.x,P.y-y.y)),u=B,y=P,c&&(c=!1,e?.cancel())}else if(i.size===1&&n.s>1.01)V(),N(r.x-C,r.y-p);else if(i.size===1&&e){const g=r.x-r.x0,A=r.y-r.y0;!c&&Math.abs(g)>10&&Math.abs(g)>Math.abs(A)*1.2&&(c=!0,e.start()),c&&e.drag(g)}},z);const Q=s=>{const r=i.get(s.pointerId);if(i.delete(s.pointerId),u=0,y=null,!r)return;if(c&&i.size===0){c=!1,e?.end(r.x-r.x0);return}const C=Math.hypot(r.x-r.x0,r.y-r.y0);if(s.type==="pointerup"&&C<12&&s.target===t&&i.size===0){const p=performance.now();k&&p-k.t<350&&Math.hypot(r.x-k.x,r.y-k.y)<40?(V(),n.s>1.5?$():_(2.5,{x:r.x,y:r.y},!0),k=null):k={t:p,x:r.x,y:r.y}}i.size===0&&n.s<=1.02&&(n.s!==1||n.tx||n.ty)&&$()};return h.addEventListener("pointerup",Q,z),h.addEventListener("pointercancel",Q,z),h.addEventListener("wheel",s=>{s.preventDefault(),V(),_(n.s*Math.exp(-s.deltaY*.0022),{x:s.clientX,y:s.clientY},!1)},{...z,passive:!1}),{zoomed:()=>n.s>1.01,destroy:()=>j.abort()}}function K(t){const e=document.createElement("img");e.className="lightbox__img",e.alt=t.alt||"",e.decoding="async",e.draggable=!1;const o=t.getAttribute("width"),n=t.getAttribute("height");o&&e.setAttribute("width",o),n&&e.setAttribute("height",n);const c=t.currentSrc||t.src;e.src=c;const i=new URL(c,location.href).pathname,u=t.closest("picture");if(u){for(const y of u.querySelectorAll("source"))if(y.srcset&&y.srcset.includes(i)){e.sizes="100vw",e.srcset=y.srcset;break}}return e}const Z=()=>(h.getBoundingClientRect().width||innerWidth||800)+48,ae=t=>{const e=l.items.length;return l.items[(t%e+e)%e]},T=()=>[d?.prev,x,d?.next].filter(Boolean);function U(){if(!l||d)return;const t=Z();d={prev:K(ae(l.index-1)),next:K(ae(l.index+1))},a.set(d.prev,{x:-t}),a.set(d.next,{x:t}),h.append(d.prev,d.next)}function pe(){if(M.replaceChildren(),!!l){for(let t=0;t<l.items.length;t+=1){const e=document.createElement("button");e.type="button",e.className="work__dot",e.setAttribute("aria-label",`Go to image ${t+1} of ${l.items.length}`),e.addEventListener("click",()=>me(t)),M.appendChild(e)}oe()}}function oe(){l&&[...M.children].forEach((t,e)=>{t.classList.toggle("is-active",e===l.index),e===l.index?t.setAttribute("aria-current","true"):t.removeAttribute("aria-current")})}function I(t,e){const o=e>0?d.next:d.prev,n=e>0?d.prev:d.next,c=x;a.killTweensOf(T()),n.remove(),c.remove(),x=o,a.set(x,{clearProps:"transform"}),x.style.willChange="",d=null,l.index=(t%l.items.length+l.items.length)%l.items.length,oe(),m.setAttribute("aria-label",x.alt||"Image preview"),X?.destroy(),X=ne(x,ie()),l.ctx?.sync?.(l.index),U(),S=!1,b=-1}function ue(t){const e=Z(),o=H()?0:1;S=!0,b=l.index+t;const n=[[d.prev,-e-t*e],[x,-t*e],[d.next,e-t*e]];let c=!1;for(const[i,u]of n)a.to(i,{x:u,duration:.5*o,ease:"expo.out",overwrite:"auto",onComplete:()=>{c||(c=!0,I(b,t))}});o===0&&(a.killTweensOf(T()),n.forEach(([i,u])=>a.set(i,{x:u})),I(b,t))}function W(t){if(!(!l||F)){S&&(a.killTweensOf(T()),I(b,b>l.index?1:-1)),U();for(const e of T())e.style.willChange="transform";ue(t)}}function me(t){if(!l||F)return;const e=l.items.length,o=(t%e+e)%e;if(S&&(a.killTweensOf(T()),I(b,b>l.index?1:-1)),o===l.index)return;if((o-l.index+e)%e===1){W(1);return}if((l.index-o+e)%e===1){W(-1);return}const n=H()?0:1,c=x,i=d;d=null,l.index=o;const u=K(l.items[o]);h.appendChild(u),x=u,a.killTweensOf([c,i?.prev,i?.next].filter(Boolean)),a.fromTo(u,{opacity:0},{opacity:1,duration:.28*n,ease:"power2.out"}),a.to([c,i?.prev,i?.next].filter(Boolean),{opacity:0,duration:.22*n,ease:"power2.in",onComplete:()=>{c.remove(),i?.prev.remove(),i?.next.remove()}}),oe(),m.setAttribute("aria-label",u.alt||"Image preview"),X?.destroy(),X=ne(u,ie()),l.ctx?.sync?.(l.index),U()}function ie(){if(!l)return null;let t=[];return{start(){S&&(a.killTweensOf(T()),I(b,b>l.index?1:-1)),U(),t=[],a.killTweensOf(T());for(const e of T())e.style.willChange="transform";a.set(x,{opacity:1})},drag(e){t.push({dx:e,t:performance.now()}),t.length>6&&t.shift();const o=Z();a.set(d.prev,{x:-o+e}),a.set(x,{x:e}),a.set(d.next,{x:o+e})},end(e){const o=performance.now(),n=t.find(y=>o-y.t<120)||t[0],c=n&&o>n.t?(e-n.dx)/(o-n.t):0,i=Z();Math.abs(e)>Math.min(140,i*.18)||Math.abs(c)>.5?ue(e<0?1:-1):this.cancel()},cancel(){const e=Z(),o=H()?0:1;a.to(d.prev,{x:-e,duration:.35*o,ease:"expo.out",overwrite:"auto"}),a.to(x,{x:0,duration:.35*o,ease:"expo.out",overwrite:"auto",onComplete:()=>{a.set(x,{clearProps:"transform"}),x.style.willChange=""}}),a.to(d.next,{x:e,duration:.35*o,ease:"expo.out",overwrite:"auto"})}}}function ge(t,e){if(!(t.currentSrc||t.src))return;if(m?.dataset.open){if(!F)return;a.killTweensOf([E,w,...h.children]),ee?.()}m||fe(),F=!1,a.killTweensOf([E,w]),l=e&&e.images?.length>1?{items:e.images,index:e.index??0,ctx:e}:null,m.toggleAttribute("data-group",!!l);const n=K(t);m.setAttribute("aria-label",n.alt||"Image preview"),h.replaceChildren(n),x=n,d=null,S=!1,pe(),q=t,X=ne(n,ie()),G=document.activeElement,m.dataset.open="true",m.style.pointerEvents="",se(!0),document.addEventListener("keydown",le),w.focus();const c=re(t);requestAnimationFrame(()=>{if(F)return;const i=H()?0:1,u=ce(n,c),y=()=>{n.style.willChange=""};n.style.willChange="transform, opacity",a.fromTo(E,{opacity:0},{opacity:1,duration:.45*i,ease:"power2.out"}),u?(a.fromTo(n,{x:u.x,y:u.y,scale:u.scale,opacity:0},{x:0,y:0,scale:1,duration:.65*i,ease:"expo.out",overwrite:"auto",onComplete:()=>{a.set(n,{clearProps:"transform"}),y(),U()}}),a.to(n,{opacity:1,duration:.22*i,ease:"power1.out",overwrite:!1})):a.fromTo(n,{y:24,scale:.96,opacity:0},{y:0,scale:1,opacity:1,duration:.55*i,ease:"expo.out",onComplete:()=>{a.set(n,{clearProps:"transform"}),y(),U()}}),a.fromTo(w,{opacity:0,y:-8},{opacity:1,y:0,duration:.35*i,ease:"power2.out",delay:.12*i})})}function te(){if(!m?.dataset.open||F)return;F=!0,m.style.pointerEvents="none",document.removeEventListener("keydown",le),S&&l&&(a.killTweensOf(T()),I(b,b>l.index?1:-1));const t=x||h.querySelector(".lightbox__img"),e=H()?0:1;l?.ctx?.elFor&&(q=l.ctx.elFor(l.index)||q);const o=X?.zoomed(),n=t&&!o&&q?.isConnected?ce(t,re(q)):null;d&&a.to([d.prev,d.next],{opacity:0,duration:.2*e,overwrite:"auto"});const c=()=>{F&&(delete m.dataset.open,m.style.pointerEvents="",se(!1),h.replaceChildren(),M.replaceChildren(),X?.destroy(),X=null,l=null,x=null,d=null,S=!1,b=-1,m.removeAttribute("data-group"),G?.isConnected&&G.focus(),G=null,q=null,F=!1,ee=null)};ee=c,a.killTweensOf([E,w,t].filter(Boolean)),a.to(E,{opacity:0,duration:.35*e,ease:"power2.in"}),a.to(w,{opacity:0,duration:.2*e,ease:"power1.in"}),t&&n?(a.to(t,{x:n.x,y:n.y,scale:n.scale,duration:.45*e,ease:"expo.inOut",onComplete:c}),a.to(t,{opacity:0,duration:.3*e,delay:.15*e,ease:"power2.in",overwrite:!1})):t?a.to(t,{y:"+=16",scale:"*=0.94",opacity:0,duration:.3*e,ease:"power2.in",onComplete:c}):c()}export{he as F,xe as V,ve as i,ge as o};
