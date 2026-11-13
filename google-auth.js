/* Lahat CRM Google sign-in: automatic One Tap, user-initiated Drive consent. */
(()=>{'use strict';
const CLIENT_ID='947329082689-tte714ec71kirhvptt8d84iqqe5ipnrh.apps.googleusercontent.com';
let client=null,token=null,profile=null,expires=0,loginPrompted=false;
const css=document.createElement('style');css.textContent='.lahat-google-auth{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin:12px 0}.lahat-google-auth button{border:1px solid #cba45d;background:#1a2029;color:#f4d28d;border-radius:9px;padding:8px 12px;cursor:pointer;font-size:12px}.lahat-google-auth span{font-size:11px;color:#bdc4cb}.lahat-google-auth .google-status{max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}';document.head.appendChild(css);
const status=m=>document.querySelectorAll('.lahat-google-auth .google-status').forEach(el=>el.textContent=m);
function button(){return document.querySelector('.lahat-google-auth button')}
function paint(){if(button())button().textContent=token?'התנתק':'התחבר עם Google';status(token?(profile?.email||'מחובר'):'לא מחובר')}
function logout(){const old=token;token=null;profile=null;expires=0;sessionStorage.removeItem('lahat_google_email');if(old&&window.google?.accounts?.oauth2)google.accounts.oauth2.revoke(old,()=>{});window.dispatchEvent(new Event('lahat:logout'));paint()}
function login(interactive=true){if(!client){status('Google עדיין נטען');return}client.requestAccessToken({prompt:interactive?'consent':''})}
function mount(){const sidebar=document.querySelector('aside>div');if(!sidebar||document.querySelector('.lahat-google-auth'))return;const box=document.createElement('div');box.className='lahat-google-auth no-print';const btn=document.createElement('button');btn.type='button';btn.textContent='התחבר עם Google';btn.addEventListener('click',()=>token?logout():login(true));const txt=document.createElement('span');txt.className='google-status';txt.textContent='מתחבר ל-Google…';box.append(btn,txt);sidebar.appendChild(box)}
async function authorized(r){if(r.error||!r.access_token){status('נדרשת התחברות ל-Google');return}token=r.access_token;expires=Date.now()+(Number(r.expires_in||3300)-60)*1000;try{const response=await fetch('https://www.googleapis.com/oauth2/v3/userinfo',{headers:{Authorization:'Bearer '+token}});if(response.ok)profile=await response.json()}catch(e){console.warn('Profile unavailable',e)}if(profile?.email)sessionStorage.setItem('lahat_google_email',profile.email);paint();window.dispatchEvent(new Event('lahat:login'))}
function init(){if(!window.google?.accounts?.oauth2){status('שירות Google אינו זמין');return}
client=google.accounts.oauth2.initTokenClient({client_id:CLIENT_ID,scope:'openid email profile https://www.googleapis.com/auth/drive.file',callback:authorized});
window.lahatGoogleAuth={getAccessToken:()=>token&&Date.now()<expires?token:null,getProfile:()=>profile,login,logout};
if(sessionStorage.getItem('lahat_google_email')){status('משחזר התחברות…');login(false)}
else{google.accounts.id.initialize({client_id:CLIENT_ID,callback:()=>{if(!token)login(false)},auto_select:true});google.accounts.id.prompt();status('ממתין לזיהוי Google')}
setInterval(()=>{if(token&&Date.now()>=expires){token=null;paint();status('פג תוקף ההתחברות — יש להתחבר מחדש')}},30000)
}
function boot(){mount();const script=document.createElement('script');script.src='https://accounts.google.com/gsi/client';script.async=true;script.onload=init;script.onerror=()=>status('לא ניתן לטעון Google');document.head.appendChild(script)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();