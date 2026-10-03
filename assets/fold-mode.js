const f=/swiftshader|llvmpipe|softpipe|software|basic render/i;let a=null,i="";const l=`
  let r = 'NO-GL';
  try {
    const c = new OffscreenCanvas(1, 1);
    const a = { failIfMajorPerformanceCaveat: true };
    const gl = c.getContext('webgl2', a) || c.getContext('webgl', a);
    if (gl) {
      const d = gl.getExtension('WEBGL_debug_renderer_info');
      r = String(d ? gl.getParameter(d.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER));
      const l = gl.getExtension('WEBGL_lose_context'); if (l) l.loseContext();
    } else {
      r = 'CAVEAT';
    }
  } catch (e) { r = 'NO-GL'; }
  postMessage(r);
`;function s(){try{const n=document.createElement("canvas"),e={failIfMajorPerformanceCaveat:!0},t=n.getContext("webgl2",e)||n.getContext("webgl",e);if(!t)return i="(GL refused: software-only or absent)",!0;const r=t.getExtension("WEBGL_debug_renderer_info"),o=String(r?t.getParameter(r.UNMASKED_RENDERER_WEBGL):t.getParameter(t.RENDERER));return t.getExtension("WEBGL_lose_context")?.loseContext(),i=o,f.test(o)}catch{return!0}}const d=typeof window>"u"?Promise.resolve(!1):location.search.indexOf("nogl")>-1?(a=!0,window.__swgl=!0,Promise.resolve(!0)):typeof OffscreenCanvas>"u"||typeof Worker>"u"?(a=s(),window.__swgl=a,window.__glr=i,Promise.resolve(a)):new Promise(n=>{let e,t=!1;const r=o=>{t||(t=!0,a=o,window.__swgl=o,window.__glr=i,e?.terminate(),n(o))};try{e=new Worker(URL.createObjectURL(new Blob([l],{type:"text/javascript"}))),e.onmessage=o=>{if(o.data==="NO-GL"||o.data==="CAVEAT")return r(s());i=String(o.data),r(f.test(i))},e.onerror=()=>r(s()),setTimeout(()=>{a===null&&r(s())},5e3)}catch{r(s())}});function u(){return a===null?!0:a}const w=/\bapple\s*m\d/i,g=/^apple\s*gpu$/i;function E(n=i,e=typeof navigator<"u"?navigator.platform:"",t=typeof navigator<"u"?navigator.maxTouchPoints:0){const r=String(n||"").trim();return w.test(r)?!0:g.test(r)?/^mac/i.test(String(e||""))&&!(t>0):!1}function m(){return typeof window>"u"||location.search.indexOf("lightgrid")>-1?!1:location.search.indexOf("heavygrid")>-1?!0:u()?!1:E()}function c(){return typeof window>"u"?!0:!m()}function _(){if(typeof window>"u")return!1;const n=window.matchMedia("(pointer: coarse)").matches,e=window.matchMedia("(max-width: 64rem)").matches;return n||e?!1:!c()}async function p(){if(typeof window>"u")return!1;const n=window.matchMedia("(pointer: coarse)").matches,e=window.matchMedia("(max-width: 64rem)").matches;return n||e?!1:(await d,!c())}export{_ as a,m as c,c as i,d as s,p as u};
