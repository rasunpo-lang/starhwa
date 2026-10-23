"use client";

import { useEffect, useRef, useState } from "react";

/**
 * ✦ The aurora's picture (DESIGN.md §19). A small raw-WebGL pass that gives
 * the (untouched) artwork genuine, organic movement: a slow noise flow field
 * pushes the picture's own pixels sideways — more toward the curtains' lower
 * hem — so folds reshape and ripple, while the light inside them swells and
 * the finest filaments shimmer. Three derived layers (diffuse far haze, the
 * artwork, its own brightest fine light) are warped at different speeds and
 * scales, which is where the depth comes from. No libraries, no per-frame
 * allocation, time is continuous (no loop to notice).
 *
 * Scoped exception to the site's "CSS-only motion" rule, with safeguards:
 *  - Mounted by Aurora.tsx only during an actual appearance, so it never
 *    runs outside one; additionally paused while the tab is hidden or the
 *    aurora's own night/golden gate has faded it out.
 *  - Reduced motion: one stable still frame, no loop.
 *  - WebGL unavailable / init failure / texture error / context loss: falls
 *    back to the static picture + CSS glow used before this enhancement.
 *  - ~30fps, DPR capped at 1.5 and total pixels capped, low-power context.
 *  - Everything (loop, observers, timers, textures, program, context) is
 *    released on unmount.
 */

const VERT = "attribute vec2 p;varying vec2 v;void main(){v=p*.5+.5;gl_Position=vec4(p,0.,1.);}";

const FRAG = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
varying vec2 v;
uniform sampler2D tSky, tFar, tNear;
uniform vec2 uRes; uniform float uT; uniform vec2 uMoon; uniform float uMoonR;
float hash(vec3 p){p=fract(p*.3183099+vec3(.1,.2,.3));p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
float vn(vec3 x){vec3 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);
 return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),
            mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);}
float fbm(vec3 p){return .55*vn(p)+.3*vn(p*2.03+7.1)+.15*vn(p*4.1+3.3);}
vec2 flow(vec2 uv,float t,float amp,float fq,float sp,float sd){
  float hem=mix(.25,1.,uv.y);
  float nx=fbm(vec3(uv.x*fq,uv.y*fq*.6,t*sp+sd))-.5;
  float ny=fbm(vec3(uv.x*fq*.8+17.,uv.y*fq*.5,t*sp*.8+sd+9.))-.5;
  float rip=sin(uv.y*4.2+uv.x*1.7-t*sp*2.6+sd)*(.25+fbm(vec3(uv*1.3,t*sp*.5+sd)));
  return vec2((nx*2.+rip*.45)*amp*hem, ny*amp*.45);
}
void main(){
  vec2 uv=vec2(v.x,1.-v.y);
  // "cover", centred in x, 40% in y — the same registration as the CSS background
  vec2 img=vec2(1536.,600.); float s=max(uRes.x/img.x,uRes.y/img.y); vec2 sz=img*s;
  vec2 off=vec2((uRes.x-sz.x)*.5,(uRes.y-sz.y)*.4);
  vec2 px=uv*uRes; vec2 tc=(px-off)/sz;
  float t=uT;
  vec3 sky=texture2D(tSky,tc+flow(tc,t,.020,2.2,.035,0.)).rgb;
  vec3 far=texture2D(tFar,tc+flow(tc,t,.012,1.4,.020,31.)).rgb;
  vec3 near=texture2D(tNear,tc+flow(tc,t,.030,3.0,.052,57.)).rgb;
  // light moving within the curtains: broad swells, drifting patches, soft filament shimmer
  float gain=.88+.28*fbm(vec3(tc.x*1.6,tc.y*.9,t*.045+3.));
  float patch=smoothstep(.32,.74,fbm(vec3(tc.x*2.2,tc.y*1.1,t*.06+21.)));
  float fg=.55+.9*fbm(vec3(tc.x*26.,tc.y*2.2,t*.08+11.));
  near*=fg*(.30+.70*patch);
  float farg=.7+.6*fbm(vec3(tc*1.2,t*.03+5.));
  // calm only the *added* light (haze + filaments) around the moon: broad and feathered,
  // the base sky is untouched, so there is no halo and the aurora is not dimmed.
  float calm=1.-.7*(1.-smoothstep(1.2,8.5,length(px-uMoon)/uMoonR));
  vec3 col=sky*gain+(far*.28*farg+near*.42)*calm;
  col=col/(1.+.32*col*col);   // soft shoulder: luminous, never blown out
  // Premultiplied "light over the sky". Equivalent to the CSS screen blend this layer used
  // (c + b(1-c)) for a dark backdrop, but with alpha = brightness it is a plain, cheap
  // composite — mix-blend-mode forces the browser to re-blend against the whole sky each frame.
  vec3 c=clamp(col*1.06,0.,1.);
  gl_FragColor=vec4(c,dot(c,vec3(.3333)));
}`;

type Mode = "pending" | "gl" | "static";

const FRAME_MS = 33; // ~30fps — the motion is slow, half the GPU work is invisible
const FRAME_SLACK_MS = 5; // vsync jitter: without it a 32.9ms tick is skipped and 30fps decays to ~20
const ADAPT_FRAMES = 45; // measure this many drawn frames…
const ADAPT_SLOW_MS = 55; // …and if they average slower than this (< ~18fps), render smaller (a rare safety valve)
const MIN_QUALITY = 0.6;
const START_T = 40; // arbitrary offset into the noise field (also the reduced-motion still frame)
const MAX_DPR = 1.5;
const MAX_DPR_SMALL = 1.25; // phones: the artwork is already softer than 1.25px, so no visible loss
const MAX_PIXELS = 1_200_000;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`aurora texture failed: ${src}`));
    img.src = src;
  });
}

export default function AuroraArt() {
  const boxRef = useRef<HTMLDivElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<Mode>("pending");

  useEffect(() => {
    const box = boxRef.current;
    const host = hostRef.current;
    if (!box || !host) return;

    // A fresh canvas per mount (not a JSX element): releasing the context on cleanup
    // would otherwise poison the same canvas when React re-runs the effect (StrictMode).
    const canvas = document.createElement("canvas");
    canvas.className = "atmosphere-aurora-gl";
    canvas.setAttribute("aria-hidden", "true");

    const gl = canvas.getContext("webgl", { antialias: false, alpha: true, premultipliedAlpha: true, powerPreference: "low-power" });
    // No WebGL: the "pending" markup is already the static fallback — nothing to do.
    if (!gl) return;

    let disposed = false;
    let ready = false;
    let running = false;
    let raf = 0;
    let lastFrame = 0;
    let prevNow = 0;
    let elapsed = 0;
    let quality = 1; // only ever steps down, when frames measurably run slow
    let slowAcc = 0;
    let slowN = 0;
    let stillShown = false;
    let timer: number | undefined;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

    const program = gl.createProgram();
    const buffer = gl.createBuffer();
    const textures: WebGLTexture[] = [];

    function compile(type: number, src: string) {
      const shader = gl!.createShader(type)!;
      gl!.shaderSource(shader, src);
      gl!.compileShader(shader);
      if (!gl!.getShaderParameter(shader, gl!.COMPILE_STATUS)) throw new Error("aurora shader failed");
      return shader;
    }

    let uT: WebGLUniformLocation | null = null;
    let uRes: WebGLUniformLocation | null = null;
    let uMoon: WebGLUniformLocation | null = null;
    let uMoonR: WebGLUniformLocation | null = null;

    function draw() {
      if (!ready || disposed) return;
      gl!.uniform1f(uT, START_T + (reduce.matches ? 0 : elapsed));
      gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4);
    }

    function updateMoon() {
      const moon = document.querySelector(".atmosphere-moon")?.getBoundingClientRect();
      const r = box!.getBoundingClientRect();
      if (!moon || !r.width) return;
      const k = canvas!.width / r.width;
      gl!.uniform2f(uMoon, (moon.left + moon.width / 2 - r.left) * k, (moon.top + moon.height / 2 - r.top) * k);
      gl!.uniform1f(uMoonR, (moon.width / 2) * k);
    }

    function resize() {
      if (!ready || disposed) return;
      const r = box!.getBoundingClientRect();
      if (!r.width || !r.height) return;
      let scale = Math.min(window.devicePixelRatio || 1, window.innerWidth <= 640 ? MAX_DPR_SMALL : MAX_DPR) * quality;
      const pixels = r.width * r.height * scale * scale;
      if (pixels > MAX_PIXELS) scale *= Math.sqrt(MAX_PIXELS / pixels);
      canvas!.width = Math.max(1, Math.round(r.width * scale));
      canvas!.height = Math.max(1, Math.round(r.height * scale));
      gl!.viewport(0, 0, canvas!.width, canvas!.height);
      gl!.uniform2f(uRes, canvas!.width, canvas!.height);
      updateMoon();
      draw();
    }

    function loop(now: number) {
      raf = requestAnimationFrame(loop);
      if (now - lastFrame < FRAME_MS - FRAME_SLACK_MS) return;
      const dt = now - lastFrame;
      lastFrame = now;
      if (prevNow && dt < 250) {
        slowAcc += dt;
        if (++slowN === ADAPT_FRAMES) {
          if (slowAcc / slowN > ADAPT_SLOW_MS && quality > MIN_QUALITY) {
            quality = Math.max(MIN_QUALITY, quality * 0.8);
            resize();
          }
          slowAcc = 0;
          slowN = 0;
        }
      }
      elapsed += prevNow ? Math.min((now - prevNow) / 1000, 0.25) : 0;
      prevNow = now;
      draw();
    }

    function stop() {
      running = false;
      cancelAnimationFrame(raf);
    }

    function start() {
      if (running) return;
      running = true;
      prevNow = 0;
      slowAcc = 0;
      slowN = 0;
      stillShown = false;
      raf = requestAnimationFrame(loop);
    }

    // Run only while it can actually be seen and moved: tab visible, aurora's own
    // night/golden gate not fading it out, no reduced-motion preference.
    function evaluate() {
      if (!ready || disposed) return;
      const gate = box!.closest(".atmosphere-aurora");
      const visible = gate ? parseFloat(getComputedStyle(gate).opacity) > 0.02 : true;
      if (!document.hidden && visible && !reduce.matches) {
        updateMoon();
        start();
      } else {
        stop();
        if (reduce.matches && !stillShown) {
          stillShown = true;
          draw();
        }
      }
    }

    const observer = new ResizeObserver(resize);
    const onContextLost = (e: Event) => {
      e.preventDefault();
      stop();
      ready = false;
      canvas.remove(); // a lost context paints black — let the static fallback show through
      setMode("static");
    };

    canvas.addEventListener("webglcontextlost", onContextLost);
    document.addEventListener("visibilitychange", evaluate);
    reduce.addEventListener("change", evaluate);

    Promise.all([loadImage("/brand/aurora-sky.jpg"), loadImage("/brand/aurora-far.jpg"), loadImage("/brand/aurora-near.jpg")])
      .then((images) => {
        if (disposed) return;
        gl.attachShader(program, compile(gl.VERTEX_SHADER, VERT));
        gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAG));
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error("aurora program failed");
        gl.useProgram(program);

        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
        const loc = gl.getAttribLocation(program, "p");
        gl.enableVertexAttribArray(loc);
        gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

        ["tSky", "tFar", "tNear"].forEach((name, unit) => {
          const tex = gl.createTexture();
          textures.push(tex);
          gl.activeTexture(gl.TEXTURE0 + unit);
          gl.bindTexture(gl.TEXTURE_2D, tex);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, images[unit]);
          gl.uniform1i(gl.getUniformLocation(program, name), unit);
        });

        uT = gl.getUniformLocation(program, "uT");
        uRes = gl.getUniformLocation(program, "uRes");
        uMoon = gl.getUniformLocation(program, "uMoon");
        uMoonR = gl.getUniformLocation(program, "uMoonR");

        host.appendChild(canvas);
        ready = true;
        resize();
        observer.observe(box);
        timer = window.setInterval(evaluate, 1000);
        evaluate();
        setMode("gl");
      })
      .catch(() => {
        if (!disposed) setMode("static");
      });

    return () => {
      disposed = true;
      stop();
      window.clearInterval(timer);
      observer.disconnect();
      canvas.removeEventListener("webglcontextlost", onContextLost);
      document.removeEventListener("visibilitychange", evaluate);
      reduce.removeEventListener("change", evaluate);
      textures.forEach((t) => gl.deleteTexture(t));
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      canvas.remove();
    };
  }, []);

  return (
    <div className={`atmosphere-aurora-art${mode === "gl" ? " atmosphere-aurora-art--gl" : ""}`} ref={boxRef}>
      {mode !== "gl" && (
        <>
          {/* Static fallback (WebGL unavailable / failed / still loading): the
              untouched picture plus the night-only opacity swells. */}
          <div className="atmosphere-aurora-art-img" />
          <div className="atmosphere-aurora-breath">
            <div className="atmosphere-aurora-swell atmosphere-aurora-swell--a" />
            <div className="atmosphere-aurora-swell atmosphere-aurora-swell--b" />
          </div>
        </>
      )}
      <div ref={hostRef} className="atmosphere-aurora-gl-host" />
    </div>
  );
}
