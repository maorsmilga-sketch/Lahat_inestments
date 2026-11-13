/* Lahat tutorial: small manual-launch button; no first-visit autoplay. */
(()=>{'use strict';
const SRC='./lahat_tutorial_with_logo.mp4';
function openTutorial(){
 if(document.getElementById('lahat-tutorial-modal'))return;
 const overlay=document.createElement('div');overlay.id='lahat-tutorial-modal';
 overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-label','סרטון הדמיה');
 overlay.style.cssText='position:fixed;inset:0;z-index:2147483647;background:rgba(0,0,0,.94);display:flex;align-items:center;justify-content:center;padding:14px;box-sizing:border-box';
 const wrap=document.createElement('div');wrap.style.cssText='width:min(100%,440px);max-height:96dvh;display:flex;flex-direction:column;align-items:center;gap:10px';
 const video=document.createElement('video');video.src=SRC;video.controls=true;video.playsInline=true;video.preload='metadata';video.style.cssText='width:100%;max-height:82dvh;object-fit:contain;border-radius:14px;background:#000';
 const close=document.createElement('button');close.type='button';close.textContent='סגור ✕';close.style.cssText='border:1px solid #c9a15c;background:#1c1c1c;color:#f1d292;border-radius:10px;padding:9px 22px;cursor:pointer;font:inherit';
 const dismiss=()=>{video.pause();overlay.remove();document.removeEventListener('keydown',esc)};
 const esc=e=>{if(e.key==='Escape')dismiss()};
 close.addEventListener('click',dismiss);video.addEventListener('ended',dismiss,{once:true});
 overlay.addEventListener('click',e=>{if(e.target===overlay)dismiss()});
 document.addEventListener('keydown',esc);
 wrap.append(video,close);overlay.append(wrap);document.body.append(overlay);
 video.play().catch(()=>{/* Browser may require pressing Play in video controls. */});
}
function mount(){
 if(document.getElementById('lahat-tutorial-trigger'))return;
 const button=document.createElement('button');button.id='lahat-tutorial-trigger';button.type='button';
 button.textContent='▶ סרטון הדמיה';button.setAttribute('aria-label','צפה בסרטון הדמיה');
 button.style.cssText='position:fixed;top:calc(env(safe-area-inset-top, 0px) + 100px);left:12px;z-index:900;border:1px solid #b8924e;background:#18191d;color:#e6bd72;border-radius:18px;padding:6px 10px;font-size:11px;line-height:1.2;cursor:pointer;box-shadow:0 2px 8px #0008';
 button.addEventListener('click',openTutorial);
 document.body.append(button);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();