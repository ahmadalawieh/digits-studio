import {animate,inView,motionValue,scroll} from 'framer-motion';
import {EDITORIAL_SPRING} from './motion-system.js';

export function initializeStudioMotion(){
 if(!document.body.classList.contains('full-studio'))return;
 const preference=matchMedia('(prefers-reduced-motion: reduce)'),fine=matchMedia('(hover:hover) and (pointer:fine)');
 const disposals=[],reelStops=[],animations=new Map(),details=new Map();
 const run=(element,values,options={})=>{animations.get(element)?.stop();const control=animate(element,values,{...EDITORIAL_SPRING,...options});animations.set(element,control);return control;};
 // Only the three principal statements reveal; descriptions remain steady.
 for(const heading of document.querySelectorAll('.studio-title-mask').values()){
  const line=heading.querySelector('.studio-title-line');
  disposals.push(inView(heading,()=>{if(!preference.matches)run(line,{y:['108%','0%']});},{margin:'0px 0px -4% 0px'}));
 }
 for(const link of document.querySelectorAll('#work .work-image,#work .concept-work-image,#services .service-project-image')){
  const image=link.querySelector('img');
  const enter=()=>{if(fine.matches&&!preference.matches)run(image,{scale:1.025,clipPath:'inset(0px round 28px 6px 28px 6px)'});};
  const leave=()=>{if(!preference.matches)run(image,{scale:1,clipPath:'inset(0px round 0px 0px 0px 0px)'});};
  link.addEventListener('pointerenter',enter);link.addEventListener('pointerleave',leave);link.addEventListener('focus',enter);link.addEventListener('blur',leave);
  disposals.push(()=>{link.removeEventListener('pointerenter',enter);link.removeEventListener('pointerleave',leave);link.removeEventListener('focus',enter);link.removeEventListener('blur',leave);});
 }
 // Native details is the fallback. Framer owns reversible, interruptible expansion.
 for(const detail of document.querySelectorAll('#services details,.questions details')){
  const summary=detail.querySelector('summary'),icon=summary.querySelector('.service-toggle,span[aria-hidden]');
  const finish=entry=>{if(details.get(detail)!==entry)return;detail.open=entry.open;animate(detail,{height:'auto'},{duration:0});detail.style.height='auto';detail.style.removeProperty('overflow');details.delete(detail);};
  if(icon)icon.style.transform=`rotate(${detail.open?45:0}deg)`;
  const toggle=event=>{
   if(preference.matches){if(icon)run(icon,{rotate:detail.open?0:45},{duration:0});return;}
   event.preventDefault();const prior=details.get(detail),opening=!(prior?.open??detail.open),height=detail.getBoundingClientRect().height;
   prior?.control.stop();detail.style.removeProperty('height');detail.open=true;
   const expanded=detail.getBoundingClientRect().height;detail.open=false;const collapsed=detail.getBoundingClientRect().height;detail.open=true;
   detail.style.height=height+'px';detail.style.overflow='clip';
   const entry={open:opening,control:null};details.set(detail,entry);
   entry.control=animate(detail,{height:[height,opening?expanded:collapsed]},{...EDITORIAL_SPRING,onComplete:()=>finish(entry)});
   if(icon)run(icon,{rotate:opening?45:0});
  };
  summary.addEventListener('click',toggle);disposals.push(()=>summary.removeEventListener('click',toggle));
 }
 // Direct manipulation follows the pointer, then settles with the same studio spring.
 for(const viewport of document.querySelectorAll('.service-reel-viewport')){
  const track=viewport.querySelector('.service-project-grid'),controls=viewport.nextElementSibling,buttons=[...controls.querySelectorAll('button')];
  const x=motionValue(0),rtl=getComputedStyle(viewport).direction==='rtl';let extent=0,step=300,spring,press=null,suppress=false,suppressTimer;
  const bounds=value=>Math.max(rtl?0:-extent,Math.min(rtl?extent:0,value));
  const update=value=>{
   track.style.transform=`translate3d(${value}px,0,0)`;
   const position=rtl?value:-value;buttons[0].disabled=position<2;buttons[1].disabled=position>extent-2;
  };
  const unsubscribe=x.on('change',update);
  reelStops.push(()=>{spring?.stop();x.set(bounds(x.get()));});
  const measure=()=>{extent=Math.max(0,track.scrollWidth-viewport.clientWidth);const card=track.querySelector('article');step=(card?.getBoundingClientRect().width||300)+parseFloat(getComputedStyle(track).gap||0);spring?.stop();x.set(bounds(x.get()));update(x.get());};
  const observer=new ResizeObserver(measure);observer.observe(viewport);observer.observe(track);
  viewport.classList.add('is-draggable');controls.hidden=false;measure();
  const moveTo=value=>{spring?.stop();spring=animate(x,bounds(value),preference.matches?{duration:0}:EDITORIAL_SPRING);};
  const down=event=>{if(event.button!==0||event.target.closest('button'))return;spring?.stop();press={id:event.pointerId,startX:event.clientX,startY:event.clientY,origin:x.get(),lastX:event.clientX,time:event.timeStamp,velocity:0,dragging:false};};
  const move=event=>{
   if(!press||press.id!==event.pointerId)return;const dx=event.clientX-press.startX,dy=event.clientY-press.startY;
   if(!press.dragging){if(Math.abs(dy)>Math.abs(dx)+8){press=null;return;}if(Math.abs(dx)<8)return;press.dragging=true;viewport.setPointerCapture(event.pointerId);viewport.classList.add('is-dragging');}
   if(event.cancelable)event.preventDefault();press.velocity=(event.clientX-press.lastX)/Math.max(1,event.timeStamp-press.time);press.lastX=event.clientX;press.time=event.timeStamp;
   const target=press.origin+dx,limited=bounds(target);x.set(limited+(target-limited)*.18);
  };
  const release=event=>{if(!press||press.id!==event.pointerId)return;const was=press;press=null;viewport.classList.remove('is-dragging');if(viewport.hasPointerCapture(event.pointerId))viewport.releasePointerCapture(event.pointerId);if(was.dragging){suppress=true;clearTimeout(suppressTimer);suppressTimer=setTimeout(()=>suppress=false,120);moveTo(x.get()+Math.max(-240,Math.min(240,was.velocity*160)));}};
  const click=event=>{if(suppress){event.preventDefault();event.stopImmediatePropagation();}};
  const drag=event=>event.preventDefault();
  const focus=event=>{const card=event.target.closest('article');if(!card)return;const a=card.getBoundingClientRect(),b=viewport.getBoundingClientRect();if(a.left<b.left)moveTo(x.get()+b.left-a.left+4);else if(a.right>b.right)moveTo(x.get()+b.right-a.right-4);};
  const navigate=event=>{const next=event.currentTarget.dataset.reelDirection==='next';moveTo(x.get()+(rtl?1:-1)*(next?1:-1)*step);};
  viewport.addEventListener('pointerdown',down);viewport.addEventListener('pointermove',move,{passive:false});viewport.addEventListener('pointerup',release);viewport.addEventListener('pointercancel',release);viewport.addEventListener('click',click,true);viewport.addEventListener('dragstart',drag);viewport.addEventListener('focusin',focus);buttons.forEach(button=>button.addEventListener('click',navigate));
  disposals.push(()=>{spring?.stop();clearTimeout(suppressTimer);observer.disconnect();unsubscribe();viewport.removeEventListener('pointerdown',down);viewport.removeEventListener('pointermove',move);viewport.removeEventListener('pointerup',release);viewport.removeEventListener('pointercancel',release);viewport.removeEventListener('click',click,true);viewport.removeEventListener('dragstart',drag);viewport.removeEventListener('focusin',focus);buttons.forEach(button=>button.removeEventListener('click',navigate));});
 }
 let scrollDisposals=[];
 const connectScroll=()=>{
  scrollDisposals.forEach(stop=>stop());scrollDisposals=[];
  const process=document.querySelector('.process'),line=process.querySelector('.process-connector span'),sigil=document.querySelector('.studio-sigil svg'),studio=document.querySelector('#studio'),logo=document.querySelector('.footer-top .brand'),footer=document.querySelector('.footer');
  if(preference.matches){line.style.transform='scaleX(1)';sigil.style.transform='none';logo.style.transform='none';return;}
  scrollDisposals.push(scroll(p=>{line.style.transform=`scaleX(${Math.min(1,.12+p*1.25)})`;},{target:process,offset:['start end','end start']}));
  scrollDisposals.push(scroll(p=>{sigil.style.transform=`rotate(${-12+p*24}deg)`;},{target:studio,offset:['start end','end start']}));
  scrollDisposals.push(scroll(p=>{logo.style.transform=`translateY(${22*(1-p)}px)`;},{target:footer,offset:['start end','end end']}));
 };
 const change=()=>{
  if(preference.matches){
   for(const [element,control]of animations){
    control.stop();
    if(element.matches('img'))animate(element,{scale:1,clipPath:'inset(0px round 0px 0px 0px 0px)'},{duration:0});
    else if(element.classList.contains('studio-title-line'))animate(element,{y:'0%'},{duration:0});
    else{const detail=element.closest('details');animate(element,{rotate:(details.get(detail)?.open??detail?.open)?45:0},{duration:0});}
   }
   reelStops.forEach(stop=>stop());
   for(const[detail,entry]of details){entry.control.stop();detail.open=entry.open;animate(detail,{height:'auto'},{duration:0});detail.style.height='auto';detail.style.removeProperty('overflow');}details.clear();
  }
  connectScroll();
 };
 preference.addEventListener('change',change);connectScroll();
 return()=>{preference.removeEventListener('change',change);scrollDisposals.forEach(stop=>stop());disposals.forEach(stop=>stop());animations.forEach(control=>control.stop());details.forEach(entry=>entry.control.stop());};
}
