(()=>{
 window.receiverFinalSound=(root,{loadMusic}={})=>{
  if(root.receiverFinalSound)return root.receiverFinalSound;
  const key='black-ether:vega-sound:v1',audio=document.createElement('audio'),button=document.createElement('button');
  let desired=true,ready=false,pending=null;
  try{const p=JSON.parse(localStorage.getItem(key)||'null');if(p?.version===1&&typeof p.muted==='boolean')desired=!p.muted;}catch{}
  audio.hidden=true;audio.loop=true;audio.volume=.16;audio.preload='none';audio.dataset.finalAudio='true';
  button.type='button';button.className='signal-final-sound';
  const update=()=>{const active=desired&&!audio.paused;button.textContent=active?'♫':'♫̸';button.title=active?'Выключить звук':'Включить звук';button.setAttribute('aria-label',button.title);button.setAttribute('aria-pressed',String(active));};
  const play=()=>{if(!desired||document.hidden){audio.pause();update();return;}if(!ready)return;try{Promise.resolve(audio.play()).then(update).catch(update);}catch{update();}};
  const prepare=()=>{
   if(pending)return pending;
   pending=Promise.resolve().then(loadMusic).then(value=>{audio.src=typeof value==='string'?value:URL.createObjectURL(value);ready=true;play();}).catch(()=>{ready=false;}).finally(()=>{pending=null;update();});
   return pending;
  };
  button.addEventListener('click',()=>{desired=audio.paused;try{localStorage.setItem(key,JSON.stringify({version:1,muted:!desired}));}catch{}if(ready)play();else void prepare();});
  const unlock=e=>{if(e.composedPath().includes(button)||e.ctrlKey||e.metaKey||e.altKey)return;play();};
  document.addEventListener('pointerdown',unlock,true);document.addEventListener('keydown',unlock,true);
  document.addEventListener('visibilitychange',play);
  audio.addEventListener('playing',update);audio.addEventListener('pause',update);audio.addEventListener('error',()=>{ready=false;update();});
  root.append(audio,button);update();const result={audio,button,ready:prepare()};root.receiverFinalSound=result;return result;
 };
 const root=document.querySelector('[data-final-sound]');
 if(root)window.receiverFinalSound(root,{loadMusic:()=>'/api/aftermath/music'});
})();
