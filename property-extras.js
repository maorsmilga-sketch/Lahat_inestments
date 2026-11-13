/* Property form enhancements and private Drive attachments. Existing stored prices remain in ILS. */
(()=>{'use strict';
const $=id=>document.getElementById(id),auth=()=>window.lahatGoogleAuth?.getAccessToken?.();
const css=document.createElement('style');css.textContent='.lahat-room-options{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0}.lahat-room-options button,.lahat-attachment-btn{border:1px solid #b99555;background:#232323;color:#efd29a;border-radius:9px;padding:8px 11px;cursor:pointer}.lahat-room-options button.active{background:#c7a15b;color:#161616}.lahat-attachment-list{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0}.lahat-attachment-list button{border:1px solid #96763e;background:#17191c;color:#e9c784;border-radius:8px;padding:7px 9px}.lahat-attachment-list .delete{color:#f4a6a6}.lahat-attachment-status{font-size:12px;color:#e4c07a}';document.head.appendChild(css);
const safe=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let selectedId=null,queued=[],saving=false;
function setupForm(){
 const price=$('price'),rooms=$('rooms'),city=$('city');if(!price||!rooms||!city)return;
 if(!price.dataset.lahatMillions){price.dataset.lahatMillions='1';price.step='0.01';price.min='0';price.placeholder='לדוגמה 2.5';const label=price.closest('label');if(label)label.firstChild.textContent='מחיר מבוקש (במיליוני ₪)';}
 if(!rooms.dataset.lahatButtons){
 rooms.dataset.lahatButtons='1';rooms.style.display='none';const holder=document.createElement('div');holder.className='lahat-room-options';const other=document.createElement('input');other.type='number';other.min='0';other.step='0.5';other.placeholder='מספר חדרים';other.style.cssText='display:none;width:100%;margin-top:6px';const buttons=[];
 const update=()=>{const v=Number(rooms.value);for(const b of buttons)b.classList.toggle('active',b.dataset.value===String(v));const isOther=!!rooms.value&&!['1','2','3','4','5'].includes(String(v));other.style.display=isOther?'block':'none';if(isOther)other.value=rooms.value};
 for(const n of [1,2,3,4,5]){const b=document.createElement('button');b.type='button';b.textContent=String(n);b.dataset.value=String(n);b.onclick=()=>{rooms.value=String(n);update()};buttons.push(b);holder.append(b)}
 const more=document.createElement('button');more.type='button';more.textContent='אחר';more.onclick=()=>{other.style.display='block';other.focus();for(const b of buttons)b.classList.remove('active')};holder.append(more);other.oninput=()=>{rooms.value=other.value};rooms.insertAdjacentElement('afterend',holder);holder.insertAdjacentElement('afterend',other);rooms._lahatUpdate=update;
 }
 if(!$('lahat-attachment-picker')){
 const picker=document.createElement('input');picker.type='file';picker.multiple=true;picker.id='lahat-attachment-picker';picker.accept='.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,.jpg,.jpeg,.png,.webp,.ppt,.pptx';picker.style.width='100%';picker.onchange=()=>{queued=[...picker.files];const st=$('lahat-attachment-status');if(st)st.textContent=queued.length+' קבצים ממתינים להעלאה עם שמירת הנכס'};
 const label=document.createElement('label');label.className='field';label.textContent='מסמכים וקבצים מצורפים (נשמרים ב־Drive)';label.append(picker);
 const status=document.createElement('div');status.id='lahat-attachment-status';status.className='lahat-attachment-status';
 const list=document.createElement('div');list.id='lahat-attachment-list';list.className='lahat-attachment-list';
 const photo=$('photo');photo.closest('label').insertAdjacentElement('afterend',label);label.insertAdjacentElement('afterend',status);status.insertAdjacentElement('afterend',list);
 }
}
function refreshForm(){const p=typeof prop==='function'?prop(editId):null;selectedId=p?.id||null;queued=[];const picker=$('lahat-attachment-picker');if(picker)picker.value='';const city=$('city');if(city&&!p)city.value='עפולה';const price=$('price');if(price)price.value=p?.price?String(Number(p.price)/1000000):'';const rooms=$('rooms');if(rooms){rooms.value=p?.rooms??'';rooms._lahatUpdate?.()}renderAttachments(p)}
function renderAttachments(p){const list=$('lahat-attachment-list');if(!list)return;list.replaceChildren();for(const item of p?.attachments||[]){const b=document.createElement('button');b.type='button';b.textContent='📎 '+item.name;b.onclick=()=>openFile(item);list.append(b);const del=document.createElement('button');del.type='button';del.textContent='הסר';del.className='delete';del.onclick=()=>removeFile(p.id,item.id);list.append(del)}}
function status(t){const s=$('lahat-attachment-status');if(s)s.textContent=t}
async function uploadFile(file,parentId){const token=auth();if(!token)throw Error('יש להתחבר ל־Google');const boundary='lahat'+Math.random().toString(36).slice(2);const metadata={name:file.name,mimeType:file.type||'application/octet-stream',parents:[parentId]};const body=new Blob(['--'+boundary+'\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n',JSON.stringify(metadata),'\r\n--'+boundary+'\r\nContent-Type: '+(file.type||'application/octet-stream')+'\r\n\r\n',file,'\r\n--'+boundary+'--'],{type:'multipart/related; boundary='+boundary});const r=await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType',{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'multipart/related; boundary='+boundary},body});if(!r.ok)throw Error('Google Drive '+r.status);return await r.json()}
async function openFile(item){const token=auth();if(!token){alert('יש להתחבר ל־Google');return}const w=window.open('','_blank');try{const r=await fetch('https://www.googleapis.com/drive/v3/files/'+encodeURIComponent(item.id)+'?alt=media',{headers:{Authorization:'Bearer '+token}});if(!r.ok)throw Error('Google Drive '+r.status);const blob=await r.blob();const url=URL.createObjectURL(blob);if(w){w.location.href=url;setTimeout(()=>URL.revokeObjectURL(url),120000)}else{const a=document.createElement('a');a.href=url;a.download=item.name;a.click();setTimeout(()=>URL.revokeObjectURL(url),120000)}}catch(e){if(w)w.close();alert('לא ניתן לפתוח את הקובץ: '+e.message)}}
function removeFile(propertyId,fileId){if(!confirm('להסיר את הקובץ מרשימת הצרופות?'))return;const p=prop(propertyId);if(!p)return;p.attachments=(p.attachments||[]).filter(x=>x.id!==fileId);save();renderAttachments(p);renderProperties()}
function patch(){
 setupForm();
 if(typeof openForm==='function'&&!openForm._lahatEnhanced){const original=openForm;openForm=function(id){original(id);refreshForm()};openForm._lahatEnhanced=true}
 if(typeof closeForm==='function'&&!closeForm._lahatEnhanced){const original=closeForm;closeForm=function(){queued=[];original()};closeForm._lahatEnhanced=true}
 if(typeof saveProperty==='function'&&!saveProperty._lahatEnhanced){
 const original=saveProperty;saveProperty=async function(){
 if(saving)return;
 const price=$('price'),raw=price.value.trim().replace(',','.');if(raw&&(!Number.isFinite(Number(raw))||Number(raw)<0)){alert('יש להזין מחיר תקין במיליונים');return}
 const oldPrice=price.value;const editing=editId;const oldIds=new Set((db.properties||[]).map(p=>p.id));
 const current=editing?prop(editing):null;
 let added=[];
 if(queued.length){
 if(!window.lahatDriveSync?.isReady?.()){alert('כדי לצרף מסמכים יש להתחבר ל־Google ולהפעיל שמירה בענן');return}
 const parent=window.lahatDriveSync.getFolderId?.();if(!parent){alert('תיקיית Google Drive אינה זמינה');return}
 saving=true;
 try{for(const file of queued){if(file.size>15*1024*1024)throw Error('גודל קובץ מרבי 15MB');status('מעלה '+file.name+'…');const uploaded=await uploadFile(file,parent);added.push({id:uploaded.id,name:file.name,mimeType:file.type||'application/octet-stream'})}}catch(e){saving=false;status('העלאת צרופה נכשלה: '+e.message);return}
 }
 price.value=raw?String(Number(raw)*1000000):'';
 try{await original()}finally{price.value=oldPrice;saving=false}
 const p=editing?prop(editing):(db.properties||[]).find(x=>!oldIds.has(x.id));
 if(!p)return;
 if(current?.attachments?.length||added.length){p.attachments=[...(current?.attachments||[]),...added];try{save()}catch(e){status('שגיאה בשמירת רשימת הצרופות');return}}
 queued=[];renderAttachments(p);status(added.length?'הצרופות נשמרו ב־Google Drive ✓':'');
 };saveProperty._lahatEnhanced=true}
 if(typeof renderProperties==='function'&&!renderProperties._lahatEnhanced){
 const original=renderProperties;renderProperties=function(){original();const list=$('propertyList');if(!list)return;const cards=[...list.querySelectorAll('.property')];const query=$('search')?.value.trim()||'';const props=(db.properties||[]).filter(p=>title(p).includes(query));cards.forEach((card,i)=>{const p=props[i];if(!p||card.querySelector('.lahat-attachment-btn'))return;const btn=document.createElement('button');btn.type='button';btn.className='lahat-attachment-btn';btn.textContent='📎 צרופות ('+(p.attachments?.length||0)+')';btn.onclick=()=>{openForm(p.id);$('lahat-attachment-picker')?.scrollIntoView({behavior:'smooth',block:'center'})};card.append(btn)})};renderProperties._lahatEnhanced=true}
}
function start(){patch();setTimeout(patch,700)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();