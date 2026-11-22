const API = 'https://lukasss895.jozkobukva6.workers.dev'; // adresa tvojho Workera (bez / na konci)

// ==PURE==
const WEAPONS={1:'Desert Eagle',2:'Dual Berettas',3:'Five-SeveN',4:'Glock-18',7:'AK-47',8:'AUG',9:'AWP',10:'FAMAS',11:'G3SG1',13:'Galil AR',14:'M249',16:'M4A4',17:'MAC-10',19:'P90',24:'UMP-45',25:'XM1014',26:'PP-Bizon',27:'MAG-7',28:'Negev',29:'Sawed-Off',30:'Tec-9',31:'Zeus x27',32:'P2000',33:'MP7',34:'MP9',35:'Nova',36:'P250',38:'SCAR-20',39:'SG 553',40:'SSG 08',42:'Knife (CT)',59:'Knife (T)',60:'M4A1-S',61:'USP-S',63:'CZ75-Auto',64:'R8 Revolver',500:'Bayonet',505:'Flip Knife',506:'Gut Knife',507:'Karambit',508:'M9 Bayonet',509:'Huntsman Knife',512:'Falchion Knife',514:'Bowie Knife',515:'Butterfly Knife',516:'Shadow Daggers'};
const STICKER_DEF=1209;
function parseKV(t){let i=0;const n=t.length;
  const ws=()=>{while(i<n){if(/\s/.test(t[i]))i++;else if(t[i]==='/'&&t[i+1]==='/'){while(i<n&&t[i]!=='\n')i++}else break}};
  const tok=()=>{ws();if(i>=n)return null;const c=t[i];if(c==='{'||c==='}'){i++;return c}
    let s='';if(c==='"'){i++;while(i<n&&t[i]!=='"'){if(t[i]==='\\'&&i+1<n)s+=t[i++];s+=t[i++]}i++}else while(i<n&&!/[\s{}"]/.test(t[i]))s+=t[i++];return{s}};
  const block=()=>{const o=[];for(;;){const k=tok();if(k===null||k==='}')return o;if(k==='{')continue;const v=tok();if(v==='{')o.push([k.s,block()]);else if(v&&v.s!==undefined)o.push([k.s,v.s]);else return o}};
  return block()}
function serKV(p,d=0){const T='\t'.repeat(d);return p.map(([k,v])=>Array.isArray(v)?`${T}"${k}"\n${T}{\n${serKV(v,d+1)}${T}}\n`:`${T}"${k}"\t\t"${v}"\n`).join('')}
const kids=(node,fmt)=>fmt==='kv'?node.map((p,i)=>[i,p[1]]).filter(x=>Array.isArray(x[1])):(Array.isArray(node)?node.map((v,i)=>[i,v]):Object.entries(node)).filter(x=>x[1]&&typeof x[1]==='object');
function findContainer(doc,fmt){const b={n:0,path:null};(function w(node,path){const k=kids(node,fmt);if(k.length>b.n){b.n=k.length;b.path=path}k.forEach(([i,v])=>w(v,path.concat([i])))})(doc,[]);return b.path}
const getAt=(doc,path,fmt)=>path.reduce((n,i)=>fmt==='kv'?n[i][1]:n[i],doc);
function buildInv(text){const t=text.trim();let fmt='kv',doc=null;
  if(t[0]==='{'||t[0]==='['){try{doc=JSON.parse(t);fmt='json'}catch(e){}}
  if(!doc)doc=parseKV(text);const path=findContainer(doc,fmt);if(!path)return null;
  const pre=JSON.parse(JSON.stringify(doc)),c=getAt(pre,path,fmt),items=kids(c,fmt).map(([k,v])=>({k:String(k),v}));
  if(fmt==='kv'){const keep=c.filter(p=>!Array.isArray(p[1]));c.splice(0,c.length,...keep);for(const it of items)it.k=String(it.k);
    const src=getAt(doc,path,fmt);items.forEach((it,j)=>{});items.length=0;src.filter(p=>Array.isArray(p[1])).forEach(p=>items.push({k:p[0],v:p[1]}))}
  else if(Array.isArray(c)){const keep=c.filter(x=>!(x&&typeof x==='object'));c.splice(0,c.length,...keep)}else for(const [k,v] of Object.entries(c))if(v&&typeof v==='object')delete c[k];
  return items.length?{format:fmt,path,pre,items}:null}
function serInv(inv){const d=JSON.parse(JSON.stringify(inv.pre)),c=getAt(d,inv.path,inv.format);
  if(inv.format==='kv'){inv.items.forEach(i=>c.push([i.k,i.v]));return serKV(d)}
  if(Array.isArray(c))inv.items.forEach(i=>c.push(i.v));else inv.items.forEach(i=>c[i.k]=i.v);return JSON.stringify(d,null,2)}
const AL={def_index:['def_index','defindex'],paint_index:['paint_index','paintindex'],rarity:['rarity'],custom_name:['custom_name','customname']};
const gv=(it,k)=>{const v=it.v;for(const a of AL[k]||[k]){if(Array.isArray(v)){const p=v.find(x=>x[0]===a&&!Array.isArray(x[1]));if(p)return p[1]}else if(v&&v[a]!==undefined&&typeof v[a]!=='object')return v[a]}return undefined};
function deepFind(v,re){if(Array.isArray(v)){for(const p of v){if(!Array.isArray(p)||p.length!==2||typeof p[0]!=='string')continue;
    if(Array.isArray(p[1])){const r=deepFind(p[1],re);if(r!==undefined)return r}else if(re.test(p[0])&&/^\d+$/.test(String(p[1])))return String(p[1])}}
  else if(v&&typeof v==='object'){for(const k in v){const x=v[k];if(x&&typeof x==='object'){const r=deepFind(x,re);if(r!==undefined)return r}else if(re.test(k)&&/^\d+$/.test(String(x)))return String(x)}}}
const RAR={'Consumer Grade':1,'Base Grade':1,'Industrial Grade':2,'High Grade':2,'Mil-Spec Grade':3,'Remarkable':3,'Restricted':4,'Exotic':4,'Classified':5,'Extraordinary':5,'Covert':6,'Contraband':6};
let CAT={skins:{},byPaint:{},stickers:{},ok:false};
async function loadCatalog(){const B='https://bymykel.github.io/CSGO-API/api/en/';
  try{const [sk,st]=await Promise.all([fetch(B+'skins.json').then(r=>r.json()),fetch(B+'stickers.json').then(r=>r.json())]);
    const rn=x=>RAR[typeof x==='object'&&x?x.name:x]||3;
    for(const x of sk){const w=x.weapon||{},pi=x.paint_index==null?0:+x.paint_index,e={n:x.name,i:x.image,r:rn(x.rarity)};
      if(w.weapon_id!=null&&!CAT.skins[w.weapon_id+'|'+pi])CAT.skins[w.weapon_id+'|'+pi]=e;if(w.name&&!CAT.skins[w.name+'|'+pi])CAT.skins[w.name+'|'+pi]=e;
      const pat=(typeof x.pattern==='object'&&x.pattern?x.pattern.name:x.pattern)||(x.name.split(' | ')[1]||'');if(pi&&!CAT.byPaint[pi])CAT.byPaint[pi]=pat}
    for(const x of st)CAT.stickers[String(x.id).replace('sticker-','')]={n:x.name,i:x.image,r:rn(x.rarity)};CAT.ok=true}catch(e){}}
function resolveItem(it){const d=+gv(it,'def_index')||0,p=+gv(it,'paint_index')||0,cn=gv(it,'custom_name'),own=+gv(it,'rarity')||0;
  if(d===STICKER_DEF){const id=deepFind(it.v,/sticker/i),s=id&&CAT.stickers[id],nm=s?s.n:'Sticker'+(id?' #'+id:'');
    return{w:'Sticker',s:nm.replace(/^Sticker \| /,''),full:nm,r:(own>=1&&own<=6)?own:(s?s.r:3),img:s?s.i:null}}
  const wn=WEAPONS[d]||(d?'Item '+d:'Predmet '+it.k),e=CAT.skins[d+'|'+p]||CAT.skins[wn+'|'+p];
  const skin=e?e.n.split(' | ').slice(1).join(' | ').replace(/^★ /,''):(p?(CAT.byPaint[p]||'Paint #'+p):'Vanilla'),label=cn?`"${cn}"`:skin;
  return{w:wn,s:label,full:wn+' | '+label,r:(own>=1&&own<=6)?own:(e?e.r:(d>=500&&d<=516?6:3)),img:e?e.i:null}}
const okItem=it=>{const d=+gv(it,'def_index');return !d||!!WEAPONS[d]||d===STICKER_DEF};
function nameOf(it){const r=resolveItem(it);return[r.w,r.s,r.full]}
// ==/PURE==

let TOKEN=localStorage.getItem('gc_token')||'',db={users:{},inventories:{},trades:[]},me=null,viewed=null,target=null,selMine=[],selTheirs=[];
if(location.hash.startsWith('#token=')){TOKEN=location.hash.slice(7);localStorage.setItem('gc_token',TOKEN);history.replaceState(null,'',location.pathname)}
const $=id=>document.getElementById(id);
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
async function api(p,body){try{const r=await fetch(API+p,{method:body?'POST':'GET',headers:{'content-type':'application/json',...(TOKEN?{authorization:'Bearer '+TOKEN}:{})},body:body?JSON.stringify(body):undefined});return await r.json()}catch(e){return{error:'Server nedostupný'}}}
async function refresh(){const d=await api('/api/data');if(d.error)return false;db=d;me=d.me&&d.users[d.me]?d.me:null;if(!me&&TOKEN){TOKEN='';localStorage.removeItem('gc_token')}return true}
const uname=s=>db.users[s]?db.users[s].name:s;
const items=s=>((db.inventories[s]&&db.inventories[s].items)||[]).filter(okItem);

document.addEventListener('DOMContentLoaded',async()=>{$('steam-login-btn').href=API+'/login';const ok=await Promise.all([refresh(),Promise.race([loadCatalog(),new Promise(r=>setTimeout(r,15000))])]).then(x=>x[0]);if(!ok)$('auth-error').textContent='Server nedostupný, skús neskôr.';if(me){viewed=me;showMainApp()}else showAuthPage()});

const PAGES=['auth','profile','inventory','trades','players'];
window.showPage=function(name){
  PAGES.forEach(p=>$('page-'+p).style.display='none');document.querySelectorAll('.navbar .nav-links a').forEach(a=>a.classList.remove('active'));
  if(name==='auth')$('page-auth').style.display='flex';else{$('page-'+name).style.display='block';$('nav-'+name).classList.add('active')}
  if(name==='profile')renderProfile(viewed||me);if(name==='inventory')renderSingleInventory(viewed||me);if(name==='trades')renderTradesPage();if(name==='players')renderPlayersList()};
function showAuthPage(){PAGES.forEach(p=>$('page-'+p).style.display='none');$('page-auth').style.display='flex';$('main-navbar').style.display='none'}
function showMainApp(){$('main-navbar').style.display='flex';$('nav-user-area').style.display='flex';$('nav-username').textContent=uname(me);
  const n=db.trades.filter(t=>t.to===me&&t.status==='pending').length;$('trade-badge').style.display=n?'inline':'none';$('trade-badge').textContent=n;showPage('profile')}
window.logout=function(){localStorage.removeItem('gc_token');TOKEN='';me=null;viewed=null;showAuthPage()};

function renderProfile(sid){const u=db.users[sid];if(!u)return;viewed=sid;
  $('prof-username').textContent=u.name;$('prof-steamid').textContent=u.sid;$('prof-bio').textContent='Joined: '+(u.joined||'').slice(0,10);
  const lv=$('prof-level');if(lv)lv.textContent=u.level||1;const stt=$('prof-status');if(stt)stt.textContent=u.status||'Online';if(u.avatar)$('prof-avatar').src=u.avatar;$('stat-items-count').textContent=items(sid).length;$('side-inv-count').textContent=items(sid).length;
  $('my-sync-box').style.display=sid===me?'block':'none';
  $('prof-trade-btn-area').innerHTML=sid===me?'':`<button onclick="startTradeWith('${esc(sid)}')" class="btn-steam btn-green" style="margin-top:15px;width:100%">Trade with ${esc(u.name)}</button>`}

window.uploadInventoryFile=function(){const f=$('inv-file-input').files[0];if(!f)return alert('Najskôr vyber súbor inventory.txt!');
  const r=new FileReader();r.onload=async e=>{const inv=buildInv(e.target.result);if(!inv)return alert('V súbore som nenašiel žiadne predmety. Pošli ukážku súboru, upravím čítanie.');
    const res=await api('/api/inventory',{inv});if(res.error)return alert('Chyba: '+res.error);await refresh();alert('Nahraných predmetov: '+res.count);renderProfile(me)};r.readAsText(f)};
window.downloadUpdatedInventory=function(){const inv=db.inventories[me];if(!inv)return alert('Najprv nahraj inventory.txt.');
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([serInv(inv)],{type:'text/plain'}));a.download='inventory.txt';document.body.appendChild(a);a.click();a.remove()};

function tile(it,onclick){const d=document.createElement('div'),r=resolveItem(it);d.className='item-card rarity-'+r.r;
  const im=r.img&&/^https:\/\//.test(r.img)?`<img src="${esc(r.img)}" alt="" loading="lazy" style="max-width:100%;max-height:84px">`:`<b style="color:#fff">${esc(r.w)}</b>`;
  d.innerHTML=`<div class="item-img">${im}</div><div class="item-footer"><div class="item-weapon">${esc(r.w)}</div><div class="item-skin">${esc(r.s)||'&nbsp;'}</div></div>`;if(onclick)d.onclick=()=>onclick(d);return d}
window.openUserInventory=function(s){viewed=s;showPage('inventory')};
function renderSingleInventory(sid){$('trade-split-view').style.display='none';$('single-inv-view').style.display='block';$('send-trade-submit').style.display='none';
  $('inv-title').textContent='Inventory of '+uname(sid);renderInventoryPage()}
window.renderInventoryPage=function(){const q=$('inv-search').value.toLowerCase(),g=$('single-inv-grid');g.innerHTML='';
  const l=items(viewed||me).filter(i=>nameOf(i).join(' ').toLowerCase().includes(q));
  if(!l.length)g.innerHTML='<p style="color:#8f98a0;padding:20px">Žiadne predmety.</p>';l.forEach(i=>g.appendChild(tile(i)))};

window.startTradeWith=function(sid){if(!me)return;if(sid===me)return alert('Nemôžeš obchodovať sám so sebou!');target=sid;selMine=[];selTheirs=[];showPage('inventory');
  $('trade-split-view').style.display='block';$('single-inv-view').style.display='none';$('send-trade-submit').style.display='block';$('inv-title').textContent='Trade Offer: You vs '+uname(sid);
  const fill=(id,s,sel)=>{const g=$(id);g.innerHTML='';items(s).forEach(i=>g.appendChild(tile(i,d=>{const x=sel.indexOf(i.k);if(x<0)sel.push(i.k);else sel.splice(x,1);d.classList.toggle('selected')})))};
  fill('my-trade-grid',me,selMine);fill('their-trade-grid',sid,selTheirs)};
window.submitTradeOffer=async function(){if(!selMine.length&&!selTheirs.length)return alert('Vyber aspoň jednu položku!');
  const r=await api('/api/trade',{to:target,give:selMine,get:selTheirs});if(r.error)return alert(r.error);await refresh();alert('Ponuka odoslaná!');showPage('trades')};
function renderTradesPage(){const L=$('trades-list');L.innerHTML='';const ts=db.trades.slice().reverse();if(!ts.length){L.innerHTML='<p style="color:#8f98a0">Žiadne trade ponuky.</p>';return}
  const nm=l=>l.map(i=>nameOf(i).slice(0,2).join(' ')).join(', ')||'nič';
  ts.forEach(t=>{const b=document.createElement('div');b.className='showcase-box';const col=t.status==='accepted'?'#a4d007':t.status==='pending'?'#66c0f4':'#eb4b4b';b.style.cssText='margin-bottom:15px;padding:15px;border-left:4px solid '+col;
    b.innerHTML=`<div style="display:flex;justify-content:space-between;margin-bottom:10px"><b style="color:#fff">${esc(uname(t.from))} → ${esc(uname(t.to))}</b><span style="color:${col}">${esc(t.status)}</span></div>
      <div style="color:#8f98a0;margin-bottom:12px"><b>${esc(uname(t.from))} dáva:</b> ${esc(nm(t.give))}<br><b>${esc(uname(t.to))} dáva:</b> ${esc(nm(t.get))}</div>`;
    if(t.status==='pending'){const r=document.createElement('div');r.style.cssText='display:flex;gap:10px';
      const mk=(txt,act,cls)=>{const x=document.createElement('button');x.className='btn-steam '+cls;x.textContent=txt;x.onclick=()=>respondTrade(t.id,act);r.appendChild(x)};
      if(t.to===me){mk('Accept Trade','accept','btn-green');mk('Decline','decline','')}else mk('Cancel','cancel','');b.appendChild(r)}L.appendChild(b)})}
window.respondTrade=async function(id,act){const r=await api('/api/trade/act',{id,act});if(r.error)alert(r.error);else if(act==='accept')alert('Trade prijatý! Teraz si na profile stiahni Download Updated inventory.txt a vymeň ním súbor v csgo_gc.');
  await refresh();showMainApp();showPage('trades')};
function renderPlayersList(){const L=$('players-list');L.innerHTML='';Object.values(db.users).forEach(u=>{const c=document.createElement('div');c.className='showcase-box';c.style.cssText='padding:15px;text-align:center';
  c.innerHTML=`<div style="font-weight:bold;color:#fff;font-size:15px;margin-bottom:5px">${esc(u.name)}</div><div style="color:#8f98a0;font-size:12px;margin-bottom:12px">Items: ${items(u.sid).length}</div><button onclick="viewPlayerProfile('${esc(u.sid)}')" class="btn-steam" style="width:100%;font-size:12px">View Profile</button>`;L.appendChild(c)})}
window.viewPlayerProfile=function(s){viewed=s;showPage('profile')};
