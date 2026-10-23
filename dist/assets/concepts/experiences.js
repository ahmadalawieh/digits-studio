(() => {
 'use strict';
 const brand=JSON.parse(document.querySelector('#experience-data').textContent),stay=brand.slug==='dar-saha';
 let language=new URLSearchParams(location.search).get('lang')==='ar'?'ar':'en',selected=null,plan=null;
 const tr=(en,ar)=>language==='ar'?ar:en,name=item=>tr(item.name,item.ar);
 const modal=document.querySelector('#experience-dialog'),content=document.querySelector('#experience-dialog-content');
 const make=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;};
 function photo(file,alt){const img=make('img');img.src='/assets/concepts/'+brand.slug+'/'+file;img.alt=alt;return img;}
 function button(text,fn){const b=make('button',text,'action');b.type='button';b.addEventListener('click',fn);return b;}
 function show(title){document.querySelector('#experience-dialog-title').textContent=title;modal.showModal();}
 function motionScroll(el){el.scrollIntoView({block:'center',behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'});}
 function renderPlan(){
  if(!plan)return;const out=document.querySelector('#stay-result'),room=brand.rooms.find(r=>r.id===plan.room),total=room.price*plan.nights;
  out.replaceChildren(make('h3',tr('Your sample stay plan','خطة إقامتك التجريبية')));
  const date=new Intl.DateTimeFormat(language==='ar'?'ar-LB':'en-GB',{dateStyle:'long'}).format(new Date(plan.arrival+'T12:00:00'));
  out.append(make('p',name(room)+' / '+date),make('p',tr(`${plan.nights} night(s) · ${plan.guests} guest(s)`,`${plan.nights} ليالٍ · ${plan.guests} ضيوف`)));
  const estimate=make('p',tr('Illustrative room estimate: ','تكلفة الغرفة التوضيحية: '));estimate.append(make('bdi','$'+total.toFixed(2)));out.append(estimate,make('p',tr('No room has been reserved. This concept does not check availability or charge payments. Prices are illustrative and do not represent an actual hotel quote.','لم تُحجز غرفة. لا يفحص هذا التصوّر التوفّر ولا يحصّل مدفوعات. الأسعار توضيحية ولا تمثّل عرض سعر لفندق حقيقي.')));out.hidden=false;
 }
 function chooseRoom(id){const select=document.querySelector('[name="room"]');select.value=id;if(modal.open)modal.close();const field=document.querySelector('[name="arrival"]');field.focus({preventScroll:true});motionScroll(document.querySelector('#stay-planner'));}
 function renderSelection(){
  const out=document.querySelector('#session-result'),clear=document.querySelector('#clear-session');out.hidden=!selected;clear.hidden=!selected;if(!selected)return;
  const cls=brand.classes.find(c=>c.id===selected);out.replaceChildren(make('h3',tr('Your sample session','حصتك التجريبية')),make('p',name(cls)+' / '+tr(cls.day,cls.arDay)+' / '+cls.time),make('p',tr('Selection saved for this demo. No place has been reserved, no membership has been created and no payment is taken.','حُفظ الاختيار لهذه التجربة فقط. لم يُحجز مكان ولم يُنشأ اشتراك ولم تُحصّل دفعة.')));
 }
 function setLanguage(){
  document.documentElement.lang=language;document.documentElement.dir=language==='ar'?'rtl':'ltr';document.querySelectorAll('[data-en][data-ar]').forEach(n=>n.textContent=n.dataset[language]);
  const toggle=document.querySelector('.experience-language');toggle.textContent=tr('عربي','EN');toggle.setAttribute('aria-label',tr('Read in Arabic','Read in English'));
  document.querySelectorAll('[data-case]').forEach(a=>a.href=(language==='ar'?'/ar':'')+'/projects/'+brand.slug+'/');
  document.querySelector('.dialog-close').setAttribute('aria-label',tr('Close dialog','إغلاق النافذة'));document.title=tr(brand.name,brand.arName)+' | '+tr(brand.kind,brand.arKind);
  if(stay)renderPlan();else{renderSelection();document.querySelector('.class-filters').setAttribute('aria-label',tr('Movement types','أنواع الحركة'));}
 }
 document.querySelector('.experience-language').addEventListener('click',()=>{language=language==='ar'?'en':'ar';const url=new URL(location.href);language==='ar'?url.searchParams.set('lang','ar'):url.searchParams.delete('lang');history.replaceState(null,'',url);setLanguage();});
 if(stay){
  const form=document.querySelector('#stay-form'),today=new Date(),localDay=new Date(today.getTime()-today.getTimezoneOffset()*60000).toISOString().slice(0,10);form.elements.arrival.min=localDay;
  form.addEventListener('submit',event=>{event.preventDefault();if(!form.reportValidity())return;const d=new FormData(form);plan={arrival:d.get('arrival'),nights:Number(d.get('nights')),guests:Number(d.get('guests')),room:d.get('room')};renderPlan();});
  form.addEventListener('input',()=>{plan=null;document.querySelector('#stay-result').hidden=true;});form.addEventListener('change',()=>{plan=null;document.querySelector('#stay-result').hidden=true;});
  document.querySelectorAll('.room-select').forEach(b=>b.addEventListener('click',()=>chooseRoom(b.dataset.room)));
  document.querySelectorAll('.room-detail').forEach(b=>b.addEventListener('click',()=>{const room=brand.rooms.find(r=>r.id===b.dataset.room);content.replaceChildren(photo(room.image,name(room)),make('p',tr(room.description,room.arDescription)),make('p',room.size+' / '+tr('Up to two guests','حتى ضيفين')),make('p','$'+room.price+' / '+tr('sample night','لليلة التجريبية')),button(tr('Choose this room','اختر هذه الغرفة'),()=>chooseRoom(room.id)));show(name(room));}));
 }else{
  document.querySelectorAll('[data-class-filter]').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('[data-class-filter]').forEach(other=>other.setAttribute('aria-pressed',String(b===other)));document.querySelectorAll('[data-class-type]').forEach(row=>row.hidden=b.dataset.classFilter!=='all'&&row.dataset.classType!==b.dataset.classFilter);}));
  document.querySelectorAll('.session-detail').forEach(b=>b.addEventListener('click',()=>{const cls=brand.classes.find(c=>c.id===b.dataset.session);content.replaceChildren(make('p',tr(cls.day,cls.arDay)+' / '+cls.time),make('p',tr(cls.description,cls.arDescription)),make('p',cls.duration+' '+tr('minutes','دقيقة')+' / $'+cls.price),make('p',tr('Sample class information. No medical, attendance or fitness-result claims are made.','معلومات حصة توضيحية دون ادّعاءات طبية أو نتائج لياقة.')),button(tr('Select sample session','اختر حصة تجريبية'),()=>{selected=cls.id;renderSelection();modal.close();motionScroll(document.querySelector('#session-result'));}));show(name(cls));}));
  document.querySelector('#clear-session').addEventListener('click',()=>{selected=null;renderSelection();document.querySelector('[data-class-filter="all"]').focus();});
 }
 document.querySelector('.dialog-close').addEventListener('click',()=>modal.close());modal.addEventListener('click',e=>{if(e.target===modal){const r=modal.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)modal.close();}});setLanguage();
})();
