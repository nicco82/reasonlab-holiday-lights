(()=>{const S=window.SITE,D=window.I18N,$=s=>document.querySelector(s),f=$('#f');
let lang=localStorage.getItem('lang')==='es'?'es':'en',step=0,key=crypto.randomUUID(),busy=false,started=false;
const ev=n=>{(window.dataLayer=window.dataLayer||[]).push({event:n})}; // sin PII; conectar GTM/GA con IDs reales
const li=a=>a.map(x=>`<li>${x}</li>`).join('');
const q=new URLSearchParams(location.search),at=JSON.parse(sessionStorage.getItem('attr')||'{}');
['utm_source','utm_medium','utm_campaign','utm_content','utm_term'].forEach(k=>q.get(k)&&(at[k]=q.get(k).slice(0,80)));
const rc=(q.get('ref')||'').replace(/[^\w-]/g,'').slice(0,32);if(rc)at.ref=rc;sessionStorage.setItem('attr',JSON.stringify(at));
if(at.ref&&!f.ref.value)f.ref.value=at.ref;
function render(){const t=D[lang];document.documentElement.lang=lang;$('#lang').textContent=lang==='en'?'ES':'EN';
$('#brand').textContent=S.name||t.brand;$('#brand').hidden=false;$('#nav').innerHTML=['services','process','areas','faq'].map((id,i)=>`<a href="#${id}">${t.nav[i]}</a>`).join('');
document.querySelectorAll('[data-i]').forEach(e=>{const v=t[e.dataset.i];if(typeof v==='string')e.textContent=v});
$('#heroImage').alt=t.heroAlt;
['incT','modT','procT','areasT','areasN','refT','faqT','fT','okT','okB','fnote'].forEach(k=>{$('#'+k).textContent=t[k]});
$('#h1').textContent=t.h1;$('#sub').textContent=t.sub;$('#scope').textContent=t.scope;
$('#inc').innerHTML=li(t.inc);$('#mods').innerHTML=t.mods.map((m,i)=>`<div class="offer-card offer-card-${i+1}"><span class="offer-number">0${i+1}</span><b>${m[0]}</b><p>${m[1]}</p></div>`).join('');
$('#proc').innerHTML=li(t.proc);$('#areaList').innerHTML=li(S.areas);
$('#price').hidden=!S.price.show;if(S.price.show)$('#price').textContent=t.priceFrom(S.price.from,S.price.feet);
$('#referral').hidden=!S.referral.enabled;if(S.referral.enabled)$('#refB').textContent=t.refB(S.referral.newCustomer,S.referral.referrer,S.referral.minJob);
$('#gallery').hidden=!S.showGallery;
$('#faqList').innerHTML=t.faq.map(x=>`<details><summary>${x[0]}</summary><p>${x[1]}</p></details>`).join('');
document.querySelectorAll('[data-l]').forEach(e=>e.textContent=t.L[e.dataset.l]);
const opt=(id,a)=>{const s=$('#'+id),v=s.value;s.innerHTML=a.map((x,i)=>`<option value="${i}">${x}</option>`).join('');s.value=v||0};
opt('pref',t.O.pref);opt('floors',t.O.floors);opt('svc',t.O.svc);
const ck=[...document.querySelectorAll('#items input:checked')].map(e=>e.value);
$('#items').innerHTML=t.O.items.map((x,i)=>`<label class="ck"><input type="checkbox" value="${i}" ${ck.includes(String(i))?'checked':''}><span>${x}</span></label>`).join('');
$('#back').textContent=t.back;$('#next').textContent=t.next;$('#send').textContent=t.send;show();
const c=$('#contact');c.innerHTML='';
if(S.phone)c.innerHTML+=`<a class="btn ghost" href="tel:${S.phone}" data-ev="call_click">${t.call}</a>`;
if(S.sms)c.innerHTML+=`<a class="btn ghost" href="sms:${S.sms}" data-ev="message_click">${t.text}</a>`;
$('#fcontact').textContent=[S.phone,S.email].filter(Boolean).join(' · ');}
function show(){document.querySelectorAll('.step').forEach(e=>e.classList.toggle('on',+e.dataset.s===step));
$('#st').textContent=`${step+1}/3 · ${D[lang].steps[step]}`;$('#back').hidden=!step;$('#next').hidden=step===2;$('#send').hidden=step!==2}
function valid(){const box=document.querySelector(`.step[data-s="${step}"]`);let ok=true;
box.querySelectorAll('[required]').forEach(e=>{if(e.type==='checkbox'?!e.checked:!e.checkValidity())ok=false});
if(step===0&&f.pref.value==='2'&&!f.email.value)ok=false;if(step===0&&f.email.value&&!f.email.checkValidity())ok=false;
$('#msg').textContent=ok?'':D[lang].req;return ok}
$('#next').onclick=()=>{if(valid()){step++;show()}};$('#back').onclick=()=>{step--;show()};
f.addEventListener('input',()=>{if(!started){started=true;ev('form_start')}});
document.addEventListener('click',e=>{const a=e.target.closest('[data-ev]');if(a)ev(a.dataset.ev)});
$('#lang').onclick=()=>{lang=lang==='en'?'es':'en';localStorage.setItem('lang',lang);render()};
f.onsubmit=async e=>{e.preventDefault();if(busy||!valid())return;const t=D[lang],m=$('#msg');
if(!S.formEndpoint){m.textContent=t.off;return}
busy=true;$('#send').disabled=true;$('#send').textContent=t.sending;m.textContent='';
const fd=Object.fromEntries(new FormData(f));
const body={...fd,consent_contact:f.consent_contact.checked,consent_marketing:f.consent_marketing.checked,
items:[...document.querySelectorAll('#items input:checked')].map(x=>+x.value),lang,key,attr:at,page:location.pathname};
try{const r=await fetch(S.formEndpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
const j=await r.json().catch(()=>({}));if(!r.ok||!j.ok)throw 0;
ev('lead_saved');f.hidden=true;$('#ok').hidden=false;
}catch{m.textContent=t.err;$('#send').textContent=t.retry}
finally{busy=false;$('#send').disabled=false}};
render();
if(!S.formEndpoint){f.hidden=true;$('#unavailable').hidden=false;$('#unavailable').textContent=D[lang].off}
const toggleLanguage=$('#lang').onclick;$('#lang').onclick=()=>{toggleLanguage();if(!S.formEndpoint)$('#unavailable').textContent=D[lang].off};
})();
