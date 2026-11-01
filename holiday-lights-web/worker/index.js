// Cloudflare Worker: valida, guarda de forma duradera (KV) y solo entonces responde ok; luego notifica a Make.
// Bindings: KV "LEADS"; secretos: MAKE_WEBHOOK_URL, ALLOWED_ORIGIN, TURNSTILE_SECRET (opcional).
const J=(o,s,h={})=>new Response(JSON.stringify(o),{status:s,headers:{'Content-Type':'application/json',...h}});
async function sha(s){return [...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)))].map(b=>b.toString(16).padStart(2,'0')).join('')}
async function notify(env,id,rec){for(let i=0;i<3;i++){try{const r=await fetch(env.MAKE_WEBHOOK_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id,...rec})});
 if(r.ok){await env.LEADS.put('lead:'+id,JSON.stringify({...rec,notify:'sent'}));return}}catch{}await new Promise(r=>setTimeout(r,500*2**i))}
 await env.LEADS.put('lead:'+id,JSON.stringify({...rec,notify:'pending'}));await env.LEADS.put('pending:'+id,'1')} // pending => reenviar/avisar al dueño
export default{async fetch(req,env,ctx){
 const cors={'Access-Control-Allow-Origin':env.ALLOWED_ORIGIN,'Access-Control-Allow-Headers':'Content-Type','Vary':'Origin'};
 if(req.method==='OPTIONS')return new Response(null,{status:204,headers:cors});
 if(req.method!=='POST')return J({ok:false},405,cors);
 let b;try{b=await req.json()}catch{return J({ok:false},400,cors)}
 if(b.website)return J({ok:true},200,cors); // honeypot
 const ip=req.headers.get('CF-Connecting-IP')||'x',rk='rl:'+await sha(ip)+':'+Math.floor(Date.now()/3600000);
 const n=+(await env.LEADS.get(rk)||0);if(n>=5)return J({ok:false,error:'rate'},429,cors);await env.LEADS.put(rk,String(n+1),{expirationTtl:7200});
 if(env.TURNSTILE_SECRET){const r=await(await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',body:new URLSearchParams({secret:env.TURNSTILE_SECRET,response:b.turnstile||'',remoteip:ip})})).json();if(!r.success)return J({ok:false},403,cors)}
 const s=(v,m)=>String(v??'').trim().slice(0,m),phone=s(b.phone,20).replace(/[^\d+]/g,'');
 const rec={name:s(b.name,80),phone,pref:[0,1,2].includes(+b.pref)?+b.pref:0,email:s(b.email,120),zip:s(b.zip,5),city:s(b.city,60),
  floors:+b.floors===1?2:1,service:s(b.service,1),items:(Array.isArray(b.items)?b.items:[]).slice(0,6).map(Number),date:s(b.date,10),comments:s(b.comments,1000),
  ref:s(b.ref,32).replace(/[^\w-]/g,''),utm:b.attr&&typeof b.attr==='object'?Object.fromEntries(Object.entries(b.attr).filter(([k])=>/^utm_/.test(k)).map(([k,v])=>[k,s(v,80)])):{},
  consent_contact:b.consent_contact===true,consent_marketing:b.consent_marketing===true,lang:b.lang==='es'?'es':'en',received:new Date().toISOString(),
  referral_status:'unverified'}; // elegibilidad/montos los valida el dueño o backend, nunca el navegador
 if(!rec.name||phone.length<10||!/^\d{5}$/.test(rec.zip)||!rec.city||!rec.consent_contact||(rec.pref===2&&!/^\S+@\S+\.\S+$/.test(rec.email)))return J({ok:false,error:'invalid'},422,cors);
 const id=/^[0-9a-f-]{36}$/.test(b.key||'')?b.key:null;if(!id)return J({ok:false},400,cors);
 if(await env.LEADS.get('lead:'+id))return J({ok:true,id,duplicate:true},200,cors); // idempotencia
 await env.LEADS.put('lead:'+id,JSON.stringify({...rec,notify:'queued'})); // registro duradero ANTES de confirmar
 ctx.waitUntil(notify(env,id,rec));
 return J({ok:true,id},200,cors)}};
