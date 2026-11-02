import {useEffect,useLayoutEffect,useRef,useState} from 'react';
import {animate,motion,useAnimationControls,useAnimationFrame,useMotionValueEvent,useScroll,useSpring,useTransform} from 'framer-motion';
import {useMotionPreference} from '../use-motion-preference.js';
import {EDITORIAL_SPRING} from '../motion-system.js';

const COPY={
 en:{chapters:['The studio','Branding','Websites','Marketing'],titles:[['Make','your mark.'],['A world.','Entirely yours.'],['Built to','move people.'],['Good work.','Worth seeing.']],descriptions:['Branding, websites and marketing. One connected idea, brought to life.','A recognisable identity. From the first impression to every little detail.','A clear story becomes a digital experience people can use.','Give your business a consistent presence, wherever people find you.'],explore:'Meet the idea',contact:'Start a project',work:'Explore the work',scroll:'Scroll to build the story',place:'Beirut & worldwide',story:'Our connected approach',pause:'Pause DEE',play:'Animate DEE'},
 ar:{chapters:['الاستوديو','الهوية','المواقع','التسويق'],titles:[['اترك','بصمتك.'],['عالم خاص.','يشبهك.'],['موقع.','يترك أثراً.'],['عمل مميّز.','يستحق الظهور.']],descriptions:['هوية ومواقع وتسويق. فكرة واحدة متكاملة، تنبض بالحياة.','هوية يتذكّرها الناس، من الانطباع الأول حتى أصغر التفاصيل.','تتحوّل القصة الواضحة إلى تجربة رقمية يسهل استخدامها.','حضور متناسق لشركتك، أينما يجدك الناس.'],explore:'اكتشف الفكرة',contact:'ابدأ مشروعك',work:'استكشف الأعمال',scroll:'انزل لتكتشف القصة',place:'من بيروت إلى العالم',story:'فكرة واحدة متكاملة',pause:'أوقف حركة DEE',play:'حرّك DEE'}
};

function ThreeStage({progress,onMode,active,paused}){
 const host=useRef(null),engine=useRef(null),rendered=useRef(false),pauseClock=useRef({last:0,elapsed:0});
 const pointerX=useSpring(0,EDITORIAL_SPRING),pointerY=useSpring(0,EDITORIAL_SPRING);
 const aimX=useSpring(.25,EDITORIAL_SPRING),aimY=useSpring(.35,EDITORIAL_SPRING);
 useEffect(()=>{
  const stage=host.current.closest('.stage'),chapter=stage.querySelector(`.chapter-${active}`),heading=chapter.querySelector('.journey-heading');let live=true;
  const measure=()=>{
   if(!live)return;const range=document.createRange();range.selectNodeContents(heading);const bounds=range.getBoundingClientRect();
   aimX.set((bounds.left+bounds.width/2)/innerWidth);aimY.set((chapter.offsetTop+heading.offsetTop+heading.offsetHeight*.52)/innerHeight);
   const bottom=Math.max(...[...stage.querySelectorAll('.chapter')].map(section=>section.offsetTop+section.offsetHeight));
   stage.style.setProperty('--dee-top',`${Math.ceil(Math.max(innerHeight*.45,bottom+14))}px`);
  };
  measure();document.fonts.ready.then(measure);const observer=new ResizeObserver(measure);observer.observe(chapter);observer.observe(heading);
  window.addEventListener('resize',measure,{passive:true});return()=>{live=false;observer.disconnect();window.removeEventListener('resize',measure);};
 },[active,aimX,aimY]);
 useEffect(()=>{
  let live=true,scheduled=false,timer,idle;onMode('loading');rendered.current=false;
  const load=()=>{
   if(!live)return;
   // A separate renderer module keeps Three.js out of the initial UI download.
   const url='/assets/dee-scene.js';
   import(url).then(({createScene})=>{
    if(!live)return;
    try{engine.current=createScene(host.current,{onContextLost:()=>{engine.current?.dispose();engine.current=null;if(live)onMode('fallback');}});}
    catch{host.current?.replaceChildren();onMode('fallback');}
   }).catch(()=>{if(live)onMode('fallback');});
  };
  const observer=new IntersectionObserver(entries=>{
   if(!entries.some(entry=>entry.isIntersecting)||scheduled)return;scheduled=true;
   timer=setTimeout(()=>{if('requestIdleCallback'in window)idle=requestIdleCallback(load,{timeout:1000});else load();},120);
  },{rootMargin:'200px'});observer.observe(host.current);
  const move=event=>{pointerX.set((event.clientX/innerWidth-.5)*2);pointerY.set((event.clientY/innerHeight-.5)*2);};
  if(matchMedia('(hover:hover) and (pointer:fine)').matches)window.addEventListener('pointermove',move,{passive:true});
  return()=>{live=false;observer.disconnect();clearTimeout(timer);if(idle!==undefined)cancelIdleCallback(idle);window.removeEventListener('pointermove',move);engine.current?.dispose();engine.current=null;};
 },[onMode,pointerX,pointerY]);
 useAnimationFrame((time,delta)=>{
  pauseClock.current.last=time;if(!paused)pauseClock.current.elapsed+=Math.min(delta,80);
  const scene=engine.current;if(!scene)return;
  if(scene.frame(progress.get(),{x:pointerX.get(),y:pointerY.get()},pauseClock.current.elapsed,{x:aimX.get(),y:aimY.get()},time)&&!rendered.current){rendered.current=true;onMode('webgl');}
 });
 return <div className="three-layer" ref={host} aria-hidden="true"/>;
}

function Poster({index=0,first=false}){
 return <picture className="journey-poster"><source media="(max-width:750px) and (orientation:portrait)" srcSet="/assets/dee/hero-up.webp"/><img src={`/assets/dee/hero-${index%2?'left':'right'}.webp`} width="800" height="900" alt="" loading={first?'eager':'lazy'} fetchPriority={first?'high':'low'} decoding="async"/></picture>;
}

function Artifacts({index,ar,progress,active}){
 const c=index/3,opacity=useTransform(progress,p=>Math.max(0,1-Math.abs(p-c)/.19));
 const y=useTransform(progress,p=>(c-p)*480),rotateY=useTransform(progress,p=>(p-c)*75),rotateX=useTransform(progress,p=>8+(c-p)*45);
 if(index===0)return null;
 return <motion.div className={`artifact artifact-${index}`} aria-hidden="true" style={{opacity,y,rotateY,rotateX}}>
  {index===1?<div className="identity-world"><div className="identity-swatch"><img src="/brand/symbol-black.svg" alt=""/><span>#FFDA46</span></div><div className="identity-card"><img src="/brand/logo-white.svg" alt=""/><span>Make your mark.</span><small>digitsstudio.online</small></div><div className="identity-stamp"><img src="/brand/symbol-white.svg" alt=""/></div></div>:index===2?<div className="site-world"><div className="window-head"><span/><span/><span/><b>{ar?'Fornaya / تصوّر من الاستوديو':'Fornaya / studio concept'}</b></div>{active>=1&&<><img className="website-capture" src="/assets/concepts/fornaya/website-desktop.webp" alt="" loading="lazy" decoding="async"/><div className="phone-frame"><img src="/assets/concepts/fornaya/website-mobile.webp" alt="" loading="lazy" decoding="async"/></div></>}</div>:<div className="campaign-world"><div className="campaign-print"><img src="/brand/symbol-black.svg" alt=""/><strong>{ar?'كل بداية،\nتستحق بصمة.':'Your next\nchapter.'}</strong><small>Digits Studio</small></div><div className="campaign-dark"><img src="/brand/logo-white.svg" alt=""/><strong>{ar?'صمّم\nما هو آتٍ.':'Make\nwhat’s next.'}</strong><span>Branding / Websites / Marketing</span></div></div>}
 </motion.div>;
}

function Chapter({index,copy,progress,active,jump,enhanced,onOpeningComplete}){
 const c=index/3,opacity=useTransform(progress,p=>Math.max(0,1-Math.abs(p-c)/.175)),y=useTransform(progress,p=>(c-p)*340);
 const controls=useAnimationControls(),Title=index===0?'h1':'h2';
 useLayoutEffect(()=>{
  let live=true;
  if(!enhanced||index!==0){controls.set({y:'0%'});return;}
  controls.set({y:'112%'});controls.start(line=>({y:'0%',transition:{...EDITORIAL_SPRING,delay:.12+line*.14}})).then(()=>{if(live)onOpeningComplete(true);});
  return()=>{live=false;controls.stop();};
 },[enhanced,index,controls,onOpeningComplete]);
 return <motion.section className={`chapter chapter-${index}`} aria-labelledby={`journey-title-${index}`} aria-hidden={enhanced&&active!==index?true:undefined} inert={enhanced&&active!==index?true:undefined} style={enhanced?{opacity,y}:{opacity:1,y:0}}>
  <div className="chapter-copy"><p className="chapter-kicker">{index===0?copy.place:copy.chapters[index]}</p>
   <Title id={`journey-title-${index}`} className="journey-heading">{copy.titles[index].map((line,i)=><span className="journey-title-line" key={line}><span className="journey-title-mask"><motion.span className="impact-word" initial={false} animate={controls} custom={i}>{line}</motion.span></span>{i===0?' ':null}</span>)}</Title>
   <p className="chapter-description">{copy.descriptions[index]}</p>
   {(index===0||index===3)&&<div className="journey-actions"><a className={`primary-link ${index===0?'impact-cta':''}`} href="#contact">{copy.contact}<span aria-hidden="true">↗</span></a>{index===0&&enhanced?<button className="story-link" onClick={()=>jump(1)}>{copy.explore}<span aria-hidden="true">↓</span></button>:<a className="story-link" href="#work">{copy.work}<span aria-hidden="true">↓</span></a>}</div>}
  </div>
  <div className="journey-static-visual" aria-hidden="true"><Poster index={index} first={index===0}/></div>
 </motion.section>;
}

export function DeeJourney({ar=false}){
 const [ready,setReady]=useState(false),[active,setActive]=useState(0),[mode,setMode]=useState('loading'),[openingDone,setOpeningDone]=useState(false),[paused,setPaused]=useState(false);
 const reduced=useMotionPreference(),enhanced=ready&&!reduced&&mode!=='fallback',root=useRef(null),activeRef=useRef(0),navigation=useRef(null),copy=COPY[ar?'ar':'en'];
 const {scrollYProgress}=useScroll({target:root,offset:['start start','end end']}),progress=useSpring(scrollYProgress,EDITORIAL_SPRING);
 const bg=useTransform(progress,[0,.17,.29,.7,.84,1],['#06070B','#06070B','#FDFDFD','#FDFDFD','#06070B','#06070B']);
 const foreground=useTransform(progress,[0,.17,.29,.7,.84,1],['#FDFDFD','#FDFDFD','#0E1015','#0E1015','#FDFDFD','#FDFDFD']);
 useEffect(()=>{setReady(true);},[]);
 useMotionValueEvent(progress,'change',value=>{const next=Math.max(0,Math.min(3,Math.round(value*3)));if(next!==activeRef.current){activeRef.current=next;setActive(next);}});
 useEffect(()=>{
  const stop=()=>navigation.current?.stop();
  const followLink=event=>{if(event.target instanceof Element&&event.target.closest('a[href^="#"]'))stop();};
  window.addEventListener('wheel',stop,{passive:true});window.addEventListener('touchstart',stop,{passive:true});document.addEventListener('click',followLink,true);
  return()=>{stop();window.removeEventListener('wheel',stop);window.removeEventListener('touchstart',stop);document.removeEventListener('click',followLink,true);};
 },[]);
 const jump=index=>{const destination=root.current.getBoundingClientRect().top+scrollY+(root.current.offsetHeight-innerHeight)*index/3;navigation.current?.stop();navigation.current=animate(scrollY,destination,{...EDITORIAL_SPRING,onUpdate:value=>scrollTo({top:value,behavior:'instant'})});};
 return <motion.section className={`hero launch-hero dee-journey ${enhanced?'is-enhanced':'is-static'}`} aria-label={copy.story} style={enhanced?{backgroundColor:bg,color:foreground}:undefined} data-scene={active} data-motion-engine="framer" data-motion-state={enhanced?(openingDone?'ready':'opening'):reduced?'reduced':'fallback'} data-render-mode={enhanced?mode:mode==='fallback'?'fallback':'static'}>
  <div className="journey" ref={root}><div className="stage">
   {enhanced&&<div className="stage-art" aria-hidden="true">{mode!=='webgl'&&<div className={`journey-model-fallback fallback-${active%2?'left':'right'}`}><Poster index={active}/></div>}<ThreeStage progress={progress} onMode={setMode} active={active} paused={paused}/>{copy.chapters.map((_,index)=><Artifacts key={index} index={index} ar={ar} progress={progress} active={active}/>)}</div>}
   <div className="chapter-stack">{copy.chapters.map((_,index)=><Chapter key={index} index={index} copy={copy} progress={progress} active={active} jump={jump} enhanced={enhanced} onOpeningComplete={setOpeningDone}/>)}</div>
   {enhanced&&<><nav className="chapter-navigation" aria-label={copy.story}>{copy.chapters.map((label,index)=><button key={index} type="button" aria-label={`${index+1}. ${label}`} aria-current={active===index?'step':undefined} onClick={()=>jump(index)}><span className="chapter-number">{String(index+1).padStart(2,'0')}</span><span className="chapter-name">{label}</span>{active===index&&<motion.span className="chapter-track" layoutId="dee-story-track" transition={EDITORIAL_SPRING}/>}</button>)}</nav><div className="stage-bottom"><p>{active===0?copy.scroll:copy.chapters[active]}</p><div className="journey-utilities">{mode==='webgl'&&<button type="button" className="dee-pause" aria-pressed={paused} onClick={()=>setPaused(value=>!value)}>{paused?copy.play:copy.pause}</button>}<a href="#work">{copy.work}<span aria-hidden="true">↓</span></a></div></div><div className="scroll-track" aria-hidden="true"><motion.div style={{scaleX:progress}}/></div></>}
  </div></div>
 </motion.section>;
}
