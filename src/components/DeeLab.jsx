import {useLayoutEffect, useRef, useState} from 'react';
import {motion} from 'framer-motion';
import {EDITORIAL_SPRING} from '../motion-system.js';
import {useMotionPreference} from '../use-motion-preference.js';

const COPY={
  en:{
    intro:'Meet DEE. A little D with a point of view.',title:<>Small fixes.<br/>A clearer story.</>,
    description:'Watch DEE turn a confusing florist homepage into a clear offer. Three small decisions. One useful difference.',
    steps:['Spot it','Fix it','Make your mark'],tabs:'Explore DEE’s three design steps',
    observations:['Three buttons. Still no idea what they sell.','Say what you offer. And where people can get it.','One clear offer. One obvious next step.'],
    detail:['The page asks for attention before explaining the business. Start with the message.','A specific headline gives the business a place and a purpose. Now simplify the action.','The headline, image and button now tell the same story. That is the idea behind the work.'],
    brand:'Example florist',place:'Beirut',vague:'Welcome to our world.',vagueCopy:'Passion. Quality. Excellence.',
    headline:'Same-day flowers in Beirut.',copy:'Seasonal bouquets for the moments that matter.',
    vagueActions:['Learn more','Explore','Discover'],order:'Order flowers',hint:'Choose your bouquet. Make someone’s day.',
    disclosure:'Fictional business. Visual demonstration of design choices, not client results.',
    preview:'Fictional florist homepage preview',next:['See the first fix','Make the next step clear'],contact:'Let’s make your website clearer',
    progress:['Before: the offer is unclear.','The offer now explains what and where.','After: a clear offer and one next step.'],
  },
  ar:{
    intro:'تعرّف إلى DEE. حرف صغير، ونظرة مختلفة.',title:<>تعديلات صغيرة.<br/>رسالة أوضح.</>,
    description:'شاهد كيف يحوّل DEE صفحة زهور مربكة إلى عرض واضح. ثلاثة قرارات بسيطة تصنع فرقاً مفيداً.',
    steps:['نلاحظ','نعدّل','نترك بصمة'],tabs:'استكشف خطوات التصميم الثلاث مع DEE',
    observations:['ثلاثة أزرار، ولا نعرف بعد ماذا يبيعون.','قل ماذا تقدّم، وأين يمكن للناس الحصول عليه.','عرض واضح. وخطوة تالية يعرفها الجميع.'],
    detail:['تطلب الصفحة الانتباه قبل أن تشرح نشاط الشركة. نبدأ بالرسالة.','عنوان محدّد يوضّح الخدمة ومكانها. الآن نبسّط الخطوة التالية.','العنوان والصورة والزر تروي القصة نفسها. هذه هي الفكرة وراء العمل.'],
    brand:'محل زهور تجريبي',place:'بيروت',vague:'أهلاً بك في عالمنا.',vagueCopy:'شغف. جودة. تميّز.',
    headline:'زهور تصلك اليوم في بيروت.',copy:'باقات موسمية للحظات التي تستحق أن نحتفل بها.',
    vagueActions:['اعرف المزيد','استكشف','اكتشف'],order:'اطلب الزهور',hint:'اختر باقتك. وأسعد شخصاً تحبّه.',
    disclosure:'شركة خيالية. عرض توضيحي لقرارات التصميم، وليس نتائج عميل حقيقي.',
    preview:'معاينة توضيحية لصفحة محل زهور خيالي',next:['شاهد التعديل الأول','وضّح الخطوة التالية'],contact:'لنجعل موقعك أوضح',
    progress:['قبل التعديل: الخدمة غير واضحة.','أصبح العرض يشرح الخدمة ومكانها.','بعد التعديل: عرض واضح وخطوة تالية واحدة.'],
  },
};

function Flowers(){
  return <svg className="dee-flowers" viewBox="0 0 260 290" fill="none" aria-hidden="true" focusable="false">
    <path d="M130 272V88M130 236L72 139M130 220L193 118" stroke="#445848" strokeWidth="5" strokeLinecap="round"/>
    <path d="M129 212C86 222 74 191 80 170C114 174 132 190 129 212ZM132 247C178 244 195 215 188 193C152 204 133 221 132 247Z" fill="#647D62"/>
    {[[130,67,1],[64,126,.79],[198,105,.85]].map(([x,y,scale],i)=><g key={i} transform={`translate(${x} ${y}) scale(${scale})`}>
      {[0,60,120,180,240,300].map(angle=><ellipse key={angle} cy="-22" rx="19" ry="29" transform={`rotate(${angle})`} fill={i===1?'#D8AC9E':'#E7C7B2'} stroke="#BD8A78" strokeWidth=".8"/>)}
      <circle r="14" fill="#6B4939"/><circle r="7" fill="#D4A35F"/>
    </g>)}
  </svg>;
}

export function DeeLab({ar=false}){
  // A useful final example is also the server-rendered / unavailable-JS fallback.
  const [step,setStep]=useState(2),[ready,setReady]=useState(false),tabs=useRef([]);
  const reduced=useMotionPreference(),copy=COPY[ar?'ar':'en'];
  useLayoutEffect(()=>{setStep(0);setReady(true);},[]);
  const transition=reduced?{duration:0}:EDITORIAL_SPRING;
  const choose=index=>setStep(index);
  const keyDown=(event,index)=>{
    let next;
    if(event.key==='Home')next=0;
    else if(event.key==='End')next=2;
    else if(event.key==='ArrowRight')next=(index+(ar?2:1))%3;
    else if(event.key==='ArrowLeft')next=(index+(ar?1:2))%3;
    if(next===undefined)return;
    event.preventDefault();choose(next);tabs.current[next]?.focus();
  };
  const prepareWebsite=event=>{
    if(event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||event.button!==0)return;
    const checkbox=document.querySelector('#inquiry-form input[name="service"][value="Website"]');
    if(checkbox){checkbox.checked=true;checkbox.dispatchEvent(new Event('change',{bubbles:true}));}
  };
  return <section className="dee-lab section" id="dee-lab" aria-labelledby="dee-lab-title" data-dee-step={step}>
    <div className="dee-lab-intro">
      <div><p className="dee-intro-line">{copy.intro}</p><h2 id="dee-lab-title">{copy.title}</h2></div>
      <div className="dee-lab-lead"><p>{copy.description}</p>
        <div className="dee-tabs" role="tablist" aria-label={copy.tabs}>
          {copy.steps.map((label,index)=><button key={index} ref={element=>{tabs.current[index]=element;}} id={`dee-step-${index}`} type="button" role="tab" aria-selected={step===index} aria-controls="dee-lab-panel" tabIndex={step===index?0:-1} disabled={!ready} onClick={()=>choose(index)} onKeyDown={event=>keyDown(event,index)}>
            {step===index&&<motion.span key={reduced?'still':'animated'} className="dee-tab-active" layoutId="dee-design-step" transition={transition} aria-hidden="true"/>}<span>{label}</span>
          </button>)}
        </div>
      </div>
    </div>
    <div className="dee-lab-stage" id="dee-lab-panel" role="tabpanel" aria-labelledby={`dee-step-${step}`} tabIndex={0}>
      <div className="dee-companion">
        <div className="dee-character-frame" aria-hidden="true">
          <motion.img key={`curious-${reduced}`} className="dee-character" src="/assets/dee/dee-curious.webp" alt="" width="640" height="800" loading="lazy" decoding="async" initial={false} animate={{opacity:step===2?0:1,y:step===1?-4:0,rotate:step===1?-3:0}} transition={transition}/>
          <motion.img key={`pointing-${reduced}`} className="dee-character" src="/assets/dee/dee-pointing.webp" alt="" width="640" height="800" loading="lazy" decoding="async" initial={false} animate={{opacity:step===2?1:0,y:step===2?0:10,rotate:step===2?0:4}} transition={transition}/>
        </div>
        <div className="dee-comment"><h3>{copy.observations[step]}</h3><p>{copy.detail[step]}</p></div>
      </div>
      <div className="dee-browser" role="group" aria-label={copy.preview}>
        <div className="dee-browser-bar" aria-hidden="true"><span/><span/><span/><i>example / florist</i></div>
        <div className="dee-florist-nav"><span>{copy.brand}</span><span>{copy.place}</span></div>
        <div className={`dee-preview ${step===0?'dee-preview-before':'dee-preview-after'}`}>
          <div className="dee-preview-copy"><motion.h3 key={`${step===0?'before':'clear'}-${reduced}`} initial={ready&&!reduced?{y:10}:{y:0}} animate={{y:0}} transition={transition}>{step===0?copy.vague:copy.headline}</motion.h3>
            <p>{step===0?copy.vagueCopy:copy.copy}</p>
            <div className="dee-preview-actions" role="group" aria-label={ar?'أمثلة بصرية لأزرار الصفحة':'Visual examples of webpage actions'}>
              {step===2?<span className="dee-example-primary">{copy.order}<span aria-hidden="true">↗</span></span>:copy.vagueActions.map(action=><span key={action} className="dee-example-vague">{action}</span>)}
            </div>
            {step===2&&<p className="dee-example-hint">{copy.hint}</p>}
          </div>
          <div className="dee-preview-art"><Flowers/></div>
        </div>
      </div>
    </div>
    <p className="dee-progress sr-only" role="status" aria-live="polite" aria-atomic="true">{copy.progress[step]}</p>
    <div className="dee-lab-footer"><p>{copy.disclosure}</p>
      {step<2?<motion.button type="button" className="dee-next" onClick={()=>{choose(step+1);tabs.current[step+1]?.focus();}} disabled={!ready} whileHover={reduced?undefined:{x:ar?-3:3}} whileTap={reduced?undefined:{scale:.98}} transition={transition}>{copy.next[step]}<span aria-hidden="true">↗</span></motion.button>:
      <a className="dee-contact" href="#contact" onClick={prepareWebsite}>{copy.contact}<span aria-hidden="true">↗</span></a>}
    </div>
  </section>;
}
