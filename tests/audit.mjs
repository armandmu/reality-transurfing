// Quality checks for the complete static Academy. Runs without npm packages.
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const files=['index.html','oracle.js','volume2.js','volumes345.js','study-plus.js','source-guide.js'];
const data=Object.fromEntries(files.map(f=>[f,fs.readFileSync(f,'utf8').replace(/\r\n/g,'\n')]));
const inline=data['index.html'].match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert(inline,'Missing inline app');
for(const f of files.slice(1))new vm.Script(data[f],{filename:f});
new vm.Script(inline,{filename:'index-inline.js'});
const extract=(src,regex,label)=>{const v=src.match(regex);assert(v,'Missing data: '+label);return JSON.parse(v[1])};
const practices=extract(data['index.html'],/const D=(\{[\s\S]*?\});let view=/,'Volume I').practices;
const v2=extract(data['volume2.js'],/const V2=(\[[\s\S]*?\]);\n/,'Volume II');
const b345=extract(data['volumes345.js'],/const BOOKS=(\{[\s\S]*?\})\.volumes;/,'Volume III-V').volumes;
const cards=extract(data['oracle.js'],/const CARDS=(\[[\s\S]*?\]);\n/,'Oracle');
const sources=extract(data['source-guide.js'],/const SOURCES=(\[[\s\S]*?\]);\nconst GLOSSARY/,'Source index');
const anchors=extract(data['study-plus.js'],/const ORACLE_LESSON_ANCHORS=(\[[\s\S]*?\]);\nconst GUIDE_FALLBACK/,'Oracle links');
const protocols=extract(data['study-plus.js'],/const P=(\[[\s\S]*?\]);\nconst KEY=/,'Technical guides');
const counts=[practices.length,v2.reduce((n,c)=>n+c.lessons.length,0),...b345.map(b=>b.chapters.reduce((n,c)=>n+c.topics.length,0))];
assert.deepEqual(counts,[40,35,34,23,35]);
assert.equal(cards.length,78);
assert.equal(new Set(cards.map(c=>c.id)).size,78);
assert.equal(anchors.length,78);
assert.equal(new Set(protocols.map(p=>p.key)).size,protocols.length);
assert.equal(sources.reduce((n,b)=>n+b.chapters.reduce((m,c)=>m+c[3].length,0),0),138);
const normalized=x=>String(x).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim();
const volumeTwoSources=sources.find(x=>x.n===2).chapters.flatMap(c=>c[3].map(t=>normalized(t[1])));
for(const section of v2.flatMap(c=>c.lessons))assert(volumeTwoSources.includes(normalized(section.name)),'Volume II missing source mapping: '+section.name);
const lessonTitles=[
 ...practices.map(p=>p.title),
 ...v2.flatMap(c=>c.lessons.map(l=>l.name)),
 ...b345.flatMap(b=>b.chapters.flatMap(c=>c.topics.map(t=>t[0])))
].map(normalized);
for(let n=0;n<78;n++)assert(lessonTitles.includes(normalized(anchors[n])),'Missing source for Oracle card '+(n+1));
for(const b of sources)for(const c of b.chapters)for(const t of c[3])assert(lessonTitles.includes(normalized(t[1])),'Missing index mapping '+t[0]);
let rendered='',extras=[],els={};
const nav={querySelector(){return null},appendChild(){},before(node){extras.push(node.innerHTML)}};
const h1={nextElementSibling:{matches(){return true},insertAdjacentElement(_,el){extras.push(el.innerHTML)}},insertAdjacentElement(_,el){extras.push(el.innerHTML)}};
const root={
 set innerHTML(v){rendered=v;extras=[]},
 get innerHTML(){return rendered},
 querySelector(selector){return selector==='nav.tabs'?nav:null},
 querySelectorAll(selector){return selector==='h1'?[h1]:[]},
 appendChild(el){extras.push(el.innerHTML)}
};
const document={
 getElementById(id){return id==='root'?root:(els[id]??={value:'',textContent:'',innerHTML:'',setAttribute(){},focus(){},setSelectionRange(){},selectionStart:0})},
 querySelector(){return null},
 querySelectorAll(selector){return selector==='[data-rt-step]'?Array.from({length:4},()=>({checked:true})):[]},
 createElement(tag){return {tag,innerHTML:'',textContent:'',className:'',style:{},setAttribute(){},appendChild(){},insertAdjacentElement(){}}},
 head:{appendChild(){}}
};
const saved=new Map();
const localStorage={getItem(k){return saved.get(k)??null},setItem(k,v){saved.set(k,String(v))}};
class FileReader{readAsText(file){this.result=file.text;this.onload?.()}}
const window={scrollTo(){}};
const sandbox=vm.createContext({document,window,localStorage,FileReader,clearInterval(){},setInterval(){return 1},setTimeout(){},alert(){},Date,Blob:class{},console});
for(const src of [inline,...files.slice(1).map(f=>data[f])])vm.runInContext(src,sandbox);
const appState=vm.runInContext('state',sandbox);
const visit=(label,fn)=>{fn();assert(rendered.length>300,'Empty screen: '+label)};
visit('Home',()=>sandbox.app('inicio'));
visit('Source index',()=>window.rtSourceAuditOpen());
visit('Practice index',()=>window.rtIndexOpen());
for(let i=0;i<practices.length;i++)visit('Vol I '+i,()=>sandbox.app('practica',i));
for(let c=0;c<v2.length;c++)for(let i=0;i<v2[c].lessons.length;i++)visit('Vol II '+c+'/'+i,()=>window.v2Open('leccion',c,i));
for(const b of b345)for(let c=0;c<b.chapters.length;c++)for(let i=0;i<b.chapters[c].topics.length;i++)visit('Vol '+b.number+' '+c+'/'+i,()=>window.openVol(b.number,'lesson',c,i));
for(let i=0;i<78;i++){
 visit('Oracle '+(i+1),()=>window.oracleOpen('carta',i));
 assert(extras.some(h=>h.includes('MAPA DE CONEXIONES')),'Missing links for card '+(i+1));
}
for(const [label,go] of [
 ['vol I',()=>sandbox.app('practica',0)],
 ['vol II',()=>window.v2Open('leccion',0,0)],
 ['vol III',()=>window.openVol(3,'lesson',0,0)],
 ['vol IV',()=>window.openVol(4,'lesson',0,0)],
 ['vol V',()=>window.openVol(5,'lesson',0,0)]
]){
 go();
 for(const f of ['situation','observation','action','review'])document.getElementById('rt-'+f).value=f==='situation'?'Ejemplo de práctica':f;
 window.rtSave();
}
assert.equal(appState.rtHistory.length,5);
assert.equal(appState.entries.length,5);
assert.equal(appState.done.length,1);
assert.equal(appState.v2Done.length,1);
assert.equal(appState.extraCompleted.length,3);
assert(localStorage.getItem('transurfing-v1')?.includes('"rtHistory"'),'History not included in backup');
const recent=appState.rtHistory[0];
document.getElementById('rt-review-'+recent.timestamp).value='Revisión posterior';
window.rtUpdateReview(recent.timestamp);
assert.equal(appState.rtHistory[0].review,'Revisión posterior');
assert(appState.entries[0].text.includes('Revisión posterior'));
const draftKey='v5-0-0';
window.openVol(5,'lesson',0,0);
document.getElementById('rt-situation').value='Borrador de prueba';
window.rtDraftChanged();
assert.equal(appState.rtDrafts[draftKey].situation,'Borrador de prueba');
assert(localStorage.getItem('transurfing-v1')?.includes('Borrador de prueba'));
// Regression: una copia manipulada nunca debe añadir sesiones ni progreso.
const beforeInvalid=appState.rtHistory.length;
for(const payload of [
 {done:[],fav:[],entries:[],rtHistory:[{id:'v1-p01',timestamp:'0);alert(123)//'}]},
 {done:['FAKE-ID'],fav:[],entries:[]}
]){
 const input={files:[{size:JSON.stringify(payload).length,text:JSON.stringify(payload)}],value:'test'};
 sandbox.importData(input);
 assert.equal(vm.runInContext('state.rtHistory.length',sandbox),beforeInvalid);
 assert(!vm.runInContext('state.done.includes("FAKE-ID")',sandbox));
}
console.log('PASS: all 167 activities, 78 oracle cards, 138 source references, five progress systems, diary, review and draft persistence');
