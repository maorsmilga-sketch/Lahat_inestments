/* First-visit tutorial. Does not alter existing app functionality. */
(()=>{'use strict';
const KEY='lahat_intro_watched_v1',SRC='./lahat-tutorial.mp4';
if(localStorage.getItem(KEY)==='1')return;
function done(overlay,video){try{localStorage.setItem(KEY,'1')}catch(e){}video.pause();overlay.remove()}
async function boot(){
 if(localStorage.getItem(KEY)==='1')return;
 const check=await fetch(SRC,{method:'HEAD',cache:'no-store'}).catch(()=>null);
 if(!check?.ok||!(check.headers.get('content-type')||'').includes('video')){console.warn('Lahat tutorial video missing; intro not shown');return}
 const style=document.createElement('style');style.textContent='#lahat-intro{position:fixed;inset:0;z-index:2147483647;background:rgba(0,0,0,.94);display:flex;align-items:center;justify-content:center;padding:14px;box-sizing:border-box}#lahat-intro .wrap{position:relative;width:min(100%,440px);max-height:96dvh;display:flex;flex-direction:column;gap:10px;align-items:center}#lahat-intro video{width:100%;max-height:82dvh;object-fit:contain;border-radius:16px;background:#080808}#lahat-intro button{border:1px solid #c9a15c;border-radius:12px;padding:10px 19px;color:#f1d292;background:#181818;font:inherit;cursor:pointer}#lahat-intro .controls{display:flex;gap:10px;justify-content:center;flex-wrap:wrap}';document.head.appendChild(style);
 const overlay=document.createElement('div');overlay.id='lahat-intro';overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-label','סרטון הדרכה ראשוני');
 const wrap=document.createElement('div');wrap.className='wrap';const video=document.createElement('video');video.src=SRC;video.playsInline=true;video.autoplay=true;video.preload='auto';video.controls=false;video.muted=true;video.setAttribute('playsinline','');const controls=document.createElement('div');controls.className='controls';
 const sound=document.createElement('button');sound.textContent='הפעל קול';sound.onclick=()=>{video.muted=false;video.play().catch(()=>{});sound.remove()};
 const skip=document.createElement('button');skip.textContent='דלג והמשך לאפליקציה';skip.onclick=()=>done(overlay,video);
 controls.append(sound,skip);wrap.append(video,controls);overlay.append(wrap);document.body.append(overlay);
 video.addEventListener('ended',()=>done(overlay,video),{once:true});
 video.addEventListener('error',()=>{console.warn('Intro video failed');overlay.remove()},{once:true});
 try{await video.play()}catch(e){const play=document.createElement('button');play.textContent='הפעל סרטון';play.onclick=()=>{video.muted=false;video.play().catch(()=>{});play.remove()};controls.prepend(play)}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();