(() => {
  'use strict';
  const brand=JSON.parse(document.querySelector('#demo-data').textContent);
  const cart=new Map(), products=new Map(brand.products.map(p=>[p.id,p]));
  const basket=document.querySelector('#basket-dialog'), detail=document.querySelector('#product-dialog');
  const feedback=document.querySelector('.cart-feedback');
  let language=new URLSearchParams(location.search).get('lang')==='ar'?'ar':'en', selected=null;
  const tr=(en,ar)=>language==='ar'?ar:en;
  const money=value=>'$'+value.toFixed(2);
  const name=p=>language==='ar'?p.ar:p.name;
  const node=(tag,text,cls)=>{const el=document.createElement(tag);if(text!==undefined)el.textContent=text;if(cls)el.className=cls;return el;};
  function photo(p){const img=node('img');img.src='/assets/concepts/'+brand.slug+'/'+p.image;img.alt=name(p);return img;}
  function button(text,fn,cls){const el=node('button',text,cls);el.type='button';el.addEventListener('click',fn);return el;}
  function add(id){cart.set(id,(cart.get(id)||0)+1);update();feedback.textContent=tr(name(products.get(id))+' added to your demo basket.','أُضيف '+name(products.get(id))+' إلى سلّتك التجريبية.');}
  function update(){
    document.querySelector('.basket-count').textContent=[...cart.values()].reduce((a,b)=>a+b,0);
    document.querySelector('#order-review').hidden=true;
    if(basket.open)renderBasket();
  }
  function renderBasket(){
    const activeLabel=document.activeElement?.getAttribute('aria-label'),container=document.querySelector('#basket-items');container.replaceChildren();let total=0;
    if(!cart.size)container.append(node('p',tr('Your basket is waiting for something good.','سلّتك بانتظار شيء لذيذ.')));
    for(const [id,quantity] of cart){
      const p=products.get(id);total+=p.price*quantity;
      const row=node('div',undefined,'basket-row'),copy=node('div'),controls=node('div');
      row.append(photo(p));copy.append(node('h3',name(p)),node('bdi',money(p.price)));
      const remove=button(tr('Remove','إزالة'),()=>{cart.delete(id);update();},'remove-item');remove.setAttribute('aria-label',tr('Remove ','إزالة ')+name(p));copy.append(node('br'),remove);row.append(copy);
      const counter=node('div',undefined,'quantity');
      const change=delta=>{const next=quantity+delta;if(next)cart.set(id,next);else cart.delete(id);update();};
      const less=button('−',()=>change(-1)),more=button('+',()=>change(1));
      less.setAttribute('aria-label',tr('Decrease quantity: ','تقليل الكمية: ')+name(p));more.setAttribute('aria-label',tr('Increase quantity: ','زيادة الكمية: ')+name(p));
      counter.append(less,node('bdi',String(quantity)),more);controls.append(counter);row.append(controls);container.append(row);
    }
    document.querySelector('#basket-total').textContent=money(total);
    document.querySelector('#review-order').disabled=!cart.size;document.querySelector('#basket-total').setAttribute('aria-live','polite');
    if(activeLabel){const replacement=[...container.querySelectorAll('button[aria-label]')].find(b=>b.getAttribute('aria-label')===activeLabel);(replacement||basket.querySelector('.dialog-close')).focus({preventScroll:true});}
  }
  function renderProduct(){
    if(!selected)return;const p=products.get(selected);
    document.querySelector('#product-dialog-title').textContent=name(p);
    const content=document.querySelector('#product-dialog-content');content.replaceChildren(photo(p));
    content.append(node('p',language==='ar'?p.arDescription:p.description),node('p',tr(p.detail,'منتج توضيحي ضمن علامة خيالية. الأسعار تجريبية، ويمكنك استكشاف تفاصيل المنتج وإضافته إلى السلّة دون دفع أو إنشاء طلب.')));
    const addButton=button(tr('Add to demo basket · ','أضف إلى السلّة التجريبية · ')+money(p.price),()=>{add(p.id);detail.close();},'action');content.append(addButton);
  }
  function setLanguage(){
    document.documentElement.lang=language;document.documentElement.dir=language==='ar'?'rtl':'ltr';
    document.querySelectorAll('[data-en][data-ar]').forEach(el=>{el.textContent=el.dataset[language];});
    const toggle=document.querySelector('.demo-language');toggle.textContent=language==='ar'?'EN':'عربي';toggle.setAttribute('aria-label',tr('Read in Arabic','Read in English'));
    document.querySelector('.skip').textContent=tr('Skip to content','تخطّي إلى المحتوى');
    document.querySelector('.product-filters').setAttribute('aria-label',tr('Product categories','فئات المنتجات'));
    document.querySelectorAll('[data-detail]').forEach(el=>{el.setAttribute('aria-label',tr('View ','عرض ')+name(products.get(el.dataset.detail)));});
    document.querySelectorAll('.dialog-close').forEach(el=>el.setAttribute('aria-label',tr('Close dialog','إغلاق النافذة')));
    document.querySelectorAll('a[href^="/projects/"]').forEach(el=>{el.href=(language==='ar'?'/ar':'')+'/projects/'+brand.slug+'/';});
    document.title=(language==='ar'?brand.arName:brand.name)+' | '+tr(brand.kind,brand.arKind);
    feedback.textContent='';if(basket.open)renderBasket();if(detail.open)renderProduct();
  }
  document.querySelector('.demo-language').addEventListener('click',()=>{language=language==='ar'?'en':'ar';const url=new URL(location.href);language==='ar'?url.searchParams.set('lang','ar'):url.searchParams.delete('lang');history.replaceState(null,'',url);setLanguage();});
  document.querySelectorAll('[data-filter]').forEach(btn=>btn.addEventListener('click',()=>{
    document.querySelectorAll('[data-filter]').forEach(other=>other.setAttribute('aria-pressed',String(other===btn)));
    document.querySelectorAll('.product-card').forEach(card=>{card.hidden=btn.dataset.filter!=='all'&&card.dataset.category!==btn.dataset.filter;});
  }));
  document.querySelectorAll('[data-add]').forEach(btn=>btn.addEventListener('click',()=>add(btn.dataset.add)));
  document.querySelectorAll('[data-detail]').forEach(btn=>btn.addEventListener('click',()=>{selected=btn.dataset.detail;renderProduct();detail.showModal();}));
  document.querySelector('.basket-open').addEventListener('click',()=>{renderBasket();document.querySelector('#order-review').hidden=true;basket.showModal();});
  document.querySelector('#review-order').addEventListener('click',()=>{document.querySelector('#order-review').hidden=false;});
  for(const dialog of [basket,detail]){
    dialog.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());
    dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
  }
  setLanguage();
})();
