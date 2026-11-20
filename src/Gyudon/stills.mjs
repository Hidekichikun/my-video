import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
const times=process.argv.slice(2).map(Number);
const serveUrl=await bundle({entryPoint:'src/index.ts'});
const be='/opt/pw-browsers/chromium-1243/chrome-linux64/chrome';
const comp=await selectComposition({serveUrl,id:'Gyudon',browserExecutable:be});
for(const t of times){await renderStill({composition:comp,serveUrl,output:`out/st_${t}.png`,frame:Math.round(t*30),browserExecutable:be,scale:0.5});console.log(t);}
