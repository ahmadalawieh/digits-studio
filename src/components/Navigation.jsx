import {useEffect, useRef} from 'react';
import {animate, motion} from 'framer-motion';
import {EDITORIAL_SPRING} from '../motion-system.js';
import {useMotionPreference} from '../use-motion-preference.js';

function NavLink({children, href, reduced}) {
  return <motion.a href={href} className="navigation-link" initial={false}
    whileHover={reduced ? undefined : {y: -2}} whileTap={reduced ? undefined : {y: 0}}
    transition={EDITORIAL_SPRING}>{children}</motion.a>;
}

export function Navigation({ar = false}) {
  const scope = useRef(null), reduced = useMotionPreference();
  const t = (en, arabic) => ar ? arabic : en;
  const links = [
    ['#work', t('Projects', 'المشاريع')],
    ['#services', t('Services', 'الخدمات')],
    ['#studio', t('The studio', 'الاستوديو')],
  ];
  useEffect(() => {
    const menu = scope.current.querySelector('#mobile-menu');
    let menuArrival;
    // Native menu actions remain authoritative, including Escape and link close.
    const observer = new MutationObserver(() => {
      menuArrival?.stop();
      if (!menu.hidden && !reduced) menuArrival = animate(menu, {y: [-10, 0], opacity: [0, 1]}, EDITORIAL_SPRING);
    });
    observer.observe(menu, {attributes: true, attributeFilter: ['hidden']});
    return () => {
      observer.disconnect(); menuArrival?.stop();
      animate(menu, {y: 0, opacity: 1}, {duration: 0});
    };
  }, [reduced]);

  return <div className="navigation-inner" ref={scope}>
    <a className="brand" href={ar ? '../' : './'} aria-label={`Digits Studio ${t('home', 'الرئيسية')}`}>
      <img src={`${ar ? '../' : ''}brand/logo-white.svg`} alt="Digits Studio" width="184" height="56" fetchPriority="low"/>
    </a>
    <nav className="desktop-nav" aria-label={t('Main navigation', 'التنقل الرئيسي')}>
      {links.map(([href, label]) => <NavLink key={href} href={href} reduced={reduced}>{label}</NavLink>)}
    </nav>
    <div className="header-actions">
      <a className="language navigation-link" href={ar ? '../' : 'ar/'} lang={t('ar', 'en')} aria-label={t('Read in Arabic', 'Read in English')}>{t('عربي', 'EN')}</a>
      <motion.a className="button small" href="#contact" initial={false}
        whileHover={reduced ? undefined : {y: -2}} whileTap={reduced ? undefined : {scale: .97}}
        transition={EDITORIAL_SPRING}>{t('Start a project', 'ابدأ مشروعك')}</motion.a>
      <button className="menu-button" aria-expanded="false" aria-controls="mobile-menu">{t('Menu', 'القائمة')} <span aria-hidden="true">+</span></button>
    </div>
    <nav id="mobile-menu" className="mobile-menu" aria-label={t('Mobile navigation', 'التنقل على الهاتف')} hidden>
      {links.map(([href, label]) => <a key={href} href={href}>{label}</a>)}
      <a href="#contact">{t('Start a project', 'ابدأ مشروعك')}</a>
    </nav>
  </div>;
}
