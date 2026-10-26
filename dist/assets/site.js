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
  const reel=document.querySelector('.studio-reel');
  if(reel){
    const ar=document.documentElement.lang==='ar',prefix=ar?'/ar':'',items=[['fornaya','Fornaya'],['riwa-grove','Riwa Grove'],['dar-saha','Dar Saha'],['paceform','Paceform']];let index=0,request=0,timer=null,playing=!reducedMotion.matches;
    const img=reel.querySelector('.reel-image'),link=reel.querySelector('.reel-link'),toggle=reel.querySelector('.reel-toggle');
    async function show(next){const token=++request;const n=(next+items.length)%items.length;const [slug,name]=items[n];const candidate=new Image();candidate.src='/assets/concepts/'+slug+'/project-cover.webp';try{await candidate.decode();if(token!==request)return;index=n;img.src=candidate.src;img.alt=name+(ar?' / الهوية وتطبيقاتها':' / identity and applications');link.href=prefix+'/projects/'+slug+'/';reel.querySelector('.reel-name').textContent=name;if(!reducedMotion.matches)img.animate([{opacity:.25,transform:'scale(1.025)'},{opacity:1,transform:'scale(1)'}],{duration:450,easing:'ease-out'});}catch{playing=false;sync();}}
    function sync(){clearInterval(timer);timer=null;toggle.setAttribute('aria-pressed',String(playing));toggle.textContent=ar?(playing?'إيقاف':'تشغيل'):(playing?'Pause':'Play');if(playing&&!document.hidden)timer=setInterval(()=>show(index+1),6500);}
    reel.querySelector('.reel-prev').addEventListener('click',()=>{playing=false;sync();show(index-1);});reel.querySelector('.reel-next').addEventListener('click',()=>{playing=false;sync();show(index+1);});toggle.addEventListener('click',()=>{playing=!playing;sync();});document.addEventListener('visibilitychange',sync);reducedMotion.addEventListener('change',()=>{if(reducedMotion.matches){playing=false;sync();}});reel.addEventListener('focusin',event=>{if(event.target===toggle)return;playing=false;sync();});sync();
  }
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

  });
  const projectCards=[...document.querySelectorAll('[data-project-card]')];
  document.querySelectorAll('[data-project-filter]').forEach(button=>button.addEventListener('click',()=>{
    const before=new Map(projectCards.filter(c=>!c.hidden).map(c=>[c,c.getBoundingClientRect()]));
    const category=button.dataset.projectFilter,ar=document.documentElement.lang==='ar';let count=0;
    document.querySelectorAll('[data-project-filter]').forEach(other=>other.setAttribute('aria-pressed',String(other===button)));
    projectCards.forEach(card=>{
      const visible=category==='all'||card.dataset.services.split(' ').includes(category);card.hidden=!visible;if(!visible)return;count++;
      const route=card.querySelector('.project-route');if(!route)return;
      const image=route.querySelector('[data-project-image]'),src=route.getAttribute('data-image-'+category),href=route.getAttribute('data-href-'+category);
      route.href=href;card.querySelector('.project-detail-route').href=href;
      image.src=src;image.alt=card.querySelector('h3').textContent+' / '+(ar?{all:'معاينة المشروع',branding:'الهوية',website:'الموقع',marketing:'الحملة'}:{all:'project preview',branding:'brand identity',website:'website',marketing:'campaign'})[category];
      card.dataset.preview=category;
    });
    if(!reducedMotion.matches)projectCards.filter(c=>!c.hidden).forEach(card=>{const prior=before.get(card),now=card.getBoundingClientRect();card.animate(prior?[{transform:`translate(${prior.x-now.x}px,${prior.y-now.y}px)`,opacity:.6},{transform:'none',opacity:1}]:[{opacity:.25},{opacity:1}],{duration:280,easing:'ease-out'});});
    document.querySelector('#project-filter-status').textContent=ar?`عرض ${count} من المشاريع — ${{all:'كل المشاريع',branding:'الهوية',website:'المواقع',marketing:'التسويق'}[category]}`:`Showing ${count} projects — ${{all:'all projects',branding:'branding',website:'websites',marketing:'marketing'}[category]}.`;
  }));
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
