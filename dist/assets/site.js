(() => {
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
    const dialog=document.getElementById(button.dataset.open);
    button.addEventListener('click',()=>dialog.showModal());
    dialog.querySelector('[data-close]').addEventListener('click',()=>dialog.close());
    dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
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
