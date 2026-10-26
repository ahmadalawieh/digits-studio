(() => {
  'use strict';
  const hero=document.querySelector('.launch-hero'),gsap=window.gsap;
  if(!hero)return;
  if(!gsap){hero.dataset.motionState='fallback';return;}
  if(window.ScrollTrigger)gsap.registerPlugin(window.ScrollTrigger);
  const media=gsap.matchMedia();
  media.add({always:'all',motion:'(prefers-reduced-motion: no-preference)',fine:'(hover: hover) and (pointer: fine)',desktop:'(min-width: 751px)'},context=>{
    const {motion,fine,desktop}=context.conditions;
    if(!motion){hero.dataset.motionState='reduced';return;}
    hero.dataset.motionState='opening';
    const entrance=gsap.timeline({defaults:{ease:'power4.out'},onComplete:()=>{hero.dataset.motionState='ready';}});
    entrance.from('.opening-rule',{scaleX:0,duration:.55,ease:'power2.inOut'},0)
      .from('.impact-meta',{y:-12,opacity:0,duration:.6},.1)
      .from('.impact-word',{yPercent:125,rotation:3,skewY:4,duration:1.05,stagger:.13},.12)
      .from('.reel-back-one',{xPercent:80,yPercent:30,rotation:38,opacity:0,duration:1.1},.2)
      .from('.reel-back-two',{xPercent:100,yPercent:25,rotation:48,opacity:0,duration:1.1},.3)
      .from('.impact-stack>.reel-link',{xPercent:120,yPercent:35,rotation:45,opacity:0,scale:.88,duration:1.1},.4)
      .from('.impact-footer',{y:25,opacity:0,duration:.7},.85)
      .from('.impact-reel .reel-caption',{y:15,opacity:0,duration:.6},1.05);
    let move,leave,ctaMove,ctaLeave;
    const stack=hero.querySelector('.impact-stack'),cta=hero.querySelector('.impact-cta');
    if(fine){
      const x=gsap.quickTo(stack,'x',{duration:.6,ease:'power3.out'}),y=gsap.quickTo(stack,'y',{duration:.6,ease:'power3.out'}),rx=gsap.quickTo(stack,'rotationX',{duration:.6,ease:'power3.out'}),ry=gsap.quickTo(stack,'rotationY',{duration:.6,ease:'power3.out'});
      move=event=>{if(hero.dataset.motionState!=='ready')return;const r=hero.getBoundingClientRect(),dx=(event.clientX-r.left)/r.width-.5,dy=(event.clientY-r.top)/r.height-.5;x(dx*24);y(dy*16);rx(-dy*5);ry(dx*7);};
      leave=()=>{x(0);y(0);rx(0);ry(0);};hero.addEventListener('pointermove',move);hero.addEventListener('pointerleave',leave);
      ctaMove=event=>{const r=cta.getBoundingClientRect();gsap.to(cta,{x:(event.clientX-r.left-r.width/2)*.11,y:(event.clientY-r.top-r.height/2)*.15,duration:.25,ease:'power2.out',overwrite:true});};
      ctaLeave=()=>gsap.to(cta,{x:0,y:0,duration:.45,ease:'elastic.out(1,.5)',overwrite:true});cta.addEventListener('pointermove',ctaMove);cta.addEventListener('pointerleave',ctaLeave);
    }
    if(desktop&&window.ScrollTrigger){
      gsap.to('.impact-first',{xPercent:document.documentElement.dir==='rtl'?4:-4,ease:'none',scrollTrigger:{trigger:hero,start:'top top',end:'bottom top',scrub:1}});
      gsap.to('.impact-reel',{y:-50,rotation:-3,ease:'none',scrollTrigger:{trigger:hero,start:'top top',end:'bottom top',scrub:1}});
    }
    return()=>{hero.dataset.motionState='ready';gsap.killTweensOf(cta);gsap.set(cta,{clearProps:'transform'});if(move){hero.removeEventListener('pointermove',move);hero.removeEventListener('pointerleave',leave);cta.removeEventListener('pointermove',ctaMove);cta.removeEventListener('pointerleave',ctaLeave);}};
  });
})();
