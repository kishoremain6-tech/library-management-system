const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function toast(msg,type='good'){let t=document.getElementById('toasts');if(!t){t=document.createElement('div');t.id='toasts';document.body.append(t);}
 const d=document.createElement('div');d.className='toast '+type;d.textContent=msg;t.append(d);setTimeout(()=>d.remove(),3500);}
async function api(url,method='GET',body){
 try{const r=await fetch(url,{method,headers:body?{'Content-Type':'application/json'}:{},body:body?JSON.stringify(body):undefined});
  const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.message||'Request failed ('+r.status+')');return d;
 }catch(e){if(e instanceof TypeError)throw new Error('Cannot reach the server. Is it running?');throw e;}}
async function requireUser(){try{return (await api('/api/auth/me')).user;}catch{location.href='/index.html';}}
function shell(user,active){
 const l=[['dashboard.html','Dashboard'],['books.html','Books']];
 document.querySelector('.side').innerHTML='<h2>📚 Library</h2>'+l.map(([h,t])=>`<a href="${h}" class="${h===active?'active':''}">${t}</a>`).join('')+
  `<a href="#" id="out">Logout (${esc(user.name)})</a>`;
 document.getElementById('out').onclick=async e=>{e.preventDefault();await api('/api/auth/logout','POST');location.href='/index.html';};}
function counter(el,to){let n=0;const step=Math.max(1,Math.ceil(to/30));const i=setInterval(()=>{n=Math.min(to,n+step);el.textContent=n;if(n>=to)clearInterval(i);},25);}
