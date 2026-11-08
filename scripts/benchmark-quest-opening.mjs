// Real WorldHost/React/rigs and CPU picking. Optional WebGL pass, not Android latency.
import process from "node:process";
import { mkdir, writeFile } from "node:fs/promises";
import { createServer } from "vite";
import { chromium } from "@playwright/test";
const directory = process.argv[2];
if (!directory) throw new Error("Expected evidence directory");
await mkdir(directory, { recursive: true });
const root = process.env.BV_R5Q_ROOT;
const gpu = process.env.BV_R5Q_WEBGL === "1";
const server = await createServer({
  root,
  cacheDir: root ? "/tmp/bv-r5q-base-vite" : "/tmp/bv-r5q-current-vite",
  server: {
    host: "127.0.0.1",
    port: 4189,
    strictPort: true,
    hmr: false,
    watch: { ignored: ["**/src/**"] },
  },
  plugins: [
    {
      name: "r5q-evidence",
      resolveId(id) {
        if (id === "/__r5q-entry.js") return id;
      },
      load(id) {
        if (id === "/__r5q-entry.js")
          return `
 import React,{Profiler} from 'react';
 import {createRoot} from 'react-dom/client';
 import * as THREE from 'three';
 import {WorldHost} from '/src/features/library/WorldHost.tsx';
 import {ThreeWorldRuntime} from '/src/features/library/three/ThreeWorldRuntime.ts';
 import {ThreeWorldInteraction} from '/src/features/library/three/ThreeWorldInteraction.ts';
 import {NarrativeSession} from '/src/features/library/narrative/session.ts';
 import {LivingSession} from '/src/features/library/livingObjects.ts';
 import {NightLightingSession} from '/src/features/library/nightLighting.ts';
 import '/src/styles.css';
 const q=globalThis.__q={trace:null,firstFrames:[],THREE,scheduled:null,timestamp:0};
 const mark=(stage,start)=>{if(q.trace){const v=q.trace.stages[stage]??{count:0,totalMs:0};v.count++;v.totalMs+=globalThis.performance.now()-start;q.trace.stages[stage]=v;}};
 const wrap=(object,name,stage)=>{const original=object[name];object[name]=function(...args){const t=globalThis.performance.now();try{return original.apply(this,args);}finally{mark(stage,t);}};};
 wrap(ThreeWorldInteraction.prototype,'pick','pickCpu');
 wrap(ThreeWorldInteraction.prototype,'applyHighlight','highlightCpu');
 wrap(ThreeWorldInteraction.prototype,'updateHighlightBounds','highlightFollowCpu');
 const talk=NarrativeSession.prototype.talk;NarrativeSession.prototype.talk=function(...args){q.session=this;const t=globalThis.performance.now();try{return talk.apply(this,args);}finally{mark('talkCpu',t);}};
 const snapshot={categories:['book','movie','series','study','physical_activity','work'].map(type=>({type,entries:[]})),scrolls:[]};
 const factory=async()=>{
 const runtime=new ThreeWorldRuntime({libraryWorldSnapshot:snapshot,livingSession:new LivingSession(),nightLighting:new NightLightingSession(),frameScheduler:{request(cb){q.scheduled=cb;return 1;},cancel(){q.scheduled=null;}},createRenderer(){
 const canvas=globalThis.document.createElement('canvas');let ratio=1;
 const renderer=${gpu ? "new THREE.WebGLRenderer({antialias:true})" : "{domElement:canvas,shadowMap:{enabled:false},info:{memory:{geometries:0,textures:0},render:{calls:0,triangles:0}},dispose(){},setPixelRatio(r){ratio=r;},setSize(w,h){canvas.width=w*ratio;canvas.height=h*ratio;},render(){}}"};
 const render=renderer.render.bind(renderer);renderer.render=(scene,camera)=>{q.scene=scene;q.camera=camera;const t=globalThis.performance.now();try{render(scene,camera);}finally{mark('rendererSubmitCpu',t);if(q.trace)q.trace.submissions++;if(q.firstFrames.length<3){const lights=[];scene.traverseVisible(o=>{if(o.isHemisphereLight)lights.push({kind:'sky',intensity:o.intensity,color:o.color.getHex()});if(o.isPointLight&&o.name.startsWith('night-lamp:'))lights.push({kind:'lamp',intensity:o.intensity});});q.firstFrames.push({lights,background:scene.background.getHex()});}}};q.renderer=renderer;return renderer;}});
 q.runtime=runtime;return runtime;};
 const profiler=(_id,_phase,duration,_base,_start,commitTime)=>{if(q.trace){q.trace.commits.push({duration,commitTime,dialogue:!!globalThis.document.querySelector('.rpg-dialogue')});if(globalThis.document.querySelector('.rpg-dialogue')&&q.trace.domCommitAt===null)q.trace.domCommitAt=globalThis.performance.now();}};
 q.root=createRoot(globalThis.document.getElementById('root'));q.root.render(React.createElement(Profiler,{id:'world',onRender:profiler},React.createElement(WorldHost,{libraryWorldSnapshot:snapshot,runtimeFactory:factory})));
 q.step=()=>{q.timestamp+=16.667;const cb=q.scheduled;q.scheduled=null;cb?.(q.timestamp);};
 q.prepare=()=>{q.runtime.agency.update=()=>{};for(let i=0;i<400;i++)q.runtime.livingVisuals.update(1/60,false);q.step();for(const summary of globalThis.document.querySelectorAll('summary'))if(['Explorar · habitantes e objetos','Habitantes da Biblioteca'].includes(summary.textContent.trim()))summary.parentElement.open=true;const interaction=q.runtime.mountedWorld.getInteraction();wrap(interaction.raycaster,'intersectObjects','raycastCpu');wrap(interaction,'onSelectionChange','selectionPublishCpu');wrap(q.runtime,'applyNarrative','narrativeApplyCpu');wrap(q.runtime.agency,'interrupt','agencyInterruptCpu');wrap(q.runtime.agency,'setConversation','agencyConversationCpu');};
 `;
      },
      configureServer(s) {
        s.middlewares.use((req, res, next) => {
          if (req.url !== "/__r5q") return next();
          res.setHeader("Content-Type", "text/html");
          res.end(
            '<html><style>body{margin:0}.world-canvas-host{height:480px!important;width:800px!important}</style><body><div id="root" class="library-page"></div><script type="module" src="/__r5q-entry.js"></script></body></html>',
          );
        });
      },
    },
  ],
});
await server.listen();
const browser = await chromium.launch({
  args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
});
const page = await browser.newPage({
  viewport: { width: 800, height: 700 },
  deviceScaleFactor: 1,
});
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
const results = [],
  initial = [];
try {
  for (const hour of gpu ? [12, 23] : [12, 17, 18, 23, 3]) {
    await page.clock.setFixedTime(
      new Date(2026, 10, 8, hour, hour === 17 ? 59 : 0),
    );
    await page.goto("http://127.0.0.1:4189/__r5q");
    await page.waitForFunction(
      () =>
        globalThis.document.querySelector("canvas")?.dataset
          .inhabitantsReady === "4",
    );
    initial.push(await page.evaluate(() => globalThis.__q.firstFrames));
    await page.evaluate(() => globalThis.__q.prepare());
    if (![12, 23].includes(hour)) continue;
    // Same camera per character, fixed agency spawn poses, actual clips kept.
    for (const key of gpu ? ["samael"] : ["samael", "aryn", "ytha", "lua"])
      for (const path of ["canvas", "react"]) {
        await page.reload();
        await page.waitForFunction(
          () =>
            globalThis.document.querySelector("canvas")?.dataset
              .inhabitantsReady === "4",
        );
        await page.evaluate(() => globalThis.__q.prepare());
        for (const kind of gpu
          ? ["first", "repeat"]
          : ["first", "repeat", "already-open"]) {
          await page.evaluate(
            ({ key, kind }) => {
              const q = globalThis.__q;
              q.trace = null;
              if (kind !== "already-open") {
                q.session?.close();
                q.runtime.selectObject(null);
              }
              const actor = q.scene.getObjectByName("character:" + key);
              q.runtime.navigation.commit({
                targetX: actor.position.x,
                targetZ: actor.position.z,
                zoom: 2,
              });
            },
            { key, kind },
          );
          await page.evaluate(
            () => new Promise((r) => globalThis.requestAnimationFrame(r)),
          );
          const row = await page.evaluate(
            async ({ key, path, kind, hour }) => {
              const q = globalThis.__q;
              const t = (q.trace = {
                stages: {},
                commits: [],
                domCommitAt: null,
                submissions: 0,
                programsBefore: q.renderer.info.programs?.length ?? null,
                receivedAt: globalThis.performance.now(),
              });
              if (path === "canvas") {
                const canvas = q.renderer.domElement,
                  b = canvas.getBoundingClientRect();
                q.camera.updateMatrixWorld();
                const actor = q.scene.getObjectByName("character:" + key);
                const p = new q.THREE.Vector3(
                  actor.position.x,
                  1,
                  actor.position.z,
                ).project(q.camera);
                const x = b.x + ((p.x + 1) * b.width) / 2,
                  y = b.y + ((1 - p.y) * b.height) / 2;
                for (const type of ["pointerdown", "pointerup"])
                  canvas.dispatchEvent(
                    new globalThis.PointerEvent(type, {
                      pointerId: 7,
                      pointerType: "touch",
                      clientX: x,
                      clientY: y,
                      button: 0,
                      bubbles: true,
                      cancelable: true,
                    }),
                  );
              } else {
                const label = {
                  samael: "Samael",
                  aryn: "Aryn",
                  ytha: "Ytha",
                  lua: "Lua",
                }[key];
                const button = [
                  ...globalThis.document.querySelectorAll("button"),
                ].find((b) => b.textContent.trim() === label);
                if (!button) throw new Error("Semantic button missing");
                button.focus({ preventScroll: true });
                button.click();
              }
              t.handlerEndAt = globalThis.performance.now();
              t.synchronousSubmissions = t.submissions;
              await new Promise((r) => globalThis.requestAnimationFrame(r));
              t.firstRafAt = globalThis.performance.now();
              q.step();
              t.afterSceneAt = globalThis.performance.now();
              await new Promise((r) => globalThis.requestAnimationFrame(r));
              t.secondRafAt = globalThis.performance.now();
              const card = globalThis.document.querySelector(".rpg-dialogue");
              const out = {
                hour,
                key,
                path,
                kind,
                ...t,
                selected: q.runtime.selection?.id,
                card: card?.getAttribute("class"),
                heading: card?.querySelector("h3")?.textContent,
                focus: globalThis.document.activeElement?.tagName,
                opacity: card
                  ? globalThis.getComputedStyle(card).opacity
                  : null,
                programs: q.renderer.info.programs?.length ?? null,
              };
              q.trace = null;
              return out;
            },
            { key, path, kind, hour },
          );
          if (
            row.selected !== "character:" + key ||
            row.heading?.toLowerCase() !== key
          )
            throw new Error("Selection/card mismatch");
          results.push(row);
        }
      }
  }
  const teardown = await page.evaluate(() => {
    const q = globalThis.__q;
    q.root.unmount();
    return {
      canvases: globalThis.document.querySelectorAll("canvas").length,
      state: q.runtime.getDiagnostics().runtimeState,
    };
  });
  await writeFile(
    directory + "/metrics.json",
    JSON.stringify(
      {
        scope: gpu
          ? "Chromium/SwiftShader real WebGL; synchronous CPU submission NOT GPU/Android; manual scene RAF, real React/CSS"
          : "Chromium CPU/DOM isolation; real scene/rigs/raycast/React/CSS, renderer double, manual scene RAF; NOT GPU/Android latency",
        browser: browser.version(),
        hours: gpu ? [12, 23] : [12, 17, 18, 23, 3],
        initial,
        results,
        errors,
        teardown,
        presentationLimit:
          "DOM commit and next native RAF opportunities only; actual display/compositor/input-to-photon not measured. Synthetic events exclude hardware input latency.",
      },
      null,
      2,
    ) + "\n",
  );
  if (errors.length) throw new Error(errors.join("; "));
} finally {
  await browser.close();
  await server.close();
}
