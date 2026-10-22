(() => {
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const menuButton = document.querySelector('.menu-button');
  const menu = document.querySelector('#mobile-menu');
  const closeMenu = () => { if (menu && menuButton) {menu.hidden = true; menuButton.setAttribute('aria-expanded','false');} };
  menuButton?.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') !== 'true';
    menuButton.setAttribute('aria-expanded', String(open)); menu.hidden = !open;
  });
  menu?.querySelectorAll('a').forEach(link => link.addEventListener('click',closeMenu));
  document.addEventListener('keydown',event=>{if(event.key==='Escape') closeMenu();});
  document.querySelectorAll('[data-open]').forEach(button=>{
    button.addEventListener('click',()=>{
      const dialog=document.getElementById(button.dataset.open);
      if(dialog&&!dialog.open)dialog.showModal();
    });
  });
  document.querySelectorAll('dialog').forEach(dialog=>{
    dialog.querySelector('[data-close]').addEventListener('click',()=>dialog.close());
    dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
  });
  const heroPreview=document.querySelector('.hero-preview');
  const previewImage=heroPreview?.querySelector('.preview-image');
  const previewPicks=[...document.querySelectorAll('[data-preview]')];
  const previewContext=document.querySelector('.preview-context');
  const defaultPreviewContext=previewContext?.textContent;
  let previewRequest=0;
  previewPicks.forEach(pick=>pick.addEventListener('click',async()=>{
    if(!heroPreview||!previewImage||pick.getAttribute('aria-pressed')==='true')return;
    const request=++previewRequest;
    previewPicks.forEach(item=>item.setAttribute('aria-pressed',String(item===pick)));
    const ar=document.documentElement.lang==='ar';
    heroPreview.disabled=true;heroPreview.setAttribute('aria-busy','true');
    try{
      const nextImage=new Image();nextImage.src=pick.dataset.image;await nextImage.decode();
      if(request!==previewRequest)return;
      heroPreview.dataset.open='project-'+pick.dataset.preview;
      heroPreview.setAttribute('aria-label',(ar?'عرض المشروع: ':'View project: ')+pick.dataset.name);
      heroPreview.querySelector('.preview-name').textContent=pick.dataset.name;
      previewImage.src=pick.dataset.image;
      previewImage.alt=pick.dataset.name+(ar?' معاينة الموقع':' website preview');
      previewContext.textContent=defaultPreviewContext;
      previewImage.getAnimations().forEach(animation=>animation.cancel());
      if(!reducedMotion.matches)previewImage.animate([{opacity:.25,transform:'translateY(6px)'},{opacity:1,transform:'none'}],{duration:270,easing:'ease-out'});
    }catch{
      if(request!==previewRequest)return;
      previewPicks.forEach(item=>item.setAttribute('aria-pressed',String('project-'+item.dataset.preview===heroPreview.dataset.open)));
      previewContext.textContent=ar?'تعذّر تحميل المعاينة. يمكنك استكشاف المشاريع أدناه.':'This preview could not load. Explore the projects below.';
    }finally{
      if(request===previewRequest){heroPreview.disabled=false;heroPreview.removeAttribute('aria-busy');}
    }
  }));
  // Native details retains semantics and keyboard activation; animate only its content.
  const detailAnimations=new Map();
  document.querySelectorAll('.service').forEach(detail=>{
    const summary=detail.querySelector('summary');
    const content=detail.querySelector('.service-content');
    summary.addEventListener('click',event=>{
      if(reducedMotion.matches||!content.animate)return;
      event.preventDefault();
      const opening=detail.dataset.transition?detail.dataset.transition==='closing':!detail.open;
      const from=detail.open?content.getBoundingClientRect().height:0;
      detailAnimations.get(detail)?.cancel();
      detail.open=true;
      detail.dataset.transition=opening?'opening':'closing';
      const to=opening?content.scrollHeight:0;
      content.style.overflow='hidden';
      const animation=content.animate([{height:from+'px',opacity:opening?.35:1},{height:to+'px',opacity:opening?1:0}],{duration:300,easing:'cubic-bezier(.2,.65,.2,1)'});
      detailAnimations.set(detail,animation);
      animation.onfinish=()=>{
        detail.open=opening;delete detail.dataset.transition;content.style.overflow='';detailAnimations.delete(detail);
      };
    });
  });
  reducedMotion.addEventListener('change',()=>{
    if(!reducedMotion.matches)return;
    detailAnimations.forEach((animation,detail)=>{
      animation.cancel();detail.open=detail.dataset.transition==='opening';delete detail.dataset.transition;
      detail.querySelector('.service-content').style.overflow='';
    });
    detailAnimations.clear();
    previewImage?.getAnimations().forEach(animation=>animation.cancel());
  });
  const form=document.getElementById('inquiry-form');
  form?.querySelectorAll('input[required],textarea[required]').forEach(input=>{
    input.addEventListener('input',()=>input.setCustomValidity(''));
  });
  form?.addEventListener('submit',event=>{
    event.preventDefault();
    form.querySelectorAll('input[required],textarea[required]').forEach(input=>{
      input.setCustomValidity(input.value.trim()?'':document.documentElement.lang==='ar'?'يرجى إكمال هذا الحقل.':'Please complete this field.');
    });
    if(!form.reportValidity())return;
    const d=new FormData(form);const ar=document.documentElement.lang==='ar';
    const message=ar
      ? `مرحباً أحمد، أود مناقشة مشروع مع ديجيتس ستوديو.\n\nالاسم: ${d.get('name').trim()}\nالبريد: ${d.get('email').trim()}\nالشركة: ${d.get('business').trim()||'لم يُحدد'}\nالخدمات: ${d.getAll('service').join('، ')||'نحددها معاً'}\n\n${d.get('message').trim()}`
      : `Hi Ahmad, I'd like to discuss a project with Digits Studio.\n\nName: ${d.get('name').trim()}\nEmail: ${d.get('email').trim()}\nBusiness: ${d.get('business').trim()||'Not specified'}\nServices: ${d.getAll('service').join(', ')||'Let’s define it together'}\n\n${d.get('message').trim()}`;
    document.getElementById('inquiry-preview').textContent=message;
    document.getElementById('inquiry-whatsapp').href='https://wa.me/96170332361?text='+encodeURIComponent(message);
    document.getElementById('inquiry-email').href='mailto:ahmad.alawieh77@gmail.com?subject='+encodeURIComponent('Digits Studio / Project inquiry')+'&body='+encodeURIComponent(message);
    const result=document.getElementById('inquiry-result');result.hidden=false;result.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'nearest'});
  });
})();
