/* Navegación enlazable con historial; mantiene las rutas mediante hash sin servidor. */
(function(){
 'use strict';
 if(typeof window==='undefined'||!window.location||!window.history)return;
 let restoring=false;
 const moveFocus=()=>{const h=document.querySelector('#root h1');if(h){h.setAttribute('tabindex','-1');h.focus({preventScroll:true})}};
 function updateTitle(){const h=document.querySelector('#root h1');document.title=(h?.textContent?.trim().replace(/\s+/g,' ')||'Academia')+' · Reality Transurfing'}
 function hook(name,route){
  const original=window[name];if(typeof original!=='function')return;
  window[name]=function(...args){
   const result=original.apply(this,args);
   if(!restoring){const hash=route(...args);if(hash&&location.hash!==hash)history.pushState(null,'',hash)}
   updateTitle();if(!restoring)moveFocus();return result;
  };
 }
 hook('app',(mode,i)=>mode==='practica'&&typeof i==='number'&&D.practices[i]?'#practica/'+encodeURIComponent(D.practices[i].id):mode==='capitulo'?'#capitulo/'+i:'#'+mode);
 hook('v2Open',(mode,ci=0,li=0)=>'#volumen/2/'+mode+'/'+ci+'/'+li);
 hook('openVol',(n,mode='home',ci=0,li=0)=>'#volumen/'+n+'/'+mode+'/'+ci+'/'+li);
 hook('oracleOpen',(mode,idx)=>'#oraculo/'+mode+(mode==='carta'&&typeof idx==='number'?'/'+(idx+1):''));
 hook('rtIndexOpen',()=>'#mapa');
 hook('rtSourceAuditOpen',()=>'#fuentes');
 function restore(){
  const parts=decodeURIComponent(location.hash.slice(1)).split('/');if(!parts[0])return;
  restoring=true;
  try{
   if(parts[0]==='practica'){
    const i=D.practices.findIndex(x=>x.id===parts[1]);if(i>=0)window.app('practica',i)
   }else if(parts[0]==='capitulo'&&Number.isInteger(Number(parts[1])))window.app('capitulo',Number(parts[1]));
   else if(parts[0]==='volumen'){
    const n=Number(parts[1]),ci=Number(parts[3])||0,li=Number(parts[4])||0;
    if(n===2&&typeof window.v2Open==='function')window.v2Open(parts[2]||'inicio',ci,li);
    else if([3,4,5].includes(n)&&typeof window.openVol==='function')window.openVol(n,parts[2]||'home',ci,li)
   }else if(parts[0]==='oraculo'&&typeof window.oracleOpen==='function'){
    const idx=Number(parts[2]);window.oracleOpen(parts[1]||'inicio',Number.isInteger(idx)&&idx>=1&&idx<=78?idx-1:undefined);
   }else if(parts[0]==='mapa')window.rtIndexOpen?.();
   else if(parts[0]==='fuentes')window.rtSourceAuditOpen?.();
   else if(['inicio','biblioteca','favoritos','diario'].includes(parts[0]))window.app(parts[0]);
  }finally{restoring=false;updateTitle();moveFocus()}
 }
 window.addEventListener('popstate',restore);
 window.addEventListener('hashchange',restore);
 if(location.hash)restore();else updateTitle();
})();
