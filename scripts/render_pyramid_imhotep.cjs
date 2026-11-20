const fs=require('node:fs');const path=require('node:path');const ts=require('typescript');
const {bundle}=require('@remotion/bundler');const {enableTailwind}=require('@remotion/tailwind-v4');
const {selectComposition,renderStill,openBrowser}=require('@remotion/renderer');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,f);
const {TIMELINE,LINE_GAP_FRAMES}=require('../src/Pyramid/data/timeline.ts');
async function main(){
 const root=path.resolve(__dirname,'..'); const qa=path.join(root,'out/pyramid-imhotep-check');fs.mkdirSync(qa,{recursive:true});
 const line=TIMELINE.chapters.flatMap(c=>c.lines).find(l=>l.id==='02-05');
 fs.writeFileSync(path.join(qa,'timing.json'),JSON.stringify({from:line.from,end:line.from+line.durationInFrames+LINE_GAP_FRAMES,fps:30,totalFrames:TIMELINE.totalFrames},null,2));
 const serveUrl=await bundle({entryPoint:path.join(root,'src/PyramidFull/imhotep-entry.tsx'),outDir:path.join(root,'tmp/pyramid-imhotep-bundle'),webpackOverride:enableTailwind});
 const browser=await openBrowser('chrome');
 try {
  const full=await selectComposition({serveUrl,id:'PyramidFull',puppeteerInstance:browser,timeoutInMilliseconds:120000});
  for(const offset of [6,60,line.durationInFrames-15]){
   await renderStill({serveUrl,composition:full,frame:line.from+offset,output:path.join(qa,`scene-${offset}.png`),imageFormat:'png',puppeteerInstance:browser,timeoutInMilliseconds:120000});
   console.log(`Checked frame ${line.from+offset}`);
  }
  const card=await selectComposition({serveUrl,id:'ImhotepOverlay',puppeteerInstance:browser,timeoutInMilliseconds:120000});
  await renderStill({serveUrl,composition:card,frame:30,output:path.join(qa,'card.png'),imageFormat:'png',puppeteerInstance:browser,timeoutInMilliseconds:120000});
 }finally{await browser.close({silent:true});}
 console.log('Saved Imhotep card and scene checks');
}
main().catch(e=>{console.error(e);process.exitCode=1;});
