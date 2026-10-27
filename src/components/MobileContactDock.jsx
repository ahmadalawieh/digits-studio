import {useEffect, useState} from 'react';
import {motion} from 'framer-motion';
import {EDITORIAL_SPRING} from '../motion-system.js';
import {useMotionPreference} from '../use-motion-preference.js';

export function MobileContactDock({ar=false}) {
  const [visible,setVisible]=useState(false),reduced=useMotionPreference();
  useEffect(()=>{
    const hero=document.querySelector('.launch-hero'),contact=document.querySelector('#contact');
    const footer=document.querySelector('.footer'),menu=document.querySelector('#mobile-menu');
    const mobile=matchMedia('(max-width:750px)');let frame;
    const measure=()=>{
      const editing=document.activeElement?.matches('input,textarea,select,[contenteditable="true"]');
      setVisible(mobile.matches&&hero.getBoundingClientRect().bottom<=0&&contact.getBoundingClientRect().top>innerHeight&&footer.getBoundingClientRect().top>innerHeight&&menu.hidden&&!editing);
    };
    const defer=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(measure);};
    const observer=new IntersectionObserver(measure);
    for(const element of [hero,contact,footer])observer.observe(element);
    const menuObserver=new MutationObserver(measure);menuObserver.observe(menu,{attributes:true,attributeFilter:['hidden']});
    mobile.addEventListener('change',measure);window.addEventListener('resize',defer,{passive:true});
    document.addEventListener('focusin',defer);document.addEventListener('focusout',defer);measure();
    return()=>{observer.disconnect();menuObserver.disconnect();mobile.removeEventListener('change',measure);window.removeEventListener('resize',defer);document.removeEventListener('focusin',defer);document.removeEventListener('focusout',defer);cancelAnimationFrame(frame);};
  },[]);
  return <motion.aside className="mobile-contact-dock" aria-label={ar?'تواصل مع الاستوديو':'Contact the studio'}
    aria-hidden={!visible} inert={!visible} initial={false}
    animate={{y:visible?0:'140%',opacity:visible?1:0}}
    transition={reduced?{duration:0}:EDITORIAL_SPRING}>
    <a className="dock-project" href="#contact">{ar?'ابدأ مشروعك':'Start a project'} <span aria-hidden="true">↗</span></a>
    <a className="dock-whatsapp" href="https://wa.me/96170332361" target="_blank" rel="noopener noreferrer">WhatsApp <span aria-hidden="true">↗</span></a>
  </motion.aside>;
}
