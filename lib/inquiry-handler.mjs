import {createHash} from 'node:crypto';

const allowedOrigins=new Set(['https://digitsstudio.online','https://www.digitsstudio.online']);
const services=new Set(['Branding','Website','Marketing']);
const budgetOptions=new Set(['','Under $1,000','$1,000–$3,000','$3,000–$7,000','$7,000+']);
const timingOptions=new Set(['','Within a month','1–3 months','Planning ahead']);
const clean=(value,max)=>typeof value==='string'?value.trim().slice(0,max):'';

export function createInquiryHandler({sendEmail,enabled=false,from,to,now=Date.now,allowLocal=false}={}){
  // This is a per-instance burst guard, alongside validation and a fixed recipient.
  // It is not a distributed rate limiter and does not store inquiry contents.
  const attempts=new Map();
  return async function inquiry(req,res){
    res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');
    if(req.method==='GET')return res.status(200).json({available:Boolean(enabled&&sendEmail&&from&&to)});
    if(req.method!=='POST'){res.setHeader('Allow','GET, POST');return res.status(405).json({error:'method_not_allowed'});}
    const origin=req.headers.origin;
    if(!allowedOrigins.has(origin)&&!(allowLocal&&/^http:\/\/(127\.0\.0\.1|localhost):\d+$/.test(origin||'')))return res.status(403).json({error:'origin_not_allowed'});
    if(!String(req.headers['content-type']||'').toLowerCase().startsWith('application/json'))return res.status(415).json({error:'json_required'});
    if(Number(req.headers['content-length']||0)>12000)return res.status(413).json({error:'brief_too_large'});
    let body;
    try{body=typeof req.body==='string'?JSON.parse(req.body):req.body;}catch{return res.status(400).json({error:'invalid_brief'});}
    if(!body||Array.isArray(body)||typeof body!=='object'||JSON.stringify(body).length>12000)return res.status(400).json({error:'invalid_brief'});
    if(clean(body.website_url,250))return res.status(400).json({error:'invalid_brief'});
    const name=clean(body.name,100),email=clean(body.email,180),business=clean(body.business,150),message=clean(body.message,2000);
    const selected=Array.isArray(body.services)?[...new Set(body.services)].filter(service=>services.has(service)):[];
    const budget=clean(body.budget,100),timing=clean(body.timing,100),language=body.language==='ar'?'ar':'en';
    if(!name||/[\r\n]/.test(name)||!email||!/^\S+@[^\s@]+\.[^\s@]+$/.test(email)||!message||!budgetOptions.has(budget)||!timingOptions.has(timing))return res.status(400).json({error:'invalid_brief'});
    if(typeof body.requestId!=='string'||!/^[-a-z0-9]{20,80}$/i.test(body.requestId))return res.status(400).json({error:'invalid_brief'});
    if(!Number.isFinite(body.startedAt)||now()-body.startedAt<1500||now()-body.startedAt>86400000)return res.status(400).json({error:'review_required'});
    if(!enabled||!sendEmail||!from||!to)return res.status(503).json({error:'delivery_unavailable'});
    const ip=String(req.headers['x-vercel-forwarded-for']||req.socket?.remoteAddress||'unknown').slice(0,80);
    const previous=attempts.get(ip);
    if(previous&&now()-previous.since<900000&&previous.count>=5)return res.status(429).json({error:'try_later'});
    if(attempts.size>2000)for(const [key,value]of attempts)if(now()-value.since>=900000)attempts.delete(key);
    const current=previous&&now()-previous.since<900000?previous:{since:now(),count:0};
    current.count++;attempts.set(ip,current);
    const text=`Digits Studio / Project inquiry\n\nName: ${name}\nEmail: ${email}\nBusiness: ${business||'Not specified'}\nServices: ${selected.join(', ')||'To define together'}\nBudget: ${budget||'To discuss'}\nTiming: ${timing||'Flexible / to discuss'}\nLanguage: ${language}\n\n${message}`;
    const fingerprint=createHash('sha256').update(JSON.stringify({name,email,business,selected,budget,timing,message,language})).digest('hex').slice(0,24);
    try{
      const result=await sendEmail({from,to:[to],replyTo:email,subject:'Digits Studio / Project inquiry',text},{idempotencyKey:`website-inquiry/${body.requestId}/${fingerprint}`});
      if(result.error||!result.data?.id){console.warn('[inquiry] delivery rejected',result.error?.name||'missing_reference');return res.status(502).json({error:'delivery_failed'});}
      return res.status(200).json({sent:true,reference:result.data.id});
    }catch{console.warn('[inquiry] delivery connection failed');return res.status(502).json({error:'delivery_failed'});}
  };
}
