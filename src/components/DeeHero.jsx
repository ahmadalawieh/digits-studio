import {useLayoutEffect} from 'react';
import {motion, useAnimationControls} from 'framer-motion';
import {EDITORIAL_SPRING} from '../motion-system.js';
import {useMotionPreference} from '../use-motion-preference.js';

export function DeeHero() {
  const controls=useAnimationControls(),reduced=useMotionPreference();
  useLayoutEffect(()=>{
    const hero=document.querySelector('.launch-hero'),cta=hero?.querySelector('.impact-cta');
    if(!hero||!cta)return;
    let arrived=false,active=true;
    const still=()=>controls.set({x:0,y:0,rotate:0,opacity:1});
    if(reduced||matchMedia('(prefers-reduced-motion: reduce)').matches){still();return;}
    controls.set({x:-14,y:12,rotate:-7,opacity:0});
    const arrive=()=>{
      if(arrived||hero.dataset.motionState!=='ready')return;
      arrived=true;
      controls.start({x:0,y:0,rotate:0,opacity:1,transition:EDITORIAL_SPRING});
    };
    const observer=new MutationObserver(arrive);
    observer.observe(hero,{attributes:true,attributeFilter:['data-motion-state']});arrive();
    const acknowledge=()=>{if(active&&arrived)controls.start({y:-4,rotate:4,transition:EDITORIAL_SPRING});};
    const settle=()=>{if(active&&arrived)controls.start({y:0,rotate:0,transition:EDITORIAL_SPRING});};
    cta.addEventListener('pointerenter',acknowledge);cta.addEventListener('pointerleave',settle);
    cta.addEventListener('focus',acknowledge);cta.addEventListener('blur',settle);
    return()=>{active=false;observer.disconnect();controls.stop();cta.removeEventListener('pointerenter',acknowledge);cta.removeEventListener('pointerleave',settle);cta.removeEventListener('focus',acknowledge);cta.removeEventListener('blur',settle);};
  },[controls,reduced]);
  return <motion.span className="hero-dee" aria-hidden="true" initial={false} animate={controls}>
    <img src="/assets/dee/dee-pointing.webp" alt="" width="640" height="800" decoding="async" fetchPriority="low"/>
  </motion.span>;
}
