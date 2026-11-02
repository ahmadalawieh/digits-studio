'use client';

import {useEffect,useRef,useState} from 'react';
import {AnimatePresence,LayoutGroup,motion,useReducedMotion} from 'framer-motion';
import {categories,items,labels} from './menu-data';

function SearchIcon(){return <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" strokeWidth="1.7"/><path d="m15.5 15.5 4.5 4.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>}
function Arrow({rtl}){return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{transform:rtl?'none':'rotate(180deg)'}}><path d="m13 5 7 7-7 7M20 12H4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>}
const money = n => '$'+(Number.isInteger(n)?n:n.toFixed(2));

export default function Menu(){
 const [lang,setLang]=useState('ar'),[category,setCategory]=useState('all'),[query,setQuery]=useState(''),[selected,setSelected]=useState(null);
 const lastFocus=useRef(null),back=useRef(null),reduced=useReducedMotion();
 const t=labels[lang],rtl=lang==='ar',spring=reduced?{duration:0}:{type:'spring',stiffness:420,damping:40};
 const close=()=>{setSelected(null);requestAnimationFrame(()=>lastFocus.current?.focus());};
 const visible=items.filter(item=>(category==='all'||item.category===category)&&(`${item.ar.name} ${item.en.name} ${item.ar.short} ${item.en.short}`).toLowerCase().includes(query.trim().toLowerCase()));
 useEffect(()=>{document.documentElement.lang=lang;document.documentElement.dir=rtl?'rtl':'ltr';},[lang,rtl]);
 useEffect(()=>{
  if(!selected)return;
  back.current?.focus();const old=document.body.style.overflow;document.body.style.overflow='hidden';
  const key=e=>{if(e.key==='Escape')close();if(e.key==='Tab'){e.preventDefault();back.current?.focus();}};
  document.addEventListener('keydown',key);return()=>{document.body.style.overflow=old;document.removeEventListener('keydown',key);};
 },[selected]);
 return <LayoutGroup><div className="menu-app" inert={selected?true:undefined}>
  <header className="menu-header flex items-center justify-between"><span className="demo-badge">{t.demo}</span><strong>{t.title}</strong><button className="language" onClick={()=>setLang(rtl?'en':'ar')} aria-label={rtl?'Switch to English':'التبديل إلى العربية'}>{rtl?'EN':'عربي'}</button></header>
  <section className="menu-intro"><h1>{t.hello}</h1><p>{t.lead}</p></section>
  <div className="search-wrap"><SearchIcon/><input aria-label={t.search} value={query} onChange={e=>setQuery(e.target.value)} placeholder={t.search}/>{query&&<button aria-label={t.clear} onClick={()=>setQuery('')}>×</button>}</div>
  <nav aria-label={t.section} className="category-nav flex">{categories.map(cat=><button key={cat.id} aria-pressed={category===cat.id} onClick={()=>setCategory(cat.id)}>{category===cat.id&&<motion.span className="category-active" layoutId="menu-category" transition={spring}/>}<span className="category-text">{cat[lang]}</span></button>)}</nav>
  <main className="menu-content">
   {visible.length?<motion.div className="food-grid grid grid-cols-2 gap-x-4 gap-y-6" layout transition={spring}>{visible.map(item=><motion.button layout="position" transition={spring} key={item.id} className="food-card text-start" onClick={e=>{lastFocus.current=e.currentTarget;setSelected(item);}} aria-label={`${t.details}: ${item[lang].name}`}>
    <div className={`food-image ${item.contain?'contain':''}`}><img src={`/menu-demo/assets/${item.image}`} alt={item[lang].name} width="700" height="700" style={{objectPosition:item.position}}/></div>
    <h2>{item[lang].name}</h2><p>{item[lang].short}</p><div className="card-bottom"><bdi className="price" aria-label={`${t.price} ${money(item.price)}`}>{money(item.price)}</bdi><span className="detail-cue" aria-hidden="true">{t.details}</span></div>
   </motion.button>)}</motion.div>:<div className="empty-state"><p>{t.empty}</p><button onClick={()=>{setQuery('');setCategory('all');}}>{t.reset}</button></div>}
  </main>
  <footer><span>{t.footer}</span><span>{t.currency}</span></footer>
 </div>
 <AnimatePresence>{selected&&<motion.div className="detail-overlay" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:reduced?0:.15}} onClick={e=>{if(e.target===e.currentTarget)close();}}>
  <motion.section className="item-detail" role="dialog" aria-modal="true" aria-labelledby="item-title" initial={{y:reduced?0:18}} animate={{y:0}} exit={{y:reduced?0:18}} transition={{duration:reduced?0:.2,ease:'easeOut'}}>
   <header className="detail-header"><button ref={back} onClick={close}><Arrow rtl={rtl}/><span>{t.back}</span></button><span className="demo-badge">{t.demo}</span></header>
   <div className={`detail-image ${selected.contain?'contain':''}`}><img src={`/menu-demo/assets/${selected.image}`} alt={selected[lang].name} width="1000" height="750" style={{objectPosition:selected.position}}/></div>
   <div className="detail-copy"><div className="detail-title"><div><span className="item-category">{categories.find(c=>c.id===selected.category)[lang]}</span><h1 id="item-title">{selected[lang].name}</h1></div><bdi className="detail-price">{money(selected.price)}</bdi></div>
    <p className="item-description">{selected[lang].description}</p>
    <section className="ingredients"><h2>{t.ingredients}</h2><p>{selected[lang].ingredients}</p></section>
    <section className="allergy-info"><h2>{t.allergy}</h2><p>{selected[lang].note}</p><p>{t.allergyNote}</p></section>
    <p className="detail-demo-note">{t.detailNote}</p>
   </div>
  </motion.section>
 </motion.div>}</AnimatePresence></LayoutGroup>;
}
