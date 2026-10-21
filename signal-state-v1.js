/* The receiver asks the server which signal is still available. No progress is stored here. */
(()=>{
 if(window.receiverSignalReady)return;
 const base='https://receiver-03-api.enstainmoris.workers.dev',originalFetch=window.fetch.bind(window);
 let screen=null,checking=null,firstCheck=true;
 const css='/receiver-04/signal-state-v1.css?v=2';
 const sheet=document.createElement('link');sheet.rel='stylesheet';sheet.href=css;document.head.append(sheet);
 function credential(){try{return localStorage.getItem('receiver04-capability-v1')||localStorage.getItem('receiver03-session-v1');}catch{return null;}}
 async function show(data,token){
  if(screen||data?.ended!==true||typeof data.phrase!=='string'||data.face!=='/api/aftermath/face')return;
  document.documentElement.classList.add('signal-hidden');
  screen=document.createElement('div');screen.dataset.signalScreen='';
  const root=screen.attachShadow({mode:'open'}),style=document.createElement('link');style.rel='stylesheet';style.href=css;
  const main=document.createElement('main'),image=document.createElement('img'),phrase=document.createElement('p');
  main.className='signal-final-main';image.className='signal-final-image';phrase.className='signal-final-phrase';
  image.alt='';phrase.textContent=data.phrase;main.append(image,phrase);root.append(style,main);document.documentElement.append(screen);
  if(document.body){document.body.inert=true;for(const media of document.querySelectorAll('audio,video'))media.pause();}
  document.addEventListener('play',event=>{if(document.body?.contains(event.target)&&typeof event.target.pause==='function')event.target.pause();},true);
  if(data.music==='/api/aftermath/music')window.receiverFinalSound?.(root,{loadMusic:async()=>{const response=await originalFetch(base+data.music,{headers:{Authorization:'Bearer '+token},credentials:'omit',cache:'no-store',redirect:'error'});if(!response.ok)throw Error('CONNECTION');return response.blob();}});
  try{const response=await originalFetch(base+data.face,{headers:{Authorization:'Bearer '+token},credentials:'omit',cache:'no-store',redirect:'error'});if(response.ok)image.src=URL.createObjectURL(await response.blob());}catch{}
 }
 async function check(){
  if(screen)return true;if(checking)return checking;
  const token=credential();if(!token)return false;
  if(firstCheck)document.documentElement.classList.add('signal-hidden');firstCheck=false;
  checking=(async()=>{const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),6000);
   try{const response=await originalFetch(base+'/api/aftermath/status',{headers:{Authorization:'Bearer '+token},credentials:'omit',cache:'no-store',redirect:'error',signal:controller.signal});if(response.ok){const data=await response.json();await show(data,token);return data.ended===true;}return false;}
   catch{return false;}finally{clearTimeout(timer);checking=null;if(!screen)document.documentElement.classList.remove('signal-hidden');}
  })();return checking;
 }
 window.fetch=async(...args)=>{
  const response=await originalFetch(...args);
  const target=new URL(typeof args[0]==='string'?args[0]:args[0].url,location.href);
  if(target.origin===base&&response.status===423){try{await show(await response.clone().json(),credential());}catch{}}
  return response;
 };
 window.receiverSignalReady=check();
 window.addEventListener('pageshow',()=>{void check();});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)void check();});
 // Long-open static pages also learn about a gate entered in another tab.
 setInterval(()=>{if(!document.hidden&&!screen)void check();},30000);
})();
